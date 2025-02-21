import { Metadata } from 'next';
import { Category } from '@/types';
import { SITE_NAME } from '@/lib/constants';

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const categoria = params.categoria as Category;

  return {
    title: `${categoria} | ${SITE_NAME}`,
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
