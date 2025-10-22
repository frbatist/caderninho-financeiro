using System.ComponentModel.DataAnnotations;
using CaderninhoApi.Domain.Enums;

namespace CaderninhoApi.Domain.Entities;

/// <summary>
/// Representa uma entrada mensal no sistema (receitas ou despesas fixas)
/// </summary>
public class MonthlyEntry : BaseEntity
{
    /// <summary>
    /// Tipo da entrada mensal (Salário, Imposto, Conta Mensal, etc)
    /// </summary>
    [Display(Name = "Tipo")]
    public MonthlyEntryType Type { get; set; }

    /// <summary>
    /// Descrição da entrada mensal
    /// </summary>
    [Display(Name = "Descrição")]
    [Required(ErrorMessage = "Descrição é obrigatória")]
    [StringLength(200, ErrorMessage = "Descrição deve ter no máximo 200 caracteres")]
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Valor da entrada mensal
    /// </summary>
    [Display(Name = "Valor")]
    [Required(ErrorMessage = "Valor é obrigatório")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Valor deve ser maior que zero")]
    public decimal Amount { get; set; }

    /// <summary>
    /// Tipo de operação (Entrada ou Saída)
    /// </summary>
    [Display(Name = "Operação")]
    public OperationType Operation { get; set; }

    /// <summary>
    /// Indica se a entrada está ativa (para controle de entradas que podem ser desativadas temporariamente)
    /// </summary>
    [Display(Name = "Ativa")]
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Mês de referência (1-12)
    /// </summary>
    [Display(Name = "Mês")]
    [Range(1, 12, ErrorMessage = "Mês deve estar entre 1 e 12")]
    public int? Month { get; set; }

    /// <summary>
    /// Ano de referência
    /// </summary>
    [Display(Name = "Ano")]
    public int? Year { get; set; }
}
