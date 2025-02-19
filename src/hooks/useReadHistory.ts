import { useCallback } from 'react';
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from './useAuth';
import useStore from '@/store/useStore';

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

        const userRef = doc(db, 'users', user.id);
        const userDoc = await getDoc(userRef);

        // Se o documento não existir, cria com os campos necessários
        if (!userDoc.exists()) {
          console.log('useReadHistory: Criando documento do usuário');
          await setDoc(userRef, {
            id: user.id,
            email: user.email,
            name: user.name,
            readHistory: [],
            createdAt: serverTimestamp(),
          });
        }

        // Verifica se a notícia já está no histórico
        const userData = userDoc.data();
        const readHistory = (userData?.readHistory || []) as ReadHistoryItem[];
        const alreadyRead = readHistory.some((item) => item.newsId === newsId);

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
          await updateDoc(userRef, {
            readHistory: arrayUnion(historyItem),
          });
          console.log('DEBUG - updateDoc concluído com sucesso');
        } catch (error) {
          console.error('DEBUG - Erro no updateDoc:', error);

          // Se o campo readHistory não existir, cria ele
          if (
            error instanceof Error &&
            error.message.includes('No document to update')
          ) {
            console.log('DEBUG - Criando campo readHistory...');
            await setDoc(
              userRef,
              { readHistory: [historyItem] },
              { merge: true }
            );
            console.log('DEBUG - Campo readHistory criado com sucesso');
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
