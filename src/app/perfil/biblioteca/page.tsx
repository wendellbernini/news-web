'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SavedNews } from '@/components/user/SavedNews';
import useStore from '@/store/useStore';
import { RootLayout } from '@/components/layout/RootLayout';
import { useReadingList } from '@/hooks/useReadingList';
import { Loader2 } from 'lucide-react';

export default function LibraryPage() {
  const router = useRouter();
  const { user } = useStore();
  const { toggleSaveNews } = useReadingList();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Aguarda um momento para garantir que o estado de autenticação foi carregado
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!user) {
        router.push('/login');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, router]);

  if (isLoading) {
    return (
      <RootLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </RootLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <RootLayout>
      <div className="container py-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-3xl font-bold">Minha Biblioteca</h1>
          <SavedNews onToggleSave={toggleSaveNews} />
        </div>
      </div>
    </RootLayout>
  );
}
