using System.ComponentModel.DataAnnotations;

namespace CaderninhoApi.Domain.Enums;

/// <summary>
/// Representa os tipos de entrada mensal disponíveis no sistema
/// </summary>
public enum MonthlyEntryType
{
    /// <summary>
    /// Salário ou remuneração mensal
    /// </summary>
    [Display(Name = "Salário")]
    Salary = 1,

    /// <summary>
    /// Impostos e taxas
    /// </summary>
    [Display(Name = "Imposto")]
    Tax = 2,

    /// <summary>
    /// Contas mensais fixas (água, luz, internet, etc)
    /// </summary>
    [Display(Name = "Conta Mensal")]
    MonthlyBill = 3,

    /// <summary>
    /// Outros tipos de entrada/saída
    /// </summary>
    [Display(Name = "Outros")]
    Other = 4
}
