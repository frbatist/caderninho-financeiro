using CaderninhoApi.Domain.DTOs;
using CaderninhoApi.Domain.Entities;

namespace CaderninhoApi.Domain.Abstractions.ApplicationServices;

/// <summary>
/// Interface para serviço de estabelecimentos
/// </summary>
public interface IEstablishmentService
{
    /// <summary>
    /// Adiciona um novo estabelecimento
    /// </summary>
    /// <param name="dto">Dados do estabelecimento a ser criado</param>
    /// <returns>Estabelecimento criado</returns>
    Task<Establishment> AddAsync(CreateEstablishmentDto dto);

    /// <summary>
    /// Atualiza um estabelecimento existente
    /// </summary>
    /// <param name="id">ID do estabelecimento a ser atualizado</param>
    /// <param name="dto">Dados atualizados do estabelecimento</param>
    /// <returns>Estabelecimento atualizado ou null se não encontrado</returns>
    Task<Establishment?> UpdateAsync(int id, UpdateEstablishmentDto dto);

    /// <summary>
    /// Remove um estabelecimento
    /// </summary>
    /// <param name="id">ID do estabelecimento a ser removido</param>
    /// <returns>True se removido com sucesso, false se não encontrado</returns>
    Task<bool> DeleteAsync(int id);
}