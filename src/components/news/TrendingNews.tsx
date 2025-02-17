'use client';

import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { NewsCard } from './NewsCard';
import { News } from '@/types';
import { Button } from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const PAGE_SIZE = 12;

export function TrendingNews() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const { ref, inView } = useInView();

  useEffect(() => {
    fetchTrendingNews();
  }, []);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      fetchMoreNews();
    }
  }, [inView, hasMore, loading]);

  const fetchTrendingNews = async () => {
    try {
      const newsQuery = query(
        collection(db, 'news'),
        where('published', '==', true),
        orderBy('views', 'desc'),
        limit(PAGE_SIZE)
      );

      const snapshot = await getDocs(newsQuery);
      const newsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as News[];

      setNews(newsData);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreNews = async () => {
    if (!lastDoc) return;

    setLoading(true);

    try {
      const newsQuery = query(
        collection(db, 'news'),
        where('published', '==', true),
        orderBy('views', 'desc'),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );

      const snapshot = await getDocs(newsQuery);
      const newsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as News[];

      setNews((prev) => [...prev, ...newsData]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (error) {
      console.error('Erro ao buscar mais notícias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (newsId: string) => {
    // Implementar a funcionalidade de curtir
    console.log('Curtir notícia:', newsId);
  };

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

  if (loading && news.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {news.map((item) => (
          <NewsCard
            key={item.id}
            news={item}
            onLike={handleLike}
            onShare={handleShare}
          />
        ))}
      </div>

      {hasMore && (
        <div ref={ref} className="mt-8 flex items-center justify-center">
          <Button variant="ghost" disabled={loading}>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando mais notícias...
          </Button>
        </div>
      )}

      {!hasMore && news.length > 0 && (
        <p className="mt-8 text-center text-sm text-secondary-600 dark:text-secondary-400">
          Não há mais notícias para carregar.
        </p>
      )}

      {news.length === 0 && (
        <div className="flex h-96 items-center justify-center">
          <p className="text-center text-sm text-secondary-600 dark:text-secondary-400">
            Nenhuma notícia encontrada.
          </p>
        </div>
      )}
    </div>
  );
}
