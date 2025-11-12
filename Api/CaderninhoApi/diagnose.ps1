# Script de Diagnostico - Caderninho API no Raspberry Pi
# Execute: .\diagnose.ps1

param(
    [string]$RaspberryPiHost,
    [string]$RaspberryPiUser,
    [string]$RaspberryPiPassword
)

$ErrorActionPreference = "Stop"

# Carregar variaveis do arquivo .env se existir
$EnvFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $EnvFile) {
    Write-Host "Carregando configuracoes de .env..." -ForegroundColor Cyan
    Get-Content $EnvFile | ForEach-Object {
        $line = $_.Trim()
        # Ignorar linhas vazias e comentarios
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
                
                # Mapear variaveis do .env para variaveis do script
                switch ($name) {
                    "RASPBERRY_PI_HOST" { if (-not $RaspberryPiHost) { $script:RaspberryPiHost = $value } }
                    "RASPBERRY_PI_USER" { if (-not $RaspberryPiUser) { $script:RaspberryPiUser = $value } }
                    "RASPBERRY_PI_PASSWORD" { if (-not $RaspberryPiPassword) { $script:RaspberryPiPassword = $value } }
                }
            }
        }
    }
    Write-Host ""
}

# Valores padrao se nao foram definidos
if (-not $RaspberryPiHost) { $RaspberryPiHost = "10.0.0.131" }
if (-not $RaspberryPiUser) { $RaspberryPiUser = "pi" }

Write-Host "Diagnostico da API no Raspberry Pi" -ForegroundColor Cyan
Write-Host "Host: $RaspberryPiUser@$RaspberryPiHost" -ForegroundColor Yellow
Write-Host ""

# Funcao para executar comando remoto
function Invoke-RemoteCommand {
    param([string]$Command, [string]$Description)
    Write-Host "$Description" -ForegroundColor Green
    Write-Host "-----------------------------------------" -ForegroundColor DarkGray
    
    if ($RaspberryPiPassword) {
        # Usar plink (PuTTY) no Windows com senha
        if (Get-Command plink -ErrorAction SilentlyContinue) {
            echo y | plink -batch -pw $RaspberryPiPassword "$RaspberryPiUser@$RaspberryPiHost" $Command
        } else {
            # Fallback para SSH normal (requer chave configurada)
            Write-Host "AVISO: plink nao encontrado. Usando SSH (pode pedir senha)..." -ForegroundColor Yellow
            ssh "$RaspberryPiUser@$RaspberryPiHost" $Command
        }
    } else {
        ssh "$RaspberryPiUser@$RaspberryPiHost" $Command
    }
    Write-Host ""
}

# 1. Verificar se o container está rodando
Invoke-RemoteCommand "docker ps -a | grep caderninho" "Status do Container"

# 2. Verificar logs recentes
Write-Host "Logs Recentes (ultimas 50 linhas)" -ForegroundColor Green
Write-Host "-----------------------------------------" -ForegroundColor DarkGray
if ($RaspberryPiPassword) {
    if (Get-Command plink -ErrorAction SilentlyContinue) {
        echo y | plink -batch -pw $RaspberryPiPassword "$RaspberryPiUser@$RaspberryPiHost" "docker logs --tail 50 caderninho-api 2>&1"
    } else {
        ssh "$RaspberryPiUser@$RaspberryPiHost" "docker logs --tail 50 caderninho-api 2>&1"
    }
} else {
    ssh "$RaspberryPiUser@$RaspberryPiHost" "docker logs --tail 50 caderninho-api 2>&1"
}
Write-Host ""

# 3. Verificar uso de recursos
Invoke-RemoteCommand "docker stats caderninho-api --no-stream" "Uso de Recursos"

# 4. Verificar memória do sistema
Invoke-RemoteCommand "free -h" "Memoria do Sistema"

# 5. Verificar espaço em disco
Invoke-RemoteCommand "df -h" "Espaco em Disco"

# 6. Verificar se a porta está aberta
Invoke-RemoteCommand "ss -tulpn | grep 5000" "Porta 5000"

# 7. Verificar processos do Docker
Invoke-RemoteCommand "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'" "Containers Ativos"

# 8. Verificar banco de dados
Invoke-RemoteCommand "ls -lh ~/caderninho-data/" "Arquivos do Banco de Dados"

# 9. Testar conectividade da API
Write-Host "Teste de Conectividade" -ForegroundColor Green
Write-Host "-----------------------------------------" -ForegroundColor DarkGray
try {
    $response = Invoke-WebRequest -Uri "http://$RaspberryPiHost:5000/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "API respondendo: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "API nao esta respondendo: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 10. Verificar imagem Docker
Invoke-RemoteCommand "docker images | grep caderninho" "Imagens Docker"

# 11. Verificar temperatura (importante no Raspberry Pi)
Invoke-RemoteCommand "vcgencmd measure_temp" "Temperatura do CPU"

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "COMANDOS UTEIS PARA INVESTIGACAO:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Ver logs completos:" -ForegroundColor White
Write-Host "  ssh $RaspberryPiUser@$RaspberryPiHost 'docker logs -f caderninho-api'" -ForegroundColor Gray
Write-Host ""
Write-Host "Ver logs de erro:" -ForegroundColor White
Write-Host "  ssh $RaspberryPiUser@$RaspberryPiHost 'docker logs caderninho-api 2>&1 | grep -i error'" -ForegroundColor Gray
Write-Host ""
Write-Host "Entrar no container:" -ForegroundColor White
Write-Host "  ssh $RaspberryPiUser@$RaspberryPiHost 'docker exec -it caderninho-api sh'" -ForegroundColor Gray
Write-Host ""
Write-Host "Reiniciar container:" -ForegroundColor White
Write-Host "  ssh $RaspberryPiUser@$RaspberryPiHost 'docker restart caderninho-api'" -ForegroundColor Gray
Write-Host ""
Write-Host "Ver variaveis de ambiente:" -ForegroundColor White
Write-Host "  ssh $RaspberryPiUser@$RaspberryPiHost 'docker inspect caderninho-api | grep -A 20 Env'" -ForegroundColor Gray
Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
