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

    // Construir query base para notícias
    let newsQuery = query(collection(db, 'news'));

    // Adicionar filtros de data se fornecidos
    if (startDate && endDate) {
      newsQuery = query(
        newsQuery,
        where('createdAt', '>=', new Date(startDate)),
        where('createdAt', '<=', new Date(endDate))
      );
    }

    // Buscar dados
    const snapshot = await getDocs(newsQuery);

    // Agregar dados por categoria
    const categoryStats = new Map<
      string,
      {
        category: string;
        totalNews: number;
        totalViews: number;
        averageViews: number;
        latestNews: Date;
      }
    >();

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const category = data.category;
      const views = data.views || 0;
      const createdAt = data.createdAt?.toDate() || new Date();

      if (!categoryStats.has(category)) {
        categoryStats.set(category, {
          category,
          totalNews: 0,
          totalViews: 0,
          averageViews: 0,
          latestNews: createdAt,
        });
      }

      const stats = categoryStats.get(category)!;
      stats.totalNews++;
      stats.totalViews += views;
      stats.averageViews = stats.totalViews / stats.totalNews;

      if (createdAt > stats.latestNews) {
        stats.latestNews = createdAt;
      }
    });

    // Converter para array e formatar resposta
    const analytics = Array.from(categoryStats.values()).map((stats) => ({
      ...stats,
      latestNews: stats.latestNews.toISOString(),
      averageViews: Math.round(stats.averageViews * 100) / 100,
    }));

    // Ordenar por mais notícias
    analytics.sort((a, b) => b.totalNews - a.totalNews);

    return NextResponse.json({
      data: analytics,
      totalCategories: analytics.length,
      totalNews: analytics.reduce((sum, item) => sum + item.totalNews, 0),
      totalViews: analytics.reduce((sum, item) => sum + item.totalViews, 0),
      period: {
        start: startDate || 'all',
        end: endDate || 'all',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar análise de categorias:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
