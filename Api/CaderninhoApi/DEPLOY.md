# 🚀 Guia de Deploy - Caderninho Financeiro API

## 📋 Pré-requisitos

### No seu PC (Desenvolvimento)
- ✅ Docker Desktop instalado e rodando
- ✅ PowerShell (Windows) ou Bash (Linux/Mac)
- ✅ Git
- ✅ .NET 9 SDK (opcional, apenas para desenvolvimento)

### No Raspberry Pi 3
- ✅ Raspberry Pi OS (64-bit) - **Recomendado para melhor performance**
- ✅ Docker instalado
- ✅ Docker Registry rodando na porta 5001
- ✅ SSH habilitado
- ✅ Conectado na mesma rede (IP: 10.0.0.131)

> **⚠️ Importante:** Use Raspberry Pi OS 64-bit para aproveitar a arquitetura ARM64 do Raspberry Pi 3.
> O .NET 9 tem melhor performance em sistemas 64-bit.
> Download: https://www.raspberrypi.com/software/operating-systems/

---

## 🔧 Configuração Inicial

### 1. Verificar Registry no Raspberry Pi

Primeiro, certifique-se de que o registry está rodando:

```bash
# SSH no Raspberry Pi
ssh pi@10.0.0.131

# Verificar se registry está rodando
docker ps | grep registry

# Se não estiver rodando, inicie:
docker run -d \
  -p 5001:5000 \
  --name registry \
  --restart always \
  -v /home/pi/registry:/var/lib/registry \
  registry:2
```

### 2. Configurar Docker para usar Registry Inseguro

No seu **PC Windows**, adicione o registry como inseguro:

1. Abra o Docker Desktop
2. Settings → Docker Engine
3. Adicione no JSON:

```json
{
  "insecure-registries": ["10.0.0.131:5001"]
}
```

4. Apply & Restart

**Linux/Mac:**
```bash
# Editar daemon.json
sudo nano /etc/docker/daemon.json

# Adicionar:
{
  "insecure-registries": ["10.0.0.131:5001"]
}

# Reiniciar Docker
sudo systemctl restart docker
```

---

## 🐳 Build e Deploy

### Opção 1: Script Automatizado (Recomendado)

#### Windows (PowerShell):

```powershell
# Navegar até o diretório do projeto
cd C:\Users\fbati\source\repos\caderninho-financeiro\Api\CaderninhoApi

# Deploy completo (build + push + deploy remoto)
.\deploy.ps1 -RemoteDeploy

# Ou passo a passo:

# 1. Apenas build
.\deploy.ps1

# 2. Build e push
.\deploy.ps1

# 3. Build, push e deploy remoto
.\deploy.ps1 -RemoteDeploy

# Personalizar configurações
.\deploy.ps1 -RemoteDeploy `
  -RegistryHost "10.0.0.131:5001" `
  -Port 5000 `
  -RaspberryPiHost "10.0.0.131" `
  -RaspberryPiUser "pi"
```

#### Linux/Mac (Bash):

```bash
# Dar permissão de execução
chmod +x deploy.sh

# Deploy completo
./deploy.sh --deploy

# Apenas build e push
./deploy.sh
```

### Opção 2: Comandos Manuais

#### Passo 1: Build da Imagem

```bash
# No diretório Api/CaderninhoApi
docker build \
  --platform linux/arm/v7 \
  -t 10.0.0.131:5001/caderninho-api:latest \
  -f Dockerfile \
  .
```

#### Passo 2: Push para Registry

```bash
docker push 10.0.0.131:5001/caderninho-api:latest
```

#### Passo 3: Deploy no Raspberry Pi

```bash
# SSH no Raspberry Pi
ssh pi@10.0.0.131

# Parar container existente (se houver)
docker stop caderninho-api 2>/dev/null || true
docker rm caderninho-api 2>/dev/null || true

# Baixar imagem
docker pull 10.0.0.131:5001/caderninho-api:latest

# Criar diretório para dados
mkdir -p ~/caderninho-data

# Iniciar container
docker run -d \
  --name caderninho-api \
  --restart unless-stopped \
  -p 5000:8080 \
  -v ~/caderninho-data:/app/data \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e ConnectionStrings__DefaultConnection='Data Source=/app/data/caderninho.db' \
  10.0.0.131:5001/caderninho-api:latest

# Verificar logs
docker logs -f caderninho-api
```

### Opção 3: Docker Compose

```bash
# No Raspberry Pi, criar arquivo docker-compose.yml
# (copie o conteúdo do arquivo docker-compose.yml fornecido)

# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

---

## 🔍 Verificação e Testes

### 1. Verificar se o container está rodando

```bash
# No Raspberry Pi
docker ps | grep caderninho-api

# Ver logs em tempo real
docker logs -f caderninho-api

# Ver últimas 50 linhas
docker logs --tail 50 caderninho-api
```

### 2. Testar a API

```bash
# Health check
curl http://10.0.0.131:5000/health

# Swagger UI
# Abra no navegador: http://10.0.0.131:5000/swagger

# Testar endpoint de usuários
curl http://10.0.0.131:5000/api/users
```

### 3. Verificar banco de dados

```bash
# No Raspberry Pi
ls -lh ~/caderninho-data/

# Ver tamanho do banco
du -h ~/caderninho-data/caderninho.db
```

---

## 📊 Monitoramento

### Ver uso de recursos

```bash
# CPU, Memória, Rede
docker stats caderninho-api

# Detalhes do container
docker inspect caderninho-api

# Processos rodando no container
docker top caderninho-api
```

### Logs estruturados

```bash
# Logs com timestamp
docker logs -f --timestamps caderninho-api

