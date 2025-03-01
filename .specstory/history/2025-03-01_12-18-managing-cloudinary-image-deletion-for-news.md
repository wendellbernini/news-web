## SpecStory

## Managing Cloudinary Image Deletion for News (3/1/2025, 12:18:05 PM)

_**User**_

Eu nao sei como funciona mas ha algo estranho e talvez ate um tanto problematico a longo prazo pois pode fazer com que eu seja cobraco precocemente pela cloudinary, no site as imagens sao hospedadas na cloudinary (eu acho) ate ai tudo bem, so que o que e estranho e que mesmo que eu delete uma noticia a imagem nao e deletada na cloudinary o que pode acabar atingindo muito rapido a cota gratuita da cloudinary e elevando os custos gerais do site @Codebase 

---

_**Assistant**_

Você está correto em sua observação. Atualmente, quando uma notícia é deletada, a imagem permanece armazenada no Cloudinary, o que pode levar a um acúmulo desnecessário de arquivos e custos maiores. Vou ajudar você a implementar a exclusão da imagem do Cloudinary quando uma notícia for removida.

Primeiro, vamos criar uma função para deletar a imagem do Cloudinary. Vamos modificar o arquivo de configuração do Cloudinary:

```typescript:src/lib/cloudinary/config.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadImage = async (file: File) => {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString('base64');
  const dataURI = `data:${file.type};base64,${base64}`;

  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        {
          folder: 'news',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      );
    });

    return result;
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    throw error;
  }
};

// Nova função para deletar imagem
export const deleteImage = async (imageUrl: string) => {
  try {
    // Extrai o public_id da URL do Cloudinary
    const urlParts = imageUrl.split('/');
    const filenameWithExtension = urlParts[urlParts.length - 1];
    const filename = filenameWithExtension.split('.')[0];
    const public_id = `news/${filename}`;

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        public_id,
        { resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      );
    });

    return result;
  } catch (error) {
    console.error('Erro ao deletar imagem do Cloudinary:', error);
    throw error;
  }
};
```

Agora, vamos modificar a função de deletar notícia no hook useNews para também deletar a imagem:


```309:354:src/hooks/useNews.ts
  const deleteNews = useCallback(
    async (id: string) => {
      try {
        // Inicia uma transação em lote
        const batch = writeBatch(db);

        // 1. Busca todas as notificações relacionadas à notícia
        const notificationsQuery = query(
          collection(db, 'user_notifications'),
          where('newsId', '==', id)
        );
        const notificationsSnapshot = await getDocs(notificationsQuery);

        // 2. Adiciona operações de exclusão das notificações ao batch
        notificationsSnapshot.docs.forEach((notificationDoc) => {
          batch.delete(notificationDoc.ref);
        });

        // 3. Adiciona operação de exclusão da notícia ao batch
        batch.delete(doc(db, 'news', id));

        // 4. Executa todas as operações de forma atômica
        await batch.commit();

        // 5. Atualiza o estado local e limpa os caches
        deleteNewsFromStore(id);
        cacheService.remove(`news_${id}`);
        cacheService.remove('news_list_all');

        // 6. Limpa o cache de notificações para todos os usuários afetados
        const affectedUserIds = new Set(
          notificationsSnapshot.docs.map((doc) => doc.data().userId)
        );
        affectedUserIds.forEach((userId) => {
          cacheService.remove(`notifications_${userId}`);
        });

        return id;
      } catch (error) {
        console.error('Erro ao deletar notícia:', error);
        toast.error('Erro ao deletar notícia');
        throw error;
      }
    },
    [deleteNewsFromStore]
  );
```


Vamos atualizar essa função para incluir a deleção da imagem:

```typescript:src/hooks/useNews.ts
const deleteNews = useCallback(
  async (id: string) => {
    try {
      // Primeiro, busca a notícia para obter a URL da imagem
      const newsDoc = await getDoc(doc(db, 'news', id));
      if (!newsDoc.exists()) {
        throw new Error('Notícia não encontrada');
      }

      const newsData = newsDoc.data();
      const imageUrl = newsData.imageUrl;

      // Inicia uma transação em lote
      const batch = writeBatch(db);

      // 1. Busca todas as notificações relacionadas à notícia
      const notificationsQuery = query(
        collection(db, 'user_notifications'),
        where('newsId', '==', id)
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);

      // 2. Adiciona operações de exclusão das notificações ao batch
      notificationsSnapshot.docs.forEach((notificationDoc) => {
        batch.delete(notificationDoc.ref);
      });

      // 3. Adiciona operação de exclusão da notícia ao batch
      batch.delete(doc(db, 'news', id));

      // 4. Executa todas as operações de forma atômica
      await batch.commit();

      // 5. Deleta a imagem do Cloudinary
      if (imageUrl && imageUrl.includes('cloudinary.com')) {
        await deleteImage(imageUrl);
        console.log('Imagem deletada do Cloudinary com sucesso');
      }

      // 6. Atualiza o estado local e limpa os caches
      deleteNewsFromStore(id);
      cacheService.remove(`news_${id}`);
      cacheService.remove('news_list_all');

      // 7. Limpa o cache de notificações para todos os usuários afetados
      const affectedUserIds = new Set(
        notificationsSnapshot.docs.map((doc) => doc.data().userId)
      );
      affectedUserIds.forEach((userId) => {
        cacheService.remove(`notifications_${userId}`);
      });

      return id;
    } catch (error) {
      console.error('Erro ao deletar notícia:', error);
      toast.error('Erro ao deletar notícia');
      throw error;
    }
  },
  [deleteNewsFromStore]
);
```

Essas alterações garantem que:

1. Quando uma notícia é deletada, sua imagem também é removida do Cloudinary
2. A deleção é feita de forma segura, verificando primeiro se a URL é do Cloudinary
3. O processo é feito em uma transação, garantindo consistência dos dados
4. Logs apropriados são mantidos para facilitar a depuração

Para testar se está funcionando:
1. Crie uma nova notícia com imagem
2. Delete a notícia
3. Verifique na interface do Cloudinary se a imagem foi removida

Isso ajudará a manter seu uso do Cloudinary otimizado e evitar custos desnecessários com armazenamento de imagens não utilizadas.

---



---

