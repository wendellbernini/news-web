import { Metadata } from 'next';
import { RootLayout } from '@/components/layout/RootLayout';
import { NewsForm } from '@/components/admin/NewsForm';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Nova Notícia | ${SITE_NAME}`,
  description: 'Adicione uma nova notícia ao portal',
};

export default function NewNewsPage() {
  return (
    <RootLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Nova Notícia</h1>
          <p className="mt-2 text-secondary-600 dark:text-secondary-400">
            Adicione uma nova notícia ao portal
          </p>
        </div>
        <NewsForm />
      </div>
    </RootLayout>
  );
}
