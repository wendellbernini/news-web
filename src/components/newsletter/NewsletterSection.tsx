'use client';

import { useState } from 'react';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('success');
    setEmail('');
    // TODO: Implementar integração com API de newsletter
  };

  return (
    <section className="mt-24 bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Fique por dentro das últimas notícias
          </h2>
          <p className="mb-6 text-gray-600">
            Receba atualizações semanais com as principais notícias direto no
            seu email
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu melhor email"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 sm:w-72"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-gray-800 px-6 py-2 font-medium text-white transition hover:bg-gray-900 sm:w-auto"
            >
              Inscrever-se
            </button>
          </form>

          {status === 'success' && (
            <p className="mt-4 text-sm text-green-600">
              Inscrição realizada com sucesso!
            </p>
          )}
          {status === 'error' && (
            <p className="mt-4 text-sm text-red-600">
              Ocorreu um erro. Tente novamente.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
