using System.ComponentModel.DataAnnotations;
using CaderninhoApi.Domain.Enums;

namespace CaderninhoApi.Domain.Entities;

/// <summary>
/// Representa um cartão no sistema
/// </summary>
public class Card : BaseEntity
{
    /// <summary>
    /// Nome identificador do cartão
    /// </summary>
    [Display(Name = "Nome do Cartão")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Tipo do cartão (crédito, débito, voucher)
    /// </summary>
    [Display(Name = "Tipo do Cartão")]
    public CardType Type { get; set; }

    /// <summary>
    /// Bandeira do cartão
    /// </summary>
    [Display(Name = "Bandeira")]
    public CardBrand Brand { get; set; }

    /// <summary>
    /// Últimos quatro dígitos do cartão
    /// </summary>
    [Display(Name = "Últimos 4 Dígitos")]
    public string LastFourDigits { get; set; } = string.Empty;

    /// <summary>
    /// Dia do mês em que a fatura fecha (1-31)
    /// </summary>
    [Display(Name = "Dia de Fechamento")]
    public int? ClosingDay { get; set; }
}