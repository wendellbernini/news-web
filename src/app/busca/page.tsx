'use client';

import { useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useNews } from '@/hooks/useNews';
import { NewsCard } from '@/components/news/NewsCard';
import { useReadingList } from '@/hooks/useReadingList';
import { Loader2 } from 'lucide-react';
import { RootLayout } from '@/components/layout/RootLayout';
import { News } from '@/types';
import { useFacebookPixel } from '@/hooks/useFacebookPixel';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { news: results, loading, searchNews } = useNews();
  const { toggleSaveNews } = useReadingList();
  const { trackEvent } = useFacebookPixel();

  // Efeito de busca memorizado
  const searchEffect = useCallback(() => {
    console.log('[Debug] SearchPage - Iniciando efeito de busca');
    const timeoutId = setTimeout(() => {
      searchNews(query);

      // Rastrear evento de busca no Facebook Pixel
      if (query.trim()) {
        trackEvent('Search', {
          search_string: query,
          content_category: 'search',
        });
      }
    }, 300);

    return () => {
      console.log('[Debug] SearchPage - Limpando timeout anterior');
      clearTimeout(timeoutId);
    };
  }, [query, searchNews, trackEvent]);

  useEffect(() => {
    return searchEffect();
  }, [searchEffect]);

  const handleShare = async (news: News) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: news.title,
          text: news.summary,
          url: `${window.location.origin}/noticias/${news.slug}`,
        });

        // Rastrear evento de compartilhamento no Facebook Pixel
        trackEvent('Share', {
          content_name: news.title,
          content_category: news.category,
          content_ids: [news.id],
          content_type: 'article',
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      const url = `${window.location.origin}/noticias/${news.slug}`;
      navigator.clipboard.writeText(url);

      // Rastrear evento de cópia de link no Facebook Pixel
      trackEvent('Share', {
        content_name: news.title,
        content_category: news.category,
        content_ids: [news.id],
        content_type: 'article',
        method: 'copy_link',
      });
    }
  };

  return (
    <>
      <h1 className="mb-8 text-2xl font-bold">
        {query ? `Resultados para "${query}"` : 'Todas as notícias'}
      </h1>

      <div className="flex flex-col gap-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        )}

        {!loading && results.length === 0 && query && (
          <p className="text-center text-secondary-500">
            Nenhuma notícia encontrada para "{query}"
          </p>
        )}

        {!loading &&
          results.map((news) => (
            <NewsCard
              key={news.id}
              news={news}
              onShare={handleShare}
              onToggleSave={toggleSaveNews}
              variant="compact"
            />
          ))}
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <RootLayout>
      <main className="container py-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          }
        >
          <SearchResults />
        </Suspense>
      </main>
    </RootLayout>
  );
}
