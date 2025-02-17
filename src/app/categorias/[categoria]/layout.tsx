import { Metadata } from 'next';
import { Category } from '@/types';

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const categoria = params.categoria as Category;

  return {
    title: `${categoria} | NewsWeb`,
    description: `Últimas notícias sobre ${categoria}`,
  };
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
