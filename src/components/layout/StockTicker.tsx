'use client';

import { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
}

// Dados mockados para desenvolvimento
const initialQuotes: StockQuote[] = [
  { symbol: 'USD', price: 5.73, change: 0.15 }, // Dólar primeiro
  { symbol: 'IBOV', price: 130750.25, change: 0.45 },
  { symbol: 'PETR4', price: 35.82, change: -0.23 },
  { symbol: 'VALE3', price: 68.95, change: 1.12 },
  { symbol: 'ITUB4', price: 32.48, change: 0.78 },
  { symbol: 'BBDC4', price: 15.93, change: -0.34 },
];

export function StockTicker() {
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);

  // Detecta se é dispositivo móvel
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Verifica inicialmente
    checkIfMobile();

    // Adiciona listener para redimensionamento
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Atualiza preços
  useEffect(() => {
    // Função de atualização movida para dentro do useEffect
    const updatePrices = () => {
      setQuotes(
        initialQuotes.map((quote) => ({
          ...quote,
          price: quote.price * (1 + (Math.random() * 0.002 - 0.001)),
          change: quote.change + (Math.random() * 0.2 - 0.1),
        }))
      );
    };

    // Atualiza inicialmente
    updatePrices();

    // Atualiza a cada 3 segundos
    const interval = setInterval(updatePrices, 3000);
    return () => clearInterval(interval);
  }, []); // Agora não precisa de dependências externas

  // Rotação do carrossel em dispositivos móveis
  useEffect(() => {
    if (!isMobile || quotes.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isMobile, quotes.length]);

  if (quotes.length === 0) {
    return (
      <div className="h-8 border-y border-secondary-200 bg-white dark:border-secondary-800 dark:bg-secondary-900" />
    );
  }

  // Versão para dispositivos móveis (carrossel)
  if (isMobile) {
    return (
      <div className="border-y border-secondary-200 bg-white dark:border-secondary-800 dark:bg-secondary-900">
        <div className="container h-8 overflow-hidden" ref={tickerRef}>
          <div className="relative flex h-full items-center justify-center py-1.5">
            {quotes.map((quote, index) => {
              // Determina a posição de cada item
              let position = 'opacity-0 translate-x-full';

              if (index === currentIndex) {
                position = 'opacity-100 translate-x-0';
              } else if (
                index ===
                (currentIndex - 1 + quotes.length) % quotes.length
              ) {
                position = 'opacity-0 -translate-x-full';
              }

              return (
                <div
                  key={`${quote.symbol}-${index}`}
                  className={`absolute flex w-full items-center justify-center gap-2 text-sm transition-all duration-500 ${position}`}
                >
                  <span className="font-medium text-secondary-900 dark:text-secondary-100">
                    {quote.symbol === 'USD' ? 'USD/BRL' : quote.symbol}
                  </span>
                  <span className="text-secondary-900 dark:text-secondary-100">
                    {quote.price.toFixed(2)}
                  </span>
                  <span
                    className={`flex items-center gap-1 ${
                      quote.change > 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {quote.change > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(quote.change).toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Versão para desktop (todas as cotações em linha)
  return (
    <div className="border-y border-secondary-200 bg-white dark:border-secondary-800 dark:bg-secondary-900">
      <div className="container h-8">
        <div className="no-scrollbar flex items-center gap-8 overflow-x-auto py-1.5">
          {quotes.map((quote, index) => (
            <div
              key={`${quote.symbol}-${index}`}
              className="flex items-center gap-2 text-sm transition-opacity duration-200"
            >
              <span className="font-medium text-secondary-900 dark:text-secondary-100">
                {quote.symbol === 'USD' ? 'USD/BRL' : quote.symbol}
              </span>
              <span className="text-secondary-900 dark:text-secondary-100">
                {quote.price.toFixed(2)}
              </span>
              <span
                className={`flex items-center gap-1 ${
                  quote.change > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {quote.change > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(quote.change).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
