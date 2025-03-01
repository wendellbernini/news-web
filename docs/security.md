# Documentação de Segurança - Rio de Fato

Este documento descreve as medidas de segurança implementadas no portal de notícias Rio de Fato.

## Visão Geral

A segurança do portal Rio de Fato foi projetada seguindo as melhores práticas da indústria, com foco em:

1. Proteção contra ataques comuns (XSS, CSRF, injeção, etc.)
2. Controle de acesso e autenticação segura
3. Proteção de dados sensíveis
4. Monitoramento e detecção de incidentes
5. Limitação de taxa de requisições (rate limiting)

## Headers de Segurança

Implementamos os seguintes headers de segurança em todas as respostas HTTP:

| Header                    | Valor                                        | Propósito                          |
| ------------------------- | -------------------------------------------- | ---------------------------------- |
| X-XSS-Protection          | 1; mode=block                                | Proteção contra ataques XSS        |
| X-Content-Type-Options    | nosniff                                      | Evita MIME sniffing                |
| X-Frame-Options           | DENY                                         | Previne clickjacking               |
| Content-Security-Policy   | Configuração detalhada                       | Restringe origens de recursos      |
| Referrer-Policy           | strict-origin-when-cross-origin              | Controla informações de referência |
| Strict-Transport-Security | max-age=63072000; includeSubDomains; preload | Força HTTPS                        |
| Permissions-Policy        | camera=(), microphone=(), geolocation=()     | Restringe permissões do navegador  |

### Política de Segurança de Conteúdo (CSP)

Nossa política de segurança de conteúdo foi configurada para permitir apenas recursos de origens confiáveis:

- **default-src 'self'**: Permite recursos apenas do mesmo domínio por padrão
- **script-src**: Permite scripts do mesmo domínio, inline, eval e de domínios específicos (Cloudinary, Google)
- **style-src**: Permite estilos do mesmo domínio e inline
- **img-src**: Permite imagens do mesmo domínio, data URIs, Cloudinary, Google, Football-Data e Yahoo
- **font-src**: Permite fontes apenas do mesmo domínio
- **connect-src**: Permite conexões para o mesmo domínio e APIs específicas:
  - Google APIs (Firebase)
  - Firebase IO
  - Cloud Functions
  - wttr.in (API de clima)
  - Football-Data API (dados esportivos)
  - Yahoo Finance API (dados financeiros)
- **frame-src**: Permite frames do mesmo domínio e Firebase
- **object-src 'none'**: Bloqueia todos os objetos (Flash, etc.)

Esta configuração garante que o site só possa carregar recursos e fazer conexões para domínios confiáveis e necessários para o funcionamento do portal.

Estes headers são aplicados através do middleware global da aplicação, garantindo que todas as páginas e APIs estejam protegidas.

## Proxies de API

Para aumentar a segurança e evitar problemas de CORS e CSP, implementamos proxies de API internos para serviços externos:

- **/api/weather**: Proxy para a API de clima (wttr.in)
- **/api/games**: Proxy para a API de futebol (football-data.org)
- **/api/market**: Proxy para a API de mercado financeiro (Yahoo Finance)

Esses proxies oferecem várias vantagens de segurança:

1. **Ocultação de chaves de API**: As chaves de API são armazenadas apenas no servidor e nunca expostas ao cliente
2. **Controle de acesso**: Podemos aplicar rate limiting e verificações de autenticação
3. **Filtragem de dados**: Retornamos apenas os dados necessários, reduzindo a exposição de informações
4. **Resiliência**: Implementamos timeout, retry e tratamento de erros consistente
5. **Monitoramento centralizado**: Todas as chamadas de API são registradas e monitoradas

## Rate Limiting

Implementamos um sistema de rate limiting para proteger contra abusos e ataques de força bruta:

