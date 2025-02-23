'use client';

import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { News, Category } from '@/types';
import { NewsCard } from './NewsCard';
import { useNews } from '@/hooks/useNews';
import { useReadingList } from '@/hooks/useReadingList';
import { Button } from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';

export function CategoryNews({ category }: { category: Category }) {
  const { news, fetchNews, fetchMoreNews, hasMore, loading } = useNews();
  const { toggleSaveNews } = useReadingList();
  const { ref, inView } = useInView();

  useEffect(() => {
    fetchNews(category);
  }, [category, fetchNews]);

  useEffect(() => {
    if (inView && hasMore) {
      fetchMoreNews(category);
    }
  }, [inView, hasMore, category, fetchMoreNews]);

  const handleShare = async (news: News) => {
    if (!navigator.share) {
      navigator.clipboard.writeText(
        `${window.location.origin}/noticias/${news.slug}`
      );
      return;
    }

    try {
      await navigator.share({
        title: news.title,
        text: news.summary,
        url: `${window.location.origin}/noticias/${news.slug}`,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  if (loading && !news.length) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Button variant="ghost" disabled>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Carregando notícias...
        </Button>
      </div>
    );
  }

  if (!news.length) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-lg text-secondary-600">Nenhuma notícia encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {news.map((item) => (
          <div
            key={item.id}
            className="transition-opacity duration-200 hover:opacity-95"
          >
            <NewsCard
              news={item}
              onShare={handleShare}
              onToggleSave={toggleSaveNews}
            />
          </div>
        ))}
      </div>
      {hasMore && (
        <div ref={ref} className="flex justify-center pt-4">
          <Button variant="ghost" disabled={loading}>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando mais...
          </Button>
        </div>
      )}
    </div>
  );
}
