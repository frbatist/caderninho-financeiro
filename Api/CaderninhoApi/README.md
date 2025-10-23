# 🚀 Deploy Rápido - Raspberry Pi 3

## ⚡ Quick Start

### Windows (PowerShell)
```powershell
cd Api\CaderninhoApi
.\deploy.ps1 -RemoteDeploy
```

### Linux/Mac
```bash
cd Api/CaderninhoApi
chmod +x deploy.sh
./deploy.sh --deploy
```

## 📦 O que foi criado

- ✅ `Dockerfile` - Imagem Alpine otimizada para ARM64 (~150MB)
- ✅ `deploy.ps1` - Script PowerShell para Windows
- ✅ `deploy.sh` - Script Bash para Linux/Mac
- ✅ `docker-compose.yml` - Configuração opcional
- ✅ `DEPLOY.md` - Documentação completa
- ✅ `.dockerignore` - Otimização de build
- ✅ Health check endpoint: `/health`

> **💡 Dica:** Use Raspberry Pi OS 64-bit para melhor performance com ARM64!

## 🎯 Acesso

Após deploy:
- **API:** http://10.0.0.131:5000
- **Swagger:** http://10.0.0.131:5000/swagger
- **Health:** http://10.0.0.131:5000/health

## 📚 Documentação Completa

Leia [DEPLOY.md](./DEPLOY.md) para:
- Configuração detalhada
- Troubleshooting
- Monitoramento
- Backup e restauração
- Comandos úteis

## 🔧 Configurações

Edite as variáveis no início dos scripts se necessário:
- `REGISTRY_HOST`: 10.0.0.131:5001
- `PORT`: 5000
- `RASPBERRY_PI_HOST`: 10.0.0.131
- `RASPBERRY_PI_USER`: pi

## ⚠️ Pré-requisitos

1. Registry Docker rodando no Raspberry Pi (porta 5001)
2. Docker configurado para registry inseguro
3. SSH funcionando
4. Mesma rede local

Veja instruções detalhadas em [DEPLOY.md](./DEPLOY.md)
