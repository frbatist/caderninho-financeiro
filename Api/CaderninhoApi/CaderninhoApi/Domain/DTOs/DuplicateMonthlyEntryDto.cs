using System.ComponentModel.DataAnnotations;

namespace CaderninhoApi.Domain.DTOs;

/// <summary>
/// DTO para duplicação de entrada mensal para o próximo mês
/// </summary>
public class DuplicateMonthlyEntryDto
{
    /// <summary>
    /// Novo valor para a entrada duplicada (permite edição)
    /// </summary>
    [Required(ErrorMessage = "Valor é obrigatório")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Valor deve ser maior que zero")]
    public decimal Amount { get; set; }
}
