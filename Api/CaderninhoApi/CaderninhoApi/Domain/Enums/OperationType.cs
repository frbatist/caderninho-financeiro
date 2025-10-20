using System.ComponentModel.DataAnnotations;

namespace CaderninhoApi.Domain.Enums;

/// <summary>
/// Representa o tipo de operação financeira (entrada ou saída)
/// </summary>
public enum OperationType
{
    /// <summary>
    /// Entrada de dinheiro (receita)
    /// </summary>
    [Display(Name = "Entrada")]
    Income = 1,

    /// <summary>
    /// Saída de dinheiro (despesa)
    /// </summary>
    [Display(Name = "Saída")]
    Expense = 2
}
