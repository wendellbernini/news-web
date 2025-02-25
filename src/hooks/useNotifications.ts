'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
  Timestamp,
  writeBatch,
  limit,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Notification } from '@/types';
import useStore from '@/store/useStore';
import { cacheService } from '@/lib/cache';

const NOTIFICATIONS_DEBOUNCE = 5000; // 5 segundos
const NOTIFICATIONS_CACHE_TTL = 300; // 5 minutos

/**
 * Hook para gerenciar notificações do usuário
 * @returns Objeto com estado e funções para gerenciar notificações
 */
export const useNotifications = () => {
  // Estado local para notificações
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useStore();

  const processNotification = async (
    docRef: any
  ): Promise<Notification | null> => {
    const data = docRef.data();

    try {
      // Verifica se a notícia ainda existe
      const newsRef = doc(db, 'news', data.newsId);
      const newsDoc = await getDoc(newsRef);

      if (!newsDoc.exists()) {
        // Se a notícia não existe mais, marca como lida para remover da lista
        await updateDoc(docRef.ref, { read: true });
        return null;
      }

      return {
        id: docRef.id,
        userId: data.userId,
        newsId: data.newsId,
        newsTitle: data.newsTitle,
        category: data.category,
        createdAt: new Date((data.createdAt as Timestamp).seconds * 1000),
        read: false,
        link: data.link,
      };
    } catch (error) {
      console.error('[Notifications] Erro ao processar notificação:', error);
      return null;
    }
  };

  /**
   * Cria uma query para buscar notificações não lidas do usuário
   */
  const createNotificationsQuery = (userId: string) => {
    return query(
      collection(db, 'user_notifications'),
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
  };

  /**
   * Busca e monitora notificações do usuário em tempo real
   */
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const notificationsQuery = createNotificationsQuery(user.id);
    const cacheKey = `notifications_${user.id}`;
    let debounceTimer: NodeJS.Timeout;

    const unsubscribe = onSnapshot(
      notificationsQuery,
      async (snapshot) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
          try {
            // Processa todas as notificações em paralelo
            const results = await Promise.all(
              snapshot.docs.map(processNotification)
            );

            // Filtra notificações válidas
            const validNotifications = results.filter(
              (n): n is Notification => n !== null
            );

            await cacheService.set(cacheKey, validNotifications, {
              ttl: NOTIFICATIONS_CACHE_TTL,
              useMemoryOnly: true,
            });

            setNotifications(validNotifications);
            setUnreadCount(validNotifications.length);
          } catch (error) {
            console.error(
              '[Notifications] Erro ao processar notificações:',
              error
            );
          } finally {
            setLoading(false);
          }
        }, NOTIFICATIONS_DEBOUNCE);
      },
      (error) => {
        console.error('[Notifications] Erro ao buscar notificações:', error);
        toast.error('Erro ao carregar notificações');
        setLoading(false);
      }
    );

    const fetchFromFirestore = async () => {
      const snapshot = await getDocs(notificationsQuery);
      const results = await Promise.all(snapshot.docs.map(processNotification));
      return results.filter((n): n is Notification => n !== null);
    };

    cacheService.get(cacheKey, fetchFromFirestore).then((cachedData) => {
      if (cachedData) {
        setNotifications(cachedData);
        setUnreadCount(cachedData.length);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user?.id]);

  /**
   * Marca uma notificação como lida
   * @param notificationId ID da notificação
   */
  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const notificationRef = doc(db, 'user_notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
      });

      // Atualiza o cache após marcar como lida
      const cacheKey = `notifications_${user.id}`;
      const updatedNotifications = notifications.filter(
        (n) => n.id !== notificationId
      );
      await cacheService.set(cacheKey, updatedNotifications);
    } catch (error) {
      console.error(
        '[Notifications] Erro ao marcar notificação como lida:',
        error
      );
      toast.error('Erro ao atualizar notificação');
    }
  };

  /**
   * Marca todas as notificações como lidas
   */
  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const batch = writeBatch(db);
      const notificationIds = notifications
        .filter((n) => !n.read)
        .map((n) => n.id);

      setNotifications([]);
      setUnreadCount(0);
      const cacheKey = `notifications_${user.id}`;
      await cacheService.set(cacheKey, []);

      notificationIds.forEach((id) => {
        const ref = doc(db, 'user_notifications', id);
        batch.update(ref, { read: true });
      });

      await batch.commit();
      toast.success('Todas as notificações foram marcadas como lidas');
    } catch (error) {
      console.error(
        '[Notifications] Erro ao marcar todas notificações como lidas:',
        error
      );
      toast.error('Erro ao atualizar notificações');

      const snapshot = await getDocs(createNotificationsQuery(user.id));
      const results = await Promise.all(snapshot.docs.map(processNotification));
      const validNotifications = results.filter(
        (n): n is Notification => n !== null
      );
      setNotifications(validNotifications);
      setUnreadCount(validNotifications.length);
    }
  };

  const createNotificationsForNews = async (
    newsId: string,
    newsTitle: string,
    category: string,
    link: string
  ) => {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('preferences.categories', 'array-contains', category)
      );

      const usersSnapshot = await getDocs(usersQuery);
      const batch = writeBatch(db);
      const notificationsRef = collection(db, 'user_notifications');

      usersSnapshot.docs.forEach((userDoc) => {
        const notificationRef = doc(notificationsRef);
        batch.set(notificationRef, {
          userId: userDoc.id,
          newsId,
          newsTitle,
          category,
          createdAt: new Date(),
          read: false,
          link,
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('[Notifications] Erro ao criar notificações:', error);
      toast.error('Erro ao enviar notificações');
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    createNotificationsForNews,
  };
};
