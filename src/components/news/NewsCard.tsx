import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { News } from '@/types';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { formatDate, truncateText } from '@/lib/utils';

interface NewsCardProps {
  news: News;
  onLike?: (newsId: string) => void;
  onShare?: (news: News) => void;
  onToggleSave?: (newsId: string) => Promise<void>;
  onCheckSaved?: (newsId: string) => Promise<boolean>;
}

export function NewsCard({ news, onLike, onShare }: NewsCardProps) {
  return (
    <Card className="group overflow-hidden">
      <Link href={`/noticias/${news.slug}`}>
        <div className="relative aspect-video w-full overflow-hidden">
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

      <CardHeader>
        <Link
          href={`/noticias/${news.slug}`}
          className="group-hover:text-primary-600"
        >
          <CardTitle>{news.title}</CardTitle>
        </Link>
        <CardDescription className="flex items-center gap-2 text-xs">
          <Image
            src={news.author.photoURL || '/images/avatar-placeholder.png'}
            alt={news.author.name}
            width={24}
            height={24}
            className="rounded-full"
          />
          <span>{news.author.name}</span>
          <span>•</span>
          <time dateTime={news.createdAt.toISOString()}>
            {formatDate(news.createdAt)}
          </time>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-secondary-600 dark:text-secondary-400">
          {truncateText(news.summary, 150)}
        </p>
      </CardContent>

      <CardFooter className="gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => onLike?.(news.id)}
        >
          <Heart className="h-4 w-4" />
          <span>{news.likes}</span>
        </Button>
        <Button variant="ghost" size="sm" className="gap-2" asChild>
          <Link href={`/noticias/${news.slug}#comentarios`}>
            <MessageCircle className="h-4 w-4" />
            <span>{news.comments}</span>
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
      </CardFooter>
    </Card>
  );
}
