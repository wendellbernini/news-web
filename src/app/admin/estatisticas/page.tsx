'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  BarChart as BarChartIcon,
  Users,
  FileText,
  Bookmark,
} from 'lucide-react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'react-hot-toast';

interface Stats {
  totalUsers: number;
  totalNews: number;
  publishedNews: number;
  totalSavedNews: number;
  topCategories: { name: string; count: number }[];
}

export default function StatsAdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      // Usuários
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      const totalUsers = usersSnapshot.size;

      // Notícias
      const newsQuery = query(collection(db, 'news'));
      const newsSnapshot = await getDocs(newsQuery);
      const totalNews = newsSnapshot.size;
      const publishedNews = newsSnapshot.docs.filter(
        (doc) => doc.data().published
      ).length;

      // Total de notícias salvas (soma do array savedNews de todos os usuários)
      const totalSavedNews = usersSnapshot.docs.reduce((total, userDoc) => {
        const userData = userDoc.data();
        return total + (userData.savedNews?.length || 0);
      }, 0);

      // Categorias mais populares
      const categories = newsSnapshot.docs.reduce(
        (acc, doc) => {
          const category = doc.data().category;
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const topCategories = Object.entries(categories)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalUsers,
        totalNews,
        publishedNews,
        totalSavedNews,
        topCategories,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center gap-3">
        <BarChartIcon className="h-6 w-6 text-primary-600" />
        <h1 className="text-3xl font-bold">Estatísticas</h1>
      </div>

      {stats && (
        <div className="space-y-6">
          {/* Cartões de Métricas */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-secondary-200 bg-white p-6 dark:border-secondary-800 dark:bg-secondary-950">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold">Usuários</h3>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold">{stats.totalUsers}</div>
              </div>
            </div>

            <div className="rounded-lg border border-secondary-200 bg-white p-6 dark:border-secondary-800 dark:bg-secondary-950">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold">Notícias</h3>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold">{stats.totalNews}</div>
                <div className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
                  {stats.publishedNews} publicadas
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-secondary-200 bg-white p-6 dark:border-secondary-800 dark:bg-secondary-950">
              <div className="flex items-center gap-3">
                <Bookmark className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold">Notícias Salvas</h3>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold">{stats.totalSavedNews}</div>
              </div>
            </div>
          </div>

          {/* Categorias Mais Populares */}
          <div className="rounded-lg border border-secondary-200 bg-white p-6 dark:border-secondary-800 dark:bg-secondary-950">
            <h3 className="mb-4 text-lg font-semibold">
              Categorias Mais Populares
            </h3>
            <div className="space-y-4">
              {stats.topCategories.map((category) => (
                <div key={category.name} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-sm text-secondary-600 dark:text-secondary-400">
                        {category.count} notícias
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary-100 dark:bg-secondary-800">
                      <div
                        className="h-full rounded-full bg-primary-600"
                        style={{
                          width: `${(category.count / stats.totalNews) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex h-32 items-center justify-center">
          <div className="text-secondary-600 dark:text-secondary-400">
            Carregando estatísticas...
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
