'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Mail,
  Key,
  FileText,
  Settings,
  Users,
  BarChart,
  Menu,
  X,
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Notícias',
    href: '/admin/noticias',
    icon: FileText,
  },
  {
    title: 'Newsletter',
    href: '/admin/newsletter',
    icon: Mail,
  },
  {
    title: 'Chaves API',
    href: '/admin/api-keys',
    icon: Key,
  },
  {
    title: 'Usuários',
    href: '/admin/usuarios',
    icon: Users,
  },
  {
    title: 'Estatísticas',
    href: '/admin/estatisticas',
    icon: BarChart,
  },
  {
    title: 'Configurações',
    href: '/admin/configuracoes',
    icon: Settings,
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen flex-col sm:flex-row">
      {/* Mobile Header */}
      <div className="flex h-16 items-center justify-between border-b border-secondary-200 bg-white px-4 dark:border-secondary-800 dark:bg-secondary-950 sm:hidden">
        <h2 className="text-lg font-semibold">Painel Admin</h2>
        <button
          onClick={toggleSidebar}
          className="rounded-md p-2 text-secondary-500 hover:bg-secondary-100 dark:text-secondary-400 dark:hover:bg-secondary-800"
        >
          {sidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-secondary-200 bg-white transition-transform duration-300 ease-in-out dark:border-secondary-800 dark:bg-secondary-950 sm:static sm:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-secondary-200 px-6 dark:border-secondary-800 sm:justify-start">
          <h2 className="text-lg font-semibold">Painel Admin</h2>
          <button
            onClick={toggleSidebar}
            className="ml-auto rounded-md p-1 text-secondary-500 hover:bg-secondary-100 dark:text-secondary-400 dark:hover:bg-secondary-800 sm:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                        : 'text-secondary-600 hover:bg-secondary-100 hover:text-primary-600 dark:text-secondary-400 dark:hover:bg-secondary-900'
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container py-4 sm:py-8">{children}</div>
      </main>
    </div>
  );
}
