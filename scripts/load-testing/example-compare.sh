#!/bin/bash

# Script de exemplo para demonstrar como comparar resultados de testes de carga
# Este script mostra como usar o compare-results.js para analisar diferenças entre execuções

# Cores para saída no terminal
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Exemplo de Comparação de Resultados de Testes de Carga ===${NC}"

# Verificar se temos pelo menos dois diretórios de resultados
if [ -z "$(ls -d logs/load-tests/20* 2>/dev/null)" ]; then
    echo -e "${RED}Erro: Nenhum diretório de resultados encontrado.${NC}"
    echo -e "${YELLOW}Execute pelo menos dois testes de carga antes de usar este script:${NC}"
    echo -e "${YELLOW}npm run load-test${NC}"
    exit 1
fi

# Listar diretórios de resultados disponíveis
echo -e "${YELLOW}Diretórios de resultados disponíveis:${NC}"
ls -d logs/load-tests/20* | grep -v "resources" | sort -r | nl

# Solicitar ao usuário que escolha os diretórios
echo -e "${YELLOW}Escolha o número do diretório BASE (execução anterior):${NC}"
read base_num
echo -e "${YELLOW}Escolha o número do diretório de COMPARAÇÃO (execução mais recente):${NC}"
read compare_num

# Obter os caminhos dos diretórios
base_dir=$(ls -d logs/load-tests/20* | grep -v "resources" | sort -r | sed -n "${base_num}p")
compare_dir=$(ls -d logs/load-tests/20* | grep -v "resources" | sort -r | sed -n "${compare_num}p")

if [ -z "$base_dir" ] || [ -z "$compare_dir" ]; then
    echo -e "${RED}Erro: Diretório(s) inválido(s).${NC}"
    exit 1
fi

echo -e "${GREEN}Comparando:${NC}"
echo -e "Base: $base_dir"
echo -e "Comparação: $compare_dir"
echo ""

# Executar a comparação
node scripts/load-testing/compare-results.js "$base_dir" "$compare_dir"

echo -e "${GREEN}=== Comparação concluída ===${NC}"
echo -e "${YELLOW}Dica: Use este script após fazer otimizações para verificar melhorias.${NC}" 