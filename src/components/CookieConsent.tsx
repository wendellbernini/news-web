'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cookieService } from '@/lib/cookies';
import { toast } from 'react-hot-toast';

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Verifica estado inicial dos cookies
    const status = cookieService.checkStatus();
    console.info('🍪 Estado inicial dos cookies:', status);

    if (!status.active) {
      setShow(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const success = cookieService.savePreferences({
      analytics: true,
      functional: true,
    });

    if (success) {
      const status = cookieService.checkStatus();
      console.info('🍪 Cookies aceitos com sucesso:', status);
      toast.success('Cookies aceitos e ativados');
    } else {
      console.error('🍪 Erro ao salvar cookies');
      toast.error('Erro ao salvar preferências');
    }

    setShow(false);
  };

  const handleRejectAll = () => {
    const success = cookieService.savePreferences({
      analytics: false,
      functional: false,
    });

    if (success) {
      const status = cookieService.checkStatus();
      console.info('🍪 Cookies rejeitados:', status);
      toast.success('Cookies rejeitados');
    } else {
      console.error('🍪 Erro ao salvar rejeição');
      toast.error('Erro ao salvar preferências');
    }

    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[448px] overflow-hidden rounded-xl bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:bg-secondary-900/80">
      <h3 className="mb-2 text-lg font-semibold">
        Valorizamos sua privacidade
      </h3>
      <p className="mb-4 text-sm text-secondary-600 dark:text-secondary-400">
        Utilizamos cookies para melhorar sua experiência de navegação,
        personalizar conteúdo e analisar nosso tráfego. Ao clicar em "Aceitar",
        você concorda com nosso uso de cookies.
      </p>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handleRejectAll}>
          Rejeitar
        </Button>
        <Button size="sm" onClick={handleAcceptAll}>
          Aceitar
        </Button>
      </div>
    </div>
  );
}
