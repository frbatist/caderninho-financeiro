using CaderninhoApi.Domain.DTOs;
using CaderninhoApi.Domain.Entities;

namespace CaderninhoApi.Domain.Abstractions.ApplicationServices;

/// <summary>
/// Interface para serviço de gerenciamento de entradas mensais
/// </summary>
public interface IMonthlyEntryService
{
    /// <summary>
    /// Cria uma nova entrada mensal
    /// </summary>
    /// <param name="dto">Dados da entrada mensal</param>
    /// <returns>Entrada mensal criada</returns>
    Task<MonthlyEntry> CreateAsync(CreateMonthlyEntryDto dto);

    /// <summary>
    /// Atualiza uma entrada mensal existente
    /// </summary>
    /// <param name="id">ID da entrada mensal</param>
    /// <param name="dto">Dados atualizados</param>
    /// <returns>Entrada mensal atualizada ou null se não encontrada</returns>
    Task<MonthlyEntry?> UpdateAsync(int id, CreateMonthlyEntryDto dto);

    /// <summary>
    /// Deleta uma entrada mensal
    /// </summary>
    /// <param name="id">ID da entrada mensal</param>
    /// <returns>True se deletado com sucesso, false se não encontrado</returns>
    Task<bool> DeleteAsync(int id);

    /// <summary>
    /// Ativa ou desativa uma entrada mensal
    /// </summary>
    /// <param name="id">ID da entrada mensal</param>
    /// <param name="isActive">Status desejado</param>
    /// <returns>Entrada mensal atualizada ou null se não encontrada</returns>
    Task<MonthlyEntry?> ToggleActiveAsync(int id, bool isActive);

    /// <summary>
    /// Duplica uma entrada mensal para o próximo mês
    /// </summary>
    /// <param name="id">ID da entrada mensal a ser duplicada</param>
    /// <param name="dto">Dados da duplicação (novo valor)</param>
    /// <returns>Nova entrada mensal criada ou null se a entrada original não for encontrada</returns>
    Task<MonthlyEntry?> DuplicateToNextMonthAsync(int id, DuplicateMonthlyEntryDto dto);
}
