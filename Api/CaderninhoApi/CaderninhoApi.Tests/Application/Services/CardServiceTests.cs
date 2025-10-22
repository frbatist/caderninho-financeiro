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
/// Testes para CardService
/// </summary>
public class CardServiceTests
{
    private ApplicationDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task AddAsync_WithValidData_ShouldCreateCard()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var logger = Substitute.For<ILogger<CardService>>();
        var service = new CardService(context, logger);
        
        var dto = new CreateCardDto
        {
            Name = "Nubank Crédito",
            Type = CardType.Credit,
            Brand = CardBrand.Mastercard,
            LastFourDigits = "1234"
        };

        // Act
        var result = await service.AddAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().BeGreaterThan(0);
        result.Name.Should().Be("Nubank Crédito");
        result.Type.Should().Be(CardType.Credit);
        result.Brand.Should().Be(CardBrand.Mastercard);
        result.LastFourDigits.Should().Be("1234");
        result.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        result.UpdatedAt.Should().BeNull();
        result.IsDeleted.Should().BeFalse();
    }

    [Fact]
    public async Task AddAsync_WithValidData_ShouldSaveToDatabase()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var logger = Substitute.For<ILogger<CardService>>();
        var service = new CardService(context, logger);
        
        var dto = new CreateCardDto
        {
            Name = "Santander Débito",
            Type = CardType.Debit,
            Brand = CardBrand.Visa,
            LastFourDigits = "5678"
        };

        // Act
        await service.AddAsync(dto);

        // Assert
        var cards = await context.Cards.ToListAsync();
        cards.Should().HaveCount(1);
        cards[0].Name.Should().Be("Santander Débito");
        cards[0].Type.Should().Be(CardType.Debit);
        cards[0].Brand.Should().Be(CardBrand.Visa);
        cards[0].LastFourDigits.Should().Be("5678");
    }

    [Fact]
    public async Task AddAsync_WithCreditCard_ShouldSetCorrectType()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var logger = Substitute.For<ILogger<CardService>>();
        var service = new CardService(context, logger);
        
        var dto = new CreateCardDto
        {
            Name = "Itaú Crédito",
            Type = CardType.Credit,
            Brand = CardBrand.Elo,
            LastFourDigits = "9999"
        };

        // Act
        var result = await service.AddAsync(dto);

        // Assert
        result.Type.Should().Be(CardType.Credit);
    }

    [Fact]
    public async Task AddAsync_WithVoucherCard_ShouldSetCorrectType()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var logger = Substitute.For<ILogger<CardService>>();
        var service = new CardService(context, logger);
        
        var dto = new CreateCardDto
        {
            Name = "Vale Refeição",
            Type = CardType.Voucher,
            Brand = CardBrand.Visa,
            LastFourDigits = "0000"
        };

        // Act
        var result = await service.AddAsync(dto);

        // Assert
        result.Type.Should().Be(CardType.Voucher);
    }

    [Fact]
    public async Task AddAsync_WithDifferentBrands_ShouldCreateCorrectly()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var logger = Substitute.For<ILogger<CardService>>();
        var service = new CardService(context, logger);

        // Act
        var visaCard = await service.AddAsync(new CreateCardDto
        {
            Name = "Visa Card",
            Type = CardType.Credit,
            Brand = CardBrand.Visa,
            LastFourDigits = "1111"
        });

        var mastercardCard = await service.AddAsync(new CreateCardDto
        {
            Name = "Mastercard Card",
            Type = CardType.Credit,
            Brand = CardBrand.Mastercard,
            LastFourDigits = "2222"
        });

        var hipercardCard = await service.AddAsync(new CreateCardDto
        {
            Name = "Hipercard Card",
            Type = CardType.Credit,
            Brand = CardBrand.Hipercard,
            LastFourDigits = "3333"
        });

        var eloCard = await service.AddAsync(new CreateCardDto
        {
            Name = "Elo Card",
            Type = CardType.Credit,
            Brand = CardBrand.Elo,
            LastFourDigits = "4444"
        });

        // Assert
        visaCard.Brand.Should().Be(CardBrand.Visa);
        mastercardCard.Brand.Should().Be(CardBrand.Mastercard);
        hipercardCard.Brand.Should().Be(CardBrand.Hipercard);
        eloCard.Brand.Should().Be(CardBrand.Elo);

        var allCards = await context.Cards.ToListAsync();
        allCards.Should().HaveCount(4);
    }

    [Fact]
    public async Task AddAsync_WithMultipleCards_ShouldIncrementIds()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var logger = Substitute.For<ILogger<CardService>>();
        var service = new CardService(context, logger);

        // Act
        var card1 = await service.AddAsync(new CreateCardDto
        {
            Name = "Card 1",
            Type = CardType.Credit,
            Brand = CardBrand.Visa,
            LastFourDigits = "0001"
        });

        var card2 = await service.AddAsync(new CreateCardDto
        {
            Name = "Card 2",
            Type = CardType.Debit,
            Brand = CardBrand.Mastercard,
            LastFourDigits = "0002"
        });

        // Assert
        card1.Id.Should().BeGreaterThan(0);
        card2.Id.Should().BeGreaterThan(card1.Id);
    }
}