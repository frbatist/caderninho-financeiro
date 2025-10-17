using CaderninhoApi.Domain.DTOs;
using CaderninhoApi.Domain.Entities;

namespace CaderninhoApi.Domain.Abstractions.ApplicationServices;

/// <summary>
/// Interface para serviço de cartões
/// </summary>
public interface ICardService
{
    /// <summary>
    /// Adiciona um novo cartão
    /// </summary>
    /// <param name="dto">Dados do cartão a ser criado</param>
    /// <returns>Cartão criado</returns>
    Task<Card> AddAsync(CreateCardDto dto);
}