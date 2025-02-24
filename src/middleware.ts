import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Ignorar rotas da API
  if (request.nextUrl.pathname.startsWith('/api/v1/')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('firebase-token');

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isProfileRoute = request.nextUrl.pathname.startsWith('/perfil');

  // Se não houver token e for uma rota protegida, redireciona para o login
  if (!token && (isAdminRoute || isProfileRoute)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verifica se é uma rota administrativa
  if (isAdminRoute) {
    try {
      const baseUrl = request.nextUrl.origin;

      // Verifica se o usuário é admin através da API
      const response = await fetch(`${baseUrl}/api/auth/check-admin`, {
        headers: {
          cookie: `firebase-token=${token?.value}`,
        },
      });

      if (!response.ok) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      const data = await response.json();

      if (!data.isAdmin) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      console.error('[Middleware Debug] Erro ao verificar permissões:', error);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/perfil/:path*'],
};
