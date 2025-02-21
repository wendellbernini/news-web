'use client';

import { ReactNode } from 'react';
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

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-secondary-200 bg-white dark:border-secondary-800 dark:bg-secondary-950">
        <div className="flex h-16 items-center border-b border-secondary-200 px-6 dark:border-secondary-800">
          <h2 className="text-lg font-semibold">Painel Admin</h2>
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

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container py-8">{children}</div>
      </main>
    </div>
  );
}
