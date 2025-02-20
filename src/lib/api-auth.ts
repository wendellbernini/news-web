import { adminDb } from './firebase/admin';

export async function validateApiKey(apiKey: string | null): Promise<boolean> {
  if (!apiKey) {
    console.log('[API Auth Debug] API Key não fornecida');
    return false;
  }

  try {
    console.log('[API Auth Debug] Iniciando validação da API Key');
    console.log('[API Auth Debug] API Key recebida:', apiKey);

    // Buscar a API key na coleção de api_keys usando where
    const querySnapshot = await adminDb
      .collection('api_keys')
      .where('key', '==', apiKey)
      .limit(1)
      .get();

    console.log('[API Auth Debug] Query executada');
    console.log('[API Auth Debug] Documentos encontrados:', querySnapshot.size);

    if (querySnapshot.empty) {
      console.log('[API Auth Debug] Nenhum documento encontrado com esta key');
      return false;
    }

    const apiKeyDoc = querySnapshot.docs[0];
    const data = apiKeyDoc.data();

    console.log('[API Auth Debug] Documento encontrado:', {
      id: apiKeyDoc.id,
      key: data.key,
      active: data.active,
      name: data.name,
    });

    // Verificar se a key está ativa e não expirou
    if (!data.active) {
      console.log('[API Auth Debug] API Key inativa');
      return false;
    }

    if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
      console.log('[API Auth Debug] API Key expirada');
      return false;
    }

    // Atualizar último uso
    await apiKeyDoc.ref.update({
      lastUsed: new Date(),
      usageCount: (data.usageCount || 0) + 1,
    });

    console.log('[API Auth Debug] API Key válida e atualizada');
    return true;
  } catch (error) {
    console.error('[API Auth Debug] Erro ao validar API key:', error);
    return false;
  }
}
