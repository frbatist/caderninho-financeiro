using CaderninhoApi.Application.Services;
using CaderninhoApi.Domain.DTOs;
using CaderninhoApi.Domain.Entities;
using CaderninhoApi.Domain.Enums;
using CaderninhoApi.Infrastructure.Data;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NSubstitute;

namespace CaderninhoApi.Tests.Application.Services;

/// <summary>
/// Testes para ExpenseService
/// </summary>
public class ExpenseServiceTests
{
    private ApplicationDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    private async Task<Establishment> CreateTestEstablishment(ApplicationDbContext context)
    {
        var establishment = new Establishment
        {
            Name = "Supermercado Teste",
            Type = EstablishmentType.Supermarket
        };
        context.Establishments.Add(establishment);
        await context.SaveChangesAsync();
        return establishment;
    }

    private async Task<Card> CreateTestCard(ApplicationDbContext context)
    {
        var card = new Card
        {
            Name = "Cartão Teste",
            Type = CardType.Credit,
            Brand = CardBrand.Visa,
            LastFourDigits = "1234"
        };
        context.Cards.Add(card);
        await context.SaveChangesAsync();
        return card;
    }

    [Fact]
    public async Task AddAsync_WithValidData_ShouldCreateExpense()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var logger = Substitute.For<ILogger<ExpenseService>>();
        var service = new ExpenseService(context, logger);

        var establishment = await CreateTestEstablishment(context);
        var card = await CreateTestCard(context);

        var dto = new CreateExpenseDto
        {
            Description = "Compras do mês",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.CreditCard,
            CardId = card.Id,
            Amount = 150.50m,
            InstallmentCount = 3
        };

