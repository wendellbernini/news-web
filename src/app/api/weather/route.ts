import { NextResponse } from 'next/server';
import { withDefaultMiddleware } from '../middleware';
import { cacheService } from '@/lib/cache';

// Chave de cache para os dados de clima
const WEATHER_CACHE_KEY = 'weather_rio_de_janeiro';

// Dados de fallback para quando a API externa falhar
const FALLBACK_WEATHER_DATA = {
  temperature: 28,
  lastUpdated: new Date().toISOString(),
};

/**
 * Rota de API para buscar dados de clima do wttr.in
 * Esta rota serve como um proxy para a API externa, evitando problemas de CORS e CSP
 */
async function handler() {
  // Sempre retornar um conteúdo válido, mesmo em caso de erro
  try {
    // Adicionar um atraso mínimo para evitar problemas de race condition
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Tentar obter dados do cache primeiro
    const cachedData = await cacheService.get(
      WEATHER_CACHE_KEY,
      async () => {
        try {
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
              cache: 'no-store',
            }
          );

          // Limpar o timeout
          clearTimeout(timeoutId);

          // Verificar se a resposta foi bem-sucedida
          if (!response.ok) {
            console.error(
              `Erro na API de clima: ${response.status} ${response.statusText}`
            );
            return FALLBACK_WEATHER_DATA;
          }

          // Verificar se o corpo da resposta está vazio
          const text = await response.text();
          if (!text || text.trim() === '') {
            console.error('Resposta vazia da API de clima');
            return FALLBACK_WEATHER_DATA;
          }

          // Tentar fazer o parse do JSON com tratamento de erro
          let data;
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            console.error('Erro ao fazer parse do JSON:', parseError);
            return FALLBACK_WEATHER_DATA;
          }

          // Verificar se os dados contêm a temperatura
          if (!data?.current_condition?.[0]?.temp_C) {
            console.error(
              'Dados de temperatura não encontrados na resposta:',
              data
            );
            return FALLBACK_WEATHER_DATA;
          }

          // Preparar resposta formatada
          const weatherData = {
            temperature: Number(data.current_condition[0].temp_C),
            lastUpdated: new Date().toISOString(),
          };

          // Retornar os dados de clima
          return weatherData;
        } catch (fetchError) {
          console.error('Erro ao buscar dados de clima:', fetchError);
          // Retornar dados de fallback em caso de erro
          return FALLBACK_WEATHER_DATA;
        }
      },
      { ttl: 3600 } // Cache por 1 hora
    );

    // Garantir que sempre retornamos um objeto válido
    return NextResponse.json(cachedData || FALLBACK_WEATHER_DATA, {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Erro no serviço de cache:', error);
    // Mesmo em caso de erro no cache, retornamos dados de fallback
    return NextResponse.json(FALLBACK_WEATHER_DATA, {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json',
      },
    });
  }
}

// Aplicar middleware de rate limiting e segurança
export const GET = withDefaultMiddleware(handler);
