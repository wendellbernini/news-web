'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import {
  doc,
  getDoc,
  DocumentData,
  DocumentSnapshot,
  Firestore,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { News } from '@/types';
import { cacheService } from '@/lib/cache';

const ITEMS_PER_PAGE = 20;
const HISTORY_CACHE_TTL = 1800; // 30 minutos

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

interface HistoryItem extends UserHistoryItem {
  news: News | null;
}

export default function HistoricoPage() {
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (!user?.id || authLoading) {
      if (isMounted) {
        setLoading(false);
      }
      return;
    }

    const fetchReadHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        // Usa a mesma chave de cache do useReadHistory
        const cacheKey = `read_history_${user.id}`;

        const fetchHistoryData = async () => {
          console.log('Buscando histórico para usuário:', user.id);

          // Busca o documento do usuário
          const userRef = doc(db, 'users', user.id);
          const userDoc = await getDoc(userRef);

          if (!userDoc.exists()) {
            console.error('Documento do usuário não encontrado:', user.id);
            throw new Error('Usuário não encontrado');
          }

          const userData = userDoc.data();
          console.log('Dados do usuário:', userData);

          const readHistory = userData.readHistory || [];
          console.log('Total de itens no histórico:', readHistory.length);

          // Aplica paginação no histórico
          const start = (page - 1) * ITEMS_PER_PAGE;
          const end = start + ITEMS_PER_PAGE;
          const paginatedHistory = readHistory.slice(start, end);
          console.log('Itens após paginação:', paginatedHistory.length);

          // Verifica se há mais itens
          setHasMore(readHistory.length > end);

          if (paginatedHistory.length === 0) {
            return [];
          }

          // Coleta IDs únicos das notícias
          const newsIds: string[] = Array.from(
            new Set(
              paginatedHistory.map((item: UserHistoryItem) => item.newsId)
            )
          );
          console.log('IDs únicos de notícias:', newsIds);

          // Busca todas as notícias em uma única query
          const newsPromises = newsIds.map((newsId: string) =>
            getDoc(doc(db as Firestore, 'news', newsId))
          );

          const newsSnapshots = await Promise.all(newsPromises);
          console.log('Notícias encontradas:', newsSnapshots.length);

          const newsMap = new Map(
            newsSnapshots
              .filter((doc): doc is DocumentSnapshot<DocumentData> =>
                doc.exists()
              )
              .map((doc) => [doc.id, { id: doc.id, ...doc.data() } as News])
          );

          // Monta o histórico com as notícias
          const result = paginatedHistory.map((item: UserHistoryItem) => {
            const news = newsMap.get(item.newsId);
            if (!news) {
              console.warn('Notícia não encontrada:', item.newsId);
            }
            return {
              ...item,
              news: news || null,
            };
          });

          console.log('Histórico montado:', result.length);
          return result;
        };

        // Usa cache para reduzir leituras
        const historyData = await cacheService.get(cacheKey, fetchHistoryData, {
          ttl: HISTORY_CACHE_TTL,
        });

        if (isMounted) {
          setHistory((prev) =>
            page === 1 ? historyData : [...prev, ...historyData]
          );
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        if (isMounted) {
          setError('Erro ao carregar histórico de leitura');
          setLoading(false);
        }
      }
    };

    fetchReadHistory();

    return () => {
      isMounted = false;
    };
  }, [user?.id, authLoading, page]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="mb-4 text-2xl font-bold">Acesso Restrito</h1>
        <p className="mb-4">Faça login para ver seu histórico de leitura.</p>
        <Link
          href="/auth/login"
          className="bg-primary hover:bg-primary/90 rounded px-4 py-2 text-white"
        >
          Fazer Login
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Histórico de Leitura</h1>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {loading && history.length === 0 ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : history.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">Nenhuma notícia lida ainda.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {history.map(
            (item) =>
              item.news && (
                <Link
                  key={`${item.newsId}_${item.readAt.toDate().getTime()}`}
                  href={`/noticias/${item.news.slug}`}
                  className="block rounded-lg bg-white shadow transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start gap-4 p-4">
                    {item.news.imageUrl && (
                      <div className="flex-shrink-0">
                        <Image
                          src={item.news.imageUrl}
                          alt={item.news.title}
                          width={120}
                          height={80}
                          className="rounded object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-grow">
                      <h2 className="mb-2 text-lg font-semibold">
                        {item.news.title}
                      </h2>
                      <p className="mb-2 text-sm text-gray-600">
                        {item.news.summary}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{formatDate(item.readAt.toDate())}</span>
                        <span className="mx-2">•</span>
                        <span>{item.news.category}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
          )}

          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={loading}
                className="bg-primary hover:bg-primary/90 rounded px-6 py-2 text-white disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Carregar Mais'
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
