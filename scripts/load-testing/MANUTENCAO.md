# Manutenção dos Testes de Carga

Este documento explica como manter os arquivos de teste de carga no projeto Rio de Fato.

## O que deve ser versionado (incluído no Git)

Os seguintes arquivos **devem ser mantidos no repositório Git**:

1. **Scripts de teste**:

   - `basic-load-test.js`, `basic-load-test-modified.js`
   - `advanced-load-test.js`
   - `api-load-test.js`

2. **Scripts de execução e configuração**:

   - `run-load-tests.sh`
   - `monitor-resources.sh`
   - `setup.sh`
   - `analyze-all.sh`
   - `example-compare.sh`

3. **Scripts de análise**:

   - `analyze-results.js`
   - `compare-results.js`
   - `generate-report.js`

4. **Documentação**:
   - `README.md`
   - `RESUMO.md`
   - `MANUTENCAO.md` (este arquivo)

## O que NÃO deve ser versionado (ignorado pelo Git)

Os seguintes arquivos e diretórios **não devem ser incluídos no repositório Git** (já configurados no .gitignore):

1. **Resultados de testes**:
   - Diretório `/logs/load-tests/`
   - Arquivos JSON de resultados
   - Relatórios HTML gerados
   - Arquivos de comparação

## Boas Práticas

1. **Atualize os scripts de teste** quando novas funcionalidades forem adicionadas ao portal.

2. **Mantenha os thresholds (limites) atualizados** conforme o desempenho do sistema melhora.

3. **Documente alterações significativas** nos scripts de teste.

4. **Compartilhe insights** obtidos dos testes com a equipe, mas não os arquivos de resultado brutos.

5. **Execute testes de carga regularmente**, especialmente após mudanças significativas na arquitetura.

## Integração com CI/CD (Futuro)

No futuro, considere integrar os testes de carga ao pipeline de CI/CD:

1. Execute testes básicos automaticamente em cada PR.
2. Execute testes completos em ambientes de staging antes de promover para produção.
3. Armazene métricas históricas em um banco de dados para acompanhar a evolução do desempenho.

## Compartilhando Resultados

Para compartilhar resultados com a equipe:

1. Gere relatórios visuais usando `npm run generate-report`.
2. Exporte apenas os gráficos e conclusões relevantes, não os dados brutos.
3. Mantenha um registro das otimizações realizadas e seus impactos no desempenho.

---

Lembre-se: Os scripts de teste são parte da infraestrutura de qualidade do projeto e devem ser tratados com o mesmo cuidado que o código da aplicação.
