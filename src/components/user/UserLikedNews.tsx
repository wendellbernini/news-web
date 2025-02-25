'use client';

import { useState, useEffect } from 'react';
import { NewsCard } from '@/components/news/NewsCard';
import { Loader2 } from 'lucide-react';
import { News } from '@/types';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

export function UserLikedNews() {
  const { user } = useAuth();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedNews = async () => {
      if (!user) {
        setNews([]);
        setLoading(false);
        return;
      }

      try {
        // Busca apenas as 10 últimas notícias curtidas
        const userDoc = await getDoc(doc(db, 'users', user.id));
        if (!userDoc.exists()) return;

        const userData = userDoc.data();
        const likedNewsIds = (userData.likedNews || []).slice(0, 10);

        if (likedNewsIds.length === 0) {
          setNews([]);
          return;
        }

        // Busca cada notícia individualmente
        const newsPromises = likedNewsIds.map(async (newsId: string) => {
          const newsDoc = await getDoc(doc(db, 'news', newsId));
          if (!newsDoc.exists()) return null;
          return { id: newsDoc.id, ...newsDoc.data() } as News;
        });

        const newsResults = await Promise.all(newsPromises);
        const validNews = newsResults.filter((n): n is News => n !== null);

        setNews(validNews);
      } catch (error) {
        console.error('Erro ao carregar notícias curtidas:', error);
        toast.error('Erro ao carregar notícias curtidas');
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchLikedNews();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {news.length > 0 ? (
        news.map((item) => (
          <NewsCard key={item.id} news={item} variant="minimal" />
        ))
      ) : (
        <p className="col-span-2 text-center text-secondary-600">
          Nenhuma notícia curtida ainda.
        </p>
      )}
    </div>
  );
}
