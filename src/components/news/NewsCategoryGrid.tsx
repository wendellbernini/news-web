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
      <div className="relative mb-3 h-48 overflow-hidden rounded-lg">
        <Image
          src={news.imageUrl}
          alt={news.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <h3 className="text-xl font-bold leading-snug group-hover:text-primary-600">
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
      className="group flex items-start gap-4 py-3"
    >
      <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg">
        <Image
          src={news.imageUrl}
          alt={news.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="112px"
        />
      </div>
      <h3 className="text-sm font-bold leading-snug group-hover:text-primary-600">
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
    <div className="flex-1 px-4">
      <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
        <span className={`h-6 w-1.5 ${bgColor}`} />
        <span className={textColor}>{title}</span>
      </h2>

      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : news.length > 0 ? (
        <>
          <FeaturedNewsCard news={news[0]} />
          <div className="mt-4 divide-y">
            {news.slice(1).map((item) => (
              <SmallNewsCard key={item.id} news={item} />
            ))}
          </div>
        </>
      ) : (
        <div className="flex h-96 items-center justify-center text-gray-500">
          Nenhuma notícia encontrada
        </div>
      )}
    </div>
  );
}

// Componente principal que renderiza o grid de categorias
export function NewsCategoryGrid() {
  return (
    <section className="border-t border-gray-200 py-8">
      <div className="container mx-auto">
        <div className="flex gap-8">
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
