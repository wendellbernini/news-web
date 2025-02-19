'use client';

import { useState, useEffect } from 'react';
import { NewsCard } from '@/components/news/NewsCard';
import { Loader2 } from 'lucide-react';
import { News } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface SavedNewsProps {
  onToggleSave: (newsId: string) => Promise<void>;
  onCheckSaved: (newsId: string) => Promise<boolean>;
}

export function SavedNews({ onToggleSave, onCheckSaved }: SavedNewsProps) {
  const { user } = useAuth();
  const [savedNews, setSavedNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedNews = async () => {
      if (!user) {
        setSavedNews([]);
        setLoading(false);
        return;
      }

      try {
        const savedNewsQuery = query(
          collection(db, 'savedNews'),
          where('userId', '==', user.id),
          where('status', '==', 'active')
        );

        const savedNewsSnapshot = await getDocs(savedNewsQuery);
        const newsIds = savedNewsSnapshot.docs.map((doc) => doc.data().newsId);

        if (newsIds.length === 0) {
          setSavedNews([]);
          setLoading(false);
          return;
        }

        const newsQuery = query(
          collection(db, 'news'),
          where('id', 'in', newsIds)
        );

        const newsSnapshot = await getDocs(newsQuery);
        const newsData = newsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as News[];

        setSavedNews(newsData);
      } catch (error) {
        console.error('Erro ao carregar notícias salvas:', error);
        toast.error('Erro ao carregar notícias salvas');
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchSavedNews();
  }, [user]);

  const handleShare = async (newsId: string) => {
    try {
      const news = savedNews.find((n) => n.id === newsId);
      if (!news) return;

      if (navigator.share) {
        await navigator.share({
          title: news.title,
          text: news.summary,
          url: `${window.location.origin}/noticias/${news.slug}`,
        });
      } else {
        const url = `${window.location.origin}/noticias/${news.slug}`;
        await navigator.clipboard.writeText(url);
        toast.success('Link copiado para a área de transferência!');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Erro ao compartilhar:', error);
        toast.error('Erro ao compartilhar');
      }
    }
  };

  return (
    <section>
      <h2 className="mb-6 text-2xl font-semibold">Notícias Salvas</h2>
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
        </div>
      ) : savedNews.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {savedNews.map((news) => (
            <NewsCard
              key={news.id}
              news={news}
              onShare={() => handleShare(news.id)}
              onToggleSave={onToggleSave}
              onCheckSaved={onCheckSaved}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-secondary-600 dark:text-secondary-400">
          Você ainda não salvou nenhuma notícia.
        </p>
      )}
    </section>
  );
}
