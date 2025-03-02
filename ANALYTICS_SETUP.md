# Configuração de Ferramentas de Análise - Rio de Fato

Este documento contém instruções detalhadas sobre como configurar e usar as ferramentas de análise implementadas no portal Rio de Fato.

## Ferramentas Implementadas

Foram implementadas três ferramentas de análise:

1. **Firebase Analytics** - Integrado diretamente com o Firebase
2. **Google Analytics 4** - Implementação separada do GA4
3. **Facebook Pixel** - Para rastreamento de conversões e remarketing

## Configuração

### 1. Obtenha os IDs necessários

#### Firebase Analytics

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá para "Analytics" > "Dashboard"
4. O ID de medição (Measurement ID) está disponível nas configurações do Analytics (formato: G-XXXXXXXXXX)

#### Google Analytics 4

1. Acesse o [Google Analytics](https://analytics.google.com/)
2. Crie uma nova propriedade GA4 ou use uma existente
3. Vá para "Admin" > "Fluxo de dados" > "Web"
4. Crie um novo fluxo de dados ou use um existente
5. O ID de medição está disponível nas configurações do fluxo de dados (formato: G-XXXXXXXXXX)

#### Facebook Pixel

1. Acesse o [Facebook Business Manager](https://business.facebook.com/)
2. Vá para "Eventos Manager" > "Pixels"
3. Crie um novo Pixel ou use um existente
4. O ID do Pixel está disponível nas configurações do Pixel (formato numérico)

### 2. Configure as variáveis de ambiente

Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```
# Firebase Analytics
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX"

# Google Analytics 4 (opcional, se quiser usar separadamente do Firebase Analytics)
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# Facebook Pixel
NEXT_PUBLIC_FACEBOOK_PIXEL_ID="XXXXXXXXXX"
```

### 3. Verifique a implementação

Após configurar as variáveis de ambiente e reiniciar o servidor, você pode verificar se as ferramentas estão funcionando corretamente:

1. Abra o site em um navegador
2. Abra as ferramentas de desenvolvedor (F12)
3. Vá para a aba "Network" (Rede)
4. Filtre por:
   - `google-analytics.com` para o Google Analytics
   - `facebook.com` para o Facebook Pixel

Você também deve ver mensagens de log no console indicando que as ferramentas foram inicializadas.

## Como Usar

### Rastreamento Automático de Páginas

O rastreamento de visualizações de página é feito automaticamente para todas as ferramentas. Não é necessário nenhum código adicional.

### Rastreamento de Eventos Personalizados

#### Firebase Analytics

```tsx
import { useFirebaseAnalytics } from '@/hooks/useFirebaseAnalytics';

export function MeuComponente() {
  const { trackEvent } = useFirebaseAnalytics();

  const handleClick = () => {
    trackEvent('botao_clicado', {
      botao_id: 'meu-botao',
      pagina: 'home',
    });
  };

  return <button onClick={handleClick}>Clique Aqui</button>;
}
```

#### Google Analytics 4

```tsx
export function MeuComponente() {
  const handleClick = () => {
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

#### Facebook Pixel

```tsx
export function MeuComponente() {
  const handleClick = () => {
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

## Eventos Padrão do Facebook Pixel

O Facebook Pixel tem alguns eventos padrão que são recomendados para rastreamento:

- `PageView` - Visualização de página (automático)
- `Lead` - Quando um usuário se cadastra ou preenche um formulário
- `CompleteRegistration` - Quando um usuário completa o registro
- `Search` - Quando um usuário realiza uma pesquisa
- `ViewContent` - Quando um usuário visualiza um conteúdo específico
- `AddToWishlist` - Quando um usuário salva uma notícia
- `Subscribe` - Quando um usuário se inscreve em uma newsletter

## Considerações de Privacidade

1. **Política de Privacidade**: Atualize a política de privacidade do site para informar sobre o uso dessas ferramentas de análise.

2. **Consentimento de Cookies**: O componente `CookieConsent` deve ser configurado para obter o consentimento do usuário antes de carregar as ferramentas de análise.

3. **LGPD/GDPR**: Certifique-se de que a implementação está em conformidade com as leis de proteção de dados aplicáveis.

## Solução de Problemas

### Os eventos não estão sendo rastreados

1. Verifique se as variáveis de ambiente estão configuradas corretamente
2. Verifique se não há bloqueadores de anúncios ou extensões de privacidade ativas
3. Verifique o console do navegador para erros
4. Certifique-se de que o consentimento de cookies foi obtido

### Os dados não aparecem no painel do Analytics

1. Pode levar até 24-48 horas para os dados começarem a aparecer
2. Verifique se o ID de medição está correto
3. Verifique se o domínio está configurado corretamente nas ferramentas de análise

## Recursos Adicionais

- [Documentação do Firebase Analytics](https://firebase.google.com/docs/analytics)
- [Documentação do Google Analytics 4](https://developers.google.com/analytics/devguides/collection/ga4)
- [Documentação do Facebook Pixel](https://developers.facebook.com/docs/facebook-pixel)

---

Documento criado em: 02/03/2024
