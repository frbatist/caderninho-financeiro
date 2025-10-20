using CaderninhoApi.Domain.Abstractions.ApplicationServices;
using CaderninhoApi.Domain.DTOs;
using CaderninhoApi.Domain.Entities;
using CaderninhoApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CaderninhoApi.Application.Services;

/// <summary>
/// Serviço para gerenciamento de entradas mensais
/// </summary>
public class MonthlyEntryService : IMonthlyEntryService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<MonthlyEntryService> _logger;

    public MonthlyEntryService(
        ApplicationDbContext context,
        ILogger<MonthlyEntryService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Cria uma nova entrada mensal
    /// </summary>
    /// <param name="dto">Dados da entrada mensal</param>
    /// <returns>Entrada mensal criada</returns>
    public async Task<MonthlyEntry> CreateAsync(CreateMonthlyEntryDto dto)
    {
        var entry = new MonthlyEntry
        {
            Type = dto.Type,
            Description = dto.Description.Trim(),
            Amount = dto.Amount,
            Operation = dto.Operation,
            Month = dto.Month,
            Year = dto.Year,
            IsActive = true
        };

        _context.MonthlyEntries.Add(entry);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Entrada mensal criada: {EntryId} - {Description}", entry.Id, entry.Description);

        return entry;
    }

    /// <summary>
    /// Atualiza uma entrada mensal existente
    /// </summary>
    /// <param name="id">ID da entrada mensal</param>
    /// <param name="dto">Dados atualizados</param>
    /// <returns>Entrada mensal atualizada ou null se não encontrada</returns>
    public async Task<MonthlyEntry?> UpdateAsync(int id, CreateMonthlyEntryDto dto)
    {
        var entry = await _context.MonthlyEntries.FindAsync(id);

        if (entry == null)
        {
            _logger.LogWarning("Tentativa de atualizar entrada mensal não encontrada: {EntryId}", id);
            return null;
        }

        entry.Type = dto.Type;
        entry.Description = dto.Description.Trim();
        entry.Amount = dto.Amount;
        entry.Operation = dto.Operation;
        entry.Month = dto.Month;
        entry.Year = dto.Year;
        entry.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Entrada mensal atualizada: {EntryId}", id);

        return entry;
    }

    /// <summary>
    /// Deleta uma entrada mensal
    /// </summary>
    /// <param name="id">ID da entrada mensal</param>
    /// <returns>True se deletado com sucesso, false se não encontrado</returns>
    public async Task<bool> DeleteAsync(int id)
    {
        var entry = await _context.MonthlyEntries
            .FirstOrDefaultAsync(e => e.Id == id);

        if (entry == null)
        {
            _logger.LogWarning("Tentativa de deletar entrada mensal não encontrada: {EntryId}", id);
            return false;
        }

        _context.MonthlyEntries.Remove(entry);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Entrada mensal deletada: {EntryId}", id);
        
        return true;
    }

    /// <summary>
    /// Ativa ou desativa uma entrada mensal
    /// </summary>
    /// <param name="id">ID da entrada mensal</param>
    /// <param name="isActive">Status desejado</param>
    /// <returns>Entrada mensal atualizada ou null se não encontrada</returns>
    public async Task<MonthlyEntry?> ToggleActiveAsync(int id, bool isActive)
    {
        var entry = await _context.MonthlyEntries.FindAsync(id);

        if (entry == null)
        {
            _logger.LogWarning("Tentativa de alterar status de entrada mensal não encontrada: {EntryId}", id);
            return null;
        }

        entry.IsActive = isActive;
        entry.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Status da entrada mensal {EntryId} alterado para: {IsActive}", id, isActive);

        return entry;
    }
}
