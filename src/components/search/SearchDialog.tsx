'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { useNews } from '@/hooks/useNews';
import { NewsCard } from '@/components/news/NewsCard';
import { Loader2, Search } from 'lucide-react';
import { News } from '@/types';
import { useReadingList } from '@/hooks/useReadingList';

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { news: results, loading, searchNews } = useNews();
  const { toggleSaveNews } = useReadingList();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    const handleSearch = async () => {
      if (!query.trim()) {
        searchNews('');
        return;
      }

      await searchNews(query);
    };

    const timeoutId = setTimeout(handleSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [query, searchNews]);

  const handleShare = async (news: News) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: news.title,
          text: news.summary,
          url: `${window.location.origin}/noticias/${news.slug}`,
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback para copiar o link
      const url = `${window.location.origin}/noticias/${news.slug}`;
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(true)}
      >
        <Search className="h-5 w-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <div className="fixed inset-0 z-50 flex items-start justify-center sm:items-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
          <div className="fixed inset-0 z-50 flex items-start justify-center sm:items-center">
            <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg dark:bg-secondary-900 sm:p-8">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar notícias..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-lg border border-secondary-200 bg-transparent px-4 py-2 outline-none focus:border-primary-600 dark:border-secondary-800"
                />
              </div>

              <div className="max-h-[60vh] space-y-4 overflow-y-auto p-4">
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                  </div>
                )}

                {!loading && results.length === 0 && query && (
                  <p className="text-center text-sm text-secondary-500">
                    Nenhuma notícia encontrada para "{query}"
                  </p>
                )}

                {!loading &&
                  results.map((news) => (
                    <NewsCard
                      key={news.id}
                      news={news}
                      onShare={handleShare}
                      onToggleSave={toggleSaveNews}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
