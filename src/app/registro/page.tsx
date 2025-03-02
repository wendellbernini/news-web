'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import useStore from '@/store/useStore';
import type { Category } from '@/types';
import { useFacebookPixel } from '@/hooks/useFacebookPixel';
import { Loader2 } from 'lucide-react';

// Componente interno que usa o hook useFacebookPixel
function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useStore((state) => state.setUser);
  const { trackEvent } = useFacebookPixel();

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
          categories: [],
          breakingNews: true,
          newArticles: true,
        },
      });

      // Rastrear evento de registro com Google no Facebook Pixel
      trackEvent('CompleteRegistration', {
        content_name: 'registro',
        status: 'success',
        method: 'google',
      });

      router.push('/');
    } catch (error) {
      setError('Erro ao registrar com Google');
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
          categories: [],
          breakingNews: true,
          newArticles: true,
        },
      });

      // Rastrear evento de registro com email/senha no Facebook Pixel
      trackEvent('CompleteRegistration', {
        content_name: 'registro',
        status: 'success',
        method: 'email',
      });

      router.push('/');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError('Este email já está em uso');
      } else {
        setError('Erro ao criar conta');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-[400px] rounded-2xl bg-white p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Criar Conta</h1>
          <p className="mt-2 text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700">
              Faça login
            </Link>
          </p>
        </div>

        {error && (
          <div className="mt-4 text-center text-sm text-red-600">{error}</div>
        )}

        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
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
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-500">ou</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Confirmar Senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-900 disabled:opacity-50"
          >
            {loading ? 'Registrando...' : 'Registrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-600">
          Ao se registrar, você concorda com nossos{' '}
          <Link
            href="/termos-de-uso"
            className="text-blue-600 hover:text-blue-700"
          >
            Termos de Uso
          </Link>{' '}
          e confirma que leu nossa{' '}
          <Link
            href="/politica-de-privacidade"
            className="text-blue-600 hover:text-blue-700"
          >
            Política de Privacidade
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

// Componente principal que envolve o formulário com Suspense
export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
