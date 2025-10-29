using System.ComponentModel.DataAnnotations;

namespace CaderninhoApi.Domain.DTOs;

/// <summary>
/// DTO para uma linha de importação de fatura de cartão
/// </summary>
public class CardInvoiceLineDto
{
    /// <summary>
    /// Data da despesa
    /// </summary>
    [Required(ErrorMessage = "A data é obrigatória")]
    [Display(Name = "Data")]
    public DateTime Date { get; set; }

    /// <summary>
    /// Nome do estabelecimento conforme aparece na fatura
    /// </summary>
    [Required(ErrorMessage = "O estabelecimento é obrigatório")]
    [MaxLength(200, ErrorMessage = "O nome do estabelecimento deve ter no máximo 200 caracteres")]
    [Display(Name = "Estabelecimento")]
    public string EstablishmentName { get; set; } = string.Empty;

    /// <summary>
    /// Valor da despesa
    /// </summary>
    [Required(ErrorMessage = "O valor é obrigatório")]
    [Display(Name = "Valor")]
    public decimal Amount { get; set; }
}
