import { Metadata } from 'next';
import { ExemploAnalytics } from '@/components/analytics/ExemploUso';
import { ClientLayout } from '@/components/layout/ClientLayout';

export const metadata: Metadata = {
  title: 'Teste do Facebook Pixel',
  description: 'Página para testar a integração do Facebook Pixel',
};

/**
 * Página de teste para verificar o funcionamento do Facebook Pixel
 */
export default function TestePixelPage() {
  return (
    <ClientLayout>
      <div className="container py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold">Teste do Facebook Pixel</h1>
            <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
              Esta página permite verificar se o Facebook Pixel está funcionando
              corretamente
            </p>
          </div>

          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Como verificar:</h2>
            <ol className="list-decimal space-y-2 pl-5">
              <li>Abra as ferramentas de desenvolvedor do navegador (F12)</li>
              <li>Vá para a aba "Network" (Rede)</li>
              <li>Filtre por "facebook.com" ou "facebook.net"</li>
              <li>
                Clique no botão "Testar Facebook Pixel Diretamente" abaixo
              </li>
              <li>Verifique se aparece uma requisição para o Facebook</li>
              <li>Verifique também o console para mensagens de log</li>
            </ol>
          </div>

          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">
              Ferramenta de Teste:
            </h2>
            <ExemploAnalytics />
          </div>

          <div className="mt-8 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900">
            <h3 className="mb-2 text-xl font-semibold">
              Observações importantes:
            </h3>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                O Facebook Pixel pode levar até 24 horas para começar a
                registrar eventos no Facebook Events Manager
              </li>
              <li>
                Bloqueadores de anúncios podem impedir o carregamento do
                Facebook Pixel
              </li>
              <li>
                Certifique-se de que o ID do Pixel está configurado corretamente
                no arquivo .env.local
              </li>
              <li>
                Em ambiente de produção, o Pixel só será carregado se o usuário
                aceitar os cookies de rastreamento
              </li>
            </ul>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
