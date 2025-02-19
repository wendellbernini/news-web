'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { News } from '@/types';
import { formatDate } from '@/lib/utils';
import { Loader2, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useReadHistory } from '@/hooks/useReadHistory';
import { useAuth } from '@/hooks/useAuth';

interface NewsDetailProps {
  slug: string;
}

export function NewsDetail({ slug }: NewsDetailProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addToHistory } = useReadHistory();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyRegistered, setHistoryRegistered] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      if (!slug) return;

      setLoading(true);
      setError(null);

      try {
        const newsQuery = query(
          collection(db, 'news'),
          where('slug', '==', slug)
        );
        const snapshot = await getDocs(newsQuery);

        if (!snapshot.empty) {
          const newsDoc = snapshot.docs[0];
          const data = newsDoc.data();
          const newsData = {
            id: newsDoc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as News;

          setNews(newsData);
        } else {
          setError('Notícia não encontrada');
          toast.error('Notícia não encontrada');
        }
      } catch (err) {
        console.error('Erro ao buscar notícia:', err);
        setError(
          'Erro ao carregar a notícia. Por favor, tente novamente mais tarde.'
        );
        toast.error('Erro ao carregar a notícia');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [slug]);

  // Efeito separado para registrar o histórico
  useEffect(() => {
    const registerHistory = async () => {
      if (!news || !user || historyRegistered) {
        console.log(
          'NewsDetail: Condições não atendidas para registrar histórico:',
          {
            hasNews: !!news,
            hasUser: !!user,
            alreadyRegistered: historyRegistered,
          }
        );
        return;
      }

      // Marca como registrado antes de tentar registrar para evitar chamadas duplicadas
      setHistoryRegistered(true);

      try {
        console.log('NewsDetail: Iniciando registro de histórico:', {
          newsId: news.id,
          newsSlug: news.slug,
          newsTitle: news.title,
        });

        await addToHistory(news.id, news.slug, news.title);
        console.log(
          'NewsDetail: Histórico registrado com sucesso:',
          news.title
        );
      } catch (error) {
        console.error('NewsDetail: Erro ao registrar histórico:', error);
        // Só desmarca como registrado se o erro não for de "já registrado"
        if (
          error instanceof Error &&
          !error.message.includes('já está no histórico')
        ) {
          setHistoryRegistered(false);
        }
      }
    };

    registerHistory();
  }, [news, user, addToHistory, historyRegistered]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <p className="text-center text-lg text-red-600">{error}</p>
        <Button variant="outline" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>
    );
  }

  const handleLike = () => {
    toast.success('Funcionalidade em desenvolvimento');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: news.title,
          text: news.summary,
          url: window.location.href,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Erro ao compartilhar:', error);
          toast.error('Erro ao compartilhar');
        }
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  return (
    <article className="mx-auto max-w-4xl">
      <header className="mb-8">
        <span className="mb-4 inline-block rounded-full bg-primary-600 px-3 py-1 text-sm font-medium text-white">
          {news.category}
        </span>
        <h1 className="mb-4 text-4xl font-bold">{news.title}</h1>
        <p className="mb-6 text-xl text-secondary-600 dark:text-secondary-400">
          {news.summary}
        </p>
        <div className="flex items-center gap-4 text-sm text-secondary-600 dark:text-secondary-400">
          <div className="flex items-center gap-2">
            <Image
              src={news.author.photoURL || '/images/avatar-placeholder.png'}
              alt={news.author.name}
              width={32}
              height={32}
              className="rounded-full"
            />
            <span>{news.author.name}</span>
          </div>
          <span>•</span>
          <time dateTime={news.createdAt.toISOString()}>
            {formatDate(news.createdAt)}
          </time>
          <span>•</span>
          <span>{news.readTime || '5'} min de leitura</span>
        </div>
      </header>

      <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-xl">
        <Image
          src={news.imageUrl}
          alt={news.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="prose prose-lg max-w-none dark:prose-invert">
        <ReactMarkdown>{news.content}</ReactMarkdown>
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-secondary-200 pt-8 dark:border-secondary-800">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleLike}
          >
            <Heart className="h-5 w-5" />
            <span>{news.likes} curtidas</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5" />
            <span>Compartilhar</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
