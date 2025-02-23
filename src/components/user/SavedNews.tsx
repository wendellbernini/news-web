'use client';

import { useState, useEffect } from 'react';
import { NewsCard } from '@/components/news/NewsCard';
import { Loader2 } from 'lucide-react';
import { News } from '@/types';
import { db } from '@/lib/firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import useStore from '@/store/useStore';

interface SavedNewsProps {
  onToggleSave: (newsId: string) => Promise<void>;
}

export function SavedNews({ onToggleSave }: SavedNewsProps) {
  const user = useStore((state) => state.user);
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
        const uniqueNewsIds = new Set(
          savedNewsSnapshot.docs.map((doc) => doc.data().newsId)
        );
        const newsIds = Array.from(uniqueNewsIds);

        if (newsIds.length === 0) {
          setSavedNews([]);
          setLoading(false);
          return;
        }

        const newsPromises = newsIds.map(async (newsId) => {
          try {
            const newsRef = collection(db, 'news');
            const newsQuery = query(newsRef, where('__name__', '==', newsId));
            const newsSnapshot = await getDocs(newsQuery);

            if (!newsSnapshot.empty) {
              const doc = newsSnapshot.docs[0];
              const data = doc.data();

              const createdAt =
                data.createdAt instanceof Timestamp
                  ? data.createdAt.toDate()
                  : new Date(data.createdAt);

              const updatedAt =
                data.updatedAt instanceof Timestamp
                  ? data.updatedAt.toDate()
                  : new Date(data.updatedAt);

              return {
                id: doc.id,
                ...data,
                createdAt,
                updatedAt,
              } as News;
            }
            return null;
          } catch (error) {
            console.error(`Erro ao buscar notícia ${newsId}:`, error);
            return null;
          }
        });

        const newsResults = await Promise.all(newsPromises);
        const newsData = newsResults.filter(
          (news): news is News => news !== null
        );

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
              key={`${news.id}-${news.createdAt.getTime()}`}
              news={news}
              onShare={() => handleShare(news.id)}
              onToggleSave={onToggleSave}
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
