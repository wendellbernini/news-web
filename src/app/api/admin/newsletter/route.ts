import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import sgMail from '@sendgrid/mail';
import { getNewsletterTemplate } from '@/lib/email/templates';

// Configuração do SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// Tipos
type NewsletterFrequency = 'daily' | 'weekly' | 'monthly';

interface NewsletterStats {
  totalSubscribed: number;
  byFrequency: {
    [K in NewsletterFrequency]: number;
  };
}

// Função para verificar se o usuário é admin
async function isAdmin(userId: string) {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() && userDoc.data()?.role === 'admin';
}

// GET - Retorna status do sistema de newsletter
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Busca estatísticas
    const usersRef = collection(db, 'users');
    const subscribedQuery = query(
      usersRef,
      where('newsletter.subscribed', '==', true)
    );
    const subscribedSnapshot = await getDocs(subscribedQuery);

    const stats: NewsletterStats = {
      totalSubscribed: subscribedSnapshot.size,
      byFrequency: {
        daily: 0,
        weekly: 0,
        monthly: 0,
      },
    };

    subscribedSnapshot.forEach((doc) => {
      const frequency = doc.data().newsletter?.frequency as NewsletterFrequency;
      if (frequency && frequency in stats.byFrequency) {
        stats.byFrequency[frequency]++;
      }
    });

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('Erro ao buscar status:', error);
    return NextResponse.json(
      { error: 'Erro interno ao buscar status' },
      { status: 500 }
    );
  }
}

// POST - Envia newsletter manualmente
export async function POST(request: Request) {
  try {
    const { userId, newsIds, userEmails } = await request.json();
    console.log('[Debug] Dados recebidos:', { userId, newsIds, userEmails });

    if (!userId || !(await isAdmin(userId))) {
      console.log('[Debug] Usuário não autorizado:', userId);
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    console.log('[Debug] Usuário autorizado como admin');

    // Busca as notícias selecionadas
    const newsRef = collection(db, 'news');
    const news = [];
    for (const id of newsIds) {
      console.log('[Debug] Buscando notícia:', id);
      const newsDoc = await getDoc(doc(newsRef, id));
      if (newsDoc.exists()) {
        const newsData = newsDoc.data();
        console.log('[Debug] Notícia encontrada:', newsData);
        // Garante que temos o slug da notícia
        if (!newsData.slug) {
          // Se não tiver slug, gera um a partir do título
          newsData.slug = newsData.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
          // Atualiza a notícia com o novo slug
          await updateDoc(doc(newsRef, id), { slug: newsData.slug });
        }
        news.push({ id, ...newsData });
      } else {
        console.log('[Debug] Notícia não encontrada:', id);
      }
    }

    if (!news.length) {
      console.log('[Debug] Nenhuma notícia encontrada');
      return NextResponse.json(
        { error: 'Nenhuma notícia encontrada' },
        { status: 400 }
      );
    }
    console.log('[Debug] Total de notícias encontradas:', news.length);

    // Busca os usuários
    const usersRef = collection(db, 'users');
    const users = [];
    for (const email of userEmails) {
      console.log('[Debug] Buscando usuário com email:', email);
      const userQuery = query(usersRef, where('email', '==', email));
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        console.log('[Debug] Usuário encontrado:', userSnapshot.docs[0].data());
        users.push(userSnapshot.docs[0].data());
      } else {
        console.log('[Debug] Usuário não encontrado:', email);
      }
    }
    console.log('[Debug] Total de usuários encontrados:', users.length);

    // Envia os emails
    const results = [];
    for (const user of users) {
      try {
        console.log('[Debug] Enviando email para:', user.email);
        await sgMail.send({
          to: user.email,
          from: {
            email:
              process.env.SENDGRID_FROM_EMAIL || 'noticias@riodefato.com.br',
            name: 'Rio de Fato',
          },
          subject: `Notícias especiais do Rio de Fato`,
          html: getNewsletterTemplate({
            userName: user.name,
            news,
            baseUrl: process.env.NEXT_PUBLIC_APP_URL || '',
          }),
        });
        console.log('[Debug] Email enviado com sucesso para:', user.email);

        results.push({
          email: user.email,
          status: 'success',
        });
      } catch (error) {
        console.error(`[Debug] Erro ao enviar para ${user.email}:`, error);
        results.push({
          email: user.email,
          status: 'error',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error('Erro ao enviar newsletter:', error);
    return NextResponse.json(
      { error: 'Erro interno ao enviar newsletter' },
      { status: 500 }
    );
  }
}

// PATCH - Atualiza configurações do sistema
export async function PATCH(request: Request) {
  try {
    const { userId, enabled = true } = await request.json();

    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Atualiza configuração global
    const configRef = doc(db, 'config', 'newsletter');
    await updateDoc(configRef, {
      enabled,
      updatedAt: new Date(),
      updatedBy: userId,
    });

    return NextResponse.json({
      success: true,
      config: { enabled },
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    return NextResponse.json(
      { error: 'Erro interno ao atualizar configurações' },
      { status: 500 }
    );
  }
}