        // Act
        var result = await service.AddAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().BeGreaterThan(0);
        result.Description.Should().Be("Compras do mês");
        result.EstablishmentId.Should().Be(establishment.Id);
        result.PaymentType.Should().Be(PaymentType.CreditCard);
        result.CardId.Should().Be(card.Id);
        result.Amount.Should().Be(150.50m);
        result.InstallmentCount.Should().Be(3);
        result.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        result.UpdatedAt.Should().BeNull();
        result.IsDeleted.Should().BeFalse();
    }

    [Fact]
    public async Task AddAsync_WithValidData_ShouldSaveToDatabase()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var logger = Substitute.For<ILogger<ExpenseService>>();
        var service = new ExpenseService(context, logger);

        var establishment = await CreateTestEstablishment(context);
        var card = await CreateTestCard(context);

        var dto = new CreateExpenseDto
        {
            Description = "Combustível",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.DebitCard,
            CardId = card.Id,
            Amount = 200.00m,
            InstallmentCount = 1
        };

        // Act
        await service.AddAsync(dto);

        // Assert
        var expenses = await context.Expenses.ToListAsync();
        expenses.Should().HaveCount(1);
        expenses[0].Description.Should().Be("Combustível");
        expenses[0].Amount.Should().Be(200.00m);
    }

    [Fact]
    public async Task AddAsync_WithInvalidEstablishment_ShouldThrowException()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var logger = Substitute.For<ILogger<ExpenseService>>();
        var service = new ExpenseService(context, logger);

        var dto = new CreateExpenseDto
        {
            Description = "Teste",
            EstablishmentId = 999, // ID inexistente
            PaymentType = PaymentType.Pix,
            CardId = null,
            Amount = 100.00m,
            InstallmentCount = 1
        };

        // Act
        var act = async () => await service.AddAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Estabelecimento não encontrado");
    }

    [Fact]
    public async Task AddAsync_WithCreditCardAndNoCardId_ShouldThrowException()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var logger = Substitute.For<ILogger<ExpenseService>>();
        var service = new ExpenseService(context, logger);

        var establishment = await CreateTestEstablishment(context);

        var dto = new CreateExpenseDto
        {
            Description = "Teste",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.CreditCard,
            CardId = null, // Cartão obrigatório para crédito
            Amount = 100.00m,
            InstallmentCount = 1
        };

        // Act
        var act = async () => await service.AddAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("O cartão é obrigatório quando o tipo de pagamento é Cartão de Crédito ou Cartão de Débito");
    }

    [Fact]
    public async Task AddAsync_WithDebitCardAndNoCardId_ShouldThrowException()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var logger = Substitute.For<ILogger<ExpenseService>>();
        var service = new ExpenseService(context, logger);

        var establishment = await CreateTestEstablishment(context);

        var dto = new CreateExpenseDto
        {
            Description = "Teste",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.DebitCard,
            CardId = null, // Cartão obrigatório para débito
            Amount = 100.00m,
            InstallmentCount = 1
        };

        // Act
        var act = async () => await service.AddAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("O cartão é obrigatório quando o tipo de pagamento é Cartão de Crédito ou Cartão de Débito");
    }

    [Fact]
    public async Task AddAsync_WithInvalidCard_ShouldThrowException()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var logger = Substitute.For<ILogger<ExpenseService>>();
        var service = new ExpenseService(context, logger);

        var establishment = await CreateTestEstablishment(context);

        var dto = new CreateExpenseDto
        {
            Description = "Teste",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.CreditCard,
            CardId = 999, // ID de cartão inexistente
            Amount = 100.00m,
            InstallmentCount = 1
        };

        // Act
        var act = async () => await service.AddAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Cartão não encontrado");
    }

    [Fact]
    public async Task AddAsync_WithPixPayment_ShouldNotRequireCard()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var logger = Substitute.For<ILogger<ExpenseService>>();
        var service = new ExpenseService(context, logger);

        var establishment = await CreateTestEstablishment(context);

        var dto = new CreateExpenseDto
        {
            Description = "Pagamento PIX",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.Pix,
            CardId = null, // PIX não requer cartão
            Amount = 50.00m,
            InstallmentCount = 1
        };

        // Act
        var result = await service.AddAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.PaymentType.Should().Be(PaymentType.Pix);
        result.CardId.Should().BeNull();
    }

    [Fact]
    public async Task AddAsync_WithDepositPayment_ShouldNotRequireCard()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var logger = Substitute.For<ILogger<ExpenseService>>();
        var service = new ExpenseService(context, logger);

        var establishment = await CreateTestEstablishment(context);

        var dto = new CreateExpenseDto
        {
            Description = "Depósito bancário",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.Deposit,
            CardId = null, // Depósito não requer cartão
            Amount = 300.00m,
            InstallmentCount = 1
        };

        // Act
        var result = await service.AddAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.PaymentType.Should().Be(PaymentType.Deposit);
        result.CardId.Should().BeNull();
    }

    [Fact]
    public async Task AddAsync_WithMultipleInstallments_ShouldCreateCorrectly()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var logger = Substitute.For<ILogger<ExpenseService>>();
        var service = new ExpenseService(context, logger);

        var establishment = await CreateTestEstablishment(context);
        var card = await CreateTestCard(context);

        var dto = new CreateExpenseDto
        {
            Description = "Compra parcelada",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.CreditCard,
            CardId = card.Id,
            Amount = 1200.00m,
            InstallmentCount = 12
        };

        // Act
        var result = await service.AddAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.InstallmentCount.Should().Be(12);
        result.Amount.Should().Be(1200.00m);
    }

    [Fact]
    public async Task AddAsync_WithSingleInstallment_ShouldCreateCorrectly()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var logger = Substitute.For<ILogger<ExpenseService>>();
        var service = new ExpenseService(context, logger);

        var establishment = await CreateTestEstablishment(context);
        var card = await CreateTestCard(context);

        var dto = new CreateExpenseDto
        {
            Description = "Compra à vista",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.CreditCard,
            CardId = card.Id,
            Amount = 99.99m,
            InstallmentCount = 1
        };

        // Act
        var result = await service.AddAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.InstallmentCount.Should().Be(1);
    }

    [Fact]
    public async Task AddAsync_WithMultipleExpenses_ShouldIncrementIds()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var logger = Substitute.For<ILogger<ExpenseService>>();
        var service = new ExpenseService(context, logger);

        var establishment = await CreateTestEstablishment(context);
        var card = await CreateTestCard(context);

        // Act
        var expense1 = await service.AddAsync(new CreateExpenseDto
        {
            Description = "Despesa 1",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.CreditCard,
            CardId = card.Id,
            Amount = 100.00m,
            InstallmentCount = 1
        });

        var expense2 = await service.AddAsync(new CreateExpenseDto
        {
            Description = "Despesa 2",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.Pix,
            CardId = null,
            Amount = 200.00m,
            InstallmentCount = 1
        });

        // Assert
        expense1.Id.Should().BeGreaterThan(0);
        expense2.Id.Should().BeGreaterThan(expense1.Id);
    }
}