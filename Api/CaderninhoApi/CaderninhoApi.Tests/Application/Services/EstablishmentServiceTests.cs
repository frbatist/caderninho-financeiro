using CaderninhoApi.Application.Services;
using CaderninhoApi.Domain.DTOs;
using CaderninhoApi.Domain.Enums;
using CaderninhoApi.Infrastructure.Data;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NSubstitute;

namespace CaderninhoApi.Tests.Application.Services;

/// <summary>
/// Testes para EstablishmentService
/// </summary>
public class EstablishmentServiceTests
{
    private ApplicationDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

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
        result.Type.Should().Be(EstablishmentType.Supermarket);
        result.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task AddAsync_WithValidData_ShouldSaveToDatabase()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var logger = Substitute.For<ILogger<EstablishmentService>>();
        var service = new EstablishmentService(context, logger);
        
        var dto = new CreateEstablishmentDto
        {
            Name = "Loja de Roupas Teste",
            Type = EstablishmentType.ClothingStore
        };

        // Act
        await service.AddAsync(dto);

        // Assert
        var establishments = await context.Establishments.ToListAsync();
        establishments.Should().HaveCount(1);
        establishments[0].Name.Should().Be("Loja de Roupas Teste");
        establishments[0].Type.Should().Be(EstablishmentType.ClothingStore);
    }
}