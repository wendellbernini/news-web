'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Loader2, Send, Reply, Trash2 } from 'lucide-react';
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
  runTransaction,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'react-hot-toast';
import useStore from '@/store/useStore';

interface CommentSectionProps {
  newsSlug: string;
}

const updateCommentCount = async (newsSlug: string, increment: number) => {
  try {
    // Primeiro encontra o documento da notícia pelo slug
    const newsQuery = query(
      collection(db, 'news'),
      where('slug', '==', newsSlug)
    );
    const newsSnapshot = await getDocs(newsQuery);

    if (!newsSnapshot.empty) {
      const newsDoc = newsSnapshot.docs[0];

      // Atualiza o contador de comentários
      await runTransaction(db, async (transaction) => {
        const newsRef = doc(db, 'news', newsDoc.id);
        const newsData = (await transaction.get(newsRef)).data();

        transaction.update(newsRef, {
          comments: (newsData?.comments || 0) + increment,
        });
      });
    }
  } catch (error) {
    console.error('Erro ao atualizar contador de comentários:', error);
    throw error;
  }
};

// Componente de formulário de comentário reutilizável
function CommentForm({
  onSubmit,
  initialContent = '',
  placeholder = 'Adicione um comentário...',
  buttonText = 'Enviar',
  showCancel = false,
  onCancel,
}: {
  onSubmit: (content: string) => Promise<void>;
  initialContent?: string;
  placeholder?: string;
  buttonText?: string;
  showCancel?: boolean;
  onCancel?: () => void;
}) {
  const { user } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4">
      <Image
        src={user?.photoURL || '/images/avatar-placeholder.png'}
        alt={user?.name || 'Avatar'}
        width={40}
        height={40}
        className="h-10 w-10 rounded-full"
      />
      <div className="flex-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-secondary-200 p-3 focus:border-primary-600 focus:outline-none dark:border-secondary-800 dark:bg-secondary-900"
          rows={3}
          required
        />
        <div className="mt-2 flex justify-end gap-2">
          {showCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {buttonText}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

// Componente de item de comentário
function CommentItem({
  comment,
  onDelete,
  onReply,
  isReply = false,
}: {
  comment: Comment;
  onDelete: (id: string) => Promise<void>;
  onReply: (comment: Comment) => void;
  isReply?: boolean;
}) {
  const { user } = useAuth();
  const canDelete = user?.role === 'admin' || user?.id === comment.author.id;

  return (
    <div
      className={`rounded-lg border border-secondary-200 p-4 dark:border-secondary-800 ${
        isReply ? 'ml-8' : ''
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src={comment.author.photoURL || '/images/avatar-placeholder.png'}
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
        <div className="flex gap-2">
          {!isReply && user && (
            <Button variant="ghost" size="sm" onClick={() => onReply(comment)}>
              <Reply className="mr-1 h-4 w-4" />
              Responder
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(comment.id)}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Excluir
            </Button>
          )}
        </div>
      </div>
      <p className="text-secondary-800 dark:text-secondary-200">
        {comment.content}
      </p>

      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          onDelete={onDelete}
          onReply={onReply}
          isReply={true}
        />
      ))}
    </div>
  );
}

export function CommentSection({ newsSlug }: CommentSectionProps) {
  const { user } = useAuth();
  const updateNewsCommentCount = useStore(
    (state) => state.updateNewsCommentCount
  );
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      const commentsQuery = query(
        collection(db, 'comments'),
        where('newsSlug', '==', newsSlug),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(commentsQuery);
      const allComments = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
        };
      }) as Comment[];

      // Organiza comentários em estrutura hierárquica
      const commentMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      // Primeiro, mapeia todos os comentários por ID
      allComments.forEach((comment) => {
        commentMap.set(comment.id, { ...comment, replies: [] });
      });

      // Depois, organiza em estrutura de árvore
      allComments.forEach((comment) => {
        if (comment.parentId) {
          const parentComment = commentMap.get(comment.parentId);
          if (parentComment) {
            parentComment.replies = parentComment.replies || [];
            parentComment.replies.push(commentMap.get(comment.id)!);
          }
        } else {
          rootComments.push(commentMap.get(comment.id)!);
        }
      });

      setComments(rootComments);
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      toast.error('Erro ao carregar comentários');
    } finally {
      setLoading(false);
    }
  }, [newsSlug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAddComment = async (content: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para comentar');
      return;
    }

    try {
      const commentData: Omit<Comment, 'id'> = {
        newsSlug,
        content,
        author: {
          id: user.id,
          name: user.name,
          photoURL: user.photoURL,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'comments'), commentData);
      const newComment: Comment = { id: docRef.id, ...commentData };

      await updateCommentCount(newsSlug, 1);
      updateNewsCommentCount(newsSlug, 1);
      setComments((prev) => [newComment, ...prev]);
      toast.success('Comentário adicionado com sucesso!');
    } catch (error) {
      toast.error('Erro ao adicionar comentário');
    }
  };

  const handleAddReply = async (content: string) => {
    if (!user || !replyingTo) return;

    try {
      const replyData: Omit<Comment, 'id'> = {
        newsSlug,
        content,
        author: {
          id: user.id,
          name: user.name,
          photoURL: user.photoURL,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        parentId: replyingTo.id,
      };

      const docRef = await addDoc(collection(db, 'comments'), replyData);
      const newReply: Comment = { id: docRef.id, ...replyData };

      await updateCommentCount(newsSlug, 1);
      updateNewsCommentCount(newsSlug, 1);
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === replyingTo.id
            ? {
                ...comment,
                replies: [...(comment.replies || []), newReply],
              }
            : comment
        )
      );
      setReplyingTo(null);
      toast.success('Resposta adicionada com sucesso!');
    } catch (error) {
      toast.error('Erro ao adicionar resposta');
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteDoc(doc(db, 'comments', commentId));
      await updateCommentCount(newsSlug, -1);
      updateNewsCommentCount(newsSlug, -1);
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      toast.success('Comentário excluído com sucesso!');
    } catch (error) {
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
        <div className="mb-8">
          <CommentForm onSubmit={handleAddComment} />
        </div>
      ) : (
        <div className="mb-8 rounded-lg border border-secondary-200 p-4 text-center dark:border-secondary-800">
          <p className="text-secondary-600 dark:text-secondary-400">
            Faça login para adicionar um comentário
          </p>
        </div>
      )}

      <div className="space-y-6">
        {comments
          .filter((c) => !c.parentId)
          .map((comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                onDelete={handleDelete}
                onReply={(comment) => setReplyingTo(comment)}
              />
              {replyingTo?.id === comment.id && (
                <div className="ml-8 mt-4">
                  <CommentForm
                    onSubmit={handleAddReply}
                    placeholder="Adicione uma resposta..."
                    buttonText="Responder"
                    showCancel
                    onCancel={() => setReplyingTo(null)}
                    initialContent={`@${replyingTo.author.name} `}
                  />
                </div>
              )}
            </div>
          ))}
        {comments.length === 0 && (
          <p className="text-center text-secondary-500">
            Nenhum comentário ainda. Seja o primeiro a comentar!
          </p>
        )}
      </div>
    </div>
  );
}
