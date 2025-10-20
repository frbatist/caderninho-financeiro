# Configuração CORS - Caderninho Financeiro API

## ✅ CORS Configurado

A API foi configurada para aceitar requisições de **qualquer origem** (AllowAnyOrigin), ideal para desenvolvimento local.

### 📝 Alterações no Program.cs

#### 1. Registro do Serviço CORS (antes de `builder.Build()`)

```csharp
// Configurar CORS para aceitar qualquer origem (apenas para ambiente local)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()      // Aceita qualquer origem
              .AllowAnyMethod()      // Aceita qualquer método (GET, POST, PUT, DELETE, etc.)
              .AllowAnyHeader();     // Aceita qualquer header
    });
});
```

#### 2. Middleware CORS (no pipeline da aplicação)

```csharp
// Habilitar CORS
app.UseCors("AllowAll");
```

⚠️ **IMPORTANTE**: O middleware `UseCors()` deve vir **antes** de `UseAuthorization()` e `UseRouting()` para funcionar corretamente.

### 🔧 Ordem Correta do Pipeline

```csharp
var app = builder.Build();

// 1. Inicialização do banco
using (var scope = app.Services.CreateScope()) { ... }

// 2. OpenAPI (se desenvolvimento)
if (app.Environment.IsDevelopment()) { app.MapOpenApi(); }

// 3. CORS (ANTES de autorização)
app.UseCors("AllowAll");

// 4. Autorização
app.UseAuthorization();

// 5. Controllers
app.MapControllers();

// 6. Executar
app.Run();
```

### 🌐 O Que Isso Permite

✅ Requisições do navegador (http://localhost:19006 - Expo Web)
✅ Requisições de apps mobile (Android/iOS emuladores)
✅ Requisições de qualquer origem durante desenvolvimento
✅ Métodos: GET, POST, PUT, DELETE, PATCH, OPTIONS
✅ Headers customizados (Authorization, Content-Type, etc.)

### 🧪 Testando CORS

#### Teste Manual no Browser Console

```javascript
// Cole isso no console do navegador em http://localhost:19006
fetch('http://localhost:5054/api/expenses?page=1&pageSize=10')
  .then(res => res.json())
  .then(data => console.log('✅ CORS OK:', data))
  .catch(err => console.error('❌ CORS Erro:', err));
```

#### Response Headers Esperados

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: *
Access-Control-Allow-Headers: *
```

### ⚙️ Configurações de Produção (NÃO IMPLEMENTADO)

Para produção, você deve restringir as origens permitidas:

```csharp
// ⚠️ NÃO USE AllowAnyOrigin() em produção!
builder.Services.AddCors(options =>
{
    options.AddPolicy("Production", policy =>
    {
        policy.WithOrigins(
                "https://meuapp.com",
                "https://www.meuapp.com"
              )
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Se precisar de cookies/auth
    });
});
```

### 🔒 Segurança - Ambiente Local

Como o projeto é apenas para **ambiente local**, a configuração `AllowAnyOrigin()` é aceitável porque:

- ✅ Não será exposto à internet
- ✅ Facilita o desenvolvimento
- ✅ Permite testar de múltiplos dispositivos na mesma rede
- ✅ Não há dados sensíveis de produção

### 📱 Origens Comuns no Desenvolvimento

- **Expo Web**: `http://localhost:19006`
- **Expo Web (IP)**: `http://192.168.x.x:19006`
- **React Web**: `http://localhost:3000`
- **Postman**: `chrome-extension://...`
- **Android Emulator**: `http://10.0.2.2:5054`
- **iOS Simulator**: `http://localhost:5054`

### 🐛 Troubleshooting

#### Erro: "No 'Access-Control-Allow-Origin' header is present"

**Causa**: CORS não está habilitado ou na ordem errada

**Solução**: 
1. Confirme que `app.UseCors("AllowAll")` está presente
2. Confirme que está ANTES de `UseAuthorization()`
3. Reinicie a API

#### Erro: "CORS policy: credentials mode is 'include'"

**Causa**: Frontend está enviando `credentials: 'include'` mas API usa `AllowAnyOrigin()`

**Solução**:
```typescript
// No apiService.ts, remova credentials ou mude CORS na API
const api = axios.create({
  baseURL: API_BASE_URL,
  // credentials: 'include', // ❌ Remova isso
});
```

#### Preflight Request Falhando (OPTIONS)

**Causa**: API não está respondendo a requisições OPTIONS

**Solução**: CORS automaticamente lida com isso. Confirme que:
- Controllers estão acessíveis via rota
- Não há middleware bloqueando OPTIONS

### ✅ Status Atual

```
Policy Name: AllowAll
Origins: * (Any)
Methods: * (Any)
Headers: * (Any)
Credentials: Not Allowed (devido a AllowAnyOrigin)
```

### 📋 Próximos Passos

Se você quiser **preparar para produção futura**:

1. Criar uma policy específica por ambiente
2. Usar variáveis de ambiente para origens permitidas
3. Implementar autenticação (JWT)
4. Adicionar rate limiting
5. Configurar HTTPS

### 🔄 Reiniciar a API

Para aplicar as mudanças:

```powershell
# Parar a API (Ctrl+C no terminal)
# Depois executar novamente
cd "c:\Users\fbati\source\repos\caderninho-financeiro\Api\CaderninhoApi\CaderninhoApi"
dotnet run
```

Agora sua API deve aceitar requisições do Expo Web sem problemas de CORS! 🚀
