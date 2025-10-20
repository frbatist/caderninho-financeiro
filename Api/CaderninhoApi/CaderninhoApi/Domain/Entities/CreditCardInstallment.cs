using System.ComponentModel.DataAnnotations;

namespace CaderninhoApi.Domain.Entities;

/// <summary>
/// Representa uma parcela de cartão de crédito
/// </summary>
public class CreditCardInstallment : BaseEntity
{
    /// <summary>
    /// ID do cartão de crédito
    /// </summary>
    [Required]
    public int CardId { get; set; }

    /// <summary>
    /// Navegação para o cartão de crédito
    /// </summary>
    public Card Card { get; set; } = null!;

    /// <summary>
    /// ID da despesa original
    /// </summary>
    [Required]
    public int ExpenseId { get; set; }

    /// <summary>
    /// Navegação para a despesa
    /// </summary>
    public Expense Expense { get; set; } = null!;

    /// <summary>
    /// Número da parcela (1, 2, 3, etc.)
    /// </summary>
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "O número da parcela deve ser maior que zero")]
    public int InstallmentNumber { get; set; }

    /// <summary>
    /// Total de parcelas
    /// </summary>
    [Required]
    [Range(1, 120, ErrorMessage = "O total de parcelas deve estar entre 1 e 120")]
    public int TotalInstallments { get; set; }

    /// <summary>
    /// Data de vencimento da parcela
    /// </summary>
    [Required]
    public DateTime DueDate { get; set; }

    /// <summary>
    /// Valor da parcela
    /// </summary>
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "O valor deve ser maior que zero")]
    public decimal Amount { get; set; }

    /// <summary>
    /// Indica se a parcela foi paga
    /// </summary>
    public bool IsPaid { get; set; } = false;

    /// <summary>
    /// Data de pagamento da parcela
    /// </summary>
    public DateTime? PaidDate { get; set; }
}
