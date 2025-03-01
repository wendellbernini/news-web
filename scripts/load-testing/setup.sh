#!/bin/bash

# Script para instalar as dependências necessárias para os testes de carga
# Este script instala o k6 e as ferramentas de monitoramento de recursos

# Cores para saída no terminal
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Instalando dependências para testes de carga ===${NC}"

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Este script precisa ser executado como root (sudo).${NC}"
  echo -e "${YELLOW}Por favor, execute: sudo $0${NC}"
  exit 1
fi

# Detectar o sistema operacional
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
elif type lsb_release >/dev/null 2>&1; then
    OS=$(lsb_release -si)
else
    OS=$(uname -s)
fi

echo -e "${YELLOW}Sistema operacional detectado: $OS${NC}"

# Instalar k6 no Linux
install_k6_linux() {
    echo -e "${YELLOW}Instalando k6...${NC}"
    
    # Adicionar a chave GPG do k6
    gpg -k
    gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
    
    # Adicionar o repositório do k6
    echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | tee /etc/apt/sources.list.d/k6.list
    
    # Atualizar e instalar k6
    apt-get update
    apt-get install -y k6
    
    # Verificar a instalação
    if command -v k6 &> /dev/null; then
        echo -e "${GREEN}k6 instalado com sucesso!${NC}"
        k6 version
    else
        echo -e "${RED}Falha ao instalar k6. Por favor, tente instalar manualmente.${NC}"
        echo -e "${YELLOW}Consulte: https://k6.io/docs/getting-started/installation/${NC}"
    fi
}

# Instalar k6 no macOS
install_k6_macos() {
    echo -e "${YELLOW}Instalando k6 via Homebrew...${NC}"
    
    # Verificar se o Homebrew está instalado
    if ! command -v brew &> /dev/null; then
        echo -e "${RED}Homebrew não está instalado. Por favor, instale-o primeiro:${NC}"
        echo -e "${YELLOW}/bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"${NC}"
        exit 1
    fi
    
    # Instalar k6
    brew install k6
    
    # Verificar a instalação
    if command -v k6 &> /dev/null; then
        echo -e "${GREEN}k6 instalado com sucesso!${NC}"
        k6 version
    else
        echo -e "${RED}Falha ao instalar k6. Por favor, tente instalar manualmente.${NC}"
        echo -e "${YELLOW}Consulte: https://k6.io/docs/getting-started/installation/${NC}"
    fi
}

# Instalar ferramentas de monitoramento no Linux
install_monitoring_tools_linux() {
    echo -e "${YELLOW}Instalando ferramentas de monitoramento...${NC}"
    
    # Instalar ferramentas básicas
    apt-get install -y procps
    
    # Instalar sysstat (iostat)
    apt-get install -y sysstat
    
    # Instalar ifstat
    apt-get install -y ifstat
    
    echo -e "${GREEN}Ferramentas de monitoramento instaladas com sucesso!${NC}"
}

# Instalar ferramentas de monitoramento no macOS
install_monitoring_tools_macos() {
    echo -e "${YELLOW}Instalando ferramentas de monitoramento...${NC}"
    
    # Instalar ferramentas via Homebrew
    brew install procps
    brew install sysstat
    brew install ifstat
    
    echo -e "${GREEN}Ferramentas de monitoramento instaladas com sucesso!${NC}"
}

# Instalar dependências com base no sistema operacional
case "$OS" in
    *Ubuntu*|*Debian*|*Linux*)
        install_k6_linux
        install_monitoring_tools_linux
        ;;
    *macOS*|*Mac*)
        install_k6_macos
        install_monitoring_tools_macos
        ;;
    *)
        echo -e "${RED}Sistema operacional não suportado: $OS${NC}"
        echo -e "${YELLOW}Por favor, instale as dependências manualmente:${NC}"
        echo -e "${YELLOW}1. k6: https://k6.io/docs/getting-started/installation/${NC}"
        echo -e "${YELLOW}2. Ferramentas de monitoramento: procps, sysstat, ifstat${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}=== Todas as dependências foram instaladas com sucesso! ===${NC}"
echo -e "${YELLOW}Agora você pode executar os testes de carga com:${NC}"
echo -e "${YELLOW}npm run load-test${NC}" 