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
/// Testes para ExpensesController
/// </summary>
public class ExpensesControllerTests
{
    private ApplicationDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    private async Task<(Establishment establishment, Card card)> SeedRequiredData(ApplicationDbContext context)
    {
        var establishment = new Establishment
        {
            Name = "Mercado Teste",
            Type = EstablishmentType.Supermarket
        };
        context.Establishments.Add(establishment);

        var card = new Card
        {
            Name = "Cartão Teste",
            Type = CardType.Credit,
            Brand = CardBrand.Visa,
            LastFourDigits = "1234"
        };
        context.Cards.Add(card);

        await context.SaveChangesAsync();
        return (establishment, card);
    }

    private async Task SeedExpenses(ApplicationDbContext context, int count)
    {
        var (establishment, card) = await SeedRequiredData(context);

        for (int i = 1; i <= count; i++)
        {
            context.Expenses.Add(new Expense
            {
                Description = $"Despesa {i}",
                EstablishmentId = establishment.Id,
                PaymentType = PaymentType.CreditCard,
                CardId = card.Id,
                Amount = 100m * i,
                InstallmentCount = 1
            });
        }
        await context.SaveChangesAsync();
    }

    [Fact]
    public async Task GetAll_WithoutFilter_ShouldReturnAllExpenses()
    {
        // Arrange
        var context = CreateInMemoryContext();
        await SeedExpenses(context, 5);

        var service = Substitute.For<IExpenseService>();
        var logger = Substitute.For<ILogger<ExpensesController>>();
        var controller = new ExpensesController(context, service, logger);

        var filter = new ExpenseFilterRequest
        {
            PageNumber = 1,
            PageSize = 10
        };

        // Act
        var result = await controller.GetAll(filter);

        // Assert
        result.Result.Should().BeOfType<OkObjectResult>();
        var okResult = result.Result as OkObjectResult;
        var response = okResult!.Value as PagedResponse<Expense>;

        response.Should().NotBeNull();
        response!.Items.Should().HaveCount(5);
        response.TotalItems.Should().Be(5);
        response.TotalPages.Should().Be(1);
        response.PageNumber.Should().Be(1);
        response.PageSize.Should().Be(10);
    }

    [Fact]
    public async Task GetAll_ShouldIncludeNavigationProperties()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var (establishment, card) = await SeedRequiredData(context);
        
        context.Expenses.Add(new Expense
        {
            Description = "Compra no Mercado",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.CreditCard,
            CardId = card.Id,
            Amount = 250m,
            InstallmentCount = 1
        });
        await context.SaveChangesAsync();

        var service = Substitute.For<IExpenseService>();
        var logger = Substitute.For<ILogger<ExpensesController>>();
        var controller = new ExpensesController(context, service, logger);

        var filter = new ExpenseFilterRequest { PageNumber = 1, PageSize = 10 };

        // Act
        var result = await controller.GetAll(filter);

        // Assert
        var okResult = result.Result as OkObjectResult;
        var response = okResult!.Value as PagedResponse<Expense>;

        response!.Items.Should().HaveCount(1);
        var expense = response.Items.First();
        
        expense.Establishment.Should().NotBeNull();
        expense.Establishment!.Name.Should().Be("Mercado Teste");
        expense.Establishment.Type.Should().Be(EstablishmentType.Supermarket);
        
