import { create } from "zustand";
import { User, News, Category } from "@/types";

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
}

const useStore = create<StoreState>((set) => ({
  // Auth
  user: null,
  setUser: (user) => set({ user }),

  // Theme
  isDarkMode: false,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

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
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Loading States
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));

export default useStore;
