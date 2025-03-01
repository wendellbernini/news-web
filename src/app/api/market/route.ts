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

export async function GET() {
  try {
    // Tentar obter dados do cache primeiro
    return await cacheService.get(
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
            }
          );

          // Limpar o timeout
          clearTimeout(timeoutId);

          if (!response.ok) {
            console.error(
              `Erro na API do Yahoo: ${response.status} ${response.statusText}`
            );
            throw new Error('Erro ao buscar dados do mercado');
          }

          // Verificar se o corpo da resposta está vazio
          const text = await response.text();
          if (!text || text.trim() === '') {
            console.error('Resposta vazia da API do Yahoo');
            throw new Error('Resposta vazia da API');
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
            throw new Error('Resposta JSON inválida');
          }

          console.log('Resposta da API Yahoo:', data); // Debug temporário

          // Validação robusta da estrutura dos dados
          if (
            !data?.chart?.result?.[0]?.timestamp ||
            !data?.chart?.result?.[0]?.indicators?.quote?.[0]
          ) {
            console.error('Estrutura de dados inválida:', data);
            throw new Error('Dados do mercado indisponíveis');
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
            .filter((item: any) => item.close !== null);

          if (validData.length === 0) {
            console.error('Sem dados válidos disponíveis');
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
        } catch (fetchError) {
          console.error('Erro ao buscar dados do mercado:', fetchError);

          // Retornar dados de fallback em caso de erro
          // Isso evita que o componente quebre quando a API externa falhar
          console.log('Usando dados de fallback para o mercado');
          return NextResponse.json(FALLBACK_DATA);
        }
      },
      { ttl: 600 } // Cache por 10 minutos (aumentado de 5 minutos)
    );
  } catch (error) {
    console.error('Erro no serviço de cache:', error);

    // Mesmo em caso de erro no cache, retornamos dados de fallback
    // para garantir que a UI não quebre
    return NextResponse.json(FALLBACK_DATA);
  }
}
