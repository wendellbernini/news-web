'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import useStore from '@/store/useStore';
import { Category, UserPreferences } from '@/types';

export const useUserPreferences = () => {
  const { user, updateUserPreferences } = useStore();
  const [loading, setLoading] = useState(false);

  const updateCategories = async (categories: Category[]) => {
    if (!user) {
      toast.error('Você precisa estar logado para atualizar suas preferências');
      return false;
    }

    setLoading(true);

    try {
      // Aqui você implementaria a lógica de atualização no backend
      await new Promise((resolve) => setTimeout(resolve, 1000));

      updateUserPreferences({ categories });
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

  const toggleDarkMode = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para alterar o tema');
      return false;
    }

    setLoading(true);

    try {
      // Aqui você implementaria a lógica de atualização no backend
      await new Promise((resolve) => setTimeout(resolve, 1000));

      updateUserPreferences({
        darkMode: !user.preferences.darkMode,
      });
      toast.success('Tema atualizado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar tema:', error);
      toast.error('Erro ao atualizar tema');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleEmailNotifications = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para alterar as notificações');
      return false;
    }

    setLoading(true);

    try {
      // Aqui você implementaria a lógica de atualização no backend
      await new Promise((resolve) => setTimeout(resolve, 1000));

      updateUserPreferences({
        emailNotifications: !user.preferences.emailNotifications,
      });
      toast.success('Preferências de notificação atualizadas com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar notificações:', error);
      toast.error('Erro ao atualizar notificações');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateAllPreferences = async (
    preferences: Partial<UserPreferences>
  ) => {
    if (!user) {
      toast.error('Você precisa estar logado para atualizar suas preferências');
      return false;
    }

    setLoading(true);

    try {
      // Aqui você implementaria a lógica de atualização no backend
      await new Promise((resolve) => setTimeout(resolve, 1000));

      updateUserPreferences(preferences);
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
    preferences: user?.preferences,
    updateCategories,
    toggleDarkMode,
    toggleEmailNotifications,
    updateAllPreferences,
  };
};
