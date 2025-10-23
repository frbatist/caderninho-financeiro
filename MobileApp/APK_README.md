# 📱 Build APK Android - Quick Start

## 🚀 Build e Deploy em 3 Passos

### 1. Instalar Dependências
```powershell
npm install -g eas-cli
eas login
```

### 2. Build do APK
```powershell
cd MobileApp
.\build-apk.ps1
```

### 3. Acessar
- 📥 Download: **http://10.0.0.131:8080**
- 🔌 API: **http://10.0.0.131:5000**

---

## 📖 Documentação Completa

Leia: **[BUILD_DEPLOY_GUIDE.md](BUILD_DEPLOY_GUIDE.md)**

---

## ⚡ Comandos Rápidos

```powershell
# Build apenas (sem deploy)
.\build-apk.ps1 -BuildOnly

# Deploy apenas (APK já existe)
.\build-apk.ps1 -DeployOnly

# Monitorar logs
ssh frbatist@10.0.0.131 "docker logs -f caderninho-apk"
```

---

## 🎯 O que foi criado?

- ✅ `eas.json` - Configuração Expo EAS Build
- ✅ `build-apk.ps1` - Script automatizado
- ✅ `docker/` - Servidor NGINX para hospedar APKs
- ✅ `BUILD_DEPLOY_GUIDE.md` - Guia completo

---

## 📊 Arquitetura

```
┌─────────────┐
│ Seu PC      │ → Build APK (Expo Cloud)
└──────┬──────┘
       │
       ↓ Deploy
┌─────────────────────┐
│ Raspberry Pi        │
│                     │
│  Port 5000: API     │ ← Backend .NET
│  Port 8080: APK     │ ← Servidor Downloads
└─────────────────────┘
       ↑
       │ Download/Update
┌──────┴──────┐
│ Android     │
│ Devices     │
└─────────────┘
```

---

## ✅ Resultados

Após deploy:
- 📱 App Android disponível para download
- 🌐 Página web com detecção automática de versão
- 📊 Histórico de versões mantido
- 🔄 Sistema de updates pronto

---

**Pronto para distribuir! 🎉**
