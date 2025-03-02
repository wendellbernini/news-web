'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

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
  const [isInitialized, setIsInitialized] = useState(false);
  const isDevelopment = process.env.NODE_ENV === 'development';
  const previousPathRef = useRef(pathname);

  // Inicializa o pixel manualmente para garantir que está disponível
  useEffect(() => {
    // Em desenvolvimento, apenas simula a inicialização
    if (isDevelopment) {
      // Reduzimos a verbosidade dos logs em desenvolvimento
      if (!isInitialized) {
        console.log('[Facebook Pixel - DEV] Inicialização simulada');
      }

      // Define uma função fbq simulada para evitar erros, mas sem logs excessivos
      if (typeof window !== 'undefined' && !window.fbq) {
        window.fbq = function () {
          // Não logamos cada chamada para evitar spam no console
          return;
        };
      }

      setIsInitialized(true);
      return;
    }

    // Em produção, verifica se o ID é válido
    if (!pixelId || !pixelId.trim()) {
      console.warn('[Facebook Pixel] ID do pixel não configurado');
      return;
    }

    // Verifica se o pixel já foi inicializado
    if (typeof window !== 'undefined' && !window.fbq) {
      try {
        // Inicializa o pixel manualmente
        // @ts-ignore - Ignorando erros de TypeScript nesta função de inicialização do Facebook Pixel
        (function (f, b, e, v, n, t, s) {
          if (f.fbq) return;
          // @ts-ignore
          n = f.fbq = function () {
            // @ts-ignore
            n.callMethod
              ? // @ts-ignore
                n.callMethod.apply(n, arguments)
              : // @ts-ignore
                n.queue.push(arguments);
          };
          // @ts-ignore
          if (!f._fbq) f._fbq = n;
          // @ts-ignore
          n.push = n;
          // @ts-ignore
          n.loaded = !0;
          // @ts-ignore
          n.version = '2.0';
          // @ts-ignore
          n.queue = [];
          // @ts-ignore
          t = b.createElement(e);
          // @ts-ignore
          t.async = !0;
          // @ts-ignore
          t.src = v;
          // @ts-ignore
          s = b.getElementsByTagName(e)[0];
          // @ts-ignore
          s.parentNode?.insertBefore(t, s);
        })(
          window,
          document,
          'script',
          'https://connect.facebook.net/en_US/fbevents.js'
        );

        window.fbq('init', pixelId);
        window.fbq('track', 'PageView');

        console.log('[Facebook Pixel] Inicializado com sucesso');
        setIsInitialized(true);
      } catch (error) {
        console.error('[Facebook Pixel] Erro na inicialização:', error);
      }
    } else if (window.fbq) {
      setIsInitialized(true);
    }
  }, [pixelId, isDevelopment, isInitialized]);

  // Rastreia mudanças de página automaticamente
  useEffect(() => {
    // Evita rastreamento duplicado verificando se o caminho realmente mudou
    if (
      isInitialized &&
      window.fbq &&
      pathname &&
      !isDevelopment &&
      previousPathRef.current !== pathname
    ) {
      window.fbq('track', 'PageView');
      console.log(`[Facebook Pixel] Página visualizada: ${pathname}`);
      previousPathRef.current = pathname;
    }
  }, [pathname, searchParams, isInitialized, isDevelopment]);

  // Se estiver em ambiente de desenvolvimento, não renderiza os scripts
  if (isDevelopment) {
    return null;
  }

  // Se não houver ID do pixel, não renderiza os scripts
  if (!pixelId || !pixelId.trim()) {
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
    _fbq: any;
  }
}
