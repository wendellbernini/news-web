import Image from 'next/image';
import Link from 'next/link';
import { Bookmark, MessageCircle, Share2 } from 'lucide-react';
import { News } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { formatDate, truncateText, ensureDate } from '@/lib/utils';
import useStore from '@/store/useStore';
import { useReadingList } from '@/hooks/useReadingList';

interface NewsCardProps {
  news: News;
  onShare?: (news: News) => void;
  onToggleSave?: (newsId: string) => Promise<void>;
  variant?: 'default' | 'compact';
}

export function NewsCard({
  news,
  onShare,
  onToggleSave,
  variant = 'default',
}: NewsCardProps) {
  const user = useStore((state) => state.user);
  const { isSaved } = useReadingList();

  const handleSave = async () => {
    if (!user) {
      return;
    }

    if (onToggleSave) {
      await onToggleSave(news.id);
    }
  };

  // Usa a função isSaved do hook para maior consistência
  const isNewsSaved = isSaved(news.id);

  if (variant === 'compact') {
    return (
      <Card className="group overflow-hidden">
        <div className="flex gap-4">
          <Link
            href={`/noticias/${news.slug}`}
            className="relative h-24 w-32 shrink-0 overflow-hidden"
          >
            <Image
              src={news.imageUrl}
              alt={news.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="128px"
            />
          </Link>
          <div className="flex flex-col justify-between py-2">
            <div>
              <Link
                href={`/noticias/${news.slug}`}
                className="group-hover:text-primary-600"
              >
                <CardTitle className="line-clamp-2 text-base">
                  {news.title}
                </CardTitle>
              </Link>
              <CardDescription className="mt-1 flex items-center gap-2 text-xs">
                <time dateTime={ensureDate(news.createdAt).toISOString()}>
                  {formatDate(ensureDate(news.createdAt))}
                </time>
                <span>•</span>
                <span>{news.category}</span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 px-2"
                onClick={handleSave}
              >
                <Bookmark
                  className={`h-4 w-4 ${isNewsSaved ? 'fill-current' : ''}`}
                />
                <span className="text-xs">
                  {isNewsSaved ? 'Salvo' : 'Salvar'}
                </span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => onShare?.(news)}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden">
      <Link href={`/noticias/${news.slug}`}>
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src={news.imageUrl}
            alt={news.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <span className="absolute bottom-4 left-4 rounded-full bg-primary-600 px-3 py-1 text-xs font-medium text-white">
            {news.category}
          </span>
        </div>
      </Link>

      <div className="p-4">
        <Link
          href={`/noticias/${news.slug}`}
          className="group-hover:text-primary-600"
        >
          <h3 className="text-xl font-semibold">{news.title}</h3>
        </Link>

        <div className="text-muted-foreground mt-2 flex items-center gap-2 text-xs">
          <Image
            src={news.author.photoURL || '/images/avatar-placeholder.png'}
            alt={news.author.name}
            width={24}
            height={24}
            className="rounded-full"
          />
          <span>{news.author.name}</span>
          <span>•</span>
          <time dateTime={ensureDate(news.createdAt).toISOString()}>
            {formatDate(ensureDate(news.createdAt))}
          </time>
        </div>

        <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
          {truncateText(news.summary, 150)}
        </p>

        <div className="mt-4 flex gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={handleSave}
          >
            <Bookmark
              className={`h-4 w-4 ${isNewsSaved ? 'fill-current' : ''}`}
            />
            <span>{isNewsSaved ? 'Salvo' : 'Salvar'}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2" asChild>
            <Link
              href={`/noticias/${news.slug}#comentarios`}
              className="flex items-center"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="pl-2 text-xs text-secondary-600 dark:text-secondary-400">
                {news.comments || 0}
              </span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => onShare?.(news)}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
