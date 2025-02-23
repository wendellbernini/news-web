'use client';

import { useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useNews } from '@/hooks/useNews';
import { NewsCard } from '@/components/news/NewsCard';
import { useReadingList } from '@/hooks/useReadingList';
import { Loader2 } from 'lucide-react';
import { RootLayout } from '@/components/layout/RootLayout';
import { News } from '@/types';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { news: results, loading, searchNews } = useNews();
  const { toggleSaveNews } = useReadingList();

  // Efeito de busca memorizado
  const searchEffect = useCallback(() => {
    console.log('[Debug] SearchPage - Iniciando efeito de busca');
    const timeoutId = setTimeout(() => {
      searchNews(query);
    }, 300);

    return () => {
      console.log('[Debug] SearchPage - Limpando timeout anterior');
      clearTimeout(timeoutId);
    };
  }, [query, searchNews]);

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
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      const url = `${window.location.origin}/noticias/${news.slug}`;
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <>
      <h1 className="mb-8 text-2xl font-bold">
        {query ? `Resultados para "${query}"` : 'Todas as notícias'}
      </h1>

      <div className="grid gap-4 sm:grid-cols-2">
        {loading && (
          <div className="col-span-full flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        )}

        {!loading && results.length === 0 && query && (
          <p className="col-span-full text-center text-secondary-500">
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
