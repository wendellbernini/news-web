'use client';

import { useEffect, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';

// Tipos para os dados do mercado
interface MarketData {
  time: number;
  close: number;
}

interface MarketResponse {
  data: MarketData[];
  currentValue: number;
  variation: number;
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

const MarketSection = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [variation, setVariation] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch('/api/market');
        if (!response.ok) throw new Error('Erro ao buscar dados');
        const data: MarketResponse = await response.json();
        setMarketData(data.data);
        setCurrentValue(data.currentValue);
        setVariation(data.variation);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="h-[160px] animate-pulse rounded-lg bg-gray-100" />;
  }

  const isPositive = variation >= 0;
  const variationColor = isPositive ? 'text-green-600' : 'text-red-600';
  const variationSign = isPositive ? '+' : '';

  // Calcula o domínio do eixo Y para mostrar melhor as variações
  const values = marketData.map((d) => d.close);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * 0.1;

  return (
    <div className="rounded-lg bg-gray-50 p-8">
      <div className="mb-4 flex items-baseline gap-2">
        <h3 className="text-sm text-gray-600">Ibovespa</h3>
        <span className="text-lg font-bold">{formatNumber(currentValue)}</span>
        <span className={`${variationColor} text-sm font-medium`}>
          {variationSign}
          {formatNumber(variation)}%
        </span>
      </div>

      <div className="-mx-2 h-[100px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={marketData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isPositive ? '#22c55e' : '#dc2626'}
                  stopOpacity={0.15}
                />
                <stop
                  offset="95%"
                  stopColor={isPositive ? '#22c55e' : '#dc2626'}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <YAxis domain={[min - padding, max + padding]} hide type="number" />
            <Area
              type="natural"
              dataKey="close"
              stroke={isPositive ? '#22c55e' : '#dc2626'}
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#colorValue)"
              isAnimationActive={false}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MarketSection;
