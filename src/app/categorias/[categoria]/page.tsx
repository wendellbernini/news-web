'use client';

import { RootLayout } from '@/components/layout/RootLayout';
import { CategoryNews } from '@/components/news/CategoryNews';
import { Category } from '@/types';

interface CategoryPageProps {
  params: {
    categoria: string;
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const categoria = params.categoria as Category;

  return (
    <RootLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">{categoria}</h1>
          <p className="mt-2 text-secondary-600 dark:text-secondary-400">
            Últimas notícias sobre {categoria.toLowerCase()}
          </p>
        </div>
        <CategoryNews category={categoria} />
      </div>
    </RootLayout>
  );
}
