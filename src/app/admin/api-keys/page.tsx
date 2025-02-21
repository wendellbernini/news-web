'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  query,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Key, Plus, Trash2, Copy } from 'lucide-react';

interface ApiKey {
  id: string;
  key: string;
  name: string;
  active: boolean;
  createdAt: Date;
  expiresAt: Date | null;
  lastUsed: Date | null;
  usageCount: number;
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchApiKeys();
  }, [user]);

  const fetchApiKeys = async () => {
    try {
      const keysQuery = query(collection(db, 'api_keys'));
      const snapshot = await getDocs(keysQuery);
      const keys = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          expiresAt: data.expiresAt?.toDate() || null,
          lastUsed: data.lastUsed?.toDate() || null,
        } as ApiKey;
      });

      setApiKeys(keys);
    } catch (error) {
      console.error('Erro ao carregar chaves:', error);
      toast.error('Erro ao carregar chaves de API');
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = async () => {
    const key = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');

    return key;
  };

  const createApiKey = async () => {
    const name = prompt('Digite um nome para a chave:');
    if (!name) return;

    try {
      const key = await generateApiKey();
      const newKey = {
        key,
        name,
        active: true,
        createdAt: new Date(),
        expiresAt: null,
        lastUsed: null,
        usageCount: 0,
      };

      const docRef = await addDoc(collection(db, 'api_keys'), newKey);
      setApiKeys((prev) => [...prev, { ...newKey, id: docRef.id }]);
      toast.success('Chave de API criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar chave:', error);
      toast.error('Erro ao criar chave de API');
    }
  };

  const deleteApiKey = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta chave?')) return;

    try {
      await deleteDoc(doc(db, 'api_keys', id));
      setApiKeys((prev) => prev.filter((key) => key.id !== id));
      toast.success('Chave de API excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir chave:', error);
      toast.error('Erro ao excluir chave de API');
    }
  };

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('Chave copiada para a área de transferência!');
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center gap-3">
        <Key className="h-6 w-6 text-primary-600" />
        <h1 className="text-3xl font-bold">Chaves de API</h1>
      </div>

      <div className="mb-6 flex justify-end">
        <Button onClick={createApiKey}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Chave
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
                Nome
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-500 dark:text-secondary-400"
              >
                Chave
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
                Criada em
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-500 dark:text-secondary-400"
              >
                Último uso
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
            {apiKeys.map((key) => (
              <tr key={key.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  {key.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-secondary-100 px-2 py-1 font-mono text-xs dark:bg-secondary-900">
                      {key.key.substring(0, 8)}...
                    </code>
                    <button
                      onClick={() => copyApiKey(key.key)}
                      className="text-secondary-600 hover:text-primary-600 dark:text-secondary-400"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      key.active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {key.active ? 'Ativa' : 'Inativa'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-secondary-500 dark:text-secondary-400">
                  {key.createdAt.toLocaleDateString('pt-BR')}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-secondary-500 dark:text-secondary-400">
                  {key.lastUsed
                    ? key.lastUsed.toLocaleDateString('pt-BR')
                    : 'Nunca'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteApiKey(key.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {apiKeys.length === 0 && (
        <p className="mt-4 text-center text-secondary-600 dark:text-secondary-400">
          Nenhuma chave de API encontrada
        </p>
      )}
    </AdminLayout>
  );
}
