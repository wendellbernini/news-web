'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  query,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

interface ApiKey {
  id: string;
  key: string;
  name: string;
  active: boolean;
  createdAt: Date;
  expiresAt: Date | null;
  lastUsed: Date | null;
  usageCount: number;
}

export default function ApiKeysPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  useEffect(() => {
    // Verificar autenticação e permissões
    if (!authLoading) {
      if (!user) {
        console.log('Usuário não autenticado, redirecionando...');
        router.push('/login');
        return;
      }

      if (user.role !== 'admin') {
        console.log('Usuário não é admin, redirecionando...');
        router.push('/');
        return;
      }

      console.log('Usuário autenticado e é admin:', user);
      loadApiKeys();
    }
  }, [authLoading, user, router]);

  async function loadApiKeys() {
    console.log('Carregando API keys...');
    try {
      const apiKeysQuery = query(collection(db, 'api_keys'));
      console.log('Query criada:', apiKeysQuery);

      const snapshot = await getDocs(apiKeysQuery);
      console.log('Snapshot obtido:', snapshot.size, 'documentos');

      const keys = snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log('Dados do documento:', doc.id, data);
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          expiresAt: data.expiresAt?.toDate() || null,
          lastUsed: data.lastUsed?.toDate() || null,
        };
      }) as ApiKey[];

      console.log('API keys carregadas:', keys);
      setApiKeys(keys);
    } catch (error) {
      console.error('Erro detalhado ao carregar API keys:', error);
      toast.error('Erro ao carregar API keys');
    } finally {
      setLoading(false);
    }
  }

  async function generateApiKey(e: React.MouseEvent) {
    e.preventDefault(); // Prevenir comportamento padrão
    console.log('Iniciando geração de API key...');

    // Verificar novamente as permissões
    if (!user || user.role !== 'admin') {
      console.log('Usuário não tem permissão para gerar API key');
      toast.error('Você não tem permissão para gerar API keys');
      return;
    }

    if (!newKeyName.trim()) {
      console.log('Nome da key vazio');
      toast.error('Digite um nome para a API key');
      return;
    }

    setGenerating(true);
    const toastId = toast.loading('Gerando API key...');

    try {
      console.log('Gerando key aleatória...');
      // Gerar key aleatória
      const key = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      console.log('Key gerada:', key);

      console.log('Salvando no Firestore...');
      // Salvar no Firestore
      const docRef = await addDoc(collection(db, 'api_keys'), {
        key, // Adicionando o valor da key
        name: newKeyName,
        active: true,
        createdAt: new Date(),
        expiresAt: null,
        lastUsed: null,
        usageCount: 0,
      });
      console.log('Documento criado com ID:', docRef.id);

      toast.success(`API key gerada com sucesso: ${key}`, {
        id: toastId,
        duration: 5000,
      });
      setNewKeyName('');
      await loadApiKeys();
    } catch (error) {
      console.error('Erro detalhado ao gerar API key:', error);
      toast.error('Erro ao gerar API key', { id: toastId });
    } finally {
      setGenerating(false);
    }
  }

  async function deleteApiKey(keyId: string) {
    // Verificar novamente as permissões
    if (!user || user.role !== 'admin') {
      console.log('Usuário não tem permissão para remover API key');
      toast.error('Você não tem permissão para remover API keys');
      return;
    }

    const toastId = toast.loading('Removendo API key...');
    console.log('Iniciando remoção da API key:', keyId);

    try {
      await deleteDoc(doc(db, 'api_keys', keyId));
      console.log('API key removida com sucesso');
      toast.success('API key removida com sucesso', { id: toastId });
      await loadApiKeys();
    } catch (error) {
      console.error('Erro detalhado ao remover API key:', error);
      toast.error('Erro ao remover API key', { id: toastId });
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null; // Não renderiza nada enquanto redireciona
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Gerenciar API Keys</h1>

      <form onSubmit={(e) => e.preventDefault()} className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Gerar Nova API Key</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Nome da API Key"
            className="flex-1 rounded border p-2 disabled:bg-gray-100"
            disabled={generating}
          />
          <Button
            onClick={generateApiKey}
            disabled={generating || !newKeyName.trim()}
            className="min-w-[120px]"
          >
            {generating ? 'Gerando...' : 'Gerar API Key'}
          </Button>
        </div>
      </form>

      <div>
        <h2 className="mb-4 text-xl font-semibold">API Keys Existentes</h2>
        <div className="grid gap-4">
          {apiKeys.map((key) => (
            <div key={key.id} className="rounded border p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{key.name}</h3>
                  <p className="text-sm text-gray-600">ID: {key.id}</p>
                  <p className="break-all text-sm text-gray-600">
                    Key: {key.key}
                  </p>
                  <p className="text-sm text-gray-600">
                    Criada em: {key.createdAt.toLocaleDateString()}
                  </p>
                  {key.lastUsed && (
                    <p className="text-sm text-gray-600">
                      Último uso: {key.lastUsed.toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    Total de usos: {key.usageCount}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => deleteApiKey(key.id)}
                    className="min-w-[100px]"
                  >
                    Remover
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {apiKeys.length === 0 && (
            <p className="rounded border border-gray-200 bg-gray-50 p-4 text-center text-gray-600">
              Nenhuma API key encontrada
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
