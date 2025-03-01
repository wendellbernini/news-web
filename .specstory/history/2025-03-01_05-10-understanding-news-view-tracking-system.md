## SpecStory

## Understanding News View Tracking System (3/1/2025, 5:10:09 AM)

_**User**_

No site ha um sistema de views que e um parametro criado junto quando uma noticia nova e criada, no entanto, ele nao ta funcionando mt bem e nao sei o motivo. Mas para alem disso eu gostaria de entender como esta funcionando o fluxio para contabilizar a view desde a criacao da noticia ate ser contabilizada no firebase.  @Codebase 

---

_**Assistant**_

Vou explicar o fluxo completo de como as visualizações (views) são contabilizadas no sistema, desde a criação da notícia até o registro no Firebase.

### 1. Criação da Notícia

Quando uma nova notícia é criada na coleção `news` do Firestore, ela já vem com alguns campos padrão, incluindo:

- `views`: Inicializado com 0
- `published`: true/false
- Outros campos como título, conteúdo, etc.

### 2. Hook de Visualizações

O sistema utiliza um hook personalizado chamado `useNewsViews` para gerenciar as visualizações:


```11:13:src/hooks/useNewsViews.ts
export const useNewsViews = (newsId: string) => {
  const [hasViewed, setHasViewed] = useState(false);

```


Este hook é responsável por:
- Controlar se uma notícia já foi visualizada na sessão atual
- Gerenciar o cache de visualizações
- Incrementar a contagem no Firestore

### 3. Processo de Contagem

Quando um usuário acessa uma notícia, o seguinte fluxo acontece:

1. **Verificação de Sessão**:

```22:28:src/hooks/useNewsViews.ts
    const checkViewed = () => {
      const viewedNews = JSON.parse(
        sessionStorage.getItem(VIEWS_STORAGE_KEY) || '[]'
      );
      console.log(`Visualizações armazenadas: ${JSON.stringify(viewedNews)}`);
      return viewedNews.includes(newsId);
    };
```

O sistema verifica se a notícia já foi visualizada na sessão atual usando o `sessionStorage`.

2. **Debounce e Cache**:

```40:52:src/hooks/useNewsViews.ts
        const lastView = await cacheService.get(viewKey, async () => null, {
          useMemoryOnly: true,
        });

        if (lastView && Date.now() - lastView < VIEW_DEBOUNCE_TIME) {
          console.log(
            `Visualização recente para ${newsId}, não incrementando.`
          );
          return;
        }

        await cacheService.set(viewKey, Date.now(), { useMemoryOnly: true });

```

Existe um sistema de debounce (2 minutos) para evitar múltiplas contagens em acessos repetidos.

3. **Acumulação em Lote**:

```70:85:src/hooks/useNewsViews.ts
        if (pendingViews.length >= BATCH_SIZE) {
          const batch = writeBatch(db);
          const uniqueViews = Array.from(new Set(pendingViews));

          uniqueViews.forEach((id) => {
            const newsRef = doc(db, 'news', id);
            batch.update(newsRef, {
              views: increment(1),
              lastViewed: new Date(),
            });
            console.log(`Incrementando visualizações para ${id}.`);
          });

          await batch.commit();
          await cacheService.set(VIEWS_CACHE_KEY, [], { useMemoryOnly: true });
        }
```

As visualizações são acumuladas em lote (20 visualizações) antes de serem enviadas ao Firestore para otimizar as operações de escrita.

### 4. Registro no Firestore

O incremento final acontece usando o `writeBatch` do Firestore:

```75:80:src/hooks/useNewsViews.ts
            const newsRef = doc(db, 'news', id);
            batch.update(newsRef, {
              views: increment(1),
              lastViewed: new Date(),
            });
            console.log(`Incrementando visualizações para ${id}.`);
```


### Problemas Identificados

1. **Inicialização do newsId**: 

```17:20:src/hooks/useNewsViews.ts
    if (!newsId) {
      console.warn('newsId vazio, não incrementando visualizações.');
      return;
    }
```

Se o `newsId` não estiver disponível, o incremento é abortado.

2. **Verificação de Visualização Prévia**: O sistema atual pode estar muito restritivo na verificação de visualizações prévias, impedindo contagens legítimas.

3. **Batch Size**: O tamanho do lote (20) pode ser muito grande, fazendo com que as visualizações demorem para serem registradas no Firestore.

### Sugestões de Melhorias

1. Reduzir o tempo de debounce (atualmente 2 minutos)
2. Diminuir o tamanho do lote para atualizar mais frequentemente
3. Melhorar a lógica de verificação de visualizações prévias
4. Adicionar mais logs para rastrear o fluxo de execução

Quer que eu implemente alguma dessas melhorias ou você tem alguma dúvida específica sobre alguma parte do fluxo?

---



---

