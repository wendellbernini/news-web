# Ferramentas de Análise - Rio de Fato

Este diretório contém os componentes e utilitários para integração de ferramentas de análise no portal Rio de Fato.

## Ferramentas Implementadas

1. **Firebase Analytics** - Integrado diretamente com o Firebase
2. **Google Analytics 4** - Implementação separada do GA4
3. **Facebook Pixel** - Para rastreamento de conversões e remarketing

## Configuração

Para configurar as ferramentas de análise, adicione as seguintes variáveis ao seu arquivo `.env.local`:

```
# Firebase Analytics (já configurado com o Firebase)
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX"

# Google Analytics 4 (opcional, se quiser usar separadamente do Firebase Analytics)
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# Facebook Pixel
NEXT_PUBLIC_FACEBOOK_PIXEL_ID="XXXXXXXXXX"
```

## Como Usar

### Firebase Analytics

Para usar o Firebase Analytics em componentes:

```tsx
import { useFirebaseAnalytics } from '@/hooks/useFirebaseAnalytics';

export function MeuComponente() {
  const { trackEvent } = useFirebaseAnalytics();

  const handleClick = () => {
    // Rastreia um evento personalizado
    trackEvent('botao_clicado', {
      botao_id: 'meu-botao',
      pagina: 'home',
    });
  };

  return <button onClick={handleClick}>Clique Aqui</button>;
}
```

### Google Analytics 4

Para rastrear eventos no Google Analytics 4:

```tsx
export function MeuComponente() {
  const handleClick = () => {
    // Verifica se a função está disponível
    if (typeof window.trackGAEvent === 'function') {
      window.trackGAEvent('botao_clicado', {
        botao_id: 'meu-botao',
        pagina: 'home',
      });
    }
  };

  return <button onClick={handleClick}>Clique Aqui</button>;
}
```

### Facebook Pixel

Para rastrear eventos no Facebook Pixel:

```tsx
export function MeuComponente() {
  const handleClick = () => {
    // Verifica se a função está disponível
    if (typeof window.trackFBEvent === 'function') {
      window.trackFBEvent('Lead', {
        content_name: 'Formulário de Contato',
        content_category: 'Contato',
      });
    }
  };

  return <button onClick={handleClick}>Enviar</button>;
}
```

## Eventos Importantes para Rastrear

### Visualização de Notícias

```tsx
trackEvent('visualizacao_noticia', {
  noticia_id: '123',
  titulo: 'Título da Notícia',
  categoria: 'Política',
});
```

### Compartilhamento

```tsx
trackEvent('compartilhamento', {
  noticia_id: '123',
  plataforma: 'whatsapp',
});
```

### Cadastro de Usuário

```tsx
trackEvent('cadastro_usuario', {
  metodo: 'email',
});
```

### Pesquisa

```tsx
trackEvent('pesquisa', {
  termo: 'eleições 2023',
  resultados: 15,
});
```

## Observações Importantes

1. **Privacidade**: Certifique-se de que o site tenha uma política de privacidade clara informando sobre o uso dessas ferramentas.
2. **Consentimento**: Use o componente `CookieConsent` para obter o consentimento do usuário antes de carregar as ferramentas de análise.
3. **Desenvolvimento**: As ferramentas de análise não são carregadas em ambiente de desenvolvimento para evitar dados falsos.
4. **Depuração**: Verifique o console do navegador para mensagens de depuração relacionadas às ferramentas de análise.
