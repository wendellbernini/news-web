'use client';

import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { NewsCard } from './NewsCard';
import { useNews } from '@/hooks/useNews';
import { Category, News } from '@/types';
import { Button } from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';

interface CategoryNewsProps {
  category: Category;
}

export function CategoryNews({ category }: CategoryNewsProps) {
  const { news, fetchNews, fetchMoreNews, hasMore } = useNews();
  const { ref, inView } = useInView();

  useEffect(() => {
    fetchNews(category);
  }, [category]);

  useEffect(() => {
    if (inView && hasMore) {
      fetchMoreNews(category);
    }
  }, [inView, hasMore, category]);

  const handleLike = (newsId: string) => {
    // Implementar a funcionalidade de curtir
    console.log('Curtir notícia:', newsId);
  };

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
      // Fallback para copiar o link
      const url = `${window.location.origin}/noticias/${news.slug}`;
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {news.map((item: News) => (
          <NewsCard
            key={item.id}
            news={item}
            onLike={handleLike}
            onShare={handleShare}
          />
        ))}
      </div>

      {hasMore && (
        <div ref={ref} className="mt-8 flex items-center justify-center">
          <Button variant="ghost" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando mais notícias...
          </Button>
        </div>
      )}

      {!hasMore && news.length > 0 && (
        <p className="mt-8 text-center text-sm text-secondary-600 dark:text-secondary-400">
          Não há mais notícias para carregar.
        </p>
      )}

      {news.length === 0 && (
        <div className="flex h-96 items-center justify-center">
          <p className="text-center text-sm text-secondary-600 dark:text-secondary-400">
            Nenhuma notícia encontrada nesta categoria.
          </p>
        </div>
      )}
    </div>
  );
}
