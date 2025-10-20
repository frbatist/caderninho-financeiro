namespace CaderninhoApi.Request;

/// <summary>
/// Filtro para consulta de entradas mensais
/// </summary>
public class MonthlyEntryFilterRequest : BaseFilterRequest
{
    /// <summary>
    /// Filtro por mês (1-12)
    /// </summary>
    public int? Month { get; set; }

    /// <summary>
    /// Filtro por ano
    /// </summary>
    public int? Year { get; set; }

    /// <summary>
    /// Filtro por status ativo/inativo
    /// </summary>
    public bool? IsActive { get; set; }
}
