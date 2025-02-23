import { RootLayout } from '@/components/layout/RootLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootLayout>{children}</RootLayout>;
}