- **APIs públicas**: 30 requisições por minuto
- **APIs de autenticação**: 10 requisições por minuto (com bloqueio de 5 minutos após exceder)
- **APIs administrativas**: 200 requisições por minuto

O sistema de rate limiting:

- Identifica usuários por IP, API key e User-Agent
- Adiciona headers de rate limiting nas respostas
- Bloqueia temporariamente IPs que excedem limites em endpoints sensíveis
- Registra tentativas de abuso no sistema de monitoramento

## Regras do Firestore

Melhoramos as regras de segurança do Firestore para:

- Validar campos obrigatórios em documentos
- Implementar verificações de propriedade de documentos
- Limitar a taxa de escrita para prevenir abusos
- Restringir acesso a dados sensíveis
- Prevenir escalação de privilégios

Exemplos de melhorias:

- Usuários não podem se registrar como administradores
- Usuários não podem modificar seu próprio papel (role)
- Validação de campos obrigatórios em todas as coleções
- Limitação de taxa de escrita para prevenir abusos

## Sistema de Monitoramento

Implementamos um sistema de monitoramento abrangente que:

- Registra eventos de segurança, erros e métricas de performance
- Categoriza eventos por severidade (baixa, média, alta, crítica)
- Notifica administradores sobre eventos críticos
- Armazena logs detalhados para análise forense
- Monitora performance de APIs e páginas

Tipos de eventos monitorados:

- Erros de aplicação
- Violações de segurança
- Métricas de performance
- Ações de usuários
- Eventos de sistema

## Tratamento de Erros e Resiliência

Implementamos mecanismos robustos de tratamento de erros e resiliência em componentes críticos:

- **Timeout em requisições**: Todas as requisições externas têm timeout configurado para evitar bloqueios
- **Retry com backoff exponencial**: Tentativas automáticas de reconexão com intervalos crescentes
- **Fallbacks graceful**: Exibição de conteúdo alternativo quando serviços externos falham
- **Validação de respostas**: Verificação rigorosa de dados recebidos de APIs externas
- **Monitoramento de falhas**: Registro detalhado de erros para análise e correção

Esses mecanismos garantem que o site continue funcionando mesmo quando serviços externos estão indisponíveis ou instáveis.

## Teste de Penetração

Criamos um script de teste de penetração (`scripts/security-scan.js`) que verifica:

```bash
node scripts/security-scan.js [URL]
```

## Boas Práticas Adicionais

- **Cookies**: Todos os cookies sensíveis são marcados como `HttpOnly`, `Secure` e `SameSite=Strict`
- **Senhas**: Armazenadas usando o sistema seguro do Firebase Authentication
- **Uploads**: Validação rigorosa de arquivos e armazenamento em Cloudinary
- **APIs**: Validação de entrada em todas as rotas
- **Autenticação**: Tokens JWT com expiração curta
- **Administração**: Verificação de permissões em múltiplas camadas

## Plano de Resposta a Incidentes

Em caso de incidente de segurança:

1. **Detecção**: O sistema de monitoramento alerta sobre atividades suspeitas
2. **Contenção**: Bloqueio automático de IPs suspeitos e limitação de acesso
3. **Investigação**: Análise de logs e eventos registrados
4. **Remediação**: Correção de vulnerabilidades e restauração de sistemas
5. **Comunicação**: Notificação aos usuários afetados, se necessário
6. **Prevenção**: Atualização de medidas de segurança para prevenir incidentes similares

## Próximos Passos

Para melhorar ainda mais a segurança do portal, planejamos:

1. Implementar autenticação de dois fatores (2FA)
2. Realizar auditorias de segurança periódicas
3. Implementar verificação de vulnerabilidades em dependências
4. Expandir o sistema de monitoramento com detecção de anomalias
5. Adicionar proteção contra ataques DDoS

## Contato

Para reportar vulnerabilidades de segurança, entre em contato com:

- Email: seguranca@riodefato.com
- Responsável: Equipe de Segurança
