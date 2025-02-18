import { Metadata } from 'next';
import { RootLayout } from '@/components/layout/RootLayout';

export const metadata: Metadata = {
  title: 'Histórico de Leitura | NewsWeb',
  description: 'Veja as notícias que você leu recentemente',
};

export default function HistoricoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootLayout>{children}</RootLayout>;
}
