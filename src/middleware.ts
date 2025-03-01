import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Criar uma resposta base para adicionar headers de segurança
  const response = NextResponse.next();

  // Adicionar headers de segurança
  // Proteção contra XSS
  response.headers.set('X-XSS-Protection', '1; mode=block');
  // Evitar que o navegador faça MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  // Controle de frame para evitar clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  // Política de segurança de conteúdo
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://res.cloudinary.com https://lh3.googleusercontent.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://res.cloudinary.com https://lh3.googleusercontent.com https://crests.football-data.org https://*.yahooapis.com; font-src 'self'; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net https://wttr.in https://api.football-data.org https://query1.finance.yahoo.com; frame-src 'self' https://*.firebaseapp.com; object-src 'none'"
  );
  // Política de referência
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Strict Transport Security
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );
  // Permissões
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  // Ignorar rotas da API
  if (request.nextUrl.pathname.startsWith('/api/v1/')) {
    return response;
  }

  const token = request.cookies.get('firebase-token');

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isProfileRoute = request.nextUrl.pathname.startsWith('/perfil');

  // Se não houver token e for uma rota protegida, redireciona para o login
  if (!token && (isAdminRoute || isProfileRoute)) {
    const redirectUrl = new URL('/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Verifica se é uma rota administrativa
  if (isAdminRoute) {
    try {
      const baseUrl = request.nextUrl.origin;

      // Verifica se o usuário é admin através da API
      const apiResponse = await fetch(`${baseUrl}/api/auth/check-admin`, {
        headers: {
          cookie: `firebase-token=${token?.value}`,
        },
      });

      if (!apiResponse.ok) {
        const redirectUrl = new URL('/', request.url);
        return NextResponse.redirect(redirectUrl);
      }

      const data = await apiResponse.json();

      if (!data.isAdmin) {
        const redirectUrl = new URL('/', request.url);
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      console.error('[Middleware Debug] Erro ao verificar permissões:', error);
      const redirectUrl = new URL('/', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

// Expandir o matcher para aplicar os headers de segurança em todas as rotas
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
