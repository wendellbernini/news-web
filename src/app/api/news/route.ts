import { NextResponse } from 'next/server';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { slugify } from '@/lib/utils';

// Chave de API para autenticação do n8n
const API_KEY = process.env.NEWS_API_KEY;

// Configuração de CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
};

// Handler para requisições OPTIONS (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET() {
  try {
    const newsQuery = query(
      collection(db, 'news'),
      where('published', '==', true)
    );

    const snapshot = await getDocs(newsQuery);
    const news = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(news, { headers: corsHeaders });
  } catch (error) {
    console.error('Erro ao buscar notícias:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar notícias' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Endpoint para criar notícias via API (n8n)
export async function POST(request: Request) {
  // Log para debug
  console.log('Recebendo requisição POST:', {
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
  });

  // Se for uma requisição OPTIONS, retorna sucesso
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Verifica a chave de API
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== API_KEY) {
      console.log('Chave API inválida:', apiKey);
      return NextResponse.json(
        { error: 'Chave de API inválida ou não fornecida' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Obtém os dados da notícia do corpo da requisição
    const newsDataArray = await request.json();
    console.log('Dados recebidos:', newsDataArray);

    // Verifica se é um array
    if (!Array.isArray(newsDataArray)) {
      return NextResponse.json(
        { error: 'O corpo da requisição deve ser um array de notícias' },
        { status: 400, headers: corsHeaders }
      );
    }

    const createdNews = [];

    // Processa cada notícia do array
    for (const newsData of newsDataArray) {
      // Validação básica dos campos obrigatórios
      if (!newsData.titulo || !newsData.conteudo || !newsData.categoria) {
        console.error('Notícia com campos obrigatórios faltando:', newsData);
        continue; // Pula para a próxima notícia
      }

      // Validação da URL da imagem
      if (newsData.imagem && !newsData.imagem.includes('res.cloudinary.com')) {
        console.error(
          'URL de imagem inválida (deve ser do Cloudinary):',
          newsData.imagem
        );
        continue; // Pula para a próxima notícia
      }

      // Prepara os dados da notícia no formato correto
      const news = {
        title: newsData.titulo,
        content: newsData.conteudo,
        summary: newsData.resumo || newsData.conteudo.substring(0, 200) + '...',
        category:
          newsData.categoria.charAt(0).toUpperCase() +
          newsData.categoria.slice(1),
        imageUrl: newsData.imagem,
        slug: slugify(newsData.titulo),
        published: newsData.publicado ?? true,
        author: {
          id: 'system',
          name: 'Redação Rio de Fato',
          photoURL: '/images/redacao-avatar.svg',
        },
        createdAt: newsData.data_publicacao
          ? new Date(newsData.data_publicacao)
          : new Date(),
        updatedAt: new Date(),
        views: 0,
        comments: 0,
      };

      try {
        // Verifica se já existe uma notícia com o mesmo título/slug
        const existingNewsQuery = query(
          collection(db, 'news'),
          where('slug', '==', news.slug)
        );
        const existingNews = await getDocs(existingNewsQuery);

        if (!existingNews.empty) {
          console.log(`Notícia já existe: ${news.title}`);
          continue; // Pula para a próxima notícia
        }

        // Salva a notícia no Firestore
        const docRef = await addDoc(collection(db, 'news'), news);
        createdNews.push({
          id: docRef.id,
          ...news,
        });
      } catch (error) {
        console.error('Erro ao criar notícia individual:', error);
        // Continua para a próxima notícia mesmo se houver erro
      }
    }

    // Retorna as notícias criadas
    return NextResponse.json(
      {
        message: `${createdNews.length} notícia(s) criada(s) com sucesso`,
        news: createdNews,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Erro ao processar notícias:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar notícias' },
      { status: 500, headers: corsHeaders }
    );
  }
}
