'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import useStore from '@/store/useStore';
import type { Category } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useStore((state) => state.setUser);

  const handleGoogleSignup = async () => {
    setError('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const { user } = userCredential;

      setUser({
        id: user.uid,
        email: user.email!,
        name: user.displayName || 'Usuário',
        photoURL: user.photoURL || undefined,
        role: 'user',
        createdAt: new Date(user.metadata.creationTime || Date.now()),
        savedNews: [],
        readHistory: [],
        preferences: {
          categories: [] as Category[],
          darkMode: false,
          emailNotifications: true,
        },
        newsletter: {
          subscribed: false,
          frequency: 'weekly',
          categories: [] as Category[],
        },
        pushNotifications: {
          enabled: false,
          categories: [] as Category[],
          breakingNews: true,
          newArticles: true,
        },
      });

      router.push('/');
    } catch (error: any) {
      setError('Erro ao registrar com Google');
      console.error('Erro ao registrar com Google:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const { user } = userCredential;

      setUser({
        id: user.uid,
        email: user.email!,
        name: user.displayName || 'Usuário',
        photoURL: user.photoURL || undefined,
        role: 'user',
        createdAt: new Date(user.metadata.creationTime || Date.now()),
        savedNews: [],
        readHistory: [],
        preferences: {
          categories: [] as Category[],
          darkMode: false,
          emailNotifications: true,
        },
        newsletter: {
          subscribed: false,
          frequency: 'weekly',
          categories: [] as Category[],
        },
        pushNotifications: {
          enabled: false,
          categories: [] as Category[],
          breakingNews: true,
          newArticles: true,
        },
      });

      router.push('/');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError('Este email já está em uso');
      } else {
        setError('Erro ao criar conta');
        console.error('Erro ao criar conta:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex min-h-screen items-center justify-center py-8">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-secondary-200 p-6 dark:border-secondary-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Criar Conta</h1>
          <p className="mt-2 text-secondary-600 dark:text-secondary-400">
            Registre-se para acessar todas as funcionalidades
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-secondary-200 dark:border-secondary-800" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-secondary-500 dark:bg-secondary-900">
              Registrar com
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignup}
            disabled={loading}
            className="flex items-center justify-center gap-3"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continuar com Google
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-secondary-200 dark:border-secondary-800" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-secondary-500 dark:bg-secondary-900">
              Ou registre com email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Senha
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium"
            >
              Confirmar Senha
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-500">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar'}
          </Button>

          <p className="text-center text-sm text-secondary-600 dark:text-secondary-400">
            Já tem uma conta?{' '}
            <Link
              href="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Faça login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
