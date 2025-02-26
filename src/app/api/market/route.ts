import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Busca dados com intervalo de 5 minutos do dia atual
    const response = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/%5EBVSP?interval=5m&range=1d',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar dados do mercado');
    }

    const data = await response.json();

    // Filtra apenas dados válidos (remove valores nulos/undefined)
    const { timestamp, indicators } = data.chart.result[0];
    const quotes = indicators.quote[0];
    const validData = timestamp
      .map((time: number, index: number) => ({
        time,
        close: quotes.close[index],
      }))
      .filter((item: any) => item.close !== null && item.close !== undefined);

    // Calcula variação
    const lastPrice = validData[validData.length - 1].close;
    const firstPrice = validData[0].close;
    const variation = ((lastPrice - firstPrice) / firstPrice) * 100;

    return NextResponse.json({
      data: validData,
      currentValue: lastPrice,
      variation,
    });
  } catch (error) {
    console.error('Erro ao buscar dados do mercado:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados do mercado' },
      { status: 500 }
    );
  }
}
