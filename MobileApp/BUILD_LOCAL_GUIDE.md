# 🚀 Build Local do APK - Guia Rápido

## ✅ Vantagens do Build Local

- ✅ **Sem limite de builds** (Expo tem limite gratuito)
- ✅ **Sem fila de espera** (build direto no seu PC)
- ✅ **Mais rápido**: 4-5 minutos vs 10-15 minutos
- ✅ **Deploy automático** no Raspberry Pi
- ✅ **Controle total** do processo

---

## 🎯 Comando Principal

```powershell
.\build-local.ps1 -CopyToApk
```

**Esse comando faz TUDO automaticamente:**
1. ✅ Compila o APK localmente
2. ✅ Copia para `apk/caderninho-v{versão}-{timestamp}.apk`
3. ✅ Cria metadados `latest.json`
4. ✅ Faz upload para o Raspberry Pi via SCP
5. ✅ Atualiza/reinicia o container Docker
6. ✅ APK disponível para download em: http://10.0.0.131:8080

---

## 📋 Pré-requisitos (já instalados)

- ✅ Node.js v22.18.0
- ✅ Java JDK 17 (C:\Program Files\Microsoft\jdk-17.0.16.8-hotspot)
- ✅ Android SDK (%LOCALAPPDATA%\Android\Sdk)
- ✅ SSH configurado para o Raspberry Pi

---

## 🔧 Opções do Script

### Build completo + Deploy (Recomendado)
```powershell
.\build-local.ps1 -CopyToApk
```

### Build completo SEM deploy
```powershell
.\build-local.ps1 -CopyToApk -SkipDeploy
```

### Build e deixar APK na pasta android/
```powershell
.\build-local.ps1
```

### Especificar Raspberry Pi customizado
```powershell
.\build-local.ps1 -CopyToApk -RaspberryPiHost "192.168.1.100" -RaspberryPiUser "usuario"
```

---

## 📊 Processo Detalhado

```
1. Gradle Build (4-5 min)
   └─> android/app/build/outputs/apk/release/app-release.apk

2. Copiar e Renomear
   └─> apk/caderninho-v1.0.3-20251024-173811.apk

3. Criar Metadados
   └─> apk/latest.json

4. Upload via SCP
   ├─> Raspberry Pi: ~/caderninho-apk/apk/*.apk
   └─> Raspberry Pi: ~/caderninho-apk/updates/latest.json

5. Docker Update
   └─> Reinicia container NGINX

6. ✅ Disponível
   └─> http://10.0.0.131:8080
```

---

## 🔄 Workflow Típico

### Primeiro Build (executado)
```powershell
cd c:\dev\caderninho\MobileApp
npx expo prebuild --platform android --clean
.\build-local.ps1 -CopyToApk
```
⏱️ **Tempo:** ~5 minutos

### Builds Seguintes (apenas código mudou)
```powershell
.\build-local.ps1 -CopyToApk
```
⏱️ **Tempo:** ~4 minutos

### Se mudar dependências nativas (raro)
```powershell
npx expo prebuild --platform android --clean
.\build-local.ps1 -CopyToApk
```

---

## 🆚 Comparação: Local vs Nuvem

| Aspecto | Build Local | Build Nuvem (Expo) |
|---------|-------------|-------------------|
| **Tempo** | 4-5 min | 10-15 min |
| **Fila** | Nenhuma | Pode ter espera |
| **Limite** | Ilimitado | ~30 builds/mês (free) |
| **Deploy Auto** | ✅ Sim | ❌ Manual |
| **Internet** | Apenas deploy | Todo build |
| **Custo** | $0 | $0 (com limites) |

---

## 🎯 Resultado Final

Após executar `.\build-local.ps1 -CopyToApk`:

```
✅ APK Local: apk/caderninho-v1.0.3-20251024-173811.apk (62.2 MB)
✅ APK no Pi: ~/caderninho-apk/apk/caderninho-v1.0.3-20251024-173811.apk
✅ Download: http://10.0.0.131:8080
✅ Servidor: Container Docker NGINX rodando
```

---

## 🐛 Troubleshooting

### Erro: Java não encontrado
```powershell
$env:JAVA_HOME="C:\Program Files\Microsoft\jdk-17.0.16.8-hotspot"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
```

### Erro: Android SDK não encontrado
```powershell
$env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"
```

### Erro: SSH/SCP falha
Verifique se consegue conectar:
```powershell
ssh frbatist@10.0.0.131 "echo 'Conexão OK'"
```

### Rebuild completo (se algo estranho)
```powershell
Remove-Item -Recurse -Force android
npx expo prebuild --platform android --clean
.\build-local.ps1 -CopyToApk
```

---

## 📱 Instalar APK no Celular

### Opção 1: Download via Web (Recomendado)
1. No celular, acesse: http://10.0.0.131:8080
2. Clique em "Download APK"
3. Instale permitindo fontes desconhecidas

### Opção 2: Via USB
```powershell
# Conecte celular via USB
adb devices
adb install apk\caderninho-v1.0.3-20251024-173811.apk
```

### Opção 3: Compartilhar
- WhatsApp
- Email
- Google Drive
- etc.

---

## 🔄 Atualizar Versão

O script incrementa automaticamente a versão no `app.json` a cada build.

Para incrementar manualmente:
```powershell
# Edite app.json
"version": "1.0.4",  # Era 1.0.3
"versionCode": 5     # Era 4
```

---

**Pronto para desenvolvimento ágil! 🚀**
