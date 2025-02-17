import { Metadata } from 'next';
import { RootLayout } from '@/components/layout/RootLayout';
import { CategoryNews } from '@/components/news/CategoryNews';
import { Category } from '@/types';
import { unstable_noStore as noStore } from 'next/cache';

interface CategoryPageProps {
  params: {
    categoria: Category;
  };
}

// Gera metadados dinâmicos com base na categoria da URL
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  noStore();
  return {
    title: `${params.categoria} | NewsWeb`,
    description: `Últimas notícias sobre ${params.categoria}`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  noStore();

  return (
    <RootLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">{params.categoria}</h1>
          <p className="mt-2 text-secondary-600 dark:text-secondary-400">
            Últimas notícias sobre {params.categoria.toLowerCase()}
          </p>
        </div>
        <CategoryNews category={params.categoria} />
      </div>
    </RootLayout>
  );
}
