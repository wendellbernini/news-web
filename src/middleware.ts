import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log(
    '[Middleware Debug] Iniciando middleware para:',
    request.nextUrl.pathname
  );

  // Ignorar rotas da API
  if (request.nextUrl.pathname.startsWith('/api/v1/')) {
    console.log('[Middleware Debug] Rota de API, ignorando middleware');
    return NextResponse.next();
  }

  const token = request.cookies.get('firebase-token');
  console.log('[Middleware Debug] Token encontrado?', !!token);

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isProfileRoute = request.nextUrl.pathname.startsWith('/perfil');
  console.log('[Middleware Debug] Tipo de rota:', {
    isAdminRoute,
    isProfileRoute,
  });

  // Se não houver token e for uma rota protegida, redireciona para o login
  if (!token && (isAdminRoute || isProfileRoute)) {
    console.log(
      '[Middleware Debug] Sem token para rota protegida, redirecionando para login'
    );
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verifica se é uma rota administrativa
  if (isAdminRoute) {
    try {
      console.log('[Middleware Debug] Verificando permissões de admin');
      const baseUrl = request.nextUrl.origin;
      console.log('[Middleware Debug] URL base:', baseUrl);

      // Verifica se o usuário é admin através da API
      const response = await fetch(`${baseUrl}/api/auth/check-admin`, {
        headers: {
          cookie: `firebase-token=${token?.value}`,
        },
      });

      console.log('[Middleware Debug] Resposta da API:', {
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        console.log(
          '[Middleware Debug] Resposta da API não ok, redirecionando para home'
        );
        return NextResponse.redirect(new URL('/', request.url));
      }

      const data = await response.json();
      console.log('[Middleware Debug] Dados da resposta:', data);

      if (!data.isAdmin) {
        console.log(
          '[Middleware Debug] Usuário não é admin, redirecionando para home'
        );
        return NextResponse.redirect(new URL('/', request.url));
      }

      console.log('[Middleware Debug] Usuário é admin, permitindo acesso');
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
