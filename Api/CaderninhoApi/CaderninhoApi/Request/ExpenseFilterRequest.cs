using System.ComponentModel.DataAnnotations;

namespace CaderninhoApi.Request;

/// <summary>
/// Objeto de filtro com paginação para despesas
/// </summary>
public class ExpenseFilterRequest
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
    /// Ano para filtro (opcional)
    /// </summary>
    [Display(Name = "Ano")]
    public int? Year { get; set; }

    /// <summary>
    /// Mês para filtro (1-12, opcional)
    /// </summary>
    [Display(Name = "Mês")]
    [Range(1, 12, ErrorMessage = "O mês deve ser entre 1 e 12")]
    public int? Month { get; set; }
}