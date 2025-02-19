'use client';

import { useState, useEffect } from 'react';
import { NewsCard } from '@/components/news/NewsCard';
import { Loader2 } from 'lucide-react';
import { News } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface ReadHistoryProps {}

export function ReadHistory({}: ReadHistoryProps) {
  const { user } = useAuth();
  const [readHistory, setReadHistory] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReadHistory = async () => {
      if (!user) {
        setReadHistory([]);
        setLoading(false);
        return;
      }

      try {
        const historyQuery = query(
          collection(db, 'readHistory'),
          where('userId', '==', user.id),
          where('status', '==', 'active'),
          orderBy('readAt', 'desc')
        );

        const historySnapshot = await getDocs(historyQuery);
        const newsIds = historySnapshot.docs.map((doc) => doc.data().newsId);

        if (newsIds.length === 0) {
          setReadHistory([]);
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

        // Ordena as notícias na mesma ordem do histórico
        const orderedNews = newsIds
          .map((id) => newsData.find((news) => news.id === id))
          .filter((news): news is News => news !== undefined);

        setReadHistory(orderedNews);
      } catch (error) {
        console.error('Erro ao carregar histórico de leitura:', error);
        toast.error('Erro ao carregar histórico de leitura');
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchReadHistory();
  }, [user]);

  const handleShare = async (news: News) => {
    try {
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
      <h2 className="mb-6 text-2xl font-semibold">Histórico de Leitura</h2>
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
        </div>
      ) : readHistory.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {readHistory.map((news) => (
            <NewsCard key={news.id} news={news} onShare={handleShare} />
          ))}
        </div>
      ) : (
        <p className="text-center text-secondary-600 dark:text-secondary-400">
          Seu histórico de leitura está vazio.
        </p>
      )}
    </section>
  );
}
