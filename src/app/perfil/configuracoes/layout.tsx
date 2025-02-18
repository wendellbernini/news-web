import { Metadata } from 'next';
import { RootLayout } from '@/components/layout/RootLayout';

export const metadata: Metadata = {
  title: 'Configurações | NewsWeb',
  description: 'Gerencie suas configurações de conta',
};

export default function ConfiguracoesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootLayout>{children}</RootLayout>;
}
