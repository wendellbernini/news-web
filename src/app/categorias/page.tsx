'use client';

import Link from 'next/link';
import { RootLayout } from '@/components/layout/RootLayout';
import { CATEGORIES } from '@/lib/constants';

export default function CategoriasPage() {
  return (
    <RootLayout>
      <div className="container py-8">
        <h1 className="mb-8 text-4xl font-bold">Categorias</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Object.entries(CATEGORIES).map(([slug, name]) => (
            <Link
              key={slug}
              href={`/categorias/${slug}`}
              className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800"
            >
              <h2 className="text-xl font-semibold">{name}</h2>
              <p className="mt-2 text-secondary-600 dark:text-secondary-400">
                Notícias sobre {name.toLowerCase()}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </RootLayout>
  );
}
