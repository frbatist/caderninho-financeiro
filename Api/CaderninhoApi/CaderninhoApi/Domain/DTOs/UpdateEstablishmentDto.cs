using System.ComponentModel.DataAnnotations;
using CaderninhoApi.Domain.Enums;

namespace CaderninhoApi.Domain.DTOs;

/// <summary>
/// DTO para atualização de um estabelecimento existente
/// </summary>
public class UpdateEstablishmentDto
{
    /// <summary>
    /// Nome do estabelecimento
    /// </summary>
    [Required(ErrorMessage = "O nome do estabelecimento é obrigatório")]
    [MaxLength(200, ErrorMessage = "O nome deve ter no máximo 200 caracteres")]
    [Display(Name = "Nome do Estabelecimento")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Tipo do estabelecimento
    /// </summary>
    [Required(ErrorMessage = "O tipo do estabelecimento é obrigatório")]
    [Display(Name = "Tipo do Estabelecimento")]
    public EstablishmentType Type { get; set; }
}
