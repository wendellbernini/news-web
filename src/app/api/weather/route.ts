import { NextRequest, NextResponse } from 'next/server';
import { withDefaultMiddleware } from '../middleware';
import { cacheService } from '@/lib/cache';

// Chave de cache para os dados de clima
const WEATHER_CACHE_KEY = 'weather_rio_de_janeiro';

/**
 * Rota de API para buscar dados de clima do wttr.in
 * Esta rota serve como um proxy para a API externa, evitando problemas de CORS e CSP
 */
async function handler(_request: NextRequest) {
  try {
    // Tentar obter dados do cache primeiro
    return await cacheService.get(
      WEATHER_CACHE_KEY,
      async () => {
        // Criar um AbortController para definir um timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout

        // Fazer a requisição para a API externa
        const response = await fetch(
          'https://wttr.in/Rio+de+Janeiro?format=j1',
          {
            signal: controller.signal,
            headers: {
              'User-Agent': 'Rio de Fato News Portal',
            },
          }
        );

        // Limpar o timeout
        clearTimeout(timeoutId);

        // Verificar se a resposta foi bem-sucedida
        if (!response.ok) {
          throw new Error(
            `Erro ao buscar dados de clima: ${response.status} ${response.statusText}`
          );
        }

        // Obter os dados da resposta
        const data = await response.json();

        // Verificar se os dados contêm a temperatura
        if (!data?.current_condition?.[0]?.temp_C) {
          throw new Error('Dados de temperatura não encontrados na resposta');
        }

        // Preparar resposta formatada
        const weatherData = {
          temp: Number(data.current_condition[0].temp_C),
          lastUpdate: new Date().toISOString(),
        };

        // Retornar os dados de clima
        return NextResponse.json(weatherData);
      },
      { ttl: 1800 } // Cache por 30 minutos
    );
  } catch (error) {
    console.error('Erro ao buscar dados de clima:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

// Aplicar middleware de rate limiting e segurança
export const GET = withDefaultMiddleware(handler);
