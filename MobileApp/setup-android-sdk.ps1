# Script para instalar Android SDK Command Line Tools automaticamente
# Isso evita ter que instalar o Android Studio completo

param(
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host @"

=============================================
  Android SDK Setup - Caderninho Financeiro
=============================================

"@ -ForegroundColor Cyan

$sdkPath = "$env:LOCALAPPDATA\Android\Sdk"
$cmdlineToolsUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
$tempZip = "$env:TEMP\commandlinetools.zip"

Write-Host "`n==> Verificando Android SDK..." -ForegroundColor Cyan

if ((Test-Path $sdkPath) -and -not $Force) {
    Write-Host "[OK] Android SDK já existe em: $sdkPath" -ForegroundColor Green
    Write-Host "Use -Force para reinstalar" -ForegroundColor Yellow
    exit 0
}

Write-Host "Instalando Android SDK em: $sdkPath" -ForegroundColor Yellow
Write-Host "Isso vai baixar ~150MB..." -ForegroundColor Yellow

# Criar diretório
New-Item -ItemType Directory -Force -Path $sdkPath | Out-Null
New-Item -ItemType Directory -Force -Path "$sdkPath\cmdline-tools" | Out-Null

# Baixar Command Line Tools
Write-Host "`n==> Baixando Android Command Line Tools..." -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri $cmdlineToolsUrl -OutFile $tempZip -UseBasicParsing
    Write-Host "[OK] Download concluído" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] Falha no download: $_" -ForegroundColor Red
    exit 1
}

# Extrair
Write-Host "`n==> Extraindo..." -ForegroundColor Cyan
Expand-Archive -Path $tempZip -DestinationPath "$sdkPath\cmdline-tools" -Force

# Renomear pasta corretamente
if (Test-Path "$sdkPath\cmdline-tools\cmdline-tools") {
    if (Test-Path "$sdkPath\cmdline-tools\latest") {
        Remove-Item "$sdkPath\cmdline-tools\latest" -Recurse -Force
    }
    Move-Item "$sdkPath\cmdline-tools\cmdline-tools" "$sdkPath\cmdline-tools\latest"
}

# Limpar
Remove-Item $tempZip -Force

# Instalar pacotes necessários
Write-Host "`n==> Instalando Android SDK packages..." -ForegroundColor Cyan
Write-Host "Isso pode demorar alguns minutos..." -ForegroundColor Yellow

$sdkManager = "$sdkPath\cmdline-tools\latest\bin\sdkmanager.bat"

if (Test-Path $sdkManager) {
    # Aceitar licenças
    Write-Host "y" | & $sdkManager --licenses 2>&1 | Out-Null
    
    # Instalar pacotes essenciais
    & $sdkManager "platform-tools" "platforms;android-34" "build-tools;34.0.0" 2>&1 | Out-Null
    
    Write-Host "[OK] SDK instalado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "[ERRO] sdkmanager não encontrado!" -ForegroundColor Red
    exit 1
}

# Criar local.properties
Write-Host "`n==> Configurando local.properties..." -ForegroundColor Cyan
$localPropsPath = Join-Path $PSScriptRoot "android\local.properties"
$sdkPathEscaped = $sdkPath -replace '\\', '\\'
"sdk.dir=$sdkPathEscaped" | Out-File -FilePath $localPropsPath -Encoding ASCII
Write-Host "[OK] Arquivo criado: $localPropsPath" -ForegroundColor Green

# Configurar variável de ambiente
Write-Host "`n==> Configurando ANDROID_HOME..." -ForegroundColor Cyan
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $sdkPath, "User")
$env:ANDROID_HOME = $sdkPath
Write-Host "[OK] ANDROID_HOME=$sdkPath" -ForegroundColor Green

Write-Host @"

=============================================
[OK] Android SDK instalado com sucesso!
=============================================

Localização: $sdkPath

Agora você pode executar:
  .\build-local.ps1 -CopyToApk

"@ -ForegroundColor Green
