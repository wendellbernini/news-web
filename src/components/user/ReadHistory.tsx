'use client';

import { useState, useEffect } from 'react';
import { NewsCard } from '@/components/news/NewsCard';
import { Loader2 } from 'lucide-react';
import { News } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface HistoryItem {
  newsId: string;
  readAt: Date;
}

export function ReadHistory() {
  const { user } = useAuth();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setNews([]);
        setLoading(false);
        return;
      }

      try {
        // Busca o documento do usuário que contém o histórico
        const userDoc = await getDoc(doc(db, 'users', user.id));

        if (!userDoc.exists()) {
          setNews([]);
          return;
        }

        const userData = userDoc.data();
        const readHistory = (userData.readHistory || [])
          .slice(0, 10) // Pega apenas os 10 últimos
          .map((item: HistoryItem) => item.newsId);

        if (readHistory.length === 0) {
          setNews([]);
          return;
        }

        // Busca cada notícia individualmente
        const newsPromises = readHistory.map(async (newsId: string) => {
          const newsDoc = await getDoc(doc(db, 'news', newsId));
          if (!newsDoc.exists()) return null;
          return { id: newsDoc.id, ...newsDoc.data() } as News;
        });

        const newsResults = await Promise.all(newsPromises);
        const validNews = newsResults.filter((n): n is News => n !== null);

        setNews(validNews);
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        toast.error('Erro ao carregar histórico de leitura');
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchHistory();
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
          Nenhuma notícia lida ainda.
        </p>
      )}
    </div>
  );
}
