'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { News } from '@/types';

interface UserHistoryItem {
  id?: string;
  newsId: string;
  readAt: {
    toDate: () => Date;
  };
  newsSlug: string;
  newsTitle: string;
  createdAt: {
    toDate: () => Date;
  };
}

interface HistoryItem {
  id: string;
  newsId: string;
  userId: string;
  createdAt: Date;
  news: News;
  newsSlug?: string;
  newsTitle?: string;
}

export default function HistoricoPage() {
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('HistoricoPage: Estado inicial:', {
      authLoading,
      userExists: !!user,
      userId: user?.id,
      loading,
      historyLength: history.length,
    });

    let isMounted = true;

    const fetchReadHistory = async () => {
      if (authLoading) {
        console.log('HistoricoPage: Aguardando autenticação...');
        return;
      }

      if (!user?.id) {
        console.log('HistoricoPage: Usuário não autenticado');
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        console.log('HistoricoPage: Iniciando busca para usuário:', user.id);
        setLoading(true);
        setError(null);

        // Busca o documento do usuário
        const userRef = doc(db, 'users', user.id);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          console.error('HistoricoPage: Usuário não encontrado no Firestore');
          if (isMounted) {
            setError('Usuário não encontrado');
            setLoading(false);
          }
          return;
        }

        const userData = userDoc.data();
        const readHistory = userData.readHistory || [];

        console.log('HistoricoPage: Histórico obtido:', {
          total: readHistory.length,
          items: readHistory,
        });

        if (readHistory.length === 0) {
          console.log('HistoricoPage: Nenhum histórico encontrado');
          if (isMounted) {
            setHistory([]);
            setLoading(false);
          }
          return;
        }

        const historyItems = readHistory.map((item: UserHistoryItem) => {
          console.log('HistoricoPage: Item do histórico:', item);

          let createdAt = new Date();
          try {
            if (item.createdAt) {
              createdAt = item.createdAt.toDate();
            } else if (item.readAt) {
              createdAt = item.readAt.toDate();
            }
          } catch (error) {
            console.error('HistoricoPage: Erro ao converter data:', error);
          }

          return {
            id: item.newsId, // Usando newsId como id já que não temos um id específico no array
            newsId: item.newsId,
            userId: user.id,
            createdAt,
            newsSlug: item.newsSlug,
            newsTitle: item.newsTitle,
            type: 'readHistory',
            status: 'active',
          } as Omit<HistoryItem, 'news'>;
        });

        console.log('HistoricoPage: Items processados:', {
          total: historyItems.length,
          items: historyItems,
        });

        // Busca os detalhes das notícias
        const newsIds = historyItems.map(
          (item: Omit<HistoryItem, 'news'>) => item.newsId
        );
        console.log('HistoricoPage: IDs das notícias para buscar:', newsIds);

        const newsMap = new Map();

        // Busca cada notícia individualmente
        const newsPromises = newsIds.map(async (newsId: string) => {
          try {
            const newsDoc = await getDoc(doc(db, 'news', newsId));
            if (newsDoc.exists()) {
              const newsData = newsDoc.data() as News;
              newsData.id = newsDoc.id;
              console.log('HistoricoPage: Notícia encontrada:', {
                id: newsData.id,
                title: newsData.title,
              });
              return newsData;
            }
            console.log('HistoricoPage: Notícia não existe:', newsId);
            return null;
          } catch (error) {
            console.error('HistoricoPage: Erro ao buscar notícia:', {
              newsId,
              error,
            });
            return null;
          }
        });

        const newsResults = await Promise.all(newsPromises);
        newsResults.forEach((newsData: News | null) => {
          if (newsData) {
            newsMap.set(newsData.id, newsData);
          }
        });

        const historyWithNews = historyItems
          .map((item: Omit<HistoryItem, 'news'>) => {
            const newsItem = newsMap.get(item.newsId);
            if (!newsItem) {
              console.log('HistoricoPage: Notícia não encontrada:', {
                historyItem: item,
                availableNews: Array.from(newsMap.keys()),
              });
              return null;
            }
            return {
              ...item,
              news: newsItem,
            } as HistoryItem;
          })
          .filter(
            (item: HistoryItem | null): item is HistoryItem => item !== null
          )
          .sort(
            (a: HistoryItem, b: HistoryItem) =>
              b.createdAt.getTime() - a.createdAt.getTime()
          );

        console.log('HistoricoPage: Histórico final:', {
          total: historyWithNews.length,
          items: historyWithNews,
        });

        if (isMounted) {
          setHistory(historyWithNews);
          setLoading(false);
        }
      } catch (error) {
        console.error('HistoricoPage: Erro ao buscar histórico:', error);
        if (isMounted) {
          setError('Erro ao carregar o histórico. Por favor, tente novamente.');
          setHistory([]);
          setLoading(false);
        }
      }
    };

    fetchReadHistory();

    return () => {
      isMounted = false;
    };
  }, [user?.id, authLoading, loading, history.length]);

  if (authLoading || loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-secondary-200 p-6 dark:border-secondary-800">
        <p className="text-center text-secondary-600 dark:text-secondary-400">
          Faça login para ver seu histórico de leitura
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 p-6 dark:border-red-800">
        <p className="text-center text-red-600 dark:text-red-400">{error}</p>
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
            {history.map((item) => {
              if (!item.news) return null;
              return (
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
              );
            })}
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
