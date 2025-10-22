using CaderninhoApi.Domain.Enums;

namespace CaderninhoApi.Request;

/// <summary>
/// Filtro para consulta de limites de gasto mensal
/// </summary>
public class MonthlySpendingLimitFilterRequest : BaseFilterRequest
{
    /// <summary>
    /// Filtro por tipo de estabelecimento
    /// </summary>
    public EstablishmentType? EstablishmentType { get; set; }

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
