import { useEffect, useState } from 'react';
import { doc, increment, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { cacheService } from '@/lib/cache';

const VIEWS_STORAGE_KEY = 'news_views';
const VIEW_DEBOUNCE_TIME = 30000; // 30 segundos

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
        // Usa o cache para controlar o debounce de visualizações
        const cacheKey = `news_view_${newsId}`;
        const lastViewTimestamp = await cacheService.get(
          cacheKey,
          async () => null,
          { useMemoryOnly: true }
        );

        const now = Date.now();
        if (lastViewTimestamp && now - lastViewTimestamp < VIEW_DEBOUNCE_TIME) {
          // Se a última visualização foi muito recente, não incrementa
          return;
        }

        // Atualiza o timestamp da última visualização
        cacheService.set(cacheKey, now, true);

        // Atualiza o contador de views no Firestore
        const newsRef = doc(db, 'news', newsId);
        await updateDoc(newsRef, {
          views: increment(1),
        });

        // Marca a notícia como visualizada na sessão
        const viewedNews = JSON.parse(
          sessionStorage.getItem(VIEWS_STORAGE_KEY) || '[]'
        );
        viewedNews.push(newsId);
        sessionStorage.setItem(VIEWS_STORAGE_KEY, JSON.stringify(viewedNews));
        setHasViewed(true);
      } catch (error) {
        console.error('Erro ao incrementar visualizações:', error);
      }
    };

    if (newsId && !hasViewed) {
      incrementViews();
    }
  }, [newsId, hasViewed]);

  return { hasViewed };
};
