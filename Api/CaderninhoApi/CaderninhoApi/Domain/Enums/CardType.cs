using System.ComponentModel.DataAnnotations;

namespace CaderninhoApi.Domain.Enums;

/// <summary>
/// Representa os tipos de cartão disponíveis no sistema
/// </summary>
public enum CardType
{
    /// <summary>
    /// Cartão de crédito
    /// </summary>
    [Display(Name = "Crédito")]
    Credit = 1,

    /// <summary>
    /// Cartão de débito
    /// </summary>
    [Display(Name = "Débito")]
    Debit = 2,

    /// <summary>
    /// Cartão voucher
    /// </summary>
    [Display(Name = "Voucher")]
    Voucher = 3
}