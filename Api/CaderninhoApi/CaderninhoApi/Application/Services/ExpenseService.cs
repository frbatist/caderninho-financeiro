using CaderninhoApi.Domain.Abstractions.ApplicationServices;
using CaderninhoApi.Domain.Abstractions;
using CaderninhoApi.Domain.DTOs;
using CaderninhoApi.Domain.Entities;
using CaderninhoApi.Domain.Enums;
using CaderninhoApi.Infrastructure.Data;
using CaderninhoApi.Request;
using Microsoft.EntityFrameworkCore;

namespace CaderninhoApi.Application.Services;

/// <summary>
/// Serviço para operações com despesas
/// </summary>
public class ExpenseService : IExpenseService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ExpenseService> _logger;
    private readonly ICreditCardInstallmentDomainService _installmentService;

    public ExpenseService(
        ApplicationDbContext context,
        ILogger<ExpenseService> logger,
        ICreditCardInstallmentDomainService installmentService)
    {
        _context = context;
        _logger = logger;
        _installmentService = installmentService;
    }

    /// <summary>
    /// Adiciona uma nova despesa
    /// </summary>
    /// <param name="dto">Dados da despesa a ser criada</param>
    /// <returns>Despesa criada</returns>
    public async Task<Expense> AddAsync(CreateExpenseDto dto)
    {
        try
        {
            // Validar se o usuário existe
            var userExists = await _context.Users.AnyAsync(u => u.Id == dto.UserId);
            if (!userExists)
            {
                throw new InvalidOperationException("Usuário não encontrado");
            }

            // Validar se o estabelecimento existe
            var establishmentExists = await _context.Establishments
                .AnyAsync(e => e.Id == dto.EstablishmentId);
            
            if (!establishmentExists)
            {
                throw new InvalidOperationException("Estabelecimento não encontrado");
            }

            // Validar cartão para pagamentos com cartão
            if ((dto.PaymentType == PaymentType.CreditCard || dto.PaymentType == PaymentType.DebitCard))
            {
                if (!dto.CardId.HasValue)
                {
                    throw new InvalidOperationException("O cartão é obrigatório quando o tipo de pagamento é Cartão de Crédito ou Cartão de Débito");
                }

                var cardExists = await _context.Cards.AnyAsync(c => c.Id == dto.CardId.Value);
                if (!cardExists)
                {
                    throw new InvalidOperationException("Cartão não encontrado");
                }
            }

            var expense = new Expense
            {
                UserId = dto.UserId,
                Description = dto.Description,
                EstablishmentId = dto.EstablishmentId,
                PaymentType = dto.PaymentType,
                CardId = dto.CardId,
                Amount = dto.Amount,
                Date = dto.Date,
                InstallmentCount = dto.InstallmentCount
            };

            // Se a despesa for cartão de crédito, criar as parcelas
            if (dto.PaymentType == PaymentType.CreditCard)
            {
                _logger.LogInformation("Criando {Count} parcela(s) para a despesa {ExpenseId}",
                    dto.InstallmentCount, expense.Id);

                await _installmentService.CreateInstallmentsAsync(expense);

                _logger.LogInformation("Parcela(s) criada(s) com sucesso para a despesa {ExpenseId}", expense.Id);
            }
            
            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Despesa criada com sucesso: {ExpenseId} - {Description} - R$ {Amount}",
                expense.Id, expense.Description, expense.Amount);
                
            return expense;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao criar despesa: {Description}", dto.Description);
            throw;
        }
    }

    /// <summary>
    /// Importa fatura de cartão de crédito a partir de um CSV
    /// </summary>
    /// <param name="request">Dados da importação com linhas da fatura</param>
    /// <returns>Lista de despesas criadas</returns>
    public async Task<List<Expense>> ImportCardInvoiceAsync(ImportCardInvoiceRequest request)
    {
        try
        {
            _logger.LogInformation("Iniciando importação de fatura para o cartão {CardId} com {Count} linhas",
                request.CardId, request.Lines.Count);

            // Validar se o usuário existe
            var userExists = await _context.Users.AnyAsync(u => u.Id == request.UserId);
            if (!userExists)
            {
                throw new InvalidOperationException("Usuário não encontrado");
            }

            // Validar se o cartão existe
            var cardExists = await _context.Cards.AnyAsync(c => c.Id == request.CardId);
            if (!cardExists)
            {
                throw new InvalidOperationException("Cartão não encontrado");
            }

            var createdExpenses = new List<Expense>();

            // Processar cada linha da fatura
            foreach (var line in request.Lines.Where(d => d.Amount > 0))
            {
                // Buscar ou criar estabelecimento
                var establishment = await _context.Establishments
                    .FirstOrDefaultAsync(e => e.CardInvoiceName == line.EstablishmentName);

                if (establishment == null)
                {
                    _logger.LogInformation("Estabelecimento '{Name}' não encontrado. Criando novo com tipo 'Outros'",
                        line.EstablishmentName);

                    establishment = new Establishment
                    {
                        Name = line.EstablishmentName,
                        CardInvoiceName = line.EstablishmentName,
                        Type = EstablishmentType.Other
                    };

                    _context.Establishments.Add(establishment);
                    await _context.SaveChangesAsync();

                    _logger.LogInformation("Estabelecimento '{Name}' criado com ID {Id}",
                        establishment.Name, establishment.Id);
                }

                // Verificar se já existe uma despesa com os mesmos dados na mesma data
                var expenseExists = await _context.Expenses.AnyAsync(e =>
                    e.Date.Date == line.Date.Date &&
                    e.EstablishmentId == establishment.Id &&
                    e.Amount == line.Amount &&
                    e.CardId == request.CardId);

                if (expenseExists)
                {
                    _logger.LogWarning("Despesa duplicada ignorada: {Date} - {Establishment} - R$ {Amount}",
                        line.Date.ToString("dd/MM/yyyy"), line.EstablishmentName, line.Amount);
                    continue;
                }

                // Criar a despesa usando o método AddAsync existente
                var expenseDto = new CreateExpenseDto
                {
                    UserId = request.UserId,
                    Description = $"Compra em {line.EstablishmentName}",
                    EstablishmentId = establishment.Id,
                    PaymentType = PaymentType.CreditCard,
                    CardId = request.CardId,
                    Amount = line.Amount,
                    Date = line.Date,
                    InstallmentCount = 1 // Sempre 1 parcela conforme especificado
                };

                var expense = await AddAsync(expenseDto);
                createdExpenses.Add(expense);

                _logger.LogInformation("Despesa importada: {Date} - {Establishment} - R$ {Amount}",
                    line.Date.ToString("dd/MM/yyyy"), line.EstablishmentName, line.Amount);
            }

            _logger.LogInformation("Importação concluída. {Count} despesas criadas", createdExpenses.Count);

            return createdExpenses;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao importar fatura do cartão {CardId}", request.CardId);
            throw;
        }
    }
}