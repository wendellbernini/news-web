'use client';

import { useEffect } from 'react';
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

  // Rastreia mudanças de página automaticamente (complementar ao que já existe no FacebookPixel.tsx)
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.fbq &&
      pathname &&
      process.env.NODE_ENV === 'production'
    ) {
      window.fbq('track', 'PageView');
      console.log(`[Facebook Pixel] Página visualizada: ${pathname}`);
    }
  }, [pathname, searchParams]);

  /**
   * Rastreia um evento personalizado no Facebook Pixel
   * @param eventName Nome do evento (pode ser padrão do Facebook ou personalizado)
   * @param eventParams Parâmetros adicionais do evento
   */
  const trackEvent = (eventName: string, eventParams = {}) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', eventName, eventParams);
      console.log(
        `[Facebook Pixel] Evento rastreado: ${eventName}`,
        eventParams
      );
    } else {
      console.warn(
        '[Facebook Pixel] Não foi possível rastrear o evento: Pixel não inicializado'
      );
    }
  };

  return { trackEvent };
}
