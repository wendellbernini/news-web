import { NextResponse } from 'next/server';
import { cacheService } from '@/lib/cache';

// Chave de cache para os dados de jogos
const GAMES_CACHE_KEY = 'football_games_data';

// Dados de fallback para quando a API externa falhar
const FALLBACK_GAMES_DATA = [
  {
    hora_realizacao: '16:00',
    data: new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }),
    time_mandante: { sigla: 'FLA', escudo: '', gols: null },
    time_visitante: { sigla: 'FLU', escudo: '', gols: null },
    campeonato: 'Campeonato Brasileiro',
    status: 'SCHEDULED',
  },
  {
    hora_realizacao: '19:30',
    data: new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }),
    time_mandante: { sigla: 'BOT', escudo: '', gols: null },
    time_visitante: { sigla: 'VAS', escudo: '', gols: null },
    campeonato: 'Campeonato Brasileiro',
    status: 'SCHEDULED',
  },
];

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
  // Sempre retornar um conteúdo válido, mesmo em caso de erro
  try {
    // Adicionar um atraso mínimo para evitar problemas de race condition
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Tentar obter dados do cache primeiro
    const cachedData = await cacheService.get(
      GAMES_CACHE_KEY,
      async () => {
        try {
          // Verificar se a chave da API está configurada
          if (!process.env.FOOTBALL_DATA_API_KEY) {
            console.error('Chave da API de futebol não configurada');
            return FALLBACK_GAMES_DATA;
          }

          const now = new Date();
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          const nextWeek = new Date(now);
          nextWeek.setDate(now.getDate() + 7);

          // Criar um AbortController para definir um timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout

          const response = await fetch(
            `https://api.football-data.org/v4/matches?dateFrom=${yesterday.toISOString().split('T')[0]}&dateTo=${nextWeek.toISOString().split('T')[0]}`,
            {
              headers: {
                'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY || '',
                Accept: 'application/json',
              },
              signal: controller.signal,
              cache: 'no-store',
            }
          );

          // Limpar o timeout
          clearTimeout(timeoutId);

          if (!response.ok) {
            console.error(
              `Erro na API de jogos: ${response.status} ${response.statusText}`
            );
            return FALLBACK_GAMES_DATA;
          }

          // Verificar se o corpo da resposta está vazio
          const text = await response.text();
          if (!text || text.trim() === '') {
            console.error('Resposta vazia da API de jogos');
            return FALLBACK_GAMES_DATA;
          }

          // Tentar fazer o parse do JSON com tratamento de erro
          let data;
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            console.error('Erro ao fazer parse do JSON:', parseError);
            return FALLBACK_GAMES_DATA;
          }

          // Validar a estrutura dos dados
          if (!data || !Array.isArray(data.matches)) {
            console.error('Estrutura de dados inválida:', data);
            return FALLBACK_GAMES_DATA;
          }

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
                if (a.status === 'FINISHED' && b.status !== 'FINISHED')
                  return 1;
                if (b.status === 'FINISHED' && a.status !== 'FINISHED')
                  return -1;
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
                  match.status === 'FINISHED'
                    ? match.score.fullTime.home
                    : null,
              },
              time_visitante: {
                sigla:
                  match.awayTeam.tla ||
                  match.awayTeam.shortName?.substring(0, 3) ||
                  '---',
                escudo: match.awayTeam.crest,
                gols:
                  match.status === 'FINISHED'
                    ? match.score.fullTime.away
                    : null,
              },
              campeonato: match.competition.name,
              status: match.status,
            }));

          return jogos.length
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
              ];
        } catch (fetchError) {
          console.error('Erro ao buscar dados de jogos:', fetchError);
          return FALLBACK_GAMES_DATA;
        }
      },
      { ttl: 1800 } // Cache por 30 minutos
    );

    // Garantir que sempre retornamos um objeto válido
    return NextResponse.json(cachedData || FALLBACK_GAMES_DATA, {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Erro no serviço de cache:', error);
    // Mesmo em caso de erro no cache, retornamos dados de fallback
    return NextResponse.json(FALLBACK_GAMES_DATA, {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json',
      },
    });
  }
}
