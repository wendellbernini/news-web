'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { News } from '@/types';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileText, Plus, Pencil, Trash2, Loader2, Search } from 'lucide-react';
import {
  collection,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  where,
  limit,
  startAfter,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';

const ITEMS_PER_PAGE = 10;

export default function NewsAdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchNews();
  }, [user, selectedCategory, selectedStatus]);

  const fetchNews = async (isLoadMore = false) => {
    try {
      let newsQuery = query(
        collection(db, 'news'),
        orderBy('createdAt', 'desc'),
        limit(ITEMS_PER_PAGE)
      );

      if (selectedCategory) {
        newsQuery = query(newsQuery, where('category', '==', selectedCategory));
      }

      if (selectedStatus) {
        newsQuery = query(
          newsQuery,
          where('published', '==', selectedStatus === 'published')
        );
      }

      if (isLoadMore && lastVisible) {
        newsQuery = query(newsQuery, startAfter(lastVisible));
      }

      const snapshot = await getDocs(newsQuery);
      const newsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt.seconds * 1000),
        updatedAt: new Date(doc.data().updatedAt.seconds * 1000),
      })) as News[];

      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);

      if (isLoadMore) {
        setNews((prev) => [...prev, ...newsData]);
      } else {
        setNews(newsData);
      }
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
      await deleteDoc(doc(db, 'news', id));
      setNews((prev) => prev.filter((item) => item.id !== id));
      toast.success('Notícia excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir notícia:', error);
      toast.error('Erro ao excluir notícia');
    } finally {
      setDeleting(null);
    }
  };

  const filteredNews = news.filter((item) =>
    searchTerm
      ? item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  if (!user) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center gap-3">
        <FileText className="h-6 w-6 text-primary-600" />
        <h1 className="text-3xl font-bold">Notícias</h1>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-500" />
            <Input
              type="search"
              placeholder="Buscar notícias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-secondary-200 bg-white px-3 py-2 text-sm dark:border-secondary-800 dark:bg-secondary-950"
          >
            <option value="">Todas as categorias</option>
            <option value="Tecnologia">Tecnologia</option>
            <option value="Esportes">Esportes</option>
            <option value="Política">Política</option>
            <option value="Economia">Economia</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-secondary-200 bg-white px-3 py-2 text-sm dark:border-secondary-800 dark:bg-secondary-950"
          >
            <option value="">Todos os status</option>
            <option value="published">Publicado</option>
            <option value="draft">Rascunho</option>
          </select>
        </div>

        <Button onClick={() => router.push('/admin/noticias/nova')}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Notícia
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-secondary-200 dark:border-secondary-800">
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
            {filteredNews.map((item) => (
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

      {filteredNews.length === 0 && !loading && (
        <p className="mt-4 text-center text-secondary-600 dark:text-secondary-400">
          Nenhuma notícia encontrada
        </p>
      )}

      {hasMore && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchNews(true)}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Carregar mais'
            )}
          </Button>
        </div>
      )}
    </AdminLayout>
  );
}
