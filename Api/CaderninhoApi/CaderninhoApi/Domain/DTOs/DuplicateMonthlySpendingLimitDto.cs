using System.ComponentModel.DataAnnotations;

namespace CaderninhoApi.Domain.DTOs;

/// <summary>
/// DTO para duplicação de limite de gasto mensal para o próximo mês
/// </summary>
public class DuplicateMonthlySpendingLimitDto
{
    /// <summary>
    /// Novo valor para o limite duplicado (permite edição)
    /// </summary>
    [Required(ErrorMessage = "Valor é obrigatório")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Valor deve ser maior que zero")]
    public decimal Amount { get; set; }
}
