## SpecStory

## Correção da Seção "Mais Lidas" no Código (3/1/2025, 5:18:42 AM)

_**User**_

Na imagem, a direita do banner principal tem um titulo chamado "Mais lidas" e 5 noticias listadas na pagina principal que DEVERIAM ser as mais lidas, no entanto, eu acredito que a ordem de exibicao e das ultimas noticias postadas e nao das mais lidas como deveria ser, constato isso por que eu tenho uma pagina http://localhost:3000/mais-lidas   que realmente ordena as noticias mais lidas do site. nao sei como resolver @Codebase 

---

_**Assistant**_

Analisando o código fornecido e o problema descrito, identifiquei que o componente `FeaturedNews` está exibindo as notícias na ordem errada. Vamos corrigir isso.

O componente `TrendingNews` já está corretamente configurado para ordenar por visualizações:


```37:43:src/components/news/TrendingNews.tsx
      const newsQuery = query(
        collection(db, 'news'),
        where('published', '==', true),
        orderBy('views', 'desc'),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );
```


No entanto, o componente `FeaturedNews` que está sendo usado na página inicial não está usando a mesma lógica de ordenação. Vamos modificar a consulta no `FeaturedNews` para ordenar por visualizações ao invés de data de criação.

Aqui está a correção necessária para o `FeaturedNews.tsx`:

```typescript:src/components/news/FeaturedNews.tsx
const fetchFeaturedNews = async () => {
  try {
    // Busca as 5 notícias mais lidas
    const newsQuery = query(
      collection(db, 'news'),
      where('published', '==', true),
      orderBy('views', 'desc'), // Ordena por visualizações ao invés de data
      limit(5) // Limita a 5 notícias
    );

    const snapshot = await getDocs(newsQuery);
    const newsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.seconds
        ? new Date(doc.data().createdAt.seconds * 1000)
        : new Date(),
      updatedAt: doc.data().updatedAt?.seconds
        ? new Date(doc.data().updatedAt.seconds * 1000)
        : new Date(),
    })) as News[];

    setFeaturedNews(newsData);
  } catch (error) {
    console.error('Erro ao buscar notícias em destaque:', error);
  }
};
```

Esta alteração fará com que:

1. A seção "Mais Lidas" na página inicial exiba as 5 notícias com mais visualizações
2. A ordenação seja consistente com a página `/mais-lidas`
3. Mantenha a mesma lógica de contagem de visualizações já implementada

A mudança é mínima e focada apenas na ordenação da consulta, substituindo `orderBy('createdAt', 'desc')` por `orderBy('views', 'desc')`. Isso garantirá que as notícias sejam exibidas de acordo com o número de visualizações, mantendo a consistência com a página de "Mais Lidas".

Você pode testar a alteração verificando se agora as notícias exibidas na seção "Mais Lidas" da página inicial correspondem às mesmas notícias mostradas em `/mais-lidas`, apenas limitadas às 5 primeiras.

---



---

