# Script de Recuperacao Rapida - Caderninho API
# Execute quando a API estiver com problemas
# .\fix-api.ps1

param(
    [string]$RaspberryPiHost,
    [string]$RaspberryPiUser,
    [string]$RaspberryPiPassword,
    [switch]$RestartOnly,
    [switch]$FullReset
)

$ErrorActionPreference = "Stop"

# Carregar variaveis do arquivo .env se existir
$EnvFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $EnvFile) {
    Write-Host "Carregando configuracoes de .env..." -ForegroundColor Cyan
    Get-Content $EnvFile | ForEach-Object {
        $line = $_.Trim()
        if ($line.Length -gt 0 -and -not $line.StartsWith('#')) {
            if ($line -match '^([A-Z_]+)=(.*)$') {
                $name = $matches[1]
                $value = $matches[2].Trim()
                
                if ($value.StartsWith('"') -and $value.EndsWith('"')) {
                    $value = $value.Substring(1, $value.Length - 2)
                }
                if ($value.StartsWith("'") -and $value.EndsWith("'")) {
                    $value = $value.Substring(1, $value.Length - 2)
                }
                
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

# Valores padrao
if (-not $RaspberryPiHost) { $RaspberryPiHost = "10.0.0.131" }
if (-not $RaspberryPiUser) { $RaspberryPiUser = "pi" }

# Funcao para executar comando remoto
function Invoke-SSH {
    param([string]$Command)
    if ($RaspberryPiPassword) {
        if (Get-Command plink -ErrorAction SilentlyContinue) {
            echo y | plink -batch -pw $RaspberryPiPassword "$RaspberryPiUser@$RaspberryPiHost" $Command
        } else {
            Write-Host "AVISO: plink nao encontrado. Usando SSH (pode pedir senha)..." -ForegroundColor Yellow
            ssh "$RaspberryPiUser@$RaspberryPiHost" $Command
        }
    } else {
        ssh "$RaspberryPiUser@$RaspberryPiHost" $Command
    }
}

Write-Host "Script de Recuperacao da API" -ForegroundColor Cyan
Write-Host ""

if ($RestartOnly) {
    Write-Host "Reiniciando container..." -ForegroundColor Yellow
    Invoke-SSH "docker restart caderninho-api"
    Start-Sleep -Seconds 5
    
    Write-Host "Container reiniciado!" -ForegroundColor Green
    Write-Host "Testando conectividade..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "http://$RaspberryPiHost:5000/health" -TimeoutSec 10 -ErrorAction Stop
        Write-Host "API esta respondendo! Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "API ainda nao esta respondendo. Execute o diagnostico completo." -ForegroundColor Red
    }
    exit
}

if ($FullReset) {
    Write-Host "RESET COMPLETO - Isso ira recriar o container" -ForegroundColor Red
    $confirm = Read-Host "Tem certeza? (S/N)"
    if ($confirm -ne "S" -and $confirm -ne "s") {
        Write-Host "Operacao cancelada." -ForegroundColor Yellow
        exit
    }
    
    Write-Host ""
    Write-Host "1 Parando e removendo container..." -ForegroundColor Yellow
    Invoke-SSH "docker stop caderninho-api 2>/dev/null || true; docker rm caderninho-api 2>/dev/null || true"
    
    Write-Host "2 Baixando imagem mais recente..." -ForegroundColor Yellow
    Invoke-SSH "docker pull 10.0.0.131:5001/caderninho-api:latest"
    
    Write-Host "3 Criando novo container..." -ForegroundColor Yellow
    Invoke-SSH "docker run -d --name caderninho-api --restart unless-stopped -p 5000:8080 -v ~/caderninho-data:/app/data -e ASPNETCORE_ENVIRONMENT=Production -e ConnectionStrings__DefaultConnection='Data Source=/app/data/caderninho.db' 10.0.0.131:5001/caderninho-api:latest"
    
    Write-Host "4 Aguardando inicializacao..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    Write-Host "5 Verificando logs..." -ForegroundColor Yellow
    Invoke-SSH "docker logs --tail 20 caderninho-api"
    
    Write-Host ""
    Write-Host "Reset completo realizado!" -ForegroundColor Green
    exit
}

# Modo interativo
Write-Host "Escolha uma opção:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Ver logs em tempo real" -ForegroundColor White
Write-Host "2. Ver últimos 100 logs" -ForegroundColor White
Write-Host "3. Ver apenas erros" -ForegroundColor White
Write-Host "4. Reiniciar container" -ForegroundColor White
Write-Host "5. Parar container" -ForegroundColor White
Write-Host "6. Iniciar container" -ForegroundColor White
Write-Host "7. Verificar status" -ForegroundColor White
Write-Host "8. Limpar logs de banco de dados (WAL/SHM)" -ForegroundColor White
Write-Host "9. Reset completo (recriar container)" -ForegroundColor White
Write-Host "0. Sair" -ForegroundColor White
Write-Host ""

$option = Read-Host "Digite o número da opção"

switch ($option) {
    "1" {
        Write-Host "Exibindo logs em tempo real (Ctrl+C para sair)..." -ForegroundColor Yellow
        Invoke-SSH "docker logs -f caderninho-api"
    }
    "2" {
        Write-Host "Ultimos 100 logs:" -ForegroundColor Yellow
        Invoke-SSH "docker logs --tail 100 caderninho-api"
    }
    "3" {
        Write-Host "Logs de erro:" -ForegroundColor Yellow
        Invoke-SSH "docker logs caderninho-api 2>&1 | grep -i 'error\|exception\|fail'"
    }
    "4" {
        Write-Host "Reiniciando container..." -ForegroundColor Yellow
        Invoke-SSH "docker restart caderninho-api"
        Write-Host "Container reiniciado!" -ForegroundColor Green
    }
    "5" {
        Write-Host "Parando container..." -ForegroundColor Yellow
        Invoke-SSH "docker stop caderninho-api"
        Write-Host "Container parado!" -ForegroundColor Green
    }
    "6" {
        Write-Host "Iniciando container..." -ForegroundColor Yellow
        Invoke-SSH "docker start caderninho-api"
        Write-Host "Container iniciado!" -ForegroundColor Green
    }
    "7" {
        Write-Host "Status do container:" -ForegroundColor Yellow
        Invoke-SSH "docker ps -a | grep caderninho"
        Write-Host ""
        Write-Host "Uso de recursos:" -ForegroundColor Yellow
        Invoke-SSH "docker stats caderninho-api --no-stream"
    }
    "8" {
        Write-Host "Limpando arquivos WAL/SHM do SQLite..." -ForegroundColor Yellow
        Invoke-SSH "docker stop caderninho-api; rm ~/caderninho-data/*.db-wal 2>/dev/null || true; rm ~/caderninho-data/*.db-shm 2>/dev/null || true; docker start caderninho-api"
        Write-Host "Arquivos limpos e container reiniciado!" -ForegroundColor Green
    }
    "9" {
        Write-Host "Execute novamente com o parametro -FullReset:" -ForegroundColor Yellow
        Write-Host ".\fix-api.ps1 -FullReset" -ForegroundColor White
    }
    "0" {
        Write-Host "Saindo..." -ForegroundColor Yellow
    }
    default {
        Write-Host "Opcao invalida!" -ForegroundColor Red
    }
}
