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
        <h2 className="mb-6 flex items-center gap-2 text-3xl font-bold">
          <span className={`h-7 w-1.5 ${bgColor}`} />
          <span className={textColor}>{title}</span>
        </h2>

        <div className="flex justify-between gap-6">
          {news.map((item) => (
            <Link
              key={item.id}
              href={`/noticias/${item.slug}`}
              className="group flex w-72 items-start gap-4"
            >
              <div className="relative h-24 w-36 flex-shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="144px"
                />
              </div>
              <h3 className="max-h-[60px] overflow-hidden text-base font-bold leading-snug group-hover:text-primary-600">
                {item.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
