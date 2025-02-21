import { db } from '@/lib/firebase/config';
import { collection, getDocs } from 'firebase/firestore';

/**
 * Valida os dados de um usuário conforme a interface User
 */
function validateUserData(data: any): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Campos obrigatórios
  const requiredFields = ['id', 'name', 'email', 'role', 'createdAt'];
  for (const field of requiredFields) {
    if (!(field in data)) {
      issues.push(`Campo obrigatório ausente: ${field}`);
    }
  }

  // Validação de tipo do role
  if (data.role && !['user', 'admin'].includes(data.role)) {
    issues.push(`Role inválido: ${data.role}`);
  }

  // Validação de campos que devem ser arrays
  if (data.savedNews && !Array.isArray(data.savedNews)) {
    issues.push('savedNews deve ser um array');
  }
  if (data.readHistory && !Array.isArray(data.readHistory)) {
    issues.push('readHistory deve ser um array');
  }

  // Validação de objetos aninhados
  if (data.preferences) {
    if (typeof data.preferences !== 'object') {
      issues.push('preferences deve ser um objeto');
    } else {
      if (!Array.isArray(data.preferences.categories)) {
        issues.push('preferences.categories deve ser um array');
      }
      if (typeof data.preferences.darkMode !== 'boolean') {
        issues.push('preferences.darkMode deve ser um booleano');
      }
      if (typeof data.preferences.emailNotifications !== 'boolean') {
        issues.push('preferences.emailNotifications deve ser um booleano');
      }
    }
  } else {
    issues.push('Campo preferences ausente');
  }

  // Validação de campos que não devem existir
  const invalidFields = ['status', 'banned', 'active'];
  for (const field of invalidFields) {
    if (field in data) {
      issues.push(`Campo inválido encontrado: ${field}`);
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

async function validateAllUsers() {
  console.log('🔍 Iniciando validação de dados dos usuários...');

  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);

    console.log(`📊 Total de usuários para validar: ${snapshot.size}`);

    let processados = 0;
    let validos = 0;
    let comProblemas = 0;
    const problemasEncontrados: Record<string, number> = {};

    for (const userDoc of snapshot.docs) {
      processados++;
      const userData = userDoc.data();

      const { isValid, issues } = validateUserData(userData);

      if (isValid) {
        validos++;
      } else {
        comProblemas++;
        console.log(`\n⚠️ Problemas encontrados no usuário ${userDoc.id}:`);
        issues.forEach((issue) => {
          console.log(`  - ${issue}`);
          problemasEncontrados[issue] = (problemasEncontrados[issue] || 0) + 1;
        });
      }

      // Log de progresso
      if (processados % 10 === 0) {
        console.log(
          `⏳ Progresso: ${processados}/${snapshot.size} usuários validados`
        );
      }
    }

    console.log('\n📝 Relatório Final:');
    console.log(`- Total de usuários: ${snapshot.size}`);
    console.log(`- Usuários válidos: ${validos}`);
    console.log(`- Usuários com problemas: ${comProblemas}`);

    if (comProblemas > 0) {
      console.log('\n🔍 Problemas mais comuns:');
      Object.entries(problemasEncontrados)
        .sort(([, a], [, b]) => b - a)
        .forEach(([issue, count]) => {
          console.log(`- ${issue}: ${count} ocorrências`);
        });
    }
  } catch (error) {
    console.error('❌ Erro durante a validação:', error);
    throw error;
  }
}

// Executa a validação
validateAllUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
