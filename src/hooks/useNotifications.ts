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
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Notification } from '@/types';
import useStore from '@/store/useStore';

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
   * Busca e monitora notificações do usuário em tempo real
   */
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const notificationsQuery = query(
      collection(db, 'user_notifications'),
      where('userId', '==', user.id),
      where('read', '==', false), // Apenas notificações não lidas
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        console.log('[Debug] Atualizando notificações:', {
          total: snapshot.docs.length,
          userId: user.id,
        });

        const notificationsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId,
            newsId: data.newsId,
            newsTitle: data.newsTitle,
            category: data.category,
            createdAt: new Date((data.createdAt as Timestamp).seconds * 1000),
            read: false, // Já sabemos que são não lidas pela query
            link: data.link,
          };
        }) as Notification[];

        setNotifications(notificationsData);
        setUnreadCount(notificationsData.length);
        setLoading(false);

        console.log('[Debug] Notificações atualizadas:', {
          total: notificationsData.length,
          notifications: notificationsData,
        });
      },
      (error) => {
        console.error('[Debug] Erro ao buscar notificações:', error);
        toast.error('Erro ao carregar notificações');
        setLoading(false);
      }
    );

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
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
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

      notifications
        .filter((n) => !n.read)
        .forEach((n) => {
          const ref = doc(db, 'user_notifications', n.id);
          batch.update(ref, { read: true });
        });

      await batch.commit();
      toast.success('Todas as notificações foram marcadas como lidas');
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error);
      toast.error('Erro ao atualizar notificações');
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
      console.log('[Debug] Iniciando criação de notificações:', {
        newsId,
        category,
        link,
      });

      // Busca usuários interessados na categoria
      const usersQuery = query(
        collection(db, 'users'),
        where('preferences.categories', 'array-contains', category)
      );

      const usersSnapshot = await getDocs(usersQuery);
      console.log('[Debug] Usuários encontrados:', {
        total: usersSnapshot.size,
        category,
      });

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
      console.log('[Debug] Notificações criadas com sucesso:', {
        total: usersSnapshot.size,
      });
    } catch (error) {
      console.error('[Debug] Erro ao criar notificações:', error);
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
