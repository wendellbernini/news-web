import { create } from 'zustand';
import {
  User,
  News,
  Category,
  UserPreferences,
  NewsletterPreferences,
} from '@/types';
import { cookieService } from '@/lib/cookies';

interface StoreState {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // News
  news: News[];
  setNews: (news: News[]) => void;
  addNews: (news: News) => void;
  updateNews: (news: News) => void;
  deleteNews: (newsId: string) => void;

  // Filters
  selectedCategory: Category | null;
  setSelectedCategory: (category: Category | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Loading States
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // User Preferences
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;

  // Saved News
  savedNews: string[];
  saveNews: (newsId: string) => void;
  unsaveNews: (newsId: string) => void;

  // Newsletter
  updateNewsletterPreferences: (
    preferences: Partial<NewsletterPreferences>
  ) => void;

  // Read History
  addToReadHistory: (newsId: string, progress?: number) => void;

  // Comments
  updateNewsCommentCount: (newsSlug: string, increment: number) => void;
}

// Função auxiliar para obter tema inicial
const getInitialTheme = (): boolean => {
  // Se tiver cookies funcionais, usa a preferência salva
  const { preferences, active } = cookieService.checkStatus();
  if (active && preferences.functional) {
    const userPrefs = cookieService.getUserPreferences();
    if ('darkMode' in userPrefs && typeof userPrefs.darkMode === 'boolean') {
      return userPrefs.darkMode;
    }
  }
  // Fallback para preferência do sistema
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const useStore = create<StoreState>((set) => ({
  // Auth
  user: null,
  setUser: (user) =>
    set({
      user: user ? { ...user, savedNews: user.savedNews || [] } : null,
      isDarkMode: user?.preferences?.darkMode || getInitialTheme(),
    }),

  // Theme
  isDarkMode: typeof window !== 'undefined' ? getInitialTheme() : false,
  toggleDarkMode: () =>
    set((state) => {
      const newDarkMode = !state.isDarkMode;

      // Se cookies funcionais estiverem ativos, salva a preferência
      const { preferences } = cookieService.checkStatus();
      if (preferences.functional) {
        cookieService.saveUserPreference('darkMode', newDarkMode);
      }

      return { isDarkMode: newDarkMode };
    }),

  // News
  news: [],
  setNews: (news) => set({ news }),
  addNews: (news) => set((state) => ({ news: [news, ...state.news] })),
  updateNews: (updatedNews) =>
    set((state) => ({
      news: state.news.map((news) =>
        news.id === updatedNews.id ? updatedNews : news
      ),
    })),
  deleteNews: (newsId) =>
    set((state) => ({
      news: state.news.filter((news) => news.id !== newsId),
    })),

  // Filters
  selectedCategory: null,
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Loading States
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // User Preferences
  updateUserPreferences: (preferences) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            preferences: { ...state.user.preferences, ...preferences },
          }
        : null,
    })),

  // Saved News
  savedNews: [],
  saveNews: (newsId) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            savedNews: [...(state.user.savedNews || []), newsId],
          }
        : null,
    })),
  unsaveNews: (newsId) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            savedNews: (state.user.savedNews || []).filter(
              (id) => id !== newsId
            ),
          }
        : null,
    })),

  // Newsletter
  updateNewsletterPreferences: (preferences) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            newsletter: {
              ...state.user.newsletter,
              ...preferences,
            },
          }
        : null,
    })),

  // Read History
  addToReadHistory: (newsId, progress) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            readHistory: [
              {
                newsId,
                readAt: new Date(),
                progress,
              },
              ...state.user.readHistory,
            ].slice(0, 100), // Mantém apenas os últimos 100 itens
          }
        : null,
    })),

  // Comments
  updateNewsCommentCount: (newsSlug: string, increment: number) =>
    set((state) => ({
      news: state.news.map((news) =>
        news.slug === newsSlug
          ? { ...news, comments: (news.comments || 0) + increment }
          : news
      ),
    })),
}));

export default useStore;
