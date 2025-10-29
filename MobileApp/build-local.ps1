#!/usr/bin/env pwsh
# Script de Build Local do APK Android
# Verifica requisitos e compila o APK

param(
    [switch]$SkipChecks,
    [switch]$CopyToApk,
    [string]$RaspberryPiHost = "10.0.0.131",
    [string]$RaspberryPiUser = "frbatist",
    [string]$RaspberryPiPassword,
    [switch]$SkipDeploy
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

Write-Host @"

=============================================
   Build Local APK - Caderninho Financeiro
=============================================

"@ -ForegroundColor Cyan

function Write-Step {
    param([string]$Message)
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

# Função para adicionar ao PATH temporariamente
function Add-ToPath {
    param([string]$Path)
    if (Test-Path $Path) {
        $env:Path = "$Path;$env:Path"
        return $true
    }
    return $false
}

# Verificar Node.js
Write-Host "`n==> Verificando Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] Node.js não instalado!" -ForegroundColor Red
    Write-Host "Baixe em: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar Java JDK
Write-Host "`n==> Verificando Java JDK..." -ForegroundColor Cyan
$javaFound = $false

# Tentar encontrar Java
$javaPaths = @(
    "C:\Program Files\Java\jdk-17",
    "C:\Program Files\Java\jdk-11",
    "C:\Program Files\Microsoft\jdk-17*",
    "C:\Program Files\Microsoft\jdk-11*",
    "C:\Program Files\Eclipse Adoptium\jdk-17*",
    "C:\Program Files\Eclipse Adoptium\jdk-11*"
)

foreach ($path in $javaPaths) {
    $resolved = Get-Item $path -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($resolved) {
        $env:JAVA_HOME = $resolved.FullName
        Add-ToPath "$($resolved.FullName)\bin"
        $javaFound = $true
        break
    }
}

if ($javaFound) {
    try {
        $javaVersion = (java -version 2>&1)[0]
        Write-Host "[OK] Java encontrado: $javaVersion" -ForegroundColor Green
        Write-Host "    JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Gray
    } catch {
        Write-Host "[OK] Java encontrado" -ForegroundColor Green
        Write-Host "    JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Gray
    }
} else {
    Write-Host "[ERRO] Java JDK não encontrado!" -ForegroundColor Red
    Write-Host @"
    
Instale o Java JDK 17:
  
Opção 1 (Recomendado): Microsoft Build of OpenJDK
  https://learn.microsoft.com/java/openjdk/download

Opção 2: Eclipse Temurin (AdoptOpenJDK)
  https://adoptium.net/

Após instalar, execute novamente este script.

"@ -ForegroundColor Yellow
    exit 1
}

# Verificar Android SDK
Write-Host "`n==> Verificando Android SDK..." -ForegroundColor Cyan
$androidHome = $env:ANDROID_HOME
if (-not $androidHome) {
    # Tentar encontrar automaticamente
    $possiblePaths = @(
        "$env:LOCALAPPDATA\Android\Sdk",
        "$env:USERPROFILE\AppData\Local\Android\Sdk",
        "C:\Android\Sdk"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $env:ANDROID_HOME = $path
            $androidHome = $path
            break
        }
    }
}

if ($androidHome -and (Test-Path $androidHome)) {
    Write-Host "[OK] Android SDK encontrado" -ForegroundColor Green
    Write-Host "    ANDROID_HOME: $androidHome" -ForegroundColor Gray
    
    # Adicionar platform-tools ao PATH (para adb)
    Add-ToPath "$androidHome\platform-tools"
    Add-ToPath "$androidHome\build-tools\*" # Pega a versão mais recente
} else {
    Write-Host "[AVISO] Android SDK não encontrado" -ForegroundColor Yellow
    Write-Host @"
    
Instale o Android Studio:
  https://developer.android.com/studio

Após instalar:
  1. Abra o Android Studio
  2. Vá em Tools → SDK Manager
  3. Instale: Android SDK, Build-Tools, Platform-Tools
  4. Configure ANDROID_HOME nas variáveis de ambiente

"@ -ForegroundColor Yellow
}

# Verificar se a pasta android existe
if (-not (Test-Path "android")) {
    Write-Host "`n==> Pasta android não encontrada. Gerando..." -ForegroundColor Cyan
    npx expo prebuild --platform android
}

# Build do APK
Write-Host "`n==> Iniciando build do APK..." -ForegroundColor Cyan
Write-Host "Isso pode levar alguns minutos..." -ForegroundColor Yellow

try {
    Set-Location "android"
    
    # Dar permissão de execução ao gradlew (no caso de WSL/Git Bash)
    if (Test-Path "gradlew") {
        Write-Host "Executando Gradle..." -ForegroundColor Yellow
        .\gradlew assembleRelease --no-daemon
    } else {
        Write-Host "[ERRO] gradlew não encontrado!" -ForegroundColor Red
        exit 1
    }
    
    Set-Location ".."
    
    # Verificar se o APK foi gerado
    $apkPath = "android\app\build\outputs\apk\release\app-release.apk"
    if (Test-Path $apkPath) {
        $apkSize = (Get-Item $apkPath).Length / 1MB
        Write-Host "`n[OK] APK compilado com sucesso!" -ForegroundColor Green
        Write-Host "Tamanho: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Green
        Write-Host "Local: $apkPath" -ForegroundColor Green
        
        # Copiar para a pasta apk/
        if ($CopyToApk) {
            Write-Step "Copiando APK para pasta apk/..."
            
            if (-not (Test-Path "apk")) {
                New-Item -ItemType Directory -Path "apk" | Out-Null
            }
            
            # Ler versão do app.json
            $appJsonPath = Join-Path $PSScriptRoot "app.json"
            $appJson = Get-Content $appJsonPath -Raw | ConvertFrom-Json
            $version = $appJson.expo.version
            
            $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
            $destApk = "apk\caderninho-v$version-$timestamp.apk"
            Copy-Item $apkPath $destApk
            
            Write-Success "APK copiado para: $destApk"
            
            # Deploy no Raspberry Pi (a menos que seja explicitamente pulado)
            if (-not $SkipDeploy) {
                Write-Step "Preparando deploy para Raspberry Pi..."
                
                # Criar metadados latest.json
                $metadata = @{
                    version = $version
                    buildDate = (Get-Date).ToString("o")
                    size = (Get-Item $destApk).Length
                    url = "/apk/$(Split-Path $destApk -Leaf)"
                    fileName = Split-Path $destApk -Leaf
                } | ConvertTo-Json
                
                $metadata | Out-File -FilePath "apk\latest.json" -Encoding UTF8
                
                Write-Step "Fazendo deploy no Raspberry Pi ($RaspberryPiHost)..."
                
                try {
                    # Criar estrutura no Pi
                    Write-Host "Criando diretórios no Raspberry Pi..." -ForegroundColor Yellow
                    ssh "$RaspberryPiUser@$RaspberryPiHost" "mkdir -p ~/caderninho-apk/apk ~/caderninho-apk/updates"
                    
                    # Copiar APK e metadados
                    Write-Host "Copiando APK e metadados..." -ForegroundColor Yellow
                    scp "$destApk" "$RaspberryPiUser@$RaspberryPiHost`:~/caderninho-apk/apk/"
                    scp "apk\latest.json" "$RaspberryPiUser@$RaspberryPiHost`:~/caderninho-apk/apk/"
                    scp "apk\latest.json" "$RaspberryPiUser@$RaspberryPiHost`:~/caderninho-apk/updates/"
                    
                    # Copiar arquivos Docker (se for primeira vez)
                    $dockerDir = Join-Path $PSScriptRoot "docker"
                    if (Test-Path $dockerDir) {
                        Write-Host "Copiando configurações Docker..." -ForegroundColor Yellow
                        scp "$dockerDir\Dockerfile" "$RaspberryPiUser@$RaspberryPiHost`:~/caderninho-apk/"
                        scp "$dockerDir\nginx.conf" "$RaspberryPiUser@$RaspberryPiHost`:~/caderninho-apk/"
                        scp "$dockerDir\index.html" "$RaspberryPiUser@$RaspberryPiHost`:~/caderninho-apk/"
                    }
                    
                    Write-Step "Iniciando/Atualizando container no Raspberry Pi..."
                    
                    $remoteScript = @"
cd ~/caderninho-apk

# Verificar se container existe
if docker ps -a | grep -q caderninho-apk; then
    echo "Container existente encontrado"
    # Se já existe, apenas reinicia (mantém a imagem)
    docker restart caderninho-apk
else
    echo "Criando novo container"
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
fi

sleep 2
docker ps | grep caderninho-apk && echo "" && echo "[OK] Container ativo!"
"@
                    
                    $remoteScript -replace "`r`n", "`n" | ssh "$RaspberryPiUser@$RaspberryPiHost" 'bash -s'
                    
                    Write-Success "Deploy concluído!"
                    Write-Host ""
                    Write-Host "🎉 APK disponível para download:" -ForegroundColor Cyan
                    Write-Host "  📥 http://$RaspberryPiHost:8080" -ForegroundColor Green
                    Write-Host "  📂 http://$RaspberryPiHost:8080/apk/" -ForegroundColor Green
                    Write-Host ""
                    
                } catch {
                    Write-Host "`n[AVISO] Falha no deploy automático: $($_.Exception.Message)" -ForegroundColor Yellow
                    Write-Host "Você pode fazer deploy manual depois com:" -ForegroundColor Yellow
                    Write-Host "  .\build-apk.ps1 -DeployOnly" -ForegroundColor Cyan
                    Write-Host ""
                }
            }
        }
        
        if (-not $CopyToApk) {
            Write-Host @"

==============================================
PRÓXIMOS PASSOS:
==============================================

1. Copiar e fazer deploy automático:
   .\build-local.ps1 -CopyToApk

2. Ou copiar apenas (sem deploy):
   .\build-local.ps1 -CopyToApk -SkipDeploy

3. Instalar manualmente via USB:
   - Copie: $apkPath
   - Transfira para o dispositivo Android

==============================================

"@ -ForegroundColor Cyan
        }
    } else {
        Write-Host "[ERRO] APK não foi gerado!" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "`n[ERRO] Falha no build:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
