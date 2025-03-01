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

// Aumentado para reduzir número de escritas
const READ_HISTORY_CACHE_TTL = 1800; // 30 minutos
const READ_HISTORY_DEBOUNCE = 10000; // 10 segundos

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

// Cache local para armazenar histórico pendente
const pendingHistoryCache = new Map<string, ReadHistoryItem[]>();

export function useReadHistory() {
  const { user } = useAuth();
  const { addToReadHistory: addToLocalHistory } = useStore();
  const debounceRef = useRef<NodeJS.Timeout>();

  const addToHistory = useCallback(
    async (newsId: string, newsSlug: string, newsTitle: string) => {
      if (!user?.id) {
        console.log('useReadHistory: Usuário não autenticado');
        return Promise.reject(new Error('Usuário não autenticado'));
      }

      try {
        const cacheKey = `read_history_${user.id}`;
        const now = Timestamp.now();

        // Busca o histórico atual do cache ou do Firestore
        const cachedHistory = await cacheService.get<ReadHistoryItem[]>(
          cacheKey,
          async () => {
            const userRef = doc(db, 'users', user.id);
            const userDoc = await getDoc(userRef);
            return userDoc.exists() ? userDoc.data().readHistory || [] : [];
          },
          { ttl: READ_HISTORY_CACHE_TTL }
        );

        // Verifica se a notícia já existe no histórico
        const alreadyExists = cachedHistory.some(
          (item) => item.newsId === newsId
        );

        // Se a notícia já existe no histórico, não adiciona novamente
        if (alreadyExists) {
          console.log('useReadHistory: Notícia já existe no histórico', newsId);
          // Ainda atualiza o estado local para feedback imediato
          addToLocalHistory(newsId);
          return Promise.resolve(newsId);
        }

        console.log(
          'useReadHistory: Adicionando nova notícia ao histórico',
          newsId
        );

        // Cria o item do histórico
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

        // Adiciona ao cache pendente
        const pendingItems = pendingHistoryCache.get(user.id) || [];
        pendingItems.push(historyItem);
        pendingHistoryCache.set(user.id, pendingItems);

        // Atualiza o cache imediatamente para feedback rápido
        const updatedHistory = [historyItem, ...cachedHistory];
        await cacheService.set(cacheKey, updatedHistory, {
          ttl: READ_HISTORY_CACHE_TTL,
          useMemoryOnly: true,
        });

        // Debounce para atualizações no Firestore
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
          const pendingItems = pendingHistoryCache.get(user.id) || [];
          if (pendingItems.length === 0) return;

          try {
            const userRef = doc(db, 'users', user.id);

            // Tenta atualizar em lote
            try {
              await updateDoc(userRef, {
                readHistory: arrayUnion(...pendingItems),
              });
            } catch (error) {
              if (
                error instanceof Error &&
                error.message.includes('No document to update')
              ) {
                await setDoc(
                  userRef,
                  { readHistory: pendingItems },
                  { merge: true }
                );
              } else {
                throw error;
              }
            }

            // Limpa o cache pendente após sucesso
            pendingHistoryCache.set(user.id, []);
          } catch (error) {
            console.error('useReadHistory: Erro ao salvar em lote:', error);
          }
        }, READ_HISTORY_DEBOUNCE);

        // Atualiza o estado local
        addToLocalHistory(newsId);

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
