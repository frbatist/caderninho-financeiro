using System.ComponentModel.DataAnnotations;
using CaderninhoApi.Domain.DTOs;

namespace CaderninhoApi.Request;

/// <summary>
/// Request para importação de fatura de cartão
/// </summary>
public class ImportCardInvoiceRequest
{
    /// <summary>
    /// ID do cartão de crédito
    /// </summary>
    [Required(ErrorMessage = "O ID do cartão é obrigatório")]
    [Display(Name = "ID do Cartão")]
    public int CardId { get; set; }

    /// <summary>
    /// ID do usuário que está importando a fatura
    /// </summary>
    [Required(ErrorMessage = "O ID do usuário é obrigatório")]
    [Display(Name = "ID do Usuário")]
    public int UserId { get; set; }

    /// <summary>
    /// Lista de linhas do CSV da fatura
    /// </summary>
    [Required(ErrorMessage = "A lista de linhas é obrigatória")]
    [MinLength(1, ErrorMessage = "Deve haver pelo menos uma linha na fatura")]
    [Display(Name = "Linhas da Fatura")]
    public List<CardInvoiceLineDto> Lines { get; set; } = new();
}
