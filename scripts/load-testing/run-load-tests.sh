#!/bin/bash

# Script para executar testes de carga no portal Rio de Fato
# Requer k6 instalado: https://k6.io/docs/getting-started/installation/

# Cores para saída no terminal
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Diretório para armazenar os resultados
RESULTS_DIR="./logs/load-tests/$(date +%Y-%m-%d_%H-%M-%S)"

# Criar diretório para os resultados
mkdir -p "$RESULTS_DIR"

echo -e "${YELLOW}=== Iniciando testes de carga para o portal Rio de Fato ===${NC}"
echo -e "${YELLOW}Os resultados serão salvos em: ${RESULTS_DIR}${NC}"

# Verificar se o k6 está instalado
if ! command -v k6 &> /dev/null; then
    echo -e "${RED}k6 não está instalado. Por favor, instale-o primeiro:${NC}"
    echo -e "${YELLOW}https://k6.io/docs/getting-started/installation/${NC}"
    exit 1
fi

# Verificar se o servidor está rodando
echo -e "${YELLOW}Verificando se o servidor está rodando...${NC}"
if ! curl -s http://localhost:3000 > /dev/null; then
    echo -e "${RED}O servidor não está acessível em http://localhost:3000${NC}"
    echo -e "${YELLOW}Por favor, inicie o servidor antes de executar os testes de carga.${NC}"
    echo -e "${YELLOW}Você pode iniciar o servidor com: npm run dev${NC}"
    exit 1
fi

echo -e "${GREEN}Servidor está rodando. Iniciando testes...${NC}"

# Função para executar um teste e salvar os resultados
run_test() {
    local test_file=$1
    local test_name=$(basename "$test_file" .js)
    local output_file="${RESULTS_DIR}/${test_name}.json"
    local summary_file="${RESULTS_DIR}/${test_name}-summary.txt"
    
    echo -e "${YELLOW}Executando teste: ${test_name}...${NC}"
    
    # Executar o teste com k6 e salvar os resultados
    k6 run --out json="${output_file}" "${test_file}" | tee "${summary_file}"
    
    # Verificar se o teste foi concluído com sucesso
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Teste ${test_name} concluído com sucesso.${NC}"
    else
        echo -e "${RED}Teste ${test_name} falhou.${NC}"
    fi
    
    echo -e "${YELLOW}Resultados salvos em: ${output_file}${NC}"
    echo -e "${YELLOW}Resumo salvo em: ${summary_file}${NC}"
    echo ""
}

# Executar os testes
echo -e "${YELLOW}=== Executando teste básico ===${NC}"
run_test "scripts/load-testing/basic-load-test.js"

echo -e "${YELLOW}=== Executando teste avançado ===${NC}"
run_test "scripts/load-testing/advanced-load-test.js"

echo -e "${YELLOW}=== Executando teste de API ===${NC}"
run_test "scripts/load-testing/api-load-test.js"

echo -e "${GREEN}=== Todos os testes de carga foram concluídos ===${NC}"
echo -e "${YELLOW}Os resultados estão disponíveis em: ${RESULTS_DIR}${NC}"

# Gerar um relatório resumido
SUMMARY_FILE="${RESULTS_DIR}/resumo-geral.txt"
echo "=== RESUMO DOS TESTES DE CARGA - $(date) ===" > "${SUMMARY_FILE}"
echo "" >> "${SUMMARY_FILE}"
echo "Diretório de resultados: ${RESULTS_DIR}" >> "${SUMMARY_FILE}"
echo "" >> "${SUMMARY_FILE}"

# Adicionar resumos de cada teste ao relatório geral
for summary in "${RESULTS_DIR}"/*-summary.txt; do
    test_name=$(basename "$summary" -summary.txt)
    echo "=== RESUMO DO TESTE: ${test_name} ===" >> "${SUMMARY_FILE}"
    grep -A 10 "data_received" "${summary}" >> "${SUMMARY_FILE}" 2>/dev/null
    echo "" >> "${SUMMARY_FILE}"
done

echo -e "${GREEN}Relatório resumido gerado: ${SUMMARY_FILE}${NC}"
echo -e "${YELLOW}Para visualizar os resultados em detalhes, você pode usar ferramentas como k6 Cloud ou importar os arquivos JSON em ferramentas de visualização.${NC}"

# Instruções finais
echo ""
echo -e "${YELLOW}=== PRÓXIMOS PASSOS ===${NC}"
echo -e "${YELLOW}1. Analise os resultados nos arquivos JSON e nos resumos.${NC}"
echo -e "${YELLOW}2. Verifique se os tempos de resposta estão dentro dos limites aceitáveis.${NC}"
echo -e "${YELLOW}3. Identifique possíveis gargalos e áreas para otimização.${NC}"
echo -e "${YELLOW}4. Ajuste os parâmetros dos testes conforme necessário para simular cenários mais realistas.${NC}"
echo -e "${YELLOW}5. Execute novamente os testes após fazer otimizações para verificar melhorias.${NC}"
echo ""
echo -e "${GREEN}=== FIM DOS TESTES DE CARGA ===${NC}" 