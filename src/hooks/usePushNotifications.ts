'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import useStore from '@/store/useStore';

export const usePushNotifications = () => {
  const [permission, setPermission] =
    useState<NotificationPermission>('default');
  const { user, updatePushNotifications } = useStore();

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Seu navegador não suporta notificações push');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        updatePushNotifications({ enabled: true });
        toast.success('Notificações ativadas com sucesso!');
        return true;
      } else {
        updatePushNotifications({ enabled: false });
        toast.error('Permissão para notificações negada');
        return false;
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      toast.error('Erro ao ativar notificações');
      return false;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (
      !('Notification' in window) ||
      Notification.permission !== 'granted' ||
      !user?.pushNotifications.enabled
    ) {
      return;
    }

    try {
      new Notification(title, {
        icon: '/images/logo.png',
        badge: '/images/logo.png',
        ...options,
      });
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    }
  };

  return {
    permission,
    requestPermission,
    sendNotification,
    isSupported: 'Notification' in window,
    isEnabled: permission === 'granted' && user?.pushNotifications.enabled,
  };
};
