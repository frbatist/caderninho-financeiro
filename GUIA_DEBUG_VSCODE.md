# Guia de Debug no VS Code - Caderninho Financeiro

## 🐛 Como Executar o Backend em Debug

### Método 1: Usando F5 (Recomendado)

1. **Abra o VS Code** na raiz do repositório `caderninho-financeiro`

2. **Coloque um breakpoint** em qualquer linha do código (clique na margem esquerda do editor)
   - Exemplo: Coloque um breakpoint no `Program.cs` ou em algum Controller

3. **Pressione F5** ou:
   - Vá em **Run and Debug** (Ctrl+Shift+D)
   - Selecione ".NET Core Launch (API)"
   - Clique no botão verde ▶️ "Start Debugging"

4. O VS Code irá:
   - ✅ Compilar o projeto automaticamente (`dotnet build`)
   - ✅ Iniciar a API em modo debug
   - ✅ Anexar o debugger
   - ✅ Abrir o navegador automaticamente quando estiver pronto

5. **Testar**:
   - Faça uma requisição do mobile app
   - O breakpoint será atingido
   - Use F10 (Step Over), F11 (Step Into), F5 (Continue)

### Método 2: Via Menu Run

1. Menu superior: **Run > Start Debugging**
2. Ou: **Run > Run Without Debugging** (Ctrl+F5) - sem breakpoints

### 🎯 Breakpoints

#### Onde Colocar Breakpoints Úteis

**Program.cs** - Inicialização da aplicação:
```csharp
var app = builder.Build(); // ← Breakpoint aqui
```

**ExpensesController.cs** - Endpoints:
```csharp
public async Task<ActionResult<PagedResponse<Expense>>> GetAll(
    [FromQuery] ExpenseFilterRequest filter)
{
    // ← Breakpoint aqui para debugar requisições
    var expenses = await _context.Expenses
```

**CardService.cs** - Serviços:
```csharp
public async Task<Card> CreateAsync(Card card)
{
    // ← Breakpoint aqui para debugar lógica de negócio
```

### 🔧 Atalhos de Debug

| Atalho | Ação | Descrição |
|--------|------|-----------|
| **F5** | Continue | Continua até próximo breakpoint |
| **F9** | Toggle Breakpoint | Adiciona/remove breakpoint |
| **F10** | Step Over | Executa linha atual |
| **F11** | Step Into | Entra dentro de métodos |
| **Shift+F11** | Step Out | Sai do método atual |
| **Ctrl+Shift+F5** | Restart | Reinicia o debug |
| **Shift+F5** | Stop | Para o debug |

### 📊 Painéis de Debug

Quando em debug, você verá:

1. **Variables** - Todas as variáveis locais e seus valores
2. **Watch** - Variáveis específicas que você quer monitorar
3. **Call Stack** - Pilha de chamadas de métodos
4. **Breakpoints** - Lista de todos os breakpoints ativos
5. **Debug Console** - Console interativo para avaliar expressões

#### Usar o Debug Console

Durante debug, você pode digitar expressões:
```csharp
// No Debug Console, digite:
filter.Year  // Ver valor da variável
expenses.Count  // Ver quantidade de items
_context.Expenses.Count()  // Executar queries
```

### 🎨 Configurações Disponíveis

#### `.vscode/launch.json`

Três configurações criadas:

1. **".NET Core Launch (API)"** - Principal
   - Compila e executa em debug
   - Abre navegador automaticamente
   - Usa ambiente Development

2. **".NET Core Attach"** - Anexar a processo
   - Para anexar debugger a processo já rodando

#### `.vscode/tasks.json`

Três tarefas criadas:

1. **build-api** - Compilar projeto
   ```
   Terminal > Run Task > build-api
   ```

2. **watch-api** - Executar com hot reload
   ```
   Terminal > Run Task > watch-api
   ```

3. **run-api** - Executar sem debug
   ```
   Terminal > Run Task > run-api
   ```

### 🔍 Debug de Requisições HTTP

#### Debugar Endpoint Específico

