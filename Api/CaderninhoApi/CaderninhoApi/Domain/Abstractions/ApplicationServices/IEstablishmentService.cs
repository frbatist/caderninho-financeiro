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
}