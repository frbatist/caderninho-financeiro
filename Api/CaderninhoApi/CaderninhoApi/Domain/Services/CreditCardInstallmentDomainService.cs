using CaderninhoApi.Domain.Abstractions;
using CaderninhoApi.Domain.Entities;
using CaderninhoApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CaderninhoApi.Domain.Services;

/// <summary>
/// Serviço de domínio para gerenciamento de parcelas de cartão de crédito
/// </summary>
public class CreditCardInstallmentDomainService : ICreditCardInstallmentDomainService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CreditCardInstallmentDomainService> _logger;
    private const int DueDayOfMonth = 15; // Dia 15 de cada mês para vencimento

    public CreditCardInstallmentDomainService(
        ApplicationDbContext context,
        ILogger<CreditCardInstallmentDomainService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Cria as parcelas de cartão de crédito para uma despesa
    /// </summary>
    public async Task<List<CreditCardInstallment>> CreateInstallmentsAsync(
        Expense expense, 
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Criando parcelas para a despesa {ExpenseId} com {Installments} parcelas", 
            expense.Id, expense.InstallmentCount);

        // Validar se a despesa tem número de parcelas válido
        if (expense.InstallmentCount < 1)
        {
            throw new ArgumentException("O número de parcelas deve ser maior ou igual a 1", nameof(expense));
        }

        // Validar se a despesa tem um cartão associado
        if (!expense.CardId.HasValue)
        {
            throw new ArgumentException("A despesa deve ter um cartão de crédito associado", nameof(expense));
        }

        // Carregar o cartão para obter o dia de fechamento
        var card = await _context.Cards
            .FirstOrDefaultAsync(c => c.Id == expense.CardId.Value, cancellationToken);

        if (card == null)
        {
            throw new InvalidOperationException($"Cartão com ID {expense.CardId.Value} não encontrado");
        }

        if (!card.ClosingDay.HasValue)
        {
            throw new InvalidOperationException($"O cartão '{card.Name}' não possui dia de fechamento configurado");
        }

        // Calcular o valor de cada parcela
        var installmentAmount = expense.Amount / expense.InstallmentCount;
        
        // Ajustar a última parcela para compensar arredondamentos
        var totalParceled = installmentAmount * (expense.InstallmentCount - 1);
        var lastInstallmentAmount = expense.Amount - totalParceled;

        var installments = new List<CreditCardInstallment>();

        // Calcular a data de vencimento da primeira parcela
        var firstDueDate = CalculateFirstDueDate(expense.Date, card.ClosingDay.Value);

        for (int i = 1; i <= expense.InstallmentCount; i++)
        {
            // Calcular a data de vencimento para esta parcela
            var dueDate = CalculateDueDate(firstDueDate, i - 1);

            var installment = new CreditCardInstallment
            {
                CardId = expense.CardId.Value,
                ExpenseId = expense.Id,
                InstallmentNumber = i,
                TotalInstallments = expense.InstallmentCount,
                DueDate = dueDate,
                Amount = i == expense.InstallmentCount ? lastInstallmentAmount : installmentAmount,
                IsPaid = false
            };

            installments.Add(installment);
            _logger.LogDebug("Parcela {Number}/{Total} criada com vencimento em {DueDate} no valor de {Amount:C}", 
                i, expense.InstallmentCount, dueDate.ToString("dd/MM/yyyy"), installment.Amount);
        }

        // Adicionar as parcelas ao contexto
        await _context.CreditCardInstallments.AddRangeAsync(installments, cancellationToken);

        _logger.LogInformation("Criadas {Count} parcelas para a despesa {ExpenseId}", 
            installments.Count, expense.Id);

        return installments;
    }

    /// <summary>
    /// Calcula a data de vencimento da primeira parcela
    /// </summary>
    private DateTime CalculateFirstDueDate(DateTime expenseDate, int closingDay)
    {
        // Se o dia da despesa for menor ou igual ao dia de fechamento,
        // a primeira parcela vence no mesmo mês (dia 10)
        if (expenseDate.Day <= closingDay)
        {
            // Vencimento no mesmo mês
            var dueDate = new DateTime(expenseDate.Year, expenseDate.Month, DueDayOfMonth);
            
            _logger.LogDebug("Primeira parcela vence no mesmo mês: {DueDate} (Despesa: {ExpenseDate}, Fechamento: dia {ClosingDay})",
                dueDate.ToString("dd/MM/yyyy"), expenseDate.ToString("dd/MM/yyyy"), closingDay);
            
            return dueDate;
        }
        else
        {
            // Se o dia da despesa for maior que o dia de fechamento,
            // a primeira parcela vence no próximo mês (dia 10)
            var nextMonth = expenseDate.AddMonths(1);
            var dueDate = new DateTime(nextMonth.Year, nextMonth.Month, DueDayOfMonth);
            
            _logger.LogDebug("Primeira parcela vence no próximo mês: {DueDate} (Despesa: {ExpenseDate}, Fechamento: dia {ClosingDay})",
                dueDate.ToString("dd/MM/yyyy"), expenseDate.ToString("dd/MM/yyyy"), closingDay);
            
            return dueDate;
        }
    }

    /// <summary>
    /// Calcula a data de vencimento de uma parcela específica
    /// </summary>
    private DateTime CalculateDueDate(DateTime firstDueDate, int monthsToAdd)
    {
        // Adicionar os meses à primeira data de vencimento
        var dueDate = firstDueDate.AddMonths(monthsToAdd);
        
        // Garantir que o dia seja sempre o dia 10
        dueDate = new DateTime(dueDate.Year, dueDate.Month, DueDayOfMonth);
        
        return dueDate;
    }

    /// <summary>
    /// Obtém todas as parcelas de uma despesa
    /// </summary>
    public async Task<List<CreditCardInstallment>> GetInstallmentsByExpenseIdAsync(
        int expenseId, 
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Buscando parcelas da despesa {ExpenseId}", expenseId);

        var installments = await _context.CreditCardInstallments
            .Include(i => i.Card)
            .Include(i => i.Expense)
            .Where(i => i.ExpenseId == expenseId)
            .OrderBy(i => i.InstallmentNumber)
            .ToListAsync(cancellationToken);

        _logger.LogInformation("Encontradas {Count} parcelas para a despesa {ExpenseId}", 
            installments.Count, expenseId);

        return installments;
    }

    /// <summary>
    /// Obtém todas as parcelas de um cartão em um período
    /// </summary>
    public async Task<List<CreditCardInstallment>> GetInstallmentsByCardAndPeriodAsync(
        int cardId, 
        DateTime startDate, 
        DateTime endDate, 
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Buscando parcelas do cartão {CardId} entre {StartDate} e {EndDate}", 
            cardId, startDate.ToString("dd/MM/yyyy"), endDate.ToString("dd/MM/yyyy"));

        var installments = await _context.CreditCardInstallments
            .Include(i => i.Card)
            .Include(i => i.Expense)
            .Where(i => i.CardId == cardId && 
                       i.DueDate >= startDate && 
                       i.DueDate <= endDate)
            .OrderBy(i => i.DueDate)
            .ThenBy(i => i.InstallmentNumber)
            .ToListAsync(cancellationToken);

        _logger.LogInformation("Encontradas {Count} parcelas para o cartão {CardId} no período", 
            installments.Count, cardId);

        return installments;
    }

    /// <summary>
    /// Marca uma parcela como paga
    /// </summary>
    public async Task<CreditCardInstallment> MarkAsPaidAsync(
        int installmentId, 
        DateTime paidDate, 
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Marcando parcela {InstallmentId} como paga em {PaidDate}", 
            installmentId, paidDate.ToString("dd/MM/yyyy"));

        var installment = await _context.CreditCardInstallments
            .FirstOrDefaultAsync(i => i.Id == installmentId, cancellationToken);

        if (installment == null)
        {
            throw new InvalidOperationException($"Parcela com ID {installmentId} não encontrada");
        }

        if (installment.IsPaid)
        {
            _logger.LogWarning("Parcela {InstallmentId} já está marcada como paga", installmentId);
        }

        installment.IsPaid = true;
        installment.PaidDate = paidDate;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Parcela {InstallmentId} marcada como paga com sucesso", installmentId);

        return installment;
    }
}
