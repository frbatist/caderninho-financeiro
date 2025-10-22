using CaderninhoApi.Domain.Enums;

namespace CaderninhoApi.Domain.DTOs;

/// <summary>
/// DTO para o extrato mensal completo
/// </summary>
public class MonthlyStatementDto
{
    /// <summary>
    /// Ano do extrato
    /// </summary>
    public int Year { get; set; }

    /// <summary>
    /// Mês do extrato
    /// </summary>
    public int Month { get; set; }

    /// <summary>
    /// Despesas agrupadas por tipo de estabelecimento
    /// </summary>
    public List<ExpenseByTypeDto> ExpensesByType { get; set; } = new();

    /// <summary>
    /// Total geral de despesas do mês
    /// </summary>
    public decimal TotalExpenses { get; set; }

    /// <summary>
    /// Total de limites configurados
    /// </summary>
    public decimal TotalLimits { get; set; }

    /// <summary>
    /// Saldo disponível (limite - gasto)
    /// </summary>
    public decimal AvailableBalance { get; set; }

    /// <summary>
    /// Percentual gasto do limite total
    /// </summary>
    public decimal PercentageUsed { get; set; }
}

/// <summary>
/// DTO para despesas agrupadas por tipo de estabelecimento
/// </summary>
public class ExpenseByTypeDto
{
    /// <summary>
    /// Tipo de estabelecimento
    /// </summary>
    public EstablishmentType EstablishmentType { get; set; }

    /// <summary>
    /// Nome do tipo de estabelecimento
    /// </summary>
    public string EstablishmentTypeName { get; set; } = string.Empty;

    /// <summary>
    /// Limite mensal configurado para este tipo (se houver)
    /// </summary>
    public decimal? MonthlyLimit { get; set; }

    /// <summary>
    /// Total gasto neste tipo no mês
    /// </summary>
    public decimal TotalSpent { get; set; }

    /// <summary>
    /// Saldo disponível (limite - gasto)
    /// </summary>
    public decimal? AvailableBalance { get; set; }

    /// <summary>
    /// Percentual gasto do limite
    /// </summary>
    public decimal? PercentageUsed { get; set; }

    /// <summary>
    /// Indica se ultrapassou o limite
    /// </summary>
    public bool IsOverLimit { get; set; }

    /// <summary>
    /// Lista de transações detalhadas
    /// </summary>
    public List<StatementTransactionDto> Transactions { get; set; } = new();
}

/// <summary>
/// DTO para uma transação individual no extrato
/// </summary>
public class StatementTransactionDto
{
    /// <summary>
    /// ID da despesa original
    /// </summary>
    public int ExpenseId { get; set; }

    /// <summary>
    /// Descrição da despesa
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Nome do estabelecimento
    /// </summary>
    public string EstablishmentName { get; set; } = string.Empty;

    /// <summary>
    /// Data da despesa
    /// </summary>
    public DateTime Date { get; set; }

    /// <summary>
    /// Valor da transação
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// Tipo de pagamento
    /// </summary>
    public PaymentType PaymentType { get; set; }

    /// <summary>
    /// Nome do tipo de pagamento
    /// </summary>
    public string PaymentTypeName { get; set; } = string.Empty;

    /// <summary>
    /// Nome do cartão (se aplicável)
    /// </summary>
    public string? CardName { get; set; }

    /// <summary>
    /// Informação de parcelamento (se aplicável)
    /// </summary>
    public string? InstallmentInfo { get; set; }

    /// <summary>
    /// Indica se é uma parcela de cartão de crédito
    /// </summary>
    public bool IsCreditCardInstallment { get; set; }

    /// <summary>
    /// Data de vencimento (para parcelas de cartão)
    /// </summary>
    public DateTime? DueDate { get; set; }
}
