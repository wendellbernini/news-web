import { CacheConfig } from '@/types';

// Configurações padrão
const defaultConfig: CacheConfig = {
  enabled: true,
  duration: 3600, // 1 hora em segundos
  cdnEnabled: false,
  cdnUrl: '',
};

interface CacheOptions {
  ttl?: number;
  useMemoryOnly?: boolean;
}

/**
 * Serviço de Cache
 * Implementa uma estratégia de cache em múltiplas camadas (memória e localStorage)
 */
export class CacheService {
  private config: CacheConfig;
  private cache: Map<string, { value: unknown; expires: number }> = new Map();
  private metrics = {
    hits: 0,
    misses: 0,
    reads: 0,
  };

  constructor(config?: Partial<CacheConfig>) {
    this.config = { ...defaultConfig, ...config };

    // Adiciona comando ao console para debug
    if (typeof window !== 'undefined') {
      (window as { cacheMetrics?: () => void }).cacheMetrics = () => {
        console.table({
          'Cache Hits': this.metrics.hits,
          'Cache Misses': this.metrics.misses,
          'Taxa de Acerto': `${Math.round((this.metrics.hits / (this.metrics.hits + this.metrics.misses)) * 100)}%`,
          'Leituras Firestore': this.metrics.reads,
          'Itens em Cache': this.cache.size,
        });

        console.group('Itens em Cache');
        Array.from(this.cache.entries()).forEach(([key, value]) => {
          const timeLeft = Math.round((value.expires - Date.now()) / 1000);
          console.debug(`${key}: expira em ${timeLeft}s`);
        });
        console.groupEnd();
      };
    }
  }

  /**
   * Obtém dados do cache
   * @param key Chave do cache
   * @param fetchFn Função para buscar dados se não estiverem em cache
   * @param options Opções de cache
   */
  async get<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && cached.expires > now) {
      this.metrics.hits++;
      console.debug(`Cache hit: ${key}`);
      return cached.value as T;
    }

    this.metrics.misses++;
    console.debug(`Cache miss: ${key}`);

    const value = await fetchFn();
    this.metrics.reads++;

    const ttl = options.ttl || 300; // 5 minutos por padrão
    this.cache.set(key, {
      value,
      expires: now + ttl * 1000,
    });

    return value;
  }

  /**
   * Salva dados no cache
   */
  set<T>(key: string, value: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || 300;
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl * 1000,
    });
    console.debug(`Cache set: ${key}`);
  }

  /**
   * Remove item do cache
   */
  remove(key: string): void {
    this.cache.delete(key);
    console.debug(`Cache remove: ${key}`);
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
    this.metrics = {
      hits: 0,
      misses: 0,
      reads: 0,
    };
    console.debug('Cache cleared');
  }

  /**
   * Atualiza configurações do cache
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Limpa o cache de um usuário específico
   */
  clearUserCache(userId: string): void {
    // Remove todos os itens que contenham o ID do usuário
    Array.from(this.cache.keys())
      .filter((key) => key.includes(userId))
      .forEach((key) => this.cache.delete(key));

    console.debug(`Cache limpo para usuário: ${userId}`);
  }
}

// Exporta instância única do serviço
export const cacheService = new CacheService();
