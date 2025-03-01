import { NextRequest, NextResponse } from 'next/server';
import { withDefaultMiddleware } from '../middleware';

/**
 * Rota de API para buscar dados de clima do wttr.in
 * Esta rota serve como um proxy para a API externa, evitando problemas de CORS e CSP
 */
async function handler(_request: NextRequest) {
  try {
    // Criar um AbortController para definir um timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout

    // Fazer a requisição para a API externa
    const response = await fetch('https://wttr.in/Rio+de+Janeiro?format=j1', {
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache',
        'User-Agent': 'Rio de Fato News Portal',
      },
    });

    // Limpar o timeout
    clearTimeout(timeoutId);

    // Verificar se a resposta foi bem-sucedida
    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Erro ao buscar dados de clima: ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    // Obter os dados da resposta
    const data = await response.json();

    // Verificar se os dados contêm a temperatura
    if (!data?.current_condition?.[0]?.temp_C) {
      return NextResponse.json(
        {
          error: 'Dados de temperatura não encontrados na resposta',
        },
        { status: 500 }
      );
    }

    // Retornar os dados de clima
    return NextResponse.json({
      temp: Number(data.current_condition[0].temp_C),
      lastUpdate: new Date().toISOString(),
    });
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
