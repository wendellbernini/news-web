'use client';

import { useState, useEffect } from 'react';
import { useNews } from '@/hooks/useNews';
import Link from 'next/link';
import { Clock, Sun } from 'lucide-react';

interface Weather {
  temp: number;
  lastUpdate: Date;
}

export function NewsTicker() {
  const { news } = useNews();
  const [currentTime, setCurrentTime] = useState('');
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [weather, setWeather] = useState<Weather | null>(null);

  // Busca a temperatura do Rio
  const fetchWeather = async () => {
    try {
      const response = await fetch('https://wttr.in/Rio+de+Janeiro?format=j1');
      const data = await response.json();
      setWeather({
        temp: Number(data.current_condition[0].temp_C),
        lastUpdate: new Date(),
      });
    } catch (error) {
      console.error('Erro ao buscar temperatura:', error);
    }
  };

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
    const interval = setInterval(fetchWeather, 300000);
    return () => clearInterval(interval);
  }, []);

  // Alterna entre as notícias a cada 5 segundos
  useEffect(() => {
    if (news.length === 0) return;
    const interval = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % news.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [news.length]);

  if (news.length === 0) return null;

  const currentNews = news[currentNewsIndex];

  return (
    <div className="bg-black text-white dark:bg-[rgb(33,33,33)]">
      <div className="container flex h-10 items-center justify-between text-sm">
        <div className="flex flex-1 items-center gap-6">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <span className="font-medium">{weather?.temp ?? '--'}°C</span>
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
