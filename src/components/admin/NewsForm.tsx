'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useNews } from '@/hooks/useNews';
import { Category } from '@/types';
import { Button } from '@/components/ui/Button';
import { Loader2, Upload } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'react-hot-toast';
import { slugify } from '@/lib/utils';

const categories: Category[] = [
  'Tecnologia',
  'Esportes',
  'Política',
  'Economia',
  'Entretenimento',
  'Saúde',
  'Educação',
  'Ciência',
];

interface NewsFormProps {
  newsId?: string;
}

export function NewsForm({ newsId }: NewsFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addNews, updateNews } = useNews();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: categories[0],
    published: false,
    imageUrl: '',
  });

  useEffect(() => {
    if (newsId) {
      const fetchNews = async () => {
        try {
          const newsDoc = await getDoc(doc(db, 'news', newsId));
          if (newsDoc.exists()) {
            const newsData = newsDoc.data();
            setFormData({
              title: newsData.title,
              summary: newsData.summary,
              content: newsData.content,
              category: newsData.category,
              published: newsData.published,
              imageUrl: newsData.imageUrl,
            });
            setImagePreview(newsData.imageUrl);
          }
        } catch (error) {
          console.error('Erro ao buscar notícia:', error);
          toast.error('Erro ao carregar dados da notícia');
        }
      };

      fetchNews();
    }
  }, [newsId]);

  if (!user) {
    return (
      <div className="rounded-lg border border-secondary-200 p-6 dark:border-secondary-800">
        <p className="text-center text-secondary-600 dark:text-secondary-400">
          Você precisa estar logado como administrador para acessar esta página
        </p>
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile && !formData.imageUrl) {
      toast.error('Selecione uma imagem para a notícia');
      return;
    }

    if (!user?.id) {
      toast.error('Você precisa estar logado para criar uma notícia');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = formData.imageUrl;

      if (imageFile) {
        // Upload da imagem para o Cloudinary
        const imageFormData = new FormData();
        imageFormData.append('file', imageFile);
        imageFormData.append('upload_preset', 'news-web');

        console.log('[Debug] Iniciando upload para o Cloudinary...');
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: imageFormData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error('[Debug] Erro do Cloudinary:', errorData);
          throw new Error(
            `Erro ao fazer upload da imagem: ${errorData.error?.message || response.statusText}`
          );
        }

        const data = await response.json();
        console.log('Resposta do Cloudinary:', data);

        if (!data.secure_url) {
          throw new Error(
            'URL da imagem não encontrada na resposta do Cloudinary'
          );
        }

        imageUrl = data.secure_url;
      }

      const newsData = {
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        category: formData.category,
        published: formData.published,
        slug: slugify(formData.title),
        imageUrl,
        author: {
          id: user.id,
          name: user.name || 'Usuário Anônimo',
          photoURL: user.photoURL || '/images/avatar-placeholder.png',
        },
        updatedAt: new Date(),
        createdAt: new Date(),
        views: 0,
        comments: 0,
      };

      if (newsId) {
        // Atualizar notícia existente
        await updateNews(newsId, newsData);
      } else {
        // Criar nova notícia
        await addNews(newsData);
      }

      router.push('/admin');
    } catch (error) {
      console.error('Erro ao salvar notícia:', error);
      toast.error('Erro ao salvar notícia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="title"
          className="mb-2 block text-sm font-medium text-secondary-900 dark:text-secondary-100"
        >
          Título
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          className="w-full rounded-lg border border-secondary-200 p-2.5 text-sm focus:border-primary-600 focus:outline-none dark:border-secondary-800 dark:bg-secondary-900"
          required
        />
      </div>

      <div>
        <label
          htmlFor="summary"
          className="mb-2 block text-sm font-medium text-secondary-900 dark:text-secondary-100"
        >
          Resumo
        </label>
        <textarea
          id="summary"
          value={formData.summary}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, summary: e.target.value }))
          }
          rows={3}
          className="w-full rounded-lg border border-secondary-200 p-2.5 text-sm focus:border-primary-600 focus:outline-none dark:border-secondary-800 dark:bg-secondary-900"
          required
        />
      </div>

      <div>
        <label
          htmlFor="content"
          className="mb-2 block text-sm font-medium text-secondary-900 dark:text-secondary-100"
        >
          Conteúdo (Markdown)
        </label>
        <textarea
          id="content"
          value={formData.content}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, content: e.target.value }))
          }
          rows={10}
          className="w-full rounded-lg border border-secondary-200 p-2.5 text-sm focus:border-primary-600 focus:outline-none dark:border-secondary-800 dark:bg-secondary-900"
          required
        />
      </div>

      <div>
        <label
          htmlFor="category"
          className="mb-2 block text-sm font-medium text-secondary-900 dark:text-secondary-100"
        >
          Categoria
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              category: e.target.value as Category,
            }))
          }
          className="w-full rounded-lg border border-secondary-200 p-2.5 text-sm focus:border-primary-600 focus:outline-none dark:border-secondary-800 dark:bg-secondary-900"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="published"
          className="mb-2 flex items-center gap-2 text-sm font-medium text-secondary-900 dark:text-secondary-100"
        >
          <input
            type="checkbox"
            id="published"
            checked={formData.published}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, published: e.target.checked }))
            }
            className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-600 dark:border-secondary-600"
          />
          Publicar imediatamente
        </label>
      </div>

      <div>
        <label
          htmlFor="image"
          className="mb-2 block text-sm font-medium text-secondary-900 dark:text-secondary-100"
        >
          Imagem
        </label>
        <div className="flex items-center gap-4">
          <label className="flex h-32 w-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-secondary-200 hover:border-primary-600 dark:border-secondary-800">
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Preview"
                width={128}
                height={128}
                className="h-full w-full rounded-lg object-cover"
              />
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="mb-2 h-6 w-6 text-secondary-500" />
                <span className="text-xs text-secondary-500">
                  Clique para selecionar
                </span>
              </div>
            )}
          </label>
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          'Salvar'
        )}
      </Button>
    </form>
  );
}
