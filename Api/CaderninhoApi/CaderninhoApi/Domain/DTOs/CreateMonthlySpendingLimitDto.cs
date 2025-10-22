using System.ComponentModel.DataAnnotations;
using CaderninhoApi.Domain.Enums;

namespace CaderninhoApi.Domain.DTOs;

/// <summary>
/// DTO para criação/atualização de limite de gasto mensal
/// </summary>
public class CreateMonthlySpendingLimitDto
{
    /// <summary>
    /// Tipo de estabelecimento para o qual o limite se aplica
    /// </summary>
    [Required(ErrorMessage = "O tipo de estabelecimento é obrigatório")]
    [Display(Name = "Tipo de Estabelecimento")]
    public EstablishmentType EstablishmentType { get; set; }

    /// <summary>
    /// Valor limite mensal para este tipo de estabelecimento
    /// </summary>
    [Required(ErrorMessage = "O valor limite é obrigatório")]
    [Range(0, double.MaxValue, ErrorMessage = "O valor limite deve ser maior ou igual a zero")]
    [Display(Name = "Valor Limite")]
    public decimal LimitAmount { get; set; }

    /// <summary>
    /// Mês de referência (1-12)
    /// </summary>
    [Required(ErrorMessage = "O mês é obrigatório")]
    [Range(1, 12, ErrorMessage = "O mês deve estar entre 1 e 12")]
    [Display(Name = "Mês")]
    public int Month { get; set; }

    /// <summary>
    /// Ano de referência
    /// </summary>
    [Required(ErrorMessage = "O ano é obrigatório")]
    [Range(2000, 2100, ErrorMessage = "O ano deve estar entre 2000 e 2100")]
    [Display(Name = "Ano")]
    public int Year { get; set; }
}
