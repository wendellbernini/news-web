'use client';

import { useFirebaseAnalytics } from '@/hooks/useFirebaseAnalytics';
import { useState } from 'react';

/**
 * Componente de exemplo para demonstrar o uso das ferramentas de análise
 *
 * Este componente é apenas para fins educacionais e demonstra como usar
 * as diferentes ferramentas de análise implementadas no projeto.
 */
export function ExemploAnalytics() {
  const { trackEvent } = useFirebaseAnalytics();
  const [contador, setContador] = useState(0);

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

  return (
    <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-bold">Exemplo de Uso de Analytics</h2>
      <p className="mb-4">Contador: {contador}</p>

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
