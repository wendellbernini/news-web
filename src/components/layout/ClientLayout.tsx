'use client';

import { ReactNode, Suspense } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { NewsTicker } from './NewsTicker';
import { StockTicker } from './StockTicker';
import { Toaster } from 'react-hot-toast';
import useStore from '@/store/useStore';

interface ClientLayoutProps {
  children: ReactNode;
}

/**
 * Componente de layout do cliente com Suspense
 *
 * Este componente envolve o layout principal com um limite de suspense
 * para evitar erros relacionados ao uso de hooks como useSearchParams
 */
export function ClientLayout({ children }: ClientLayoutProps) {
  const { isDarkMode } = useStore();

  return (
    <div className={isDarkMode ? 'dark' : ''} suppressHydrationWarning>
      <div
        className="flex min-h-screen flex-col bg-white text-secondary-950 antialiased dark:bg-secondary-950 dark:text-secondary-50"
        suppressHydrationWarning
      >
        <Suspense
          fallback={<div className="h-8 bg-white dark:bg-secondary-950"></div>}
        >
          <NewsTicker />
        </Suspense>

        <Suspense
          fallback={<div className="h-16 bg-white dark:bg-secondary-950"></div>}
        >
          <Header />
        </Suspense>

        <Suspense
          fallback={<div className="h-8 bg-white dark:bg-secondary-950"></div>}
        >
          <StockTicker />
        </Suspense>

        <main className="flex-1">{children}</main>

        <Footer />

        <Toaster
          position="top-right"
          toastOptions={{
            className:
              '!bg-white !text-secondary-950 dark:!bg-secondary-900 dark:!text-secondary-50',
            duration: 5000,
          }}
        />
      </div>
    </div>
  );
}
