'use client';

import { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  User as FirebaseUser,
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Obtém o token do usuário
          const token = await firebaseUser.getIdToken();
          // Salva o token nos cookies
          document.cookie = `firebase-token=${token}; path=/`;

          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser(userData);
          } else {
            // Se o documento não existir, cria um novo
            const userData = await createUserProfile(firebaseUser);
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
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser]);

  const createUserProfile = async (firebaseUser: FirebaseUser) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userData: User = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || 'Usuário',
      email: firebaseUser.email || '',
      photoURL: firebaseUser.photoURL || undefined,
      role: 'user',
      createdAt: new Date(),
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
        setUser(userDoc.data() as User);
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
      const userData: User = {
        id: result.user.uid,
        name,
        email,
        role: 'user',
        createdAt: new Date(),
      };

      await setDoc(doc(db, 'users', result.user.uid), userData);
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
