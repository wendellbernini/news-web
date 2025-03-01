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
import { Loader2 } from 'lucide-react';

// Configuração das categorias
const CATEGORIES = [
  {
    title: 'Esportes',
    category: 'Esportes',
    accentColor: 'bg-red-600 text-red-600',
  },
  {
    title: 'Tecnologia',
    category: 'Tecnologia',
    accentColor: 'bg-blue-600 text-blue-600',
  },
  {
    title: 'Educação',
    category: 'Educação',
    accentColor: 'bg-green-600 text-green-600',
  },
];

// Componente para notícia em destaque
function FeaturedNewsCard({ news }: { news: News }) {
  return (
    <Link href={`/noticias/${news.slug}`} className="group block">
      <div className="relative mb-3 h-40 overflow-hidden rounded-lg sm:h-48">
        <Image
          src={news.imageUrl}
          alt={news.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
        />
      </div>
      <h3 className="text-base font-bold leading-snug group-hover:text-primary-600 sm:text-lg md:text-xl">
        {news.title}
      </h3>
    </Link>
  );
}

// Componente para notícia secundária
function SmallNewsCard({ news }: { news: News }) {
  return (
    <Link
      href={`/noticias/${news.slug}`}
      className="group flex items-start gap-3 py-3 sm:gap-4"
    >
      <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg sm:h-20 sm:w-28">
        <Image
          src={news.imageUrl}
          alt={news.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 96px, 112px"
        />
      </div>
      <h3 className="line-clamp-2 text-xs font-bold leading-snug group-hover:text-primary-600 sm:text-sm">
        {news.title}
      </h3>
    </Link>
  );
}

// Componente para cada coluna de categoria
function CategoryColumn({
  title,
  category,
  accentColor,
}: {
  title: string;
  category: string;
  accentColor: string;
}) {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [bgColor, textColor] = accentColor.split(' ');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsQuery = query(
          collection(db, 'news'),
          where('category', '==', category),
          where('published', '==', true),
          orderBy('createdAt', 'desc'),
          limit(6)
        );

        const snapshot = await getDocs(newsQuery);
        const newsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as News[];

        setNews(newsData);
      } catch (error) {
        console.error(`Erro ao buscar notícias de ${category}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [category]);

  return (
    <div className="w-full px-2 sm:px-4">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold sm:mb-6 sm:text-xl md:text-2xl">
        <span className={`h-5 w-1.5 sm:h-6 ${bgColor}`} />
        <span className={textColor}>{title}</span>
      </h2>

      {loading ? (
        <div className="flex h-48 items-center justify-center sm:h-96">
          <Loader2 className="h-6 w-6 animate-spin text-primary-600 sm:h-8 sm:w-8" />
        </div>
      ) : news.length > 0 ? (
        <>
          <FeaturedNewsCard news={news[0]} />
          <div className="mt-3 divide-y sm:mt-4">
            {news.slice(1).map((item) => (
              <SmallNewsCard key={item.id} news={item} />
            ))}
          </div>
        </>
      ) : (
        <div className="flex h-48 items-center justify-center text-gray-500 sm:h-96">
          Nenhuma notícia encontrada
        </div>
      )}
    </div>
  );
}

// Componente principal que renderiza o grid de categorias
export function NewsCategoryGrid() {
  return (
    <section className="border-t border-gray-200 py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map(({ title, category, accentColor }) => (
            <CategoryColumn
              key={category}
              title={title}
              category={category}
              accentColor={accentColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
