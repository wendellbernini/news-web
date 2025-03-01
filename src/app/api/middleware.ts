import { NextRequest, NextResponse } from 'next/server';
import {
  rateLimit,
  applyRateLimitHeaders,
  RATE_LIMIT_CONFIGS,
} from '@/lib/rate-limit';
import { logSecurityEvent, logPerformance, logError } from '@/lib/monitoring';

/**
 * Middleware para aplicar rate limiting nas rotas da API
 * @param request - Objeto NextRequest
 * @param handler - Função de manipulação da requisição
 * @returns Resposta da API com rate limiting aplicado
 */
export async function withRateLimit(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Determinar qual configuração de rate limit usar com base no caminho
    let config = RATE_LIMIT_CONFIGS.DEFAULT;

    const path = request.nextUrl.pathname;

    if (path.includes('/api/auth/')) {
      config = RATE_LIMIT_CONFIGS.AUTH;
    } else if (path.includes('/api/admin/')) {
      config = RATE_LIMIT_CONFIGS.ADMIN_API;
    } else if (path.includes('/api/v1/')) {
      config = RATE_LIMIT_CONFIGS.PUBLIC_API;
    }

    // Aplicar rate limiting
    const result = await rateLimit(request, config);

    if (!result.success) {
      // Se excedeu o limite, retornar 429 Too Many Requests
      const response = NextResponse.json(
        {
          error: 'Too Many Requests',
          message:
            'Você excedeu o limite de requisições. Por favor, tente novamente mais tarde.',
        },
        { status: 429 }
      );

      // Adicionar headers de rate limiting
      applyRateLimitHeaders(result, response);

      // Registrar evento de segurança para tentativas de exceder o limite
      const ip =
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown';

      logSecurityEvent('Rate limit excedido', {
        severity: 'medium',
        path: request.nextUrl.pathname,
        ip,
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: {
          limit: result.limit,
          remaining: result.remaining,
          reset: result.reset,
        },
      }).catch(console.error);

      return response;
    }

    // Processar a requisição normalmente
    const response = await handler(request);

    // Adicionar headers de rate limiting à resposta
    applyRateLimitHeaders(result, response);

    return response;
  } catch (error) {
    console.error('[API Rate Limit Middleware]', error);

    // Registrar erro
    logError(error, {
      severity: 'medium',
      path: request.nextUrl.pathname,
      details: {
        headers: Object.fromEntries(request.headers),
      },
    }).catch(console.error);

    // Em caso de erro no middleware, permitir a requisição mas registrar o erro
    return handler(request);
  }
}

/**
 * Middleware para aplicar segurança básica em todas as rotas da API
 * @param request - Objeto NextRequest
 * @param handler - Função de manipulação da requisição
 * @returns Resposta da API com headers de segurança
 */
export async function withApiSecurity(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Processar a requisição
    const response = await handler(request);

    // Adicionar headers de segurança
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
  } catch (error) {
    console.error('[API Security Middleware]', error);

    // Registrar erro
    logError(error, {
      severity: 'high',
      path: request.nextUrl.pathname,
      details: {
        headers: Object.fromEntries(request.headers),
      },
    }).catch(console.error);

    // Em caso de erro no middleware, permitir a requisição mas registrar o erro
    return handler(request);
  }
}

/**
 * Middleware para monitorar performance das APIs
 * @param request - Objeto NextRequest
 * @param handler - Função de manipulação da requisição
 * @returns Resposta da API com monitoramento de performance
 */
export async function withMonitoring(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const start = performance.now();

  try {
    // Processar a requisição
    const response = await handler(request);

    // Registrar performance
    const duration = performance.now() - start;

    // Registrar apenas se a duração for significativa (> 500ms)
    if (duration > 500) {
      const ip =
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown';

      logPerformance(
        `API ${request.method} ${request.nextUrl.pathname}`,
        duration,
        {
          path: request.nextUrl.pathname,
          details: {
            method: request.method,
            status: response.status,
            ip,
          },
        }
      ).catch(console.error);
    }

    return response;
  } catch (error) {
    // Registrar erro e performance
    const duration = performance.now() - start;
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    logError(error, {
      severity: 'high',
      path: request.nextUrl.pathname,
      ip,
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: {
        duration,
        method: request.method,
      },
    }).catch(console.error);

    throw error;
  }
}

/**
 * Combina múltiplos middlewares em um único handler
 * @param middlewares - Array de funções de middleware
 * @param handler - Handler final da requisição
 * @returns Função combinada que aplica todos os middlewares
 */
export function withMiddleware(
  middlewares: Array<
    (
      request: NextRequest,
      handler: (request: NextRequest) => Promise<NextResponse>
    ) => Promise<NextResponse>
  >,
  handler: (request: NextRequest) => Promise<NextResponse>
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    // Função que aplica os middlewares em sequência
    const applyMiddleware = async (
      index: number,
      req: NextRequest
    ): Promise<NextResponse> => {
      // Se chegou ao final da cadeia, executar o handler
      if (index >= middlewares.length) {
        return handler(req);
      }

      // Aplicar o middleware atual e passar para o próximo
      const nextMiddleware = (nextReq: NextRequest) =>
        applyMiddleware(index + 1, nextReq);
      return middlewares[index](req, nextMiddleware);
    };

    return applyMiddleware(0, request);
  };
}

/**
 * Middleware padrão para todas as rotas da API
 * Aplica rate limiting, segurança básica e monitoramento
 */
export const withDefaultMiddleware = (
  handler: (request: NextRequest) => Promise<NextResponse>
) => withMiddleware([withRateLimit, withApiSecurity, withMonitoring], handler);
