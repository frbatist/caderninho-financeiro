#!/bin/bash
# Script de Diagnóstico - Caderninho API no Raspberry Pi
# Execute: ./diagnose.sh

RASPBERRY_PI_HOST="${1:-10.0.0.131}"
RASPBERRY_PI_USER="${2:-pi}"

echo "🔍 Diagnóstico da API no Raspberry Pi"
echo "Host: $RASPBERRY_PI_USER@$RASPBERRY_PI_HOST"
echo ""

# Função para executar comando remoto
run_remote() {
    local description=$1
    local command=$2
    echo "📊 $description"
    echo "─────────────────────────────────────────"
    ssh "$RASPBERRY_PI_USER@$RASPBERRY_PI_HOST" "$command"
    echo ""
}

# 1. Verificar se o container está rodando
run_remote "Status do Container" "docker ps -a | grep caderninho"

# 2. Verificar logs recentes
echo "📝 Logs Recentes (últimas 50 linhas)"
echo "─────────────────────────────────────────"
ssh "$RASPBERRY_PI_USER@$RASPBERRY_PI_HOST" "docker logs --tail 50 caderninho-api 2>&1"
echo ""

# 3. Verificar uso de recursos
run_remote "Uso de Recursos (CPU/Memória)" "docker stats caderninho-api --no-stream"

# 4. Verificar memória do sistema
run_remote "Memória do Sistema" "free -h"

# 5. Verificar espaço em disco
run_remote "Espaço em Disco" "df -h"

# 6. Verificar se a porta está aberta
run_remote "Porta 5000" "netstat -tulpn | grep 5000 || ss -tulpn | grep 5000"

# 7. Verificar processos do Docker
run_remote "Containers Ativos" "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

# 8. Verificar banco de dados
run_remote "Arquivos do Banco de Dados" "ls -lh ~/caderninho-data/"

# 9. Testar conectividade da API
echo "🌐 Teste de Conectividade"
echo "─────────────────────────────────────────"
if curl -f -s -o /dev/null -w "%{http_code}" "http://$RASPBERRY_PI_HOST:5000/health" --connect-timeout 5; then
    echo "✅ API respondendo"
else
    echo "❌ API não está respondendo"
fi
echo ""

# 10. Verificar imagem Docker
run_remote "Imagens Docker" "docker images | grep caderninho"

# 11. Verificar temperatura
run_remote "Temperatura do CPU" "vcgencmd measure_temp"

echo "═══════════════════════════════════════════"
echo "🔧 COMANDOS ÚTEIS PARA INVESTIGAÇÃO:"
echo ""
echo "Ver logs completos:"
echo "  ssh $RASPBERRY_PI_USER@$RASPBERRY_PI_HOST 'docker logs -f caderninho-api'"
echo ""
echo "Ver logs de erro:"
echo "  ssh $RASPBERRY_PI_USER@$RASPBERRY_PI_HOST 'docker logs caderninho-api 2>&1 | grep -i error'"
echo ""
echo "Entrar no container:"
echo "  ssh $RASPBERRY_PI_USER@$RASPBERRY_PI_HOST 'docker exec -it caderninho-api sh'"
echo ""
echo "Reiniciar container:"
echo "  ssh $RASPBERRY_PI_USER@$RASPBERRY_PI_HOST 'docker restart caderninho-api'"
echo ""
echo "Ver variáveis de ambiente:"
echo "  ssh $RASPBERRY_PI_USER@$RASPBERRY_PI_HOST 'docker inspect caderninho-api | grep -A 20 Env'"
echo ""
echo "═══════════════════════════════════════════"
