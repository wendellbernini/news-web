import { CATEGORIES } from '@/lib/constants';
import { CategoryNews } from '@/components/news/CategoryNews';
import { Category } from '@/types';
import { Metadata } from 'next';

type Params = Promise<{ categoria: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const category = CATEGORIES[resolvedParams.categoria];

  if (!category) {
    return {
      title: 'Categoria não encontrada | Rio de Fato',
      description: 'A categoria solicitada não existe.',
    };
  }

  return {
    title: `${category} | Rio de Fato`,
    description: `Últimas notícias sobre ${category.toLowerCase()}`,
  };
}

// Garantindo que as categorias são geradas estaticamente
export function generateStaticParams() {
  return Object.keys(CATEGORIES).map((categoria) => ({
    categoria,
  }));
}

export default async function Page({ params }: { params: Params }) {
  const resolvedParams = await params;
  const category = CATEGORIES[resolvedParams.categoria];

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-4 text-3xl font-bold">Categoria não encontrada</h1>
        <p className="text-gray-600">A categoria solicitada não existe.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-3xl font-bold">{category}</h1>
      <CategoryNews category={category as Category} />
    </div>
  );
}
