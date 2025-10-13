# Instruções de IA - Caderninho Financeiro

## Visão Geral do Projeto
Este é um sistema financeiro desenvolvido em .NET 9 com arquitetura limpa (Clean Architecture). O projeto segue os princípios de Domain-Driven Design (DDD) e tem como objetivo fornecer uma API robusta para gerenciamento financeiro pessoal.

## Estrutura de Diretórios

### 1. Application (Camada de Aplicação)
- **Localização**: `/Application/`
- **Responsabilidade**: Serviços de aplicação, casos de uso, handlers de comandos/queries
- **Conteúdo**:
  - Services (ex: `IUserService`, `TransactionService`)
  - Commands/Queries (CQRS pattern)
  - Handlers
  - DTOs de aplicação
  - Interfaces de serviços

### 2. Domain (Camada de Domínio)
- **Localização**: `/Domain/`
- **Responsabilidade**: Entidades de negócio, regras de domínio, interfaces
- **Conteúdo**:
  - **Entities**: Entidades de domínio (ex: `User`, `Transaction`, `Account`)
  - **ValueObjects**: Objetos de valor (ex: `Money`, `Email`)
  - **Interfaces**: Contratos do domínio (ex: `IUserRepository`)
  - **Enums**: Enumerações de domínio (ex: `TransactionType`, `AccountStatus`)
  - **DTOs**: Data Transfer Objects
  - **Exceptions**: Exceções específicas do domínio
  - **Events**: Eventos de domínio

### 3. Infrastructure (Camada de Infraestrutura)
- **Localização**: `/Infrastructure/`
- **Responsabilidade**: Implementações de acesso a dados, integrações externas
- **Conteúdo**:
  - **Data**: Contexto do Entity Framework, configurações
  - **Repositories**: Implementações dos repositórios
  - **Mappings**: Configurações do Entity Framework (Fluent API)
  - **External**: Integrações com APIs externas
  - **Migrations**: Migrações do banco de dados

## Padrões e Convenções

### Arquitetura
- **Clean Architecture**: Separação clara de responsabilidades
- **CQRS**: Separação entre comandos (write) e queries (read)
- **Repository Pattern**: Abstração do acesso a dados
- **Unit of Work**: Gerenciamento de transações

### Nomenclatura
- **Classes**: PascalCase (ex: `UserService`, `TransactionRepository`)
- **Métodos**: PascalCase (ex: `GetUserById`, `CreateTransaction`)
- **Propriedades**: PascalCase (ex: `UserId`, `Amount`)
- **Parâmetros**: camelCase (ex: `userId`, `transactionAmount`)
- **Constantes**: UPPER_CASE (ex: `MAX_TRANSACTION_AMOUNT`)

### Entity Framework
- **Context**: Usar `ApplicationDbContext`
- **Configurações**: Usar Fluent API em arquivos separados na pasta `Mappings`
- **Convenções**: 
  - Entidades devem ter propriedade `Id` do tipo `Guid`
  - Usar `CreatedAt` e `UpdatedAt` para auditoria
  - Soft delete com propriedade `IsDeleted`

## Testes

### Estrutura de Testes
- **Padrão AAA**: Arrange, Act, Assert
- **Mocking**: NSubstitute para criação de mocks
- **Assertions**: FluentAssertions para validações

### Exemplo de Teste
```csharp
[Test]
public async Task CreateUser_WithValidData_ShouldReturnSuccess()
{
    // Arrange
    var userRepository = Substitute.For<IUserRepository>();
    var userService = new UserService(userRepository);
    var createUserDto = new CreateUserDto { Name = "João Silva", Email = "joao@email.com" };

    // Act
    var result = await userService.CreateUserAsync(createUserDto);

    // Assert
    result.Should().NotBeNull();
    result.IsSuccess.Should().BeTrue();
    await userRepository.Received(1).AddAsync(Arg.Any<User>());
}
```

### Convenções de Testes
- **Nomenclatura**: `MethodName_Scenario_ExpectedResult`
- **Estrutura**: Uma classe de teste por classe testada
- **Organização**: Agrupar testes relacionados em nested classes quando apropriado

## Dependências e Bibliotecas

### Produção
- **Entity Framework Core**: ORM para acesso a dados
- **AutoMapper**: Mapeamento entre objetos
- **FluentValidation**: Validação de entrada
- **MediatR**: Implementação de mediator pattern
- **Serilog**: Logging estruturado

### Testes
- **NUnit**: Framework de testes
- **NSubstitute**: Framework de mocking
- **FluentAssertions**: Biblioteca de assertions
- **Microsoft.EntityFrameworkCore.InMemory**: Banco em memória para testes

## Regras de Negócio

### Validações
- Sempre validar entrada de dados usando FluentValidation
- Implementar validações de domínio nas entidades
- Usar Result Pattern para retorno de operações

### Exceções
- Criar exceções específicas do domínio
- Usar middleware para tratamento global de exceções
- Logar todas as exceções com contexto adequado

### Segurança
- Implementar autenticação JWT
- Validar autorização em todos os endpoints
- Sanitizar todas as entradas de usuário

## Estilo de Código

### Formatação
- Usar 4 espaços para indentação
- Quebra de linha após 120 caracteres
- Usar `var` quando o tipo for óbvio
- Sempre usar chaves `{}` mesmo para blocos de uma linha

### Comentários
- Documentar métodos públicos com XML comments
- Evitar comentários óbvios
- Explicar o "porquê", não o "como"

## Comandos Úteis

### Entity Framework
```bash
# Adicionar migração
dotnet ef migrations add NomeDaMigracao

# Atualizar banco
dotnet ef database update

# Remover última migração
dotnet ef migrations remove
```

### Testes
```bash
# Executar todos os testes
dotnet test

# Executar com coverage
dotnet test --collect:"XPlat Code Coverage"
```

## Próximos Passos
- Implementar autenticação e autorização
- Configurar CI/CD pipeline
- Adicionar documentação da API (Swagger)
- Implementar logging e monitoramento
- Configurar Docker para containerização

---

**Nota**: Este documento deve ser atualizado conforme o projeto evolui. Sempre mantenha as instruções alinhadas com as práticas atuais do time.