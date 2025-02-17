'use client';

import { useState, useEffect } from 'react';
import { useNews } from '@/hooks/useNews';
import Link from 'next/link';
import { Clock } from 'lucide-react';

export function NewsTicker() {
  const { news } = useNews();
  const [currentTime, setCurrentTime] = useState('');
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

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
    <div className="bg-primary-600 text-white">
      <div className="container flex h-10 items-center justify-between text-sm">
        <div className="flex flex-1 items-center">
          <span className="z-10 mr-4 shrink-0 bg-primary-600 font-bold uppercase">
            Última Notícia:
          </span>
          <div className="relative flex-1 overflow-hidden">
            <div className="absolute inset-y-0 left-0 z-[5] w-8 bg-gradient-to-r from-primary-600 to-transparent" />
            <div className="absolute inset-y-0 right-0 z-[5] w-8 bg-gradient-to-l from-primary-600 to-transparent" />
            <Link
              href={`/noticias/${currentNews.slug}`}
              className="animate-slide-left inline-block whitespace-nowrap hover:underline"
            >
              {currentNews.title}
            </Link>
          </div>
        </div>
        <div className="ml-4 flex shrink-0 items-center gap-2 border-l border-white/20 pl-4">
          <Clock className="h-4 w-4" />
          <span>{currentTime}</span>
        </div>
      </div>
    </div>
  );
}
