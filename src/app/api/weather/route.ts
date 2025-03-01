import { NextRequest, NextResponse } from 'next/server';
import { withDefaultMiddleware } from '../middleware';
import { cacheService } from '@/lib/cache';

// Chave de cache para os dados de clima
const WEATHER_CACHE_KEY = 'weather_rio_de_janeiro';

// Dados de fallback para quando a API externa falhar
const FALLBACK_WEATHER_DATA = {
  temp: 28,
  lastUpdate: new Date().toISOString(),
};

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
            }
          );

          // Limpar o timeout
          clearTimeout(timeoutId);

          // Verificar se a resposta foi bem-sucedida
          if (!response.ok) {
            console.error(
              `Erro na API de clima: ${response.status} ${response.statusText}`
            );

            // Se for erro 429 (Too Many Requests), retornar dados de fallback
            // mas não armazenar no cache para tentar novamente mais tarde
            if (response.status === 429) {
              console.log(
                'Limite de requisições atingido na API de clima, usando fallback'
              );
              return NextResponse.json(FALLBACK_WEATHER_DATA);
            }

            throw new Error(
              `Erro ao buscar dados de clima: ${response.status} ${response.statusText}`
            );
          }

          // Verificar se o corpo da resposta está vazio
          const text = await response.text();
          if (!text || text.trim() === '') {
            console.error('Resposta vazia da API de clima');
            throw new Error('Resposta vazia da API');
          }

          // Tentar fazer o parse do JSON com tratamento de erro
          let data;
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            console.error('Erro ao fazer parse do JSON:', parseError);
            throw new Error('Resposta JSON inválida');
          }

          // Verificar se os dados contêm a temperatura
          if (!data?.current_condition?.[0]?.temp_C) {
            console.error(
              'Dados de temperatura não encontrados na resposta:',
              data
            );
            throw new Error('Dados de temperatura não encontrados na resposta');
          }

          // Preparar resposta formatada
          const weatherData = {
            temp: Number(data.current_condition[0].temp_C),
            lastUpdate: new Date().toISOString(),
          };

          // Retornar os dados de clima
          return NextResponse.json(weatherData);
        } catch (fetchError) {
          console.error('Erro ao buscar dados de clima:', fetchError);

          // Retornar dados de fallback em caso de erro
          console.log('Usando dados de fallback para o clima');
          return NextResponse.json(FALLBACK_WEATHER_DATA);
        }
      },
      { ttl: 3600 } // Cache por 1 hora (aumentado de 30 minutos)
    );
  } catch (error) {
    console.error('Erro no serviço de cache:', error);

    // Mesmo em caso de erro no cache, retornamos dados de fallback
    return NextResponse.json(FALLBACK_WEATHER_DATA);
  }
}

// Aplicar middleware de rate limiting e segurança
export const GET = withDefaultMiddleware(handler);
