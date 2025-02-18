'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Loader2, Send } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Comment } from '@/types';
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'react-hot-toast';

interface CommentSectionProps {
  newsSlug: string;
}

export function CommentSection({ newsSlug }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');

  useEffect(() => {
    fetchComments();
  }, [newsSlug]);

  const fetchComments = async () => {
    try {
      const commentsQuery = query(
        collection(db, 'comments'),
        where('newsSlug', '==', newsSlug),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(commentsQuery);
      const commentsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
        };
      }) as Comment[];

      setComments(commentsData);
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      toast.error('Erro ao carregar comentários');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Você precisa estar logado para comentar');
      return;
    }

    if (!content.trim()) return;

    setSubmitting(true);

    try {
      const commentData = {
        newsSlug,
        content: content.trim(),
        author: {
          id: user.id,
          name: user.name,
          photoURL: user.photoURL,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'comments'), commentData);
      const newComment = { id: docRef.id, ...commentData };

      setComments((prev) => [newComment, ...prev]);
      setContent('');
      toast.success('Comentário adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      toast.error('Erro ao adicionar comentário');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'comments', commentId));
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      toast.success('Comentário excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      toast.error('Erro ao excluir comentário');
    }
  };

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="mt-8" id="comentarios">
      <h2 className="mb-4 text-2xl font-bold">Comentários</h2>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <Image
              src={user.photoURL || '/images/avatar-placeholder.png'}
              alt={user.name}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full"
            />
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Adicione um comentário..."
                className="w-full rounded-lg border border-secondary-200 p-3 focus:border-primary-600 focus:outline-none dark:border-secondary-800 dark:bg-secondary-900"
                rows={3}
                required
              />
              <div className="mt-2 flex justify-end">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 rounded-lg border border-secondary-200 p-4 text-center dark:border-secondary-800">
          <p className="text-secondary-600 dark:text-secondary-400">
            Faça login para adicionar um comentário
          </p>
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="rounded-lg border border-secondary-200 p-4 dark:border-secondary-800"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src={
                    comment.author.photoURL || '/images/avatar-placeholder.png'
                  }
                  alt={comment.author.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <div>
                  <p className="font-medium">{comment.author.name}</p>
                  <time
                    dateTime={comment.createdAt.toISOString()}
                    className="text-sm text-secondary-500"
                  >
                    {formatDate(comment.createdAt)}
                  </time>
                </div>
              </div>
              {user?.id === comment.author.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(comment.id)}
                >
                  Excluir
                </Button>
              )}
            </div>
            <p className="text-secondary-800 dark:text-secondary-200">
              {comment.content}
            </p>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-center text-secondary-600 dark:text-secondary-400">
            Nenhum comentário ainda. Seja o primeiro a comentar!
          </p>
        )}
      </div>
    </div>
  );
}
