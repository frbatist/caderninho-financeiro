using CaderninhoApi.Domain.DTOs;
using CaderninhoApi.Domain.Entities;

namespace CaderninhoApi.Domain.Abstractions.ApplicationServices;

/// <summary>
/// Interface para serviço de gerenciamento de limites de gasto mensal
/// </summary>
public interface IMonthlySpendingLimitService
{
    /// <summary>
    /// Cria um novo limite de gasto mensal
    /// </summary>
    /// <param name="dto">Dados do limite</param>
    /// <returns>Limite criado</returns>
    Task<MonthlySpendingLimit> CreateAsync(CreateMonthlySpendingLimitDto dto);

    /// <summary>
    /// Atualiza um limite de gasto mensal existente
    /// </summary>
    /// <param name="id">ID do limite</param>
    /// <param name="dto">Dados atualizados</param>
    /// <returns>Limite atualizado ou null se não encontrado</returns>
    Task<MonthlySpendingLimit?> UpdateAsync(int id, CreateMonthlySpendingLimitDto dto);

    /// <summary>
    /// Deleta um limite de gasto mensal
    /// </summary>
    /// <param name="id">ID do limite</param>
    /// <returns>True se deletado com sucesso, false se não encontrado</returns>
    Task<bool> DeleteAsync(int id);

    /// <summary>
    /// Ativa ou desativa um limite de gasto mensal
    /// </summary>
    /// <param name="id">ID do limite</param>
    /// <param name="isActive">Status desejado</param>
    /// <returns>Limite atualizado ou null se não encontrado</returns>
    Task<MonthlySpendingLimit?> ToggleActiveAsync(int id, bool isActive);

    /// <summary>
    /// Duplica um limite de gasto mensal para o próximo mês
    /// </summary>
    /// <param name="id">ID do limite a ser duplicado</param>
    /// <param name="dto">Dados da duplicação (novo valor)</param>
    /// <returns>Novo limite criado ou null se o original não foi encontrado</returns>
    Task<MonthlySpendingLimit?> DuplicateToNextMonthAsync(int id, DuplicateMonthlySpendingLimitDto dto);
}
