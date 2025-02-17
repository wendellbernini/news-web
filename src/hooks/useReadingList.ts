'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import useStore from '@/store/useStore';
import { News } from '@/types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export const useReadingList = () => {
  const { user, saveNews, unsaveNews, addToReadHistory } = useStore();
  const [savedNewsList, setSavedNewsList] = useState<News[]>([]);
  const [readHistory, setReadHistory] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  // Carrega as notícias salvas
  useEffect(() => {
    const fetchSavedNews = async () => {
      if (!user?.savedNews.length) {
        setSavedNewsList([]);
        setLoading(false);
        return;
      }

      try {
        const newsQuery = query(
          collection(db, 'news'),
          where('id', 'in', user.savedNews)
        );

        const snapshot = await getDocs(newsQuery);
        const newsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as News[];

        setSavedNewsList(newsData);
      } catch (error) {
        console.error('Erro ao carregar notícias salvas:', error);
        toast.error('Erro ao carregar notícias salvas');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedNews();
  }, [user?.savedNews]);

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
        unsaveNews(newsId);
        setSavedNewsList((prev) => prev.filter((news) => news.id !== newsId));
        toast.success('Notícia removida dos salvos');
      } else {
        saveNews(newsId);
        // Busca os detalhes da notícia se ainda não estiver na lista
        if (!savedNewsList.find((news) => news.id === newsId)) {
          const newsDoc = await getDocs(
            query(collection(db, 'news'), where('id', '==', newsId))
          );
          if (!newsDoc.empty) {
            const newsData = {
              id: newsDoc.docs[0].id,
              ...newsDoc.docs[0].data(),
            } as News;
            setSavedNewsList((prev) => [...prev, newsData]);
          }
        }
        toast.success('Notícia salva com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar/remover notícia:', error);
      toast.error('Erro ao salvar/remover notícia');
    }
  };

  const updateReadProgress = (newsId: string, progress: number) => {
    if (!user) return;

    addToReadHistory(newsId, progress);
  };

  return {
    loading,
    savedNews: savedNewsList,
    readHistory,
    toggleSaveNews,
    updateReadProgress,
    isSaved: (newsId: string) => user?.savedNews.includes(newsId) || false,
  };
};
