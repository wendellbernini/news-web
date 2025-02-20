interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

interface RateLimitEntry {
  count: number;
  reset: number;
}

// Em produção, use Redis ou similar
const rateLimitStore = new Map<string, RateLimitEntry>();

const WINDOW_SIZE_IN_SECONDS = 60;
const MAX_REQUESTS_PER_WINDOW = 100;

export async function rateLimit(request: Request): Promise<RateLimitResult> {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const apiKey = request.headers.get('x-api-key') || 'unknown';
  const key = `${ip}-${apiKey}`;

  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - (now % WINDOW_SIZE_IN_SECONDS);
  const windowEnd = windowStart + WINDOW_SIZE_IN_SECONDS;

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
  };

  // Se a janela expirou, resetar contagem
  if (entry.reset < now) {
    entry.count = 0;
    entry.reset = windowEnd;
  }

  // Incrementar contagem
  entry.count++;
  rateLimitStore.set(key, entry);

  const remaining = Math.max(0, MAX_REQUESTS_PER_WINDOW - entry.count);

  return {
    success: entry.count <= MAX_REQUESTS_PER_WINDOW,
    limit: MAX_REQUESTS_PER_WINDOW,
    remaining,
    reset: entry.reset,
  };
}
