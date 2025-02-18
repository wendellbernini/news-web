'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { News } from '@/types';

interface ReadHistory {
  id: string;
  newsId: string;
  userId: string;
  createdAt: Date;
  news?: News;
}

interface ReadHistoryDocument {
  id: string;
  newsId: string;
  userId: string;
  createdAt: any; // Firestore Timestamp
}

export default function HistoricoPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<ReadHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReadHistory = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const historyQuery = query(
          collection(db, 'readHistory'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(20)
        );

        const historySnapshot = await getDocs(historyQuery);
        const historyIds = historySnapshot.docs
          .map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt.toDate(),
              }) as ReadHistoryDocument
          )
          .filter((item): item is ReadHistory => Boolean(item.newsId));

        if (historyIds.length === 0) {
          setHistory([]);
          setLoading(false);
          return;
        }

        const newsIds = historyIds.map((item) => item.newsId);
        const newsQuery = query(
          collection(db, 'news'),
          where('id', 'in', newsIds)
        );

        const newsSnapshot = await getDocs(newsQuery);
        const newsMap = new Map(
          newsSnapshot.docs.map((doc) => [
            doc.id,
            { id: doc.id, ...doc.data() } as News,
          ])
        );

        const historyWithNews = historyIds
          .map((item) => {
            const news = newsMap.get(item.newsId);
            if (!news) return null;
            return {
              ...item,
              news,
            };
          })
          .filter((item): item is ReadHistory & { news: News } =>
            Boolean(item)
          );

        setHistory(historyWithNews);
      } catch (error) {
        console.error('Erro ao buscar histórico de leitura:', error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReadHistory();
  }, [user]);

  if (!user) {
    return (
      <div className="rounded-lg border border-secondary-200 p-6 dark:border-secondary-800">
        <p className="text-center text-secondary-600 dark:text-secondary-400">
          Faça login para ver seu histórico de leitura
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Histórico de Leitura</h1>
        <p className="mt-2 text-secondary-600 dark:text-secondary-400">
          Veja as notícias que você leu recentemente
        </p>
      </div>

      <div className="rounded-lg border border-secondary-200 p-6 dark:border-secondary-800">
        {history.length > 0 ? (
          <div className="space-y-6">
            {history.map((item) => (
              <Link
                key={item.id}
                href={`/noticias/${item.news.slug}`}
                className="group block"
              >
                <div className="flex gap-4">
                  <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={item.news.imageUrl}
                      alt={item.news.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium group-hover:text-primary-600">
                      {item.news.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-secondary-600 dark:text-secondary-400">
                      {item.news.summary}
                    </p>
                    <time
                      dateTime={item.createdAt.toISOString()}
                      className="mt-2 text-xs text-secondary-500 dark:text-secondary-500"
                    >
                      Lido em {formatDate(item.createdAt)}
                    </time>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-secondary-600 dark:text-secondary-400">
            Você ainda não leu nenhuma notícia
          </p>
        )}
      </div>
    </div>
  );
}
