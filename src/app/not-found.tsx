'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Home } from 'lucide-react';
import { Suspense } from 'react';

/**
 * Página 404 personalizada
 * Exibida quando uma rota não é encontrada
 */
export default function NotFound() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <div className="container flex min-h-[calc(100vh-200px)] flex-col items-center justify-center py-20 text-center">
        <h1 className="text-primary mb-2 text-6xl font-bold">404</h1>
        <h2 className="mb-6 text-2xl font-semibold">Página não encontrada</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          A página que você está procurando não existe ou foi removida.
          Verifique se o endereço está correto ou retorne à página inicial.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button asChild variant="outline">
            <Link href="/" className="flex items-center gap-2">
              <Home size={16} />
              Página Inicial
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link
              href="javascript:history.back()"
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Voltar
            </Link>
          </Button>
        </div>
      </div>
    </Suspense>
  );
}
