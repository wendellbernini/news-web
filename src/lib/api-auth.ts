import { adminDb } from './firebase/admin';

export async function validateApiKey(apiKey: string | null): Promise<boolean> {
  if (!apiKey) return false;

  try {
    console.log('[API Auth] Validando API key:', apiKey);

    // Buscar a API key na coleção de api_keys usando where
    const querySnapshot = await adminDb
      .collection('api_keys')
      .where('key', '==', apiKey)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      console.log('[API Auth] API key não encontrada');
      return false;
    }

    const apiKeyDoc = querySnapshot.docs[0];
    const data = apiKeyDoc.data();

    console.log('[API Auth] Dados da API key:', {
      id: apiKeyDoc.id,
      active: data.active,
      expiresAt: data.expiresAt,
      usageCount: data.usageCount,
    });

    // Verificar se a key está ativa e não expirou
    if (!data.active) {
      console.log('[API Auth] API key inativa');
      return false;
    }

    if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
      console.log('[API Auth] API key expirada');
      return false;
    }

    // Atualizar último uso
    await apiKeyDoc.ref.update({
      lastUsed: new Date(),
      usageCount: (data.usageCount || 0) + 1,
    });

    console.log('[API Auth] API key válida, uso atualizado');
    return true;
  } catch (error) {
    console.error('[API Auth] Erro ao validar API key:', error);
    return false;
  }
}
