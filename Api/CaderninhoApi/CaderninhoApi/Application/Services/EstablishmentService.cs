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
}