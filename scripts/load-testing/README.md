# Testes de Carga para o Portal Rio de Fato

Este diretório contém scripts para realizar testes de carga no portal Rio de Fato, permitindo avaliar o desempenho do sistema sob diferentes níveis de tráfego e uso.

## Pré-requisitos

Antes de executar os testes de carga, você precisa ter instalado:

1. [k6](https://k6.io/docs/getting-started/installation/) - Ferramenta de teste de carga
2. Node.js e npm (para executar o servidor)
3. curl (para verificar se o servidor está rodando)
4. Ferramentas de monitoramento (para o script de monitoramento de recursos):
   - top e vmstat (geralmente já instalados)
   - iostat (`sudo apt-get install sysstat`)
   - ifstat (`sudo apt-get install ifstat`)

## Instalação Rápida

Para instalar todas as dependências necessárias de uma vez, execute:

```bash
npm run setup-load-test
```

Este comando executará o script `setup.sh` que instalará o k6 e as ferramentas de monitoramento necessárias para o seu sistema operacional (Linux ou macOS).

## Instalação Manual do k6

Se preferir instalar manualmente:

### Linux

```bash
sudo apt-get update
sudo apt-get install k6
```

### macOS

```bash
brew install k6
```

### Windows

```bash
choco install k6
```

Ou baixe o instalador em: https://dl.k6.io/msi/k6-latest-amd64.msi

## Estrutura dos Testes

Este diretório contém quatro scripts de teste diferentes:

1. **basic-load-test.js** - Teste básico que simula usuários navegando pelo site
2. **basic-load-test-modified.js** - Versão modificada do teste básico que usa apenas rotas existentes no projeto
3. **advanced-load-test.js** - Teste avançado que simula diferentes cenários de uso
4. **api-load-test.js** - Teste específico para as APIs do sistema

Além disso, há scripts auxiliares:

5. **run-load-tests.sh** - Script para executar todos os testes em sequência
6. **monitor-resources.sh** - Script para monitorar recursos do servidor durante os testes
7. **analyze-results.js** - Script para analisar os resultados dos testes e gerar relatórios
8. **compare-results.js** - Script para comparar resultados de diferentes execuções de testes
9. **example-compare.sh** - Script interativo para facilitar a comparação de resultados
10. **setup.sh** - Script para instalar todas as dependências necessárias
11. **generate-report.js** - Script para gerar um relatório visual em HTML dos resultados
12. **analyze-all.sh** - Script para executar todos os passos de análise de uma vez
13. **MANUTENCAO.md** - Guia sobre como manter os arquivos de teste no projeto

## Como Executar os Testes

### 1. Inicie o servidor

Antes de executar os testes, certifique-se de que o servidor está rodando:

```bash
cd /caminho/para/news-web
npm run dev
```

### 2. Inicie o monitoramento de recursos (opcional, mas recomendado)

Em um terminal separado, execute:

```bash
cd /caminho/para/news-web
npm run monitor-resources
```

Este script irá monitorar CPU, memória, disco e rede durante os testes. Deixe-o rodando enquanto executa os testes.

### 3. Execute o script de testes

Em outro terminal, execute:

```bash
cd /caminho/para/news-web
npm run load-test
```

Ou, se preferir executar testes específicos:

```bash
npm run load-test:basic     # Apenas o teste básico
npm run load-test:modified  # Apenas o teste básico modificado (recomendado para projetos em desenvolvimento)
npm run load-test:advanced  # Apenas o teste avançado
npm run load-test:api       # Apenas o teste de API
```

### 4. Analise os resultados

Os resultados dos testes serão salvos no diretório `logs/load-tests/[data-hora]/`. Você encontrará:

- Arquivos JSON com dados detalhados de cada teste
- Arquivos de texto com resumos de cada teste
- Um arquivo `resumo-geral.txt` com um resumo de todos os testes

Os resultados do monitoramento de recursos serão salvos em `logs/load-tests/[data-hora]-resources/`:

- `cpu.log` - Informações sobre uso de CPU
- `memory.log` - Informações sobre uso de memória
- `disk.log` - Informações sobre operações de disco
- `network.log` - Informações sobre tráfego de rede

### 5. Execute a análise completa (recomendado)

Para executar todos os passos de análise de uma vez (análise de texto, relatório visual e comparação), use:

```bash
cd /caminho/para/news-web
npm run analyze-all logs/load-tests/[data-hora]
```

Ou diretamente:

```bash
./scripts/load-testing/analyze-all.sh logs/load-tests/[data-hora]
```

Este script interativo irá:

- Executar a análise detalhada dos resultados
- Gerar o relatório visual em HTML
- Oferecer a opção de comparar com resultados anteriores
- Permitir abrir o relatório visual no navegador

É a maneira mais completa e fácil de analisar os resultados dos testes.

### 6. Análise manual: Execute a análise detalhada dos resultados

Se preferir executar os passos manualmente, você pode começar com a análise detalhada:

```bash
cd /caminho/para/news-web
npm run analyze-results logs/load-tests/[data-hora]
```

Substitua `[data-hora]` pelo diretório específico dos resultados que você deseja analisar.

Este script irá:

- Analisar os arquivos JSON de resultados
- Extrair métricas importantes como tempo de resposta, taxa de falha, etc.
- Verificar se os thresholds foram atingidos
- Gerar recomendações com base nos resultados
- Analisar os logs de monitoramento de recursos (se disponíveis)
- Criar um relatório resumido com conclusões e recomendações

O relatório será salvo como `analise-detalhada.txt` no diretório de resultados.

### 7. Análise manual: Gere um relatório visual

Para gerar um relatório visual em HTML com gráficos e análises detalhadas, execute:

```bash
cd /caminho/para/news-web
npm run generate-report logs/load-tests/[data-hora]
```

Substitua `[data-hora]` pelo diretório específico dos resultados que você deseja visualizar.

Este script irá:

- Analisar os arquivos JSON de resultados
- Gerar gráficos de tempo de resposta e requisições por segundo
- Criar cartões detalhados para cada teste
- Fornecer uma tabela comparativa de todos os testes
- Gerar recomendações automáticas com base nos resultados
- Criar um arquivo HTML interativo com visualizações

O relatório será salvo como `relatorio-visual.html` no diretório de resultados. Abra este arquivo em um navegador para visualizar o relatório completo.

### 8. Análise manual: Compare resultados de diferentes execuções

Após fazer otimizações e executar os testes novamente, você pode comparar os resultados para verificar as melhorias:

```bash
cd /caminho/para/news-web
npm run compare-results logs/load-tests/[data-hora-base] logs/load-tests/[data-hora-nova]
```

Substitua `[data-hora-base]` pelo diretório dos resultados antes das otimizações e `[data-hora-nova]` pelo diretório dos resultados após as otimizações.

Para uma experiência mais interativa, você pode usar:

```bash
npm run compare-results:interactive
```

Este script irá:

- Listar todos os diretórios de resultados disponíveis
- Permitir que você escolha quais diretórios comparar
- Executar a comparação automaticamente

O script de comparação irá:

- Comparar os arquivos JSON de resultados entre as duas execuções
- Calcular as diferenças percentuais nas métricas principais
- Identificar melhorias e regressões
- Gerar recomendações com base nas comparações
- Criar um relatório resumido com as diferenças encontradas

O relatório será salvo como `comparacao-resultados.txt` no diretório pai dos resultados.

## Personalização dos Testes

Você pode personalizar os testes editando os arquivos `.js` neste diretório:

- Altere os parâmetros de carga (número de usuários, duração, etc.)
- Modifique os limites de aceitação (thresholds)
- Adicione ou remova cenários de teste
- Ajuste as URLs para apontar para diferentes ambientes (desenvolvimento, teste, produção)

### Adaptando Testes para Projetos em Desenvolvimento

Se seu projeto ainda está em desenvolvimento e nem todas as rotas estão implementadas:

1. Use o script `basic-load-test-modified.js` como base
2. Edite-o para incluir apenas as rotas que já existem no seu projeto
3. Execute com `npm run load-test:modified`

Isso evitará erros 404 que podem distorcer os resultados dos testes.

## Interpretação dos Resultados

Ao analisar os resultados, preste atenção especial a:

1. **Tempo de resposta (http_req_duration)** - Quanto tempo as requisições levam para serem processadas
2. **Taxa de falha (http_req_failed)** - Percentual de requisições que falharam
3. **Requisições por segundo (http_reqs)** - Quantas requisições o sistema consegue processar por segundo
4. **Uso de recursos do servidor** - CPU, memória, rede, etc. (disponíveis nos logs de monitoramento)

### Analisando os Logs de Monitoramento

- **CPU**: Procure por altos percentuais de uso de CPU (coluna %CPU no arquivo cpu.log)
- **Memória**: Observe o uso de memória e swap (colunas free, buff/cache, si, so no arquivo memory.log)
- **Disco**: Verifique operações de leitura/escrita e tempos de espera (arquivo disk.log)
- **Rede**: Analise o tráfego de entrada e saída (arquivo network.log)

## Métricas Personalizadas

Os testes incluem algumas métricas personalizadas:

- **failed_requests** - Contador de requisições que falharam nas verificações
- **search_time** - Tempo para processar buscas
- **article_load_time** - Tempo para carregar artigos
- **api_response_time** - Tempo de resposta das APIs

## Próximos Passos

Após executar os testes e analisar os resultados:

1. Identifique gargalos e áreas para otimização
2. Faça ajustes no código ou na infraestrutura
3. Execute os testes novamente para verificar melhorias
4. Compare os resultados antes e depois das otimizações usando o script de comparação
5. Ajuste os parâmetros dos testes para simular cenários mais realistas
6. Considere adicionar testes para funcionalidades específicas

## Otimizações Comuns

Com base nos resultados dos testes, você pode considerar:

1. **Otimização de banco de dados**: Índices, consultas, caching
2. **Otimização de frontend**: Compressão, minificação, lazy loading
3. **Caching**: Implementar ou ajustar estratégias de cache
4. **Balanceamento de carga**: Distribuir o tráfego entre múltiplos servidores
5. **CDN**: Utilizar uma rede de distribuição de conteúdo para assets estáticos
6. **Otimização de imagens**: Compressão, redimensionamento, formatos modernos

## Fluxo de Trabalho Recomendado

Para obter os melhores resultados, siga este fluxo de trabalho:

1. **Preparação**:

   - Certifique-se de que o ambiente de teste é similar ao de produção
   - Prepare dados de teste realistas
   - Defina métricas e limites de aceitação claros

2. **Execução**:

   - Inicie o monitoramento de recursos
   - Execute os testes de carga
   - Mantenha o monitoramento ativo durante todo o teste

3. **Análise**:

   - Use o script de análise completa (`analyze-all.sh`) para processar os resultados
   - Revise o relatório visual e as recomendações geradas
   - Identifique gargalos e problemas
   - Documente os resultados e observações

4. **Otimização**:

   - Implemente melhorias com base na análise
   - Priorize as otimizações com maior impacto
   - Documente as alterações feitas

5. **Verificação**:

   - Execute os testes novamente após as otimizações
   - Use o script de análise completa para comparar com os resultados anteriores
   - Verifique se as melhorias tiveram o efeito esperado

6. **Iteração**:
   - Repita o processo até atingir os objetivos de desempenho
   - Aumente gradualmente a carga para encontrar os limites do sistema

## Ciclo de Vida dos Testes de Carga

Para garantir que o sistema continue performando bem ao longo do tempo, recomenda-se:

1. **Testes de Desenvolvimento**: Execute testes de carga durante o desenvolvimento de novas funcionalidades para identificar problemas cedo.
2. **Testes de Pré-lançamento**: Execute testes completos antes de cada lançamento importante.
3. **Testes de Regressão**: Execute testes periodicamente para verificar se atualizações ou mudanças não afetaram o desempenho.
4. **Testes de Capacidade**: Periodicamente, execute testes com cargas crescentes para determinar os limites do sistema.
5. **Monitoramento Contínuo**: Implemente monitoramento em produção para detectar problemas de desempenho em tempo real.

## Recursos Adicionais

- [Documentação do k6](https://k6.io/docs/)
- [Exemplos de scripts k6](https://k6.io/docs/examples/)
- [Visualização de resultados com Grafana](https://k6.io/docs/results-visualization/grafana-dashboards/)
- [Monitoramento de recursos com Prometheus](https://prometheus.io/)
- [Visualização de métricas com Grafana](https://grafana.com/)

## Suporte

Em caso de dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.
