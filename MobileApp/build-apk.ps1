#!/usr/bin/env pwsh
# Script de Build e Deploy do APK Android
# Autor: Caderninho Financeiro

param(
    [string]$RaspberryPiHost = "10.0.0.131",
    [string]$RaspberryPiUser = "frbatist",
    [string]$RaspberryPiPassword,
    [switch]$BuildOnly,
    [switch]$DeployOnly,
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

# Carregar .env se existir (na pasta Api/CaderninhoApi)
$EnvFile = Join-Path (Join-Path (Join-Path (Split-Path $PSScriptRoot -Parent) "Api") "CaderninhoApi") ".env"
if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        $line = $_.Trim()
        if ($line.Length -gt 0 -and -not $line.StartsWith('#')) {
            if ($line -match '^([A-Z_]+)=(.*)$') {
                $name = $matches[1]
                $value = $matches[2].Trim()
                if ($value.StartsWith('"') -and $value.EndsWith('"')) {
                    $value = $value.Substring(1, $value.Length - 2)
                }
                if ($name -eq "RASPBERRY_PI_HOST" -and -not $RaspberryPiHost) { $script:RaspberryPiHost = $value }
                if ($name -eq "RASPBERRY_PI_USER" -and -not $RaspberryPiUser) { $script:RaspberryPiUser = $value }
                if ($name -eq "RASPBERRY_PI_PASSWORD" -and -not $RaspberryPiPassword) { $script:RaspberryPiPassword = $value }
            }
        }
    }
}

function Write-Step {
    param([string]$Message)
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host "[ERRO] $Message" -ForegroundColor Red
}

function Update-AppVersion {
    Write-Step "Incrementando versão do app..."
    
    $appJsonPath = Join-Path $PSScriptRoot "app.json"
    $appJson = Get-Content $appJsonPath -Raw | ConvertFrom-Json
    
    # Incrementa versionCode
    $currentVersionCode = $appJson.expo.android.versionCode
    $newVersionCode = $currentVersionCode + 1
    $appJson.expo.android.versionCode = $newVersionCode
    
    # Incrementa versão (patch version)
    $currentVersion = $appJson.expo.version
    $versionParts = $currentVersion.Split('.')
    $versionParts[2] = [int]$versionParts[2] + 1
    $newVersion = $versionParts -join '.'
    $appJson.expo.version = $newVersion
    
    # Atualiza updateService.ts
    $updateServicePath = Join-Path $PSScriptRoot "src\services\updateService.ts"
    if (Test-Path $updateServicePath) {
        $updateServiceContent = Get-Content $updateServicePath -Raw
        $updateServiceContent = $updateServiceContent -replace "const CURRENT_VERSION = '[^']+';", "const CURRENT_VERSION = '$newVersion';"
        Set-Content -Path $updateServicePath -Value $updateServiceContent -NoNewline
    }
    
    # Salva app.json
    $appJson | ConvertTo-Json -Depth 10 | Set-Content $appJsonPath
    
    Write-Success "Versão atualizada: $currentVersion -> $newVersion (versionCode: $currentVersionCode -> $newVersionCode)"
    
    return $newVersion
}

Write-Host @"

=============================================
    Caderninho Financeiro - Build APK
         Android Application
=============================================

"@ -ForegroundColor Cyan

# Verificar se está na pasta correta
if (-not (Test-Path "package.json")) {
    Write-ErrorMsg "Execute este script da pasta MobileApp!"
    exit 1
}

