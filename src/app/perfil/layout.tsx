import { RootLayout } from '@/components/layout/RootLayout';

export default function PerfilLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootLayout>{children}</RootLayout>;
}
