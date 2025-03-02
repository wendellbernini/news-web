'use client';

import Script from 'next/script';

interface GoogleAnalyticsProps {
  measurementId: string;
}

/**
 * Componente para integração do Google Analytics 4
 *
 * Este componente adiciona os scripts necessários para o Google Analytics 4 (GA4)
 * e inicializa o tracking de página.
 *
 * @param measurementId - O ID de medição do GA4 (formato: G-XXXXXXXXXX)
 */
export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  // Se não houver ID de medição ou estiver em ambiente de desenvolvimento, não renderiza nada
  if (
    !measurementId ||
    !measurementId.trim() ||
    process.env.NODE_ENV === 'development'
  ) {
    return null;
  }

  return (
    <>
      {/* Script do Google Tag Manager */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />

      {/* Script de inicialização do Google Analytics */}
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
            
            // Função para rastrear eventos personalizados
            window.trackGAEvent = function(eventName, eventParams) {
              gtag('event', eventName, eventParams);
            }
          `,
        }}
      />
    </>
  );
}
