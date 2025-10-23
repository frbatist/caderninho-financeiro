#!/bin/bash
# Script de Deploy para Raspberry Pi 3
# Autor: Caderninho Financeiro
# Data: 2025-10-22

set -e

# Configurações (edite conforme necessário)
REGISTRY_HOST="${REGISTRY_HOST:-10.0.0.131:5001}"
IMAGE_NAME="${IMAGE_NAME:-caderninho-api}"
TAG="${TAG:-latest}"
CONTAINER_NAME="${CONTAINER_NAME:-caderninho-api}"
PORT="${PORT:-5000}"
RASPBERRY_PI_HOST="${RASPBERRY_PI_HOST:-10.0.0.131}"
RASPBERRY_PI_USER="${RASPBERRY_PI_USER:-pi}"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funções auxiliares
print_step() {
    echo -e "\n${CYAN}==> $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}$1${NC}"
}

# Banner
echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════╗
║   Caderninho Financeiro - Deploy Script  ║
║         Raspberry Pi 3 + Docker           ║
╚═══════════════════════════════════════════╝
EOF
echo -e "${NC}"

FULL_IMAGE_NAME="$REGISTRY_HOST/$IMAGE_NAME:$TAG"

echo "Configuração:"
echo "  Registry: $REGISTRY_HOST"
echo "  Imagem: $IMAGE_NAME:$TAG"
echo "  Container: $CONTAINER_NAME"
echo "  Porta: $PORT"

# Verificar Docker
print_step "Verificando Docker..."
if ! command -v docker &> /dev/null; then
    print_error "Docker não está instalado!"
    exit 1
fi
print_success "Docker encontrado"

# Build da imagem
print_step "Construindo imagem Docker para ARM64 (64-bit)..."
docker build \
    --platform linux/arm64 \
    -t "$FULL_IMAGE_NAME" \
    -f Dockerfile \
    .

if [ $? -eq 0 ]; then
    print_success "Imagem construída com sucesso!"
    IMAGE_SIZE=$(docker images "$FULL_IMAGE_NAME" --format "{{.Size}}")
    echo "  Tamanho: $IMAGE_SIZE"
else
    print_error "Falha ao construir imagem!"
    exit 1
fi

# Push para registry
print_step "Enviando imagem para o registry..."

# Testar conectividade
if curl -s "http://$REGISTRY_HOST/v2/" > /dev/null; then
    print_success "Registry está acessível"
else
    print_error "Não foi possível conectar ao registry em $REGISTRY_HOST"
    exit 1
fi

docker push "$FULL_IMAGE_NAME"

if [ $? -eq 0 ]; then
    print_success "Imagem enviada com sucesso!"
else
    print_error "Falha ao enviar imagem!"
    exit 1
fi

# Deploy remoto
if [ "$1" = "--deploy" ] || [ "$1" = "-d" ]; then
    print_step "Executando deploy remoto no Raspberry Pi..."
    
    ssh "$RASPBERRY_PI_USER@$RASPBERRY_PI_HOST" << EOF
set -e

echo '==> Parando container existente...'
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

echo '==> Baixando nova imagem...'
docker pull $FULL_IMAGE_NAME

echo '==> Criando diretórios...'
mkdir -p ~/caderninho-data

echo '==> Iniciando container...'
docker run -d \\
  --name $CONTAINER_NAME \\
  --restart unless-stopped \\
  -p $PORT:8080 \\
  -v ~/caderninho-data:/app/data \\
  -e ASPNETCORE_ENVIRONMENT=Production \\
  -e ConnectionStrings__DefaultConnection='Data Source=/app/data/caderninho.db' \\
  $FULL_IMAGE_NAME

echo '==> Aguardando...'
sleep 5

echo '==> Status:'
docker ps | grep $CONTAINER_NAME

echo '==> Logs:'
docker logs --tail 20 $CONTAINER_NAME

echo '✓ Deploy concluído!'
EOF

    if [ $? -eq 0 ]; then
        print_success "Deploy remoto concluído!"
    else
        print_error "Falha no deploy remoto!"
        exit 1
    fi
fi

# Informações finais
print_step "Deploy concluído!"
print_info "
Comandos úteis:

📦 Gerenciar Container:
  ssh $RASPBERRY_PI_USER@$RASPBERRY_PI_HOST

  docker logs -f $CONTAINER_NAME          # Ver logs
  docker stop $CONTAINER_NAME              # Parar
  docker start $CONTAINER_NAME             # Iniciar
  docker restart $CONTAINER_NAME           # Reiniciar
  docker rm -f $CONTAINER_NAME             # Remover

🌐 Acessar API:
  http://$RASPBERRY_PI_HOST:$PORT
  http://$RASPBERRY_PI_HOST:$PORT/swagger

🔄 Fazer deploy:
  ./deploy.sh --deploy
"

print_success "Tudo pronto! 🚀"
