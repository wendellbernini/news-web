'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNews } from '@/hooks/useNews';
import Link from 'next/link';
import { Clock, Sun, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WeatherData {
  temperature: number;
  lastUpdated: string;
}

export function NewsTicker() {
  const { news } = useNews();
  const [currentTime, setCurrentTime] = useState('');
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherError, setWeatherError] = useState<boolean>(false);
  const [weatherRetryCount, setWeatherRetryCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const weatherTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reseta o índice quando as notícias mudam
  useEffect(() => {
    setCurrentNewsIndex(0);
  }, [news]);

  /**
   * Função para buscar dados de clima da API interna
   * Utiliza useCallback para evitar recriação da função a cada renderização
   */
  const fetchWeather = useCallback(async () => {
    // Limpar timeout anterior se existir
    if (weatherTimeoutRef.current) {
      clearTimeout(weatherTimeoutRef.current);
      weatherTimeoutRef.current = null;
    }

    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Criar novo AbortController
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      // Configurar timeout de 8 segundos (aumentado para dar mais tempo)
      const timeoutId = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      }, 8000);

      weatherTimeoutRef.current = timeoutId;

      // Fazer requisição para API interna
      const response = await fetch('/api/weather', {
        signal,
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      // Limpar timeout após resposta
      clearTimeout(timeoutId);
      weatherTimeoutRef.current = null;

      if (!response.ok) {
        throw new Error(`Erro ao buscar dados do clima: ${response.status}`);
      }

      const data = await response.json();

      if (!data || (!data.temperature && !data.temp)) {
        throw new Error('Dados do clima inválidos');
      }

      setWeatherData({
        temperature: data.temperature || data.temp,
        lastUpdated:
          data.lastUpdated || data.lastUpdate || new Date().toISOString(),
      });

      setWeatherError(false);
      setWeatherRetryCount(0);
    } catch (error) {
      // Não tratar como erro se foi um cancelamento intencional
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Requisição de clima cancelada');
        return;
      }

      console.error('Erro ao buscar dados do clima:', error);
      setWeatherError(true);

      // Incrementar contador de tentativas
      setWeatherRetryCount((prev) => prev + 1);
    }
  }, []);

  // Atualiza o horário a cada segundo
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCurrentTime(formatter.format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Busca e atualiza a temperatura
  useEffect(() => {
    fetchWeather();

    // Atualizar a cada 5 minutos (300000ms), mas apenas se não estiver em estado de erro
    const interval = setInterval(() => {
      if (!weatherError) {
        fetchWeather();
      }
    }, 300000);

    return () => clearInterval(interval);
  }, [weatherError, fetchWeather]);

  // Alterna entre as notícias a cada 5 segundos
  useEffect(() => {
    if (!news?.length) return;

    const interval = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % news.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [news]);

  // Efeito para buscar dados do clima e configurar retry automático
  useEffect(() => {
    // Buscar dados iniciais
    fetchWeather();

    // Configurar intervalo para atualização a cada 5 minutos
    const intervalId = setInterval(fetchWeather, 5 * 60 * 1000);

    // Configurar retry em caso de erro (com backoff exponencial)
    let retryTimeoutId: NodeJS.Timeout | null = null;

    if (weatherError) {
      const retryDelay = Math.min(
        30000,
        5000 * Math.pow(2, weatherRetryCount - 1)
      );
      console.log(`Tentando novamente em ${retryDelay / 1000} segundos`);

      retryTimeoutId = setTimeout(() => {
        fetchWeather();
      }, retryDelay);
    }

    // Cleanup
    return () => {
      clearInterval(intervalId);

      if (retryTimeoutId) {
        clearTimeout(retryTimeoutId);
      }

      if (weatherTimeoutRef.current) {
        clearTimeout(weatherTimeoutRef.current);
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchWeather, weatherError, weatherRetryCount]);

  // Não renderiza nada se não houver notícias ou se estiver carregando
  if (!news?.length) return null;

  const currentNews = news[currentNewsIndex];

  // Verificação extra de segurança
  if (!currentNews?.slug || !currentNews?.title) return null;

  return (
    <div className="bg-black text-white dark:bg-[rgb(33,33,33)]">
      <div className="container flex h-10 items-center justify-between text-sm">
        <div className="flex flex-1 items-center gap-6">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <span className="font-medium">
              {weatherData ? (
                <div className="flex items-center">
                  <span className="font-semibold">
                    {weatherData.temperature}°C
                  </span>
                  <span className="ml-2 text-xs opacity-75">
                    Atualizado{' '}
                    {formatDistanceToNow(new Date(weatherData.lastUpdated), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
              ) : weatherError ? (
                <div className="flex items-center text-yellow-200">
                  <AlertCircle size={16} className="mr-1" />
                  <span>Atualizando clima...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="animate-pulse">Carregando clima...</span>
                </div>
              )}
            </span>
          </div>
          <div className="relative flex-1 overflow-hidden">
            <div className="absolute inset-y-0 left-0 z-[5] w-8 bg-gradient-to-r from-black to-transparent dark:from-[rgb(33,33,33)]" />
            <div className="absolute inset-y-0 right-0 z-[5] w-8 bg-gradient-to-l from-black to-transparent dark:from-[rgb(33,33,33)]" />
            <Link
              href={`/noticias/${currentNews.slug}`}
              className="animate-slide-left inline-block whitespace-nowrap hover:underline"
            >
              {currentNews.title}
            </Link>
          </div>
        </div>
        <div className="ml-4 flex shrink-0 items-center gap-4 border-l border-white/20 pl-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{currentTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
