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

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useStore();

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser);

      if (!mounted) return;

      if (firebaseUser) {
        try {
          // Obtém o token do usuário
          const token = await firebaseUser.getIdToken();
          // Salva o token nos cookies
          document.cookie = `firebase-token=${token}; path=/`;

          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          console.log('User doc exists:', userDoc.exists());

          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            console.log('User data from Firestore:', userData);
            setUser(userData);
          } else {
            // Se o documento não existir, cria um novo
            console.log('Creating new user profile...');
            const userData = await createUserProfile(firebaseUser);
            console.log('New user profile created:', userData);
            setUser(userData);
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
          setUser(null);
          // Remove o token dos cookies em caso de erro
          document.cookie =
            'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        }
      } else {
        setUser(null);
        // Remove o token dos cookies ao fazer logout
        document.cookie =
          'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      }

      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [setUser]);

  const createUserProfile = async (
    firebaseUser: FirebaseUser
  ): Promise<User> => {
    console.log('Creating user profile for:', firebaseUser);
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
    console.log('User profile saved:', userData);
    return userData;
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign in...');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign in result:', result);

      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      console.log('User doc exists:', userDoc.exists());

      if (!userDoc.exists()) {
        console.log('Creating new user profile...');
        const userData = await createUserProfile(result.user);
        console.log('New user profile created:', userData);
        setUser(userData);
      } else {
        const userData = userDoc.data() as User;
        console.log('Existing user data:', userData);
        setUser(userData);
      }

      // Obtém e salva o token após o login
      const token = await result.user.getIdToken();
      document.cookie = `firebase-token=${token}; path=/`;

      toast.success('Login realizado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer login com Google:', error);
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

      // Obtém e salva o token após o login
      const token = await result.user.getIdToken();
      document.cookie = `firebase-token=${token}; path=/`;

      toast.success('Login realizado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
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

      // Obtém e salva o token após o cadastro
      const token = await result.user.getIdToken();
      document.cookie = `firebase-token=${token}; path=/`;

      toast.success('Conta criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      toast.error('Erro ao criar conta');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      // Remove o token dos cookies ao fazer logout
      document.cookie =
        'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
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
