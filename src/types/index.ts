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
  views: number;
  likes: number;
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
  parentId?: string;
  replies?: Comment[];
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

/**
 * Representa uma notificação do sistema
 * @remarks Usado para notificar usuários sobre novas notícias em suas categorias de interesse
 */
export type Notification = {
  /** ID único da notificação */
  id: string;

  /** ID do usuário que receberá a notificação */
  userId: string;

  /** ID da notícia relacionada */
  newsId: string;

  /** Título da notícia */
  newsTitle: string;

  /** Categoria da notícia */
  category: Category;

  /** Data de criação da notificação */
  createdAt: Date;

  /** Se a notificação foi lida */
  read: boolean;

  /** Link para a notícia */
  link: string;
};

/**
 * Representa o estado de notificações do usuário
 */
export type NotificationState = {
  /** Total de notificações não lidas */
  unreadCount: number;

  /** Lista de notificações */
  notifications: Notification[];

  /** Data da última verificação */
  lastChecked: Date;
};

/** Preferências de notificações push */
export type PushNotificationPreferences = {
  /** Se as notificações push estão habilitadas */
  enabled: boolean;
  /** Categorias selecionadas para notificações */
  categories: Category[];
  /** Se deseja receber notificações de breaking news */
  breakingNews: boolean;
  /** Se deseja receber notificações de novos artigos */
  newArticles: boolean;
};

/**
 * Configurações do sistema de cache
 * @remarks Usado para configurar o comportamento do cache em diferentes ambientes
 */
export interface CacheConfig {
  /** Se o cache está habilitado */
  enabled: boolean;
  /** Duração padrão do cache em segundos */
  duration: number;
  /** Se o cache CDN está habilitado */
  cdnEnabled: boolean;
  /** URL base do CDN */
  cdnUrl: string;
}
