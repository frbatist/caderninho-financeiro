# CaderninhoApi.Tests

Projeto de testes unitários para o Caderninho Financeiro API.

## Frameworks e Bibliotecas

- **xUnit** - Framework de testes
- **NSubstitute** - Framework para criação de mocks
- **FluentAssertions** - Biblioteca de assertions fluentes
- **Microsoft.EntityFrameworkCore.InMemory** - Banco de dados em memória para testes

## Estrutura de Testes

Os testes seguem o padrão **AAA (Arrange, Act, Assert)**:

```csharp
[Fact]
public async Task MethodName_Scenario_ExpectedResult()
{
    // Arrange - Preparar os dados e dependências
    var context = CreateInMemoryContext();
    var logger = Substitute.For<ILogger<Service>>();
    var service = new Service(context, logger);

    // Act - Executar a ação
    var result = await service.MethodAsync(parameters);

    // Assert - Verificar o resultado
    result.Should().NotBeNull();
    result.Property.Should().Be(expectedValue);
}
```

## Convenções de Nomenclatura

- **Nomenclatura de Testes**: `MethodName_Scenario_ExpectedResult`
- **Nomenclatura de Classes**: `ClassNameTests`
- **Organização**: Uma classe de teste por classe testada

## Executar Testes

```bash
# Executar todos os testes
dotnet test

# Executar testes com output detalhado
dotnet test --verbosity detailed

# Executar testes com cobertura
dotnet test --collect:"XPlat Code Coverage"
```

## Exemplo de Teste

```csharp
[Fact]
public async Task AddAsync_WithValidData_ShouldCreateEstablishment()
{
    // Arrange
    var context = CreateInMemoryContext();
    var logger = Substitute.For<ILogger<EstablishmentService>>();
    var service = new EstablishmentService(context, logger);
    
    var dto = new CreateEstablishmentDto
    {
        Name = "Supermercado Teste",
        Type = EstablishmentType.Supermarket
    };

    // Act
    var result = await service.AddAsync(dto);

    // Assert
    result.Should().NotBeNull();
    result.Id.Should().BeGreaterThan(0);
    result.Name.Should().Be("Supermercado Teste");
}
```

## Helpers

### CreateInMemoryContext

Método helper para criar contexto em memória para testes:

```csharp
private ApplicationDbContext CreateInMemoryContext()
{
    var options = new DbContextOptionsBuilder<ApplicationDbContext>()
        .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
        .Options;

    return new ApplicationDbContext(options);
}
```

## Cobertura de Testes

O objetivo é manter uma cobertura de testes acima de 80% para as camadas de Application e Domain.
