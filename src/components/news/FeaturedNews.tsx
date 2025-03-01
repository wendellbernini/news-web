'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { News } from '@/types';
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
          orderBy('views', 'desc'),
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

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % featuredNews.length);
  }, [featuredNews.length]);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  if (featuredNews.length === 0) return null;

  const currentNews = featuredNews[currentIndex];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* Área da notícia em destaque - ocupa 3/5 do espaço */}
      <div className="relative overflow-hidden rounded-xl lg:col-span-3">
        <Link href={`/noticias/${currentNews.slug}`} className="group">
          <div className="relative">
            {/* Container da imagem com proporção fixa */}
            <div className="relative aspect-[16/9]">
              <Image
                src={currentNews.imageUrl}
                alt={currentNews.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1200px) 60vw, 720px"
              />
            </div>

            {/* Conteúdo da notícia abaixo da imagem */}
            <div className="mt-2 space-y-2 p-3 sm:mt-4 sm:space-y-3 sm:p-4">
              <span className="inline-block rounded-full bg-primary-600 px-2 py-0.5 text-xs font-medium text-white sm:px-2.5 sm:py-1">
                {currentNews.category}
              </span>

              <h2 className="text-lg font-bold leading-tight sm:text-xl md:text-2xl lg:text-3xl">
                {currentNews.title}
              </h2>

              <p className="line-clamp-2 text-xs text-secondary-600 sm:text-sm md:text-base">
                {currentNews.summary}
              </p>

              <div className="flex items-center gap-1 text-xs text-secondary-500 sm:gap-2 sm:text-sm">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Image
                    src={
                      currentNews.author.photoURL ||
                      '/images/avatar-placeholder.png'
                    }
                    alt={currentNews.author.name}
                    width={20}
                    height={20}
                    className="h-4 w-4 rounded-full sm:h-5 sm:w-5"
                  />
                  <span>{currentNews.author.name}</span>
                </div>
                <span>•</span>
                <time dateTime={currentNews.createdAt.toISOString()}>
                  {formatDate(currentNews.createdAt)}
                </time>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Área das notícias mais lidas - ocupa 2/5 do espaço */}
      <div className="lg:col-span-2">
        <div className="p-3 sm:p-6">
          <h3 className="mb-3 text-base font-bold sm:mb-4 sm:text-lg">
            Mais Lidas
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {featuredNews.map((news, index) => (
              <Link
                key={news.id}
                href={`/noticias/${news.slug}`}
                className={`group block ${
                  index !== featuredNews.length - 1
                    ? 'border-b border-secondary-200 pb-3 sm:pb-4'
                    : ''
                }`}
              >
                <span className="text-xs font-medium text-secondary-500 sm:text-sm">
                  {news.category}
                </span>
                <h4 className="line-clamp-2 text-sm font-semibold group-hover:text-primary-600 sm:text-base">
                  <span className="mr-2 text-primary-600">{index + 1}.</span>
                  {news.title}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
