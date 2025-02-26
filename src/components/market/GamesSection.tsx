'use client';

import { useEffect, useState } from 'react';

interface Game {
  hora_realizacao: string;
  time_mandante: { sigla: string; escudo: string };
  time_visitante: { sigla: string; escudo: string };
}

const GamesSection = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('/api/games');
        if (!response.ok) throw new Error('Erro ao buscar jogos');
        const data = await response.json();
        setGames(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (loading) {
    return <div className="h-[120px] animate-pulse rounded-lg bg-gray-100" />;
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
    <div className="rounded-lg bg-gray-50 p-4">
      <h3 className="mb-4 text-sm font-medium text-gray-600">{today}</h3>
      <div className="space-y-3">
        {games.slice(0, 4).map((game, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm"
          >
            <span className="w-12 text-gray-600">{game.hora_realizacao}</span>
            <div className="flex items-center gap-2">
              <img
                src={game.time_mandante.escudo}
                alt={game.time_mandante.sigla}
                className="h-5 w-5 object-contain"
              />
              <span className="font-medium">{game.time_mandante.sigla}</span>
            </div>
            <span className="text-xs text-gray-400">x</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{game.time_visitante.sigla}</span>
              <img
                src={game.time_visitante.escudo}
                alt={game.time_visitante.sigla}
                className="h-5 w-5 object-contain"
              />
            </div>
          </div>
        ))}
      </div>
      <a
        href="#"
        className="mt-4 block text-center text-sm text-primary-600 hover:underline"
      >
        Ver agenda completa →
      </a>
    </div>
  );
};

export default GamesSection;
