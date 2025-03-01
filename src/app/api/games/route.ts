import { NextResponse } from 'next/server';
import { cacheService } from '@/lib/cache';

// Chave de cache para os dados de jogos
const GAMES_CACHE_KEY = 'football_games_data';

interface Match {
  status: string;
  utcDate: string;
  competition: { id: number; name: string };
  homeTeam: { tla?: string; shortName?: string; crest: string };
  awayTeam: { tla?: string; shortName?: string; crest: string };
  score: {
    fullTime: { home: number | null; away: number | null };
  };
}

export async function GET() {
  try {
    // Tentar obter dados do cache primeiro
    return await cacheService.get(
      GAMES_CACHE_KEY,
      async () => {
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + 7);

        const response = await fetch(
          `https://api.football-data.org/v4/matches?dateFrom=${yesterday.toISOString().split('T')[0]}&dateTo=${nextWeek.toISOString().split('T')[0]}`,
          {
            headers: {
              'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY || '',
              Accept: 'application/json',
            },
          }
        );

        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();

        const jogos = ((data.matches as Match[]) || [])
          .sort((a: Match, b: Match) => {
            // Prioriza jogos ao vivo
            if (a.status === 'IN_PLAY' && b.status !== 'IN_PLAY') return -1;
            if (b.status === 'IN_PLAY' && a.status !== 'IN_PLAY') return 1;

            const timeA = new Date(a.utcDate);
            const timeB = new Date(b.utcDate);

            // Jogos do mesmo dia são agrupados
            if (timeA.toDateString() === timeB.toDateString()) {
              // Jogos finalizados vão para o fim do dia
              if (a.status === 'FINISHED' && b.status !== 'FINISHED') return 1;
              if (b.status === 'FINISHED' && a.status !== 'FINISHED') return -1;
            }

            // Ordenação por data/hora
            return timeA.getTime() - timeB.getTime();
          })
          .slice(0, 4)
          .map((match: Match) => ({
            hora_realizacao: new Date(match.utcDate).toLocaleTimeString(
              'pt-BR',
              {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'America/Sao_Paulo',
              }
            ),
            data: new Date(match.utcDate).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              timeZone: 'America/Sao_Paulo',
            }),
            time_mandante: {
              sigla:
                match.homeTeam.tla ||
                match.homeTeam.shortName?.substring(0, 3) ||
                '---',
              escudo: match.homeTeam.crest,
              gols:
                match.status === 'FINISHED' ? match.score.fullTime.home : null,
            },
            time_visitante: {
              sigla:
                match.awayTeam.tla ||
                match.awayTeam.shortName?.substring(0, 3) ||
                '---',
              escudo: match.awayTeam.crest,
              gols:
                match.status === 'FINISHED' ? match.score.fullTime.away : null,
            },
            campeonato: match.competition.name,
            status: match.status,
          }));

        return NextResponse.json(
          jogos.length
            ? jogos
            : [
                {
                  hora_realizacao: '--:--',
                  data: '--/--',
                  time_mandante: { sigla: '---', escudo: '', gols: null },
                  time_visitante: { sigla: '---', escudo: '', gols: null },
                  campeonato: 'Nenhum jogo programado',
                  status: 'SCHEDULED',
                },
              ]
        );
      },
      { ttl: 900 } // Cache por 15 minutos
    );
  } catch (error) {
    return NextResponse.json({ error: true, message: String(error) });
  }
}
