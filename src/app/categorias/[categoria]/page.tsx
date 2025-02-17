import { Metadata } from 'next';
import { RootLayout } from '@/components/layout/RootLayout';
import { CategoryNews } from '@/components/news/CategoryNews';
import { Category } from '@/types';

interface CategoryPageProps {
  params: {
    categoria: string; // ✅ Agora está correto
  };
}

// Gera metadados dinâmicos com base na categoria da URL
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  return {
    title: `${params.categoria} | NewsWeb`,
    description: `Últimas notícias sobre ${params.categoria}`,
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  // Se `Category` for um enum, converta a string para ele
  const category = params.categoria as Category;

  return (
    <RootLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">{category}</h1>
          <p className="mt-2 text-secondary-600 dark:text-secondary-400">
            Últimas notícias sobre {category?.toLowerCase()}
          </p>
        </div>
        <CategoryNews category={category} />
      </div>
    </RootLayout>
  );
}
