#!/usr/bin/env pwsh
# Script de Deploy para Raspberry Pi 3
# Autor: Caderninho Financeiro
# Data: 2025-10-22

param(
    [string]$RegistryHost,
    [string]$ImageName,
    [string]$Tag,
    [string]$ContainerName,
    [int]$Port,
    [string]$RaspberryPiHost,
    [string]$RaspberryPiUser,
    [string]$RaspberryPiPassword,
    [switch]$SkipBuild,
    [switch]$SkipPush,
    [switch]$RemoteDeploy
)

$ErrorActionPreference = "Stop"

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
                    "REGISTRY_HOST" { if (-not $RegistryHost) { $script:RegistryHost = $value } }
                    "CONTAINER_NAME" { if (-not $ContainerName) { $script:ContainerName = $value } }
                    "CONTAINER_PORT" { if (-not $Port) { $script:Port = [int]$value } }
                    "IMAGE_NAME" { if (-not $ImageName) { $script:ImageName = $value } }
                    "IMAGE_TAG" { if (-not $Tag) { $script:Tag = $value } }
                }
                
                Write-Host "  OK $name carregado" -ForegroundColor Green
            }
        }
    }
}

# Valores padrão se não foram definidos
if (-not $RegistryHost) { $RegistryHost = "10.0.0.131:5001" }
if (-not $ImageName) { $ImageName = "caderninho-api" }
if (-not $Tag) { $Tag = "latest" }
if (-not $ContainerName) { $ContainerName = "caderninho-api" }
if (-not $Port) { $Port = 5000 }
if (-not $RaspberryPiHost) { $RaspberryPiHost = "10.0.0.131" }
if (-not $RaspberryPiUser) { $RaspberryPiUser = "frbatist" }

# Verificar se senha foi informada quando RemoteDeploy está ativo
if ($RemoteDeploy -and -not $RaspberryPiPassword) {
    Write-Host ""
    Write-Host "ERRO: Senha do Raspberry Pi não foi informada!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Opções:" -ForegroundColor Yellow
    Write-Host "  1. Criar arquivo .env com RASPBERRY_PI_PASSWORD=sua_senha"
    Write-Host "  2. Passar como parâmetro: -RaspberryPiPassword 'sua_senha'"
    Write-Host ""
    Write-Host "Para criar o .env:" -ForegroundColor Cyan
    Write-Host "  cp .env.example .env"
    Write-Host "  # Edite .env e adicione sua senha"
    Write-Host ""
    exit 1
}

# Cores para output
function Write-ColorOutput {
    param(
        [string]$Message,
        [ConsoleColor]$Color = [ConsoleColor]::White
    )
    $previousColor = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $Color
    Write-Output $Message
    $Host.UI.RawUI.ForegroundColor = $previousColor
}

function Write-Step {
    param([string]$Message)
    Write-ColorOutput "`n==> $Message" -Color Cyan
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "[OK] $Message" -Color Green
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-ColorOutput "[ERRO] $Message" -Color Red
}

# Banner
Write-ColorOutput @"

=========================================
  Caderninho Financeiro - Deploy Script
       Raspberry Pi 3 + Docker
=========================================

"@ -Color Cyan

# Variaveis
$FullImageName = "$RegistryHost/$ImageName`:$Tag"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Join-Path $ScriptDir "CaderninhoApi"

Write-Output "Configuracao:"
Write-Output "  Registry: $RegistryHost"
Write-Output "  Imagem: $ImageName`:$Tag"
Write-Output "  Container: $ContainerName"
Write-Output "  Porta: $Port"
Write-Output "  Diretorio: $ScriptDir"

# Verificar se Docker esta rodando
Write-Step "Verificando Docker..."
try {
    docker version | Out-Null
    Write-Success "Docker esta rodando"
} catch {
    Write-ErrorMsg "Docker nao esta rodando ou nao esta instalado!"
    exit 1
}

