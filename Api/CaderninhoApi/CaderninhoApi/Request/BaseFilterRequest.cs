using System.ComponentModel.DataAnnotations;

namespace CaderninhoApi.Request;

/// <summary>
/// Objeto de filtro base com paginação e busca por texto
/// </summary>
public class BaseFilterRequest
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
    /// Texto para busca (opcional)
    /// </summary>
    [Display(Name = "Busca")]
    public string? SearchText { get; set; }
}
