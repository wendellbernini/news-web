import { useCallback } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from './useAuth';

export function useReadHistory() {
  const { user } = useAuth();

  const addToHistory = useCallback(
    async (newsId: string, newsSlug: string, newsTitle: string) => {
      if (!user?.uid) return;

      try {
        await addDoc(collection(db, 'readHistory'), {
          userId: user.uid,
          newsId,
          newsSlug,
          newsTitle,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Erro ao registrar leitura:', error);
      }
    },
    [user]
  );

  return { addToHistory };
}
