using System.ComponentModel.DataAnnotations;

namespace CaderninhoApi.Domain.Enums;

/// <summary>
/// Representa as bandeiras de cartão disponíveis no sistema
/// </summary>
public enum CardBrand
{
    /// <summary>
    /// Visa
    /// </summary>
    [Display(Name = "Visa")]
    Visa = 1,

    /// <summary>
    /// Mastercard
    /// </summary>
    [Display(Name = "Mastercard")]
    Mastercard = 2,

    /// <summary>
    /// Hipercard
    /// </summary>
    [Display(Name = "Hipercard")]
    Hipercard = 3,

    /// <summary>
    /// Elo
    /// </summary>
    [Display(Name = "Elo")]
    Elo = 4
}