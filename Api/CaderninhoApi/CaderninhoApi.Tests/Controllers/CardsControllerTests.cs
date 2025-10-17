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
/// Testes para CardsController
/// </summary>
public class CardsControllerTests
{
    private ApplicationDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    private async Task SeedCards(ApplicationDbContext context, int count)
    {
        for (int i = 1; i <= count; i++)
        {
            context.Cards.Add(new Card
            {
                Name = $"Cartão {i}",
                Type = CardType.Credit,
                Brand = CardBrand.Visa,
                LastFourDigits = $"{i:D4}"
            });
        }
        await context.SaveChangesAsync();
    }

    [Fact]
    public async Task GetAll_WithoutFilter_ShouldReturnAllCards()
    {
        // Arrange
        var context = CreateInMemoryContext();
        await SeedCards(context, 5);

        var service = Substitute.For<ICardService>();
        var logger = Substitute.For<ILogger<CardsController>>();
        var controller = new CardsController(context, service, logger);

        var filter = new CardFilterRequest
        {
            PageNumber = 1,
            PageSize = 10
        };

        // Act
        var result = await controller.GetAll(filter);

        // Assert
        result.Result.Should().BeOfType<OkObjectResult>();
        var okResult = result.Result as OkObjectResult;
        var response = okResult!.Value as PagedResponse<Card>;

        response.Should().NotBeNull();
        response!.Items.Should().HaveCount(5);
        response.TotalItems.Should().Be(5);
        response.TotalPages.Should().Be(1);
        response.PageNumber.Should().Be(1);
        response.PageSize.Should().Be(10);
    }

    [Fact]
    public async Task GetAll_WithSearchTextByName_ShouldReturnFilteredCards()
    {
        // Arrange
        var context = CreateInMemoryContext();
        context.Cards.Add(new Card { Name = "Nubank Crédito", Type = CardType.Credit, Brand = CardBrand.Mastercard, LastFourDigits = "1234" });
        context.Cards.Add(new Card { Name = "Santander Débito", Type = CardType.Debit, Brand = CardBrand.Visa, LastFourDigits = "5678" });
        context.Cards.Add(new Card { Name = "Nubank Débito", Type = CardType.Debit, Brand = CardBrand.Mastercard, LastFourDigits = "9999" });
        await context.SaveChangesAsync();

        var service = Substitute.For<ICardService>();
        var logger = Substitute.For<ILogger<CardsController>>();
        var controller = new CardsController(context, service, logger);

        var filter = new CardFilterRequest
        {
            PageNumber = 1,
            PageSize = 10,
            SearchText = "Nubank"
        };

        // Act
        var result = await controller.GetAll(filter);

        // Assert
        var okResult = result.Result as OkObjectResult;
        var response = okResult!.Value as PagedResponse<Card>;

        response.Should().NotBeNull();
        response!.Items.Should().HaveCount(2);
        response.TotalItems.Should().Be(2);
        response.Items.Should().AllSatisfy(c => c.Name.Should().Contain("Nubank"));
    }

    [Fact]
    public async Task GetAll_WithSearchTextByLastFourDigits_ShouldReturnFilteredCards()
    {
        // Arrange
        var context = CreateInMemoryContext();
        context.Cards.Add(new Card { Name = "Cartão A", Type = CardType.Credit, Brand = CardBrand.Visa, LastFourDigits = "1234" });
        context.Cards.Add(new Card { Name = "Cartão B", Type = CardType.Credit, Brand = CardBrand.Visa, LastFourDigits = "5678" });
        context.Cards.Add(new Card { Name = "Cartão C", Type = CardType.Credit, Brand = CardBrand.Visa, LastFourDigits = "1212" });
        await context.SaveChangesAsync();

        var service = Substitute.For<ICardService>();
        var logger = Substitute.For<ILogger<CardsController>>();
        var controller = new CardsController(context, service, logger);

        var filter = new CardFilterRequest
        {
            PageNumber = 1,
            PageSize = 10,
            SearchText = "12"
        };

        // Act
        var result = await controller.GetAll(filter);

        // Assert
        var okResult = result.Result as OkObjectResult;
        var response = okResult!.Value as PagedResponse<Card>;

        response.Should().NotBeNull();
        response!.Items.Should().HaveCount(2);
        response.Items.Should().AllSatisfy(c => c.LastFourDigits.Should().Contain("12"));
    }

