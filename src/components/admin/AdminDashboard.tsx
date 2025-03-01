'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useNews } from '@/hooks/useNews';
import { News } from '@/types';
import { Button } from '@/components/ui/Button';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';

export function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { deleteNews } = useNews();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const newsQuery = query(
        collection(db, 'news'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(newsQuery);
      const newsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.seconds
            ? new Date(data.createdAt.seconds * 1000)
            : new Date(),
          updatedAt: data.updatedAt?.seconds
            ? new Date(data.updatedAt.seconds * 1000)
            : new Date(),
        };
      }) as News[];

      setNews(newsData);
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
      toast.error('Erro ao carregar notícias');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta notícia?')) return;

    setDeleting(id);

    try {
      await deleteNews(id);
      setNews((prev) => prev.filter((item) => item.id !== id));
      toast.success('Notícia excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir notícia:', error);
      toast.error('Erro ao excluir notícia');
    } finally {
      setDeleting(null);
    }
  };

  if (!user) {
    return (
      <div className="rounded-lg border border-secondary-200 p-6 dark:border-secondary-800">
        <p className="text-center text-secondary-600 dark:text-secondary-400">
          Você precisa estar logado como administrador para acessar esta página
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold sm:hidden">Notícias Recentes</h2>
        <Button onClick={() => router.push('/admin/noticias/nova')}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Notícia
        </Button>
      </div>

      {/* Versão para desktop */}
      <div className="hidden overflow-x-auto rounded-lg border border-secondary-200 dark:border-secondary-800 sm:block">
        <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-800">
          <thead className="bg-secondary-50 dark:bg-secondary-900">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-500 dark:text-secondary-400"
              >
                Título
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-500 dark:text-secondary-400"
              >
                Categoria
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-500 dark:text-secondary-400"
              >
                Autor
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-500 dark:text-secondary-400"
              >
                Data
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-500 dark:text-secondary-400"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-500 dark:text-secondary-400"
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-200 bg-white dark:divide-secondary-800 dark:bg-secondary-950">
            {news.map((item) => (
              <tr key={item.id}>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium">{item.title}</div>
                      <div className="text-sm text-secondary-500 dark:text-secondary-400">
                        {item.slug}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="inline-flex rounded-full bg-primary-100 px-2 text-xs font-semibold leading-5 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                    {item.category}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  {item.author?.name || 'Autor desconhecido'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-secondary-500 dark:text-secondary-400">
                  {formatDate(item.createdAt)}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      item.published
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}
                  >
                    {item.published ? 'Publicado' : 'Rascunho'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/admin/noticias/${item.id}/editar`)
                      }
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                    >
                      {deleting === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-600" />
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Versão para mobile */}
      <div className="space-y-4 sm:hidden">
        {news.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-secondary-200 bg-white p-4 dark:border-secondary-800 dark:bg-secondary-950"
          >
            <div className="mb-2 flex items-start justify-between">
              <div>
                <h3 className="line-clamp-2 text-sm font-medium">
                  {item.title}
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex rounded-full bg-primary-100 px-2 text-xs font-semibold leading-5 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                    {item.category}
                  </span>
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      item.published
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}
                  >
                    {item.published ? 'Publicado' : 'Rascunho'}
                  </span>
                </div>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    router.push(`/admin/noticias/${item.id}/editar`)
                  }
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting === item.id}
                >
                  {deleting === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-red-600" />
                  )}
                </Button>
              </div>
            </div>
            <div className="mt-2 text-xs text-secondary-500 dark:text-secondary-400">
              <div className="flex justify-between">
                <span>{item.author?.name || 'Autor desconhecido'}</span>
                <span>{formatDate(item.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {news.length === 0 && (
        <p className="mt-4 text-center text-secondary-600 dark:text-secondary-400">
          Nenhuma notícia encontrada
        </p>
      )}
    </div>
  );
}
