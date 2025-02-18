import { Metadata } from 'next';
import { Suspense } from 'react';
import { RootLayout } from '@/components/layout/RootLayout';
import { NewsDetail } from '@/components/news/NewsDetail';
import { CommentSection } from '@/components/news/CommentSection';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { unstable_noStore as noStore } from 'next/cache';

// Função assíncrona para pegar os dados da notícia
async function getNewsData(slug: string) {
  noStore();
  try {
    const newsQuery = query(collection(db, 'news'), where('slug', '==', slug));
    const snapshot = await getDocs(newsQuery);
    return !snapshot.empty ? snapshot.docs[0].data() : null;
  } catch (error) {
    console.error('Erro ao buscar notícia:', error);
    return null;
  }
}

// Tipos para os parâmetros
type Props = {
  params: {
    slug: string;
  };
};

// Função assíncrona para gerar os metadados
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const news = await getNewsData(slug);

  return {
    title: news
      ? `${news.title} | NewsWeb`
      : 'Notícia não encontrada | NewsWeb',
    description: news?.summary || 'Detalhes da notícia',
    openGraph: {
      title: news
        ? `${news.title} | NewsWeb`
        : 'Notícia não encontrada | NewsWeb',
      description: news?.summary || 'Detalhes da notícia',
      images: news?.imageUrl ? [news.imageUrl] : [],
    },
  };
}

// Função principal que renderiza a página
export default async function NewsPage({ params }: Props) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const news = await getNewsData(slug);

  if (!news) {
    return (
      <RootLayout>
        <div className="container py-8">
          <div>Notícia não encontrada</div>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className="container py-8">
        <Suspense fallback={<div>Carregando...</div>}>
          <NewsDetail slug={slug} />
          <CommentSection newsSlug={slug} />
        </Suspense>
      </div>
    </RootLayout>
  );
}