# Filtrar por erro
docker logs caderninho-api 2>&1 | grep -i error

# Salvar logs em arquivo
docker logs caderninho-api > ~/caderninho-logs.txt
```

---

## 🔄 Atualizações

### Atualizar para nova versão

```bash
# No seu PC, rebuild e push
.\deploy.ps1 -RemoteDeploy

# Ou manualmente no Raspberry Pi:
docker pull 10.0.0.131:5001/caderninho-api:latest
docker stop caderninho-api
docker rm caderninho-api
docker run -d ... # (mesmo comando anterior)
```

### Rollback para versão anterior

```bash
# Liste as imagens
docker images | grep caderninho-api

# Use uma versão específica por tag
docker run -d \
  --name caderninho-api \
  ... \
  10.0.0.131:5001/caderninho-api:v1.0.0
```

---

## 🛠️ Troubleshooting

### Problema: "Cannot connect to registry"

**Solução:**
```bash
# Verificar se registry está rodando
docker ps | grep registry

# Testar conectividade
curl http://10.0.0.131:5001/v2/

# Verificar firewall
sudo ufw status
sudo ufw allow 5001
```

### Problema: "Platform mismatch"

**Solução:** Certifique-se de usar `--platform linux/arm/v7` no build

### Problema: "Container keeps restarting"

**Solução:**
```bash
# Ver logs de erro
docker logs --tail 100 caderninho-api

# Verificar variáveis de ambiente
docker inspect caderninho-api | grep -A 20 Env

# Entrar no container para debug
docker exec -it caderninho-api sh
```

### Problema: "Out of memory"

**Solução:**
```bash
# Verificar memória disponível
free -h

# Limpar containers e imagens antigas
docker system prune -a

# Adicionar swap (se necessário)
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile  # CONF_SWAPSIZE=1024
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

### Problema: "Database locked"

**Solução:**
```bash
# Parar container
docker stop caderninho-api

# Verificar se há processos usando o banco
lsof ~/caderninho-data/caderninho.db

# Remover locks
rm ~/caderninho-data/*.db-wal
rm ~/caderninho-data/*.db-shm

# Reiniciar
docker start caderninho-api
```

---

## 🔐 Segurança

### Backup do Banco de Dados

```bash
# Script de backup automático
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec caderninho-api sh -c "cp /app/data/caderninho.db /app/data/backup_$DATE.db"

# Ou copiar localmente
scp pi@10.0.0.131:~/caderninho-data/caderninho.db ./backup_$DATE.db
```

### Restaurar Backup

```bash
docker stop caderninho-api
cp backup_20251022.db ~/caderninho-data/caderninho.db
docker start caderninho-api
```

### Variáveis de Ambiente Sensíveis

Para produção, considere usar Docker secrets ou arquivo .env:

```bash
# Criar arquivo .env
cat > ~/caderninho.env << EOF
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=Data Source=/app/data/caderninho.db
JWT_SECRET=sua_chave_secreta_aqui
EOF

# Usar no docker run
docker run -d \
  --env-file ~/caderninho.env \
  ...
```

---

## 📈 Performance

### Otimizações para Raspberry Pi 3

```bash
# Limitar uso de memória
docker run -d \
  --memory="512m" \
  --memory-swap="1g" \
  ...

# Configurar CPUs
docker run -d \
  --cpus="2" \
  ...
```

### Tamanho da Imagem

A imagem Alpine Linux deve ter aproximadamente:
- **Build:** ~300-400 MB
- **Runtime:** ~150-200 MB

Muito menor que imagens baseadas em Debian (~500-800 MB)

---

## 📝 Comandos Rápidos

```bash
# Ver status
docker ps -a | grep caderninho

# Parar
docker stop caderninho-api

# Iniciar
docker start caderninho-api

# Reiniciar
docker restart caderninho-api

# Remover
docker rm -f caderninho-api

# Ver logs
docker logs -f caderninho-api

# Executar comando dentro do container
docker exec -it caderninho-api sh

# Ver uso de recursos
docker stats caderninho-api

# Limpar espaço
docker system prune -a
```

---

## 🌐 Acessar a API

Após o deploy bem-sucedido:

- **API Base:** http://10.0.0.131:5000
- **Swagger UI:** http://10.0.0.131:5000/swagger
- **Health Check:** http://10.0.0.131:5000/health

### Configurar no App Mobile

No arquivo `MobileApp/src/constants/api.ts`:

```typescript
export const API_BASE_URL = 'http://10.0.0.131:5000';
```

---

## ✅ Checklist de Deploy

- [ ] Registry rodando no Raspberry Pi (porta 5001)
- [ ] Docker configurado para registry inseguro
- [ ] SSH funcionando (pi@10.0.0.131)
- [ ] Dockerfile criado
- [ ] Script de deploy executável
- [ ] Build da imagem concluído
- [ ] Push para registry bem-sucedido
- [ ] Container rodando no Raspberry Pi
- [ ] Health check respondendo
- [ ] Swagger acessível
- [ ] Banco de dados criado
- [ ] App mobile configurado com IP correto

---

## 📚 Recursos Adicionais

- [Docker Documentation](https://docs.docker.com/)
- [.NET Docker Images](https://hub.docker.com/_/microsoft-dotnet)
- [Raspberry Pi Docker Guide](https://www.docker.com/blog/happy-pi-day-docker-raspberry-pi/)
- [Alpine Linux](https://alpinelinux.org/)

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs: `docker logs caderninho-api`
2. Teste a conectividade de rede
3. Confirme que o registry está acessível
4. Verifique se há espaço em disco suficiente
5. Consulte a seção de Troubleshooting acima

---

**Desenvolvido com ❤️ para Raspberry Pi 3**
