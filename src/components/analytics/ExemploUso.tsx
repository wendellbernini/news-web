'use client';

import { useFirebaseAnalytics } from '@/hooks/useFirebaseAnalytics';
import { useState, useEffect, Suspense } from 'react';

/**
 * Componente interno que usa o hook useFirebaseAnalytics
 * Este componente é envolvido em Suspense para evitar erros com useSearchParams
 */
function AnalyticsContent() {
  const { trackEvent } = useFirebaseAnalytics();
  const [contador, setContador] = useState(0);
  const [pixelStatus, setPixelStatus] = useState<string>('Verificando...');

  // Verifica se o Facebook Pixel está carregado
  useEffect(() => {
    // Aguarda um momento para garantir que o script do Pixel tenha tempo de carregar
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        if (typeof window.fbq === 'function') {
          setPixelStatus('✅ Facebook Pixel está carregado e funcionando!');
        } else {
          setPixelStatus('❌ Facebook Pixel não está carregado corretamente.');
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Função para rastrear um evento em todas as ferramentas de análise
  const rastrearEvento = (tipo: string) => {
    // Incrementa o contador
    setContador((prev) => prev + 1);

    // Dados do evento
    const dadosEvento = {
      contador: contador + 1,
      timestamp: new Date().toISOString(),
      pagina: window.location.pathname,
    };

    // 1. Firebase Analytics
    trackEvent(`exemplo_${tipo}`, dadosEvento);

    // 2. Google Analytics 4 (se disponível)
    if (typeof window.trackGAEvent === 'function') {
      window.trackGAEvent(`exemplo_${tipo}`, dadosEvento);
    }

    // 3. Facebook Pixel (se disponível)
    if (typeof window.trackFBEvent === 'function') {
      window.trackFBEvent(`exemplo_${tipo}`, dadosEvento);
    }

    // Log para depuração
    console.log(
      `Evento "${tipo}" rastreado em todas as ferramentas`,
      dadosEvento
    );
  };

  // Função específica para testar o Facebook Pixel
  const testarFacebookPixel = () => {
    if (typeof window.fbq === 'function') {
      // Evento padrão do Facebook Pixel
      window.fbq('track', 'Lead', {
        content_name: 'Teste de Pixel',
        content_category: 'Teste',
        value: 1.0,
        currency: 'BRL',
      });

      console.log('✅ Evento de teste enviado para o Facebook Pixel!');
      alert(
        'Evento "Lead" enviado para o Facebook Pixel! Verifique o console e o Facebook Events Manager.'
      );
    } else {
      console.error('❌ Facebook Pixel não está disponível.');
      alert(
        'Facebook Pixel não está carregado corretamente. Verifique se o ID do Pixel está configurado no .env.local'
      );
    }
  };

  return (
    <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-bold">Exemplo de Uso de Analytics</h2>
      <p className="mb-4">Contador: {contador}</p>

      <div className="mb-4 rounded border border-gray-300 p-3 dark:border-gray-700">
        <h3 className="mb-2 font-bold">Status do Facebook Pixel:</h3>
        <p
          className={
            pixelStatus.includes('✅')
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }
        >
          {pixelStatus}
        </p>
      </div>

      <div className="flex flex-col space-y-2">
        <button
          onClick={() => rastrearEvento('clique')}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Rastrear Clique
        </button>

        <button
          onClick={() => rastrearEvento('interacao')}
          className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          Rastrear Interação
        </button>

        <button
          onClick={() => rastrearEvento('conversao')}
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Rastrear Conversão
        </button>

        <button
          onClick={testarFacebookPixel}
          className="mt-4 rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
        >
          Testar Facebook Pixel Diretamente
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>
          Verifique o console do navegador para ver os eventos sendo rastreados.
        </p>
        <p>Em produção, esses eventos serão enviados para:</p>
        <ul className="mt-2 list-disc pl-5">
          <li>Firebase Analytics</li>
          <li>Google Analytics 4</li>
          <li>Facebook Pixel</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Componente de exemplo para demonstrar o uso das ferramentas de análise
 *
 * Este componente é apenas para fins educacionais e demonstra como usar
 * as diferentes ferramentas de análise implementadas no projeto.
 */
export function ExemploAnalytics() {
  return (
    <Suspense
      fallback={
        <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
          <p>Carregando ferramentas de análise...</p>
        </div>
      }
    >
      <AnalyticsContent />
    </Suspense>
  );
}
