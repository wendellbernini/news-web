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
} from 'lucide-react';
import { useNewsletter } from '@/hooks/useNewsletter';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useState } from 'react';

export function UserMenu() {
  const { user, logout, signInWithGoogle, loading: authLoading } = useAuth();
  const { isSubscribed } = useNewsletter();
  const { isEnabled: pushEnabled } = usePushNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Mostra um loader enquanto verifica o estado de autenticação
  if (authLoading) {
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
        {/* Notificações */}
        <Link
          href="/perfil/preferencias"
          className="relative text-secondary-600 hover:text-primary-600 dark:text-secondary-400"
        >
          <Bell className="h-5 w-5" />
          {pushEnabled && (
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary-600" />
          )}
        </Link>

        {/* Newsletter */}
        <Link
          href="/perfil/preferencias"
          className="relative text-secondary-600 hover:text-primary-600 dark:text-secondary-400"
        >
          <Mail className="h-5 w-5" />
          {isSubscribed && (
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary-600" />
          )}
        </Link>

        {/* Menu Principal */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
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
  );
}
