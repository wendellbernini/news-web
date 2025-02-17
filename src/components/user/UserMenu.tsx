'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import {
  User,
  Settings,
  LogOut,
  Bookmark,
  History,
  Bell,
  Mail,
  ChevronDown,
  Loader2,
  LayoutDashboard,
  Check,
  X,
} from 'lucide-react';
import { useNewsletter } from '@/hooks/useNewsletter';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useState, useEffect, useRef } from 'react';

export function UserMenu() {
  const { user, logout, signInWithGoogle, loading: authLoading } = useAuth();
  const { isSubscribed, subscribe, unsubscribe } = useNewsletter();
  const {
    isEnabled: pushEnabled,
    isSupported,
    requestPermission,
    permission,
  } = usePushNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Refs para os menus dropdown
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const newsletterRef = useRef<HTMLDivElement>(null);

  // Evita problemas de hidratação
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fecha os menus quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
      if (
        newsletterRef.current &&
        !newsletterRef.current.contains(event.target as Node)
      ) {
        setIsNewsletterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mostra um loader enquanto verifica o estado de autenticação
  if (authLoading || !mounted) {
    return (
      <Button variant="ghost" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (!user) {
    return (
      <Button onClick={signInWithGoogle}>
        <User className="mr-2 h-4 w-4" />
        Entrar
      </Button>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-4">
        {/* Notificações - só mostra se o navegador suportar */}
        {isSupported && (
          <div ref={notificationsRef} className="relative">
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsNewsletterOpen(false);
                setIsMenuOpen(false);
              }}
              className="relative text-secondary-600 hover:text-primary-600 dark:text-secondary-400"
            >
              <Bell className="h-5 w-5" />
              {pushEnabled && (
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary-600" />
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-secondary-200 bg-white py-1 shadow-lg dark:border-secondary-800 dark:bg-secondary-950">
                <div className="p-4">
                  <h3 className="mb-4 font-semibold">Notificações Push</h3>
                  {pushEnabled ? (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Check className="h-4 w-4" />
                      <span>Notificações ativadas</span>
                    </div>
                  ) : (
                    <Button
                      onClick={requestPermission}
                      disabled={permission === 'denied'}
                      className="w-full"
                    >
                      Ativar notificações
                    </Button>
                  )}
                  {permission === 'denied' && (
                    <p className="mt-2 text-xs text-red-600">
                      Você bloqueou as notificações. Para ativá-las, altere as
                      permissões do site no seu navegador.
                    </p>
                  )}
                </div>
                <hr className="border-secondary-200 dark:border-secondary-800" />
                <div className="p-4">
                  <p className="text-center text-sm text-secondary-600 dark:text-secondary-400">
                    Você não tem notificações no momento
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Newsletter */}
        <div ref={newsletterRef} className="relative">
          <button
            onClick={() => {
              setIsNewsletterOpen(!isNewsletterOpen);
              setIsNotificationsOpen(false);
              setIsMenuOpen(false);
            }}
            className="relative text-secondary-600 hover:text-primary-600 dark:text-secondary-400"
          >
            <Mail className="h-5 w-5" />
            {isSubscribed && (
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary-600" />
            )}
          </button>

          {isNewsletterOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-secondary-200 bg-white py-1 shadow-lg dark:border-secondary-800 dark:bg-secondary-950">
              <div className="p-4">
                <h3 className="mb-4 font-semibold">Newsletter</h3>
                {isSubscribed ? (
                  <>
                    <div className="mb-4 flex items-center gap-2 text-sm text-green-600">
                      <Check className="h-4 w-4" />
                      <span>Você está inscrito na newsletter</span>
                    </div>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={unsubscribe}
                    >
                      Cancelar inscrição
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="mb-4 text-sm text-secondary-600 dark:text-secondary-400">
                      Receba as principais notícias diretamente no seu email
                    </p>
                    <Button
                      className="w-full"
                      onClick={() =>
                        subscribe({ frequency: 'weekly', categories: [] })
                      }
                    >
                      Inscrever-se na newsletter
                    </Button>
                  </>
                )}
              </div>
              {isSubscribed && (
                <>
                  <hr className="border-secondary-200 dark:border-secondary-800" />
                  <div className="p-4">
                    <Link
                      href="/perfil/newsletter"
                      className="block text-center text-sm text-primary-600 hover:underline dark:text-primary-400"
                      onClick={() => setIsNewsletterOpen(false)}
                    >
                      Gerenciar preferências da newsletter
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Menu Principal */}
        <div ref={menuRef}>
          <button
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
              setIsNotificationsOpen(false);
              setIsNewsletterOpen(false);
            }}
            className="flex items-center gap-2 rounded-full p-1 hover:bg-secondary-100 dark:hover:bg-secondary-800"
          >
            <Image
              src={user.photoURL || '/images/avatar-placeholder.png'}
              alt={user.name || 'Avatar'}
              width={32}
              height={32}
              className="rounded-full"
              priority
            />
            <div className="hidden flex-col text-left text-sm sm:flex">
              <span className="font-medium">{user.name || 'Usuário'}</span>
              <span className="text-xs text-secondary-600 dark:text-secondary-400">
                {user.email}
              </span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </button>

          {/* Menu Dropdown */}
          {isMenuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-secondary-200 bg-white py-1 shadow-lg dark:border-secondary-800 dark:bg-secondary-950">
              {user.role === 'admin' && (
                <>
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-900"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Painel Admin
                  </Link>
                  <hr className="my-1 border-secondary-200 dark:border-secondary-800" />
                </>
              )}

              <Link
                href="/perfil"
                className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-900"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                Meu Perfil
              </Link>

              <Link
                href="/perfil/biblioteca"
                className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-900"
                onClick={() => setIsMenuOpen(false)}
              >
                <Bookmark className="h-4 w-4" />
                Salvos
              </Link>

              <Link
                href="/perfil/biblioteca#historico"
                className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-900"
                onClick={() => setIsMenuOpen(false)}
              >
                <History className="h-4 w-4" />
                Histórico
              </Link>

              <Link
                href="/perfil/preferencias"
                className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-900"
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings className="h-4 w-4" />
                Preferências
              </Link>

              <hr className="my-1 border-secondary-200 dark:border-secondary-800" />

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-secondary-100 dark:text-red-400 dark:hover:bg-secondary-900"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
