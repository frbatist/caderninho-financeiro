# 📱 Build e Deploy do APK Android

## 🎯 Visão Geral

Sistema completo para:
1. ✅ Build do APK Android via Expo EAS
2. ✅ Hospedagem do APK no Raspberry Pi
3. ✅ Página de download com detecção automática de versão
4. ✅ Atualizações OTA (Over-The-Air)

---

## 🚀 Quick Start

### 1. Primeira vez - Build do APK

```powershell
cd MobileApp
npm install
.\build-apk.ps1
```

O script vai:
1. Verificar dependências (Node.js, EAS CLI)
2. Fazer login no Expo (criar conta se necessário)
3. Iniciar build na nuvem Expo (10-15 minutos)
4. Baixar APK automaticamente

### 2. Deploy no Raspberry Pi

Após o build:
1. APK será baixado para `MobileApp/apk/`
2. Execute: `.\build-apk.ps1`
3. Confirme deploy quando solicitado

**Resultado:**
- 📥 Download: http://10.0.0.131:8080
- 📂 APKs: http://10.0.0.131:8080/apk/
- 🔄 API Updates: http://10.0.0.131:8080/updates/latest.json

---

## 📋 Pré-requisitos

### No PC
- ✅ Node.js 18+ (https://nodejs.org/)
- ✅ Conta Expo (https://expo.dev/signup)
- ✅ Git
- ✅ PowerShell 7+

### No Raspberry Pi
- ✅ Docker instalado
- ✅ Portas 5000 (API) e 8080 (APK) disponíveis
- ✅ SSH configurado

---

## 🔧 Configuração Detalhada

### 1. Instalar Dependências

```powershell
# Node.js
winget install OpenJS.NodeJS

# EAS CLI
npm install -g eas-cli

# Verificar
node --version
npm --version
eas --version
```

### 2. Configurar Expo

```powershell
cd MobileApp

# Login
eas login

# Configurar projeto
eas build:configure
```

### 3. Atualizar API URL

Edite `MobileApp/src/constants/api.ts`:

```typescript
export const API_BASE_URL = 'http://10.0.0.131:5000';
```

---

## 🏗️ Build do APK

### Opção 1: Build Automático (Recomendado)

```powershell
.\build-apk.ps1 -BuildOnly
```

### Opção 2: Build Manual

```powershell
# APK (internal testing)
eas build --platform android --profile preview

# AAB (Google Play)
eas build --platform android --profile production
```

### O que acontece no build?

1. **Código enviado** para servidores Expo
2. **Gradle build** no ambiente Android
3. **Signing** com credenciais Expo
4. **APK gerado** (~30-50 MB)
5. **Download link** disponibilizado

⏱️ **Tempo:** 10-15 minutos na primeira vez, 5-8 minutos depois

---

## 📤 Deploy no Raspberry Pi

### Estrutura no Raspberry Pi

```
~/caderninho-apk/
├── Dockerfile              # Imagem NGINX
├── nginx.conf             # Configuração servidor
├── index.html             # Página de download
├── apk/                   # APKs hospedados
│   ├── app-1.0.0.apk
│   ├── app-1.0.1.apk
│   └── latest.json        # Metadados versão
└── updates/               # Updates OTA
    └── latest.json
```

### Deploy Automático

```powershell
.\build-apk.ps1
```

### Deploy Manual

```powershell
# 1. Copiar APK para pasta local
cp build.apk MobileApp/apk/app-1.0.0.apk

# 2. Deploy
.\build-apk.ps1 -DeployOnly
```

---

## 🌐 Servidor de Downloads

### Endpoints Disponíveis

| Endpoint | Descrição |
|----------|-----------|
| `http://10.0.0.131:8080` | Página de download principal |
| `http://10.0.0.131:8080/apk/` | Lista de todos os APKs |
| `http://10.0.0.131:8080/updates/latest.json` | Metadados da versão atual |

### latest.json

```json
{
  "version": "1.0.0",
  "buildDate": "2025-10-23T00:00:00Z",
  "size": 45678901,
  "url": "/apk/app-1.0.0.apk",
  "fileName": "app-1.0.0.apk"
}
```

---

## 📲 Instalação no Android

### Para Usuários

1. Acesse no celular: http://10.0.0.131:8080
2. Clique em "Baixar APK"
3. Quando solicitado, permita "Fontes Desconhecidas"
4. Instale o app
5. Abra e use! 🎉

### Configuração "Fontes Desconhecidas"

**Android 8+:**
1. Configurações → Segurança
2. Instalação de apps desconhecidos
3. Permitir para o navegador

**Android 7 e anterior:**
1. Configurações → Segurança
2. Fontes desconhecidas → Ativar

---

## 🔄 Atualizações

### Adicionar Nova Versão

```powershell
# 1. Build nova versão
eas build --platform android --profile preview

# 2. Baixar APK para MobileApp/apk/

# 3. Renomear com versão
mv build.apk app-1.0.1.apk

# 4. Deploy
.\build-apk.ps1 -DeployOnly
```

### Histórico de Versões

Todas as versões ficam em: http://10.0.0.131:8080/apk/

Usuários podem:
- ✅ Ver lista completa
- ✅ Baixar versão específica
- ✅ Verificar tamanho/data

---

## 🎨 Personalização

### Alterar Nome do App

`MobileApp/app.json`:
```json
{
  "expo": {
    "name": "Seu App",
    "slug": "seu-app"
  }
}
```

### Alterar Ícone

Substitua:
- `assets/icon.png` (1024x1024)
- `assets/adaptive-icon.png` (1024x1024)
- `assets/splash-icon.png` (1242x2436)

### Alterar Cores

`MobileApp/docker/index.html` - modificar CSS:
```css
background: linear-gradient(135deg, #SUA_COR_1 0%, #SUA_COR_2 100%);
```

---

## 🐛 Troubleshooting

### Build falha no Expo

**Erro:** "Build failed"
```powershell
# Ver logs detalhados
eas build:list

# Limpar cache
eas build --platform android --profile preview --clear-cache
```

### Container não inicia

```bash
# SSH no Pi
ssh frbatist@10.0.0.131

# Ver logs
docker logs caderninho-apk

# Reiniciar
docker restart caderninho-apk
```

### APK não aparece na listagem

```bash
# Verificar permissões
ssh frbatist@10.0.0.131
ls -la ~/caderninho-apk/apk/

# Corrigir permissões
chmod 644 ~/caderninho-apk/apk/*.apk
```

### Download falha no Android

**Verificar:**
1. Raspberry Pi está ligado?
2. Celular e Pi na mesma rede?
3. Porta 8080 aberta?

```bash
# Testar no PC
curl http://10.0.0.131:8080/updates/latest.json
```

---

## 📊 Monitoramento

### Ver logs em tempo real

```powershell
ssh frbatist@10.0.0.131 "docker logs -f caderninho-apk"
```

### Ver acessos

```bash
# Logs do NGINX
ssh frbatist@10.0.0.131
docker exec caderninho-apk cat /var/log/nginx/access.log
```

### Estatísticas

```bash
# Quantos APKs hospedados
ssh frbatist@10.0.0.131 "ls -1 ~/caderninho-apk/apk/*.apk | wc -l"

# Espaço usado
ssh frbatist@10.0.0.131 "du -sh ~/caderninho-apk"
```

---

## 🔐 Segurança

### ⚠️ Importante

Este setup é para **uso interno/desenvolvimento**. Para produção:

1. **HTTPS** com certificado SSL
2. **Autenticação** (usuário/senha)
3. **Assinatura** do APK com sua própria keystore
4. **Publicação** na Google Play Store

### Melhorar Segurança

1. **Adicionar senha no NGINX:**
```nginx
location /apk/ {
    auth_basic "Downloads";
    auth_basic_user_file /etc/nginx/.htpasswd;
}
```

2. **Firewall:**
```bash
sudo ufw allow from 10.0.0.0/24 to any port 8080
```

---

## 📚 Referências

- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Android App Distribution](https://developer.android.com/distribute)
- [NGINX Docker](https://hub.docker.com/_/nginx)

---

## ✅ Checklist Completo

### Build
- [ ] Node.js instalado
- [ ] Conta Expo criada
- [ ] EAS CLI instalado
- [ ] `eas login` executado
- [ ] Build iniciado
- [ ] APK baixado

### Deploy
- [ ] APK em `MobileApp/apk/`
- [ ] Script executado
- [ ] Container rodando no Pi
- [ ] Página acessível

### Instalação
- [ ] Usuário acessa pelo celular
- [ ] Download funciona
- [ ] Instalação bem-sucedida
- [ ] App abre normalmente

### Atualização
- [ ] Nova versão buildada
- [ ] APK deployado
- [ ] Versão anterior preservada
- [ ] latest.json atualizado

---

**Tudo pronto para distribuir seu app! 📱🚀**
