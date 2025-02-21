import { db } from '@/lib/firebase/config';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

async function migrateUsers() {
  console.log(
    '🚀 Iniciando migração para remover campo status dos usuários...'
  );

  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);

    console.log(`📊 Total de usuários encontrados: ${snapshot.size}`);

    let processados = 0;
    let atualizados = 0;

    for (const userDoc of snapshot.docs) {
      processados++;
      const userData = userDoc.data();

      // Se tiver o campo status, remove
      if ('status' in userData) {
        console.log(`🔄 Removendo status do usuário: ${userDoc.id}`);

        // Remove o campo status usando o FieldValue.delete()
        await updateDoc(doc(db, 'users', userDoc.id), {
          status: null, // O Firebase vai remover campos com valor null
        });

        atualizados++;
      }

      // Log de progresso a cada 10 usuários
      if (processados % 10 === 0) {
        console.log(
          `⏳ Progresso: ${processados}/${snapshot.size} usuários processados`
        );
      }
    }

    console.log('\n✅ Migração concluída com sucesso!');
    console.log(`📝 Resumo:
    - Total de usuários: ${snapshot.size}
    - Usuários processados: ${processados}
    - Usuários atualizados: ${atualizados}
    `);
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  }
}

// Executa a migração
migrateUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
