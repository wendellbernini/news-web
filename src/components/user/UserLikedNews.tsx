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

export function UserLikedNews() {
  const { user } = useAuth();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedNews = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const likesQuery = query(
          collection(db, 'likes'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(10)
        );

        const likesSnapshot = await getDocs(likesQuery);
        const newsIds = likesSnapshot.docs.map((doc) => doc.data().newsId);

        if (newsIds.length === 0) {
          setNews([]);
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

        setNews(newsData);
      } catch (error) {
        console.error('Erro ao buscar notícias curtidas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedNews();
  }, [user]);

  if (!user) {
    return (
      <div className="rounded-lg border border-secondary-200 p-6 dark:border-secondary-800">
        <p className="text-center text-secondary-600 dark:text-secondary-400">
          Faça login para ver suas notícias curtidas
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
    <div className="rounded-lg border border-secondary-200 p-6 dark:border-secondary-800">
      <h2 className="mb-4 text-xl font-bold">Notícias Curtidas</h2>

      {news.length > 0 ? (
        <div className="space-y-4">
          {news.map((item) => (
            <Link
              key={item.id}
              href={`/noticias/${item.slug}`}
              className="group block"
            >
              <div className="flex gap-4">
                <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-primary-600">
                    {item.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-secondary-600 dark:text-secondary-400">
                    {item.summary}
                  </p>
                  <time
                    dateTime={item.createdAt.toISOString()}
                    className="mt-2 text-xs text-secondary-500 dark:text-secondary-500"
                  >
                    {formatDate(item.createdAt)}
                  </time>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-secondary-600 dark:text-secondary-400">
          Você ainda não curtiu nenhuma notícia
        </p>
      )}
    </div>
  );
}
