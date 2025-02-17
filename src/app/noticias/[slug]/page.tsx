import { Metadata } from 'next';
import { RootLayout } from '@/components/layout/RootLayout';
import { NewsDetail } from '@/components/news/NewsDetail';
import { CommentSection } from '@/components/news/CommentSection';

interface NewsPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: NewsPageProps): Promise<Metadata> {
  return {
    title: `${params.slug} | NewsWeb`,
    description: 'Detalhes da notícia',
  };
}

export default function NewsPage({ params }: NewsPageProps) {
  return (
    <RootLayout>
      <div className="container py-8">
        <NewsDetail slug={params.slug} />
        <CommentSection newsSlug={params.slug} />
      </div>
    </RootLayout>
  );
}
