import { Metadata } from 'next';
import { RootLayout } from '@/components/layout/RootLayout';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Configurações | ${SITE_NAME}`,
  description: 'Gerencie suas configurações de conta',
};

export default function ConfiguracoesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootLayout>{children}</RootLayout>;
}