# Build do APK
if (-not $DeployOnly) {
    # Incrementar versão antes do build
    if (-not $SkipBuild) {
        $newVersion = Update-AppVersion
    }
    
    Write-Step "Verificando dependências..."
    
    # Verificar se Node.js está instalado
    try {
        $nodeVersion = node --version
        Write-Success "Node.js $nodeVersion instalado"
    } catch {
        Write-ErrorMsg "Node.js não está instalado!"
        Write-Host "Instale em: https://nodejs.org/"
        exit 1
    }
    
    # Verificar se EAS CLI está instalado
    try {
        $easVersion = eas --version
        Write-Success "EAS CLI $easVersion instalado"
    } catch {
        Write-Host "EAS CLI não encontrado. Instalando..." -ForegroundColor Yellow
        npm install -g eas-cli
    }
    
    if (-not $SkipBuild) {
        Write-Step "Fazendo login no Expo..."
        Write-Host "Você precisará fazer login com sua conta Expo" -ForegroundColor Yellow
        Write-Host "Se não tiver conta, crie em: https://expo.dev/signup" -ForegroundColor Yellow
        Write-Host ""
        
        # Verificar se já está logado
        try {
            $whoami = eas whoami 2>&1
            if ($whoami -match "Not logged in") {
                eas login
            } else {
                Write-Success "Já está logado no Expo"
            }
        } catch {
            eas login
        }
        
        Write-Step "Configurando projeto..."
        if (-not (Test-Path "eas.json")) {
            eas build:configure
        }
        
        Write-Step "Iniciando build do APK..."
        Write-Host "Isso pode demorar 10-15 minutos..." -ForegroundColor Yellow
        Write-Host "O Expo vai perguntar sobre keystore na primeira vez." -ForegroundColor Yellow
        Write-Host "Escolha: 'Generate new keystore' (Expo gerencia para você)" -ForegroundColor Cyan
        Write-Host ""
        
        # Build APK (preview profile) - sem --non-interactive para permitir keystore
        eas build --platform android --profile preview
        
        Write-Success "Build concluído!"
        Write-Host ""
        Write-Host "Download do APK:" -ForegroundColor Cyan
        Write-Host "  1. Acesse: https://expo.dev/accounts/[seu-usuario]/projects/caderninho-financeiro/builds"
        Write-Host "  2. Baixe o APK mais recente"
        Write-Host "  3. Coloque na pasta MobileApp/apk/"
        Write-Host ""
    }
}

# Deploy para Raspberry Pi
if (-not $BuildOnly -and -not $DeployOnly) {
    Write-Host ""
    $continue = Read-Host "Deseja fazer deploy no Raspberry Pi? (s/N)"
    if ($continue -ne "s" -and $continue -ne "S") {
        Write-Host "Deploy cancelado."
        exit 0
    }
}

