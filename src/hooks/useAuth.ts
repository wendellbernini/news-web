'use client';

import { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import useStore from '@/store/useStore';
import { User } from '@/types';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useStore();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return;

      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken(true);
          const secure = window.location.protocol === 'https:';
          const cookieString = `firebase-token=${token}; path=/; ${secure ? 'secure;' : ''} samesite=strict; max-age=3600`;
          document.cookie = cookieString;

          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser(userData);

            if (
              window.location.pathname === '/login' &&
              userData.role === 'admin'
            ) {
              router.push('/admin');
            }
          } else {
            const userData = await createUserProfile(firebaseUser);
            setUser(userData);
          }
        } catch (error) {
          console.error(
            '[Auth] Erro crítico ao processar autenticação:',
            error
          );
          setUser(null);
          document.cookie =
            'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        }
      } else {
        setUser(null);
        document.cookie =
          'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';

        if (
          window.location.pathname.startsWith('/admin') ||
          window.location.pathname.startsWith('/perfil')
        ) {
          router.push('/login');
        }
      }

      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [setUser, router]);

  const createUserProfile = async (
    firebaseUser: FirebaseUser
  ): Promise<User> => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userData: User = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || 'Usuário',
      email: firebaseUser.email || '',
      photoURL: firebaseUser.photoURL || '/images/avatar-placeholder.png',
      role: 'user',
      createdAt: new Date(),
      preferences: {
        categories: [],
        darkMode: false,
        emailNotifications: true,
      },
      savedNews: [],
      readHistory: [],
      newsletter: {
        subscribed: false,
        frequency: 'weekly',
        categories: [],
      },
      pushNotifications: {
        enabled: false,
        categories: [],
        breakingNews: true,
        newArticles: true,
      },
    };

    await setDoc(userRef, userData);
    return userData;
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const userDoc = await getDoc(doc(db, 'users', result.user.uid));

      if (!userDoc.exists()) {
        const userData = await createUserProfile(result.user);
        setUser(userData);
      } else {
        const userData = userDoc.data() as User;
        setUser(userData);
      }

      const token = await result.user.getIdToken();
      document.cookie = `firebase-token=${token}; path=/`;

      toast.success('Login realizado com sucesso!');
    } catch (error) {
      console.error('[Auth] Erro ao fazer login com Google:', error);
      toast.error('Erro ao fazer login com Google');
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));

      if (userDoc.exists()) {
        setUser(userDoc.data() as User);
      }

      const token = await result.user.getIdToken();
      document.cookie = `firebase-token=${token}; path=/`;

      toast.success('Login realizado com sucesso!');
    } catch (error) {
      console.error('[Auth] Erro ao fazer login:', error);
      toast.error('Email ou senha inválidos');
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    name: string
  ) => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userData = await createUserProfile({
        ...result.user,
        displayName: name,
      });

      setUser(userData);

      const token = await result.user.getIdToken();
      document.cookie = `firebase-token=${token}; path=/`;

      toast.success('Conta criada com sucesso!');
    } catch (error) {
      console.error('[Auth] Erro ao criar conta:', error);
      toast.error('Erro ao criar conta');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      document.cookie =
        'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('[Auth] Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  return {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
  };
};
