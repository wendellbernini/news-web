'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import useStore from '@/store/useStore';
import { NewsletterPreferences } from '@/types';

export const useNewsletter = () => {
  const { user, updateNewsletterPreferences } = useStore();
  const [loading, setLoading] = useState(false);

  const subscribe = async (preferences: Partial<NewsletterPreferences>) => {
    if (!user) {
      toast.error('Você precisa estar logado para se inscrever na newsletter');
      return false;
    }

    setLoading(true);

    try {
      // Aqui você implementaria a lógica de inscrição na newsletter
      // Por exemplo, enviando para uma API ou serviço de email
      await new Promise((resolve) => setTimeout(resolve, 1000));

      updateNewsletterPreferences({
        subscribed: true,
        ...preferences,
      });

      toast.success('Inscrição realizada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao se inscrever na newsletter:', error);
      toast.error('Erro ao se inscrever na newsletter');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para cancelar a inscrição');
      return false;
    }

    setLoading(true);

    try {
      // Aqui você implementaria a lógica de cancelamento da inscrição
      await new Promise((resolve) => setTimeout(resolve, 1000));

      updateNewsletterPreferences({
        subscribed: false,
      });

      toast.success('Inscrição cancelada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error);
      toast.error('Erro ao cancelar inscrição');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (
    preferences: Partial<NewsletterPreferences>
  ) => {
    if (!user) {
      toast.error('Você precisa estar logado para atualizar suas preferências');
      return false;
    }

    setLoading(true);

    try {
      // Aqui você implementaria a lógica de atualização das preferências
      await new Promise((resolve) => setTimeout(resolve, 1000));

      updateNewsletterPreferences(preferences);

      toast.success('Preferências atualizadas com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      toast.error('Erro ao atualizar preferências');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    subscribe,
    unsubscribe,
    updatePreferences,
    isSubscribed: user?.newsletter?.subscribed ?? false,
    preferences: user?.newsletter ?? {
      subscribed: false,
      frequency: 'weekly',
      categories: [],
    },
  };
};
