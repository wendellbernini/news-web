'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Users, Search, Shield } from 'lucide-react';
import {
  collection,
  query,
  orderBy,
  getDocs,
  updateDoc,
  doc,
  where,
  limit,
  startAfter,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date;
  lastLogin: Date;
  engagementScore: number;
}

const ITEMS_PER_PAGE = 10;

export default function UsersAdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchUsers();
  }, [user, selectedRole]);

  const fetchUsers = async (isLoadMore = false) => {
    try {
      let usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(ITEMS_PER_PAGE)
      );

      if (selectedRole) {
        usersQuery = query(usersQuery, where('role', '==', selectedRole));
      }

      if (isLoadMore && lastVisible) {
        usersQuery = query(usersQuery, startAfter(lastVisible));
      }

      const snapshot = await getDocs(usersQuery);
      const userData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt.seconds * 1000),
        lastLogin: doc.data().lastLogin
          ? new Date(doc.data().lastLogin.seconds * 1000)
          : null,
      })) as User[];

      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);

      if (isLoadMore) {
        setUsers((prev) => [...prev, ...userData]);
      } else {
        setUsers(userData);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    if (!window.confirm(`Confirmar alteração de permissão para ${newRole}?`))
      return;

    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      toast.success('Permissão atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
      toast.error('Erro ao atualizar permissão');
    }
  };

  const filteredUsers = users.filter((item) =>
    searchTerm
      ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  if (!user) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center gap-3">
        <Users className="h-6 w-6 text-primary-600" />
        <h1 className="text-3xl font-bold">Usuários</h1>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-500" />
            <Input
              type="search"
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="rounded-lg border border-secondary-200 bg-white px-3 py-2 text-sm dark:border-secondary-800 dark:bg-secondary-950"
          >
            <option value="">Todas as permissões</option>
            <option value="user">Usuário</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-secondary-200 dark:border-secondary-800">
        <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-800">
          <thead className="bg-secondary-50 dark:bg-secondary-900">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-500 dark:text-secondary-400"
              >
                Usuário
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-500 dark:text-secondary-400"
              >
                Permissão
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-500 dark:text-secondary-400"
              >
                Cadastro
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-500 dark:text-secondary-400"
              >
                Último Acesso
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
            {filteredUsers.map((item) => (
              <tr key={item.id}>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-sm text-secondary-500 dark:text-secondary-400">
                        {item.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      item.role === 'admin'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}
                  >
                    {item.role === 'admin' ? 'Administrador' : 'Usuário'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-secondary-500 dark:text-secondary-400">
                  {item.createdAt.toLocaleDateString('pt-BR')}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-secondary-500 dark:text-secondary-400">
                  {item.lastLogin
                    ? item.lastLogin.toLocaleDateString('pt-BR')
                    : 'Nunca'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        updateUserRole(
                          item.id,
                          item.role === 'admin' ? 'user' : 'admin'
                        )
                      }
                    >
                      <Shield className="h-4 w-4 text-purple-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && !loading && (
        <p className="mt-4 text-center text-secondary-600 dark:text-secondary-400">
          Nenhum usuário encontrado
        </p>
      )}

      {hasMore && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchUsers(true)}
            disabled={loading}
          >
            Carregar mais
          </Button>
        </div>
      )}
    </AdminLayout>
  );
}
