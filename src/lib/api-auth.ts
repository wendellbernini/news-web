import { adminDb } from './firebase/admin';

export async function validateApiKey(apiKey: string | null): Promise<boolean> {
  if (!apiKey) return false;

  try {
    // Buscar a API key na coleção de api_keys
    const apiKeyDoc = await adminDb.collection('api_keys').doc(apiKey).get();

    if (!apiKeyDoc.exists) return false;

    const data = apiKeyDoc.data();

    // Verificar se a key está ativa e não expirou
    if (!data?.active) return false;

    if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
      return false;
    }

    // Atualizar último uso
    await apiKeyDoc.ref.update({
      lastUsed: new Date(),
      usageCount: (data.usageCount || 0) + 1,
    });

    return true;
  } catch (error) {
    console.error('Erro ao validar API key:', error);
    return false;
  }
}