1. **Coloque breakpoint** no método do controller:
```csharp
[HttpPost]
public async Task<ActionResult<Expense>> Create([FromBody] CreateExpenseDto dto)
{
    // ← Breakpoint aqui
    var expense = new Expense
    {
        Description = dto.Description,
        // ...
```

2. **Inicie o debug** (F5)

3. **Faça a requisição** do mobile app ou Postman

4. **Debugger para** no breakpoint, você pode:
   - Ver valores de `dto`
   - Inspecionar `_context.Expenses`
   - Step into `_context.SaveChangesAsync()`

### 🧪 Debug de Testes Unitários

Para debugar testes:

1. Abra o arquivo de teste (ex: `ExpensesControllerTests.cs`)

2. Coloque um breakpoint no teste:
```csharp
[Fact]
public async Task GetAll_ShouldReturnPagedExpenses()
{
    // ← Breakpoint aqui
    var result = await _controller.GetAll(filter);
```

3. Clique no ícone "Debug Test" acima do método de teste
   - Ou clique com botão direito > "Debug Test"

### 🛠️ Troubleshooting

#### "Cannot find the path specified"

**Problema**: Caminho do DLL incorreto

**Solução**: Verifique se o caminho em `launch.json` está correto:
```json
"program": "${workspaceFolder}/Api/CaderninhoApi/CaderninhoApi/bin/Debug/net9.0/CaderninhoApi.dll"
```

#### "The preLaunchTask 'build-api' terminated with exit code 1"

**Problema**: Erro de compilação

**Solução**:
1. Veja o terminal "Tasks" para ver o erro
2. Corrija o erro de compilação
3. Tente F5 novamente

#### Breakpoints "Unverified" (não preenchidos)

**Problema**: Debugger não consegue mapear o código

**Solução**:
1. Pare o debug (Shift+F5)
2. Limpe o build: `dotnet clean`
3. Reconstrua: `dotnet build`
4. Inicie debug novamente

#### "Port already in use"

**Problema**: Processo anterior ainda rodando

**Solução**:
```powershell
# Encontrar processo na porta 5054
netstat -ano | findstr :5054

# Matar processo (substitua PID)
taskkill /PID <PID> /F
```

### 📱 Debug Completo (API + Mobile)

Para debugar API e Mobile simultaneamente:

1. **Terminal 1**: Inicie API em debug (F5)
2. **Terminal 2**: Inicie Expo
   ```powershell
   cd MobileApp
   npm run web
   ```
3. Use breakpoints em ambos os projetos

### 🌐 URLs de Debug

Quando a API estiver rodando em debug:

- **HTTP**: http://localhost:5054
- **Swagger/OpenAPI**: http://localhost:5054/openapi/v1.json
- **Healthcheck**: http://localhost:5054/api/expenses

### 📋 Checklist de Debug

Antes de debugar, confirme:

- ✅ Extensão C# instalada no VS Code
- ✅ .NET 9 SDK instalado (`dotnet --version`)
- ✅ Workspace aberto na raiz do repositório
- ✅ Arquivos `.vscode/launch.json` e `.vscode/tasks.json` criados
- ✅ Projeto compila sem erros (`dotnet build`)

### 💡 Dicas Avançadas

#### Conditional Breakpoints

Clique com botão direito no breakpoint > Edit Breakpoint > Condition:
```csharp
// Parar apenas quando year == 2025
filter.Year == 2025
```

#### Logpoints

Ao invés de breakpoint, adicione log sem parar a execução:
```csharp
// Clique direito > Add Logpoint
Expense criado: {expense.Id} - {expense.Description}
```

#### Watch Expressions

No painel Watch, adicione expressões para monitorar:
```csharp
_context.Expenses.Count()
expenses.Where(e => e.Amount > 100).ToList()
```

### 🚀 Pronto!

Agora você pode:
- ✅ Debugar a API com breakpoints
- ✅ Inspecionar variáveis em tempo real
- ✅ Step through do código
- ✅ Debugar testes unitários
- ✅ Usar todas as ferramentas do VS Code debugger

**Pressione F5 e bom debug!** 🐛🔍
