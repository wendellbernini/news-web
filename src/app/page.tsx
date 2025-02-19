import { Suspense } from 'react';
import { RootLayout } from '@/components/layout/RootLayout';
import { NewsFeed } from '@/components/news/NewsFeed';
import { FeaturedNews } from '@/components/news/FeaturedNews';
import { CategoryFilter } from '@/components/news/CategoryFilter';
import { Loader2 } from 'lucide-react';

export default function Home() {
  return (
    <RootLayout>
      <div className="container py-8">
        <Suspense
          fallback={
            <div className="flex h-96 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          }
        >
          <FeaturedNews />
        </Suspense>

        <div className="mt-12">
          <div className="mb-8 space-y-4 md:flex md:items-center md:justify-between md:space-y-0">
            <h2 className="text-3xl font-bold">Últimas Notícias</h2>
            <div className="w-full md:w-auto">
              <CategoryFilter />
            </div>
          </div>

          <Suspense
            fallback={
              <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            }
          >
            <NewsFeed />
          </Suspense>
        </div>
      </div>
    </RootLayout>
  );
}
