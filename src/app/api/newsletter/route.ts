import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import sgMail from '@sendgrid/mail';
import { getNewsletterTemplate } from '@/lib/email/templates';

// Configuração do SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// Tipos
type NewsletterFrequency = 'daily' | 'weekly' | 'monthly';

interface NewsletterUser {
  id: string;
  email: string;
  name: string;
  newsletter: {
    subscribed: boolean;
    frequency: NewsletterFrequency;
    categories: string[];
  };
}

// Constantes
const DAILY_EMAIL_LIMIT = 100; // Limite diário do SendGrid
const BATCH_SIZE = 50; // Quantidade de emails por lote

// Função para formatar data em português
const formatDatePtBR = (date: Date): string => {
  const dias = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ];
  const meses = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  return `${dias[date.getDay()]}, ${date.getDate()} de ${meses[date.getMonth()]}`;
};

// Função auxiliar para buscar notícias por categoria
const getNewsByCategories = async (categories: string[], since: Date) => {
  const newsRef = collection(db, 'news');
  const q = query(
    newsRef,
    where('category', 'in', categories),
    where('createdAt', '>=', since)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Função para verificar quantos emails já foram enviados hoje
async function getEmailsSentToday() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const statsRef = doc(db, 'stats', 'newsletter');
    const statsDoc = await getDoc(statsRef);

    if (!statsDoc.exists()) {
      return 0;
    }

    const data = statsDoc.data();
    const lastReset = data.lastReset?.toDate() || new Date(0);

    // Se o último reset foi antes de hoje, retorna 0
    if (lastReset < today) {
      return 0;
    }

    return data.emailsSentToday || 0;
  } catch (error) {
    console.error('Erro ao verificar emails enviados:', error);
    return 0;
  }
}

// Função para atualizar contador de emails
async function updateEmailsSentCount(count: number) {
  try {
    const statsRef = doc(db, 'stats', 'newsletter');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await updateDoc(statsRef, {
      emailsSentToday: count,
      lastReset: Timestamp.fromDate(today),
      lastUpdated: Timestamp.fromDate(new Date()),
    });
  } catch (error) {
    console.error('Erro ao atualizar contador:', error);
  }
}

// POST - Envia newsletter manualmente ou automaticamente
export async function POST(request: Request) {
  try {
    // Verifica autorização
    const authorization = request.headers.get('Authorization');
    if (authorization !== `Bearer ${process.env.NEWSLETTER_SECRET_KEY}`) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verifica se o envio automático está ativado
    const configRef = doc(db, 'config', 'newsletter');
    const configDoc = await getDoc(configRef);
    const config = configDoc.data();

    if (!config?.enabled) {
      console.log('Envio automático está desativado');
      return NextResponse.json({
        success: false,
        message: 'Envio automático está desativado',
      });
    }

    // Verifica limite diário
    const emailsSentToday = await getEmailsSentToday();
    const remainingEmails = DAILY_EMAIL_LIMIT - emailsSentToday;

    if (remainingEmails <= 0) {
      console.log('Limite diário de emails atingido');
      await updateDoc(configRef, {
        lastSentStatus: {
          success: false,
          error: 'Limite diário de emails atingido',
          timestamp: new Date(),
        },
      });
      return NextResponse.json({
        success: false,
        message: 'Limite diário de emails atingido',
      });
    }

    // Busca usuários inscritos
    const usersRef = collection(db, 'users');
    const subscribedQuery = query(
      usersRef,
      where('newsletter.subscribed', '==', true)
    );
    const snapshot = await getDocs(subscribedQuery);
    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as NewsletterUser[];

    console.log(`Total de usuários inscritos: ${users.length}`);
    console.log(`Emails disponíveis hoje: ${remainingEmails}`);

    // Determina quantos usuários serão processados
    const usersToProcess = users.slice(0, remainingEmails);
    console.log(`Processando ${usersToProcess.length} usuários`);

    // Processa em lotes
    const results = [];
    let emailsSent = 0;

    for (let i = 0; i < usersToProcess.length; i += BATCH_SIZE) {
      const batch = usersToProcess.slice(i, i + BATCH_SIZE);

      for (const user of batch) {
        try {
          const since = new Date();
          since.setDate(
            since.getDate() -
              (user.newsletter.frequency === 'daily'
                ? 1
                : user.newsletter.frequency === 'weekly'
                  ? 7
                  : 30)
          );

          console.log(
            `Buscando notícias para ${user.email} desde ${since.toISOString()}`
          );
          const news = await getNewsByCategories(
            user.newsletter.categories,
            since
          );
          console.log(`Encontradas ${news.length} notícias`);

          if (news.length > 0) {
            await sgMail.send({
              to: user.email,
              from: {
                email:
                  process.env.SENDGRID_FROM_EMAIL ||
                  'noticias@riodefato.com.br',
                name: 'Rio de Fato',
              },
              subject: `Seu resumo de notícias ${formatDatePtBR(new Date())}`,
              html: getNewsletterTemplate({
                userName: user.name,
                news,
                baseUrl: process.env.NEXT_PUBLIC_APP_URL || '',
              }),
            });
          }

          emailsSent++;
          results.push({
            email: user.email,
            status: 'success',
            newsCount: news.length,
          });
        } catch (error) {
          console.error(`Erro ao enviar para ${user.email}:`, error);
          results.push({
            email: user.email,
            status: 'error',
            error: error instanceof Error ? error.message : 'Erro desconhecido',
          });
        }
      }

      // Atualiza contador após cada lote
      await updateEmailsSentCount(emailsSentToday + emailsSent);
    }

    // Atualiza status do último envio
    await updateDoc(configRef, {
      lastSentAt: new Date(),
      lastSentStatus: {
        success: true,
        processedCount: emailsSent,
        remainingUsers: users.length - emailsSent,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      processed: emailsSent,
      remaining: users.length - emailsSent,
      results,
    });
  } catch (error) {
    console.error('Erro ao processar newsletters:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar newsletters' },
      { status: 500 }
    );
  }
}
