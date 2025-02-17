import { useState } from 'react';
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

  const fetchNews = async (category?: Category) => {
    setLoading(true);
    try {
      let newsQuery = query(
        collection(db, 'news'),
        where('published', '==', true),
        orderBy('createdAt', 'desc'),
        limit(ITEMS_PER_PAGE)
      );

      if (category) {
        newsQuery = query(
          collection(db, 'news'),
          where('published', '==', true),
          where('category', '==', category),
          orderBy('createdAt', 'desc'),
          limit(ITEMS_PER_PAGE)
        );
      }

      const snapshot = await getDocs(newsQuery);
      const news = snapshot.docs.map((doc) => {
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

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);
      setNews(news);
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
      toast.error('Erro ao carregar notícias');
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreNews = async (category?: Category) => {
    if (!lastDoc) return;

    setLoading(true);
    try {
      let newsQuery = query(
        collection(db, 'news'),
        where('published', '==', true),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(ITEMS_PER_PAGE)
      );

      if (category) {
        newsQuery = query(
          collection(db, 'news'),
          where('published', '==', true),
          where('category', '==', category),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(ITEMS_PER_PAGE)
        );
      }

      const snapshot = await getDocs(newsQuery);
      const moreNews = snapshot.docs.map((doc) => {
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

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);
      setNews([...news, ...moreNews]);
    } catch (error) {
      console.error('Erro ao buscar mais notícias:', error);
      toast.error('Erro ao carregar mais notícias');
    } finally {
      setLoading(false);
    }
  };

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
      const docRef = await addDoc(collection(db, 'news'), newsData);
      const newNews = { id: docRef.id, ...newsData };
      addNewsToStore(newNews);
      toast.success('Notícia criada com sucesso!');
      return newNews;
    } catch (error) {
      console.error('Erro ao adicionar notícia:', error);
      toast.error('Erro ao criar notícia');
      return null;
    }
  };

  const updateNews = async (id: string, newsData: Partial<News>) => {
    try {
      const docRef = doc(db, 'news', id);
      await updateDoc(docRef, newsData);
      updateNewsInStore({ id, ...newsData } as News);
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

  const searchNews = async (searchQuery: string) => {
    setLoading(true);
    try {
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

      const filteredNews = newsData.filter(
        (news) =>
          news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          news.content.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setNews(filteredNews);
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
      toast.error('Erro ao buscar notícias');
    } finally {
      setLoading(false);
    }
  };

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
