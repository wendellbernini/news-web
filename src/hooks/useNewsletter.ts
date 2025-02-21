'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
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
      const userRef = doc(db, 'users', user.id);
      const updatedPreferences = {
        subscribed: true,
        ...preferences,
      };

      // Atualiza no Firebase
      await updateDoc(userRef, {
        newsletter: updatedPreferences,
      });

      // Atualiza o estado local
      updateNewsletterPreferences(updatedPreferences);

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
      const userRef = doc(db, 'users', user.id);
      const updatedPreferences = {
        subscribed: false,
      };

      // Atualiza no Firebase
      await updateDoc(userRef, {
        newsletter: updatedPreferences,
      });

      // Atualiza o estado local
      updateNewsletterPreferences(updatedPreferences);

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
      const userRef = doc(db, 'users', user.id);
      const updatedPreferences = {
        ...user.newsletter,
        ...preferences,
      };

      // Atualiza no Firebase
      await updateDoc(userRef, {
        newsletter: updatedPreferences,
      });

      // Atualiza o estado local
      updateNewsletterPreferences(updatedPreferences);

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
