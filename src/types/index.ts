/**
 * Representa um usuário do sistema.
 * @remarks Esta interface é usada em todo o sistema para representar usuários.
 */
export type User = {
  /** ID único do usuário (mesmo do Firebase Auth) */
  id: string;

  /** Nome de exibição do usuário */
  name: string;

  /** Email do usuário */
  email: string;

  /** URL da foto do perfil */
  photoURL?: string;

  /** Função do usuário no sistema */
  role: UserRole;

  /** Data de criação da conta */
  createdAt: Date;

  /** Nome de exibição alternativo (compatibilidade com Firebase) */
  displayName?: string;

  /** ID alternativo (compatibilidade com Firebase) */
  uid?: string;

  /** Metadados do usuário */
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };

  /** Preferências do usuário */
  preferences: UserPreferences;

  /** IDs das notícias salvas */
  savedNews: string[];

  /** Histórico de leitura */
  readHistory: ReadHistoryItem[];

  /** Preferências da newsletter */
  newsletter: NewsletterPreferences;

  /** Preferências de notificações push */
  pushNotifications: PushNotificationPreferences;
};

/** Possíveis funções de usuário no sistema */
export type UserRole = 'user' | 'admin';

export type UserPreferences = {
  categories: Category[];
  darkMode: boolean;
  emailNotifications: boolean;
};

export type ReadHistoryItem = {
  newsId: string;
  readAt: Date;
  progress?: number;
};

export type NewsletterPreferences = {
  subscribed: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  categories: Category[];
};

export type PushNotificationPreferences = {
  enabled: boolean;
  categories: Category[];
  breakingNews: boolean;
  newArticles: boolean;
};

export type News = {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  imageUrl: string;
  category: Category;
  author: {
    id: string;
    name: string;
    photoURL?: string;
  };
  comments: number;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
  readTime?: number;
  isBreakingNews?: boolean;
};

export type Comment = {
  id: string;
  newsId?: string;
  newsSlug: string;
  content: string;
  author: {
    id: string;
    name: string;
    photoURL?: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type Category =
  | 'Esportes'
  | 'Tecnologia'
  | 'Política'
  | 'Economia'
  | 'Entretenimento'
  | 'Saúde'
  | 'Educação'
  | 'Ciência';
