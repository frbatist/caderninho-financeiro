using System.ComponentModel.DataAnnotations;
using CaderninhoApi.Domain.Enums;

namespace CaderninhoApi.Domain.Entities;

/// <summary>
/// Representa uma despesa no sistema
/// </summary>
public class Expense : BaseEntity
{
    private int? _cardId;

    /// <summary>
    /// Descrição da despesa
    /// </summary>
    [Display(Name = "Descrição")]
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// ID do estabelecimento onde foi realizada a despesa
    /// </summary>
    [Display(Name = "Estabelecimento")]
    public int EstablishmentId { get; set; }

    /// <summary>
    /// Estabelecimento onde foi realizada a despesa
    /// </summary>
    public Establishment Establishment { get; set; } = null!;

    /// <summary>
    /// Tipo de pagamento utilizado
    /// </summary>
    [Display(Name = "Tipo de Pagamento")]
    public PaymentType PaymentType { get; set; }

    /// <summary>
    /// ID do cartão utilizado (opcional, obrigatório se o tipo de pagamento for cartão)
    /// </summary>
    [Display(Name = "Cartão")]
    public int? CardId
    {
        get => _cardId;
        set
        {
            // Validação: Se o tipo de pagamento for cartão de crédito ou débito, o cartão é obrigatório
            if ((PaymentType == PaymentType.CreditCard || PaymentType == PaymentType.DebitCard) && value == null)
            {
                throw new InvalidOperationException("O cartão é obrigatório quando o tipo de pagamento é Cartão de Crédito ou Cartão de Débito.");
            }
            _cardId = value;
        }
    }

    /// <summary>
    /// Cartão utilizado no pagamento
    /// </summary>
    public Card? Card { get; set; }

    /// <summary>
    /// Valor da despesa
    /// </summary>
    [Display(Name = "Valor")]
    public decimal Amount { get; set; }

    /// <summary>
    /// Quantidade de parcelas
    /// </summary>
    [Display(Name = "Quantidade de Parcelas")]
    public int InstallmentCount { get; set; }
}