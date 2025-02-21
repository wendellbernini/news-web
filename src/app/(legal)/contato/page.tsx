'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { SITE_INFO } from '@/lib/constants';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Aqui você implementaria a lógica de envio do formulário
      // Por exemplo, enviando para uma API ou serviço de email
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Mensagem enviada com sucesso!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold">Entre em Contato</h1>
        <p className="mt-4 text-lg text-secondary-600 dark:text-secondary-400">
          Estamos aqui para ouvir você. Entre em contato conosco através dos
          canais abaixo ou preencha o formulário.
        </p>
        <p className="mb-4 text-gray-600">
          Você também pode entrar em contato diretamente através do e-mail:{' '}
          <a
            href={`mailto:${SITE_INFO.email}`}
            className="text-primary-600 hover:underline"
          >
            {SITE_INFO.email}
          </a>
        </p>
      </div>

      <div className="mb-12 grid gap-8 md:grid-cols-3">
        <div className="rounded-lg border border-secondary-200 p-6 text-center dark:border-secondary-800">
          <Mail className="mx-auto mb-4 h-8 w-8 text-primary-600" />
          <h3 className="mb-2 text-lg font-semibold">Email</h3>
          <p className="text-secondary-600 dark:text-secondary-400">
            {SITE_INFO.email}
          </p>
        </div>

        <div className="rounded-lg border border-secondary-200 p-6 text-center dark:border-secondary-800">
          <Phone className="mx-auto mb-4 h-8 w-8 text-primary-600" />
          <h3 className="mb-2 text-lg font-semibold">Telefone</h3>
          <p className="text-secondary-600 dark:text-secondary-400">
            (11) 99999-9999
          </p>
        </div>

        <div className="rounded-lg border border-secondary-200 p-6 text-center dark:border-secondary-800">
          <MapPin className="mx-auto mb-4 h-8 w-8 text-primary-600" />
          <h3 className="mb-2 text-lg font-semibold">Endereço</h3>
          <p className="text-secondary-600 dark:text-secondary-400">
            Rio de Janeiro, RJ
            <br />
            Brasil
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-secondary-200 p-8 dark:border-secondary-800">
        <h2 className="mb-6 text-2xl font-bold">Envie uma Mensagem</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                Nome
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="mb-2 block text-sm font-medium">
              Assunto
            </label>
            <Input
              id="subject"
              type="text"
              value={formData.subject}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, subject: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="mb-2 block text-sm font-medium">
              Mensagem
            </label>
            <textarea
              id="message"
              rows={6}
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
              className="w-full rounded-md border border-secondary-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-secondary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-secondary-800 dark:bg-secondary-950 dark:ring-offset-secondary-950 dark:placeholder:text-secondary-400 dark:focus-visible:ring-primary-600"
              required
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                Enviando...
                <Send className="ml-2 h-4 w-4 animate-pulse" />
              </>
            ) : (
              <>
                Enviar Mensagem
                <Send className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
