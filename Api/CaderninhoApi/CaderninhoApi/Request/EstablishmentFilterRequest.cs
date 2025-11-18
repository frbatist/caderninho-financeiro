using System.ComponentModel.DataAnnotations;
using CaderninhoApi.Domain.Enums;

namespace CaderninhoApi.Request;

/// <summary>
/// Objeto de filtro com paginação para estabelecimentos
/// </summary>
public class EstablishmentFilterRequest
{
    /// <summary>
    /// Número da página (começa em 1)
    /// </summary>
    [Display(Name = "Página")]
    public int PageNumber { get; set; } = 1;

    /// <summary>
    /// Quantidade de itens por página
    /// </summary>
    [Display(Name = "Itens por Página")]
    public int PageSize { get; set; } = 10;

    /// <summary>
    /// Texto para filtro por nome
    /// </summary>
    [Display(Name = "Filtro de Texto")]
    public string? SearchText { get; set; }

    /// <summary>
    /// Tipo do estabelecimento para filtro
    /// </summary>
    [Display(Name = "Tipo")]
    public EstablishmentType? Type { get; set; }
}