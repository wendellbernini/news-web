import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Inicializa o Firebase Analytics apenas no lado do cliente e se for suportado
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  // Função para inicializar o analytics de forma assíncrona
  const initAnalytics = async () => {
    try {
      if (await isSupported()) {
        analytics = getAnalytics(app);
        console.log('Firebase Analytics inicializado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao inicializar Firebase Analytics:', error);
    }
  };

  // Inicializa o analytics
  initAnalytics();
}

export { app, auth, db, analytics };
