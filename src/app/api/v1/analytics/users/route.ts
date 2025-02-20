import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    // Validar API Key
    const apiKey = request.headers.get('x-api-key');
    console.log('[API Route] Recebida API key:', apiKey);

    const isValidKey = await validateApiKey(apiKey);
    console.log('[API Route] Resultado da validação:', isValidKey);

    if (!isValidKey) {
      console.log('[API Route] API key inválida, retornando erro 401');
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    // Buscar usuários
    const snapshot = await adminDb.collection('users').get();

    // Formatar dados removendo informações sensíveis
    const users = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        role: data.role,
        createdAt: data.createdAt?.toDate().toISOString(),
        lastLogin: data.lastLogin?.toDate().toISOString(),
        preferences: {
          categories: data.preferences?.categories || [],
          darkMode: data.preferences?.darkMode || false,
          emailNotifications: data.preferences?.emailNotifications || false,
        },
        stats: {
          savedNewsCount: data.savedNews?.length || 0,
          readHistoryCount: data.readHistory?.length || 0,
          newsletterSubscribed: data.newsletter?.subscribed || false,
          pushNotificationsEnabled: data.pushNotifications?.enabled || false,
        },
      };
    });

    // Retornar dados
    return NextResponse.json({
      data: users,
      totalUsers: users.length,
      adminCount: users.filter((u) => u.role === 'admin').length,
      regularUserCount: users.filter((u) => u.role === 'user').length,
    });
  } catch (error) {
    console.error('[API Route] Erro ao buscar usuários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
