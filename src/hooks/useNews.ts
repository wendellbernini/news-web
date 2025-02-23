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
      if (!lastDoc) return;

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
    [lastDoc, news, setNews]
  );

  const getNewsById = async (id: string) => {
    try {
      const newsDoc = await getDoc(doc(db, 'news', id));
      if (newsDoc.exists()) {
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
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar notícia:', error);
      toast.error('Erro ao carregar notícia');
      return null;
    }
  };

  const addNews = async (newsData: Omit<News, 'id'>) => {
    try {
      console.log('[Debug] Iniciando criação de notícia:', {
        title: newsData.title,
        category: newsData.category,
        published: newsData.published,
      });

      const docRef = await addDoc(collection(db, 'news'), newsData);
      const newNews = { id: docRef.id, ...newsData };
      addNewsToStore(newNews);

      // Se a notícia for publicada, cria notificações para usuários interessados
      if (newsData.published) {
        console.log('[Debug] Notícia publicada, criando notificações', {
          newsId: docRef.id,
          category: newsData.category,
        });

        await createNotificationsForNews(
          docRef.id,
          newsData.title,
          newsData.category,
          `/noticias/${newsData.slug}`
        );
      }

      toast.success('Notícia criada com sucesso!');
      return newNews;
    } catch (error) {
      console.error('[Debug] Erro ao criar notícia:', error);
      toast.error('Erro ao criar notícia');
      return null;
    }
  };

  const updateNews = async (id: string, newsData: Partial<News>) => {
    try {
      const docRef = doc(db, 'news', id);
      const currentDoc = await getDoc(docRef);
      const currentData = currentDoc.data() as News;

      await updateDoc(docRef, newsData);
      updateNewsInStore({ id, ...newsData } as News);

      // Se a notícia foi publicada agora, cria notificações
      if (
        newsData.published &&
        !currentData.published &&
        currentData.category
      ) {
        await createNotificationsForNews(
          id,
          newsData.title || currentData.title,
          currentData.category,
          `/noticias/${currentData.slug}`
        );
      }

      toast.success('Notícia atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar notícia:', error);
      toast.error('Erro ao atualizar notícia');
    }
  };

  const deleteNews = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'news', id));
      deleteNewsFromStore(id);
      toast.success('Notícia excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir notícia:', error);
      toast.error('Erro ao excluir notícia');
    }
  };

  const searchNews = useCallback(
    async (searchQuery: string) => {
      console.log('[Debug] searchNews chamado com query:', searchQuery);

      // Se a query estiver vazia, apenas limpa os resultados
      if (!searchQuery.trim()) {
        console.log('[Debug] Query vazia, limpando resultados');
        setNews([]);
        return;
      }

      setLoading(true);
      try {
        console.log('[Debug] Iniciando busca no Firestore');
        // Nota: Esta é uma implementação básica de busca.
        // Para uma busca mais robusta, considere usar Algolia ou ElasticSearch
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

        // Filtra as notícias localmente
        const searchQueryLower = searchQuery.toLowerCase();
        const filteredNews = newsData.filter(
          (news) =>
            news.title.toLowerCase().includes(searchQueryLower) ||
            news.content.toLowerCase().includes(searchQueryLower)
        );

        // Só atualiza o estado se houver mudanças
        setNews(filteredNews);
      } catch (error) {
        console.error('Erro ao buscar notícias:', error);
        toast.error('Erro ao buscar notícias');
        setNews([]); // Limpa os resultados em caso de erro
      } finally {
        setLoading(false);
      }
    },
    [setNews, setLoading]
  );

  return {
    news,
    loading,
    fetchNews,
    fetchMoreNews,
    getNewsById,
    addNews,
    updateNews,
    deleteNews,
    searchNews,
    hasMore,
  };
};
