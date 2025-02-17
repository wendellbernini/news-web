'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { News } from '@/types';
import { formatDate } from '@/lib/utils';
import { Loader2, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import ReactMarkdown from 'react-markdown';

interface NewsDetailProps {
  slug: string;
}

export function NewsDetail({ slug }: NewsDetailProps) {
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsQuery = doc(db, 'news', slug);
        const newsDoc = await getDoc(newsQuery);

        if (newsDoc.exists()) {
          setNews({ id: newsDoc.id, ...newsDoc.data() } as News);
        } else {
          setError('Notícia não encontrada');
        }
      } catch (err) {
        setError('Erro ao carregar a notícia');
        console.error('Erro ao buscar notícia:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [slug]);

  const handleLike = () => {
    // Implementar funcionalidade de curtir
    console.log('Curtir notícia:', slug);
  };

  const handleShare = async () => {
    if (navigator.share && news) {
      try {
        await navigator.share({
          title: news.title,
          text: news.summary,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback para copiar o link
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-center text-lg text-red-600">{error}</p>
      </div>
    );
  }

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
          <span>{news.readTime} min de leitura</span>
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
