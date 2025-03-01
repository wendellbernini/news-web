import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { withDefaultMiddleware } from '../../middleware';

async function handler(_request: NextRequest) {
  try {
    console.log('Check-admin: Iniciando verificação');
    const cookieStore = await cookies();
    const token = cookieStore.get('firebase-token')?.value;

    if (!token) {
      console.log('Check-admin: Token não encontrado nos cookies');
      return NextResponse.json({
        isAdmin: false,
        error: 'Token não encontrado',
      });
    }

    try {
      console.log('Check-admin: Verificando token Firebase');
      // Verifica o token do Firebase
      const decodedToken = await adminAuth.verifyIdToken(token);
      console.log(
        'Check-admin: Token decodificado para uid:',
        decodedToken.uid
      );

      // Busca o documento do usuário no Firestore
      const userDoc = await adminDb
        .collection('users')
        .doc(decodedToken.uid)
        .get();

      if (!userDoc.exists) {
        console.log(
          'Check-admin: Documento do usuário não encontrado no Firestore'
        );
        return NextResponse.json({
          isAdmin: false,
          error: 'Usuário não encontrado',
        });
      }

      const userData = userDoc.data();
      console.log('Check-admin: Dados do usuário:', {
        uid: decodedToken.uid,
        role: userData?.role,
        email: userData?.email,
      });

      const isAdmin = userData?.role === 'admin';
      console.log('Check-admin: Usuário é admin?', isAdmin);

      return NextResponse.json({
        isAdmin,
        debug: {
          uid: decodedToken.uid,
          role: userData?.role,
        },
      });
    } catch (error) {
      console.error('Check-admin: Erro ao verificar token:', error);
      return NextResponse.json({
        isAdmin: false,
        error: 'Erro ao verificar token',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  } catch (error) {
    console.error('Check-admin: Erro ao verificar permissões:', error);
    return NextResponse.json({
      isAdmin: false,
      error: 'Erro ao verificar permissões',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}

// Aplicar middleware de rate limiting e segurança
export const GET = withDefaultMiddleware(handler);
