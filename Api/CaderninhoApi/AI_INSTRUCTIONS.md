# Instru��es de IA - Caderninho Financeiro

## Vis�o Geral do Projeto
Este � um sistema financeiro desenvolvido em .NET 9 com arquitetura limpa (Clean Architecture). O projeto segue os princ�pios de Domain-Driven Design (DDD) e tem como objetivo fornecer uma API robusta para gerenciamento financeiro pessoal.

## Estrutura de Diret�rios

### 1. Application (Camada de Aplica��o)
- **Localiza��o**: `/Application/`
- **Responsabilidade**: Servi�os de aplica��o, casos de uso, handlers de comandos/queries
- **Conte�do**:
  - Services (ex: `IUserService`, `TransactionService`)
  - Commands/Queries (CQRS pattern)
  - Handlers
  - DTOs de aplica��o
  - Interfaces de servi�os

### 2. Domain (Camada de Dom�nio)
- **Localiza��o**: `/Domain/`
- **Responsabilidade**: Entidades de neg�cio, regras de dom�nio, interfaces
- **Conte�do**:
  - **Entities**: Entidades de dom�nio (ex: `User`, `Transaction`, `Account`)
  - **ValueObjects**: Objetos de valor (ex: `Money`, `Email`)
  - **Interfaces**: Contratos do dom�nio (ex: `IUserRepository`)
  - **Enums**: Enumera��es de dom�nio (ex: `PaymentType`, `TransactionType`, `AccountStatus`)
  - **DTOs**: Data Transfer Objects
  - **Exceptions**: Exce��es espec�ficas do dom�nio
  - **Events**: Eventos de dom�nio

### 3. Infrastructure (Camada de Infraestrutura)
- **Localiza��o**: `/Infrastructure/`
- **Responsabilidade**: Implementa��es de acesso a dados, integra��es externas
- **Conte�do**:
  - **Data**: Contexto do Entity Framework, configura��es
  - **Repositories**: Implementa��es dos reposit�rios
  - **Mappings**: Configura��es do Entity Framework (Fluent API)
  - **External**: Integra��es com APIs externas
  - **Migrations**: Migra��es do banco de dados

## Padr�es e Conven��es

### Arquitetura
- **Clean Architecture**: Separa��o clara de responsabilidades
- **CQRS**: Separa��o entre comandos (write) e queries (read)
- **Repository Pattern**: Abstra��o do acesso a dados
- **Unit of Work**: Gerenciamento de transa��es

### Nomenclatura
- **Classes**: PascalCase (ex: `UserService`, `TransactionRepository`)
- **M�todos**: PascalCase (ex: `GetUserById`, `CreateTransaction`)
- **Propriedades**: PascalCase (ex: `UserId`, `Amount`)
- **Par�metros**: camelCase (ex: `userId`, `transactionAmount`)
- **Constantes**: UPPER_CASE (ex: `MAX_TRANSACTION_AMOUNT`)

### Idioma e Localiza��o
- **C�digo**: Todo em ingl�s (classes, m�todos, propriedades, vari�veis)
- **Interface do Usu�rio**: Todo em portugu�s (mensagens, labels, display names)
- **Exemplos**:
  - Usar `[Display(Name = "Nome do Usu�rio")]` para propriedades
  - Mensagens de erro em portugu�s: "Usu�rio n�o encontrado"
  - Enums com `[Display(Name = "Descri��o em Portugu�s")]`
  - Documenta��o XML em portugu�s para m�todos p�blicos

### Entity Framework
- **Context**: Usar `ApplicationDbContext`
- **Configura��es**: Usar Fluent API em arquivos separados na pasta `Mappings`
- **Convenções**: 
  - **Primary Keys**: Usar `int` como padrão para propriedade `Id`
  - Usar `CreatedAt` e `UpdatedAt` para auditoria (`UpdatedAt` nullable)
  - Soft delete com propriedade `IsDeleted`

## Testes

### Estrutura de Testes
- **Padr�o AAA**: Arrange, Act, Assert
- **Mocking**: NSubstitute para cria��o de mocks
- **Assertions**: FluentAssertions para valida��es

