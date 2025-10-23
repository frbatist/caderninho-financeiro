#!/usr/bin/env pwsh
# Script de Monitoramento - Caderninho API no Raspberry Pi
# Execute: .\monitor.ps1

param(
    [string]$RaspberryPiHost,
    [string]$RaspberryPiUser,
    [string]$RaspberryPiPassword,
    [string]$ContainerName
)

$ErrorActionPreference = "Continue"

# Carregar variáveis do arquivo .env se existir
$EnvFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $EnvFile) {
    Write-Host "Carregando configuracoes de .env..." -ForegroundColor Cyan
    Get-Content $EnvFile | ForEach-Object {
        $line = $_.Trim()
        # Ignorar linhas vazias e comentários
        if ($line.Length -gt 0 -and -not $line.StartsWith('#')) {
            if ($line -match '^([A-Z_]+)=(.*)$') {
                $name = $matches[1]
                $value = $matches[2].Trim()
                
                # Remover aspas se existirem
                if ($value.StartsWith('"') -and $value.EndsWith('"')) {
                    $value = $value.Substring(1, $value.Length - 2)
                }
                if ($value.StartsWith("'") -and $value.EndsWith("'")) {
                    $value = $value.Substring(1, $value.Length - 2)
                }
                
                # Mapear variáveis do .env para variáveis do script
                switch ($name) {
                    "RASPBERRY_PI_HOST" { if (-not $RaspberryPiHost) { $script:RaspberryPiHost = $value } }
                    "RASPBERRY_PI_USER" { if (-not $RaspberryPiUser) { $script:RaspberryPiUser = $value } }
                    "RASPBERRY_PI_PASSWORD" { if (-not $RaspberryPiPassword) { $script:RaspberryPiPassword = $value } }
                    "CONTAINER_NAME" { if (-not $ContainerName) { $script:ContainerName = $value } }
                }
            }
        }
    }
}

# Valores padrão
if (-not $RaspberryPiHost) { $RaspberryPiHost = "10.0.0.131" }
if (-not $RaspberryPiUser) { $RaspberryPiUser = "frbatist" }
if (-not $ContainerName) { $ContainerName = "caderninho-api" }

function Write-Header {
    param([string]$Title)
    Write-Host "`n" -NoNewline
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host " $Title" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
}

function Execute-Remote {
    param([string]$Command)
    
    if ($RaspberryPiPassword -and (Get-Command plink -ErrorAction SilentlyContinue)) {
        # Usar plink com senha
        plink -ssh -pw $RaspberryPiPassword "$RaspberryPiUser@$RaspberryPiHost" $Command
    } else {
        # SSH padrão
        ssh "$RaspberryPiUser@$RaspberryPiHost" $Command
    }
}

# Banner
Write-Host @"

╔═══════════════════════════════════════════╗
║      Caderninho API - Monitor Status      ║
╚═══════════════════════════════════════════╝

"@ -ForegroundColor Green

Write-Host "🔍 Conectando em: $RaspberryPiUser@$RaspberryPiHost"
Write-Host "📦 Container: $ContainerName`n"

# 1. Status do Container
Write-Header "📊 Status do Container"
Execute-Remote "docker ps -a --filter name=$ContainerName --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

# 2. Uso de Recursos
Write-Header "💻 Uso de Recursos"
Execute-Remote "docker stats --no-stream $ContainerName --format 'table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}'"

# 3. Health Check
Write-Header "❤️ Health Check"
try {
    $response = Invoke-WebRequest -Uri "http://$RaspberryPiHost`:5000/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ API está online!" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ API não está respondendo!" -ForegroundColor Red
    Write-Host "Erro: $_" -ForegroundColor Red
}

# 4. Últimos Logs
Write-Header "📝 Últimos 20 Logs"
Execute-Remote "docker logs --tail 20 $ContainerName"

# 5. Informações do Sistema
Write-Header "🖥️ Recursos do Raspberry Pi"
Execute-Remote @"
echo 'CPU:'
top -bn1 | grep 'Cpu(s)' | sed 's/.*, *\([0-9.]*\)%* id.*/\1/' | awk '{print "  Uso: " 100 - \$1 "%"}'
echo ''
echo 'Memória:'
free -h | awk 'NR==2{printf "  Total: %s | Usado: %s | Livre: %s (%.2f%%)\n", \$2, \$3, \$4, \$3*100/\$2}'
echo ''
echo 'Disco:'
df -h / | awk 'NR==2{printf "  Total: %s | Usado: %s | Livre: %s (%s)\n", \$2, \$3, \$4, \$5}'
echo ''
echo 'Temperatura:'
vcgencmd measure_temp
"@

# 6. Banco de Dados
Write-Header "🗄️ Banco de Dados"
Execute-Remote @"
if [ -f ~/caderninho-data/caderninho.db ]; then
    echo 'Tamanho: '
    du -h ~/caderninho-data/caderninho.db
    echo ''
    echo 'Última modificação: '
    ls -lh ~/caderninho-data/caderninho.db | awk '{print \$6, \$7, \$8}'
else
    echo 'Banco de dados não encontrado!'
fi
"@

# 7. Registry
Write-Header "🐳 Docker Registry"
Execute-Remote "docker ps --filter name=registry --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

# 8. Imagens
Write-Header "📦 Imagens Docker"
Execute-Remote "docker images | grep caderninho"

# Resumo Final
Write-Header "✅ Resumo"
Write-Host @"

Comandos úteis:

  Ver logs em tempo real:
    ssh $RaspberryPiUser@$RaspberryPiHost 'docker logs -f $ContainerName'

  Reiniciar container:
    ssh $RaspberryPiUser@$RaspberryPiHost 'docker restart $ContainerName'

  Entrar no container:
    ssh $RaspberryPiUser@$RaspberryPiHost 'docker exec -it $ContainerName sh'

  Backup do banco:
    scp $RaspberryPiUser@$RaspberryPiHost`:~/caderninho-data/caderninho.db ./backup.db

  Acessar Swagger:
    http://$RaspberryPiHost`:5000/swagger

"@ -ForegroundColor Yellow

Write-Host "Monitor executado com sucesso! ✨`n" -ForegroundColor Green
