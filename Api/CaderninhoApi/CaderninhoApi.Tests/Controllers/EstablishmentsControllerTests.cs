using CaderninhoApi.Controllers;
using CaderninhoApi.Domain.Abstractions.ApplicationServices;
using CaderninhoApi.Domain.DTOs;
using CaderninhoApi.Domain.Entities;
using CaderninhoApi.Domain.Enums;
using CaderninhoApi.Infrastructure.Data;
using CaderninhoApi.Request;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NSubstitute;

namespace CaderninhoApi.Tests.Controllers;

/// <summary>
/// Testes para EstablishmentsController
/// </summary>
public class EstablishmentsControllerTests
{
    private ApplicationDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    private async Task SeedEstablishments(ApplicationDbContext context, int count)
    {
        for (int i = 1; i <= count; i++)
        {
            context.Establishments.Add(new Establishment
            {
                Name = $"Estabelecimento {i}",
                Type = EstablishmentType.Supermarket
            });
        }
        await context.SaveChangesAsync();
    }

    [Fact]
    public async Task GetAll_WithoutFilter_ShouldReturnAllEstablishments()
    {
        // Arrange
        var context = CreateInMemoryContext();
        await SeedEstablishments(context, 5);

        var service = Substitute.For<IEstablishmentService>();
        var logger = Substitute.For<ILogger<EstablishmentsController>>();
        var controller = new EstablishmentsController(context, service, logger);

        var filter = new EstablishmentFilterRequest
        {
            PageNumber = 1,
            PageSize = 10
        };

        // Act
        var result = await controller.GetAll(filter);

        // Assert
        result.Result.Should().BeOfType<OkObjectResult>();
        var okResult = result.Result as OkObjectResult;
        var response = okResult!.Value as PagedResponse<Establishment>;

        response.Should().NotBeNull();
        response!.Items.Should().HaveCount(5);
        response.TotalItems.Should().Be(5);
        response.TotalPages.Should().Be(1);
        response.PageNumber.Should().Be(1);
        response.PageSize.Should().Be(10);
    }

    [Fact]
    public async Task GetAll_WithSearchText_ShouldReturnFilteredEstablishments()
    {
        // Arrange
        var context = CreateInMemoryContext();
        context.Establishments.Add(new Establishment { Name = "Supermercado ABC", Type = EstablishmentType.Supermarket });
        context.Establishments.Add(new Establishment { Name = "Farmácia XYZ", Type = EstablishmentType.Pharmacy });
        context.Establishments.Add(new Establishment { Name = "Supermercado DEF", Type = EstablishmentType.Supermarket });
        await context.SaveChangesAsync();

        var service = Substitute.For<IEstablishmentService>();
        var logger = Substitute.For<ILogger<EstablishmentsController>>();
        var controller = new EstablishmentsController(context, service, logger);

        var filter = new EstablishmentFilterRequest
        {
            PageNumber = 1,
            PageSize = 10,
            SearchText = "Supermercado"
        };

        // Act
        var result = await controller.GetAll(filter);

        // Assert
        var okResult = result.Result as OkObjectResult;
        var response = okResult!.Value as PagedResponse<Establishment>;

        response.Should().NotBeNull();
        response!.Items.Should().HaveCount(2);
        response.TotalItems.Should().Be(2);
        response.Items.Should().AllSatisfy(e => e.Name.Should().Contain("Supermercado"));
    }

    [Fact]
    public async Task GetAll_WithPagination_ShouldReturnCorrectPage()
    {
        // Arrange
        var context = CreateInMemoryContext();
        await SeedEstablishments(context, 25);

        var service = Substitute.For<IEstablishmentService>();
        var logger = Substitute.For<ILogger<EstablishmentsController>>();
        var controller = new EstablishmentsController(context, service, logger);

        var filter = new EstablishmentFilterRequest
        {
            PageNumber = 2,
            PageSize = 10
        };

        // Act
        var result = await controller.GetAll(filter);

        // Assert
        var okResult = result.Result as OkObjectResult;
        var response = okResult!.Value as PagedResponse<Establishment>;

        response.Should().NotBeNull();
        response!.Items.Should().HaveCount(10);
        response.TotalItems.Should().Be(25);
        response.TotalPages.Should().Be(3);
        response.PageNumber.Should().Be(2);
        response.HasPreviousPage.Should().BeTrue();
        response.HasNextPage.Should().BeTrue();
    }

    [Fact]
    public async Task GetAll_LastPage_ShouldReturnRemainingItems()
    {
        // Arrange
        var context = CreateInMemoryContext();
        await SeedEstablishments(context, 25);

        var service = Substitute.For<IEstablishmentService>();
        var logger = Substitute.For<ILogger<EstablishmentsController>>();
        var controller = new EstablishmentsController(context, service, logger);

        var filter = new EstablishmentFilterRequest
        {
            PageNumber = 3,
            PageSize = 10
        };

        // Act
        var result = await controller.GetAll(filter);

        // Assert
        var okResult = result.Result as OkObjectResult;
        var response = okResult!.Value as PagedResponse<Establishment>;

        response.Should().NotBeNull();
        response!.Items.Should().HaveCount(5); // Últimos 5 itens
        response.TotalItems.Should().Be(25);
        response.PageNumber.Should().Be(3);
        response.HasPreviousPage.Should().BeTrue();
        response.HasNextPage.Should().BeFalse();
    }

    [Fact]
    public async Task GetAll_EmptyDatabase_ShouldReturnEmptyList()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var service = Substitute.For<IEstablishmentService>();
        var logger = Substitute.For<ILogger<EstablishmentsController>>();
        var controller = new EstablishmentsController(context, service, logger);

        var filter = new EstablishmentFilterRequest
        {
            PageNumber = 1,
            PageSize = 10
        };

