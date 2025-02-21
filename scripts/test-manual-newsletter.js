require('dotenv').config();
const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} = require('firebase/firestore');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Script para testar o envio manual de newsletter
const userId = 'R1Lpekc6xFUPmAG2njoRolr9EkA3';
const newsIds = ['0u7o8xf7P72VX6FnD5qU']; // Notícia sobre a XP
const userEmails = ['berniniwendell22@gmail.com']; // Email para teste

// Função para verificar usuário
async function checkUser(email) {
  console.log('Verificando usuário com email:', email);
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', email));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.log('Usuário não encontrado');
    return null;
  }

  const userData = snapshot.docs[0].data();
  console.log('Usuário encontrado:', userData);
  return userData;
}

// Função para testar o envio manual
async function testManualNewsletter() {
  try {
    console.log('Iniciando teste de envio manual de newsletter...');
    console.log(`User ID: ${userId}`);
    console.log(`News IDs: ${newsIds.join(', ')}`);
    console.log(`User Emails: ${userEmails.join(', ')}`);

    // Verifica se o usuário existe
    for (const email of userEmails) {
      const user = await checkUser(email);
      if (!user) {
        console.log(
          `AVISO: Usuário com email ${email} não encontrado no sistema.`
        );
        console.log('É necessário criar uma conta com este email primeiro.');
        return;
      }
    }

    const response = await fetch('http://localhost:3000/api/admin/newsletter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        newsIds,
        userEmails,
      }),
    });

    const data = await response.json();
    console.log('Resposta:', data);
  } catch (error) {
    console.error('Erro:', error);
  }
}

testManualNewsletter();
