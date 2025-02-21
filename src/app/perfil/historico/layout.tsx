import { Metadata } from 'next';
import { RootLayout } from '@/components/layout/RootLayout';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Histórico de Leitura | ${SITE_NAME}`,
  description: 'Veja as notícias que você leu recentemente',
};

export default function HistoricoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootLayout>{children}</RootLayout>;
}
