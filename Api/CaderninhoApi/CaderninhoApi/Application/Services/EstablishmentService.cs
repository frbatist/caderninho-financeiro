using CaderninhoApi.Domain.Abstractions.ApplicationServices;
using CaderninhoApi.Domain.DTOs;
using CaderninhoApi.Domain.Entities;
using CaderninhoApi.Infrastructure.Data;

namespace CaderninhoApi.Application.Services;

/// <summary>
/// Serviço para operações com estabelecimentos
/// </summary>
public class EstablishmentService : IEstablishmentService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<EstablishmentService> _logger;

    public EstablishmentService(
        ApplicationDbContext context,
        ILogger<EstablishmentService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Adiciona um novo estabelecimento
    /// </summary>
    /// <param name="dto">Dados do estabelecimento a ser criado</param>
    /// <returns>Estabelecimento criado</returns>
    public async Task<Establishment> AddAsync(CreateEstablishmentDto dto)
    {
        try
        {
            var establishment = new Establishment
            {
                Name = dto.Name,
                Type = dto.Type
            };

            _context.Establishments.Add(establishment);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Estabelecimento criado com sucesso: {EstablishmentId} - {EstablishmentName}", 
                establishment.Id, establishment.Name);

            return establishment;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao criar estabelecimento: {EstablishmentName}", dto.Name);
            throw;
        }
    }

    /// <summary>
    /// Atualiza um estabelecimento existente
    /// </summary>
    /// <param name="id">ID do estabelecimento a ser atualizado</param>
    /// <param name="dto">Dados atualizados do estabelecimento</param>
    /// <returns>Estabelecimento atualizado ou null se não encontrado</returns>
    public async Task<Establishment?> UpdateAsync(int id, UpdateEstablishmentDto dto)
    {
        try
        {
            var establishment = await _context.Establishments.FindAsync(id);
            
            if (establishment == null)
            {
                _logger.LogWarning("Tentativa de atualizar estabelecimento não encontrado: {EstablishmentId}", id);
                return null;
            }

            establishment.Name = dto.Name;
            establishment.Type = dto.Type;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Estabelecimento atualizado com sucesso: {EstablishmentId} - {EstablishmentName}", 
                establishment.Id, establishment.Name);

            return establishment;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar estabelecimento: {EstablishmentId}", id);
            throw;
        }
    }

    /// <summary>
    /// Remove um estabelecimento
    /// </summary>
    /// <param name="id">ID do estabelecimento a ser removido</param>
    /// <returns>True se removido com sucesso, false se não encontrado</returns>
    public async Task<bool> DeleteAsync(int id)
    {
        try
        {
            var establishment = await _context.Establishments.FindAsync(id);
            
            if (establishment == null)
            {
                _logger.LogWarning("Tentativa de remover estabelecimento não encontrado: {EstablishmentId}", id);
                return false;
            }

            _context.Establishments.Remove(establishment);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Estabelecimento removido com sucesso: {EstablishmentId} - {EstablishmentName}", 
                establishment.Id, establishment.Name);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao remover estabelecimento: {EstablishmentId}", id);
            throw;
        }
    }
}