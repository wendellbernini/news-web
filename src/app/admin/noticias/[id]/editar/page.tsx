import { Metadata } from 'next';
import { RootLayout } from '@/components/layout/RootLayout';
import { NewsForm } from '@/components/admin/NewsForm';
import { unstable_noStore as noStore } from 'next/cache';

export const metadata: Metadata = {
  title: 'Editar Notícia | NewsWeb',
  description: 'Edite uma notícia existente',
};

export default async function EditNewsPage(props: any) {
  noStore();

  return (
    <RootLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Editar Notícia</h1>
          <p className="mt-2 text-secondary-600 dark:text-secondary-400">
            Edite uma notícia existente
          </p>
        </div>
        <NewsForm newsId={props.params.id} />
      </div>
    </RootLayout>
  );
}
