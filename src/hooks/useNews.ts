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
const PREFETCH_CATEGORIES = ['tecnologia', 'politica', 'economia']; // Categorias mais acessadas
const AGGRESSIVE_CACHE_TTL = 1800; // 30 minutos para cache agressivo
const BATCH_SIZE = 20;

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

  const updateNewsList = (updater: (currentNews: News[]) => News[]) => {
    const updated = updater(news);
    setNews(updated);
  };

  // Prefetch de dados em background
  const prefetchRelatedData = useCallback(async (newsItems: News[]) => {
    const promises = newsItems.map(async (news) => {
      const detailsCacheKey = `news_details_${news.id}`;
      return cacheService.get(
        detailsCacheKey,
        async () => {
          // Busca dados relacionados em batch
          const [comments, views] = await Promise.all([
            getDoc(doc(db, 'news_comments_count', news.id)),
            getDoc(doc(db, 'news_views', news.id)),
          ]);

          return {
            commentsCount: comments.exists() ? comments.data()?.count || 0 : 0,
            viewsCount: views.exists() ? views.data()?.count || 0 : 0,
          };
        },
        { ttl: AGGRESSIVE_CACHE_TTL, useMemoryOnly: true }
      );
    });

    await Promise.all(promises);
  }, []);

  // Cache agressivo para categorias principais
  const prefetchCategoryData = useCallback(async () => {
    const promises = PREFETCH_CATEGORIES.map(async (category) => {
      const cacheKey = `news_list_${category}`;
      return cacheService.get(
        cacheKey,
        async () => {
          const newsQuery = query(
            collection(db, 'news'),
            where('published', '==', true),
            where('category', '==', category),
            orderBy('createdAt', 'desc'),
            limit(BATCH_SIZE)
          );

          const snapshot = await getDocs(newsQuery);
          return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.seconds
              ? new Date(doc.data().createdAt.seconds * 1000)
              : new Date(),
            updatedAt: doc.data().updatedAt?.seconds
              ? new Date(doc.data().updatedAt.seconds * 1000)
              : new Date(),
          })) as News[];
        },
        { ttl: AGGRESSIVE_CACHE_TTL }
      );
    });

    const results = await Promise.all(promises);
    results.flat().forEach((news) => {
      const cacheKey = `news_${news.id}`;
      cacheService.set(cacheKey, news, { ttl: AGGRESSIVE_CACHE_TTL });
    });
  }, []);

  const fetchNews = useCallback(
    async (category?: Category) => {
      setLoading(true);
      try {
        const cacheKey = `news_list_${category || 'all'}`;
        const stateKey = `news_state_${category || 'all'}`;

        const fetchFromFirestore = async () => {
          const baseQuery = query(
            collection(db, 'news'),
            where('published', '==', true),
            orderBy('createdAt', 'desc'),
            limit(BATCH_SIZE)
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

          const hasMore = snapshot.docs.length === BATCH_SIZE;
          setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
          setHasMore(hasMore);

          // Cache agressivo
          await cacheService.set(
            stateKey,
            {
              news: fetchedNews,
              hasMore,
              timestamp: Date.now(),
            },
            { useMemoryOnly: true }
          );

          // Prefetch em background
          prefetchRelatedData(fetchedNews);
          if (!category) {
            prefetchCategoryData();
          }

          return fetchedNews;
        };

        // Tenta recuperar do cache agressivo primeiro
        const savedState = await cacheService.get<{
          news: News[];
          hasMore: boolean;
          timestamp: number;
        } | null>(stateKey, async () => null, { useMemoryOnly: true });

        // Se tiver estado salvo e for recente (menos de 5 minutos), usa ele
        if (savedState && Date.now() - savedState.timestamp < 300000) {
          setNews(savedState.news);
          setHasMore(savedState.hasMore);
          setLoading(false);

          // Atualiza dados em background
          prefetchRelatedData(savedState.news);
          if (!category) {
            prefetchCategoryData();
          }

          // Atualiza em background
          fetchFromFirestore().then((freshNews) => {
            if (JSON.stringify(freshNews) !== JSON.stringify(savedState.news)) {
              updateNewsList(() => freshNews);
            }
          });

          return;
        }

        const fetchedNews = await cacheService.get(
          cacheKey,
          fetchFromFirestore,
          {
            ttl: AGGRESSIVE_CACHE_TTL,
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
    [setNews, updateNewsList, prefetchRelatedData, prefetchCategoryData]
  );

  const fetchMoreNews = useCallback(
    async (category?: Category) => {
      if (!lastDoc || !hasMore) return;

      setLoading(true);
      try {
        const pageKey = `${category || 'all'}_page_${news.length / ITEMS_PER_PAGE + 1}`;
        const cacheKey = `news_list_${pageKey}`;

        const fetchFromFirestore = async () => {
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

          // Processa os documentos em batch para melhor performance
          const moreNews = await Promise.all(
            snapshot.docs.map(async (doc) => {
              const data = doc.data();
              const newsItem = {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.seconds
                  ? new Date(data.createdAt.seconds * 1000)
                  : new Date(),
                updatedAt: data.updatedAt?.seconds
                  ? new Date(data.updatedAt.seconds * 1000)
                  : new Date(),
              } as News;

              // Usa cache local para dados complementares
              const detailsCacheKey = `news_details_${doc.id}`;
              const cachedDetails = await cacheService.get(
                detailsCacheKey,
                async () => ({}),
                { useMemoryOnly: true }
              );

              return { ...newsItem, ...cachedDetails };
            })
          );

          setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
          setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);

          return moreNews;
        };

        // Cache com TTL menor para páginas subsequentes
        const moreNews = await cacheService.get(cacheKey, fetchFromFirestore, {
          ttl: 600, // 10 minutos para páginas subsequentes
          useMemoryOnly: true, // Usa apenas memória para reduzir overhead
        });

        updateNewsList((currentNews) => {
          const newIds = new Set(moreNews.map((n) => n.id));
          const filteredCurrent = currentNews.filter((n) => !newIds.has(n.id));
          return [...filteredCurrent, ...moreNews];
        });
      } catch (error) {
        console.error('Erro ao buscar mais notícias:', error);
        toast.error('Erro ao carregar mais notícias');
      } finally {
        setLoading(false);
      }
    },
    [lastDoc, hasMore, news.length, setNews]
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
      if (!searchQuery.trim()) {
        setNews([]);
        return;
      }

      setLoading(true);
      try {
        const searchQueryLower = searchQuery.toLowerCase().trim();
        const cacheKey = `search_${searchQueryLower}`;

        const fetchFromFirestore = async () => {
          // Limita a busca aos últimos 100 artigos para melhor performance
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

          // Filtra localmente usando índices de texto para melhor performance
          return newsData
            .filter((news) => {
              const titleMatch = news.title
                .toLowerCase()
                .includes(searchQueryLower);
              if (titleMatch) return true;

              // Só verifica o conteúdo se não encontrou no título
              const contentPreview = news.content.slice(0, 1000).toLowerCase();
              return contentPreview.includes(searchQueryLower);
            })
            .slice(0, 20); // Limita a 20 resultados
        };

        const results = await cacheService.get(cacheKey, fetchFromFirestore, {
          ttl: 600, // 10 minutos de cache para buscas
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
