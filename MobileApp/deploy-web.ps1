# Deploy Web - Caderninho Financeiro
# Script para build e deploy da aplicação web no Raspberry Pi

param(
    [string]$RaspberryPiHost = "",
    [string]$RaspberryPiUser = "",
    [string]$RaspberryPiPassword = "",
    [switch]$BuildOnly,
    [switch]$DeployOnly,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

# Carregar variáveis do arquivo .env
function Load-EnvFile {
    if (Test-Path ".env") {
        Get-Content ".env" | ForEach-Object {
            if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$') {
                $name = $matches[1].Trim()
                $value = $matches[2].Trim()
                Set-Variable -Name $name -Value $value -Scope Script
            }
        }
        Write-Host "Credenciais carregadas do arquivo .env" -ForegroundColor Green
    }
}

# Carregar .env no início
Load-EnvFile

# Se não foram passados parâmetros, usar valores do .env
if ([string]::IsNullOrEmpty($RaspberryPiHost) -and $script:RASPBERRY_PI_HOST) {
    $RaspberryPiHost = $script:RASPBERRY_PI_HOST
}
if ([string]::IsNullOrEmpty($RaspberryPiUser) -and $script:RASPBERRY_PI_USER) {
    $RaspberryPiUser = $script:RASPBERRY_PI_USER
}
if ([string]::IsNullOrEmpty($RaspberryPiPassword) -and $script:RASPBERRY_PI_PASSWORD) {
    $RaspberryPiPassword = $script:RASPBERRY_PI_PASSWORD
}

# Valores padrão se ainda estiverem vazios
if ([string]::IsNullOrEmpty($RaspberryPiHost)) {
    $RaspberryPiHost = "10.0.0.131"
}
if ([string]::IsNullOrEmpty($RaspberryPiUser)) {
    $RaspberryPiUser = "pi"
}

function Show-Help {
    Write-Host "=================================="
    Write-Host "Deploy Web - Caderninho Financeiro"
    Write-Host "=================================="
    Write-Host ""
    Write-Host "USO:"
    Write-Host "  .\deploy-web.ps1 [OPCOES]"
    Write-Host ""
    Write-Host "OPCOES:"
    Write-Host "  -RaspberryPiHost <IP>    IP do Raspberry Pi (padrao: 10.0.0.131)"
    Write-Host "  -RaspberryPiUser <user>  Usuario SSH (padrao: pi)"
    Write-Host "  -BuildOnly               Apenas build local (nao faz deploy)"
    Write-Host "  -DeployOnly              Apenas deploy (nao faz build)"
    Write-Host "  -Help                    Mostra esta ajuda"
    Write-Host ""
    Write-Host "EXEMPLOS:"
    Write-Host "  # Build e deploy completo"
    Write-Host "  .\deploy-web.ps1"
    Write-Host ""
    Write-Host "  # Apenas build local"
    Write-Host "  .\deploy-web.ps1 -BuildOnly"
    Write-Host ""
    Write-Host "  # Deploy para IP customizado"
    Write-Host "  .\deploy-web.ps1 -RaspberryPiHost 192.168.1.100"
    Write-Host ""
    exit 0
}

if ($Help) {
    Show-Help
}

# Função auxiliar para SSH com senha
function Invoke-SSH {
    param([string]$Command)
    
    if (![string]::IsNullOrEmpty($RaspberryPiPassword)) {
        # Usar plink se disponível
        $plink = Get-Command plink -ErrorAction SilentlyContinue
        if ($plink) {
            # Aceitar chave do host automaticamente e executar comando
            $output = echo y | plink -batch -pw $RaspberryPiPassword "${RaspberryPiUser}@${RaspberryPiHost}" $Command 2>&1
            return $output
        }
    }
    
    # Fallback para SSH normal
    ssh -o StrictHostKeyChecking=no "${RaspberryPiUser}@${RaspberryPiHost}" $Command
}

