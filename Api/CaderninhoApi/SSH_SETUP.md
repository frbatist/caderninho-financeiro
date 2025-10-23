# 🔐 Configuração de Credenciais SSH

## 📋 Setup Inicial

### 1. Criar arquivo .env

```powershell
# Copiar template
cp .env.example .env

# Editar com suas credenciais
notepad .env
```

### 2. Preencher credenciais no .env

```bash
# .env
RASPBERRY_PI_HOST=10.0.0.131
RASPBERRY_PI_USER=frbatist
RASPBERRY_PI_PASSWORD=sua_senha_aqui

REGISTRY_HOST=10.0.0.131:5001
CONTAINER_NAME=caderninho-api
CONTAINER_PORT=5000
IMAGE_NAME=caderninho-api
IMAGE_TAG=latest
```

⚠️ **IMPORTANTE:** O arquivo `.env` está no `.gitignore` e NÃO será commitado!

---

## 🔑 Opções de Autenticação SSH

### Opção 1: Senha (Requer PuTTY no Windows) ⭐ Mais Fácil

**Windows:**

1. **Instalar PuTTY** (inclui `plink`):
   - Download: https://www.putty.org/
   - Ou via Chocolatey: `choco install putty`
   - Ou via winget: `winget install PuTTY.PuTTY`

2. **Criar .env com senha:**
   ```bash
   RASPBERRY_PI_PASSWORD=sua_senha
   ```

3. **Deploy:**
   ```powershell
   .\deploy.ps1 -RemoteDeploy
   ```

**Linux/Mac:**
```bash
# Já suporta senha via sshpass
sudo apt install sshpass  # Ubuntu/Debian
brew install sshpass      # Mac

# Deploy
./deploy.sh --deploy
```

### Opção 2: Chave SSH (Recomendado) ⭐ Mais Seguro

**Vantagens:**
- ✅ Mais seguro (sem senha em arquivo)
- ✅ Não precisa instalar nada extra
- ✅ Funciona automaticamente

**Setup:**

1. **Gerar chave SSH** (uma vez):
   ```powershell
   # Windows PowerShell / Linux / Mac
   ssh-keygen -t ed25519 -C "deploy-caderninho"
   
   # Pressione Enter 3x (sem senha na chave)
   # Chave salva em: ~/.ssh/id_ed25519
   ```

2. **Copiar chave para Raspberry Pi:**
   ```powershell
   # Windows (manual)
   type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh frbatist@10.0.0.131 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
   
   # Linux/Mac (automático)
   ssh-copy-id frbatist@10.0.0.131
   ```

3. **Testar conexão:**
   ```powershell
   ssh frbatist@10.0.0.131
   # Deve conectar SEM pedir senha! ✅
   ```

4. **Deploy (sem precisar de senha):**
   ```powershell
   .\deploy.ps1 -RemoteDeploy
   ```

---

## 🚀 Como Usar

### Com .env (Recomendado)

```powershell
# 1. Criar .env uma vez
cp .env.example .env
notepad .env  # Preencher senha

# 2. Deploy (usa credenciais do .env)
.\deploy.ps1 -RemoteDeploy
```

### Com Parâmetros

```powershell
# Passar senha diretamente (não recomendado - fica no histórico)
.\deploy.ps1 -RemoteDeploy `
    -RaspberryPiUser "frbatist" `
    -RaspberryPiPassword "sua_senha" `
    -RaspberryPiHost "10.0.0.131"
```

### Com Chave SSH (Sem senha)

```powershell
# Após configurar chave SSH, apenas:
.\deploy.ps1 -RemoteDeploy
```

---

## 🔍 Troubleshooting

### Erro: "plink não está instalado"

**Solução:**
```powershell
# Opção 1: Instalar PuTTY
winget install PuTTY.PuTTY

# Opção 2: Usar chave SSH (não precisa plink)
ssh-keygen -t ed25519
ssh-copy-id frbatist@10.0.0.131
```

### Erro: "Permission denied (publickey,password)"

**Causa:** Senha errada ou chave SSH não configurada.

**Soluções:**

1. **Verificar senha no .env:**
   ```powershell
   cat .env | Select-String "PASSWORD"
   ```

2. **Testar SSH manualmente:**
   ```powershell
   ssh frbatist@10.0.0.131
   # Se pedir senha, digite manualmente
   ```

3. **Reconfigurar chave SSH:**
   ```powershell
   ssh-keygen -t ed25519
   type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh frbatist@10.0.0.131 "cat >> ~/.ssh/authorized_keys"
   ```

### Erro: "Connection refused"

**Verificações:**

1. **Raspberry Pi está ligado?**
   ```powershell
   ping 10.0.0.131
   ```

2. **SSH está habilitado no Pi?**
   ```bash
   # No Raspberry Pi
   sudo systemctl status ssh
   sudo systemctl enable ssh
   sudo systemctl start ssh
   ```

3. **Firewall bloqueando?**
   ```bash
   # No Raspberry Pi
   sudo ufw allow ssh
   ```

### Erro: "Host key verification failed"

**Causa:** Raspberry Pi foi reinstalado ou IP mudou.

**Solução:**
```powershell
# Remover chave antiga
ssh-keygen -R 10.0.0.131

# Conectar novamente (vai adicionar nova chave)
ssh frbatist@10.0.0.131
# Digite "yes" quando perguntar
```

---

## 🔒 Segurança

### ✅ Boas Práticas

1. **Nunca commitar .env:**
   ```bash
   # Verificar se está no .gitignore
   cat .gitignore | grep ".env"
   ```

2. **Usar chave SSH em vez de senha:**
   - Mais seguro
   - Não expõe senha em arquivo
   - Pode usar passphrase adicional

3. **Senha forte no Raspberry Pi:**
   ```bash
   # Mudar senha (no Raspberry Pi)
   passwd
   ```

4. **Desabilitar login root via SSH:**
   ```bash
   # No Raspberry Pi
   sudo nano /etc/ssh/sshd_config
   # Adicionar: PermitRootLogin no
   sudo systemctl restart ssh
   ```

### ⚠️ O que NÃO fazer

❌ Commitar .env no git
❌ Passar senha em linha de comando (fica no histórico)
❌ Usar senha fraca
❌ Compartilhar chave privada SSH
❌ Usar mesma senha para tudo

---

## 📚 Referências

- [SSH Key Generation](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)
- [PuTTY Download](https://www.putty.org/)
- [Raspberry Pi SSH Setup](https://www.raspberrypi.com/documentation/computers/remote-access.html)

---

## ✅ Checklist

Setup inicial:
- [ ] Criar arquivo .env (cp .env.example .env)
- [ ] Preencher credenciais no .env
- [ ] Verificar .env não está no git (git status)
- [ ] Escolher método: Senha (PuTTY) ou Chave SSH

Se usar senha:
- [ ] Instalar PuTTY (Windows)
- [ ] Testar: plink -ssh -pw senha user@host "echo teste"

Se usar chave SSH:
- [ ] Gerar chave: ssh-keygen -t ed25519
- [ ] Copiar para Pi: ssh-copy-id user@host
- [ ] Testar: ssh user@host (sem senha)

Deploy:
- [ ] Executar: .\deploy.ps1 -RemoteDeploy
- [ ] Verificar: docker ps (no Pi)
- [ ] Acessar: http://10.0.0.131:5000/swagger
