import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Verifica se é uma rota administrativa
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('firebase-token');

    // Se não houver token, redireciona para a página inicial
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    try {
      // Verifica se o usuário é admin através da API
      const response = await fetch(
        new URL('/api/auth/check-admin', request.url),
        {
          headers: {
            cookie: `firebase-token=${token.value}`,
          },
        }
      );

      if (!response.ok) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      const { isAdmin } = await response.json();

      if (!isAdmin) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      return NextResponse.next();
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
