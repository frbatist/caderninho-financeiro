# Migrations Automáticas - Caderninho Financeiro API

## ✅ Configuração Implementada

A API agora executa **automaticamente** todas as migrations pendentes na inicialização.

### 🔧 O Que Foi Adicionado

No arquivo `Program.cs`, foi adicionado o seguinte código:

```csharp
// Aplicar migrations e inicializar banco de dados na inicialização da aplicação
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    
    try
    {
        // Aplicar migrations pendentes automaticamente
        logger.LogInformation("Verificando e aplicando migrations...");
        await context.Database.MigrateAsync();
        logger.LogInformation("Migrations aplicadas com sucesso");
        
        // Inicializar dados seed
        await DatabaseInitializer.InitializeAsync(scope.ServiceProvider, logger);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro ao aplicar migrations ou inicializar banco de dados");
        throw;
    }
}
```

### 🎯 Funcionamento

1. **Ao iniciar a aplicação**:
   - ✅ Verifica se há migrations pendentes
   - ✅ Aplica automaticamente todas as migrations que faltam
   - ✅ Cria o banco de dados se não existir
   - ✅ Atualiza o schema para a versão mais recente
   - ✅ Executa o seed de dados iniciais

2. **Logs no console**:
   ```
   info: Program[0]
         Verificando e aplicando migrations...
   info: Microsoft.EntityFrameworkCore.Database.Command[20101]
         Executing DbCommand [Parameters=[], CommandType='Text', CommandTimeout='30']
         PRAGMA journal_mode = 'wal';
   info: Program[0]
         Migrations aplicadas com sucesso
   info: CaderninhoApi.Infrastructure.Data.DatabaseInitializer[0]
         Inicializando banco de dados...
   ```

### 📋 Benefícios

✅ **Não precisa mais executar `dotnet ef database update` manualmente**
✅ **Banco sempre atualizado** ao iniciar a aplicação
✅ **Deploy simplificado** - só precisa executar a aplicação
✅ **Desenvolvimento ágil** - migrations aplicadas automaticamente
✅ **Logs claros** de todas as operações
✅ **Tratamento de erros** - aplicação não inicia se migrations falharem

### 🚀 Como Usar

#### 1. Criar uma Nova Migration

```powershell
cd Api\CaderninhoApi\CaderninhoApi
dotnet ef migrations add NomeDaMigration
```

#### 2. Executar a API

```powershell
# Opção 1: Via dotnet run
dotnet run

# Opção 2: Via debug no VS Code
# Pressione F5
```

**As migrations serão aplicadas automaticamente!** 🎉

### 🔄 Fluxo Completo

```
Iniciar API
    │
    ├─► Criar scope de serviços
    │
    ├─► Obter ApplicationDbContext
    │
    ├─► Executar context.Database.MigrateAsync()
    │   │
    │   ├─► Verificar versão do banco
    │   ├─► Comparar com migrations no código
    │   ├─► Aplicar migrations pendentes
    │   └─► Atualizar __EFMigrationsHistory
    │
    ├─► Executar DatabaseInitializer (seed)
    │   │
    │   ├─► Verificar se dados já existem
    │   └─► Inserir dados iniciais se necessário
    │
    └─► API pronta para receber requisições ✅
```

### 🗃️ Tabela de Migrations

O Entity Framework mantém uma tabela `__EFMigrationsHistory` no banco:

| MigrationId | ProductVersion |
|-------------|----------------|
| 20251013175101_InitialCreate | 9.0.0 |
| 20251013183931_AddCardEntity | 9.0.0 |

Essa tabela rastreia quais migrations já foram aplicadas.

### ⚙️ Quando as Migrations São Aplicadas

#### Cenários:

1. **Primeiro run (banco não existe)**:
   - Cria o banco de dados
   - Aplica TODAS as migrations
   - Executa seed de dados

2. **Banco existe, sem migrations pendentes**:
   - Não faz nada
   - Apenas executa seed se necessário

3. **Banco existe, COM migrations pendentes**:
   - Aplica apenas as migrations que faltam
   - Atualiza o schema
   - Executa seed se necessário

4. **Erro durante migration**:
   - Aplicação **não inicia**
   - Erro é logado
   - Exception é lançada

### 🛠️ Troubleshooting

#### Erro: "A network-related or instance-specific error"

**Causa**: Banco de dados inacessível

**Solução**: Verifique a connection string em `appsettings.json`

#### Erro: "No migrations were found"

**Causa**: Migrations não compiladas ou não encontradas

**Solução**:
```powershell
# Recompilar o projeto
dotnet build

# Listar migrations disponíveis
dotnet ef migrations list
```

#### Erro: "The database operation expected to affect 1 row(s)"

**Causa**: Conflito de concorrência

**Solução**:
```powershell
# Deletar banco e recriar
rm caderninho.db
dotnet run  # Recriará automaticamente
```

#### Banco em estado inconsistente

**Solução 1: Reset completo**
```powershell
# Deletar banco
rm caderninho.db
rm caderninho.db-shm
rm caderninho.db-wal

# Reiniciar API - criará tudo do zero
dotnet run
```

**Solução 2: Reverter migrations**
```powershell
# Reverter para migration específica
dotnet ef database update NomeDaMigration

# Reverter todas
dotnet ef database update 0
```

### 🔒 Ambiente de Produção

Para produção, você pode querer desabilitar migrations automáticas:

```csharp
// Aplicar migrations apenas em Development
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        // ... código de migrations ...
    }
}
else
{
    // Em produção, use scripts SQL ou deploy separado
}
```

### 📊 Verificar Status das Migrations

#### Via CLI

```powershell
# Listar todas as migrations
dotnet ef migrations list

# Ver migrations pendentes
dotnet ef database update --verbose --dry-run

# Ver histórico aplicado no banco
dotnet ef migrations list --connection "Data Source=caderninho.db"
```

#### Via Código (durante debug)

```csharp
// No Program.cs ou em qualquer lugar com ApplicationDbContext
var pendingMigrations = await context.Database.GetPendingMigrationsAsync();
var appliedMigrations = await context.Database.GetAppliedMigrationsAsync();

logger.LogInformation("Pendentes: {Count}", pendingMigrations.Count());
logger.LogInformation("Aplicadas: {Count}", appliedMigrations.Count());
```

### ✨ Próximas Migrations

Quando você criar novas migrations, elas serão aplicadas automaticamente:

```powershell
# 1. Adicionar nova coluna à entidade Expense
# public string? Notes { get; set; }

# 2. Criar migration
dotnet ef migrations add AddNotesToExpense

# 3. Executar API - migration aplicada automaticamente!
dotnet run
```

### 🎉 Pronto!

Agora você não precisa mais se preocupar em executar `dotnet ef database update`. 

**As migrations são aplicadas automaticamente sempre que a API iniciar!** 🚀

### 📝 Comandos Úteis

```powershell
# Ver migrations
dotnet ef migrations list

# Criar nova migration
dotnet ef migrations add NomeDaMigration

# Remover última migration (se não aplicada)
dotnet ef migrations remove

# Gerar script SQL de uma migration
dotnet ef migrations script

# Ver detalhes de uma migration específica
dotnet ef migrations script InitialCreate AddCardEntity

# Verificar status do banco
dotnet ef database update --verbose --dry-run
```
