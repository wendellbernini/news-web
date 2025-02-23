import { RootLayout } from '@/components/layout/RootLayout';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootLayout>
      <div className="container py-8">
        <div className="mx-auto max-w-3xl">{children}</div>
      </div>
    </RootLayout>
  );
}