        // Act
        var result = await controller.GetAll(filter);

        // Assert
        var okResult = result.Result as OkObjectResult;
        var response = okResult!.Value as PagedResponse<Establishment>;

        response.Should().NotBeNull();
        response!.Items.Should().BeEmpty();
        response.TotalItems.Should().Be(0);
        response.TotalPages.Should().Be(0);
    }

    [Fact]
    public async Task GetAll_ShouldOrderByName()
    {
        // Arrange
        var context = CreateInMemoryContext();
        context.Establishments.Add(new Establishment { Name = "Zebra", Type = EstablishmentType.Supermarket });
        context.Establishments.Add(new Establishment { Name = "Alpha", Type = EstablishmentType.Supermarket });
        context.Establishments.Add(new Establishment { Name = "Beta", Type = EstablishmentType.Supermarket });
        await context.SaveChangesAsync();

        var service = Substitute.For<IEstablishmentService>();
        var logger = Substitute.For<ILogger<EstablishmentsController>>();
        var controller = new EstablishmentsController(context, service, logger);

        var filter = new EstablishmentFilterRequest { PageNumber = 1, PageSize = 10 };

        // Act
        var result = await controller.GetAll(filter);

        // Assert
        var okResult = result.Result as OkObjectResult;
        var response = okResult!.Value as PagedResponse<Establishment>;

        response!.Items.Should().HaveCount(3);
        response.Items.First().Name.Should().Be("Alpha");
        response.Items.Last().Name.Should().Be("Zebra");
    }

    [Fact]
    public async Task GetById_WithValidId_ShouldReturnEstablishment()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var establishment = new Establishment
        {
            Name = "Supermercado Teste",
            Type = EstablishmentType.Supermarket
        };
        context.Establishments.Add(establishment);
        await context.SaveChangesAsync();

        var service = Substitute.For<IEstablishmentService>();
        var logger = Substitute.For<ILogger<EstablishmentsController>>();
        var controller = new EstablishmentsController(context, service, logger);

        // Act
        var result = await controller.GetById(establishment.Id);

        // Assert
        result.Result.Should().BeOfType<OkObjectResult>();
        var okResult = result.Result as OkObjectResult;
        var returnedEstablishment = okResult!.Value as Establishment;

        returnedEstablishment.Should().NotBeNull();
        returnedEstablishment!.Id.Should().Be(establishment.Id);
        returnedEstablishment.Name.Should().Be("Supermercado Teste");
        returnedEstablishment.Type.Should().Be(EstablishmentType.Supermarket);
    }

    [Fact]
    public async Task GetById_WithInvalidId_ShouldReturnNotFound()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var service = Substitute.For<IEstablishmentService>();
        var logger = Substitute.For<ILogger<EstablishmentsController>>();
        var controller = new EstablishmentsController(context, service, logger);

        // Act
        var result = await controller.GetById(999);

        // Assert
        result.Result.Should().BeOfType<NotFoundObjectResult>();
        var notFoundResult = result.Result as NotFoundObjectResult;
        notFoundResult!.Value.Should().Be("Estabelecimento não encontrado");
    }

    [Fact]
    public async Task Create_WithValidData_ShouldReturnCreated()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var service = Substitute.For<IEstablishmentService>();
        var logger = Substitute.For<ILogger<EstablishmentsController>>();
        var controller = new EstablishmentsController(context, service, logger);

        var dto = new CreateEstablishmentDto
        {
            Name = "Novo Estabelecimento",
            Type = EstablishmentType.Restaurant
        };

        var createdEstablishment = new Establishment
        {
            Id = 1,
            Name = dto.Name,
            Type = dto.Type
        };

        service.AddAsync(dto).Returns(createdEstablishment);

        // Act
        var result = await controller.Create(dto);

        // Assert
        result.Result.Should().BeOfType<CreatedAtActionResult>();
        var createdResult = result.Result as CreatedAtActionResult;
        
        createdResult!.ActionName.Should().Be(nameof(EstablishmentsController.GetById));
        createdResult.RouteValues.Should().ContainKey("id");
        createdResult.RouteValues!["id"].Should().Be(1);

        var returnedEstablishment = createdResult.Value as Establishment;
        returnedEstablishment.Should().NotBeNull();
        returnedEstablishment!.Name.Should().Be("Novo Estabelecimento");
        returnedEstablishment.Type.Should().Be(EstablishmentType.Restaurant);
    }

    [Fact]
    public async Task Create_WithInvalidModelState_ShouldReturnBadRequest()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var service = Substitute.For<IEstablishmentService>();
        var logger = Substitute.For<ILogger<EstablishmentsController>>();
        var controller = new EstablishmentsController(context, service, logger);

        var dto = new CreateEstablishmentDto
        {
            Name = "Teste",
            Type = EstablishmentType.Supermarket
        };

        controller.ModelState.AddModelError("Name", "Nome é obrigatório");

        // Act
        var result = await controller.Create(dto);

        // Assert
        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task Create_WhenServiceThrowsException_ShouldReturnInternalServerError()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var service = Substitute.For<IEstablishmentService>();
        var logger = Substitute.For<ILogger<EstablishmentsController>>();
        var controller = new EstablishmentsController(context, service, logger);

        var dto = new CreateEstablishmentDto
        {
            Name = "Teste",
            Type = EstablishmentType.Supermarket
        };

        service.AddAsync(dto).Returns<Establishment>(x => throw new Exception("Erro no banco de dados"));

        // Act
        var result = await controller.Create(dto);

        // Assert
        result.Result.Should().BeOfType<ObjectResult>();
        var objectResult = result.Result as ObjectResult;
        objectResult!.StatusCode.Should().Be(500);
        objectResult.Value.Should().Be("Erro interno do servidor");
    }
}