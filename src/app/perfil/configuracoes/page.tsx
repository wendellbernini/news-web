'use client';

import { useAuth } from '@/hooks/useAuth';

export default function ConfiguracoesPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="rounded-lg border border-secondary-200 p-6 dark:border-secondary-800">
        <p className="text-center text-secondary-600 dark:text-secondary-400">
          Faça login para acessar suas configurações
        </p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Configurações</h1>
        <p className="mt-2 text-secondary-600 dark:text-secondary-400">
          Gerencie suas configurações de conta
        </p>
      </div>

      <div className="space-y-8">
        <div className="rounded-lg border border-secondary-200 p-6 dark:border-secondary-800">
          <h2 className="mb-4 text-xl font-bold">Informações da Conta</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                Email
              </label>
              <p className="mt-1 text-secondary-600 dark:text-secondary-400">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-secondary-200 p-6 dark:border-secondary-800">
          <h2 className="mb-4 text-xl font-bold">
            Preferências de Notificação
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificações por Email</p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Receba atualizações sobre notícias e comentários
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" />
                <div className="h-6 w-11 rounded-full bg-secondary-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-secondary-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:border-secondary-600 dark:bg-secondary-700 dark:peer-focus:ring-primary-800"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-secondary-200 p-6 dark:border-secondary-800">
          <h2 className="mb-4 text-xl font-bold">Privacidade</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Perfil Público</p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Permitir que outros usuários vejam seu perfil
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" />
                <div className="h-6 w-11 rounded-full bg-secondary-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-secondary-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:border-secondary-600 dark:bg-secondary-700 dark:peer-focus:ring-primary-800"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
