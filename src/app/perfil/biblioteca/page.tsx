'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NewsCard } from '@/components/news/NewsCard';
import { useReadingList } from '@/hooks/useReadingList';
import useStore from '@/store/useStore';
import { Loader2 } from 'lucide-react';

export default function LibraryPage() {
  const router = useRouter();
  const { user } = useStore();
  const { loading, savedNews, readHistory, toggleSaveNews } = useReadingList();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">Minha Biblioteca</h1>

        {/* Notícias Salvas */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Notícias Salvas</h2>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : savedNews.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {savedNews.map((news) => (
                <NewsCard
                  key={news.id}
                  news={news}
                  onLike={() => toggleSaveNews(news.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-secondary-600 dark:text-secondary-400">
              Você ainda não salvou nenhuma notícia.
            </p>
          )}
        </section>

        {/* Histórico de Leitura */}
        <section>
          <h2 className="mb-6 text-2xl font-semibold">Histórico de Leitura</h2>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : readHistory.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {readHistory.map((news) => (
                <NewsCard
                  key={news.id}
                  news={news}
                  onLike={() => toggleSaveNews(news.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-secondary-600 dark:text-secondary-400">
              Seu histórico de leitura está vazio.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
