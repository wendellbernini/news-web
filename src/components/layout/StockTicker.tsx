'use client';

import { useState, useEffect } from 'react';
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

  if (quotes.length === 0) {
    return (
      <div className="h-8 border-y border-secondary-200 bg-white dark:border-secondary-800 dark:bg-secondary-900" />
    );
  }

  return (
    <div className="border-y border-secondary-200 bg-white dark:border-secondary-800 dark:bg-secondary-900">
      <div className="container h-8">
        <div className="flex items-center gap-8 py-1.5">
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
