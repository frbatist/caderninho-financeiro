using System.ComponentModel.DataAnnotations;

namespace CaderninhoApi.Request;

/// <summary>
/// Objeto de filtro com paginação para cartões
/// </summary>
public class CardFilterRequest
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
}