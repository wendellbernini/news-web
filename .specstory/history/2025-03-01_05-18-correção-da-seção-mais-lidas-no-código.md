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

_**User**_

 tem uma mesma noticia registrada no historico o que nao deveria acontecer idependente de quantas vezes eu a  acesse so deve ser registrada uma vez  @Codebase 

---

_**Assistant**_

Analisando o código e o problema descrito, vejo que o histórico está duplicando registros da mesma notícia. Vamos corrigir isso verificando o histórico existente antes de adicionar um novo registro.

O problema está relacionado à lógica de verificação no componente que registra o histórico. Vamos modificar a função que registra o histórico para verificar duplicatas.

Aqui está a correção necessária:


```58:135:src/app/perfil/historico/page.tsx
    const fetchReadHistory = async () => {
        ...
        const fetchHistoryData = async () => {


          ...


          // Coleta IDs únicos das notícias
          const newsIds: string[] = Array.from(
            new Set(
              paginatedHistory.map((item: UserHistoryItem) => item.newsId)
            )
          );
          console.log('IDs únicos de notícias:', newsIds);

          // Busca todas as notícias em uma única query
          const newsPromises = newsIds.map((newsId: string) =>
            getDoc(doc(db as Firestore, 'news', newsId))
          );

          const newsSnapshots = await Promise.all(newsPromises);
          console.log('Notícias encontradas:', newsSnapshots.length);

          const newsMap = new Map(
            newsSnapshots
              .filter((doc): doc is DocumentSnapshot<DocumentData> =>
                doc.exists()
              )
              .map((doc) => [doc.id, { id: doc.id, ...doc.data() } as News])
          );

          // Monta o histórico com as notícias
          const result = paginatedHistory.map((item: UserHistoryItem) => {
            const news = newsMap.get(item.newsId);
            if (!news) {
              console.warn('Notícia não encontrada:', item.newsId);
            }
            return {
              ...item,
              news: news || null,
            };
          });

          console.log('Histórico montado:', result.length);
          return result;
        };
```


A lógica atual não está verificando adequadamente se a notícia já existe no histórico antes de adicionar. Vamos criar uma função auxiliar para verificar duplicatas e modificar a lógica de registro do histórico.

```typescript:src/hooks/useNewsHistory.ts
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';

export async function checkExistingHistory(userId: string, newsId: string) {
  try {
    const historyRef = collection(db, 'user_history');
    const q = query(
      historyRef,
      where('userId', '==', userId),
      where('newsId', '==', newsId)
    );
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Erro ao verificar histórico existente:', error);
    return false;
  }
}

export async function addToHistory(userId: string, newsId: string, newsTitle: string, newsSlug: string) {
  try {
    // Verifica se já existe no histórico
    const exists = await checkExistingHistory(userId, newsId);
    if (exists) {
      console.log('Notícia já existe no histórico');
      return false;
    }

    // Adiciona ao histórico apenas se não existir
    const historyRef = collection(db, 'user_history');
    await addDoc(historyRef, {
      userId,
      newsId,
      newsTitle,
      newsSlug,
      createdAt: Timestamp.now()
    });
    
    console.log('Histórico registrado com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao registrar histórico:', error);
    return false;
  }
}
```

Agora, no componente que registra o histórico (provavelmente NewsDetail.tsx), você deve usar estas funções:

```typescript:src/components/news/NewsDetail.tsx
import { addToHistory } from '@/hooks/useNewsHistory';

// ... dentro do componente onde você registra o histórico
const registerHistory = async () => {
  if (!user?.uid || !news?.id) return;
  
  await addToHistory(
    user.uid,
    news.id,
    news.title,
    news.slug
  );
};
```

Esta solução:

1. Verifica se a notícia já existe no histórico do usuário antes de adicionar
2. Evita duplicatas mesmo se o usuário acessar a mesma notícia várias vezes
3. Mantém um registro limpo e organizado do histórico de leitura
4. Usa índices do Firestore para consultas eficientes

Você precisará adicionar um índice composto no Firestore para otimizar a consulta:
- Coleção: `user_history`
- Campos: `userId` (Ascending) e `newsId` (Ascending)

Isso garantirá que cada notícia apareça apenas uma vez no histórico de cada usuário, independentemente de quantas vezes ela seja acessada.

---

