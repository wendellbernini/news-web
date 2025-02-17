'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useNews } from '@/hooks/useNews';
import { NewsCard } from '@/components/news/NewsCard';
import { Loader2, Search, X } from 'lucide-react';
import { News } from '@/types';

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { searchNews, news: results, loading } = useNews();

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
    if (query) {
      const debounce = setTimeout(() => {
        searchNews(query);
      }, 300);

      return () => clearTimeout(debounce);
    }
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
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Buscar notícias...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-secondary-100 px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <div className="fixed inset-0 z-50 flex items-start justify-center sm:items-center">
          <div className="relative w-full max-w-lg">
            <div className="overflow-hidden rounded-lg border border-secondary-200 bg-white shadow-xl dark:border-secondary-800 dark:bg-secondary-950">
              <div className="flex items-center border-b p-4">
                <Search className="mr-2 h-5 w-5 shrink-0 opacity-50" />
                <Input
                  placeholder="Buscar notícias..."
                  className="border-0 p-0 focus-visible:ring-0"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
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
                      onLike={() => {}}
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
