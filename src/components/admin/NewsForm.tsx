'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Category } from '@/types';
import { Button } from '@/components/ui/Button';
import { Loader2, Upload } from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
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
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: categories[0],
    published: false,
  });

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
    if (!imageFile) {
      toast.error('Selecione uma imagem para a notícia');
      return;
    }

    if (!user?.id) {
      toast.error('Você precisa estar logado para criar uma notícia');
      return;
    }

    setLoading(true);

    try {
      // Upload da imagem para o Cloudinary
      const imageFormData = new FormData();
      imageFormData.append('file', imageFile);
      imageFormData.append('upload_preset', 'news-web');
      imageFormData.append(
        'cloud_name',
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ''
      );

      console.log('Iniciando upload para o Cloudinary...');
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/' +
          process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME +
          '/image/upload',
        {
          method: 'POST',
          body: imageFormData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro do Cloudinary:', errorData);
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

      // Criar a notícia no Firestore
      const newsData = {
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        category: formData.category,
        published: formData.published,
        slug: slugify(formData.title),
        imageUrl: data.secure_url,
        author: {
          id: user.id,
          name: user.name || 'Usuário Anônimo',
          photoURL: user.photoURL || '/images/avatar-placeholder.png',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        likes: 0,
        views: 0,
      };

      await addDoc(collection(db, 'news'), newsData);

      toast.success('Notícia criada com sucesso!');
      router.push('/admin');
    } catch (error) {
      console.error('Erro ao criar notícia:', error);
      toast.error('Erro ao criar notícia');
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
          htmlFor="image"
          className="mb-2 block text-sm font-medium text-secondary-900 dark:text-secondary-100"
        >
          Imagem
        </label>
        <div className="flex items-center gap-4">
          <label className="flex h-32 w-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-secondary-200 hover:border-primary-600 dark:border-secondary-800">
            <div className="flex flex-col items-center">
              <Upload className="mb-2 h-6 w-6 text-secondary-500" />
              <span className="text-xs text-secondary-500">
                Clique para selecionar
              </span>
            </div>
            <input
              type="file"
              id="image"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
          </label>
          {imagePreview && (
            <div className="relative h-32 w-32 overflow-hidden rounded-lg">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="published"
          checked={formData.published}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, published: e.target.checked }))
          }
          className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-600 dark:border-secondary-700"
        />
        <label
          htmlFor="published"
          className="text-sm font-medium text-secondary-900 dark:text-secondary-100"
        >
          Publicar imediatamente
        </label>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/admin')}
          disabled={loading}
        >
          Cancelar
        </Button>
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
      </div>
    </form>
  );
}
