#!/usr/bin/env node

/**
 * Script para limpar imagens órfãs da Cloudinary que não estão mais associadas a notícias
 *
 * Este script:
 * 1. Busca todas as notícias no Firestore
 * 2. Coleta todas as URLs de imagens em uso
 * 3. Busca todas as imagens na Cloudinary
 * 4. Identifica imagens que não estão sendo usadas por nenhuma notícia
 * 5. Exclui as imagens órfãs da Cloudinary
 *
 * Uso: node src/scripts/cleanupOrphanedImages.js
 *
 * Nota: Este script deve ser executado apenas no servidor, não no navegador.
 */

// Configuração do Cloudinary
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

// Configuração do Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Log das configurações (sem mostrar a chave secreta)
console.log('Configurações do Cloudinary:');
console.log('- Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
console.log(
  '- API Key:',
  process.env.CLOUDINARY_API_KEY ? '✓ Configurada' : '✗ Não configurada'
);
console.log(
  '- API Secret:',
  process.env.CLOUDINARY_API_SECRET ? '✓ Configurada' : '✗ Não configurada'
);

/**
 * Extrai o public_id de uma URL da Cloudinary
 * @param url URL da imagem da Cloudinary
 * @returns O public_id da imagem ou null se não for possível extrair
 */
const extractPublicIdFromUrl = (url: string): string | null => {
  if (!url || !url.includes('cloudinary.com')) {
    return null;
  }

  // Formato típico: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/abcdef123456.jpg
  // ou https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/abcdef123456.jpg

  // Primeiro, tenta extrair com o formato que inclui pasta
  let regex = /\/v\d+\/([^/]+\/[^.]+)/;
  let match = url.match(regex);

  if (match && match[1]) {
    return match[1];
  }

  // Se não encontrou com o formato que inclui pasta, tenta sem pasta
  regex = /\/v\d+\/([^.]+)/;
  match = url.match(regex);

  if (match && match[1]) {
    return match[1];
  }

  return null;
};

/**
 * Exclui uma imagem da Cloudinary pelo seu public_id
 * @param publicId O public_id da imagem
 * @returns O resultado da operação de exclusão
 */
const deleteImage = (publicId: string): Promise<Record<string, unknown>> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      publicId,
      (error: Error | undefined, result: Record<string, unknown>) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
};

interface CloudinaryResource {
  public_id: string;
  url: string;
  [key: string]: unknown;
}

async function cleanupOrphanedImages() {
  console.log('Iniciando limpeza de imagens órfãs...');

  try {
    // 1. Busca todas as notícias no Firestore
    console.log('Buscando todas as notícias...');
    const newsSnapshot = await getDocs(collection(db, 'news'));

    // 2. Coleta todas as URLs de imagens em uso
    const usedImageUrls = new Set<string>();
    const usedPublicIds = new Set<string>();

    newsSnapshot.forEach((doc) => {
      const newsData = doc.data();
      if (newsData.imageUrl) {
        usedImageUrls.add(newsData.imageUrl);

        const publicId = extractPublicIdFromUrl(newsData.imageUrl);
        if (publicId) {
          usedPublicIds.add(publicId);
        }
      }
    });

    console.log(`Encontradas ${usedImageUrls.size} imagens em uso.`);

    // Mostra alguns exemplos de public_ids em uso para depuração
    if (usedPublicIds.size > 0) {
      console.log('Exemplos de public_ids em uso:');
      Array.from(usedPublicIds)
        .slice(0, 5)
        .forEach((id) => {
          console.log(`- ${id}`);
        });
    }

    // 3. Busca todas as imagens no Cloudinary
    console.log('Buscando todas as imagens no Cloudinary...');
    try {
      // Busca todas as imagens
      const allResources = await new Promise<{
        resources: CloudinaryResource[];
      }>((resolve, reject) => {
        cloudinary.api.resources(
          {
            type: 'upload',
            max_results: 500,
          },
          (
            error: Error | undefined,
            result?: { resources: CloudinaryResource[] }
          ) => {
            if (error) {
              console.error('Erro ao buscar recursos na Cloudinary:', error);
              reject(error);
            }
            resolve(result || { resources: [] });
          }
        );
      });

      console.log(
        `Encontradas ${allResources.resources.length} imagens no total na Cloudinary.`
      );

      // Mostrar algumas imagens para entender a estrutura
      console.log('Exemplos de public_ids de todas as imagens:');
      allResources.resources.slice(0, 5).forEach((resource) => {
        console.log(`- ${resource.public_id}`);
      });

      // Converter os public_ids em uso para um array para facilitar a depuração
      const usedPublicIdsArray = Array.from(usedPublicIds);

      // 4. Identifica imagens que não estão sendo usadas por nenhuma notícia
      const orphanedImages = allResources.resources.filter((resource) => {
        // Verifica se o public_id está na lista de public_ids em uso
        const isUsed = usedPublicIdsArray.some((usedId) => {
          return (
            resource.public_id === usedId ||
            resource.public_id.endsWith(usedId) ||
            usedId.endsWith(resource.public_id)
          );
        });
        return !isUsed;
      });

      console.log(`Encontradas ${orphanedImages.length} imagens órfãs.`);

      // Listar imagens órfãs para depuração
      if (orphanedImages.length > 0) {
        console.log('Primeiras 10 imagens órfãs encontradas:');
        orphanedImages.slice(0, 10).forEach((resource) => {
          console.log(`- ${resource.public_id} (${resource.url})`);
        });

        if (orphanedImages.length > 10) {
          console.log(`... e mais ${orphanedImages.length - 10} imagens`);
        }
      }

      // Confirmação antes de excluir muitas imagens
      if (orphanedImages.length > 50) {
        console.log(
          `ATENÇÃO: Foram encontradas ${orphanedImages.length} imagens órfãs.`
        );
        console.log(
          'Para excluir automaticamente, execute o script com o parâmetro --force'
        );
        console.log(
          'Exemplo: node src/scripts/cleanupOrphanedImages.js --force'
        );

        // Verifica se o script foi executado com o parâmetro --force
        const shouldForce = process.argv.includes('--force');

        if (!shouldForce) {
          console.log(
            'Script encerrado sem excluir imagens. Use --force para excluir.'
          );
          return;
        }
      }

      // 5. Exclui as imagens órfãs da Cloudinary
      if (orphanedImages.length > 0) {
        console.log('Excluindo imagens órfãs...');

        for (const image of orphanedImages) {
          try {
            console.log(`Excluindo imagem: ${image.public_id}`);
            const result = await deleteImage(image.public_id);
            console.log(`Resultado: ${JSON.stringify(result)}`);
          } catch (error) {
            console.error(`Erro ao excluir imagem ${image.public_id}:`, error);
          }
        }

        console.log(
          `${orphanedImages.length} imagens órfãs excluídas com sucesso.`
        );
      } else {
        console.log('Nenhuma imagem órfã encontrada.');
      }

      console.log('Limpeza de imagens órfãs concluída com sucesso!');
    } catch (error) {
      console.error('Erro ao buscar imagens na Cloudinary:', error);
    }
  } catch (error) {
    console.error('Erro ao executar limpeza de imagens órfãs:', error);
  }
}

// Executa a limpeza
cleanupOrphanedImages();
