import { useCallback } from 'react';
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

export function useReadHistory() {
  const { user } = useAuth();
  const { addToReadHistory: addToLocalHistory } = useStore();

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
          { ttl: 300 } // 5 minutos
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

        // Adiciona ao array readHistory do usuário
        try {
          console.log('DEBUG - Iniciando updateDoc...');
          const userRef = doc(db, 'users', user.id);
          await updateDoc(userRef, {
            readHistory: arrayUnion(historyItem),
          });
          console.log('DEBUG - updateDoc concluído com sucesso');

          // Atualiza o cache com o novo item
          const updatedHistory = [historyItem, ...cachedHistory];
          cacheService.set(cacheKey, updatedHistory);
        } catch (error) {
          console.error('DEBUG - Erro no updateDoc:', error);

          // Se o campo readHistory não existir, cria ele
          if (
            error instanceof Error &&
            error.message.includes('No document to update')
          ) {
            console.log('DEBUG - Criando campo readHistory...');
            const userRef = doc(db, 'users', user.id);
            await setDoc(
              userRef,
              { readHistory: [historyItem] },
              { merge: true }
            );
            console.log('DEBUG - Campo readHistory criado com sucesso');

            // Atualiza o cache
            cacheService.set(cacheKey, [historyItem]);
          } else {
            throw error;
          }
        }

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
