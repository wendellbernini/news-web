#!/bin/bash

# Script para monitorar recursos do servidor durante testes de carga
# Este script coleta informações sobre CPU, memória, disco e rede durante os testes

# Cores para saída no terminal
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Diretório para armazenar os resultados
RESULTS_DIR="./logs/load-tests/$(date +%Y-%m-%d_%H-%M-%S)-resources"

# Criar diretório para os resultados
mkdir -p "$RESULTS_DIR"

echo -e "${YELLOW}=== Iniciando monitoramento de recursos para testes de carga ===${NC}"
echo -e "${YELLOW}Os resultados serão salvos em: ${RESULTS_DIR}${NC}"

# Verificar se as ferramentas necessárias estão instaladas
for cmd in top vmstat iostat ifstat; do
    if ! command -v $cmd &> /dev/null; then
        echo -e "${RED}$cmd não está instalado. Por favor, instale-o primeiro.${NC}"
        case $cmd in
            top|vmstat)
                echo -e "${YELLOW}sudo apt-get install procps${NC}"
                ;;
            iostat)
                echo -e "${YELLOW}sudo apt-get install sysstat${NC}"
                ;;
            ifstat)
                echo -e "${YELLOW}sudo apt-get install ifstat${NC}"
                ;;
        esac
    fi
done

# Função para encerrar processos de monitoramento
cleanup() {
    echo -e "${YELLOW}Encerrando monitoramento...${NC}"
    # Matar todos os processos em background
    kill $(jobs -p) 2>/dev/null
    echo -e "${GREEN}Monitoramento encerrado. Resultados salvos em: ${RESULTS_DIR}${NC}"
    exit 0
}

# Capturar sinais para encerrar corretamente
trap cleanup SIGINT SIGTERM

# Iniciar monitoramento de CPU
echo -e "${YELLOW}Iniciando monitoramento de CPU...${NC}"
top -b -d 5 > "${RESULTS_DIR}/cpu.log" &

# Iniciar monitoramento de memória
echo -e "${YELLOW}Iniciando monitoramento de memória...${NC}"
vmstat 5 > "${RESULTS_DIR}/memory.log" &

# Iniciar monitoramento de disco
echo -e "${YELLOW}Iniciando monitoramento de disco...${NC}"
if command -v iostat &> /dev/null; then
    iostat -x 5 > "${RESULTS_DIR}/disk.log" &
fi

# Iniciar monitoramento de rede
echo -e "${YELLOW}Iniciando monitoramento de rede...${NC}"
if command -v ifstat &> /dev/null; then
    ifstat -t 5 > "${RESULTS_DIR}/network.log" &
fi

echo -e "${GREEN}Monitoramento iniciado. Pressione Ctrl+C para encerrar.${NC}"
echo -e "${YELLOW}Execute seus testes de carga em outro terminal enquanto este monitoramento está ativo.${NC}"

# Manter o script rodando até receber um sinal para encerrar
while true; do
    sleep 1
done 