        expense.Card.Should().NotBeNull();
        expense.Card!.Name.Should().Be("Cartão Teste");
        expense.Card.LastFourDigits.Should().Be("1234");
    }

    [Fact]
    public async Task GetAll_WithYearFilter_ShouldReturnFilteredExpenses()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var (establishment, card) = await SeedRequiredData(context);

        // Despesa de 2024
        var expense2024 = new Expense
        {
            Description = "Despesa 2024",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.CreditCard,
            CardId = card.Id,
            Amount = 100m,
            InstallmentCount = 1
        };
        expense2024.GetType().GetProperty("CreatedAt")!.SetValue(expense2024, new DateTime(2024, 6, 15));
        context.Expenses.Add(expense2024);

        // Despesa de 2025
        var expense2025 = new Expense
        {
            Description = "Despesa 2025",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.Pix,
            Amount = 200m,
            InstallmentCount = 1
        };
        expense2025.GetType().GetProperty("CreatedAt")!.SetValue(expense2025, new DateTime(2025, 3, 10));
        context.Expenses.Add(expense2025);

        await context.SaveChangesAsync();

        var service = Substitute.For<IExpenseService>();
        var logger = Substitute.For<ILogger<ExpensesController>>();
        var controller = new ExpensesController(context, service, logger);

        var filter = new ExpenseFilterRequest
        {
            PageNumber = 1,
            PageSize = 10,
            Year = 2025
        };

        // Act
        var result = await controller.GetAll(filter);

        // Assert
        var okResult = result.Result as OkObjectResult;
        var response = okResult!.Value as PagedResponse<Expense>;

        response!.Items.Should().HaveCount(1);
        response.Items.First().Description.Should().Be("Despesa 2025");
    }

    [Fact]
    public async Task GetAll_WithMonthFilter_ShouldReturnFilteredExpenses()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var (establishment, card) = await SeedRequiredData(context);

        // Despesa de Janeiro
        var expenseJan = new Expense
        {
            Description = "Despesa Janeiro",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.Pix,
            Amount = 100m,
            InstallmentCount = 1
        };
        expenseJan.GetType().GetProperty("CreatedAt")!.SetValue(expenseJan, new DateTime(2025, 1, 15));
        context.Expenses.Add(expenseJan);

        // Despesa de Março
        var expenseMar = new Expense
        {
            Description = "Despesa Março",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.Pix,
            Amount = 200m,
            InstallmentCount = 1
        };
        expenseMar.GetType().GetProperty("CreatedAt")!.SetValue(expenseMar, new DateTime(2025, 3, 10));
        context.Expenses.Add(expenseMar);

        await context.SaveChangesAsync();

        var service = Substitute.For<IExpenseService>();
        var logger = Substitute.For<ILogger<ExpensesController>>();
        var controller = new ExpensesController(context, service, logger);

        var filter = new ExpenseFilterRequest
        {
            PageNumber = 1,
            PageSize = 10,
            Month = 3
        };

        // Act
        var result = await controller.GetAll(filter);

        // Assert
        var okResult = result.Result as OkObjectResult;
        var response = okResult!.Value as PagedResponse<Expense>;

        response!.Items.Should().HaveCount(1);
        response.Items.First().Description.Should().Be("Despesa Março");
    }

    [Fact]
    public async Task GetAll_WithYearAndMonthFilter_ShouldReturnFilteredExpenses()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var (establishment, card) = await SeedRequiredData(context);

        // Despesa de Janeiro 2024
        var expense1 = new Expense
        {
            Description = "Jan 2024",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.Pix,
            Amount = 100m,
            InstallmentCount = 1
        };
        expense1.GetType().GetProperty("CreatedAt")!.SetValue(expense1, new DateTime(2024, 1, 15));
        context.Expenses.Add(expense1);

        // Despesa de Janeiro 2025
        var expense2 = new Expense
        {
            Description = "Jan 2025",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.Pix,
            Amount = 200m,
            InstallmentCount = 1
        };
        expense2.GetType().GetProperty("CreatedAt")!.SetValue(expense2, new DateTime(2025, 1, 20));
        context.Expenses.Add(expense2);

        // Despesa de Março 2025
        var expense3 = new Expense
        {
            Description = "Mar 2025",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.Pix,
            Amount = 300m,
            InstallmentCount = 1
        };
        expense3.GetType().GetProperty("CreatedAt")!.SetValue(expense3, new DateTime(2025, 3, 10));
        context.Expenses.Add(expense3);

        await context.SaveChangesAsync();

        var service = Substitute.For<IExpenseService>();
        var logger = Substitute.For<ILogger<ExpensesController>>();
        var controller = new ExpensesController(context, service, logger);

        var filter = new ExpenseFilterRequest
        {
            PageNumber = 1,
            PageSize = 10,
            Year = 2025,
            Month = 1
        };

        // Act
        var result = await controller.GetAll(filter);

        // Assert
        var okResult = result.Result as OkObjectResult;
        var response = okResult!.Value as PagedResponse<Expense>;

        response!.Items.Should().HaveCount(1);
        response.Items.First().Description.Should().Be("Jan 2025");
    }

    [Fact]
    public async Task GetAll_WithPagination_ShouldReturnCorrectPage()
    {
        // Arrange
        var context = CreateInMemoryContext();
        await SeedExpenses(context, 25);

        var service = Substitute.For<IExpenseService>();
        var logger = Substitute.For<ILogger<ExpensesController>>();
        var controller = new ExpensesController(context, service, logger);

        var filter = new ExpenseFilterRequest
        {
            PageNumber = 2,
            PageSize = 10
        };

        // Act
        var result = await controller.GetAll(filter);

        // Assert
        var okResult = result.Result as OkObjectResult;
        var response = okResult!.Value as PagedResponse<Expense>;

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
        await SeedExpenses(context, 25);

        var service = Substitute.For<IExpenseService>();
        var logger = Substitute.For<ILogger<ExpensesController>>();
        var controller = new ExpensesController(context, service, logger);

        var filter = new ExpenseFilterRequest
        {
            PageNumber = 3,
            PageSize = 10
        };

        // Act
        var result = await controller.GetAll(filter);

        // Assert
        var okResult = result.Result as OkObjectResult;
        var response = okResult!.Value as PagedResponse<Expense>;

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
        var service = Substitute.For<IExpenseService>();
        var logger = Substitute.For<ILogger<ExpensesController>>();
        var controller = new ExpensesController(context, service, logger);

        var filter = new ExpenseFilterRequest
        {
            PageNumber = 1,
            PageSize = 10
        };

        // Act
        var result = await controller.GetAll(filter);

        // Assert
        var okResult = result.Result as OkObjectResult;
        var response = okResult!.Value as PagedResponse<Expense>;

        response.Should().NotBeNull();
        response!.Items.Should().BeEmpty();
        response.TotalItems.Should().Be(0);
        response.TotalPages.Should().Be(0);
    }

    [Fact]
    public async Task GetAll_ShouldOrderByCreatedAtDescending()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var (establishment, card) = await SeedRequiredData(context);

        var expense1 = new Expense
        {
            Description = "Primeira",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.Pix,
            Amount = 100m,
            InstallmentCount = 1
        };
        expense1.GetType().GetProperty("CreatedAt")!.SetValue(expense1, new DateTime(2025, 1, 1));
        context.Expenses.Add(expense1);

        var expense2 = new Expense
        {
            Description = "Segunda",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.Pix,
            Amount = 200m,
            InstallmentCount = 1
        };
        expense2.GetType().GetProperty("CreatedAt")!.SetValue(expense2, new DateTime(2025, 3, 1));
        context.Expenses.Add(expense2);

        var expense3 = new Expense
        {
            Description = "Terceira",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.Pix,
            Amount = 300m,
            InstallmentCount = 1
        };
        expense3.GetType().GetProperty("CreatedAt")!.SetValue(expense3, new DateTime(2025, 2, 1));
        context.Expenses.Add(expense3);

        await context.SaveChangesAsync();

        var service = Substitute.For<IExpenseService>();
        var logger = Substitute.For<ILogger<ExpensesController>>();
        var controller = new ExpensesController(context, service, logger);

        var filter = new ExpenseFilterRequest { PageNumber = 1, PageSize = 10 };

        // Act
        var result = await controller.GetAll(filter);

        // Assert
        var okResult = result.Result as OkObjectResult;
        var response = okResult!.Value as PagedResponse<Expense>;

        response!.Items.Should().HaveCount(3);
        response.Items.First().Description.Should().Be("Segunda"); // Mais recente
        response.Items.Last().Description.Should().Be("Primeira"); // Mais antiga
    }

    [Fact]
    public async Task GetById_WithValidId_ShouldReturnExpenseWithNavigationProperties()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var (establishment, card) = await SeedRequiredData(context);

        var expense = new Expense
        {
            Description = "Compra Mercado",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.CreditCard,
            CardId = card.Id,
            Amount = 500m,
            InstallmentCount = 3
        };
        context.Expenses.Add(expense);
        await context.SaveChangesAsync();

        var service = Substitute.For<IExpenseService>();
        var logger = Substitute.For<ILogger<ExpensesController>>();
        var controller = new ExpensesController(context, service, logger);

        // Act
        var result = await controller.GetById(expense.Id);

        // Assert
        result.Result.Should().BeOfType<OkObjectResult>();
        var okResult = result.Result as OkObjectResult;
        var returnedExpense = okResult!.Value as Expense;

        returnedExpense.Should().NotBeNull();
        returnedExpense!.Id.Should().Be(expense.Id);
        returnedExpense.Description.Should().Be("Compra Mercado");
        returnedExpense.Amount.Should().Be(500m);
        returnedExpense.InstallmentCount.Should().Be(3);
        
        returnedExpense.Establishment.Should().NotBeNull();
        returnedExpense.Establishment!.Name.Should().Be("Mercado Teste");
        
        returnedExpense.Card.Should().NotBeNull();
        returnedExpense.Card!.Name.Should().Be("Cartão Teste");
    }

    [Fact]
    public async Task GetById_WithInvalidId_ShouldReturnNotFound()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var service = Substitute.For<IExpenseService>();
        var logger = Substitute.For<ILogger<ExpensesController>>();
        var controller = new ExpensesController(context, service, logger);

        // Act
        var result = await controller.GetById(999);

        // Assert
        result.Result.Should().BeOfType<NotFoundObjectResult>();
        var notFoundResult = result.Result as NotFoundObjectResult;
        notFoundResult!.Value.Should().Be("Despesa não encontrada");
    }

    [Fact]
    public async Task Create_WithValidData_ShouldReturnCreated()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var (establishment, card) = await SeedRequiredData(context);

        var service = Substitute.For<IExpenseService>();
        var logger = Substitute.For<ILogger<ExpensesController>>();
        var controller = new ExpensesController(context, service, logger);

        var dto = new CreateExpenseDto
        {
            Description = "Nova Despesa",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.CreditCard,
            CardId = card.Id,
            Amount = 350m,
            InstallmentCount = 2
        };

        var createdExpense = new Expense
        {
            Id = 1,
            Description = dto.Description,
            EstablishmentId = dto.EstablishmentId,
            PaymentType = dto.PaymentType,
            CardId = dto.CardId,
            Amount = dto.Amount,
            InstallmentCount = dto.InstallmentCount
        };

        service.AddAsync(dto).Returns(createdExpense);

        // Act
        var result = await controller.Create(dto);

        // Assert
        result.Result.Should().BeOfType<CreatedAtActionResult>();
        var createdResult = result.Result as CreatedAtActionResult;
        
        createdResult!.ActionName.Should().Be(nameof(ExpensesController.GetById));
        createdResult.RouteValues.Should().ContainKey("id");
        createdResult.RouteValues!["id"].Should().Be(1);

        var returnedExpense = createdResult.Value as Expense;
        returnedExpense.Should().NotBeNull();
        returnedExpense!.Description.Should().Be("Nova Despesa");
        returnedExpense.Amount.Should().Be(350m);
        returnedExpense.InstallmentCount.Should().Be(2);
    }

    [Fact]
    public async Task Create_WithInvalidModelState_ShouldReturnBadRequest()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var service = Substitute.For<IExpenseService>();
        var logger = Substitute.For<ILogger<ExpensesController>>();
        var controller = new ExpensesController(context, service, logger);

        var dto = new CreateExpenseDto
        {
            Description = "Teste",
            EstablishmentId = 1,
            PaymentType = PaymentType.Pix,
            Amount = 100m,
            InstallmentCount = 1
        };

        controller.ModelState.AddModelError("Amount", "Valor é obrigatório");

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
        var service = Substitute.For<IExpenseService>();
        var logger = Substitute.For<ILogger<ExpensesController>>();
        var controller = new ExpensesController(context, service, logger);

        var dto = new CreateExpenseDto
        {
            Description = "Teste",
            EstablishmentId = 1,
            PaymentType = PaymentType.Pix,
            Amount = 100m,
            InstallmentCount = 1
        };

        service.AddAsync(dto).Returns<Expense>(x => throw new Exception("Erro no banco de dados"));

        // Act
        var result = await controller.Create(dto);

        // Assert
        result.Result.Should().BeOfType<ObjectResult>();
        var objectResult = result.Result as ObjectResult;
        objectResult!.StatusCode.Should().Be(500);
        objectResult.Value.Should().Be("Erro interno do servidor");
    }

    [Fact]
    public async Task GetAll_WithDifferentPaymentTypes_ShouldReturnAll()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var (establishment, card) = await SeedRequiredData(context);

        context.Expenses.Add(new Expense
        {
            Description = "Pix",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.Pix,
            Amount = 100m,
            InstallmentCount = 1
        });

        context.Expenses.Add(new Expense
        {
            Description = "Crédito",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.CreditCard,
            CardId = card.Id,
            Amount = 200m,
            InstallmentCount = 1
        });

        context.Expenses.Add(new Expense
        {
            Description = "Débito",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.DebitCard,
            CardId = card.Id,
            Amount = 300m,
            InstallmentCount = 1
        });

        context.Expenses.Add(new Expense
        {
            Description = "Depósito",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.Deposit,
            Amount = 400m,
            InstallmentCount = 1
        });

        await context.SaveChangesAsync();

        var service = Substitute.For<IExpenseService>();
        var logger = Substitute.For<ILogger<ExpensesController>>();
        var controller = new ExpensesController(context, service, logger);

        var filter = new ExpenseFilterRequest { PageNumber = 1, PageSize = 10 };

        // Act
        var result = await controller.GetAll(filter);

        // Assert
        var okResult = result.Result as OkObjectResult;
        var response = okResult!.Value as PagedResponse<Expense>;

        response!.Items.Should().HaveCount(4);
        response.Items.Should().Contain(e => e.PaymentType == PaymentType.Pix);
        response.Items.Should().Contain(e => e.PaymentType == PaymentType.CreditCard);
        response.Items.Should().Contain(e => e.PaymentType == PaymentType.DebitCard);
        response.Items.Should().Contain(e => e.PaymentType == PaymentType.Deposit);
    }

    [Fact]
    public async Task GetAll_ExpensesWithoutCard_ShouldHaveNullCard()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var (establishment, _) = await SeedRequiredData(context);

        context.Expenses.Add(new Expense
        {
            Description = "Pix sem cartão",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.Pix,
            Amount = 100m,
            InstallmentCount = 1
        });

        await context.SaveChangesAsync();

        var service = Substitute.For<IExpenseService>();
        var logger = Substitute.For<ILogger<ExpensesController>>();
        var controller = new ExpensesController(context, service, logger);

        var filter = new ExpenseFilterRequest { PageNumber = 1, PageSize = 10 };

        // Act
        var result = await controller.GetAll(filter);

        // Assert
        var okResult = result.Result as OkObjectResult;
        var response = okResult!.Value as PagedResponse<Expense>;

        response!.Items.Should().HaveCount(1);
        var expense = response.Items.First();
        expense.Card.Should().BeNull();
        expense.CardId.Should().BeNull();
        expense.Establishment.Should().NotBeNull();
    }

    [Fact]
    public async Task GetAll_WithInstallments_ShouldReturnCorrectData()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var (establishment, card) = await SeedRequiredData(context);

        context.Expenses.Add(new Expense
        {
            Description = "Parcelado 3x",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.CreditCard,
            CardId = card.Id,
            Amount = 900m,
            InstallmentCount = 3
        });

        context.Expenses.Add(new Expense
        {
            Description = "Parcelado 12x",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.CreditCard,
            CardId = card.Id,
            Amount = 1200m,
            InstallmentCount = 12
        });

        await context.SaveChangesAsync();

        var service = Substitute.For<IExpenseService>();
        var logger = Substitute.For<ILogger<ExpensesController>>();
        var controller = new ExpensesController(context, service, logger);

        var filter = new ExpenseFilterRequest { PageNumber = 1, PageSize = 10 };

        // Act
        var result = await controller.GetAll(filter);

        // Assert
        var okResult = result.Result as OkObjectResult;
        var response = okResult!.Value as PagedResponse<Expense>;

        response!.Items.Should().HaveCount(2);
        response.Items.Should().Contain(e => e.InstallmentCount == 3 && e.Amount == 900m);
        response.Items.Should().Contain(e => e.InstallmentCount == 12 && e.Amount == 1200m);
    }

    [Fact]
    public async Task Delete_WithValidId_ShouldReturnNoContent()
    {
        // Arrange
        await using var context = CreateInMemoryContext();
        var (establishment, card) = await SeedRequiredData(context);
        
        var expense = new Expense
        {
            Description = "Despesa para deletar",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.CreditCard,
            CardId = card.Id,
            Amount = 100m,
            InstallmentCount = 1
        };
        context.Expenses.Add(expense);
        await context.SaveChangesAsync();

        var service = Substitute.For<IExpenseService>();
        var logger = Substitute.For<ILogger<ExpensesController>>();
        var controller = new ExpensesController(context, service, logger);

        // Act
        var result = await controller.Delete(expense.Id);

        // Assert
        result.Should().BeOfType<NoContentResult>();
        
        // Verificar se a despesa foi removida do banco
        var deletedExpense = await context.Expenses.FindAsync(expense.Id);
        deletedExpense.Should().BeNull();
    }

    [Fact]
    public async Task Delete_WithInvalidId_ShouldReturnNotFound()
    {
        // Arrange
        await using var context = CreateInMemoryContext();
        var service = Substitute.For<IExpenseService>();
        var logger = Substitute.For<ILogger<ExpensesController>>();
        var controller = new ExpensesController(context, service, logger);

        // Act
        var result = await controller.Delete(999);

        // Assert
        var notFoundResult = result.Should().BeOfType<NotFoundObjectResult>().Subject;
        notFoundResult.Value.Should().Be("Despesa não encontrada");
    }

    [Fact]
    public async Task Delete_WhenDatabaseThrowsException_ShouldReturnInternalServerError()
    {
        // Arrange
        await using var context = CreateInMemoryContext();
        var (establishment, card) = await SeedRequiredData(context);
        
        var expense = new Expense
        {
            Description = "Despesa teste",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.CreditCard,
            CardId = card.Id,
            Amount = 100m,
            InstallmentCount = 1
        };
        context.Expenses.Add(expense);
        await context.SaveChangesAsync();

        // Simular erro do banco de dados dispondo o contexto antes da operação
        await context.DisposeAsync();

        var service = Substitute.For<IExpenseService>();
        var logger = Substitute.For<ILogger<ExpensesController>>();
        var controller = new ExpensesController(context, service, logger);

        // Act
        var result = await controller.Delete(expense.Id);

        // Assert
        var statusCodeResult = result.Should().BeOfType<ObjectResult>().Subject;
        statusCodeResult.StatusCode.Should().Be(500);
        statusCodeResult.Value.Should().Be("Erro interno do servidor");
    }

    [Fact]
    public async Task Delete_ShouldLogInformationWhenSuccessful()
    {
        // Arrange
        await using var context = CreateInMemoryContext();
        var (establishment, card) = await SeedRequiredData(context);
        
        var expense = new Expense
        {
            Description = "Despesa para testar log",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.CreditCard,
            CardId = card.Id,
            Amount = 150m,
            InstallmentCount = 1
        };
        context.Expenses.Add(expense);
        await context.SaveChangesAsync();

        var service = Substitute.For<IExpenseService>();
        var logger = Substitute.For<ILogger<ExpensesController>>();
        var controller = new ExpensesController(context, service, logger);

        // Act
        await controller.Delete(expense.Id);

        // Assert
        logger.Received(1).LogInformation("Despesa deletada: {ExpenseId}", expense.Id);
    }

    [Fact]
    public async Task Delete_ShouldLogErrorWhenExceptionOccurs()
    {
        // Arrange
        await using var context = CreateInMemoryContext();
        var (establishment, card) = await SeedRequiredData(context);
        
        var expense = new Expense
        {
            Description = "Despesa teste erro",
            EstablishmentId = establishment.Id,
            PaymentType = PaymentType.CreditCard,
            CardId = card.Id,
            Amount = 100m,
            InstallmentCount = 1
        };
        context.Expenses.Add(expense);
        await context.SaveChangesAsync();

        // Simular erro dispondo o contexto
        await context.DisposeAsync();

        var service = Substitute.For<IExpenseService>();
        var logger = Substitute.For<ILogger<ExpensesController>>();
        var controller = new ExpensesController(context, service, logger);

        // Act
        await controller.Delete(expense.Id);

        // Assert
        logger.Received(1).LogError(Arg.Any<Exception>(), "Erro ao deletar despesa {ExpenseId}", expense.Id);
    }
}