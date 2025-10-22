using System.ComponentModel.DataAnnotations;
using CaderninhoApi.Domain.Enums;

namespace CaderninhoApi.Domain.Entities;

/// <summary>
/// Representa um limite de gasto mensal por tipo de estabelecimento
/// </summary>
public class MonthlySpendingLimit : BaseEntity
{
    /// <summary>
    /// Tipo de estabelecimento para o qual o limite se aplica
    /// </summary>
    [Display(Name = "Tipo de Estabelecimento")]
    public EstablishmentType EstablishmentType { get; set; }

    /// <summary>
    /// Valor limite mensal para este tipo de estabelecimento
    /// </summary>
    [Display(Name = "Valor Limite")]
    [Range(0, double.MaxValue, ErrorMessage = "O valor limite deve ser maior ou igual a zero")]
    public decimal LimitAmount { get; set; }

    /// <summary>
    /// Indica se o limite está ativo
    /// </summary>
    [Display(Name = "Ativo")]
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Mês de referência (1-12)
    /// </summary>
    [Display(Name = "Mês")]
    [Range(1, 12, ErrorMessage = "O mês deve estar entre 1 e 12")]
    public int Month { get; set; }

    /// <summary>
    /// Ano de referência
    /// </summary>
    [Display(Name = "Ano")]
    [Range(2000, 2100, ErrorMessage = "O ano deve estar entre 2000 e 2100")]
    public int Year { get; set; }
}
