'use client';

import { useEffect } from 'react';
import { NewsCard } from './NewsCard';
import { useNews } from '@/hooks/useNews';
import { useReadingList } from '@/hooks/useReadingList';
import useStore from '@/store/useStore';
import { News } from '@/types';

export function NewsFeed() {
  const { news, selectedCategory } = useStore();
  const { fetchNews } = useNews();
  const { toggleSaveNews } = useReadingList();

  useEffect(() => {
    fetchNews(selectedCategory || undefined);
  }, [selectedCategory, fetchNews]);

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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-6">
          {news.slice(0, 2).map((item) => (
            <NewsCard
              key={item.id}
              news={item}
              onShare={handleShare}
              onToggleSave={toggleSaveNews}
              variant="default"
            />
          ))}
        </div>
        <div className="space-y-5">
          {news.slice(2, 5).map((item) => (
            <NewsCard
              key={item.id}
              news={item}
              onShare={handleShare}
              onToggleSave={toggleSaveNews}
              variant="minimal"
            />
          ))}
        </div>
      </div>

      {news.length === 0 && (
        <div className="flex h-48 items-center justify-center">
          <p className="text-center text-sm text-secondary-600 dark:text-secondary-400">
            Nenhuma notícia encontrada.
          </p>
        </div>
      )}
    </div>
  );
}
