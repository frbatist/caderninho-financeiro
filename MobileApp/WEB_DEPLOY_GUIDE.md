# 🌐 Deploy Web - Caderninho Financeiro

## 📋 Visão Geral

Este guia descreve como fazer deploy da aplicação React Native como uma aplicação web que pode ser acessada via browser em qualquer dispositivo na rede local.

### ✨ Características

- ✅ Aplicação web responsiva acessível via browser
- ✅ Build otimizado com React Native Web
- ✅ Container Docker com Nginx
- ✅ Deploy automatizado no Raspberry Pi
- ✅ Acesso via rede local em qualquer dispositivo

---

## 🚀 Quick Start

### Deploy Completo (Build + Deploy)

```powershell
cd MobileApp
.\deploy-web.ps1
```

A aplicação estará disponível em:
- 🌐 **http://10.0.0.131:3000**

### Testar Localmente Antes do Deploy

```powershell
# Build local
.\deploy-web.ps1 -BuildOnly

# Servir localmente para teste
npx serve dist -p 3000
```

Acesse: http://localhost:3000

---

## 📋 Pré-requisitos

### No PC de Desenvolvimento

- ✅ Node.js 18+ ([download](https://nodejs.org/)) - **Versão 20 LTS recomendada**
- ✅ PowerShell 7+ (Windows 11 já inclui)
- ✅ SSH configurado para o Raspberry Pi

### No Raspberry Pi

- ✅ Docker instalado
- ✅ Docker Compose instalado
- ✅ Porta 3000 disponível
- ✅ SSH habilitado e configurado

> ⚠️ **IMPORTANTE**: O projeto requer Node.js 18 ou superior. Node.js 16 não é compatível.

---

## 🔧 Instalação e Configuração

### 1. Instalar Dependências no PC

```powershell
# Verificar Node.js
node --version  # Deve ser 18+
npm --version

# Instalar dependências do projeto
cd MobileApp
npm install
```

### 2. Configurar SSH no Raspberry Pi

Se ainda não configurou SSH, consulte: `SSH_SETUP.md`

Teste a conexão:
```powershell
ssh pi@10.0.0.131
```

### 3. Instalar Docker no Raspberry Pi (se necessário)

```bash
# No Raspberry Pi
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose já vem incluído como plugin
# Verificar instalação
docker --version
docker compose version
```

---

## 🏗️ Build e Deploy

### Deploy Automático

```powershell
# Deploy completo (recomendado)
.\deploy-web.ps1

# Deploy para IP customizado
.\deploy-web.ps1 -RaspberryPiHost 192.168.1.100

# Apenas build local (para testar)
.\deploy-web.ps1 -BuildOnly

# Apenas deploy (se já fez build)
.\deploy-web.ps1 -DeployOnly
```

### Deploy Manual (Passo a Passo)

```powershell
# 1. Build local
cd MobileApp
npm install
npx expo export --platform web

# 2. Copiar arquivos para Raspberry Pi
scp -r Dockerfile.web pi@10.0.0.131:~/caderninho-web/
scp -r nginx-web.conf pi@10.0.0.131:~/caderninho-web/
scp -r docker-compose.web.yml pi@10.0.0.131:~/caderninho-web/
scp -r package*.json pi@10.0.0.131:~/caderninho-web/
scp -r app.json pi@10.0.0.131:~/caderninho-web/
scp -r tsconfig.json pi@10.0.0.131:~/caderninho-web/
scp -r index.ts pi@10.0.0.131:~/caderninho-web/
scp -r App.tsx pi@10.0.0.131:~/caderninho-web/
scp -r src pi@10.0.0.131:~/caderninho-web/
scp -r assets pi@10.0.0.131:~/caderninho-web/

# 3. Build e iniciar no Raspberry Pi
ssh pi@10.0.0.131
cd ~/caderninho-web
docker compose -f docker-compose.web.yml build
docker compose -f docker-compose.web.yml up -d
```

---

## 🌐 Acessando a Aplicação

Após o deploy bem-sucedido:

### No Computador
Abra o browser e acesse:
```
http://10.0.0.131:3000
```

### No Celular
Conecte o celular na mesma rede Wi-Fi e acesse:
```
http://10.0.0.131:3000
```

### No Tablet
Conecte o tablet na mesma rede Wi-Fi e acesse:
```
http://10.0.0.131:3000
```

> 💡 **Dica:** Adicione aos favoritos/atalho na tela inicial para acesso rápido!

---

## 🔍 Monitoramento e Manutenção

### Ver Status do Container

```bash
# No Raspberry Pi
docker ps | grep caderninho-web
```

### Ver Logs em Tempo Real

```bash
# No Raspberry Pi
docker logs -f caderninho-web
```

### Reiniciar Aplicação

```bash
# No Raspberry Pi
cd ~/caderninho-web
docker compose -f docker-compose.web.yml restart
```

### Parar Aplicação

```bash
# No Raspberry Pi
cd ~/caderninho-web
docker compose -f docker-compose.web.yml stop
```

### Remover Tudo (Cleanup)

```bash
# No Raspberry Pi
cd ~/caderninho-web
docker compose -f docker-compose.web.yml down
docker system prune -a
```

---

## 🔄 Atualizando a Aplicação

Quando fizer mudanças no código:

```powershell
# No PC
cd MobileApp
.\deploy-web.ps1
```

O script irá:
1. ✅ Fazer novo build
2. ✅ Copiar arquivos atualizados
3. ✅ Rebuildar container
4. ✅ Reiniciar aplicação

---

## 🐛 Troubleshooting

### Container não inicia

```bash
# Ver logs de erro
docker logs caderninho-web

# Verificar se porta 3000 está disponível
sudo netstat -tulpn | grep 3000

# Tentar iniciar manualmente
cd ~/caderninho-web
docker compose -f docker-compose.web.yml up
```

### Erro de build

```bash
# Limpar cache do Docker
docker builder prune -a

# Rebuild do zero
docker compose -f docker-compose.web.yml build --no-cache
```

### Não consegue acessar via browser

1. Verificar se container está rodando:
   ```bash
   docker ps | grep caderninho-web
   ```

2. Verificar logs:
   ```bash
   docker logs caderninho-web
   ```

3. Testar localmente no Raspberry Pi:
   ```bash
   curl http://localhost:3000
   ```

4. Verificar firewall:
   ```bash
   sudo ufw status
   sudo ufw allow 3000
   ```

### Build muito lento

O build pode levar 10-20 minutos na primeira vez no Raspberry Pi (ARM).
Builds subsequentes serão mais rápidos devido ao cache do Docker.

---

## 📊 Diferenças: Web vs Mobile

| Característica | App Mobile (APK) | App Web |
|---------------|------------------|---------|
| Instalação | Download e instala APK | Acesso direto via browser |
| Atualizações | Download novo APK | Automático ao recarregar |
| Offline | ✅ Funciona | ❌ Requer internet |
| Performance | Alta | Boa |
| Notificações | ✅ Suportado | ⚠️ Limitado |
| Uso | Android only | Qualquer dispositivo |

---

## 🔧 Configurações Avançadas

### Mudar Porta

Edite `docker-compose.web.yml`:
```yaml
ports:
  - "8080:3000"  # Mude 8080 para porta desejada
```

### HTTPS (SSL)

Para adicionar HTTPS, você precisará:
1. Certificado SSL (Let's Encrypt ou self-signed)
2. Modificar nginx-web.conf para incluir SSL
3. Expor porta 443

### Proxy Reverso

Se quiser usar um proxy reverso (nginx/traefik):
```nginx
location /caderninho {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

---

## 📁 Arquivos Criados

```
MobileApp/
├── Dockerfile.web           # Dockerfile multi-stage para build web
├── nginx-web.conf           # Configuração nginx para SPA
├── docker-compose.web.yml   # Orquestração do container
├── deploy-web.ps1           # Script de deploy automatizado
└── WEB_DEPLOY_GUIDE.md      # Este documento
```

---

## 🤝 Suporte

### Ajuda do Script

```powershell
.\deploy-web.ps1 -Help
```

### Logs Detalhados

```bash
# No Raspberry Pi
docker logs caderninho-web --tail 100 --follow
```

### Verificar Health Check

```bash
docker inspect caderninho-web | grep -A 10 Health
```

---

## 🎯 Próximos Passos

- [ ] Configurar domínio personalizado
- [ ] Adicionar SSL/HTTPS
- [ ] Implementar CI/CD automático
- [ ] Adicionar monitoramento (Prometheus/Grafana)
- [ ] PWA com service workers para offline

---

## 📝 Notas

- A aplicação web usa React Native Web, portanto a maior parte do código é compartilhada com o app mobile
- O build é feito no Raspberry Pi para garantir compatibilidade ARM
- Nginx serve os arquivos estáticos e faz o roteamento SPA
- O container reinicia automaticamente após reboot do Raspberry Pi

---

**Desenvolvido para Caderninho Financeiro** 💰
