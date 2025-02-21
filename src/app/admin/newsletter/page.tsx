'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Switch } from '@/components/ui/Switch';
import { toast } from 'react-hot-toast';
import { Mail, Clock, AlertTriangle } from 'lucide-react';

interface NewsletterConfig {
  enabled: boolean;
  lastSentAt?: Date;
  lastSentStatus?: {
    success: boolean;
    processedCount?: number;
    error?: string;
    timestamp: Date;
  };
}

export default function NewsletterAdminPage() {
  const [config, setConfig] = useState<NewsletterConfig>({ enabled: false });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchNewsletterConfig();
    fetchNewsletterStats();
  }, [user]);

  const fetchNewsletterConfig = async () => {
    try {
      const configRef = doc(db, 'config', 'newsletter');
      const configSnap = await getDoc(configRef);

      if (configSnap.exists()) {
        const data = configSnap.data();
        setConfig({
          enabled: data.enabled,
          lastSentAt: data.lastSentAt?.toDate(),
          lastSentStatus: data.lastSentStatus
            ? {
                ...data.lastSentStatus,
                timestamp: data.lastSentStatus.timestamp.toDate(),
              }
            : undefined,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações da newsletter');
    } finally {
      setLoading(false);
    }
  };

  const fetchNewsletterStats = async () => {
    try {
      const statsRef = doc(db, 'stats', 'newsletter');
      const statsSnap = await getDoc(statsRef);

      if (statsSnap.exists()) {
        setStats(statsSnap.data());
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast.error('Erro ao carregar estatísticas da newsletter');
    }
  };

  const toggleNewsletter = async (enabled: boolean) => {
    try {
      const configRef = doc(db, 'config', 'newsletter');
      await updateDoc(configRef, { enabled });
      setConfig((prev) => ({ ...prev, enabled }));
      toast.success(
        `Newsletter ${enabled ? 'ativada' : 'desativada'} com sucesso!`
      );
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast.error('Erro ao atualizar configuração da newsletter');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center gap-3">
        <Mail className="h-6 w-6 text-primary-600" />
        <h1 className="text-3xl font-bold">Newsletter</h1>
      </div>

      {/* Status Atual */}
      <section className="mb-8 rounded-lg border border-secondary-200 p-6 dark:border-secondary-800">
        <h2 className="mb-4 text-xl font-semibold">Status da Newsletter</h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-secondary-600 dark:text-secondary-400">
              Envio Automático
            </span>
            <Switch
              checked={config.enabled}
              onCheckedChange={toggleNewsletter}
              disabled={loading}
            />
          </div>
          <span
            className={`rounded-full px-3 py-1 text-sm ${
              config.enabled
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}
          >
            {config.enabled ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        {config.lastSentAt && (
          <div className="mt-4 flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400">
            <Clock className="h-4 w-4" />
            <span>
              Último envio:{' '}
              {config.lastSentAt.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        )}

        {config.lastSentStatus && !config.lastSentStatus.success && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/50 dark:text-red-200">
            <AlertTriangle className="h-4 w-4" />
            <span>Erro no último envio: {config.lastSentStatus.error}</span>
          </div>
        )}
      </section>

      {/* Estatísticas */}
      {stats && (
        <section className="rounded-lg border border-secondary-200 p-6 dark:border-secondary-800">
          <h2 className="mb-4 text-xl font-semibold">Estatísticas</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-primary-50 p-4 dark:bg-primary-900">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {stats.totalSubscribed}
              </div>
              <div className="text-sm text-primary-600 dark:text-primary-400">
                Total de Inscritos
              </div>
            </div>

            <div className="rounded-lg bg-secondary-50 p-4 dark:bg-secondary-900">
              <div className="text-2xl font-bold text-secondary-600">
                {stats.byFrequency.daily}
              </div>
              <div className="text-sm text-secondary-600">Diário</div>
            </div>

            <div className="rounded-lg bg-secondary-50 p-4 dark:bg-secondary-900">
              <div className="text-2xl font-bold text-secondary-600">
                {stats.byFrequency.weekly}
              </div>
              <div className="text-sm text-secondary-600">Semanal</div>
            </div>

            <div className="rounded-lg bg-secondary-50 p-4 dark:bg-secondary-900">
              <div className="text-2xl font-bold text-secondary-600">
                {stats.byFrequency.monthly}
              </div>
              <div className="text-sm text-secondary-600">Mensal</div>
            </div>
          </div>
        </section>
      )}
    </AdminLayout>
  );
}
