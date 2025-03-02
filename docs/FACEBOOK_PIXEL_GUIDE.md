# Guia de Implementação do Facebook Pixel - Rio de Fato

Este documento contém instruções detalhadas sobre como o Facebook Pixel foi implementado no portal Rio de Fato e como utilizá-lo para rastrear eventos importantes.

## O que é o Facebook Pixel?

O Facebook Pixel é uma ferramenta de análise que permite rastrear as ações dos usuários em seu site. Isso é útil para:

1. **Medir a eficácia de suas campanhas publicitárias** no Facebook e Instagram
2. **Criar públicos personalizados** para segmentação de anúncios
3. **Otimizar anúncios para conversões** específicas
4. **Remarketing** para pessoas que já visitaram seu site

## Implementação no Rio de Fato

### Configuração Básica

O Facebook Pixel foi implementado através dos seguintes componentes:

1. **`FacebookPixel.tsx`** - Componente principal que carrega o script do Pixel
2. **`AnalyticsProvider.tsx`** - Componente que agrupa todas as ferramentas de análise
3. **`useFacebookPixel.ts`** - Hook personalizado para facilitar o uso do Pixel em componentes

### Eventos Implementados

Os seguintes eventos já foram implementados no portal:

1. **PageView** - Rastreado automaticamente em todas as páginas
2. **ViewContent** - Quando um usuário visualiza uma notícia
3. **Share** - Quando um usuário compartilha uma notícia
4. **AddToWishlist** - Quando um usuário salva uma notícia
5. **CompleteRegistration** - Quando um usuário se registra
6. **Search** - Quando um usuário realiza uma busca

## Como Usar o Facebook Pixel

### 1. Rastreamento Automático de Páginas

O rastreamento de visualizações de página é feito automaticamente pelo componente `FacebookPixel.tsx`. Não é necessário nenhum código adicional.

### 2. Rastreamento de Eventos Personalizados

Para rastrear eventos personalizados, use o hook `useFacebookPixel`:

```tsx
import { useFacebookPixel } from '@/hooks/useFacebookPixel';

export function MeuComponente() {
  const { trackEvent } = useFacebookPixel();

  const handleClick = () => {
    trackEvent('Lead', {
      content_name: 'Formulário de Contato',
      content_category: 'Contato',
    });
  };

  return <button onClick={handleClick}>Enviar</button>;
}
```

### 3. Eventos Padrão do Facebook

O Facebook Pixel tem eventos padrão que são recomendados para rastreamento:

| Evento                 | Descrição                    | Exemplo de Uso                 |
| ---------------------- | ---------------------------- | ------------------------------ |
| `PageView`             | Visualização de página       | Automático                     |
| `ViewContent`          | Visualização de conteúdo     | Visualização de notícia        |
| `Search`               | Pesquisa no site             | Busca de notícias              |
| `AddToWishlist`        | Adicionar à lista de desejos | Salvar notícia                 |
| `Lead`                 | Captura de lead              | Inscrição na newsletter        |
| `CompleteRegistration` | Registro completo            | Criação de conta               |
| `Subscribe`            | Assinatura                   | Assinatura de newsletter       |
| `Contact`              | Contato                      | Envio de formulário de contato |
| `Share`                | Compartilhamento             | Compartilhar notícia           |

## Exemplos de Implementação

### Visualização de Notícia

```tsx
trackEvent('ViewContent', {
  content_name: noticia.titulo,
  content_category: noticia.categoria,
  content_ids: [noticia.id],
  content_type: 'article',
});
```

### Compartilhamento

```tsx
trackEvent('Share', {
  content_name: noticia.titulo,
  content_category: noticia.categoria,
  content_ids: [noticia.id],
  content_type: 'article',
});
```

### Registro de Usuário

```tsx
trackEvent('CompleteRegistration', {
  content_name: 'registro',
  status: 'success',
  method: 'email', // ou 'google'
});
```

### Busca

```tsx
trackEvent('Search', {
  search_string: termoDeBusca,
  content_category: 'search',
});
```

### Inscrição na Newsletter

```tsx
trackEvent('Subscribe', {
  content_name: 'newsletter',
  content_category: 'subscription',
  frequency: frequencia, // 'daily', 'weekly', etc.
});
```

## Verificação e Depuração

### Como verificar se o Pixel está funcionando

1. Acesse a página de teste em `/teste-pixel`
2. Abra as ferramentas de desenvolvedor do navegador (F12)
3. Vá para a aba "Network" (Rede)
4. Filtre por "facebook.com" ou "facebook.net"
5. Clique nos botões de teste e verifique se aparecem requisições para o Facebook

### Depuração com o Facebook Events Manager

1. Acesse o [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Selecione o Pixel do Rio de Fato
3. Clique em "Diagnosticar e Solucionar Problemas"
4. Use a ferramenta "Test Events" para verificar eventos em tempo real

## Considerações de Privacidade

1. **Política de Privacidade**: O uso do Facebook Pixel está mencionado na política de privacidade do site.
2. **Consentimento de Cookies**: O componente `CookieConsent` obtém o consentimento do usuário antes de carregar o Pixel.
3. **LGPD/GDPR**: A implementação está em conformidade com as leis de proteção de dados aplicáveis.

## Próximos Passos

1. **Implementar mais eventos personalizados** em áreas estratégicas do site
2. **Criar públicos personalizados** no Facebook Ads com base nos eventos rastreados
3. **Configurar conversões** para otimização de campanhas
4. **Implementar testes A/B** para melhorar a taxa de conversão

## Recursos Adicionais

- [Documentação oficial do Facebook Pixel](https://developers.facebook.com/docs/facebook-pixel)
- [Guia de eventos padrão](https://developers.facebook.com/docs/facebook-pixel/implementation/conversion-tracking)
- [Pixel Helper (extensão do Chrome)](https://developers.facebook.com/docs/facebook-pixel/support/pixel-helper)

---

Documento criado em: 02/03/2024