if (-not $BuildOnly) {
    Write-Step "Preparando deploy para Raspberry Pi..."
    
    # Verificar se existem APKs
    $apkDir = Join-Path $PSScriptRoot "apk"
    if (-not (Test-Path $apkDir)) {
        New-Item -ItemType Directory -Path $apkDir | Out-Null
        Write-Host "Pasta apk/ criada. Coloque seus APKs aqui." -ForegroundColor Yellow
    }
    
    $apks = Get-ChildItem -Path $apkDir -Filter "*.apk" -ErrorAction SilentlyContinue
    if ($apks.Count -eq 0) {
        Write-ErrorMsg "Nenhum APK encontrado em apk/"
        Write-Host "Baixe o APK do Expo e coloque em MobileApp/apk/"
        exit 1
    }
    
    Write-Host "APKs encontrados:" -ForegroundColor Green
    $apks | ForEach-Object { Write-Host "  - $($_.Name) ($([math]::Round($_.Length/1MB, 2)) MB)" }
    
    Write-Step "Criando metadados..."
    
    # Criar latest.json
    $latestApk = $apks | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    $version = "1.0.0"
    if ($latestApk.Name -match "(\d+\.\d+\.\d+)") {
        $version = $matches[1]
    }
    
    $metadata = @{
        version = $version
        buildDate = $latestApk.LastWriteTime.ToString("o")
        size = $latestApk.Length
        url = "/apk/$($latestApk.Name)"
        fileName = $latestApk.Name
    } | ConvertTo-Json
    
    $metadata | Out-File -FilePath (Join-Path $apkDir "latest.json") -Encoding UTF8
    
    Write-Step "Fazendo deploy no Raspberry Pi..."
    
    # Copiar arquivos via SCP
    Write-Host "Copiando arquivos..."
    
    # Criar estrutura no Pi
    $sshCmd = "ssh"
    if ($RaspberryPiPassword) {
        if (Get-Command plink -ErrorAction SilentlyContinue) {
            $sshCmd = "plink"
            plink -ssh -pw $RaspberryPiPassword "$RaspberryPiUser@$RaspberryPiHost" "mkdir -p ~/caderninho-apk/apk ~/caderninho-apk/updates"
        } else {
            ssh "$RaspberryPiUser@$RaspberryPiHost" "mkdir -p ~/caderninho-apk/apk ~/caderninho-apk/updates"
        }
    } else {
        ssh "$RaspberryPiUser@$RaspberryPiHost" "mkdir -p ~/caderninho-apk/apk ~/caderninho-apk/updates"
    }
    
    # Copiar APKs e metadados
    scp -r "$apkDir/*" "$RaspberryPiUser@$RaspberryPiHost`:~/caderninho-apk/apk/"
    scp (Join-Path $apkDir "latest.json") "$RaspberryPiUser@$RaspberryPiHost`:~/caderninho-apk/updates/"
    
    # Copiar arquivos Docker
    $dockerDir = Join-Path $PSScriptRoot "docker"
    scp "$dockerDir/Dockerfile" "$RaspberryPiUser@$RaspberryPiHost`:~/caderninho-apk/"
    scp "$dockerDir/nginx.conf" "$RaspberryPiUser@$RaspberryPiHost`:~/caderninho-apk/"
    scp "$dockerDir/index.html" "$RaspberryPiUser@$RaspberryPiHost`:~/caderninho-apk/"
    
    Write-Step "Iniciando container no Raspberry Pi..."
    
    $piHost = $RaspberryPiHost
    $remoteScript = @"
cd ~/caderninho-apk

# Parar container existente
docker stop caderninho-apk 2>/dev/null || true
docker rm caderninho-apk 2>/dev/null || true

# Build da imagem
docker build -t caderninho-apk:latest .

# Iniciar container
docker run -d \
  --name caderninho-apk \
  --restart unless-stopped \
  -p 8080:8080 \
  -v ~/caderninho-apk/apk:/usr/share/nginx/html/apk \
  -v ~/caderninho-apk/updates:/usr/share/nginx/html/updates \
  caderninho-apk:latest

echo "Aguardando 3 segundos..."
sleep 3

# Verificar status
docker ps | grep caderninho-apk

echo ""
echo "[OK] Deploy concluído!"
echo "Acesse: http://$piHost:8080"
"@
    
    $tempScript = New-TemporaryFile
    $remoteScript -replace "`r`n", "`n" | Out-File -FilePath $tempScript.FullName -Encoding UTF8 -NoNewline
    
    if ($RaspberryPiPassword -and (Get-Command plink -ErrorAction SilentlyContinue)) {
        Get-Content $tempScript.FullName -Raw | plink -ssh -pw $RaspberryPiPassword "$RaspberryPiUser@$RaspberryPiHost" 'bash -s'
    } else {
        Get-Content $tempScript.FullName -Raw | ssh "$RaspberryPiUser@$RaspberryPiHost" 'bash -s'
    }
    
    Remove-Item $tempScript.FullName
    
    Write-Success "Deploy concluído!"
    Write-Host ""
    Write-Host "Acesse:" -ForegroundColor Cyan
    Write-Host "  Download: http://$RaspberryPiHost:8080" -ForegroundColor Green
    Write-Host "  APKs: http://$RaspberryPiHost:8080/apk/" -ForegroundColor Green
    Write-Host ""
}

Write-Host ""
Write-Host "Comandos úteis:" -ForegroundColor Cyan
Write-Host "  Ver logs: ssh $RaspberryPiUser@$RaspberryPiHost 'docker logs -f caderninho-apk'"
Write-Host "  Adicionar APK: Copie para MobileApp/apk/ e execute: .\build-apk.ps1 -DeployOnly"
Write-Host ""
Write-Success "Concluído!"
