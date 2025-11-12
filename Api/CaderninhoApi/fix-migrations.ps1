# Script para corrigir problema de migrations no Raspberry Pi
# Execute: .\fix-migrations.ps1

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

function Invoke-SSH {
    param([string]$Command)
    if ($RaspberryPiPassword) {
        if (Get-Command plink -ErrorAction SilentlyContinue) {
            echo y | plink -batch -pw $RaspberryPiPassword "$RaspberryPiUser@$RaspberryPiHost" $Command
        } else {
            ssh "$RaspberryPiUser@$RaspberryPiHost" $Command
        }
    } else {
        ssh "$RaspberryPiUser@$RaspberryPiHost" $Command
    }
}

Write-Host "Corrigindo problema de migrations no banco de dados" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Parando container..." -ForegroundColor Yellow
Invoke-SSH "docker stop caderninho-api"

Write-Host "2. Fazendo backup do banco de dados..." -ForegroundColor Yellow
$backupName = "caderninho_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').db"
Invoke-SSH "cp ~/caderninho-data/caderninho.db ~/caderninho-data/$backupName"
Write-Host "Backup criado: $backupName" -ForegroundColor Green

Write-Host "3. Verificando tabela __EFMigrationsHistory..." -ForegroundColor Yellow
$migrationsCheck = Invoke-SSH "docker run --rm -v ~/caderninho-data:/data alpine/sqlite:latest sqlite3 /data/caderninho.db 'SELECT name FROM sqlite_master WHERE type=\"table\" AND name=\"__EFMigrationsHistory\";'"

if ($migrationsCheck -like "*__EFMigrationsHistory*") {
    Write-Host "Tabela de migrations existe. Verificando registros..." -ForegroundColor Yellow
    
    # Mostrar migrations aplicadas
    Write-Host ""
    Write-Host "Migrations aplicadas:" -ForegroundColor Cyan
    Invoke-SSH "docker run --rm -v ~/caderninho-data:/data alpine/sqlite:latest sqlite3 /data/caderninho.db 'SELECT MigrationId FROM __EFMigrationsHistory;'"
    Write-Host ""
    
    Write-Host "Opcoes:" -ForegroundColor Yellow
    Write-Host "1. Marcar migration atual como aplicada (resolver conflito)" -ForegroundColor White
    Write-Host "2. Limpar todas as migrations e recriar banco (PERDA DE DADOS)" -ForegroundColor White
    Write-Host "3. Remover apenas a ultima migration" -ForegroundColor White
    Write-Host "0. Cancelar" -ForegroundColor White
    Write-Host ""
    
    $option = Read-Host "Escolha uma opcao"
    
    switch ($option) {
        "1" {
            Write-Host ""
            Write-Host "Marcando migration '20251029195228_AddCardInvoiceNameToEstablishment' como aplicada..." -ForegroundColor Yellow
            Invoke-SSH "docker run --rm -v ~/caderninho-data:/data alpine/sqlite:latest sqlite3 /data/caderninho.db `"INSERT OR IGNORE INTO __EFMigrationsHistory (MigrationId, ProductVersion) VALUES ('20251029195228_AddCardInvoiceNameToEstablishment', '9.0.9');`""
            Write-Host "Migration marcada como aplicada!" -ForegroundColor Green
        }
        "2" {
            Write-Host ""
            Write-Host "ATENCAO: Isso vai deletar todos os dados!" -ForegroundColor Red
            $confirm = Read-Host "Tem certeza? Digite 'DELETAR' para confirmar"
            
            if ($confirm -eq "DELETAR") {
                Write-Host "Deletando banco de dados..." -ForegroundColor Yellow
                Invoke-SSH "rm ~/caderninho-data/caderninho.db ~/caderninho-data/*.db-wal ~/caderninho-data/*.db-shm 2>/dev/null || true"
                Write-Host "Banco deletado. Sera recriado na proxima inicializacao." -ForegroundColor Green
            } else {
                Write-Host "Operacao cancelada." -ForegroundColor Yellow
                exit
            }
        }
        "3" {
            Write-Host ""
            Write-Host "Removendo ultima migration..." -ForegroundColor Yellow
            Invoke-SSH "docker run --rm -v ~/caderninho-data:/data alpine/sqlite:latest sqlite3 /data/caderninho.db `"DELETE FROM __EFMigrationsHistory WHERE MigrationId = '20251029195228_AddCardInvoiceNameToEstablishment';`""
            Write-Host "Migration removida!" -ForegroundColor Green
        }
        default {
            Write-Host "Operacao cancelada." -ForegroundColor Yellow
            exit
        }
    }
} else {
    Write-Host "Tabela __EFMigrationsHistory nao encontrada. O banco sera inicializado corretamente." -ForegroundColor Green
}

Write-Host ""
Write-Host "4. Iniciando container..." -ForegroundColor Yellow
Invoke-SSH "docker start caderninho-api"

Write-Host "5. Aguardando inicializacao (15 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "6. Verificando logs..." -ForegroundColor Yellow
Write-Host ""
Invoke-SSH "docker logs --tail 30 caderninho-api"

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Correcao concluida!" -ForegroundColor Green
Write-Host ""
Write-Host "Se ainda houver erros, execute:" -ForegroundColor Yellow
Write-Host "  .\diagnose.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Backup salvo em: ~/caderninho-data/$backupName" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
