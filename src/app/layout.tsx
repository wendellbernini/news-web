import type { Metadata } from 'next';
import { Inter, Roboto } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: 'NewsWeb - Portal de Notícias',
  description:
    'Portal de notícias moderno e confiável, trazendo as últimas informações sobre diversos assuntos.',
  keywords:
    'notícias, portal, jornalismo, atualidades, tecnologia, esportes, política',
  authors: [{ name: 'NewsWeb' }],
  creator: 'NewsWeb',
  publisher: 'NewsWeb',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: 'NewsWeb - Portal de Notícias',
    description:
      'Portal de notícias moderno e confiável, trazendo as últimas informações sobre diversos assuntos.',
    url: 'http://localhost:3000',
    siteName: 'NewsWeb',
    locale: 'pt_BR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    title: 'NewsWeb - Portal de Notícias',
    description:
      'Portal de notícias moderno e confiável, trazendo as últimas informações sobre diversos assuntos.',
    card: 'summary_large_image',
    creator: '@newsweb',
    site: '@newsweb',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${roboto.variable} font-sans`}
        suppressHydrationWarning
      >
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
