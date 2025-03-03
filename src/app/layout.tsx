import type { Metadata } from 'next';
import { Inter, Roboto } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants';
import { CookieConsent } from '@/components/CookieConsent';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';

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
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  keywords: 'notícias rio de janeiro, jornalismo, rj, rio de fato, atualidades',
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://news-web-tawny.vercel.app'
  ),
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://news-web-tawny.vercel.app',
    siteName: SITE_NAME,
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
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    card: 'summary_large_image',
    creator: '@riodefato',
    site: '@riodefato',
  },
  other: {
    'facebook-domain-verification': 'o7yf1k9oo8p1ucirbvjoqmgo6n6ru9',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const isDark = localStorage.getItem('darkMode') === 'true';
                if (isDark) document.documentElement.classList.add('dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${roboto.variable} font-sans`}
        suppressHydrationWarning
      >
        {children}
        <Toaster position="top-right" />
        <CookieConsent />
        <AnalyticsProvider />
      </body>
    </html>
  );
}
