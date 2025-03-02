'use client';

import { useEffect, useState, useRef } from 'react';
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
  const [pixelWarningShown, setPixelWarningShown] = useState(false);
  const isDevelopment = process.env.NODE_ENV === 'development';
  const previousPathRef = useRef(pathname);
  const eventLogCountRef = useRef<Record<string, number>>({});

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
  const trackEvent = (
    eventName: string,
    eventParams = {},
    forceLog = false
  ) => {
    // Em ambiente de desenvolvimento, não tenta rastrear eventos reais
    if (isDevelopment) {
      // Limita o número de logs para cada tipo de evento para evitar spam
      const eventKey = `${eventName}-${JSON.stringify(eventParams)}`;
      const logCount = eventLogCountRef.current[eventKey] || 0;

      // Só loga a primeira vez ou a cada 10 chamadas
      if (logCount === 0 || forceLog) {
        console.log(
          `[Facebook Pixel - DEV] Evento simulado: ${eventName}`,
          eventParams
        );
        eventLogCountRef.current[eventKey] = logCount + 1;
      } else {
        eventLogCountRef.current[eventKey] = logCount + 1;
        // A cada 10 chamadas, mostra um log de resumo
        if (logCount % 10 === 0) {
          console.log(
            `[Facebook Pixel - DEV] Evento ${eventName} chamado ${logCount} vezes (logs suprimidos para evitar spam)`
          );
        }
      }
      return;
    }

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', eventName, eventParams);
      console.log(
        `[Facebook Pixel] Evento rastreado: ${eventName}`,
        eventParams
      );
    } else if (!pixelWarningShown) {
      // Mostra o aviso apenas uma vez para evitar spam no console
      console.warn(
        '[Facebook Pixel] Não foi possível rastrear o evento: Pixel não inicializado'
      );
      setPixelWarningShown(true);
    }
  };

  return { trackEvent };
}
