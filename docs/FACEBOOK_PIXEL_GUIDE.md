# Guia de Configuração do Facebook Pixel

Este guia explica como configurar corretamente o Facebook Pixel para funcionar com o site Rio de Fato, tanto em ambiente de desenvolvimento quanto em produção.

## Configuração no Facebook Business Manager

1. Acesse o [Facebook Business Manager](https://business.facebook.com/)
2. Navegue até "Eventos Manager" > "Pixels"
3. Selecione o Pixel do Rio de Fato (ID: 622856140501291)
4. Vá para a aba "Configurações"

### Adicionar Domínios

É essencial adicionar todos os domínios onde o Pixel será usado:

1. Na seção "Domínios", clique em "Adicionar"
2. Adicione os seguintes domínios:
   - `localhost` (para desenvolvimento)
   - `news-web-tawny.vercel.app` (para produção)
   - Qualquer outro domínio personalizado que você use

### Verificar Domínios

Para cada domínio adicionado, você precisa verificar a propriedade:

1. Selecione o domínio e clique em "Verificar domínio"
2. Escolha um dos métodos de verificação:
   - Meta-tag HTML
   - Arquivo HTML
   - DNS TXT Record

O método mais simples é a meta-tag HTML, que já está implementada no nosso componente `FacebookPixel.tsx`.

## Configuração no Código

O Facebook Pixel já está configurado no código do projeto. As principais partes são:

1. **Variável de ambiente**: `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` no arquivo `.env.local`
2. **Componente do Pixel**: `src/components/analytics/FacebookPixel.tsx`
3. **Hook personalizado**: `src/hooks/useFacebookPixel.ts`

## Verificação de Funcionamento

Para verificar se o Pixel está funcionando corretamente:

1. Acesse o site em produção: https://news-web-tawny.vercel.app/
2. Abra o console do navegador (F12)
3. Procure por logs com o prefixo `[Facebook Pixel]`
4. No Facebook Business Manager, vá para "Eventos Manager" > "Pixels" > "Atividade de eventos" para ver os eventos recebidos

## Solução de Problemas

Se o Pixel não estiver registrando eventos do site em produção:

1. **Verifique o domínio**: Certifique-se de que o domínio está corretamente adicionado e verificado no Business Manager
2. **Verifique a configuração de metadataBase**: No arquivo `src/app/layout.tsx`, certifique-se de que `metadataBase` está configurado para a URL de produção
3. **Verifique o Content Security Policy**: No arquivo `src/middleware.ts`, certifique-se de que os domínios do Facebook estão permitidos
4. **Limpe o cache do navegador**: Às vezes, o cache pode interferir no funcionamento do Pixel

## Eventos Personalizados

Para rastrear eventos personalizados, use o hook `useFacebookPixel`:

```tsx
import { useFacebookPixel } from '@/hooks/useFacebookPixel';

function MyComponent() {
  const { trackEvent } = useFacebookPixel();

  const handleClick = () => {
    trackEvent('ButtonClick', { button_name: 'example' });
  };

  return <button onClick={handleClick}>Clique aqui</button>;
}
```

## Eventos Padrão Suportados

O Facebook Pixel suporta vários eventos padrão:

- PageView
- ViewContent
- Search
- AddToCart
- AddToWishlist
- InitiateCheckout
- AddPaymentInfo
- Purchase
- Lead
- CompleteRegistration

Para mais informações, consulte a [documentação oficial do Facebook Pixel](https://developers.facebook.com/docs/meta-pixel/reference).

---

Documento criado em: 02/03/2024
