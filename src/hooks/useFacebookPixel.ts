'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Hook personalizado para usar o Facebook Pixel
 *
 * Este hook facilita o rastreamento de eventos personalizados no Facebook Pixel.
 * Ele verifica se o Facebook Pixel está disponível antes de tentar rastrear eventos.
 */
export function useFacebookPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isDevelopment = process.env.NODE_ENV === 'development';
  const previousPathRef = useRef(pathname);

  // Rastreia mudanças de página automaticamente (complementar ao que já existe no FacebookPixel.tsx)
  useEffect(() => {
    // Evita rastreamento duplicado verificando se o caminho realmente mudou
    if (
      typeof window !== 'undefined' &&
      window.fbq &&
      pathname &&
      !isDevelopment &&
      previousPathRef.current !== pathname
    ) {
      window.fbq('track', 'PageView');
      console.log(`[Facebook Pixel] Página visualizada: ${pathname}`);
      previousPathRef.current = pathname;
    }
  }, [pathname, searchParams, isDevelopment]);

  /**
   * Rastreia um evento personalizado no Facebook Pixel
   * @param eventName Nome do evento (pode ser padrão do Facebook ou personalizado)
   * @param eventParams Parâmetros adicionais do evento
   * @param forceLog Se true, sempre mostra o log mesmo em desenvolvimento
   */
  const trackEvent = async (
    eventName: string,
    eventParams = {},
    forceLog = false
  ) => {
    // Rastreia com o Pixel do Facebook (cliente)
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', eventName, eventParams);
    }

    // Rastreia com a API de Conversões (servidor)
    try {
      const response = await fetch('/api/facebook/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_name: eventName,
          custom_data: eventParams,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar evento para a API de Conversões');
      }

      if (isDevelopment || forceLog) {
        console.log('[Facebook CAPI] Evento enviado:', eventName, eventParams);
      }
    } catch (error) {
      console.error('[Facebook CAPI] Erro ao enviar evento:', error);
    }
  };

  return { trackEvent };
}
