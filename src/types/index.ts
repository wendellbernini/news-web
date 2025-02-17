export type User = {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  role: 'user' | 'admin';
  createdAt: Date;
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
  likes: number;
  comments: number;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
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

export type Like = {
  userId: string;
  newsId: string;
  createdAt: Date;
};
