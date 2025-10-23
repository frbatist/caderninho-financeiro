#!/usr/bin/env pwsh
# Script de Build Local do APK Android
# Verifica requisitos e compila o APK

param(
    [switch]$SkipChecks,
    [switch]$CopyToApk
)

$ErrorActionPreference = "Stop"

Write-Host @"

=============================================
   Build Local APK - Caderninho Financeiro
=============================================

"@ -ForegroundColor Cyan

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
            Write-Host "`n==> Copiando APK para pasta apk/..." -ForegroundColor Cyan
            
            if (-not (Test-Path "apk")) {
                New-Item -ItemType Directory -Path "apk" | Out-Null
            }
            
            $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
            $destApk = "apk\caderninho-$timestamp.apk"
            Copy-Item $apkPath $destApk
            
            Write-Host "[OK] APK copiado para: $destApk" -ForegroundColor Green
        }
        
        Write-Host @"

==============================================
PRÓXIMOS PASSOS:
==============================================

1. Transferir APK para o dispositivo Android:
   - Via cabo USB: copie o arquivo $apkPath
   - Via rede: use o servidor NGINX (copie para apk/)

2. Instalar no dispositivo:
   - Localize o arquivo .apk no dispositivo
   - Toque para instalar
   - Permita instalação de fontes desconhecidas

3. Build rápido para próximas vezes:
   .\build-local.ps1 -CopyToApk

==============================================

"@ -ForegroundColor Cyan
    } else {
        Write-Host "[ERRO] APK não foi gerado!" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "`n[ERRO] Falha no build:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
