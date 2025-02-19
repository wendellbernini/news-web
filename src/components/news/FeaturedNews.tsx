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
    <div className="relative w-full overflow-hidden rounded-xl">
      {/* Aspect ratio container */}
      <div className="relative aspect-[16/9] sm:aspect-[2/1]">
        <Link href={`/noticias/${currentNews.slug}`} className="group">
          <div className="relative h-full w-full">
            <Image
              src={currentNews.imageUrl}
              alt={currentNews.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
            />
            {/* Gradiente mais suave e adaptativo */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

            {/* Container do conteúdo com padding adaptativo */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
              {/* Grid para melhor organização em mobile */}
              <div className="grid gap-2 sm:gap-3">
                {/* Categoria com tamanho adaptativo */}
                <span className="inline-block w-fit rounded-full bg-primary-600 px-2.5 py-1 text-xs font-medium text-white sm:px-3 sm:text-sm">
                  {currentNews.category}
                </span>

                {/* Título com tamanho e altura de linha adaptativos */}
                <h2 className="line-clamp-3 text-xl font-bold leading-tight text-white sm:text-2xl sm:leading-tight md:text-3xl md:leading-tight lg:text-4xl lg:leading-tight">
                  {currentNews.title}
                </h2>

                {/* Resumo com visibilidade condicional */}
                <p className="hidden text-sm text-white/80 sm:line-clamp-2 sm:text-base">
                  {currentNews.summary}
                </p>

                {/* Metadados com layout flexível */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-white/60 sm:text-sm">
                  <div className="flex items-center gap-2">
                    <Image
                      src={
                        currentNews.author.photoURL ||
                        '/images/avatar-placeholder.png'
                      }
                      alt={currentNews.author.name}
                      width={20}
                      height={20}
                      className="rounded-full sm:h-6 sm:w-6"
                    />
                    <span className="line-clamp-1">
                      {currentNews.author.name}
                    </span>
                  </div>
                  <span className="hidden sm:inline">•</span>
                  <time
                    dateTime={currentNews.createdAt.toISOString()}
                    className="line-clamp-1"
                  >
                    {formatDate(currentNews.createdAt)}
                  </time>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Controles de navegação com visibilidade condicional */}
      <div className="hidden sm:block">
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
      </div>

      {/* Indicadores de slide com posicionamento adaptativo */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 sm:bottom-20 sm:gap-2">
        {featuredNews.map((_, index) => (
          <button
            key={index}
            className={`h-1.5 rounded-full transition-all sm:h-2 ${
              index === currentIndex
                ? 'w-6 bg-white sm:w-8'
                : 'w-1.5 bg-white/50 hover:bg-white/75 sm:w-2'
            }`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
