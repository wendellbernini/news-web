import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
  console.error('Credenciais do Firebase Admin não encontradas');
  throw new Error('Credenciais do Firebase Admin não encontradas');
}

// Função para formatar corretamente a chave privada
const formatPrivateKey = (key: string) => {
  // Remove aspas extras do início e fim se existirem
  const trimmedKey = key.trim().replace(/^\"|\"$/g, '');

  // Garante que a chave começa e termina corretamente
  if (!trimmedKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
    console.error('Chave privada não começa com o cabeçalho correto');
    throw new Error('Formato de chave privada inválido');
  }

  // Substitui \\n por \n e depois por quebras de linha reais
  return trimmedKey.replace(/\\n/g, '\n');
};

let adminAuth: Auth;
let adminDb: Firestore;

try {
  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  const firebaseAdminConfig = {
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
    databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
  };

  const adminApp = !getApps().length
    ? initializeApp(firebaseAdminConfig)
    : getApps()[0];

  adminAuth = getAuth(adminApp);
  adminDb = getFirestore(adminApp);
} catch (error) {
  console.error('[Admin Debug] Erro ao inicializar Firebase Admin:', error);
  throw error;
}

export { adminAuth, adminDb };
