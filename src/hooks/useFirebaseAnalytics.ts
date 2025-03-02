'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { analytics } from '@/lib/firebase/config';
import { logEvent, Analytics } from 'firebase/analytics';

/**
 * Hook personalizado para usar o Firebase Analytics
 *
 * Este hook facilita o rastreamento de páginas e eventos no Firebase Analytics.
 * Ele automaticamente rastreia mudanças de página e fornece funções para rastrear eventos personalizados.
 */
export function useFirebaseAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Rastreia mudanças de página automaticamente
  useEffect(() => {
    if (analytics && pathname) {
      // Constrói a URL completa com parâmetros de consulta, se houver
      const url = searchParams?.size
        ? `${pathname}?${searchParams.toString()}`
        : pathname;

      // Registra o evento de visualização de página
      logEvent(analytics as Analytics, 'page_view', {
        page_path: url,
        page_title: document.title,
        page_location: window.location.href,
      });

      console.log(`[Firebase Analytics] Página visualizada: ${url}`);
    }
  }, [pathname, searchParams]);

  // Função para rastrear eventos personalizados
  const trackEvent = (eventName: string, eventParams = {}) => {
    if (analytics) {
      logEvent(analytics as Analytics, eventName, eventParams);
      console.log(
        `[Firebase Analytics] Evento rastreado: ${eventName}`,
        eventParams
      );
    } else {
      console.warn(
        '[Firebase Analytics] Não foi possível rastrear o evento: Analytics não inicializado'
      );
    }
  };

  return { trackEvent };
}