### Exemplo de Teste
```csharp
[Test]
public async Task CreateUser_WithValidData_ShouldReturnSuccess()
{
    // Arrange
    var userRepository = Substitute.For<IUserRepository>();
    var userService = new UserService(userRepository);
    var createUserDto = new CreateUserDto { Name = "Jo�o Silva", Email = "joao@email.com" };

    // Act
    var result = await userService.CreateUserAsync(createUserDto);

    // Assert
    result.Should().NotBeNull();
    result.IsSuccess.Should().BeTrue();
    await userRepository.Received(1).AddAsync(Arg.Any<User>());
}
```

### Conven��es de Testes
- **Nomenclatura**: `MethodName_Scenario_ExpectedResult`
- **Estrutura**: Uma classe de teste por classe testada
- **Organiza��o**: Agrupar testes relacionados em nested classes quando apropriado

## Depend�ncias e Bibliotecas

### Produ��o
- **Entity Framework Core**: ORM para acesso a dados
- **AutoMapper**: Mapeamento entre objetos
- **FluentValidation**: Valida��o de entrada
- **MediatR**: Implementa��o de mediator pattern
- **Serilog**: Logging estruturado

### Testes
- **NUnit**: Framework de testes
- **NSubstitute**: Framework de mocking
- **FluentAssertions**: Biblioteca de assertions
- **Microsoft.EntityFrameworkCore.InMemory**: Banco em mem�ria para testes

## Regras de Neg�cio

### Valida��es
- Sempre validar entrada de dados usando FluentValidation
- Implementar valida��es de dom�nio nas entidades
- Usar Result Pattern para retorno de opera��es

### Exce��es
- Criar exce��es espec�ficas do dom�nio
- Usar middleware para tratamento global de exce��es
- Logar todas as exce��es com contexto adequado

### Seguran�a
- Implementar autentica��o JWT
- Validar autoriza��o em todos os endpoints
- Sanitizar todas as entradas de usu�rio

## Estilo de C�digo

### Formata��o
- Usar 4 espa�os para indenta��o
- Quebra de linha ap�s 120 caracteres
- Usar `var` quando o tipo for �bvio
- Sempre usar chaves `{}` mesmo para blocos de uma linha

### Coment�rios
- Documentar m�todos p�blicos com XML comments
- Evitar coment�rios �bvios
- Explicar o "porqu�", n�o o "como"

## Comandos �teis

### Entity Framework
```bash
# Adicionar migra��o
dotnet ef migrations add NomeDaMigracao

# Atualizar banco
dotnet ef database update

# Remover �ltima migra��o
dotnet ef migrations remove
```

### Testes
```bash
# Executar todos os testes
dotnet test

# Executar com coverage
dotnet test --collect:"XPlat Code Coverage"
```

## Instru��es para IA

### Restri��es de Execu��o
- **N�O EXECUTAR**: N�o execute migrations, projeto ou testes diretamente
- **N�O RODAR**: N�o use comandos `dotnet ef database update`, `dotnet run`, `dotnet test`
- **APENAS FORNECER**: Apenas forne�a os comandos necess�rios para que o desenvolvedor execute manualmente
- **EXPLICAR**: Sempre explique o que cada comando faz e quando deve ser executado

### Quando Sugerir Comandos
- Ap�s criar/modificar entidades: Sugerir comando de migration
- Ap�s modificar DbContext ou configura��es: Sugerir atualiza��o do banco
- Ap�s implementar novos recursos: Sugerir execu��o de testes
- Ap�s modifica��es no c�digo: Sugerir build do projeto

## Pr�ximos Passos
- Implementar autentica��o e autoriza��o
- Configurar CI/CD pipeline
- Adicionar documenta��o da API (Swagger)
- Implementar logging e monitoramento
- Configurar Docker para containeriza��o

---

**Nota**: Este documento deve ser atualizado conforme o projeto evolui. Sempre mantenha as instru��es alinhadas com as pr�ticas atuais do time.