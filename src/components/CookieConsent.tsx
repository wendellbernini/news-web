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
    <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md px-4 pb-4 sm:bottom-4 sm:left-auto sm:right-4 sm:mx-0 sm:w-[448px] sm:px-0">
      <div className="overflow-hidden rounded-lg bg-white/90 p-4 shadow-lg backdrop-blur-sm dark:bg-secondary-900/90 sm:rounded-xl sm:p-6">
        <h3 className="mb-2 text-base font-semibold sm:text-lg">
          Valorizamos sua privacidade
        </h3>
        <p className="mb-3 text-xs text-secondary-600 dark:text-secondary-400 sm:mb-4 sm:text-sm">
          Utilizamos cookies para melhorar sua experiência de navegação,
          personalizar conteúdo e analisar nosso tráfego. Ao clicar em
          "Aceitar", você concorda com nosso uso de cookies.
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
    </div>
  );
}
