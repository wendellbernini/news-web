import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('firebase-token')?.value;

    if (!token) {
      return NextResponse.json({ isAdmin: false });
    }

    try {
      // Verifica o token do Firebase
      const decodedToken = await adminAuth.verifyIdToken(token);

      // Busca o documento do usuário no Firestore
      const userDoc = await adminDb
        .collection('users')
        .doc(decodedToken.uid)
        .get();

      if (!userDoc.exists) {
        return NextResponse.json({ isAdmin: false });
      }

      const userData = userDoc.data();
      const isAdmin = userData?.role === 'admin';

      return NextResponse.json({ isAdmin });
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return NextResponse.json({ isAdmin: false });
    }
  } catch (error) {
    console.error('Erro ao verificar permissões:', error);
    return NextResponse.json({ isAdmin: false });
  }
}
