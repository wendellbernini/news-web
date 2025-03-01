import { useEffect, useState } from 'react';
import { doc, increment, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { cacheService } from '@/lib/cache';

const VIEWS_STORAGE_KEY = 'news_views';
const VIEW_DEBOUNCE_TIME = 120000; // 2 minutos
const BATCH_SIZE = 1; // Aumentado para reduzir número de escritas
const VIEWS_CACHE_KEY = 'pending_views';

export const useNewsViews = (newsId: string) => {
  const [hasViewed, setHasViewed] = useState(false);

  useEffect(() => {
    console.log(`useNewsViews chamado com newsId: ${newsId}`);

    if (!newsId) {
      console.warn('newsId vazio, não incrementando visualizações.');
      return;
    }

    const checkViewed = () => {
      const viewedNews = JSON.parse(
        sessionStorage.getItem(VIEWS_STORAGE_KEY) || '[]'
      );
      console.log(`Visualizações armazenadas: ${JSON.stringify(viewedNews)}`);
      return viewedNews.includes(newsId);
    };

    const incrementViews = async () => {
      if (checkViewed()) {
        console.log(`Notícia ${newsId} já foi visualizada.`);
        setHasViewed(true);
        return;
      }

      try {
        const viewKey = `news_view_${newsId}`;

        const lastView = await cacheService.get(viewKey, async () => null, {
          useMemoryOnly: true,
        });

        if (lastView && Date.now() - lastView < VIEW_DEBOUNCE_TIME) {
          console.log(
            `Visualização recente para ${newsId}, não incrementando.`
          );
          return;
        }

        await cacheService.set(viewKey, Date.now(), { useMemoryOnly: true });

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

        console.log(
          `Pending views antes do incremento: ${JSON.stringify(pendingViews)}`
        );

        if (pendingViews.length >= BATCH_SIZE) {
          const batch = writeBatch(db);
          const uniqueViews = Array.from(new Set(pendingViews));

          uniqueViews.forEach((id) => {
            const newsRef = doc(db, 'news', id);
            batch.update(newsRef, {
              views: increment(1),
              lastViewed: new Date(),
            });
            console.log(`Incrementando visualizações para ${id}.`);
          });

          await batch.commit();
          await cacheService.set(VIEWS_CACHE_KEY, [], { useMemoryOnly: true });
        }

        const viewedNews = JSON.parse(
          sessionStorage.getItem(VIEWS_STORAGE_KEY) || '[]'
        );
        if (!viewedNews.includes(newsId)) {
          viewedNews.push(newsId);
          sessionStorage.setItem(VIEWS_STORAGE_KEY, JSON.stringify(viewedNews));
        }
        console.log(
          `Visualizações armazenadas antes de adicionar: ${JSON.stringify(viewedNews)}`
        );
        setHasViewed(true);
      } catch (error) {
        console.error('Erro ao incrementar visualizações:', error);
      }
    };

    incrementViews();
  }, [newsId]);

  return hasViewed;
};
