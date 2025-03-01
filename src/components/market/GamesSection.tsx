'use client';

import { useEffect, useState } from 'react';

interface Game {
  hora_realizacao: string;
  data: string;
  time_mandante: { sigla: string; escudo: string; gols: number | null };
  time_visitante: { sigla: string; escudo: string; gols: number | null };
  campeonato: string;
  status: string;
}

interface ErrorResponse {
  error: boolean;
  message: string;
  timestamp: string;
}

const GamesSection = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('/api/games');
        const data = await response.json();

        if ('error' in data) {
          const errorData = data as ErrorResponse;
          console.error('Erro da API:', errorData);
          setError(errorData.message);
          return;
        }

        setGames(data);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar jogos:', err);
        setError('Erro ao carregar jogos');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
    const interval = setInterval(fetchGames, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="h-[160px] animate-pulse rounded-lg bg-gray-100" />;
  }

  const today = new Date()
    .toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    .toUpperCase();

  return (
    <div className="rounded-lg bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="mb-3 sm:mb-4">
        <h3 className="text-xs font-medium text-gray-600 sm:text-sm">
          {today}
        </h3>
        {games.length > 0 &&
          games[0].campeonato !== 'Nenhum jogo programado' && (
            <p className="mt-1 text-xs text-gray-500">{games[0].campeonato}</p>
          )}
      </div>
      {error ? (
        <div className="text-center">
          <p className="text-xs text-red-500 sm:text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-xs text-primary-600 hover:underline"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {games.map((game, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-xs sm:text-sm"
            >
              <div className="flex flex-col items-start">
                <span className="text-gray-600">{game.hora_realizacao}</span>
                <span className="text-xs text-gray-400">{game.data}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <img
                  src={game.time_mandante.escudo || '/placeholder-team.svg'}
                  alt={game.time_mandante.sigla}
                  className="h-5 w-5 object-contain sm:h-6 sm:w-6"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-team.svg';
                    e.currentTarget.onerror = null;
                  }}
                />
                <span className="font-medium">{game.time_mandante.sigla}</span>
                {game.status === 'FINISHED' && (
                  <span className="ml-1 text-gray-600">
                    {game.time_mandante.gols}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400">x</span>
              <div className="flex items-center gap-1 sm:gap-2">
                {game.status === 'FINISHED' && (
                  <span className="mr-1 text-gray-600">
                    {game.time_visitante.gols}
                  </span>
                )}
                <span className="font-medium">{game.time_visitante.sigla}</span>
                <img
                  src={game.time_visitante.escudo || '/placeholder-team.svg'}
                  alt={game.time_visitante.sigla}
                  className="h-5 w-5 object-contain sm:h-6 sm:w-6"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-team.svg';
                    e.currentTarget.onerror = null;
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GamesSection;
