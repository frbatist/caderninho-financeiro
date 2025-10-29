# 🐛 Guia de Debug - Caderninho Financeiro

## 📱 Debug do APK Instalado via USB

### 1. **Conectar o Celular**

```powershell
# Verificar se está conectado
$env:Path="$env:LOCALAPPDATA\Android\Sdk\platform-tools;$env:Path"
adb devices
```

Deve aparecer seu dispositivo com status `device`.

---

### 2. **Monitorar Logs em Tempo Real**

```powershell
# Limpar logs antigos
adb logcat -c

# Iniciar monitoramento (Erros + JavaScript)
adb logcat *:E ReactNativeJS:V chromium:V
```

**Filtros Disponíveis:**

```powershell
# Apenas JavaScript/React Native (mais limpo)
adb logcat -s ReactNativeJS:V

# Erros graves do app
adb logcat -s AndroidRuntime:E

# Todas as categorias (muito verbose)
adb logcat

# Salvar logs em arquivo
adb logcat > logs.txt
```

---

### 3. **Ver Logs do `console.log()` no Código**

Quando você usa no código:
```typescript
console.log('Teste de debug');
console.error('Erro encontrado');
console.warn('Aviso importante');
```

Os logs aparecem com a tag **`ReactNativeJS`**:
```
10-24 17:54:45.123 12345 12345 V ReactNativeJS: 'Teste de debug'
10-24 17:54:45.124 12345 12345 E ReactNativeJS: 'Erro encontrado'
10-24 17:54:45.125 12345 12345 W ReactNativeJS: 'Aviso importante'
```

---

### 4. **Filtrar Apenas seu App**

```powershell
# Descobrir o PID do app
adb shell ps | findstr "caderninho"

# Filtrar logs apenas desse processo (substitua 12345 pelo PID)
adb logcat --pid=12345
```

---

### 5. **Inspecionar Rede (Requisições HTTP)**

```powershell
# Ver requisições de rede
adb logcat -s NetworkRequest:V
```

Para ver detalhes das chamadas à API, adicione no código:

```typescript
// src/services/apiService.ts
axios.interceptors.request.use(request => {
  console.log('🔵 REQUEST:', request.method, request.url, request.data);
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log('🟢 RESPONSE:', response.status, response.data);
    return response;
  },
  error => {
    console.error('🔴 ERROR:', error.message, error.response?.data);
    return Promise.reject(error);
  }
);
```

---

### 6. **Debug com Chrome DevTools (APK Debug Build)**

⚠️ **Nota:** O APK release não suporta debug remoto. Para isso, você precisa de um **Debug Build**.

#### Criar Debug Build:

```powershell
cd android
.\gradlew assembleDebug
```

APK gerado em: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Instalar e Conectar:

```powershell
# Instalar APK debug
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Abrir o app no celular

# Habilitar port forwarding
adb reverse tcp:8081 tcp:8081

# Abrir DevTools no navegador
# No Chrome: chrome://inspect
```

---

### 7. **Ver Crashes em Tempo Real**

```powershell
# Monitorar crashes
adb logcat -s AndroidRuntime:E ReactNativeJS:E
```

Quando o app crashar, você verá o stack trace completo.

---

### 8. **Comandos Úteis**

```powershell
# Reinstalar APK mantendo dados
adb install -r caminho/do/app.apk

# Desinstalar app
adb uninstall com.caderninho.financeiro

# Limpar dados do app (sem desinstalar)
adb shell pm clear com.caderninho.financeiro

# Abrir app pelo terminal
adb shell am start -n com.caderninho.financeiro/.MainActivity

# Forçar fechar app
adb shell am force-stop com.caderninho.financeiro

# Ver informações do app
adb shell dumpsys package com.caderninho.financeiro

# Screenshot
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png
```

---

### 9. **Debug de Performance**

```powershell
# Ver uso de CPU/memória
adb shell top | findstr "caderninho"

# Memória detalhada
adb shell dumpsys meminfo com.caderninho.financeiro

# Monitorar FPS
adb shell dumpsys gfxinfo com.caderninho.financeiro
```

---

### 10. **Script PowerShell para Debug Rápido**

Criar arquivo `debug.ps1`:

```powershell
#!/usr/bin/env pwsh
param(
    [switch]$Clear,
    [switch]$Install,
    [string]$ApkPath = "apk\caderninho-v1.0.3-20251024-173811.apk"
)

$env:Path="$env:LOCALAPPDATA\Android\Sdk\platform-tools;$env:Path"

if ($Install) {
    Write-Host "Instalando APK..." -ForegroundColor Cyan
    adb install -r $ApkPath
}

if ($Clear) {
    Write-Host "Limpando logs..." -ForegroundColor Yellow
    adb logcat -c
}

Write-Host @"

===========================================
    Debug - Caderninho Financeiro
===========================================

Dispositivo: $(adb devices | Select-Object -Skip 1)

Pressione Ctrl+C para parar

===========================================

"@ -ForegroundColor Cyan

# Monitorar logs
adb logcat -s ReactNativeJS:V AndroidRuntime:E
```

Usar:
```powershell
.\debug.ps1                    # Apenas logs
.\debug.ps1 -Install           # Instala APK e mostra logs
.\debug.ps1 -Clear             # Limpa logs antigos
```

---

## 🎯 Workflow Recomendado

### Desenvolvimento Diário:

1. **Faça alterações no código**
2. **Build local:**
   ```powershell
   .\build-local.ps1 -CopyToApk -SkipDeploy
   ```
3. **Instale no celular:**
   ```powershell
   adb install -r apk\caderninho-v*.apk
   ```
4. **Monitor logs:**
   ```powershell
   adb logcat -s ReactNativeJS:V
   ```
5. **Teste no celular**

---

## 📊 Níveis de Log

| Símbolo | Nível | Uso |
|---------|-------|-----|
| V | Verbose | Detalhes técnicos |
| D | Debug | Informações de debug |
| I | Info | Informações gerais |
| W | Warning | Avisos |
| E | Error | Erros |
| F | Fatal | Crashes |

**Exemplo de filtro:**
```powershell
# Apenas warnings e erros
adb logcat *:W
```

---

## 🔍 Exemplo de Output de Logs

```
10-24 17:54:45.123 22564 22664 I ReactNativeJS: 'App iniciado'
10-24 17:54:45.234 22564 22664 V ReactNativeJS: 'Conectando à API: http://10.0.0.131:5000'
10-24 17:54:45.456 22564 22664 V ReactNativeJS: '🔵 REQUEST: GET /api/users'
10-24 17:54:45.789 22564 22664 V ReactNativeJS: '🟢 RESPONSE: 200 [...]'
10-24 17:54:46.012 22564 22664 E ReactNativeJS: '🔴 ERROR: Network request failed'
10-24 17:54:46.123 22564 22564 E AndroidRuntime: FATAL EXCEPTION: main
10-24 17:54:46.123 22564 22564 E AndroidRuntime: Process: com.caderninho.financeiro, PID: 22564
10-24 17:54:46.123 22564 22564 E AndroidRuntime: java.lang.RuntimeException: ...
```

---

## ✅ Checklist de Debug

- [ ] Celular conectado via USB (`adb devices`)
- [ ] Depuração USB habilitada no celular
- [ ] Logcat rodando (`adb logcat`)
- [ ] App instalado e aberto
- [ ] Logs do JavaScript aparecendo
- [ ] Testando funcionalidade específica
- [ ] Capturando erros e stack traces

---

**Pronto para debugar! 🐛🔍**
