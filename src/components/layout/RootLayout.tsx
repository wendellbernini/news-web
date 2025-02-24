'use client';

import { ReactNode, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { NewsTicker } from './NewsTicker';
import { StockTicker } from './StockTicker';
import { Toaster } from 'react-hot-toast';
import useStore from '@/store/useStore';

interface RootLayoutProps {
  children: ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  const { isDarkMode, user } = useStore();

  useEffect(() => {}, [user]);

  return (
    <div className={isDarkMode ? 'dark' : ''} suppressHydrationWarning>
      <div
        className="flex min-h-screen flex-col bg-white text-secondary-950 antialiased dark:bg-secondary-950 dark:text-secondary-50"
        suppressHydrationWarning
      >
        <NewsTicker />
        <Header />
        <StockTicker />
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
