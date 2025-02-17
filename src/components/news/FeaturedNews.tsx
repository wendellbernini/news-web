'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { News } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export function FeaturedNews() {
  const [featuredNews, setFeaturedNews] = useState<News[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchFeaturedNews = async () => {
      try {
        const newsQuery = query(
          collection(db, 'news'),
          where('published', '==', true),
          orderBy('likes', 'desc'),
          limit(5)
        );

        const snapshot = await getDocs(newsQuery);
        const news = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.seconds
              ? new Date(data.createdAt.seconds * 1000)
              : new Date(),
            updatedAt: data.updatedAt?.seconds
              ? new Date(data.updatedAt.seconds * 1000)
              : new Date(),
          };
        }) as News[];

        setFeaturedNews(news);
      } catch (error) {
        console.error('Erro ao buscar notícias em destaque:', error);
      }
    };

    fetchFeaturedNews();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredNews.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? featuredNews.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [featuredNews.length]);

  if (featuredNews.length === 0) return null;

  const currentNews = featuredNews[currentIndex];

  return (
    <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl">
      <Link href={`/noticias/${currentNews.slug}`}>
        <div className="relative h-full w-full">
          <Image
            src={currentNews.imageUrl}
            alt={currentNews.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <span className="mb-2 inline-block rounded-full bg-primary-600 px-3 py-1 text-sm font-medium">
              {currentNews.category}
            </span>
            <h2 className="mb-2 text-2xl font-bold sm:text-3xl md:text-4xl">
              {currentNews.title}
            </h2>
            <p className="mb-4 line-clamp-2 text-sm text-white/80 sm:text-base">
              {currentNews.summary}
            </p>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Image
                src={
                  currentNews.author.photoURL ||
                  '/images/avatar-placeholder.png'
                }
                alt={currentNews.author.name}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span>{currentNews.author.name}</span>
              <span>•</span>
              <time dateTime={currentNews.createdAt.toISOString()}>
                {formatDate(currentNews.createdAt)}
              </time>
            </div>
          </div>
        </div>
      </Link>

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 text-white hover:bg-black/40"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 text-white hover:bg-black/40"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 gap-2">
        {featuredNews.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full transition-all ${
              index === currentIndex
                ? 'w-4 bg-white'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