# Função auxiliar para SCP com senha
function Invoke-SCP {
    param([string]$Source, [string]$Dest)
    
    if (![string]::IsNullOrEmpty($RaspberryPiPassword)) {
        # Usar pscp se disponível
        $pscp = Get-Command pscp -ErrorAction SilentlyContinue
        if ($pscp) {
            # Aceitar chave do host automaticamente e copiar
            $output = echo y | pscp -batch -pw $RaspberryPiPassword -r $Source $Dest 2>&1
            return $output
        }
    }
    
    # Fallback para SCP normal
    scp -o StrictHostKeyChecking=no -r $Source $Dest 2>$null
}

# Função para adicionar host key do servidor
function Add-HostKey {
    Write-Host "Adicionando chave do host ao cache..." -ForegroundColor Yellow
    
    if (![string]::IsNullOrEmpty($RaspberryPiPassword)) {
        $plink = Get-Command plink -ErrorAction SilentlyContinue
        if ($plink) {
            # Executar comando simples para adicionar a chave
            echo y | plink -pw $RaspberryPiPassword "${RaspberryPiUser}@${RaspberryPiHost}" "echo 'Host key accepted'" 2>&1 | Out-Null
            Start-Sleep -Seconds 1
            return
        }
    }
    
    # Para SSH normal, usar ssh-keyscan
    Write-Host "Use SSH normal e aceite a chave manualmente:" -ForegroundColor Yellow
    Write-Host "  ssh ${RaspberryPiUser}@${RaspberryPiHost}" -ForegroundColor White
}

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Deploy Web - Caderninho Financeiro" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Verificar dependências
function Test-Dependencies {
    Write-Host "Verificando dependencias..." -ForegroundColor Yellow
    
    # Verificar Node.js
    try {
        $nodeVersion = node --version
        $nodeVersionNum = $nodeVersion -replace 'v', ''
        $nodeMajor = [int]($nodeVersionNum.Split('.')[0])
        
        Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
        
        if ($nodeMajor -lt 18) {
            Write-Host ""
            Write-Host "ERRO: Node.js versao $nodeVersion detectada" -ForegroundColor Red
            Write-Host "Este projeto requer Node.js 18 ou superior" -ForegroundColor Red
            Write-Host ""
            Write-Host "Por favor, atualize o Node.js:" -ForegroundColor Yellow
            Write-Host "1. Baixe: https://nodejs.org/" -ForegroundColor Yellow
            Write-Host "2. Instale a versao LTS (20.x ou superior)" -ForegroundColor Yellow
            Write-Host "3. Reinicie o PowerShell" -ForegroundColor Yellow
            Write-Host ""
            exit 1
        }
    } catch {
        Write-Host "Node.js nao encontrado. Instale: https://nodejs.org/" -ForegroundColor Red
        exit 1
    }
    
    # Verificar npm
    try {
        $npmVersion = npm --version
        Write-Host "npm: $npmVersion" -ForegroundColor Green
    } catch {
        Write-Host "npm nao encontrado" -ForegroundColor Red
        exit 1
    }
    
    # Verificar Docker (apenas se não for BuildOnly)
    if (-not $BuildOnly) {
        try {
            $dockerVersion = docker --version
            Write-Host "Docker: $dockerVersion" -ForegroundColor Green
        } catch {
            Write-Host "Docker nao encontrado. Instale: https://www.docker.com/" -ForegroundColor Red
            exit 1
        }
        
        # Verificar PuTTY se senha estiver configurada
        if (![string]::IsNullOrEmpty($RaspberryPiPassword)) {
            $plink = Get-Command plink -ErrorAction SilentlyContinue
            if (-not $plink) {
                Write-Host ""
                Write-Host "AVISO: Senha configurada mas PuTTY nao encontrado" -ForegroundColor Yellow
                Write-Host "Para autenticacao automatica, instale PuTTY:" -ForegroundColor Yellow
                Write-Host "  winget install PuTTY.PuTTY" -ForegroundColor White
                Write-Host "ou baixe de: https://www.putty.org/" -ForegroundColor Gray
                Write-Host ""
                Write-Host "Sera necessario digitar a senha manualmente..." -ForegroundColor Yellow
                Start-Sleep -Seconds 3
            } else {
                Write-Host "PuTTY: Encontrado (autenticacao automatica habilitada)" -ForegroundColor Green
            }
        }
    }
    
    Write-Host ""
}

