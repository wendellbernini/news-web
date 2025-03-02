# Gerenciamento de Imagens no Cloudinary

Este documento descreve como as imagens são gerenciadas no Cloudinary para o portal de notícias Rio de Fato.

## Visão Geral

As imagens das notícias são armazenadas no Cloudinary e referenciadas no Firestore. Cada notícia possui um campo `imageUrl` que contém a URL completa da imagem no Cloudinary.

## Arquitetura

O sistema utiliza uma arquitetura cliente-servidor para gerenciar as imagens:

### Componentes do Servidor

- **Configuração do SDK**: `src/lib/cloudinary/config.ts` - Configura o SDK do Cloudinary para operações no servidor.
- **API de Exclusão**: `src/app/api/cloudinary/delete/route.ts` - Endpoint para excluir imagens do Cloudinary.

### Componentes do Cliente

- **Funções do Cliente**: `src/lib/cloudinary/client.ts` - Funções para upload e gerenciamento de imagens no lado do cliente.

## Fluxo de Exclusão de Imagens

Quando uma notícia é excluída, o seguinte fluxo é executado:

1. O hook `useNews` chama a função `deleteNews`
2. A função `deleteNews` verifica se a notícia possui uma imagem
3. Se existir uma imagem, extrai o public_id da URL da imagem
4. Chama a API de exclusão para remover a imagem do Cloudinary
5. Remove a notícia do Firestore

## Limpeza de Imagens Órfãs

O sistema inclui um script para identificar e excluir imagens que não estão associadas a nenhuma notícia:

```bash
npm run cleanup-images
```

### Como o Script Funciona

1. Busca todas as notícias no Firestore e extrai as URLs das imagens em uso
2. Busca todas as imagens no Cloudinary
3. Compara as imagens do Cloudinary com as imagens em uso
4. Identifica imagens órfãs (aquelas que não estão sendo usadas por nenhuma notícia)
5. Exclui as imagens órfãs do Cloudinary

### Medida de Segurança

Por segurança, se o script encontrar mais de 50 imagens órfãs, ele não as excluirá automaticamente. Para forçar a exclusão, use o parâmetro `--force`:

```bash
npm run cleanup-images:force
```

ou diretamente:

```bash
node src/scripts/cleanupOrphanedImages.js --force
```

## Agendamento de Limpeza Automática

Para agendar a limpeza automática de imagens órfãs, execute:

```bash
npm run schedule-cleanup
```

Isso configurará um cron job para executar o script de limpeza às 3h da manhã no primeiro dia de cada mês. O script de limpeza agendado inclui o parâmetro `--force` para garantir que todas as imagens órfãs sejam removidas.

### Verificando o Agendamento

Para verificar se o agendamento foi configurado corretamente:

```bash
crontab -l
```

### Logs de Execução

Os logs da execução agendada são salvos em:

```
/home/vboxuser/Desktop/projects/news_web_portal-noticias/logs/cleanup.log
```

## Monitoramento de Uso

Você pode monitorar o uso do Cloudinary através do dashboard:

1. Acesse [console.cloudinary.com](https://console.cloudinary.com/)
2. Navegue até a seção "Media Library"
3. Verifique o uso atual e os limites da sua conta

## Solução de Problemas

### Erro ao Importar o SDK do Cloudinary em Componentes do Cliente

Se você encontrar erros relacionados à importação do SDK do Cloudinary em componentes do cliente, certifique-se de usar apenas as funções do cliente definidas em `src/lib/cloudinary/client.ts`.

Exemplo de erro:

```
Error: Dynamic Code Evaluation (e. g. 'eval', 'new Function') not allowed in Client Components
```

### Identificação de Imagens Órfãs

O script de limpeza extrai o public_id das URLs das imagens em uso e os compara com os public_ids das imagens no Cloudinary. O script considera diferentes formatos de URL e variações nos public_ids para garantir que apenas imagens realmente não utilizadas sejam marcadas como órfãs.

### Verificação Manual

Se você quiser verificar manualmente quais imagens seriam excluídas antes de executar com `--force`, execute o script sem o parâmetro. Ele mostrará as primeiras 10 imagens órfãs encontradas e o total de imagens que seriam excluídas.

## Formato das URLs da Cloudinary

As URLs da Cloudinary seguem o seguinte formato:

```
https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[folder]/[filename].[extension]
```

Por exemplo:

```
https://res.cloudinary.com/mycloud/image/upload/v1234567890/news/abcdef123456.jpg
```

O `public_id` usado para exclusão é a parte após a versão, sem a extensão:

```
news/abcdef123456
```
