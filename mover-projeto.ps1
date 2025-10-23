# Script para mover o projeto para um caminho mais curto
# Isso resolve o problema de caminhos muito longos no Windows

Write-Host "Movendo projeto para C:\dev\caderninho..." -ForegroundColor Cyan

# Criar diretorio se nao existir
if (-not (Test-Path "C:\dev")) {
    New-Item -ItemType Directory -Path "C:\dev" -Force | Out-Null
}

# Mover o projeto
Write-Host "Copiando arquivos..." -ForegroundColor Yellow
Copy-Item -Path "C:\Users\fbati\source\repos\caderninho-financeiro" -Destination "C:\dev\caderninho" -Recurse -Force

Write-Host ""
Write-Host "Projeto movido com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Cyan
Write-Host "1. Feche esta janela do VS Code"
Write-Host "2. Abra o VS Code no novo local: C:\dev\caderninho"
Write-Host "3. Continue o build local normalmente"
Write-Host ""
Write-Host "O chat do GitHub Copilot vai continuar funcionando normalmente!" -ForegroundColor Green
