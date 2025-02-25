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
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { cacheService } from '@/lib/cache';

export function useReadingList() {
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
      const cacheKey = `saved_news_${user.id}`;

      const fetchFromFirestore = async () => {
        const savedNewsQuery = query(
          collection(db, 'savedNews'),
          where('userId', '==', user.id),
          where('status', '==', 'active')
        );

        const savedNewsSnapshot = await getDocs(savedNewsQuery);
        return savedNewsSnapshot.docs.map((doc) => doc.data().newsId);
      };

      // Usa o serviço de cache com TTL de 1 minuto para maior consistência
      const savedNewsIds = await cacheService.get(
        cacheKey,
        fetchFromFirestore,
        {
          ttl: 60, // 1 minuto
        }
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

  // Executa fetchSavedNews quando o componente monta e quando user.id muda
  useEffect(() => {
    if (user?.id) {
      fetchSavedNews();
    }
  }, [user?.id]);

  // Força uma atualização do estado após cada toggle
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (user?.id) {
        fetchSavedNews();
      }
    }, 500); // Pequeno delay para permitir que a operação anterior termine

    return () => clearTimeout(timeoutId);
  }, [user?.savedNews]);

  useEffect(() => {
    const fetchReadHistory = async () => {
      if (!user?.readHistory.length) {
        setReadHistory([]);
        setLoading(false);
        return;
      }

      try {
        // Pega apenas os 10 últimos itens do histórico
        const latestHistory = user.readHistory.slice(0, 10);

        // Busca cada notícia individualmente
        const newsPromises = latestHistory.map(async (item) => {
          const newsDoc = await getDoc(doc(db, 'news', item.newsId));
          if (!newsDoc.exists()) return null;
          return { id: newsDoc.id, ...newsDoc.data() } as News;
        });

        const newsResults = await Promise.all(newsPromises);
        const validNews = newsResults.filter((n): n is News => n !== null);

        setReadHistory(validNews);
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchReadHistory();
  }, [user?.readHistory]);

  const toggleSaveNews = async (newsId: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para salvar notícias');
      return;
    }

    const isSaved = user.savedNews.includes(newsId);
    const cacheKey = `saved_news_${user.id}`;

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
        const newSavedNews = user.savedNews.filter((id) => id !== newsId);
        setUser({
          ...user,
          savedNews: newSavedNews,
        });

        // Atualiza cache
        cacheService.set(cacheKey, newSavedNews);
      } else {
        // Salva no Firestore
        await addDoc(collection(db, 'savedNews'), {
          userId: user.id,
          newsId: newsId,
          status: 'active',
          createdAt: new Date(),
        });

        // Atualiza estado
        const newSavedNews = [...user.savedNews, newsId];
        setUser({
          ...user,
          savedNews: newSavedNews,
        });

        // Atualiza cache
        cacheService.set(cacheKey, newSavedNews);
      }

      toast.success(isSaved ? 'Notícia removida' : 'Notícia salva');
    } catch (error) {
      console.error('[useReadingList] Erro:', error);
      toast.error('Erro ao salvar/remover notícia');
    }
  };

  const addToHistory = async (newsId: string, progress = 0) => {
    if (!user) return;
    addToReadHistory(newsId, progress);
  };

  return {
    readHistory,
    loading,
    toggleSaveNews,
    addToHistory,
    isSaved: (newsId: string) => user?.savedNews.includes(newsId) || false,
  };
}
