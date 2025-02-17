import { Metadata } from 'next';
import { RootLayout } from '@/components/layout/RootLayout';
import { CategoryNews } from '@/components/news/CategoryNews';
import { Category } from '@/types';
import { unstable_noStore as noStore } from 'next/cache';

interface CategoryPageProps {
  params: {
    categoria: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

// Gera metadados dinâmicos com base na categoria da URL
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  noStore();
  const categoria = params.categoria as Category;

  return {
    title: `${categoria} | NewsWeb`,
    description: `Últimas notícias sobre ${categoria}`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  noStore();
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
