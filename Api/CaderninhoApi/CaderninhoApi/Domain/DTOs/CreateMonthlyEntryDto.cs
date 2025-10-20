using System.ComponentModel.DataAnnotations;
using CaderninhoApi.Domain.Enums;

namespace CaderninhoApi.Domain.DTOs;

/// <summary>
/// DTO para criação de entrada mensal
/// </summary>
public class CreateMonthlyEntryDto
{
    /// <summary>
    /// Tipo da entrada mensal
    /// </summary>
    [Required(ErrorMessage = "Tipo é obrigatório")]
    public MonthlyEntryType Type { get; set; }

    /// <summary>
    /// Descrição da entrada mensal
    /// </summary>
    [Required(ErrorMessage = "Descrição é obrigatória")]
    [StringLength(200, MinimumLength = 2, ErrorMessage = "Descrição deve ter entre 2 e 200 caracteres")]
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Valor da entrada mensal
    /// </summary>
    [Required(ErrorMessage = "Valor é obrigatório")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Valor deve ser maior que zero")]
    public decimal Amount { get; set; }

    /// <summary>
    /// Tipo de operação (Entrada ou Saída)
    /// </summary>
    [Required(ErrorMessage = "Operação é obrigatória")]
    public OperationType Operation { get; set; }

    /// <summary>
    /// Mês de referência (opcional, 1-12)
    /// </summary>
    [Range(1, 12, ErrorMessage = "Mês deve estar entre 1 e 12")]
    public int? Month { get; set; }

    /// <summary>
    /// Ano de referência (opcional)
    /// </summary>
    [Range(2000, 2100, ErrorMessage = "Ano deve estar entre 2000 e 2100")]
    public int? Year { get; set; }
}
