import { CacheConfig } from '@/types';

// Cache em memória para dados frequentes
const memoryCache = new Map<string, { data: any; timestamp: number }>();

// Métricas do cache
const metrics = {
  hits: 0,
  misses: 0,
  size: 0,
};

// Configurações padrão
const defaultConfig: CacheConfig = {
  enabled: true,
  duration: 3600, // 1 hora em segundos
  cdnEnabled: false,
  cdnUrl: '',
};

// Interface para dados em cache
interface CacheData<T> {
  data: T;
  timestamp: number;
  version: string;
}

interface CacheOptions {
  ttl?: number;
  useMemoryOnly?: boolean;
}

/**
 * Processa datas em objetos antes de serializar
 */
function processDataForStorage(data: any): any {
  if (data instanceof Date) {
    return { __isDate: true, value: data.toISOString() };
  }
  if (Array.isArray(data)) {
    return data.map(processDataForStorage);
  }
  if (data && typeof data === 'object') {
    const processed: any = {};
    for (const [key, value] of Object.entries(data)) {
      processed[key] = processDataForStorage(value);
    }
    return processed;
  }
  return data;
}

/**
 * Restaura datas em objetos após deserializar
 */
function processDataFromStorage(data: any): any {
  if (data && data.__isDate && data.value) {
    return new Date(data.value);
  }
  if (Array.isArray(data)) {
    return data.map(processDataFromStorage);
  }
  if (data && typeof data === 'object') {
    const processed: any = {};
    for (const [key, value] of Object.entries(data)) {
      processed[key] = processDataFromStorage(value);
    }
    return processed;
  }
  return data;
}

/**
 * Serviço de Cache
 * Implementa uma estratégia de cache em múltiplas camadas (memória e localStorage)
 */
export class CacheService {
  private config: CacheConfig;
  private readonly VERSION = '1.0.0';

  constructor(config?: Partial<CacheConfig>) {
    this.config = { ...defaultConfig, ...config };

    // Adiciona comando ao console para debug
    if (typeof window !== 'undefined') {
      (window as any).cacheDebug = {
        metrics: () => console.table(metrics),
        keys: () =>
          console.table(
            Array.from(memoryCache.keys()).map((key) => ({
              key,
              age:
                Math.round(
                  (Date.now() - (memoryCache.get(key)?.timestamp || 0)) / 1000
                ) + 's',
            }))
          ),
        clear: () => this.clear(),
      };
      console.info(
        'Cache debug disponível via cacheDebug.metrics(), cacheDebug.keys() e cacheDebug.clear()'
      );
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
    options?: { ttl?: number; useMemoryOnly?: boolean }
  ): Promise<T> {
    if (!this.config.enabled) {
      return fetchFn();
    }

    const ttl = options?.ttl || this.config.duration;

    // Tenta obter do cache em memória primeiro
    const memoryData = memoryCache.get(key);
    if (memoryData && Date.now() - memoryData.timestamp < ttl * 1000) {
      metrics.hits++;
      return processDataFromStorage(memoryData.data);
    }

    // Se não estiver na memória e useMemoryOnly for true, busca novos dados
    if (options?.useMemoryOnly) {
      const freshData = await fetchFn();
      this.setMemoryCache(key, freshData);
      return freshData;
    }

    // Tenta obter do localStorage
    try {
      const stored = localStorage.getItem(`cache_${key}`);
      if (stored) {
        const { data, timestamp, version }: CacheData<T> = JSON.parse(stored);

        // Verifica versão e validade
        if (version === this.VERSION && Date.now() - timestamp < ttl * 1000) {
          metrics.hits++;
          const processedData = processDataFromStorage(data);
          this.setMemoryCache(key, processedData);
          return processedData;
        }
      }
    } catch (error) {
      console.error('Erro ao ler cache:', error);
    }

    // Cache miss
    metrics.misses++;
    const freshData = await fetchFn();

    // Salva em ambos os caches
    this.set(key, freshData);

    return freshData;
  }

  /**
   * Salva dados no cache
   */
  set<T>(key: string, data: T, options?: CacheOptions | boolean): void {
    if (!this.config.enabled) return;

    const processedData = processDataForStorage(data);
    const useMemoryOnly =
      typeof options === 'boolean' ? options : options?.useMemoryOnly || false;

    // Sempre salva em memória
    this.setMemoryCache(key, processedData);

    // Se não for memory-only, salva também no localStorage
    if (!useMemoryOnly) {
      try {
        const cacheData: CacheData<T> = {
          data: processedData,
          timestamp: Date.now(),
          version: this.VERSION,
        };
        localStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
      } catch (error) {
        console.error('Erro ao salvar cache:', error);
      }
    }
    metrics.size = memoryCache.size;
  }

  /**
   * Remove item do cache
   */
  remove(key: string): void {
    memoryCache.delete(key);
    metrics.size = memoryCache.size;
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.error('Erro ao remover cache:', error);
    }
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    memoryCache.clear();
    metrics.size = 0;
    metrics.hits = 0;
    metrics.misses = 0;
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith('cache_'))
        .forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  }

  /**
   * Atualiza configurações do cache
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  private setMemoryCache<T>(key: string, data: T): void {
    memoryCache.set(key, {
      data,
      timestamp: Date.now(),
    });
    metrics.size = memoryCache.size;
  }
}

// Exporta instância única do serviço
export const cacheService = new CacheService();
