import { NextResponse } from 'next/server';
import { cacheService } from '@/lib/cache';

// Chave de cache para os dados de mercado
const MARKET_CACHE_KEY = 'market_data_bvsp';

// Dados de fallback para quando a API externa falhar
const FALLBACK_DATA = {
  data: [
    { time: Math.floor(Date.now() / 1000) - 3600, close: 130000 },
    { time: Math.floor(Date.now() / 1000), close: 130500 },
  ],
  currentValue: 130500,
  variation: 0.38,
};

// Interface para os dados de mercado
interface MarketDataItem {
  time: number;
  close: number | null;
}

export async function GET() {
  // Sempre retornar um conteúdo válido, mesmo em caso de erro
  try {
    // Adicionar um atraso mínimo para evitar problemas de race condition
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Tentar obter dados do cache primeiro
    const cachedData = await cacheService.get(
      MARKET_CACHE_KEY,
      async () => {
        try {
          // Criar um AbortController para definir um timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout

          // Busca dados com intervalo de 5 minutos do dia atual
          const response = await fetch(
            'https://query1.finance.yahoo.com/v8/finance/chart/%5EBVSP?interval=5m&range=1d',
            {
              headers: {
                'User-Agent': 'Mozilla/5.0',
              },
              signal: controller.signal,
              cache: 'no-store',
            }
          );

          // Limpar o timeout
          clearTimeout(timeoutId);

          if (!response.ok) {
            console.error(
              `Erro na API do Yahoo: ${response.status} ${response.statusText}`
            );
            return FALLBACK_DATA;
          }

          // Verificar se o corpo da resposta está vazio
          const text = await response.text();
          if (!text || text.trim() === '') {
            console.error('Resposta vazia da API do Yahoo');
            return FALLBACK_DATA;
          }

          // Tentar fazer o parse do JSON com tratamento de erro
          let data;
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            console.error(
              'Erro ao fazer parse do JSON:',
              parseError,
              'Texto recebido:',
              text
            );
            return FALLBACK_DATA;
          }

          // Validação robusta da estrutura dos dados
          if (
            !data?.chart?.result?.[0]?.timestamp ||
            !data?.chart?.result?.[0]?.indicators?.quote?.[0]
          ) {
            console.error('Estrutura de dados inválida:', data);
            return FALLBACK_DATA;
          }

          const { timestamp, indicators } = data.chart.result[0];
          const quotes = indicators.quote[0];

          // Filtra e processa os dados garantindo que não há valores nulos
          const validData = timestamp
            .map((time: number, index: number) => ({
              time,
              close:
                quotes.close[index] !== null &&
                quotes.close[index] !== undefined
                  ? Number(quotes.close[index].toFixed(2))
                  : null,
            }))
            .filter((item: MarketDataItem) => item.close !== null);

          if (validData.length === 0) {
            console.error('Sem dados válidos disponíveis');
            return FALLBACK_DATA;
          }

          // Calcula variação
          const lastPrice = validData[validData.length - 1].close;
          const firstPrice = validData[0].close;
          const variation = ((lastPrice - firstPrice) / firstPrice) * 100;

          return {
            data: validData,
            currentValue: lastPrice,
            variation: Number(variation.toFixed(2)),
          };
        } catch (fetchError) {
          console.error('Erro ao buscar dados do mercado:', fetchError);
          return FALLBACK_DATA;
        }
      },
      { ttl: 600 } // Cache por 10 minutos
    );

    // Garantir que sempre retornamos um objeto válido
    return NextResponse.json(cachedData || FALLBACK_DATA, {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Erro no serviço de cache:', error);
    // Mesmo em caso de erro no cache, retornamos dados de fallback
    return NextResponse.json(FALLBACK_DATA, {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json',
      },
    });
  }
}
