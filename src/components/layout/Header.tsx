'use client';

import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import useStore from '@/store/useStore';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserMenu } from '@/components/user/UserMenu';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useStore();
  const { signInWithGoogle, logout } = useAuth();

  console.log('Header rendering, user:', user); // Debug log

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar a busca
  };

  return (
    <header className="sticky top-0 z-50 border-b border-secondary-200 bg-white/80 backdrop-blur-sm dark:border-secondary-800 dark:bg-secondary-950/80">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="text-2xl font-bold text-primary-600">
          NewsWeb
        </Link>

        <form
          onSubmit={handleSearch}
          className="hidden flex-1 items-center gap-2 md:flex"
        >
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-500" />
            <Input
              type="search"
              placeholder="Buscar notícias..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Buscar</Button>
        </form>

        <nav className="hidden items-center gap-4 md:flex">
          <Link
            href="/categorias"
            className="text-sm font-medium text-secondary-600 hover:text-primary-600 dark:text-secondary-400"
          >
            Categorias
          </Link>
          <Link
            href="/mais-lidas"
            className="text-sm font-medium text-secondary-600 hover:text-primary-600 dark:text-secondary-400"
          >
            Mais Lidas
          </Link>
          <UserMenu />
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Menu Mobile */}
      {isMenuOpen && (
        <div className="container pb-4 md:hidden">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-500" />
              <Input
                type="search"
                placeholder="Buscar notícias..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          <nav className="flex flex-col gap-2">
            <Link
              href="/categorias"
              className="rounded-md px-4 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-100 hover:text-primary-600 dark:text-secondary-400 dark:hover:bg-secondary-800"
            >
              Categorias
            </Link>
            <Link
              href="/mais-lidas"
              className="rounded-md px-4 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-100 hover:text-primary-600 dark:text-secondary-400 dark:hover:bg-secondary-800"
            >
              Mais Lidas
            </Link>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="rounded-md px-4 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-100 hover:text-primary-600 dark:text-secondary-400 dark:hover:bg-secondary-800"
                  >
                    Painel Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="rounded-md px-4 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-100 hover:text-primary-600 dark:text-secondary-400 dark:hover:bg-secondary-800"
                >
                  Sair
                </button>
              </>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                Entrar
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
