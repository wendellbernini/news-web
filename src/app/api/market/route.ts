import { NextResponse } from 'next/server';
import { cacheService } from '@/lib/cache';

// Chave de cache para os dados de mercado
const MARKET_CACHE_KEY = 'market_data_bvsp';

export async function GET() {
  try {
    // Tentar obter dados do cache primeiro
    return await cacheService.get(
      MARKET_CACHE_KEY,
      async () => {
        // Busca dados com intervalo de 5 minutos do dia atual
        const response = await fetch(
          'https://query1.finance.yahoo.com/v8/finance/chart/%5EBVSP?interval=5m&range=1d',
          {
            headers: {
              'User-Agent': 'Mozilla/5.0',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Erro ao buscar dados do mercado');
        }

        const data = await response.json();
        console.log('Resposta da API Yahoo:', data); // Debug temporário

        // Validação rápida da estrutura dos dados
        if (
          !data?.chart?.result?.[0]?.timestamp ||
          !data?.chart?.result?.[0]?.indicators?.quote?.[0]
        ) {
          throw new Error('Dados do mercado indisponíveis');
        }

        const { timestamp, indicators } = data.chart.result[0];
        const quotes = indicators.quote[0];

        // Filtra e processa os dados garantindo que não há valores nulos
        const validData = timestamp
          .map((time: number, index: number) => ({
            time,
            close: Number(quotes.close[index]?.toFixed(2)) || null,
          }))
          .filter((item: any) => item.close !== null);

        if (validData.length === 0) {
          throw new Error('Sem dados válidos disponíveis');
        }

        // Calcula variação
        const lastPrice = validData[validData.length - 1].close;
        const firstPrice = validData[0].close;
        const variation = ((lastPrice - firstPrice) / firstPrice) * 100;

        return NextResponse.json({
          data: validData,
          currentValue: lastPrice,
          variation: Number(variation.toFixed(2)),
        });
      },
      { ttl: 300 } // Cache por 5 minutos
    );
  } catch (error) {
    console.error('Erro ao buscar dados do mercado:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados do mercado' },
      { status: 500 }
    );
  }
}
