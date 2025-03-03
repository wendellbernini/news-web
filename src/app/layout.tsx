import type { Metadata } from 'next';
import { Inter, Leckerli_One } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants';
import { CookieConsent } from '@/components/CookieConsent';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';

const inter = Inter({ subsets: ['latin'] });
const leckerliOne = Leckerli_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-leckerli-one',
});

export const metadata: Metadata = {
  title: 'Rio de Fato',
  description: 'Portal de notícias do Rio de Janeiro',
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
    process.env.NEXT_PUBLIC_APP_URL ||
      'https://news-web-portal-noticias.vercel.app/'
  ),
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url:
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://news-web-portal-noticias.vercel.app/',
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
    'facebook-domain-verification': '0xflhjlqak9es24fpr00vk36zr80bp',
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
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="facebook-domain-verification"
          content="0xflhjlqak9es24fpr00vk36zr80bp"
        />
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
        className={`${inter.className} ${leckerliOne.variable}`}
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
