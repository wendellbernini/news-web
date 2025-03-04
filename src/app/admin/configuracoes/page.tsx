'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Settings, Globe, Mail, FileText, Save, Loader2 } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'react-hot-toast';

interface SiteConfig {
  name: string;
  description: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  darkMode: boolean;
}

interface ContentConfig {
  categories: string[];
  maxTitleLength: number;
  maxContentLength: number;
  moderateComments: boolean;
  allowGuestComments: boolean;
}

interface EmailConfig {
  senderName: string;
  senderEmail: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  defaultTemplate: string;
}

export default function SettingsAdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'site' | 'content' | 'email'>(
    'site'
  );

  // Estados para cada seção de configuração
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    name: '',
    description: '',
    logo: '',
    favicon: '',
    primaryColor: '#0066cc',
    secondaryColor: '#666666',
    darkMode: true,
  });

  const [contentConfig, setContentConfig] = useState<ContentConfig>({
    categories: [],
    maxTitleLength: 100,
    maxContentLength: 5000,
    moderateComments: true,
    allowGuestComments: false,
  });

  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    senderName: '',
    senderEmail: '',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    defaultTemplate: '',
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    loadConfigs();
  }, [user]);

  const loadConfigs = async () => {
    try {
      const configRef = doc(db, 'config', 'settings');
      const configSnap = await getDoc(configRef);

      if (configSnap.exists()) {
        const data = configSnap.data();
        setSiteConfig(data.site || siteConfig);
        setContentConfig(data.content || contentConfig);
        setEmailConfig(data.email || emailConfig);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const saveConfigs = async () => {
    setSaving(true);

    try {
      const configRef = doc(db, 'config', 'settings');
      await updateDoc(configRef, {
        site: siteConfig,
        content: contentConfig,
        email: emailConfig,
        updatedAt: new Date(),
        updatedBy: user?.id,
      });

      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const addCategory = () => {
    const category = prompt('Digite o nome da categoria:');
    if (category && !contentConfig.categories.includes(category)) {
      setContentConfig((prev) => ({
        ...prev,
        categories: [...prev.categories, category],
      }));
    }
  };

  const removeCategory = (category: string) => {
    if (window.confirm(`Remover a categoria "${category}"?`)) {
      setContentConfig((prev) => ({
        ...prev,
        categories: prev.categories.filter((c) => c !== category),
      }));
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center gap-3">
        <Settings className="h-6 w-6 text-primary-600" />
        <h1 className="text-3xl font-bold">Configurações</h1>
      </div>

      {/* Tabs de Navegação */}
      <div className="mb-6 flex space-x-1 rounded-lg border border-secondary-200 bg-white p-1 dark:border-secondary-800 dark:bg-secondary-950">
        <Button
          variant={activeTab === 'site' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('site')}
          className="flex-1"
        >
          <Globe className="mr-2 h-4 w-4" />
          Site
        </Button>
        <Button
          variant={activeTab === 'content' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('content')}
          className="flex-1"
        >
          <FileText className="mr-2 h-4 w-4" />
          Conteúdo
        </Button>
        <Button
          variant={activeTab === 'email' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('email')}
          className="flex-1"
        >
          <Mail className="mr-2 h-4 w-4" />
          Email
        </Button>
      </div>

      <div className="space-y-6">
        {/* Configurações do Site */}
        {activeTab === 'site' && (
          <div className="rounded-lg border border-secondary-200 bg-white p-6 dark:border-secondary-800 dark:bg-secondary-950">
            <h2 className="mb-4 text-lg font-semibold">
              Configurações do Site
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Nome do Site
                </label>
                <Input
                  value={siteConfig.name}
                  onChange={(e) =>
                    setSiteConfig((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Nome do site"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Descrição
                </label>
                <Input
                  value={siteConfig.description}
                  onChange={(e) =>
                    setSiteConfig((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Descrição do site"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  URL do Logo
                </label>
                <Input
                  id="logoUrl"
                  name="logoUrl"
                  type="url"
                  placeholder="https://res.cloudinary.com/seu-cloud-name/image/upload/v1/logo.png"
                  value={siteConfig.logo}
                  onChange={(e) =>
                    setSiteConfig((prev) => ({ ...prev, logo: e.target.value }))
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Cor Primária
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={siteConfig.primaryColor}
                    onChange={(e) =>
                      setSiteConfig((prev) => ({
                        ...prev,
                        primaryColor: e.target.value,
                      }))
                    }
                    className="h-10 w-20"
                  />
                  <Input
                    value={siteConfig.primaryColor}
                    onChange={(e) =>
                      setSiteConfig((prev) => ({
                        ...prev,
                        primaryColor: e.target.value,
                      }))
                    }
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Modo Escuro</label>
                <Switch
                  checked={siteConfig.darkMode}
                  onCheckedChange={(checked) =>
                    setSiteConfig((prev) => ({ ...prev, darkMode: checked }))
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Configurações de Conteúdo */}
        {activeTab === 'content' && (
          <div className="rounded-lg border border-secondary-200 bg-white p-6 dark:border-secondary-800 dark:bg-secondary-950">
            <h2 className="mb-4 text-lg font-semibold">
              Configurações de Conteúdo
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Categorias
                </label>
                <div className="mb-2 flex flex-wrap gap-2">
                  {contentConfig.categories.map((category) => (
                    <div
                      key={category}
                      className="flex items-center gap-2 rounded-full bg-secondary-100 px-3 py-1 text-sm dark:bg-secondary-800"
                    >
                      <span>{category}</span>
                      <button
                        onClick={() => removeCategory(category)}
                        className="text-red-600 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={addCategory}>
                  Adicionar Categoria
                </Button>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Limite de Caracteres do Título
                </label>
                <Input
                  type="number"
                  value={contentConfig.maxTitleLength}
                  onChange={(e) =>
                    setContentConfig((prev) => ({
                      ...prev,
                      maxTitleLength: parseInt(e.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Limite de Caracteres do Conteúdo
                </label>
                <Input
                  type="number"
                  value={contentConfig.maxContentLength}
                  onChange={(e) =>
                    setContentConfig((prev) => ({
                      ...prev,
                      maxContentLength: parseInt(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Moderar Comentários
                </label>
                <Switch
                  checked={contentConfig.moderateComments}
                  onCheckedChange={(checked) =>
                    setContentConfig((prev) => ({
                      ...prev,
                      moderateComments: checked,
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Permitir Comentários Anônimos
                </label>
                <Switch
                  checked={contentConfig.allowGuestComments}
                  onCheckedChange={(checked) =>
                    setContentConfig((prev) => ({
                      ...prev,
                      allowGuestComments: checked,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Configurações de Email */}
        {activeTab === 'email' && (
          <div className="rounded-lg border border-secondary-200 bg-white p-6 dark:border-secondary-800 dark:bg-secondary-950">
            <h2 className="mb-4 text-lg font-semibold">
              Configurações de Email
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Nome do Remetente
                </label>
                <Input
                  value={emailConfig.senderName}
                  onChange={(e) =>
                    setEmailConfig((prev) => ({
                      ...prev,
                      senderName: e.target.value,
                    }))
                  }
                  placeholder="Nome do Portal"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email do Remetente
                </label>
                <Input
                  id="senderEmail"
                  name="senderEmail"
                  type="email"
                  placeholder="noticias@riodefato.com.br"
                  value={emailConfig.senderEmail}
                  onChange={(e) =>
                    setEmailConfig((prev) => ({
                      ...prev,
                      senderEmail: e.target.value,
                    }))
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Servidor SMTP
                </label>
                <Input
                  id="smtpHost"
                  name="smtpHost"
                  type="text"
                  placeholder="smtp.riodefato.com.br"
                  value={emailConfig.smtpHost}
                  onChange={(e) =>
                    setEmailConfig((prev) => ({
                      ...prev,
                      smtpHost: e.target.value,
                    }))
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Porta SMTP
                </label>
                <Input
                  type="number"
                  value={emailConfig.smtpPort}
                  onChange={(e) =>
                    setEmailConfig((prev) => ({
                      ...prev,
                      smtpPort: parseInt(e.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Usuário SMTP
                </label>
                <Input
                  value={emailConfig.smtpUser}
                  onChange={(e) =>
                    setEmailConfig((prev) => ({
                      ...prev,
                      smtpUser: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Senha SMTP
                </label>
                <Input
                  type="password"
                  value={emailConfig.smtpPass}
                  onChange={(e) =>
                    setEmailConfig((prev) => ({
                      ...prev,
                      smtpPass: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <Button onClick={saveConfigs} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
