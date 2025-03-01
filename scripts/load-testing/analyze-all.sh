#!/bin/bash

# Script para executar todos os passos de análise dos testes de carga
# Este script executa a análise de texto, gera o relatório visual e compara com resultados anteriores

# Cores para saída no terminal
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Análise Completa de Testes de Carga ===${NC}"

# Verificar se foi fornecido um diretório de resultados
if [ -z "$1" ]; then
    echo -e "${RED}Erro: Diretório de resultados não especificado.${NC}"
    echo -e "${YELLOW}Uso: ./analyze-all.sh <diretório-de-resultados> [diretório-base-para-comparação]${NC}"
    echo -e "${YELLOW}Exemplo: ./analyze-all.sh logs/load-tests/2023-06-01_12-00-00${NC}"
    exit 1
fi

RESULTS_DIR="$1"

# Verificar se o diretório existe
if [ ! -d "$RESULTS_DIR" ]; then
    echo -e "${RED}Erro: Diretório '$RESULTS_DIR' não encontrado.${NC}"
    exit 1
fi

echo -e "${YELLOW}Diretório de resultados: ${RESULTS_DIR}${NC}"

# Passo 1: Executar análise de texto
echo -e "\n${YELLOW}=== Passo 1: Executando análise de texto ===${NC}"
node scripts/load-testing/analyze-results.js "$RESULTS_DIR"

# Verificar se a análise foi bem-sucedida
if [ $? -ne 0 ]; then
    echo -e "${RED}Erro ao executar a análise de texto.${NC}"
    exit 1
fi

# Passo 2: Gerar relatório visual
echo -e "\n${YELLOW}=== Passo 2: Gerando relatório visual ===${NC}"
node scripts/load-testing/generate-report.js "$RESULTS_DIR"

# Verificar se a geração do relatório foi bem-sucedida
if [ $? -ne 0 ]; then
    echo -e "${RED}Erro ao gerar o relatório visual.${NC}"
    exit 1
fi

# Passo 3: Comparar com resultados anteriores (se fornecido)
if [ -n "$2" ]; then
    BASE_DIR="$2"
    
    # Verificar se o diretório base existe
    if [ ! -d "$BASE_DIR" ]; then
        echo -e "${RED}Erro: Diretório base '$BASE_DIR' não encontrado.${NC}"
        exit 1
    fi
    
    echo -e "\n${YELLOW}=== Passo 3: Comparando com resultados anteriores ===${NC}"
    echo -e "${YELLOW}Diretório base: ${BASE_DIR}${NC}"
    
    node scripts/load-testing/compare-results.js "$BASE_DIR" "$RESULTS_DIR"
    
    # Verificar se a comparação foi bem-sucedida
    if [ $? -ne 0 ]; then
        echo -e "${RED}Erro ao comparar os resultados.${NC}"
        exit 1
    fi
else
    echo -e "\n${YELLOW}=== Passo 3: Comparação com resultados anteriores ===${NC}"
    echo -e "${YELLOW}Nenhum diretório base fornecido para comparação.${NC}"
    
    # Perguntar se o usuário deseja selecionar um diretório para comparação
    echo -e "${YELLOW}Deseja selecionar um diretório para comparação? (s/n)${NC}"
    read -r response
    
    if [[ "$response" =~ ^([sS])$ ]]; then
        # Listar diretórios de resultados disponíveis (excluindo o diretório atual)
        echo -e "${YELLOW}Diretórios de resultados disponíveis:${NC}"
        ls -d logs/load-tests/20* | grep -v "resources" | grep -v "$RESULTS_DIR" | sort -r | nl
        
        # Solicitar ao usuário que escolha um diretório
        echo -e "${YELLOW}Escolha o número do diretório BASE para comparação:${NC}"
        read -r base_num
        
        # Obter o caminho do diretório
        BASE_DIR=$(ls -d logs/load-tests/20* | grep -v "resources" | grep -v "$RESULTS_DIR" | sort -r | sed -n "${base_num}p")
        
        if [ -z "$BASE_DIR" ]; then
            echo -e "${RED}Erro: Diretório inválido.${NC}"
            exit 1
        fi
        
        echo -e "${GREEN}Comparando:${NC}"
        echo -e "Base: $BASE_DIR"
        echo -e "Comparação: $RESULTS_DIR"
        echo ""
        
        node scripts/load-testing/compare-results.js "$BASE_DIR" "$RESULTS_DIR"
        
        # Verificar se a comparação foi bem-sucedida
        if [ $? -ne 0 ]; then
            echo -e "${RED}Erro ao comparar os resultados.${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}Comparação ignorada.${NC}"
    fi
fi

# Passo 4: Abrir o relatório visual no navegador
echo -e "\n${YELLOW}=== Passo 4: Abrindo relatório visual ===${NC}"
REPORT_PATH="${RESULTS_DIR}/relatorio-visual.html"

if [ -f "$REPORT_PATH" ]; then
    echo -e "${YELLOW}Deseja abrir o relatório visual no navegador? (s/n)${NC}"
    read -r open_response
    
    if [[ "$open_response" =~ ^([sS])$ ]]; then
        # Detectar o sistema operacional e abrir o navegador adequadamente
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            xdg-open "$REPORT_PATH"
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            open "$REPORT_PATH"
        elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
            start "$REPORT_PATH"
        else
            echo -e "${YELLOW}Não foi possível abrir o navegador automaticamente.${NC}"
            echo -e "${YELLOW}Por favor, abra o arquivo manualmente: ${REPORT_PATH}${NC}"
        fi
    else
        echo -e "${YELLOW}Relatório não aberto. Você pode abri-lo manualmente em:${NC}"
        echo -e "${GREEN}${REPORT_PATH}${NC}"
    fi
else
    echo -e "${RED}Relatório visual não encontrado em: ${REPORT_PATH}${NC}"
fi

echo -e "\n${GREEN}=== Análise completa concluída! ===${NC}"
echo -e "${YELLOW}Resumo dos arquivos gerados:${NC}"
echo -e "- Análise detalhada: ${RESULTS_DIR}/analise-detalhada.txt"
echo -e "- Relatório visual: ${RESULTS_DIR}/relatorio-visual.html"

if [ -n "$BASE_DIR" ]; then
    PARENT_DIR=$(dirname "$BASE_DIR")
    echo -e "- Comparação de resultados: ${PARENT_DIR}/comparacao-resultados.txt"
fi

echo -e "\n${GREEN}Obrigado por usar o sistema de testes de carga do Portal Rio de Fato!${NC}" 