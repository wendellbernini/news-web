'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { News } from '@/types';
import { formatDate } from '@/lib/utils';
import { Loader2, Share2, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useReadHistory } from '@/hooks/useReadHistory';
import useStore from '@/store/useStore';
import { useReadingList } from '@/hooks/useReadingList';
import { useNewsViews } from '@/hooks/useNewsViews';
import { useFacebookPixel } from '@/hooks/useFacebookPixel';

interface NewsDetailProps {
  slug: string;
}

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
  useNewsViews(newsId || '');
  const { trackEvent } = useFacebookPixel();

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
          const newsData = {
            id: newsDoc.id,
            ...newsDoc.data(),
          } as News;
          setNews(newsData);

          // Rastrear evento de visualização de notícia no Facebook Pixel
          trackEvent('ViewContent', {
            content_name: newsData.title,
            content_category: newsData.category,
            content_ids: [newsData.id],
            content_type: 'article',
          });
        } else {
          setError('Notícia não encontrada');
        }
      } catch (error) {
        console.error('Erro ao buscar notícia:', error);
        setError('Erro ao carregar a notícia');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [slug, trackEvent]);

  // Usa a mesma lógica do NewsCard
  const isSaved = news ? user?.savedNews?.includes(news.id) || false : false;

  // Efeito separado para registrar o histórico
  useEffect(() => {
    const registerHistory = async () => {
      if (!news || !user || historyRegistered) {
        return;
      }

      setHistoryRegistered(true);

      try {
        await addToHistory(news.id, news.slug, news.title);
      } catch (error) {
        console.error('Erro ao registrar histórico:', error);
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

  const handleSave = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para salvar notícias');
      router.push('/login');
      return;
    }

    try {
      await toggleSaveNews(news.id);

      // Rastrear evento de salvar notícia no Facebook Pixel
      trackEvent('AddToWishlist', {
        content_name: news.title,
        content_category: news.category,
        content_ids: [news.id],
        content_type: 'article',
      });
    } catch (error) {
      console.error('Erro ao salvar/remover notícia:', error);
      toast.error('Erro ao salvar/remover notícia');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: news.title,
          text: news.summary,
          url: window.location.href,
        });

        // Rastrear evento de compartilhamento no Facebook Pixel
        trackEvent('Share', {
          content_name: news.title,
          content_category: news.category,
          content_ids: [news.id],
          content_type: 'article',
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

      // Rastrear evento de cópia de link no Facebook Pixel
      trackEvent('Share', {
        content_name: news.title,
        content_category: news.category,
        content_ids: [news.id],
        content_type: 'article',
        method: 'copy_link',
      });
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
            onClick={handleSave}
          >
            <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? 'Salvo' : 'Salvar'}</span>
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
