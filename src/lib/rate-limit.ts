interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

interface RateLimitEntry {
  count: number;
  reset: number;
  firstRequest: number;
}

interface RateLimitConfig {
  windowSizeInSeconds: number;
  maxRequestsPerWindow: number;
  blockDurationInSeconds?: number;
}

// Configurações padrão para diferentes tipos de endpoints
export const RATE_LIMIT_CONFIGS = {
  DEFAULT: {
    windowSizeInSeconds: 60,
    maxRequestsPerWindow: 100,
  },
  AUTH: {
    windowSizeInSeconds: 60,
    maxRequestsPerWindow: 10,
    blockDurationInSeconds: 300, // 5 minutos de bloqueio após exceder limite
  },
  PUBLIC_API: {
    windowSizeInSeconds: 60,
    maxRequestsPerWindow: 30,
  },
  ADMIN_API: {
    windowSizeInSeconds: 60,
    maxRequestsPerWindow: 200,
  },
};

// Em produção, use Redis ou similar
const rateLimitStore = new Map<string, RateLimitEntry>();
const blockedIPs = new Map<string, number>(); // IP -> tempo de desbloqueio

/**
 * Implementa rate limiting baseado em IP e/ou API key
 * @param request - O objeto Request
 * @param config - Configuração de rate limiting
 * @returns Resultado do rate limiting
 */
export async function rateLimit(
  request: Request,
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.DEFAULT
): Promise<RateLimitResult> {
  const ip =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const apiKey = request.headers.get('x-api-key') || '';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Criar uma chave única baseada em IP, API key e user agent
  const key = `${ip}-${apiKey}-${userAgent}`;

  const now = Math.floor(Date.now() / 1000);

  // Verificar se o IP está bloqueado
  if (config.blockDurationInSeconds && blockedIPs.has(ip)) {
    const unblockTime = blockedIPs.get(ip) || 0;
    if (now < unblockTime) {
      return {
        success: false,
        limit: config.maxRequestsPerWindow,
        remaining: 0,
        reset: unblockTime,
      };
    } else {
      // Remover do bloqueio se o tempo expirou
      blockedIPs.delete(ip);
    }
  }

  const windowStart = now - (now % config.windowSizeInSeconds);
  const windowEnd = windowStart + config.windowSizeInSeconds;

  // Limpar entradas antigas
  Array.from(rateLimitStore.keys()).forEach((storedKey) => {
    const entry = rateLimitStore.get(storedKey);
    if (entry && entry.reset < now) {
      rateLimitStore.delete(storedKey);
    }
  });

  // Obter ou criar entrada
  const entry = rateLimitStore.get(key) || {
    count: 0,
    reset: windowEnd,
    firstRequest: now,
  };

  // Se a janela expirou, resetar contagem
  if (entry.reset < now) {
    entry.count = 0;
    entry.reset = windowEnd;
    entry.firstRequest = now;
  }

  // Incrementar contagem
  entry.count++;
  rateLimitStore.set(key, entry);

  const remaining = Math.max(0, config.maxRequestsPerWindow - entry.count);
  const success = entry.count <= config.maxRequestsPerWindow;

  // Se excedeu o limite e tem configuração de bloqueio, bloquear o IP
  if (!success && config.blockDurationInSeconds) {
    const blockUntil = now + config.blockDurationInSeconds;
    blockedIPs.set(ip, blockUntil);
  }

  return {
    success,
    limit: config.maxRequestsPerWindow,
    remaining,
    reset: entry.reset,
  };
}

/**
 * Verifica se uma requisição deve ser limitada
 * @param result - Resultado do rate limiting
 * @param response - Objeto Response para adicionar headers
 * @returns true se a requisição deve ser bloqueada
 */
export function applyRateLimitHeaders(
  result: RateLimitResult,
  response: Response
): boolean {
  // Adicionar headers de rate limiting
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.reset.toString());

  if (!result.success) {
    response.headers.set(
      'Retry-After',
      (result.reset - Math.floor(Date.now() / 1000)).toString()
    );
  }

  return !result.success;
}
