import { useCallback, useRef } from 'react';
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from './useAuth';
import useStore from '@/store/useStore';
import { cacheService } from '@/lib/cache';

interface ReadHistoryItem {
  newsId: string;
  userId: string;
  readAt: Timestamp;
  createdAt: Timestamp;
  newsSlug: string;
  newsTitle: string;
  type: 'readHistory';
  status: 'active';
}

const READ_HISTORY_CACHE_TTL = 600; // 10 minutos
const READ_HISTORY_DEBOUNCE = 3000; // 3 segundos

export function useReadHistory() {
  const { user } = useAuth();
  const { addToReadHistory: addToLocalHistory } = useStore();
  const debounceRef = useRef<NodeJS.Timeout>();

  const addToHistory = useCallback(
    async (newsId: string, newsSlug: string, newsTitle: string) => {
      console.log('DEBUG - Iniciando addToHistory:', {
        newsId,
        newsSlug,
        newsTitle,
        userId: user?.id,
      });

      if (!user?.id) {
        console.log('useReadHistory: Usuário não autenticado');
        return Promise.reject(new Error('Usuário não autenticado'));
      }

      try {
        console.log('useReadHistory: Iniciando registro para usuário:', {
          id: user.id,
          newsId,
          newsSlug,
          newsTitle,
        });

        const cacheKey = `read_history_${user.id}`;

        // Verifica se já está no histórico usando cache
        const cachedHistory = await cacheService.get<ReadHistoryItem[]>(
          cacheKey,
          async () => {
            const userRef = doc(db, 'users', user.id);
            const userDoc = await getDoc(userRef);
            return userDoc.exists() ? userDoc.data().readHistory || [] : [];
          },
          { ttl: READ_HISTORY_CACHE_TTL }
        );

        const alreadyRead = cachedHistory.some(
          (item) => item.newsId === newsId
        );

        if (alreadyRead) {
          console.log('useReadHistory: Notícia já está no histórico');
          return Promise.resolve(newsId);
        }

        // Cria o item do histórico com timestamp
        const now = Timestamp.now();
        const historyItem: ReadHistoryItem = {
          newsId,
          userId: user.id,
          readAt: now,
          createdAt: now,
          newsSlug,
          newsTitle,
          type: 'readHistory',
          status: 'active',
        };

        console.log('DEBUG - Item a ser salvo:', historyItem);

        // Debounce para atualizações no Firestore
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
          try {
            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, {
              readHistory: arrayUnion(historyItem),
            });
          } catch (error) {
            if (
              error instanceof Error &&
              error.message.includes('No document to update')
            ) {
              const userRef = doc(db, 'users', user.id);
              await setDoc(
                userRef,
                { readHistory: [historyItem] },
                { merge: true }
              );
            } else {
              throw error;
            }
          }
        }, READ_HISTORY_DEBOUNCE);

        // Atualiza o cache imediatamente
        const updatedHistory = [historyItem, ...cachedHistory];
        await cacheService.set(cacheKey, updatedHistory, {
          ttl: READ_HISTORY_CACHE_TTL,
          useMemoryOnly: true,
        });

        console.log('useReadHistory: Histórico atualizado com sucesso');

        // Atualiza o estado local
        addToLocalHistory(newsId, 100);

        return Promise.resolve(newsId);
      } catch (error) {
        console.error('useReadHistory: Erro ao registrar:', error);
        return Promise.reject(error);
      }
    },
    [user, addToLocalHistory]
  );

  return { addToHistory };
}
