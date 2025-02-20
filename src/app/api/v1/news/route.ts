import { NextResponse } from 'next/server';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { rateLimit } from '@/lib/rate-limit';
import { validateApiKey } from '@/lib/api-auth';

const ITEMS_PER_PAGE = 50; // Limite maior para Power BI

export async function GET(request: Request) {
  try {
    // Validar API Key
    const apiKey = request.headers.get('x-api-key');
    console.log('[API Route] Recebida API key:', apiKey);

    const isValidKey = await validateApiKey(apiKey);
    console.log('[API Route] Resultado da validação:', isValidKey);

    if (!isValidKey) {
      console.log('[API Route] API key inválida, retornando erro 401');
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    // Rate Limiting
    const limiter = await rateLimit(request);
    if (!limiter.success) {
      return NextResponse.json(
        { error: 'Muitas requisições. Tente novamente mais tarde.' },
        { status: 429 }
      );
    }

    // Parâmetros da query
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const category = url.searchParams.get('category');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    // Construir query base
    let newsQuery = query(
      collection(db, 'news'),
      orderBy('createdAt', 'desc'),
      limit(ITEMS_PER_PAGE)
    );

    // Adicionar filtros
    if (category) {
      newsQuery = query(newsQuery, where('category', '==', category));
    }

    if (startDate && endDate) {
      newsQuery = query(
        newsQuery,
        where('createdAt', '>=', new Date(startDate)),
        where('createdAt', '<=', new Date(endDate))
      );
    }

    // Buscar dados
    const snapshot = await getDocs(newsQuery);

    // Formatar resposta
    const news = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    }));

    // Retornar resposta paginada
    return NextResponse.json({
      data: news,
      page,
      totalItems: snapshot.size,
      itemsPerPage: ITEMS_PER_PAGE,
    });
  } catch (error) {
    console.error('Erro ao buscar notícias:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
