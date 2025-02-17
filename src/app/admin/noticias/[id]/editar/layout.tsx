import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editar Notícia | NewsWeb',
  description: 'Edite uma notícia existente',
};

export default function EditNewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
