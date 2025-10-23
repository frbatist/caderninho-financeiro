# ✅ Checklist de Deploy - Caderninho Financeiro

## 📋 Antes de Começar

### No Raspberry Pi 3 (10.0.0.131)
```bash
# 1. Verificar se Docker está instalado
docker --version

# 2. Iniciar Registry (se não estiver rodando)
docker run -d \
  -p 5001:5000 \
  --name registry \
  --restart always \
  -v ~/registry:/var/lib/registry \
  registry:2

# 3. Verificar Registry
curl http://localhost:5001/v2/
```

### No seu PC
```powershell
# 1. Adicionar registry como inseguro no Docker Desktop
# Settings → Docker Engine → Adicionar:
{
  "insecure-registries": ["10.0.0.131:5001"]
}

# 2. Testar conectividade
curl http://10.0.0.131:5001/v2/

# 3. Testar SSH
ssh pi@10.0.0.131
```

---

## 🚀 Fazer o Deploy

### Opção 1: Automatizado (Recomendado)

```powershell
# Navegar até o projeto
cd C:\Users\fbati\source\repos\caderninho-financeiro\Api\CaderninhoApi

# Executar deploy completo
.\deploy.ps1 -RemoteDeploy
```

### Opção 2: Passo a Passo

```powershell
# 1. Build da imagem
docker build --platform linux/arm/v7 -t 10.0.0.131:5001/caderninho-api:latest .

# 2. Push para registry
docker push 10.0.0.131:5001/caderninho-api:latest

# 3. Deploy no Raspberry Pi
ssh pi@10.0.0.131 << 'EOF'
docker pull 10.0.0.131:5001/caderninho-api:latest
docker stop caderninho-api 2>/dev/null || true
docker rm caderninho-api 2>/dev/null || true
mkdir -p ~/caderninho-data

docker run -d \
  --name caderninho-api \
  --restart unless-stopped \
  -p 5000:8080 \
  -v ~/caderninho-data:/app/data \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e ConnectionStrings__DefaultConnection='Data Source=/app/data/caderninho.db' \
  10.0.0.131:5001/caderninho-api:latest
EOF
```

---

## ✅ Verificar Deploy

```bash
# 1. Container está rodando?
ssh pi@10.0.0.131 "docker ps | grep caderninho"

# 2. Logs estão OK?
ssh pi@10.0.0.131 "docker logs --tail 50 caderninho-api"

# 3. API está respondendo?
curl http://10.0.0.131:5000/health

# 4. Swagger está acessível?
# Abrir navegador: http://10.0.0.131:5000/swagger
```

---

## 🔧 Configurar App Mobile

```typescript
// MobileApp/src/constants/api.ts
export const API_BASE_URL = 'http://10.0.0.131:5000';
```

---

## 🆘 Troubleshooting

### Erro: "Cannot connect to registry"
```bash
# Verificar se registry está rodando
ssh pi@10.0.0.131 "docker ps | grep registry"

# Reiniciar registry se necessário
ssh pi@10.0.0.131 "docker restart registry"
```

### Erro: "Platform mismatch"
```bash
# Certifique-se de usar --platform linux/arm/v7
docker build --platform linux/arm/v7 ...
```

### Container para constantemente
```bash
# Ver logs de erro
ssh pi@10.0.0.131 "docker logs caderninho-api"

# Verificar memória
ssh pi@10.0.0.131 "free -h"
```

---

## 📊 Comandos Úteis

```bash
# Ver logs em tempo real
ssh pi@10.0.0.131 "docker logs -f caderninho-api"

# Reiniciar container
ssh pi@10.0.0.131 "docker restart caderninho-api"

# Ver uso de recursos
ssh pi@10.0.0.131 "docker stats caderninho-api"

# Backup do banco
ssh pi@10.0.0.131 "cp ~/caderninho-data/caderninho.db ~/backup_$(date +%Y%m%d).db"

# Entrar no container
ssh pi@10.0.0.131 "docker exec -it caderninho-api sh"
```

---

## 📈 Próximos Passos

- [ ] Deploy concluído com sucesso
- [ ] API acessível em http://10.0.0.131:5000
- [ ] Swagger funcionando
- [ ] Configurar app mobile com novo IP
- [ ] Testar todas as funcionalidades
- [ ] Configurar backup automático
- [ ] Documentar para equipe

---

## 📚 Documentação

- **Completa:** [DEPLOY.md](./DEPLOY.md)
- **README:** [README.md](./README.md)

---

**Bom deploy! 🚀**
