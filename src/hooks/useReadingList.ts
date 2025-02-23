'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import useStore from '@/store/useStore';
import { News } from '@/types';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export const useReadingList = () => {
  const { user, addToReadHistory, setUser } = useStore();
  const [readHistory, setReadHistory] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para carregar notícias salvas
  const fetchSavedNews = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const savedNewsQuery = query(
        collection(db, 'savedNews'),
        where('userId', '==', user.id),
        where('status', '==', 'active')
      );

      const savedNewsSnapshot = await getDocs(savedNewsQuery);
      const savedNewsIds = savedNewsSnapshot.docs.map(
        (doc) => doc.data().newsId
      );

      // Atualiza o estado apenas se houver mudança
      if (JSON.stringify(user.savedNews) !== JSON.stringify(savedNewsIds)) {
        setUser({
          ...user,
          savedNews: savedNewsIds,
        });
      }
    } catch (error) {
      console.error('[useReadingList] Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchSavedNews();
    }
  }, [user?.id]);

  // Carrega o histórico de leitura
  useEffect(() => {
    const fetchReadHistory = async () => {
      if (!user?.readHistory.length) {
        setReadHistory([]);
        return;
      }

      try {
        const newsIds = user.readHistory.map((item) => item.newsId);
        const newsQuery = query(
          collection(db, 'news'),
          where('id', 'in', newsIds)
        );

        const snapshot = await getDocs(newsQuery);
        const newsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as News[];

        // Ordena as notícias na mesma ordem do histórico
        const orderedNews = user.readHistory
          .map((historyItem) =>
            newsData.find((news) => news.id === historyItem.newsId)
          )
          .filter((news): news is News => news !== undefined);

        setReadHistory(orderedNews);
      } catch (error) {
        console.error('Erro ao carregar histórico de leitura:', error);
        toast.error('Erro ao carregar histórico de leitura');
      }
    };

    fetchReadHistory();
  }, [user?.readHistory]);

  const toggleSaveNews = async (newsId: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para salvar notícias');
      return;
    }

    const isSaved = user.savedNews.includes(newsId);

    try {
      if (isSaved) {
        // Remove do Firestore
        const savedNewsQuery = query(
          collection(db, 'savedNews'),
          where('userId', '==', user.id),
          where('newsId', '==', newsId)
        );

        const snapshot = await getDocs(savedNewsQuery);
        await Promise.all(snapshot.docs.map((doc) => deleteDoc(doc.ref)));

        // Atualiza estado
        setUser({
          ...user,
          savedNews: user.savedNews.filter((id) => id !== newsId),
        });
      } else {
        // Salva no Firestore
        await addDoc(collection(db, 'savedNews'), {
          userId: user.id,
          newsId: newsId,
          status: 'active',
          createdAt: new Date(),
        });

        // Atualiza estado
        setUser({
          ...user,
          savedNews: [...user.savedNews, newsId],
        });
      }

      toast.success(isSaved ? 'Notícia removida' : 'Notícia salva');
    } catch (error) {
      console.error('[useReadingList] Erro:', error);
      toast.error('Erro ao salvar/remover notícia');
    }
  };

  const updateReadProgress = (newsId: string, progress: number) => {
    if (!user) return;

    addToReadHistory(newsId, progress);
  };

  return {
    loading,
    readHistory,
    toggleSaveNews,
    updateReadProgress,
    isSaved: (newsId: string) => user?.savedNews.includes(newsId) || false,
  };
};
