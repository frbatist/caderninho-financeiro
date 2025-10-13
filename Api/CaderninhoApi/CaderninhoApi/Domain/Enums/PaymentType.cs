using System.ComponentModel.DataAnnotations;

namespace CaderninhoApi.Domain.Enums;

/// <summary>
/// Representa os tipos de pagamento disponíveis no sistema
/// </summary>
public enum PaymentType
{
    /// <summary>
    /// Pagamento realizado com cartão de crédito
    /// </summary>
    [Display(Name = "Cartão de Crédito")]
    CreditCard = 1,

    /// <summary>
    /// Pagamento realizado com cartão de débito
    /// </summary>
    [Display(Name = "Cartão de Débito")]
    DebitCard = 2,

    /// <summary>
    /// Pagamento realizado via PIX
    /// </summary>
    [Display(Name = "PIX")]
    Pix = 3,

    /// <summary>
    /// Pagamento realizado via depósito bancário
    /// </summary>
    [Display(Name = "Depósito")]
    Deposit = 4
}