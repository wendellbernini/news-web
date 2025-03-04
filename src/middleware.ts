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
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://res.cloudinary.com https://lh3.googleusercontent.com https://www.googletagmanager.com https://www.google-analytics.com https://*.googleapis.com https://apis.google.com https://*.firebase.com https://*.firebaseio.com https://*.firebaseanalytics.com https://connect.facebook.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://res.cloudinary.com https://lh3.googleusercontent.com https://crests.football-data.org https://*.yahooapis.com https://www.google-analytics.com https://www.facebook.com https://facebook.com https://*.facebook.com; font-src 'self'; connect-src 'self' https://*.googleapis.com https://apis.google.com https://*.firebaseio.com https://*.cloudfunctions.net https://wttr.in https://api.football-data.org https://query1.finance.yahoo.com https://www.google-analytics.com https://*.analytics.google.com https://*.firebase.com https://*.firebaseanalytics.com https://www.facebook.com https://connect.facebook.net https://facebook.com https://*.facebook.com; frame-src 'self' https://*.firebaseapp.com https://apis.google.com https://www.facebook.com https://facebook.com https://*.facebook.com; object-src 'none'"
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

  const isAdminRoute =
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname === '/teste-pixel';
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

export function middlewareCors(request: NextRequest) {
  // Define os headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
  };

  // Se for uma requisição OPTIONS, retorna os headers CORS
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers,
    });
  }

  // Para outras requisições, adiciona os headers CORS à resposta
  const response = NextResponse.next();
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Configura o middleware para rodar apenas nas rotas da API
export const configCors = {
  matcher: '/api/:path*',
};
