using CaderninhoApi.Domain.Abstractions.ApplicationServices;
using CaderninhoApi.Domain.DTOs;
using CaderninhoApi.Domain.Enums;
using CaderninhoApi.Infrastructure.Data;
using CaderninhoApi.Infrastructure.Helpers;
using Microsoft.EntityFrameworkCore;

namespace CaderninhoApi.Application.Services;

/// <summary>
/// Serviço para geração de extrato mensal
/// </summary>
public class MonthlyStatementService : IMonthlyStatementService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<MonthlyStatementService> _logger;

    public MonthlyStatementService(
        ApplicationDbContext context,
        ILogger<MonthlyStatementService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtém o extrato mensal completo com todas as despesas agrupadas por tipo
    /// </summary>
    public async Task<MonthlyStatementDto> GetMonthlyStatementAsync(
        int year, 
        int month, 
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Gerando extrato mensal para {Month}/{Year}", month, year);

        // 1. Buscar todas as despesas do mês (exceto cartão de crédito)
        var nonCreditCardExpenses = await GetNonCreditCardExpensesAsync(year, month, cancellationToken);
        _logger.LogDebug("Encontradas {Count} despesas não-cartão", nonCreditCardExpenses.Count);

        // 2. Buscar todas as parcelas de cartão de crédito com vencimento no mês
        var creditCardInstallments = await GetCreditCardInstallmentsAsync(year, month, cancellationToken);
        _logger.LogDebug("Encontradas {Count} parcelas de cartão", creditCardInstallments.Count);

        // 3. Unificar todas as transações
        var allTransactions = new List<StatementTransactionDto>();
        allTransactions.AddRange(nonCreditCardExpenses);
        allTransactions.AddRange(creditCardInstallments);

        // 4. Agrupar por tipo de estabelecimento
        var groupedByType = allTransactions
            .GroupBy(t => t.EstablishmentName) // Agrupar primeiro por estabelecimento para pegar o tipo
            .Select(g => new
            {
                EstablishmentType = GetEstablishmentTypeFromTransactions(g.Key),
                Transactions = g.ToList()
            })
            .GroupBy(x => x.EstablishmentType)
            .Select(g => new
            {
                EstablishmentType = g.Key,
                Transactions = g.SelectMany(x => x.Transactions).ToList()
            })
            .ToList();

        _logger.LogDebug("Despesas agrupadas em {Count} tipos diferentes", groupedByType.Count);

        // 5. Buscar limites mensais ativos para o mês
        var monthlyLimits = await _context.MonthlySpendingLimits
            .Where(l => l.Year == year && l.Month == month && l.IsActive)
            .ToListAsync(cancellationToken);

        _logger.LogDebug("Encontrados {Count} limites ativos", monthlyLimits.Count);

        // 6. Montar o DTO de resposta
        var expensesByType = new List<ExpenseByTypeDto>();

        foreach (var group in groupedByType)
        {
            var totalSpent = group.Transactions.Sum(t => t.Amount);
            var limit = monthlyLimits.FirstOrDefault(l => l.EstablishmentType == group.EstablishmentType);

            var expenseByType = new ExpenseByTypeDto
            {
                EstablishmentType = group.EstablishmentType,
                EstablishmentTypeName = group.EstablishmentType.GetDisplayName(),
                TotalSpent = totalSpent,
                MonthlyLimit = limit?.LimitAmount,
                Transactions = group.Transactions.OrderByDescending(t => t.Date).ToList()
            };

            // Calcular saldo e percentual
            if (limit != null)
            {
                expenseByType.AvailableBalance = limit.LimitAmount - totalSpent;
                expenseByType.PercentageUsed = limit.LimitAmount > 0 
                    ? (totalSpent / limit.LimitAmount) * 100 
                    : 0;
                expenseByType.IsOverLimit = totalSpent > limit.LimitAmount;
            }

            expensesByType.Add(expenseByType);
        }

        // Ordenar por total gasto (maior para menor)
        expensesByType = expensesByType.OrderByDescending(e => e.TotalSpent).ToList();

        // 7. Calcular totais gerais
        var totalExpenses = expensesByType.Sum(e => e.TotalSpent);
        var totalLimits = monthlyLimits.Sum(l => l.LimitAmount);
        var availableBalance = totalLimits - totalExpenses;
        var percentageUsed = totalLimits > 0 ? (totalExpenses / totalLimits) * 100 : 0;

        var statement = new MonthlyStatementDto
        {
            Year = year,
            Month = month,
            ExpensesByType = expensesByType,
            TotalExpenses = totalExpenses,
            TotalLimits = totalLimits,
            AvailableBalance = availableBalance,
            PercentageUsed = percentageUsed
        };

        _logger.LogInformation(
            "Extrato gerado: {Month}/{Year} - Total: {Total:C}, Limite: {Limit:C}, Disponível: {Available:C}", 
            month, year, totalExpenses, totalLimits, availableBalance);

        return statement;
    }

    /// <summary>
    /// Busca despesas que não são de cartão de crédito
    /// </summary>
    private async Task<List<StatementTransactionDto>> GetNonCreditCardExpensesAsync(
        int year, 
        int month, 
        CancellationToken cancellationToken)
    {
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        var expenses = await _context.Expenses
            .Include(e => e.Establishment)
            .Include(e => e.Card)
            .Where(e => e.Date >= startDate && 
                       e.Date <= endDate && 
                       e.PaymentType != PaymentType.CreditCard)
            .ToListAsync(cancellationToken);

        return expenses.Select(e => new StatementTransactionDto
        {
            ExpenseId = e.Id,
            Description = e.Description,
            EstablishmentName = e.Establishment?.Name ?? "Não informado",
            Date = e.Date,
            Amount = e.Amount,
            PaymentType = e.PaymentType,
            PaymentTypeName = e.PaymentType.GetDisplayName(),
            CardName = e.Card?.Name,
            InstallmentInfo = null,
            IsCreditCardInstallment = false,
            DueDate = null
        }).ToList();
    }

    /// <summary>
    /// Busca parcelas de cartão de crédito com vencimento no mês
    /// </summary>
    private async Task<List<StatementTransactionDto>> GetCreditCardInstallmentsAsync(
        int year, 
        int month, 
        CancellationToken cancellationToken)
    {
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        var installments = await _context.CreditCardInstallments
            .Include(i => i.Expense)
                .ThenInclude(e => e.Establishment)
            .Include(i => i.Card)
            .Where(i => i.DueDate >= startDate && i.DueDate <= endDate)
            .ToListAsync(cancellationToken);

        return installments.Select(i => new StatementTransactionDto
        {
            ExpenseId = i.ExpenseId,
            Description = i.Expense?.Description ?? "Não informado",
            EstablishmentName = i.Expense?.Establishment?.Name ?? "Não informado",
            Date = i.Expense?.Date ?? i.DueDate,
            Amount = i.Amount,
            PaymentType = PaymentType.CreditCard,
            PaymentTypeName = "Cartão de Crédito",
            CardName = i.Card?.Name,
            InstallmentInfo = $"{i.InstallmentNumber}/{i.TotalInstallments}",
            IsCreditCardInstallment = true,
            DueDate = i.DueDate
        }).ToList();
    }

    /// <summary>
    /// Obtém o tipo de estabelecimento a partir do nome (consulta no banco)
    /// </summary>
    private EstablishmentType GetEstablishmentTypeFromTransactions(string establishmentName)
    {
        var establishment = _context.Establishments
            .FirstOrDefault(e => e.Name == establishmentName);
        
        return establishment?.Type ?? EstablishmentType.Supermarket; // Default para Supermarket
    }
}