# Build da aplicação web
function Build-WebApp {
    Write-Host "Iniciando build da aplicacao web..." -ForegroundColor Yellow
    Write-Host ""
    
    # Instalar dependências se necessário
    if (-not (Test-Path "node_modules")) {
        Write-Host "Instalando dependencias..." -ForegroundColor Yellow
        npm install
        Write-Host ""
    }
    
    # Limpar build anterior
    if (Test-Path "web-build") {
        Write-Host "Limpando build anterior..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force "web-build"
    }
    
    # Build Expo Web
    Write-Host "Executando build Expo Web..." -ForegroundColor Yellow
    $env:NODE_ENV = "production"
    npx expo export --platform web
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erro no build da aplicacao" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Build concluido com sucesso!" -ForegroundColor Green
    Write-Host ""
}

# Deploy no Raspberry Pi
function Deploy-ToRaspberryPi {
    Write-Host "Iniciando deploy no Raspberry Pi..." -ForegroundColor Yellow
    Write-Host ""
    
    # Adicionar host key primeiro
    Add-HostKey
    
    # Verificar conectividade SSH
    Write-Host "Testando conexao SSH com $RaspberryPiHost..." -ForegroundColor Yellow
    
    # Testar conexão
    $sshTest = Invoke-SSH "echo 'OK'"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Nao foi possivel conectar ao Raspberry Pi" -ForegroundColor Red
        Write-Host ""
        Write-Host "Verifique:" -ForegroundColor Yellow
        Write-Host "- IP esta correto: $RaspberryPiHost" -ForegroundColor Yellow
        Write-Host "- Raspberry Pi esta ligado e na rede" -ForegroundColor Yellow
        Write-Host "- Senha/chave SSH estao corretas no arquivo .env" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Tente conectar manualmente primeiro:" -ForegroundColor Cyan
        Write-Host "  ssh ${RaspberryPiUser}@${RaspberryPiHost}" -ForegroundColor White
        Write-Host ""
        exit 1
    }
    
    Write-Host "Conexao SSH OK" -ForegroundColor Green
    Write-Host ""
    
    # Obter o caminho home do usuário no Raspberry Pi
    Write-Host "Obtendo caminho home..." -ForegroundColor Yellow
    $homeDir = Invoke-SSH "echo `$HOME"
    $homeDir = $homeDir.Trim()
    $deployPath = "$homeDir/caderninho-web"
    
    # Criar diretório no Raspberry Pi
    Write-Host "Criando diretorio no Raspberry Pi..." -ForegroundColor Yellow
    Invoke-SSH "mkdir -p $deployPath"
    
    # Copiar arquivos para o Raspberry Pi
    Write-Host "Copiando arquivos para o Raspberry Pi..." -ForegroundColor Yellow
    Write-Host "Isso pode levar alguns minutos..." -ForegroundColor Gray
    
    Invoke-SCP "Dockerfile.web" "${RaspberryPiUser}@${RaspberryPiHost}:${deployPath}/"
    Invoke-SCP "nginx-web.conf" "${RaspberryPiUser}@${RaspberryPiHost}:${deployPath}/"
    Invoke-SCP "docker-compose.web.yml" "${RaspberryPiUser}@${RaspberryPiHost}:${deployPath}/"
    Invoke-SCP "package.json" "${RaspberryPiUser}@${RaspberryPiHost}:${deployPath}/"
    Invoke-SCP "package-lock.json" "${RaspberryPiUser}@${RaspberryPiHost}:${deployPath}/"
    Invoke-SCP "tsconfig.json" "${RaspberryPiUser}@${RaspberryPiHost}:${deployPath}/"
    Invoke-SCP "app.json" "${RaspberryPiUser}@${RaspberryPiHost}:${deployPath}/"
    Invoke-SCP "index.ts" "${RaspberryPiUser}@${RaspberryPiHost}:${deployPath}/"
    Invoke-SCP "App.tsx" "${RaspberryPiUser}@${RaspberryPiHost}:${deployPath}/"
    Invoke-SCP "src" "${RaspberryPiUser}@${RaspberryPiHost}:${deployPath}/"
    Invoke-SCP "assets" "${RaspberryPiUser}@${RaspberryPiHost}:${deployPath}/"
    
    Write-Host "Arquivos copiados" -ForegroundColor Green
    Write-Host ""
    
    # Build e iniciar container no Raspberry Pi
    Write-Host "Fazendo build e iniciando container Docker..." -ForegroundColor Yellow
    Write-Host "Isso pode levar varios minutos na primeira vez..." -ForegroundColor Gray
    Write-Host ""
    
    # Parar container existente
    Write-Host "Parando containers existentes..." -ForegroundColor Gray
    Invoke-SSH "cd $deployPath && docker compose -f docker-compose.web.yml down 2>/dev/null || true"
    
    # Build
    Write-Host "Fazendo build da imagem Docker..." -ForegroundColor Yellow
    $buildOutput = Invoke-SSH "cd $deployPath && docker compose -f docker-compose.web.yml build --no-cache"
    Write-Host $buildOutput
    
    # Iniciar container
    Write-Host ""
    Write-Host "Iniciando container..." -ForegroundColor Yellow
    $upOutput = Invoke-SSH "cd $deployPath && docker compose -f docker-compose.web.yml up -d"
    Write-Host $upOutput
    
    # Verificar se o container foi criado
    Start-Sleep -Seconds 5
    $containerCheck = Invoke-SSH "docker ps | grep caderninho-web"
    
    if ([string]::IsNullOrEmpty($containerCheck)) {
        Write-Host ""
        Write-Host "Aviso: Container pode nao estar rodando" -ForegroundColor Yellow
        Write-Host "Verificando todos os containers..." -ForegroundColor Gray
        Invoke-SSH "docker ps -a | grep caderninho-web"
        Write-Host ""
        Write-Host "Para ver logs:" -ForegroundColor Cyan
        Write-Host "  ssh ${RaspberryPiUser}@${RaspberryPiHost} 'docker logs caderninho-web'" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "Container iniciado com sucesso!" -ForegroundColor Green
    }
    Write-Host ""
    
    # Aguardar container ficar saudável
    Write-Host "Aguardando aplicacao inicializar..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # Verificar status
    Write-Host "Verificando status do container..." -ForegroundColor Yellow
    Invoke-SSH "docker ps -a | grep caderninho-web"
    
    Write-Host ""
    Write-Host "Deploy concluido com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Aplicacao disponivel em:" -ForegroundColor Cyan
    Write-Host "  http://${RaspberryPiHost}:3000" -ForegroundColor White
    Write-Host ""
    Write-Host "Para ver logs:" -ForegroundColor Gray
    Write-Host "  ssh ${RaspberryPiUser}@${RaspberryPiHost} 'docker logs -f caderninho-web'" -ForegroundColor Gray
    Write-Host ""
}

# Executar fluxo principal
try {
    Test-Dependencies
    
    if (-not $DeployOnly) {
        Build-WebApp
    }
    
    if ($BuildOnly) {
        Write-Host "Build local concluido!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Para testar localmente:" -ForegroundColor Cyan
        Write-Host "  npx serve dist -p 3000" -ForegroundColor White
        Write-Host ""
        Write-Host "Depois acesse: http://localhost:3000" -ForegroundColor Gray
        exit 0
    }
    
    if (-not $DeployOnly) {
        Write-Host "ATENCAO: O deploy sera feito diretamente no Raspberry Pi" -ForegroundColor Yellow
        Write-Host "O build sera feito no Raspberry Pi para compatibilidade ARM" -ForegroundColor Yellow
        Write-Host ""
        $confirm = Read-Host "Deseja continuar? (S/N)"
        if ($confirm -ne "S" -and $confirm -ne "s") {
            Write-Host "Deploy cancelado" -ForegroundColor Red
            exit 0
        }
        Write-Host ""
    }
    
    Deploy-ToRaspberryPi
    
} catch {
    Write-Host ""
    Write-Host "Erro durante o processo:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Gray
    Write-Host ""
    exit 1
}