    [Fact]
    public async Task GetAll_WithPagination_ShouldReturnCorrectPage()
    {
        // Arrange
        var context = CreateInMemoryContext();
        await SeedCards(context, 25);

        var service = Substitute.For<ICardService>();
        var logger = Substitute.For<ILogger<CardsController>>();
        var controller = new CardsController(context, service, logger);

        var filter = new CardFilterRequest
        {
            PageNumber = 2,
            PageSize = 10
        };

        // Act
        var result = await controller.GetAll(filter);

        // Assert
        var okResult = result.Result as OkObjectResult;
        var response = okResult!.Value as PagedResponse<Card>;

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
        await SeedCards(context, 25);

        var service = Substitute.For<ICardService>();
        var logger = Substitute.For<ILogger<CardsController>>();
        var controller = new CardsController(context, service, logger);

        var filter = new CardFilterRequest
        {
            PageNumber = 3,
            PageSize = 10
        };

        // Act
        var result = await controller.GetAll(filter);

        // Assert
        var okResult = result.Result as OkObjectResult;
        var response = okResult!.Value as PagedResponse<Card>;

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
        var service = Substitute.For<ICardService>();
        var logger = Substitute.For<ILogger<CardsController>>();
        var controller = new CardsController(context, service, logger);

        var filter = new CardFilterRequest
        {
            PageNumber = 1,
            PageSize = 10
        };

        // Act
        var result = await controller.GetAll(filter);

        // Assert
        var okResult = result.Result as OkObjectResult;
        var response = okResult!.Value as PagedResponse<Card>;

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
        context.Cards.Add(new Card { Name = "Zebra Card", Type = CardType.Credit, Brand = CardBrand.Visa, LastFourDigits = "0001" });
        context.Cards.Add(new Card { Name = "Alpha Card", Type = CardType.Credit, Brand = CardBrand.Visa, LastFourDigits = "0002" });
        context.Cards.Add(new Card { Name = "Beta Card", Type = CardType.Credit, Brand = CardBrand.Visa, LastFourDigits = "0003" });
        await context.SaveChangesAsync();

        var service = Substitute.For<ICardService>();
        var logger = Substitute.For<ILogger<CardsController>>();
        var controller = new CardsController(context, service, logger);

        var filter = new CardFilterRequest { PageNumber = 1, PageSize = 10 };

        // Act
        var result = await controller.GetAll(filter);

        // Assert
        var okResult = result.Result as OkObjectResult;
        var response = okResult!.Value as PagedResponse<Card>;

        response!.Items.Should().HaveCount(3);
        response.Items.First().Name.Should().Be("Alpha Card");
        response.Items.Last().Name.Should().Be("Zebra Card");
    }

    [Fact]
    public async Task GetById_WithValidId_ShouldReturnCard()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var card = new Card
        {
            Name = "Nubank Crédito",
            Type = CardType.Credit,
            Brand = CardBrand.Mastercard,
            LastFourDigits = "1234"
        };
        context.Cards.Add(card);
        await context.SaveChangesAsync();

        var service = Substitute.For<ICardService>();
        var logger = Substitute.For<ILogger<CardsController>>();
        var controller = new CardsController(context, service, logger);

        // Act
        var result = await controller.GetById(card.Id);

        // Assert
        result.Result.Should().BeOfType<OkObjectResult>();
        var okResult = result.Result as OkObjectResult;
        var returnedCard = okResult!.Value as Card;

