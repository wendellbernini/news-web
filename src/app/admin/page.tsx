import { Metadata } from 'next';
import { RootLayout } from '@/components/layout/RootLayout';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'Painel de Administração | NewsWeb',
  description: 'Gerencie as notícias do portal',
};

export default function AdminPage() {
  return (
    <RootLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Painel de Administração</h1>
          <p className="mt-2 text-secondary-600 dark:text-secondary-400">
            Gerencie as notícias do portal
          </p>
        </div>
        <AdminDashboard />
      </div>
    </RootLayout>
  );
}
