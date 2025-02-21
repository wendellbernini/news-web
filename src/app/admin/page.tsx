import { Metadata } from 'next';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Painel de Administração | ${SITE_NAME}`,
  description: 'Gerencie as notícias do portal',
};

export default function AdminPage() {
  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="mt-2 text-secondary-600 dark:text-secondary-400">
          Visão geral do portal
        </p>
      </div>
      <AdminDashboard />
    </AdminLayout>
  );
}
