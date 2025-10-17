namespace CaderninhoApi.Request;

/// <summary>
/// Resposta paginada genérica
/// </summary>
/// <typeparam name="T">Tipo dos itens retornados</typeparam>
public class PagedResponse<T>
{
    /// <summary>
    /// Lista de itens da página atual
    /// </summary>
    public IEnumerable<T> Items { get; set; } = new List<T>();

    /// <summary>
    /// Número da página atual
    /// </summary>
    public int PageNumber { get; set; }

    /// <summary>
    /// Quantidade de itens por página
    /// </summary>
    public int PageSize { get; set; }

    /// <summary>
    /// Total de itens (sem paginação)
    /// </summary>
    public int TotalItems { get; set; }

    /// <summary>
    /// Total de páginas
    /// </summary>
    public int TotalPages { get; set; }

    /// <summary>
    /// Indica se há página anterior
    /// </summary>
    public bool HasPreviousPage => PageNumber > 1;

    /// <summary>
    /// Indica se há próxima página
    /// </summary>
    public bool HasNextPage => PageNumber < TotalPages;
}