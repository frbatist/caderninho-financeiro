using System.ComponentModel.DataAnnotations;
using CaderninhoApi.Domain.Enums;

namespace CaderninhoApi.Domain.DTOs;

/// <summary>
/// DTO para criação de uma nova despesa
/// </summary>
public class CreateExpenseDto
{
    /// <summary>
    /// Descrição da despesa
    /// </summary>
    [Required(ErrorMessage = "A descrição é obrigatória")]
    [MaxLength(500, ErrorMessage = "A descrição deve ter no máximo 500 caracteres")]
    [Display(Name = "Descrição")]
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// ID do estabelecimento onde foi realizada a despesa
    /// </summary>
    [Required(ErrorMessage = "O estabelecimento é obrigatório")]
    [Display(Name = "Estabelecimento")]
    public int EstablishmentId { get; set; }

    /// <summary>
    /// Tipo de pagamento utilizado
    /// </summary>
    [Required(ErrorMessage = "O tipo de pagamento é obrigatório")]
    [Display(Name = "Tipo de Pagamento")]
    public PaymentType PaymentType { get; set; }

    /// <summary>
    /// ID do cartão utilizado (opcional, obrigatório se o tipo de pagamento for cartão)
    /// </summary>
    [Display(Name = "Cartão")]
    public int? CardId { get; set; }

    /// <summary>
    /// Valor da despesa
    /// </summary>
    [Required(ErrorMessage = "O valor é obrigatório")]
    [Range(0.01, double.MaxValue, ErrorMessage = "O valor deve ser maior que zero")]
    [Display(Name = "Valor")]
    public decimal Amount { get; set; }

    /// <summary>
    /// Data da despesa
    /// </summary>
    [Required(ErrorMessage = "A data é obrigatória")]
    [Display(Name = "Data")]
    public DateTime Date { get; set; }

    /// <summary>
    /// Quantidade de parcelas
    /// </summary>
    [Required(ErrorMessage = "A quantidade de parcelas é obrigatória")]
    [Range(1, 120, ErrorMessage = "A quantidade de parcelas deve ser entre 1 e 120")]
    [Display(Name = "Quantidade de Parcelas")]
    public int InstallmentCount { get; set; } = 1;
}