_**User**_

para ter certeza verifique voce a @Codebase  de onde deve ser alterado

---

_**Assistant**_

Analisando o código fornecido, identifiquei que o problema está em dois lugares:

1. No componente `NewsDetail.tsx`, onde o histórico é registrado:

```23:76:src/components/news/NewsDetail.tsx
export function NewsDetail({ slug }: NewsDetailProps) {
  const router = useRouter();
  const user = useStore((state) => state.user);
  const { toggleSaveNews } = useReadingList();
  const { addToHistory } = useReadHistory();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyRegistered, setHistoryRegistered] = useState(false);
  const newsId = news?.id;
  const hasViewed = useNewsViews(newsId || '');
  // Chamando o hook sem armazenar o retorno, já que o efeito colateral é o que importa
  useNewsViews(newsId || '');
    const fetchNews = async () => {
  useEffect(() => {
    const fetchNews = async () => {
      if (!slug) return;
      setError(null);
      setLoading(true);
      setError(null);
        const newsQuery = query(
      try {
        const newsQuery = query(
          collection(db, 'news'),
          where('slug', '==', slug)
        );
        const snapshot = await getDocs(newsQuery);
          const newsDoc = snapshot.docs[0];
        if (!snapshot.empty) {
          const newsDoc = snapshot.docs[0];
          const data = newsDoc.data();
          const newsData: News = {
            id: newsDoc.id,
            title: data.title,
            slug: data.slug,
            content: data.content,
            summary: data.summary,
            imageUrl: data.imageUrl,
            category: data.category,
            author: data.author,
            published: data.published,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            views: data.views || 0,
            readTime: calculateReadTime(data.content),
            comments: data.comments || 0,
          };
        } else {
          setNews(newsData);
        } else {
          setError('Notícia não encontrada');
          toast.error('Notícia não encontrada');
        }
      }
```


2. Na página de histórico, onde os itens são filtrados:

```97:135:src/app/perfil/historico/page.tsx
          // Coleta IDs únicos das notícias
          const newsIds: string[] = Array.from(
            new Set(
              paginatedHistory.map((item: UserHistoryItem) => item.newsId)
            )
          );
          console.log('IDs únicos de notícias:', newsIds);

          // Busca todas as notícias em uma única query
          const newsPromises = newsIds.map((newsId: string) =>
            getDoc(doc(db as Firestore, 'news', newsId))
          );

          const newsSnapshots = await Promise.all(newsPromises);
          console.log('Notícias encontradas:', newsSnapshots.length);

          const newsMap = new Map(
            newsSnapshots
              .filter((doc): doc is DocumentSnapshot<DocumentData> =>
                doc.exists()
              )
              .map((doc) => [doc.id, { id: doc.id, ...doc.data() } as News])
          );

          // Monta o histórico com as notícias
          const result = paginatedHistory.map((item: UserHistoryItem) => {
            const news = newsMap.get(item.newsId);
            if (!news) {
              console.warn('Notícia não encontrada:', item.newsId);
            }
            return {
              ...item,
              news: news || null,
            };
          });

          console.log('Histórico montado:', result.length);
          return result;
        };
```


O problema está ocorrendo porque:

1. No `NewsDetail.tsx`, não estamos verificando adequadamente se a notícia já existe no histórico antes de adicionar
2. Na página de histórico, o filtro de duplicatas não está funcionando corretamente

Vou propor as correções necessárias:

```typescript:src/hooks/useReadHistory.ts
import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

export function useReadHistory() {
  const addToHistory = async (userId: string, newsData: {
    newsId: string;
    newsTitle: string;
    newsSlug: string;
  }) => {
    if (!userId || !newsData.newsId) return;

    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const readHistory = userData.readHistory || [];

      // Verifica se a notícia já existe no histórico
      const alreadyExists = readHistory.some(
        (item: any) => item.newsId === newsData.newsId
      );

      if (alreadyExists) {
        console.log('Notícia já existe no histórico');
        return;
      }

      // Adiciona ao histórico apenas se não existir
      await updateDoc(userRef, {
        readHistory: arrayUnion({
          ...newsData,
          readAt: new Date(),
          createdAt: new Date()
        })
      });

      console.log('Histórico atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar histórico:', error);
    }
  };

  return { addToHistory };
}
```

E no `Ne

---



---

