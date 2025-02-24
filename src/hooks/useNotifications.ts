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

  /**
   * Converte um documento do Firestore em uma notificação
   * @param doc Documento do Firestore
   * @returns Objeto de notificação formatado
   */
  const mapNotificationDoc = (doc: any): Notification => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      newsId: data.newsId,
      newsTitle: data.newsTitle,
      category: data.category,
      createdAt: new Date((data.createdAt as Timestamp).seconds * 1000),
      read: false,
      link: data.link,
    };
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
          const notificationsData = snapshot.docs.map(mapNotificationDoc);
          await cacheService.set(cacheKey, notificationsData, {
            ttl: NOTIFICATIONS_CACHE_TTL,
            useMemoryOnly: true,
          });
          setNotifications(notificationsData);
          setUnreadCount(notificationsData.length);
          setLoading(false);
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
      return snapshot.docs.map(mapNotificationDoc);
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
      const notificationsData = snapshot.docs.map(mapNotificationDoc);
      setNotifications(notificationsData);
      setUnreadCount(notificationsData.length);
    }
  };

  /**
   * Cria notificações para usuários interessados em uma categoria
   * @param newsId ID da notícia
   * @param newsTitle Título da notícia
   * @param category Categoria da notícia
   */
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
