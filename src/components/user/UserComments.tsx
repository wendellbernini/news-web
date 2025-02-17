'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  newsSlug: string;
  newsTitle: string;
}

export function UserComments() {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const commentsQuery = query(
          collection(db, 'comments'),
          where('author.id', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(10)
        );

        const snapshot = await getDocs(commentsQuery);
        const commentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
        })) as Comment[];

        setComments(commentsData);
      } catch (error) {
        console.error('Erro ao buscar comentários:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [user]);

  if (!user) {
    return (
      <div className="rounded-lg border border-secondary-200 p-6 dark:border-secondary-800">
        <p className="text-center text-secondary-600 dark:text-secondary-400">
          Faça login para ver seus comentários
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-secondary-200 p-6 dark:border-secondary-800">
      <h2 className="mb-4 text-xl font-bold">Meus Comentários</h2>

      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border border-secondary-200 p-4 dark:border-secondary-800"
            >
              <Link
                href={`/noticias/${comment.newsSlug}`}
                className="mb-2 block font-medium hover:text-primary-600"
              >
                {comment.newsTitle}
              </Link>
              <p className="mb-2 text-secondary-800 dark:text-secondary-200">
                {comment.content}
              </p>
              <time
                dateTime={comment.createdAt.toISOString()}
                className="text-sm text-secondary-600 dark:text-secondary-400"
              >
                {formatDate(comment.createdAt)}
              </time>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-secondary-600 dark:text-secondary-400">
          Você ainda não fez nenhum comentário
        </p>
      )}
    </div>
  );
}
