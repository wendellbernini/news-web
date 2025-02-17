'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Loader2, Camera } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { toast } from 'react-hot-toast';

export function UserProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user) {
    return (
      <div className="rounded-lg border border-secondary-200 p-6 dark:border-secondary-800">
        <p className="text-center text-secondary-600 dark:text-secondary-400">
          Faça login para ver seu perfil
        </p>
      </div>
    );
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // Aqui você implementaria o upload para o Cloudinary
      // e atualizaria a foto do perfil no Firebase
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'news-web');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        await updateProfile(user, {
          photoURL: data.secure_url,
        });

        toast.success('Foto atualizada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar foto:', error);
      toast.error('Erro ao atualizar foto');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) return;

    setSaving(true);

    try {
      await updateProfile(user, {
        displayName: displayName.trim(),
      });

      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-secondary-200 p-6 dark:border-secondary-800">
      <div className="mb-6 text-center">
        <div className="relative mx-auto mb-4 h-24 w-24">
          <Image
            src={user.photoURL || '/images/avatar-placeholder.png'}
            alt={user.displayName || 'Avatar'}
            fill
            className="rounded-full object-cover"
          />
          <label
            htmlFor="photo-upload"
            className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary-600 text-white hover:bg-primary-700"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            <input
              type="file"
              id="photo-upload"
              className="hidden"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-secondary-200 px-4 py-2 focus:border-primary-600 focus:outline-none dark:border-secondary-800 dark:bg-secondary-900"
              placeholder="Seu nome"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  setDisplayName(user.displayName || '');
                }}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold">
              {user.displayName || 'Usuário Anônimo'}
            </h2>
            <p className="text-sm text-secondary-600 dark:text-secondary-400">
              {user.email}
            </p>
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => setIsEditing(true)}
            >
              Editar Perfil
            </Button>
          </>
        )}
      </div>

      <div className="space-y-2 border-t border-secondary-200 pt-6 text-sm dark:border-secondary-800">
        <p className="flex justify-between">
          <span className="text-secondary-600 dark:text-secondary-400">
            Membro desde
          </span>
          <span>
            {user.metadata.creationTime
              ? new Date(user.metadata.creationTime).toLocaleDateString('pt-BR')
              : 'Data não disponível'}
          </span>
        </p>
        <p className="flex justify-between">
          <span className="text-secondary-600 dark:text-secondary-400">
            Último acesso
          </span>
          <span>
            {user.metadata.lastSignInTime
              ? new Date(user.metadata.lastSignInTime).toLocaleDateString(
                  'pt-BR'
                )
              : 'Data não disponível'}
          </span>
        </p>
      </div>
    </div>
  );
}
