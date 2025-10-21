using CaderninhoApi.Domain.Abstractions.ApplicationServices;
using CaderninhoApi.Domain.Abstractions;
using CaderninhoApi.Domain.DTOs;
using CaderninhoApi.Domain.Entities;
using CaderninhoApi.Domain.Enums;
using CaderninhoApi.Infrastructure.Data;
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
}