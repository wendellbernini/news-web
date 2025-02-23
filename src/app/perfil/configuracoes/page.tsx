'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Category } from '@/types';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import useStore from '@/store/useStore';

const categories: Category[] = [
  'Tecnologia',
  'Esportes',
  'Política',
  'Economia',
  'Entretenimento',
  'Saúde',
  'Educação',
  'Ciência',
];

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { user } = useStore();
  const {
    loading: prefsLoading,
    preferences,
    updateCategories,
    toggleDarkMode,
    toggleEmailNotifications,
  } = useUserPreferences();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user || !preferences) {
    return null;
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold">Configurações</h1>

        {/* Notificações */}
        <section className="mb-8 rounded-lg border border-secondary-200 p-6 dark:border-secondary-800">
          <h2 className="mb-4 text-xl font-semibold">Notificações</h2>

          <div className="space-y-6">
            {/* Email */}
            <div>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={toggleEmailNotifications}
                  disabled={prefsLoading}
                  className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-600"
                />
                <span>Receber notificações por email</span>
              </label>
            </div>

            {/* Categorias de Interesse */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-secondary-700 dark:text-secondary-300">
                Categorias para Receber Notificações
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {categories.map((category) => (
                  <label
                    key={category}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      checked={preferences.categories.includes(category)}
                      onChange={() => {
                        const newCategories = preferences.categories.includes(
                          category
                        )
                          ? preferences.categories.filter((c) => c !== category)
                          : [...preferences.categories, category];
                        updateCategories(newCategories);
                      }}
                      disabled={prefsLoading}
                      className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-600"
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-secondary-600 dark:text-secondary-400">
                Você receberá notificações de novas notícias nas categorias
                selecionadas
              </p>
            </div>
          </div>
        </section>

        {/* Tema */}
        <section className="rounded-lg border border-secondary-200 p-6 dark:border-secondary-800">
          <h2 className="mb-4 text-xl font-semibold">Tema</h2>
          <div className="space-y-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={preferences.darkMode}
                onChange={toggleDarkMode}
                disabled={prefsLoading}
                className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-600"
              />
              <span>Modo escuro</span>
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}
