# Script para baixar banco de dados do Raspberry Pi
# Execute: .\download-db.ps1

param(
    [string]$RaspberryPiHost,
    [string]$RaspberryPiUser,
    [string]$RaspberryPiPassword,
    [string]$OutputPath
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

if (-not $RaspberryPiHost) { $RaspberryPiHost = "10.0.0.131" }
if (-not $RaspberryPiUser) { $RaspberryPiUser = "pi" }

# Definir caminho de saida
if (-not $OutputPath) {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $OutputPath = Join-Path $PSScriptRoot "caderninho_$timestamp.db"
}

Write-Host "Baixando banco de dados do Raspberry Pi" -ForegroundColor Cyan
Write-Host "Host: $RaspberryPiUser@$RaspberryPiHost" -ForegroundColor Yellow
Write-Host "Destino: $OutputPath" -ForegroundColor Yellow
Write-Host ""

# Parar container para evitar corrupcao
Write-Host "1. Parando container temporariamente..." -ForegroundColor Yellow
if ($RaspberryPiPassword) {
    if (Get-Command plink -ErrorAction SilentlyContinue) {
        Write-Output y | plink -batch -pw $RaspberryPiPassword "$RaspberryPiUser@$RaspberryPiHost" "docker stop caderninho-api"
    } else {
        ssh "$RaspberryPiUser@$RaspberryPiHost" "docker stop caderninho-api"
    }
} else {
    ssh "$RaspberryPiUser@$RaspberryPiHost" "docker stop caderninho-api"
}

Write-Host "2. Baixando arquivo..." -ForegroundColor Yellow

# Usar SCP para baixar
if ($RaspberryPiPassword) {
    if (Get-Command pscp -ErrorAction SilentlyContinue) {
        # Usar PSCP (PuTTY SCP) com senha
        Write-Output y | pscp -batch -pw $RaspberryPiPassword "${RaspberryPiUser}@${RaspberryPiHost}:~/caderninho-data/caderninho.db" $OutputPath
    } else {
        Write-Host "AVISO: pscp nao encontrado. Usando scp (pode pedir senha)..." -ForegroundColor Yellow
        scp "${RaspberryPiUser}@${RaspberryPiHost}:~/caderninho-data/caderninho.db" $OutputPath
    }
} else {
    scp "${RaspberryPiUser}@${RaspberryPiHost}:~/caderninho-data/caderninho.db" $OutputPath
}

# Tambem baixar arquivos WAL e SHM se existirem
Write-Host "3. Verificando arquivos auxiliares (WAL/SHM)..." -ForegroundColor Yellow
$walPath = $OutputPath -replace '\.db$', '.db-wal'
$shmPath = $OutputPath -replace '\.db$', '.db-shm'

if ($RaspberryPiPassword) {
    if (Get-Command pscp -ErrorAction SilentlyContinue) {
        Write-Output y | pscp -batch -pw $RaspberryPiPassword "${RaspberryPiUser}@${RaspberryPiHost}:~/caderninho-data/caderninho.db-wal" $walPath 2>$null
        Write-Output y | pscp -batch -pw $RaspberryPiPassword "${RaspberryPiUser}@${RaspberryPiHost}:~/caderninho-data/caderninho.db-shm" $shmPath 2>$null
    } else {
        scp "${RaspberryPiUser}@${RaspberryPiHost}:~/caderninho-data/caderninho.db-wal" $walPath 2>$null
        scp "${RaspberryPiUser}@${RaspberryPiHost}:~/caderninho-data/caderninho.db-shm" $shmPath 2>$null
    }
} else {
    scp "${RaspberryPiUser}@${RaspberryPiHost}:~/caderninho-data/caderninho.db-wal" $walPath 2>$null
    scp "${RaspberryPiUser}@${RaspberryPiHost}:~/caderninho-data/caderninho.db-shm" $shmPath 2>$null
}

Write-Host "4. Reiniciando container..." -ForegroundColor Yellow
if ($RaspberryPiPassword) {
    if (Get-Command plink -ErrorAction SilentlyContinue) {
        Write-Output y | plink -batch -pw $RaspberryPiPassword "$RaspberryPiUser@$RaspberryPiHost" "docker start caderninho-api"
    } else {
        ssh "$RaspberryPiUser@$RaspberryPiHost" "docker start caderninho-api"
    }
} else {
    ssh "$RaspberryPiUser@$RaspberryPiHost" "docker start caderninho-api"
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Download concluido!" -ForegroundColor Green
Write-Host ""

if (Test-Path $OutputPath) {
    $fileInfo = Get-Item $OutputPath
    Write-Host "Arquivo: $OutputPath" -ForegroundColor White
    Write-Host "Tamanho: $([math]::Round($fileInfo.Length / 1KB, 2)) KB" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Para inspecionar o banco, voce pode:" -ForegroundColor Yellow
    Write-Host "1. Usar DB Browser for SQLite: https://sqlitebrowser.org/dl/" -ForegroundColor White
    Write-Host "2. Usar VS Code com extensao SQLite" -ForegroundColor White
    Write-Host "3. Usar linha de comando: sqlite3 $OutputPath" -ForegroundColor White
    Write-Host ""
    
    # Tentar mostrar info basica
    Write-Host "Informacoes basicas:" -ForegroundColor Cyan
    if (Get-Command sqlite3 -ErrorAction SilentlyContinue) {
        Write-Host "Tabelas no banco:" -ForegroundColor Yellow
        sqlite3 $OutputPath ".tables"
        Write-Host ""
        Write-Host "Migrations aplicadas:" -ForegroundColor Yellow
        sqlite3 $OutputPath "SELECT MigrationId FROM __EFMigrationsHistory;" 2>$null
    } else {
        Write-Host "  Instale sqlite3 para ver mais detalhes" -ForegroundColor Gray
        Write-Host "  winget install -e --id SQLite.SQLite" -ForegroundColor Gray
    }
} else {
    Write-Host "Erro: Arquivo nao foi baixado!" -ForegroundColor Red
}

Write-Host "===========================================" -ForegroundColor Cyan