        returnedCard.Should().NotBeNull();
        returnedCard!.Id.Should().Be(card.Id);
        returnedCard.Name.Should().Be("Nubank Crédito");
        returnedCard.Type.Should().Be(CardType.Credit);
        returnedCard.Brand.Should().Be(CardBrand.Mastercard);
        returnedCard.LastFourDigits.Should().Be("1234");
    }

    [Fact]
    public async Task GetById_WithInvalidId_ShouldReturnNotFound()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var service = Substitute.For<ICardService>();
        var logger = Substitute.For<ILogger<CardsController>>();
        var controller = new CardsController(context, service, logger);

        // Act
        var result = await controller.GetById(999);

        // Assert
        result.Result.Should().BeOfType<NotFoundObjectResult>();
        var notFoundResult = result.Result as NotFoundObjectResult;
        notFoundResult!.Value.Should().Be("Cartão não encontrado");
    }

    [Fact]
    public async Task Create_WithValidData_ShouldReturnCreated()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var service = Substitute.For<ICardService>();
        var logger = Substitute.For<ILogger<CardsController>>();
        var controller = new CardsController(context, service, logger);

        var dto = new CreateCardDto
        {
            Name = "Novo Cartão",
            Type = CardType.Debit,
            Brand = CardBrand.Elo,
            LastFourDigits = "9999"
        };

        var createdCard = new Card
        {
            Id = 1,
            Name = dto.Name,
            Type = dto.Type,
            Brand = dto.Brand,
            LastFourDigits = dto.LastFourDigits
        };

        service.AddAsync(dto).Returns(createdCard);

        // Act
        var result = await controller.Create(dto);

        // Assert
        result.Result.Should().BeOfType<CreatedAtActionResult>();
        var createdResult = result.Result as CreatedAtActionResult;
        
        createdResult!.ActionName.Should().Be(nameof(CardsController.GetById));
        createdResult.RouteValues.Should().ContainKey("id");
        createdResult.RouteValues!["id"].Should().Be(1);

        var returnedCard = createdResult.Value as Card;
        returnedCard.Should().NotBeNull();
        returnedCard!.Name.Should().Be("Novo Cartão");
        returnedCard.Type.Should().Be(CardType.Debit);
        returnedCard.Brand.Should().Be(CardBrand.Elo);
        returnedCard.LastFourDigits.Should().Be("9999");
    }

    [Fact]
    public async Task Create_WithInvalidModelState_ShouldReturnBadRequest()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var service = Substitute.For<ICardService>();
        var logger = Substitute.For<ILogger<CardsController>>();
        var controller = new CardsController(context, service, logger);

        var dto = new CreateCardDto
        {
            Name = "Teste",
            Type = CardType.Credit,
            Brand = CardBrand.Visa,
            LastFourDigits = "1234"
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
        var service = Substitute.For<ICardService>();
        var logger = Substitute.For<ILogger<CardsController>>();
        var controller = new CardsController(context, service, logger);

        var dto = new CreateCardDto
        {
            Name = "Teste",
            Type = CardType.Credit,
            Brand = CardBrand.Visa,
            LastFourDigits = "1234"
        };

        service.AddAsync(dto).Returns<Card>(x => throw new Exception("Erro no banco de dados"));

        // Act
        var result = await controller.Create(dto);

        // Assert
        result.Result.Should().BeOfType<ObjectResult>();
        var objectResult = result.Result as ObjectResult;
        objectResult!.StatusCode.Should().Be(500);
        objectResult.Value.Should().Be("Erro interno do servidor");
    }

    [Fact]
    public async Task GetAll_WithDifferentCardTypes_ShouldReturnAll()
    {
        // Arrange
        var context = CreateInMemoryContext();
        context.Cards.Add(new Card { Name = "Crédito", Type = CardType.Credit, Brand = CardBrand.Visa, LastFourDigits = "0001" });
        context.Cards.Add(new Card { Name = "Débito", Type = CardType.Debit, Brand = CardBrand.Mastercard, LastFourDigits = "0002" });
        context.Cards.Add(new Card { Name = "Voucher", Type = CardType.Voucher, Brand = CardBrand.Visa, LastFourDigits = "0003" });
        await context.SaveChangesAsync();

        var service = Substitute.For<ICardService>();
        var logger = Substitute.For<ILogger<CardsController>>();
        var controller = new CardsController(context, service, logger);

        var filter = new CardFilterRequest { PageNumber = 1, PageSize = 10 };

        // Act
        var result = await controller.GetAll(filter);

        // Assert
        var okResult = result.Result as OkObjectResult;
        var response = okResult!.Value as PagedResponse<Card>;

        response!.Items.Should().HaveCount(3);
        response.Items.Should().Contain(c => c.Type == CardType.Credit);
        response.Items.Should().Contain(c => c.Type == CardType.Debit);
        response.Items.Should().Contain(c => c.Type == CardType.Voucher);
    }

    [Fact]
    public async Task GetAll_WithDifferentBrands_ShouldReturnAll()
    {
        // Arrange
        var context = CreateInMemoryContext();
        context.Cards.Add(new Card { Name = "Visa", Type = CardType.Credit, Brand = CardBrand.Visa, LastFourDigits = "0001" });
        context.Cards.Add(new Card { Name = "Master", Type = CardType.Credit, Brand = CardBrand.Mastercard, LastFourDigits = "0002" });
        context.Cards.Add(new Card { Name = "Hiper", Type = CardType.Credit, Brand = CardBrand.Hipercard, LastFourDigits = "0003" });
        context.Cards.Add(new Card { Name = "Elo", Type = CardType.Credit, Brand = CardBrand.Elo, LastFourDigits = "0004" });
        await context.SaveChangesAsync();

        var service = Substitute.For<ICardService>();
        var logger = Substitute.For<ILogger<CardsController>>();
        var controller = new CardsController(context, service, logger);

        var filter = new CardFilterRequest { PageNumber = 1, PageSize = 10 };

        // Act
        var result = await controller.GetAll(filter);

        // Assert
        var okResult = result.Result as OkObjectResult;
        var response = okResult!.Value as PagedResponse<Card>;

        response!.Items.Should().HaveCount(4);
        response.Items.Should().Contain(c => c.Brand == CardBrand.Visa);
        response.Items.Should().Contain(c => c.Brand == CardBrand.Mastercard);
        response.Items.Should().Contain(c => c.Brand == CardBrand.Hipercard);
        response.Items.Should().Contain(c => c.Brand == CardBrand.Elo);
    }
}