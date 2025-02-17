'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Category } from '@/types';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useNewsletter } from '@/hooks/useNewsletter';
import { usePushNotifications } from '@/hooks/usePushNotifications';
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

const frequencies = [
  { value: 'daily', label: 'Diária' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
];

export default function PreferencesPage() {
  const router = useRouter();
  const { user } = useStore();
  const {
    loading: prefsLoading,
    preferences,
    updateCategories,
    toggleDarkMode,
    toggleEmailNotifications,
  } = useUserPreferences();

  const {
    loading: newsletterLoading,
    isSubscribed,
    preferences: newsletterPrefs,
    subscribe,
    unsubscribe,
    updatePreferences,
  } = useNewsletter();

  const { isSupported, isEnabled, permission, requestPermission } =
    usePushNotifications();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user || !preferences || !newsletterPrefs) {
    return null;
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold">Preferências</h1>

        {/* Categorias */}
        <section className="mb-8 rounded-lg border border-secondary-200 p-6 dark:border-secondary-800">
          <h2 className="mb-4 text-xl font-semibold">
            Categorias de Interesse
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {categories.map((category) => (
              <label
                key={category}
                className="flex cursor-pointer items-center gap-2"
              >
                <input
                  type="checkbox"
                  checked={preferences.categories.includes(category)}
                  onChange={(e) => {
                    const newCategories = e.target.checked
                      ? [...preferences.categories, category]
                      : preferences.categories.filter((c) => c !== category);
                    updateCategories(newCategories);
                  }}
                  className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-600"
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Newsletter */}
        <section className="mb-8 rounded-lg border border-secondary-200 p-6 dark:border-secondary-800">
          <h2 className="mb-4 text-xl font-semibold">Newsletter</h2>
          <div className="space-y-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={isSubscribed}
                onChange={() => {
                  if (isSubscribed) {
                    unsubscribe();
                  } else {
                    subscribe({
                      frequency: 'weekly',
                      categories: preferences.categories,
                    });
                  }
                }}
                disabled={newsletterLoading}
                className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-600"
              />
              <span>Receber newsletter</span>
            </label>

            {isSubscribed && (
              <div className="ml-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Frequência
                  </label>
                  <select
                    value={newsletterPrefs.frequency}
                    onChange={(e) =>
                      updatePreferences({
                        frequency: e.target.value as
                          | 'daily'
                          | 'weekly'
                          | 'monthly',
                      })
                    }
                    disabled={newsletterLoading}
                    className="w-full rounded-md border border-secondary-200 bg-white px-3 py-2 text-sm focus:border-primary-600 focus:outline-none dark:border-secondary-800 dark:bg-secondary-950"
                  >
                    {frequencies.map((freq) => (
                      <option key={freq.value} value={freq.value}>
                        {freq.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Notificações */}
        <section className="mb-8 rounded-lg border border-secondary-200 p-6 dark:border-secondary-800">
          <h2 className="mb-4 text-xl font-semibold">Notificações</h2>
          <div className="space-y-4">
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

            {isSupported && (
              <div>
                <Button
                  onClick={requestPermission}
                  disabled={permission === 'denied'}
                  variant={isEnabled ? 'secondary' : 'default'}
                >
                  {isEnabled
                    ? 'Notificações push ativadas'
                    : 'Ativar notificações push'}
                </Button>
                {permission === 'denied' && (
                  <p className="mt-2 text-sm text-red-600">
                    Você bloqueou as notificações. Para ativá-las, altere as
                    permissões do site no seu navegador.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Tema */}
        <section className="rounded-lg border border-secondary-200 p-6 dark:border-secondary-800">
          <h2 className="mb-4 text-xl font-semibold">Aparência</h2>
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
