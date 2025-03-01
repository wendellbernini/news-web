'use client';

import { useEffect, useState } from 'react';
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
import Link from 'next/link';
import Image from 'next/image';

interface CategoryNewsSectionProps {
  title: string;
  category: string;
  accentColor: string;
}

export function CategoryNewsSection({
  title,
  category,
  accentColor,
}: CategoryNewsSectionProps) {
  const [news, setNews] = useState<News[]>([]);
  const [bgColor, textColor] = accentColor.split(' ');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsQuery = query(
          collection(db, 'news'),
          where('category', '==', category),
          where('published', '==', true),
          orderBy('createdAt', 'desc'),
          limit(4)
        );

        const snapshot = await getDocs(newsQuery);
        const newsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as News[];

        setNews(newsData);
      } catch (error) {
        console.error(`Erro ao buscar notícias de ${category}:`, error);
      }
    };

    fetchNews();
  }, [category]);

  if (news.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="container mx-auto px-4">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-bold sm:text-2xl md:text-3xl">
          <span className={`h-6 w-1.5 sm:h-7 ${bgColor}`} />
          <span className={textColor}>{title}</span>
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {news.map((item) => (
            <Link
              key={item.id}
              href={`/noticias/${item.slug}`}
              className="group flex items-start gap-3"
            >
              <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-32">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 112px, (max-width: 768px) 128px, 144px"
                />
              </div>
              <h3 className="line-clamp-3 text-sm font-bold leading-snug group-hover:text-primary-600 sm:text-base">
                {item.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
