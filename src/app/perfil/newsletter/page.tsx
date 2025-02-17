'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import useStore from '@/store/useStore';
import { useNewsletter } from '@/hooks/useNewsletter';
import { Category } from '@/types';

const frequencies = [
  { value: 'daily', label: 'Diária' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
];

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

export default function NewsletterPage() {
  const router = useRouter();
  const { user } = useStore();
  const {
    loading,
    isSubscribed,
    preferences,
    subscribe,
    unsubscribe,
    updatePreferences,
  } = useNewsletter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="container flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Acesso Restrito</h1>
          <p className="mb-4 text-secondary-600 dark:text-secondary-400">
            Faça login para gerenciar sua newsletter
          </p>
          <Button onClick={() => router.push('/login')}>Fazer Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <Mail className="h-6 w-6 text-primary-600" />
          <h1 className="text-3xl font-bold">Newsletter</h1>
        </div>

        <section className="mb-8 rounded-lg border border-secondary-200 p-6 dark:border-secondary-800">
          <h2 className="mb-4 text-xl font-semibold">
            Configurações da Newsletter
          </h2>

          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  if (isSubscribed) {
                    unsubscribe();
                  } else {
                    subscribe({
                      frequency: 'weekly',
                      categories: [],
                    });
                  }
                }}
                variant={isSubscribed ? 'secondary' : 'default'}
                disabled={loading}
              >
                {isSubscribed
                  ? 'Cancelar inscrição'
                  : 'Inscrever-se na newsletter'}
              </Button>
            </div>

            {isSubscribed && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Frequência de envio
                  </label>
                  <select
                    value={preferences?.frequency}
                    onChange={(e) =>
                      updatePreferences({
                        frequency: e.target.value as
                          | 'daily'
                          | 'weekly'
                          | 'monthly',
                      })
                    }
                    disabled={loading}
                    className="w-full rounded-md border border-secondary-200 bg-white px-3 py-2 text-sm focus:border-primary-600 focus:outline-none dark:border-secondary-800 dark:bg-secondary-950"
                  >
                    {frequencies.map((freq) => (
                      <option key={freq.value} value={freq.value}>
                        {freq.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Categorias de interesse
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                    {categories.map((category) => (
                      <label
                        key={category}
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <input
                          type="checkbox"
                          checked={preferences?.categories.includes(category)}
                          onChange={(e) => {
                            const newCategories = e.target.checked
                              ? [...(preferences?.categories || []), category]
                              : (preferences?.categories || []).filter(
                                  (c) => c !== category
                                );
                            updatePreferences({ categories: newCategories });
                          }}
                          disabled={loading}
                          className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-600"
                        />
                        <span>{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg bg-secondary-50 p-4 dark:bg-secondary-900">
                  <h3 className="mb-2 font-medium">Sobre nossa newsletter:</h3>
                  <ul className="list-inside list-disc space-y-1 text-secondary-600 dark:text-secondary-400">
                    <li>Receba as principais notícias direto no seu email</li>
                    <li>
                      Conteúdo personalizado baseado em suas categorias de
                      interesse
                    </li>
                    <li>Você pode cancelar a inscrição a qualquer momento</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
