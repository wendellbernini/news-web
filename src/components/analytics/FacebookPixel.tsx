'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

interface FacebookPixelProps {
  pixelId: string;
}

/**
 * Componente para integração do Pixel do Facebook
 *
 * Este componente adiciona os scripts necessários para o Pixel do Facebook
 * e inicializa o tracking de página.
 *
 * @param pixelId - O ID do Pixel do Facebook
 */
export function FacebookPixel({ pixelId }: FacebookPixelProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Rastreia mudanças de página automaticamente
  useEffect(() => {
    // Só executa o tracking se o pixel estiver disponível e não estiver em ambiente de desenvolvimento
    if (
      window.fbq &&
      pathname &&
      pixelId &&
      pixelId.trim() &&
      process.env.NODE_ENV !== 'development'
    ) {
      window.fbq('track', 'PageView');
    }
  }, [pathname, searchParams, pixelId]);

  // Se não houver ID do pixel ou estiver em ambiente de desenvolvimento, não renderiza os scripts
  if (!pixelId || !pixelId.trim() || process.env.NODE_ENV === 'development') {
    return null;
  }

  return (
    <>
      {/* Script de inicialização do Pixel do Facebook */}
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
            
            // Função para rastrear eventos personalizados
            window.trackFBEvent = function(eventName, eventParams) {
              fbq('track', eventName, eventParams);
            }
          `,
        }}
      />

      {/* Noscript para navegadores sem JavaScript */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

// Adiciona a definição do tipo para o objeto window
declare global {
  interface Window {
    fbq: any;
    trackFBEvent: (eventName: string, eventParams?: any) => void;
    trackGAEvent: (eventName: string, eventParams?: any) => void;
  }
}
