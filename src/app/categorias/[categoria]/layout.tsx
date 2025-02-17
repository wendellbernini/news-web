import { Metadata } from 'next';
import { Category } from '@/types';

interface CategoryLayoutProps {
  children: React.ReactNode;
  params: {
    categoria: string;
  };
}

export async function generateMetadata({
  params,
}: CategoryLayoutProps): Promise<Metadata> {
  const categoria = params.categoria as Category;

  return {
    title: `${categoria} | NewsWeb`,
    description: `Últimas notícias sobre ${categoria}`,
  };
}

export default function CategoryLayout({ children }: CategoryLayoutProps) {
  return children;
}
