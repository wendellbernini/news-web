import { Metadata } from 'next';
import { RootLayout } from '@/components/layout/RootLayout';
import { TrendingNews } from '@/components/news/TrendingNews';

export const metadata: Metadata = {
  title: 'Mais Lidas | NewsWeb',
  description: 'As notícias mais lidas e populares do momento',
};

export default function TrendingPage() {
  return (
    <RootLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Mais Lidas</h1>
          <p className="mt-2 text-secondary-600 dark:text-secondary-400">
            As notícias mais populares do momento
          </p>
        </div>
        <TrendingNews />
      </div>
    </RootLayout>
  );
}
