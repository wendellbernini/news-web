'use client';

import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

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

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.[0]) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
      <p className="font-medium">{formatNumber(payload[0].value)}</p>
      <p className="text-xs text-gray-500">
        {new Date(payload[0].payload.time * 1000).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </div>
  );
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
        console.log('Dados do mercado:', data); // Debug temporário
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

  return (
    <div className="rounded-lg bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="mb-3 flex items-baseline gap-2 sm:mb-4">
        <h3 className="text-xs text-gray-600 sm:text-sm">Ibovespa</h3>
        <span className="text-base font-bold sm:text-lg">
          {formatNumber(currentValue)}
        </span>
        <span className={`${variationColor} text-xs font-medium sm:text-sm`}>
          {variationSign}
          {formatNumber(variation)}%
        </span>
      </div>

      <div className="-mx-2 h-[120px] sm:h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={marketData}
            margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isPositive ? '#22c55e' : '#dc2626'}
                  stopOpacity={0.2}
                />
                <stop
                  offset="95%"
                  stopColor={isPositive ? '#22c55e' : '#dc2626'}
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
              vertical={false}
            />
            <YAxis
              domain={['auto', 'auto']}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#6B7280' }}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="close"
              stroke={isPositive ? '#22c55e' : '#dc2626'}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MarketSection;
