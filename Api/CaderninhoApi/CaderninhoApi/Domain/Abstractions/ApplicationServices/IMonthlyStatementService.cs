using CaderninhoApi.Domain.DTOs;

namespace CaderninhoApi.Domain.Abstractions.ApplicationServices;

/// <summary>
/// Interface para o serviço de extrato mensal
/// </summary>
public interface IMonthlyStatementService
{
    /// <summary>
    /// Obtém o extrato mensal completo com todas as despesas agrupadas por tipo
    /// </summary>
    /// <param name="year">Ano do extrato</param>
    /// <param name="month">Mês do extrato (1-12)</param>
    /// <param name="cancellationToken">Token de cancelamento</param>
    /// <returns>Extrato mensal completo</returns>
    Task<MonthlyStatementDto> GetMonthlyStatementAsync(int year, int month, CancellationToken cancellationToken = default);
}
