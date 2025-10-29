using System.ComponentModel.DataAnnotations;
using CaderninhoApi.Domain.Enums;

namespace CaderninhoApi.Domain.Entities;

/// <summary>
/// Representa um estabelecimento que pode receber pagamentos
/// </summary>
public class Establishment : BaseEntity
{
    /// <summary>
    /// Nome do estabelecimento
    /// </summary>
    [Display(Name = "Nome do Estabelecimento")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Tipo do estabelecimento
    /// </summary>
    [Display(Name = "Tipo do Estabelecimento")]
    public EstablishmentType Type { get; set; }

    /// <summary>
    /// Nome da fatura de cartão associada ao estabelecimento
    /// </summary>
    [Display(Name = "Nome da Fatura")]
    public string? CardInvoiceName { get; set; }
}