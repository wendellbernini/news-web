'use client';

import { useState, Suspense } from 'react';
import { useFacebookPixel } from '@/hooks/useFacebookPixel';
import { RootLayout } from '@/components/layout/RootLayout';
import { Button } from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';

// Componente interno que usa o hook useFacebookPixel
function PixelTester() {
  const { trackEvent } = useFacebookPixel();
  const [eventLog, setEventLog] = useState<string[]>([]);

  const logEvent = (eventName: string, params: any) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    setEventLog((prev) => [
      `[${timestamp}] Evento: ${eventName} - Parâmetros: ${JSON.stringify(
        params
      )}`,
      ...prev,
    ]);
  };

  const handleTestPageView = () => {
    trackEvent('PageView', {}, true);
    logEvent('PageView', {});
  };

  const handleTestViewContent = () => {
    const params = {
      content_name: 'Artigo de Teste',
      content_category: 'Tecnologia',
      content_ids: ['test-123'],
      content_type: 'article',
    };
    trackEvent('ViewContent', params, true);
    logEvent('ViewContent', params);
  };

  const handleTestSearch = () => {
    const params = {
      search_string: 'teste de busca',
      content_category: 'search',
    };
    trackEvent('Search', params, true);
    logEvent('Search', params);
  };

  const handleTestLead = () => {
    const params = {
      content_name: 'Formulário de Contato',
      content_category: 'Contato',
    };
    trackEvent('Lead', params, true);
    logEvent('Lead', params);
  };

  const handleTestCustomEvent = () => {
    const params = {
      event_label: 'Teste Personalizado',
      event_category: 'Teste',
      value: 1,
    };
    trackEvent('CustomEvent', params, true);
    logEvent('CustomEvent', params);
  };

  const handleClearLog = () => {
    setEventLog([]);
  };

  return (
    <div className="mb-8">
      <p className="mb-4">
        Esta página permite testar se o Facebook Pixel está funcionando
        corretamente. Clique nos botões abaixo para disparar diferentes tipos de
        eventos e verifique no console do navegador e no Facebook Business
        Manager se eles estão sendo registrados.
      </p>

      <div className="mb-8 flex flex-wrap gap-4">
        <Button onClick={handleTestPageView}>Testar PageView</Button>
        <Button onClick={handleTestViewContent}>Testar ViewContent</Button>
        <Button onClick={handleTestSearch}>Testar Search</Button>
        <Button onClick={handleTestLead}>Testar Lead</Button>
        <Button onClick={handleTestCustomEvent}>
          Testar Evento Personalizado
        </Button>
      </div>

      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Log de Eventos</h2>
          <Button variant="outline" onClick={handleClearLog}>
            Limpar Log
          </Button>
        </div>
        <div className="h-64 overflow-y-auto rounded-md bg-gray-100 p-4 dark:bg-gray-800">
          {eventLog.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              Nenhum evento registrado. Clique nos botões acima para testar.
            </p>
          ) : (
            <ul className="space-y-2">
              {eventLog.map((log, index) => (
                <li
                  key={index}
                  className="border-b border-gray-200 pb-1 font-mono text-sm dark:border-gray-700"
                >
                  {log}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TestePixelPage() {
  return (
    <RootLayout>
      <main className="container py-8">
        <h1 className="mb-8 text-2xl font-bold">Teste do Facebook Pixel</h1>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              <span className="ml-2">Carregando ferramentas de teste...</span>
            </div>
          }
        >
          <PixelTester />
        </Suspense>

        <div className="mt-8 rounded-md bg-yellow-50 p-4 dark:bg-yellow-900">
          <h3 className="mb-2 font-semibold">Instruções para verificação:</h3>
          <ol className="list-inside list-decimal space-y-2">
            <li>
              Abra o console do navegador (F12 &gt; Console) para ver os logs do
              Facebook Pixel
            </li>
            <li>
              Verifique se aparecem mensagens com o prefixo [Facebook Pixel]
            </li>
            <li>
              Acesse o{' '}
              <a
                href="https://business.facebook.com/events_manager"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline dark:text-blue-400"
              >
                Facebook Events Manager
              </a>{' '}
              para verificar se os eventos estão sendo recebidos
            </li>
            <li>
              Use a extensão{' '}
              <a
                href="https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline dark:text-blue-400"
              >
                Facebook Pixel Helper
              </a>{' '}
              para depuração avançada
            </li>
          </ol>
        </div>
      </main>
    </RootLayout>
  );
}
