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
  Mail,
  ChevronDown,
  Loader2,
  LayoutDashboard,
  Check,
  LogIn,
  Bell,
} from 'lucide-react';
import { useNewsletter } from '@/hooks/useNewsletter';
import { useNotifications } from '@/hooks/useNotifications';
import { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

export function UserMenu() {
  const { user, logout, signInWithGoogle, loading: authLoading } = useAuth();
  const { isSubscribed, subscribe, unsubscribe } = useNewsletter();
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Refs para os menus dropdown
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const newsletterRef = useRef<HTMLDivElement>(null);
  const loginMenuRef = useRef<HTMLDivElement>(null);

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
      if (
        loginMenuRef.current &&
        !loginMenuRef.current.contains(event.target as Node)
      ) {
        setIsLoginMenuOpen(false);
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
      <div ref={loginMenuRef} className="relative">
        <Button
          onClick={() => setIsLoginMenuOpen(!isLoginMenuOpen)}
          className="flex items-center gap-2"
        >
          <User className="h-4 w-4" />
          Entrar
          <ChevronDown className="h-4 w-4" />
        </Button>

        {isLoginMenuOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-secondary-200 bg-white py-1 shadow-lg dark:border-secondary-800 dark:bg-secondary-950">
            <button
              onClick={() => {
                signInWithGoogle();
                setIsLoginMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-900"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continuar com Google
            </button>
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-900"
              onClick={() => setIsLoginMenuOpen(false)}
            >
              <LogIn className="h-4 w-4" />
              Entrar com email
            </Link>
            <hr className="my-1 border-secondary-200 dark:border-secondary-800" />
            <Link
              href="/registro"
              className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-900"
              onClick={() => setIsLoginMenuOpen(false)}
            >
              <User className="h-4 w-4" />
              Criar conta
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-4">
        {/* Notificações */}
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
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-medium text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-secondary-200 bg-white py-1 shadow-lg dark:border-secondary-800 dark:bg-secondary-950">
              <div className="flex items-center justify-between border-b border-secondary-200 p-4 dark:border-secondary-800">
                <h3 className="font-semibold">Notificações</h3>
                {notifications.length > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary-600 hover:underline dark:text-primary-400"
                  >
                    Marcar todas como lidas
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notificationsLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-secondary-600" />
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="divide-y divide-secondary-200 dark:divide-secondary-800">
                    {notifications.map((notification) => (
                      <Link
                        key={notification.id}
                        href={notification.link}
                        onClick={async (e) => {
                          e.preventDefault();
                          await markAsRead(notification.id);
                          setIsNotificationsOpen(false);
                          router.push(notification.link);
                        }}
                        className={`block p-4 transition-colors hover:bg-secondary-50 dark:hover:bg-secondary-900 ${
                          !notification.read
                            ? 'bg-secondary-50 dark:bg-secondary-900'
                            : ''
                        }`}
                      >
                        <div className="mb-1 flex items-start justify-between gap-2">
                          <p
                            className={`text-sm ${
                              !notification.read ? 'font-medium' : ''
                            }`}
                          >
                            {notification.newsTitle}
                          </p>
                          {!notification.read && (
                            <span className="h-2 w-2 flex-shrink-0 rounded-full bg-primary-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-secondary-600 dark:text-secondary-400">
                          <span className="rounded-full bg-secondary-100 px-2 py-0.5 dark:bg-secondary-800">
                            {notification.category}
                          </span>
                          <span>
                            {formatDistanceToNow(notification.createdAt, {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-secondary-600 dark:text-secondary-400">
                    Você não tem notificações no momento
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

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
            {/* Versão compacta para mobile - mostra apenas o primeiro nome */}
            <div className="flex sm:hidden">
              <span className="text-sm font-medium">
                {user.name?.split(' ')[0] || 'Usuário'}
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
                  <hr className="border-secondary-200 dark:border-secondary-800" />
                </>
              )}
              <Link
                href="/perfil/biblioteca"
                className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-900"
                onClick={() => setIsMenuOpen(false)}
              >
                <Bookmark className="h-4 w-4" />
                Biblioteca
              </Link>
              <Link
                href="/perfil/historico"
                className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-900"
                onClick={() => setIsMenuOpen(false)}
              >
                <History className="h-4 w-4" />
                Histórico
              </Link>
              <Link
                href="/perfil/configuracoes"
                className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-900"
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings className="h-4 w-4" />
                Configurações
              </Link>
              <hr className="border-secondary-200 dark:border-secondary-800" />
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-900"
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
