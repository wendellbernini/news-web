'use client';

import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import useStore from '@/store/useStore';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserMenu } from '@/components/user/UserMenu';
import { SITE_NAME } from '@/lib/constants';
import { useRouter } from 'next/navigation';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useStore();
  const { signInWithGoogle } = useAuth();
  const router = useRouter();

  console.log('Header rendering, user:', user); // Debug log

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redireciona para a página de resultados com a query como parâmetro
      router.push(`/busca?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(''); // Limpa o campo após a busca
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-secondary-200 bg-white/80 backdrop-blur-sm dark:border-secondary-800 dark:bg-secondary-950/80">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="text-2xl font-bold text-primary-600">
          {SITE_NAME}
        </Link>

        <form
          onSubmit={handleSearch}
          className="hidden flex-1 items-center gap-2 md:flex"
        >
          <div className="relative max-w-md flex-1">
            <Input
              type="search"
              placeholder="Buscar notícias..."
              className="pl-3 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-secondary-500 transition-colors hover:text-primary-600"
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
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
              <Input
                type="search"
                placeholder="Buscar notícias..."
                className="pl-3 pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-secondary-500 transition-colors hover:text-primary-600"
                aria-label="Buscar"
              >
                <Search className="h-5 w-5" />
              </button>
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
                <Link
                  href="/perfil/biblioteca"
                  className="rounded-md px-4 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-100 hover:text-primary-600 dark:text-secondary-400 dark:hover:bg-secondary-800"
                >
                  Biblioteca
                </Link>
                <Link
                  href="/perfil/historico"
                  className="rounded-md px-4 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-100 hover:text-primary-600 dark:text-secondary-400 dark:hover:bg-secondary-800"
                >
                  Histórico
                </Link>
                <Link
                  href="/perfil/configuracoes"
                  className="rounded-md px-4 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-100 hover:text-primary-600 dark:text-secondary-400 dark:hover:bg-secondary-800"
                >
                  Configurações
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={signInWithGoogle}
                  className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-100 hover:text-primary-600 dark:text-secondary-400 dark:hover:bg-secondary-800"
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
                  className="rounded-md px-4 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-100 hover:text-primary-600 dark:text-secondary-400 dark:hover:bg-secondary-800"
                >
                  Entrar com email
                </Link>
                <Link
                  href="/registro"
                  className="rounded-md px-4 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-100 hover:text-primary-600 dark:text-secondary-400 dark:hover:bg-secondary-800"
                >
                  Criar conta
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
