import Image from 'next/image';
import Link from 'next/link';
import { Bookmark, Share2 } from 'lucide-react';
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
  variant?: 'default' | 'compact' | 'minimal';
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

  const isNewsSaved = isSaved(news.id);

  if (variant === 'minimal') {
    return (
      <Card className="group overflow-hidden border-0 bg-transparent shadow-none hover:bg-secondary-50 dark:hover:bg-secondary-900/50">
        <div className="space-y-2 p-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-primary-600">
              {news.category}
            </span>
            <span className="text-muted-foreground text-xs">•</span>
            <time
              className="text-muted-foreground text-xs"
              dateTime={ensureDate(news.createdAt).toISOString()}
            >
              {formatDate(ensureDate(news.createdAt))}
            </time>
          </div>
          <Link
            href={`/noticias/${news.slug}`}
            className="block group-hover:text-primary-600"
          >
            <h3 className="line-clamp-2 text-base font-semibold">
              {news.title}
            </h3>
          </Link>
          <p className="line-clamp-2 text-sm text-secondary-600 dark:text-secondary-400">
            {truncateText(news.summary, 120)}
          </p>
        </div>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className="group overflow-hidden hover:shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href={`/noticias/${news.slug}`}
            className="relative h-32 w-full shrink-0 overflow-hidden sm:w-48"
          >
            <Image
              src={news.imageUrl}
              alt={news.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 192px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <span className="absolute bottom-2 left-2 rounded-full bg-primary-600 px-2 py-0.5 text-xs font-medium text-white">
              {news.category}
            </span>
          </Link>
          <div className="flex flex-1 flex-col justify-between p-2 sm:py-2 sm:pl-0 sm:pr-2">
            <div className="space-y-2">
              <Link
                href={`/noticias/${news.slug}`}
                className="group-hover:text-primary-600"
              >
                <CardTitle className="line-clamp-2 text-sm sm:text-base">
                  {news.title}
                </CardTitle>
              </Link>
              <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                {truncateText(news.summary, 100)}
              </CardDescription>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <time
                className="text-xs text-secondary-600"
                dateTime={ensureDate(news.createdAt).toISOString()}
              >
                {formatDate(ensureDate(news.createdAt))}
              </time>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 sm:h-8 sm:w-8 sm:px-2"
                  onClick={handleSave}
                >
                  <Bookmark
                    className={`h-4 w-4 ${isNewsSaved ? 'fill-current' : ''}`}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 sm:h-8 sm:w-8 sm:px-2"
                  onClick={() => onShare?.(news)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden transition-shadow duration-300 hover:shadow-lg">
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href={`/noticias/${news.slug}`}
          className="relative h-[180px] w-full shrink-0 overflow-hidden sm:h-[200px] sm:w-[300px]"
        >
          <Image
            src={news.imageUrl}
            alt={news.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 300px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <span className="absolute bottom-3 left-3 rounded-full bg-primary-600 px-2.5 py-0.5 text-xs font-medium text-white">
            {news.category}
          </span>
        </Link>

        <div className="flex flex-1 flex-col justify-between p-3 sm:py-3 sm:pl-0 sm:pr-3">
          <div className="space-y-2">
            <Link
              href={`/noticias/${news.slug}`}
              className="group-hover:text-primary-600"
            >
              <h3 className="line-clamp-2 text-base font-semibold sm:text-lg md:text-xl">
                {news.title}
              </h3>
            </Link>

            <p className="line-clamp-2 text-xs text-secondary-600 dark:text-secondary-400 sm:line-clamp-3 sm:text-sm">
              {truncateText(news.summary, 150)}
            </p>
          </div>

          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1 sm:gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-1 sm:gap-1.5 sm:px-2"
                onClick={handleSave}
              >
                <Bookmark
                  className={`h-4 w-4 ${isNewsSaved ? 'fill-current' : ''}`}
                />
                <span className="hidden text-xs sm:inline">
                  {isNewsSaved ? 'Salvo' : 'Salvar'}
                </span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-1 sm:px-2"
                onClick={() => onShare?.(news)}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <time dateTime={ensureDate(news.createdAt).toISOString()}>
                {formatDate(ensureDate(news.createdAt))}
              </time>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
