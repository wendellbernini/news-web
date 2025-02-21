# Configuração do Cron Job para Newsletter

## 1. Gerar Chave Secreta

Primeiro, gere uma chave secreta forte e adicione ao seu arquivo .env:

```bash
# .env
NEWSLETTER_SECRET_KEY=sua_chave_secreta_aqui
```

## 2. Configurar cron-job.org

1. Acesse https://cron-job.org
2. Crie uma conta gratuita
3. Clique em "Create cronjob"
4. Configure:
   - Title: "Rio de Fato Newsletter"
   - URL: https://seu-site.com/api/newsletter
   - Method: POST
   - Headers:
     ```
     Authorization: Bearer sua_chave_secreta_aqui
     ```
   - Schedule:
     - Execution schedule: Custom
     - Hours: 8
     - Minutes: 0
     - Days: Every day
   - Notification: Enable email notifications for failures

## 3. Testar

Para testar manualmente, use o curl:

```bash
curl -X POST https://seu-site.com/api/newsletter \
  -H "Authorization: Bearer sua_chave_secreta_aqui"
```

## 4. Monitoramento

O cron-job.org oferece:

- Dashboard com histórico de execuções
- Notificações por email em caso de falhas
- Logs detalhados
- Estatísticas de tempo de resposta

## Segurança

- A chave secreta garante que apenas o cron-job.org pode acionar o envio
- Use HTTPS sempre
- Monitore os logs regularmente
- Mantenha a chave secreta segura e troque periodicamente

## Vantagens desta Abordagem

1. Totalmente gratuito
2. Não requer Firebase Functions
3. Fácil de configurar e manter
4. Monitoramento incluído
5. Alta confiabilidade
6. Pode ser migrado facilmente para outras soluções no futuro
