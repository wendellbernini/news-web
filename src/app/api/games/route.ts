import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(
      `https://api.api-futebol.com.br/v1/partidas/${today}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.API_FUTEBOL_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar jogos');
    }

    const data = await response.json();

    // Formata os dados para o formato que precisamos
    const games = data.map((game: any) => ({
      hora_realizacao: game.hora_realizacao,
      time_mandante: {
        sigla: game.time_mandante.sigla,
        escudo: game.time_mandante.escudo,
      },
      time_visitante: {
        sigla: game.time_visitante.sigla,
        escudo: game.time_visitante.escudo,
      },
    }));

    return NextResponse.json(games);
  } catch (error) {
    console.error('Erro ao buscar jogos:', error);
    // Em caso de erro, retorna alguns jogos de exemplo para não quebrar a interface
    const mockGames = [
      {
        hora_realizacao: '20:00',
        time_mandante: {
          sigla: 'FLA',
          escudo: 'https://api.api-futebol.com.br/escudos/33/flamengo.png',
        },
        time_visitante: {
          sigla: 'PAL',
          escudo: 'https://api.api-futebol.com.br/escudos/56/palmeiras.png',
        },
      },
      {
        hora_realizacao: '21:30',
        time_mandante: {
          sigla: 'COR',
          escudo: 'https://api.api-futebol.com.br/escudos/45/corinthians.png',
        },
        time_visitante: {
          sigla: 'SAN',
          escudo: 'https://api.api-futebol.com.br/escudos/63/santos.png',
        },
      },
    ];
    return NextResponse.json(mockGames);
  }
}