# Build da imagem
if (-not $SkipBuild) {
    Write-Step "Construindo imagem Docker..."
    
    # Verificar se o Dockerfile existe
    $DockerfilePath = Join-Path $ScriptDir "Dockerfile"
    if (-not (Test-Path $DockerfilePath)) {
        Write-ErrorMsg "Dockerfile nao encontrado em: $DockerfilePath"
        exit 1
    }
    
    Write-Output "Construindo para ARM64 (Raspberry Pi 3 - 64-bit)..."
    Write-Output "Usando buildx com cross-compilation nativa do .NET..."
    
    # Garantir que buildx está disponível
    $buildxVersion = docker buildx version 2>$null
    if (-not $buildxVersion) {
        Write-ErrorMsg "Docker buildx nao esta disponivel!"
        exit 1
    }
    
    # Verificar se builder existe
    $builderExists = docker buildx ls 2>$null | Select-String "arm-builder"
    
    if (-not $builderExists) {
        Write-Output "Criando builder multi-plataforma..."
        docker buildx create --name arm-builder --use --platform linux/arm64
        if ($LASTEXITCODE -ne 0) {
            Write-ErrorMsg "Falha ao criar builder!"
            exit 1
        }
    } else {
        docker buildx use arm-builder
    }
    
    # Build com buildx e carregar no docker local
    docker buildx build `
        --platform linux/arm64 `
        --load `
        -t $FullImageName `
        -f $DockerfilePath `
        .
    
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorMsg "Falha ao construir a imagem!"
        exit 1
    }
    
    Write-Success "Imagem construida com sucesso!"
    
    # Mostrar tamanho da imagem
    $ImageSize = docker images $FullImageName --format "{{.Size}}"
    Write-Output "  Tamanho da imagem: $ImageSize"
}

# Push para o registry
if (-not $SkipPush) {
    Write-Step "Enviando imagem para o registry..."
    
    # Verificar conectividade com o registry
    Write-Output "Testando conexao com $RegistryHost..."
    try {
        $response = Invoke-WebRequest -Uri "http://$RegistryHost/v2/" -Method Get -TimeoutSec 5 -UseBasicParsing
        Write-Success "Registry esta acessivel"
    } catch {
        Write-ErrorMsg "Nao foi possivel conectar ao registry em $RegistryHost"
        Write-Output "Certifique-se de que o registry esta rodando no Raspberry Pi"
        exit 1
    }
    
    docker push $FullImageName
    
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorMsg "Falha ao enviar imagem para o registry!"
        exit 1
    }
    
    Write-Success "Imagem enviada com sucesso!"
}

# Deploy remoto no Raspberry Pi
if ($RemoteDeploy) {
    Write-Step "Executando deploy remoto no Raspberry Pi..."
    
    Write-Output "Conectando via SSH em $RaspberryPiUser@$RaspberryPiHost..."
    
    # Preparar comando SSH com senha (se fornecida)
    $SshCommand = "ssh"
    $SshArgs = @()
    
    if ($RaspberryPiPassword) {
        # Usar plink se disponível (Windows)
        if (Get-Command plink -ErrorAction SilentlyContinue) {
            $SshCommand = "plink"
            $SshArgs = @(
                "-ssh",
                "-pw", $RaspberryPiPassword,
                "$RaspberryPiUser@$RaspberryPiHost"
            )
            Write-Output "Usando plink (PuTTY) para autenticacao com senha..."
        } else {
            Write-Host ""
            Write-Host "AVISO: Senha fornecida mas 'plink' nao esta instalado!" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Opcoes:" -ForegroundColor Cyan
            Write-Host "  1. Instalar PuTTY (inclui plink): https://www.putty.org/" -ForegroundColor White
            Write-Host "  2. Configurar chave SSH (recomendado):" -ForegroundColor White
            Write-Host "     ssh-keygen -t ed25519" -ForegroundColor Gray
            Write-Host "     ssh-copy-id $RaspberryPiUser@$RaspberryPiHost" -ForegroundColor Gray
            Write-Host ""
            Write-Host "Tentando com SSH padrao (pode pedir senha)..." -ForegroundColor Yellow
            Write-Host ""
            $SshArgs = @("$RaspberryPiUser@$RaspberryPiHost")
        }
    } else {
        # SSH padrão (usa chave se configurada)
        $SshArgs = @("$RaspberryPiUser@$RaspberryPiHost")
        Write-Output "Usando autenticacao SSH padrao (chave ou senha interativa)..."
    }
    
    # Script que sera executado no Raspberry Pi
    $RemoteScript = @"
#!/bin/bash
set -e

echo '==> Configurando Docker para aceitar registry inseguro...'
# Verificar se daemon.json existe
if [ ! -f /etc/docker/daemon.json ]; then
    echo '{}' | sudo tee /etc/docker/daemon.json > /dev/null
fi

# Adicionar registry inseguro se não estiver configurado
if ! sudo grep -q "$RegistryHost" /etc/docker/daemon.json 2>/dev/null; then
    echo 'Adicionando $RegistryHost aos registries inseguros...'
    sudo bash -c 'cat > /etc/docker/daemon.json << EOF
{
  "insecure-registries": ["$RegistryHost"]
}
EOF'
    echo 'Reiniciando Docker...'
    sudo systemctl restart docker
    echo 'Aguardando Docker iniciar...'
    sleep 5
else
    echo 'Registry já configurado.'
fi

echo '==> Parando container existente (se houver)...'
docker stop $ContainerName 2>/dev/null || true
docker rm $ContainerName 2>/dev/null || true

echo '==> Baixando nova imagem...'
docker pull $FullImageName

echo '==> Criando diretorios necessarios...'
mkdir -p ~/caderninho-data

echo '==> Iniciando novo container...'
docker run -d \
  --name $ContainerName \
  --restart unless-stopped \
  -p $Port`:8080 \
  -v ~/caderninho-data:/app/data \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e ConnectionStrings__DefaultConnection='Data Source=/app/data/caderninho.db' \
  $FullImageName

echo '==> Aguardando container iniciar...'
sleep 5

echo '==> Verificando status do container...'
docker ps | grep $ContainerName

echo '==> Verificando logs...'
docker logs --tail 20 $ContainerName

echo '[OK] Deploy concluido com sucesso!'
echo 'API disponivel em: http://$RaspberryPiHost`:$Port'
"@
    
    # Salvar script temporario com encoding Unix (LF)
    $TempScript = New-TemporaryFile
    $RemoteScript -replace "`r`n", "`n" | Out-File -FilePath $TempScript.FullName -Encoding UTF8 -NoNewline
    
    # Executar via SSH
    try {
        if ($SshCommand -eq "plink") {
            # PuTTY plink com senha
            $SshArgs += @("-m", $TempScript.FullName)
            & $SshCommand $SshArgs
        } else {
            # SSH padrão - passar script via stdin
            Get-Content $TempScript.FullName -Raw | & $SshCommand $SshArgs[0] 'bash -s'
        }
    } catch {
        Write-ErrorMsg "Erro ao executar comando SSH: $_"
        Remove-Item $TempScript.FullName -ErrorAction SilentlyContinue
        exit 1
    }
    
    # Limpar arquivo temporario
    Remove-Item $TempScript.FullName -ErrorAction SilentlyContinue
    
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorMsg "Falha no deploy remoto!"
        exit 1
    }
    
    Write-Success "Deploy remoto concluido!"
}

# Comandos uteis
Write-Step "Deploy concluido!"
Write-ColorOutput @"

Comandos uteis:

Gerenciar Container no Raspberry Pi:
  ssh $RaspberryPiUser@$RaspberryPiHost

  # Ver logs
  docker logs -f $ContainerName

  # Parar container
  docker stop $ContainerName

  # Iniciar container
  docker start $ContainerName

  # Remover container
  docker rm -f $ContainerName

  # Ver status
  docker ps -a | grep $ContainerName

Acessar API:
  http://$RaspberryPiHost`:$Port
  http://$RaspberryPiHost`:$Port/swagger

Atualizar aplicacao:
  .\deploy.ps1 -RemoteDeploy

Monitorar recursos:
  docker stats $ContainerName

"@ -Color Yellow

Write-Success "Tudo pronto!"
