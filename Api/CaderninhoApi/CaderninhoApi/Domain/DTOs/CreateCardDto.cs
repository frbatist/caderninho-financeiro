using System.ComponentModel.DataAnnotations;
using CaderninhoApi.Domain.Enums;

namespace CaderninhoApi.Domain.DTOs;

/// <summary>
/// DTO para criação de um novo cartão
/// </summary>
public class CreateCardDto
{
    /// <summary>
    /// Nome identificador do cartão
    /// </summary>
    [Required(ErrorMessage = "O nome do cartão é obrigatório")]
    [MaxLength(100, ErrorMessage = "O nome deve ter no máximo 100 caracteres")]
    [Display(Name = "Nome do Cartão")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Tipo do cartão (crédito, débito, voucher)
    /// </summary>
    [Required(ErrorMessage = "O tipo do cartão é obrigatório")]
    [Display(Name = "Tipo do Cartão")]
    public CardType Type { get; set; }

    /// <summary>
    /// Bandeira do cartão
    /// </summary>
    [Required(ErrorMessage = "A bandeira do cartão é obrigatória")]
    [Display(Name = "Bandeira")]
    public CardBrand Brand { get; set; }

    /// <summary>
    /// Últimos quatro dígitos do cartão
    /// </summary>
    [Required(ErrorMessage = "Os últimos 4 dígitos são obrigatórios")]
    [StringLength(4, MinimumLength = 4, ErrorMessage = "Deve conter exatamente 4 dígitos")]
    [RegularExpression(@"^\d{4}$", ErrorMessage = "Deve conter apenas números")]
    [Display(Name = "Últimos 4 Dígitos")]
    public string LastFourDigits { get; set; } = string.Empty;
}