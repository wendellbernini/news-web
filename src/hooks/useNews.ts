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
  doc,
  where,
  getDoc,
  QueryDocumentSnapshot,
  DocumentData,
  DocumentSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { News, Category } from '@/types';
import useStore from '@/store/useStore';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'react-hot-toast';
import { cacheService } from '@/lib/cache';

const ITEMS_PER_PAGE = 10;
const CACHE_TTL = 300; // 5 minutos

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
          const fetchedNews = snapshot.docs.map(
            (doc: DocumentSnapshot<DocumentData>) => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data()?.createdAt?.seconds
                ? new Date(doc.data()?.createdAt.seconds * 1000)
                : new Date(),
              updatedAt: doc.data()?.updatedAt?.seconds
                ? new Date(doc.data()?.updatedAt.seconds * 1000)
                : new Date(),
            })
          ) as News[];

          setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
          setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);

          return fetchedNews;
        };

        const newsData = await cacheService.get(cacheKey, fetchFromFirestore, {
          ttl: CACHE_TTL,
        });

        setNews(newsData);
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
        const moreNews = snapshot.docs.map(
          (doc: DocumentSnapshot<DocumentData>) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data()?.createdAt?.seconds
              ? new Date(doc.data()?.createdAt.seconds * 1000)
              : new Date(),
            updatedAt: doc.data()?.updatedAt?.seconds
              ? new Date(doc.data()?.updatedAt.seconds * 1000)
              : new Date(),
          })
        ) as News[];

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
    [lastDoc, hasMore, news, setNews]
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
      if (!searchQuery.trim()) {
        setNews([]);
        return;
      }

      setLoading(true);
      try {
        const searchQueryLower = searchQuery.toLowerCase().trim();
        const cacheKey = `search_${searchQueryLower}`;

        const fetchFromFirestore = async () => {
          const newsQuery = query(
            collection(db, 'news'),
            where('published', '==', true),
            orderBy('createdAt', 'desc'),
            limit(100)
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

          return newsData
            .filter((news) => {
              const titleMatch = news.title
                .toLowerCase()
                .includes(searchQueryLower);
              if (titleMatch) return true;

              const contentPreview = news.content.slice(0, 1000).toLowerCase();
              return contentPreview.includes(searchQueryLower);
            })
            .slice(0, 20);
        };

        const results = await cacheService.get(cacheKey, fetchFromFirestore, {
          ttl: 600,
          useMemoryOnly: true,
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
        // Inicia uma transação em lote
        const batch = writeBatch(db);

        // 1. Busca todas as notificações relacionadas à notícia
        const notificationsQuery = query(
          collection(db, 'user_notifications'),
          where('newsId', '==', id)
        );
        const notificationsSnapshot = await getDocs(notificationsQuery);

        // 2. Adiciona operações de exclusão das notificações ao batch
        notificationsSnapshot.docs.forEach((notificationDoc) => {
          batch.delete(notificationDoc.ref);
        });

        // 3. Adiciona operação de exclusão da notícia ao batch
        batch.delete(doc(db, 'news', id));

        // 4. Executa todas as operações de forma atômica
        await batch.commit();

        // 5. Atualiza o estado local e limpa os caches
        deleteNewsFromStore(id);
        cacheService.remove(`news_${id}`);
        cacheService.remove('news_list_all');

        // 6. Limpa o cache de notificações para todos os usuários afetados
        const affectedUserIds = new Set(
          notificationsSnapshot.docs.map((doc) => doc.data().userId)
        );
        affectedUserIds.forEach((userId) => {
          cacheService.remove(`notifications_${userId}`);
        });

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
