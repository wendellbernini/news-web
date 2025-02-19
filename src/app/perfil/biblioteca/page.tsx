'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SavedNews } from '@/components/user/SavedNews';
import useStore from '@/store/useStore';

export default function LibraryPage() {
  const router = useRouter();
  const { user } = useStore();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">Minha Biblioteca</h1>
        <SavedNews
          onToggleSave={async (newsId) => {
            const store = useStore.getState();
            const isSaved = store.user?.savedNews.includes(newsId);
            if (isSaved) {
              store.unsaveNews(newsId);
            } else {
              store.saveNews(newsId);
            }
          }}
          onCheckSaved={async (newsId) => {
            const { user } = useStore.getState();
            return user?.savedNews.includes(newsId) || false;
          }}
        />
      </div>
    </div>
  );
}
