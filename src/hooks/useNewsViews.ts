import { useEffect, useState } from 'react';
import { doc, increment, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { cacheService } from '@/lib/cache';

const VIEWS_STORAGE_KEY = 'news_views';
const VIEW_DEBOUNCE_TIME = 120000; // 2 minutos
const BATCH_SIZE = 20; // Aumentado para reduzir número de escritas
const VIEWS_CACHE_KEY = 'pending_views';

export const useNewsViews = (newsId: string) => {
  const [hasViewed, setHasViewed] = useState(false);

  useEffect(() => {
    // Verifica se a notícia já foi visualizada na sessão atual
    const checkViewed = () => {
      const viewedNews = JSON.parse(
        sessionStorage.getItem(VIEWS_STORAGE_KEY) || '[]'
      );
      return viewedNews.includes(newsId);
    };

    const incrementViews = async () => {
      if (checkViewed()) {
        setHasViewed(true);
        return;
      }

      try {
        const viewKey = `news_view_${newsId}`;

        // Verifica debounce usando apenas memória
        const lastView = await cacheService.get(viewKey, async () => null, {
          useMemoryOnly: true,
        });

        if (lastView && Date.now() - lastView < VIEW_DEBOUNCE_TIME) {
          return;
        }

        // Atualiza timestamp da visualização
        await cacheService.set(viewKey, Date.now(), { useMemoryOnly: true });

        // Adiciona à lista de visualizações pendentes
        const pendingViews = await cacheService.get<string[]>(
          VIEWS_CACHE_KEY,
          async () => [],
          { useMemoryOnly: true }
        );

        if (!pendingViews.includes(newsId)) {
          pendingViews.push(newsId);
          await cacheService.set(VIEWS_CACHE_KEY, pendingViews, {
            useMemoryOnly: true,
          });
        }

        // Processa em batch se atingiu o limite
        if (pendingViews.length >= BATCH_SIZE) {
          const batch = writeBatch(db);
          const uniqueViews = Array.from(new Set(pendingViews));

          uniqueViews.forEach((id) => {
            const newsRef = doc(db, 'news', id);
            batch.update(newsRef, {
              views: increment(1),
              lastViewed: new Date(),
            });
          });

          await batch.commit();
          await cacheService.set(VIEWS_CACHE_KEY, [], { useMemoryOnly: true });
        }

        // Atualiza sessão
        const viewedNews = JSON.parse(
          sessionStorage.getItem(VIEWS_STORAGE_KEY) || '[]'
        );
        if (!viewedNews.includes(newsId)) {
          viewedNews.push(newsId);
          sessionStorage.setItem(VIEWS_STORAGE_KEY, JSON.stringify(viewedNews));
        }
        setHasViewed(true);
      } catch (error) {
        console.error('Erro ao incrementar visualizações:', error);
      }
    };

    incrementViews();
  }, [newsId]);

  return hasViewed;
};
