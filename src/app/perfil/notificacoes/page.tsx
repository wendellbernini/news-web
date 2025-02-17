'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import useStore from '@/store/useStore';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useStore();
  const { isSupported, isEnabled, permission, requestPermission } =
    usePushNotifications();

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
            Faça login para acessar suas notificações
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
          <Bell className="h-6 w-6 text-primary-600" />
          <h1 className="text-3xl font-bold">Notificações</h1>
        </div>

        <section className="mb-8 rounded-lg border border-secondary-200 p-6 dark:border-secondary-800">
          <h2 className="mb-4 text-xl font-semibold">
            Configurações de Notificações
          </h2>

          {isSupported ? (
            <div className="space-y-4">
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

              <div className="rounded-lg bg-secondary-50 p-4 dark:bg-secondary-900">
                <h3 className="mb-2 font-medium">
                  Você receberá notificações sobre:
                </h3>
                <ul className="list-inside list-disc space-y-1 text-secondary-600 dark:text-secondary-400">
                  <li>Novas notícias das suas categorias de interesse</li>
                  <li>Atualizações importantes de notícias que você salvou</li>
                  <li>Respostas aos seus comentários</li>
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-secondary-600 dark:text-secondary-400">
              Seu navegador não suporta notificações push. Para receber
              notificações, tente usar um navegador mais recente.
            </p>
          )}
        </section>

        <section className="rounded-lg border border-secondary-200 p-6 dark:border-secondary-800">
          <h2 className="mb-4 text-xl font-semibold">
            Histórico de Notificações
          </h2>
          <div className="text-center text-secondary-600 dark:text-secondary-400">
            <p>Você não tem notificações no momento.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
