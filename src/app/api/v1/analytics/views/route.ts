import { NextResponse } from 'next/server';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { rateLimit } from '@/lib/rate-limit';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    // Validar API Key
    const apiKey = request.headers.get('x-api-key');
    const isValidKey = await validateApiKey(apiKey);

    if (!isValidKey) {
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
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    // Construir query base para histórico de leitura
    let readHistoryQuery = query(collection(db, 'readHistory'));

    // Adicionar filtros de data se fornecidos
    if (startDate && endDate) {
      readHistoryQuery = query(
        readHistoryQuery,
        where('readAt', '>=', new Date(startDate)),
        where('readAt', '<=', new Date(endDate))
      );
    }

    // Buscar dados
    const snapshot = await getDocs(readHistoryQuery);

    // Agregar dados por notícia
    const viewsByNews = new Map<
      string,
      {
        newsId: string;
        newsTitle: string;
        views: number;
        uniqueUsers: Set<string>;
      }
    >();

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const newsId = data.newsId;

      if (!viewsByNews.has(newsId)) {
        viewsByNews.set(newsId, {
          newsId,
          newsTitle: data.newsTitle,
          views: 0,
          uniqueUsers: new Set(),
        });
      }

      const newsStats = viewsByNews.get(newsId)!;
      newsStats.views++;
      newsStats.uniqueUsers.add(data.userId);
    });

    // Converter para array e formatar resposta
    const analytics = Array.from(viewsByNews.values()).map((stats) => ({
      newsId: stats.newsId,
      newsTitle: stats.newsTitle,
      totalViews: stats.views,
      uniqueUsers: stats.uniqueUsers.size,
    }));

    // Ordenar por mais visualizações
    analytics.sort((a, b) => b.totalViews - a.totalViews);

    return NextResponse.json({
      data: analytics,
      totalViews: analytics.reduce((sum, item) => sum + item.totalViews, 0),
      totalUniqueUsers: new Set(snapshot.docs.map((doc) => doc.data().userId))
        .size,
      period: {
        start: startDate || 'all',
        end: endDate || 'all',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar análise de visualizações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
