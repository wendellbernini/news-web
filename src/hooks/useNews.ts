import { useState, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  where,
  getDoc,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { News, Category } from '@/types';
import useStore from '@/store/useStore';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'react-hot-toast';
import { cacheService } from '@/lib/cache';

const ITEMS_PER_PAGE = 10;

export const useNews = () => {
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const {
    news,
    setNews,
    addNews: addNewsToStore,
    updateNews: updateNewsInStore,
    deleteNews: deleteNewsFromStore,
  } = useStore();
  const { createNotificationsForNews } = useNotifications();

  const fetchNews = useCallback(
    async (category?: Category) => {
      setLoading(true);
      try {
        const cacheKey = `news_list_${category || 'all'}`;

        const fetchFromFirestore = async () => {
          const baseQuery = query(
            collection(db, 'news'),
            where('published', '==', true),
            orderBy('createdAt', 'desc'),
            limit(ITEMS_PER_PAGE)
          );

          const newsQuery = category
            ? query(baseQuery, where('category', '==', category))
            : baseQuery;

          const snapshot = await getDocs(newsQuery);
          const fetchedNews = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.seconds
              ? new Date(doc.data().createdAt.seconds * 1000)
              : new Date(),
            updatedAt: doc.data().updatedAt?.seconds
              ? new Date(doc.data().updatedAt.seconds * 1000)
              : new Date(),
          })) as News[];

          setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
          setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);

          return fetchedNews;
        };

        // Usa o serviço de cache com TTL de 5 minutos para lista de notícias
        const fetchedNews = await cacheService.get(
          cacheKey,
          fetchFromFirestore,
          {
            ttl: 300, // 5 minutos
          }
        );

        setNews(fetchedNews);
      } catch (error) {
        console.error('Erro ao buscar notícias:', error);
        toast.error('Erro ao carregar notícias');
      } finally {
        setLoading(false);
      }
    },
    [setNews]
  );

  const fetchMoreNews = useCallback(
    async (category?: Category) => {
      if (!lastDoc || !hasMore) return;

      setLoading(true);
      try {
        const baseQuery = query(
          collection(db, 'news'),
          where('published', '==', true),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(ITEMS_PER_PAGE)
        );

        const newsQuery = category
          ? query(baseQuery, where('category', '==', category))
          : baseQuery;

        const snapshot = await getDocs(newsQuery);
        const moreNews = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.seconds
            ? new Date(doc.data().createdAt.seconds * 1000)
            : new Date(),
          updatedAt: doc.data().updatedAt?.seconds
            ? new Date(doc.data().updatedAt.seconds * 1000)
            : new Date(),
        })) as News[];

        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);
        setNews([...news, ...moreNews]);
      } catch (error) {
        console.error('Erro ao buscar mais notícias:', error);
        toast.error('Erro ao carregar mais notícias');
      } finally {
        setLoading(false);
      }
    },
    [lastDoc, hasMore, setNews, news]
  );

  const getNewsById = useCallback(async (id: string): Promise<News | null> => {
    try {
      const cacheKey = `news_${id}`;

      const fetchFromFirestore = async () => {
        const newsDoc = await getDoc(doc(db, 'news', id));
        if (!newsDoc.exists()) return null;

        const data = newsDoc.data();
        return {
          id: newsDoc.id,
          ...data,
          createdAt: data.createdAt?.seconds
            ? new Date(data.createdAt.seconds * 1000)
            : new Date(),
          updatedAt: data.updatedAt?.seconds
            ? new Date(data.updatedAt.seconds * 1000)
            : new Date(),
        } as News;
      };

      // Usa o serviço de cache com TTL de 10 minutos para notícias individuais
      return await cacheService.get(cacheKey, fetchFromFirestore, {
        ttl: 600, // 10 minutos
      });
    } catch (error) {
      console.error('Erro ao buscar notícia:', error);
      toast.error('Erro ao carregar notícia');
      return null;
    }
  }, []);

  const searchNews = useCallback(
    async (searchQuery: string) => {
      console.log('[Debug] searchNews chamado com query:', searchQuery);

      if (!searchQuery.trim()) {
        console.log('[Debug] Query vazia, limpando resultados');
        setNews([]);
        return;
      }

      setLoading(true);
      try {
        const cacheKey = `search_${searchQuery.toLowerCase().trim()}`;

        const fetchFromFirestore = async () => {
          const newsQuery = query(
            collection(db, 'news'),
            where('published', '==', true),
            orderBy('title'),
            limit(20)
          );

          const snapshot = await getDocs(newsQuery);
          const newsData = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.seconds
                ? new Date(data.createdAt.seconds * 1000)
                : new Date(),
              updatedAt: data.updatedAt?.seconds
                ? new Date(data.updatedAt.seconds * 1000)
                : new Date(),
            };
          }) as News[];

          const searchQueryLower = searchQuery.toLowerCase();
          return newsData.filter(
            (news) =>
              news.title.toLowerCase().includes(searchQueryLower) ||
              news.content.toLowerCase().includes(searchQueryLower)
          );
        };

        // Usa o serviço de cache com TTL de 5 minutos para resultados de busca
        const results = await cacheService.get(cacheKey, fetchFromFirestore, {
          ttl: 300, // 5 minutos
          useMemoryOnly: true, // Usa apenas cache em memória para buscas
        });

        setNews(results);
      } catch (error) {
        console.error('Erro ao buscar notícias:', error);
        toast.error('Erro ao buscar notícias');
        setNews([]);
      } finally {
        setLoading(false);
      }
    },
    [setNews]
  );

  const createNews = useCallback(
    async (newsData: Omit<News, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const docRef = await addDoc(collection(db, 'news'), {
          ...newsData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const newNews: News = {
          id: docRef.id,
          ...newsData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        addNewsToStore(newNews);
        await createNotificationsForNews(
          newNews.id,
          newNews.title,
          newNews.category,
          `/noticias/${newNews.slug}`
        );

        // Invalida caches relacionados
        cacheService.remove('news_list_all');
        if (newsData.category) {
          cacheService.remove(`news_list_${newsData.category}`);
        }

        return newNews;
      } catch (error) {
        console.error('Erro ao criar notícia:', error);
        toast.error('Erro ao criar notícia');
        throw error;
      }
    },
    [addNewsToStore, createNotificationsForNews]
  );

  const updateNews = useCallback(
    async (id: string, newsData: Partial<News>) => {
      try {
        const newsRef = doc(db, 'news', id);
        await updateDoc(newsRef, {
          ...newsData,
          updatedAt: new Date(),
        });

        const updatedNews = {
          id,
          ...newsData,
          updatedAt: new Date(),
        } as News;

        updateNewsInStore(updatedNews);

        // Invalida caches relacionados
        cacheService.remove(`news_${id}`);
        cacheService.remove('news_list_all');
        if (newsData.category) {
          cacheService.remove(`news_list_${newsData.category}`);
        }

        return updatedNews;
      } catch (error) {
        console.error('Erro ao atualizar notícia:', error);
        toast.error('Erro ao atualizar notícia');
        throw error;
      }
    },
    [updateNewsInStore]
  );

  const deleteNews = useCallback(
    async (id: string) => {
      try {
        await deleteDoc(doc(db, 'news', id));
        deleteNewsFromStore(id);

        // Invalida caches relacionados
        cacheService.remove(`news_${id}`);
        cacheService.remove('news_list_all');
        // Não podemos invalidar por categoria pois não temos acesso à categoria da notícia aqui
        // Uma alternativa seria buscar a notícia antes de deletar para saber a categoria

        return id;
      } catch (error) {
        console.error('Erro ao deletar notícia:', error);
        toast.error('Erro ao deletar notícia');
        throw error;
      }
    },
    [deleteNewsFromStore]
  );

  return {
    news,
    loading,
    hasMore,
    fetchNews,
    fetchMoreNews,
    getNewsById,
    searchNews,
    addNews: createNews,
    updateNews,
    deleteNews,
  };
};
