# Script para localizar banco de dados no Raspberry Pi
# Execute: .\find-db.ps1

param(
    [string]$RaspberryPiHost,
    [string]$RaspberryPiUser,
    [string]$RaspberryPiPassword
)

$ErrorActionPreference = "Stop"

# Carregar variaveis do arquivo .env
$EnvFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        $line = $_.Trim()
        if ($line.Length -gt 0 -and -not $line.StartsWith('#')) {
            if ($line -match '^([A-Z_]+)=(.*)$') {
                $name = $matches[1]
                $value = $matches[2].Trim().Trim('"').Trim("'")
                
                switch ($name) {
                    "RASPBERRY_PI_HOST" { if (-not $RaspberryPiHost) { $script:RaspberryPiHost = $value } }
                    "RASPBERRY_PI_USER" { if (-not $RaspberryPiUser) { $script:RaspberryPiUser = $value } }
                    "RASPBERRY_PI_PASSWORD" { if (-not $RaspberryPiPassword) { $script:RaspberryPiPassword = $value } }
                }
            }
        }
    }
}

if (-not $RaspberryPiHost) { $RaspberryPiHost = "10.0.0.131" }
if (-not $RaspberryPiUser) { $RaspberryPiUser = "pi" }

function Invoke-SSH {
    param([string]$Command)
    if ($RaspberryPiPassword -and (Get-Command plink -ErrorAction SilentlyContinue)) {
        Write-Output y | plink -batch -pw $RaspberryPiPassword "$RaspberryPiUser@$RaspberryPiHost" $Command
    } else {
        ssh "$RaspberryPiUser@$RaspberryPiHost" $Command
    }
}

Write-Host "Procurando banco de dados no Raspberry Pi..." -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Verificando diretorio home do usuario:" -ForegroundColor Yellow
Invoke-SSH "ls -lah ~/ | grep caderninho"

Write-Host ""
Write-Host "2. Verificando diretorio caderninho-data:" -ForegroundColor Yellow
Invoke-SSH "ls -lah ~/caderninho-data/ 2>/dev/null || echo 'Diretorio nao existe'"

Write-Host ""
Write-Host "3. Verificando volumes do Docker:" -ForegroundColor Yellow
Invoke-SSH "docker inspect caderninho-api 2>/dev/null | grep -A 5 Mounts || echo 'Container nao encontrado'"

Write-Host ""
Write-Host "4. Procurando arquivos .db:" -ForegroundColor Yellow
Invoke-SSH "find ~ -name '*.db' -type f 2>/dev/null | head -20"

Write-Host ""
Write-Host "5. Verificando dentro do container:" -ForegroundColor Yellow
Invoke-SSH "docker exec caderninho-api ls -lah /app/data/ 2>/dev/null || echo 'Container nao esta rodando'"

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
