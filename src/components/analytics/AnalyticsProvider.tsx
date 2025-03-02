'use client';

import { Suspense } from 'react';
import { GoogleAnalytics } from './GoogleAnalytics';
import { FacebookPixel } from './FacebookPixel';

/**
 * Componente que agrupa todas as ferramentas de análise
 *
 * Este componente centraliza a configuração e inicialização de todas as ferramentas
 * de análise utilizadas no site (Google Analytics e Facebook Pixel).
 *
 * O FacebookPixel é envolvido com Suspense para evitar erros de renderização
 * relacionados ao uso do hook useSearchParams.
 */
export function AnalyticsProvider() {
  // IDs das ferramentas de análise
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';
  const fbPixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '';

  return (
    <>
      {/* Google Analytics */}
      <GoogleAnalytics measurementId={gaId} />

      {/* Facebook Pixel - Envolvido com Suspense para evitar erros com useSearchParams */}
      <Suspense fallback={null}>
        <FacebookPixel pixelId={fbPixelId} />
      </Suspense>
    </>
  );
}
