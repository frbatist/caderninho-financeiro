using CaderninhoApi.Domain.Abstractions.ApplicationServices;
using CaderninhoApi.Domain.DTOs;
using CaderninhoApi.Domain.Entities;
using CaderninhoApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CaderninhoApi.Application.Services;

/// <summary>
/// Serviço para gerenciamento de limites de gasto mensal
/// </summary>
public class MonthlySpendingLimitService : IMonthlySpendingLimitService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<MonthlySpendingLimitService> _logger;

    public MonthlySpendingLimitService(
        ApplicationDbContext context,
        ILogger<MonthlySpendingLimitService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Cria um novo limite de gasto mensal
    /// </summary>
    /// <param name="dto">Dados do limite</param>
    /// <returns>Limite criado</returns>
    public async Task<MonthlySpendingLimit> CreateAsync(CreateMonthlySpendingLimitDto dto)
    {
        // Verificar se já existe um limite para este tipo de estabelecimento no mês/ano
        var existingLimit = await _context.MonthlySpendingLimits
            .FirstOrDefaultAsync(l => 
                l.EstablishmentType == dto.EstablishmentType && 
                l.Month == dto.Month && 
                l.Year == dto.Year);

        if (existingLimit != null)
        {
            _logger.LogWarning(
                "Tentativa de criar limite duplicado para {EstablishmentType} em {Month}/{Year}",
                dto.EstablishmentType, dto.Month, dto.Year);
            throw new InvalidOperationException(
                $"Já existe um limite para {dto.EstablishmentType} em {dto.Month}/{dto.Year}");
        }

        var limit = new MonthlySpendingLimit
        {
            EstablishmentType = dto.EstablishmentType,
            LimitAmount = dto.LimitAmount,
            Month = dto.Month,
            Year = dto.Year,
            IsActive = true
        };

        _context.MonthlySpendingLimits.Add(limit);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Limite de gasto criado: {LimitId} - {EstablishmentType} - R$ {Amount} - {Month}/{Year}",
            limit.Id, limit.EstablishmentType, limit.LimitAmount, limit.Month, limit.Year);

        return limit;
    }

    /// <summary>
    /// Atualiza um limite de gasto mensal existente
    /// </summary>
    /// <param name="id">ID do limite</param>
    /// <param name="dto">Dados atualizados</param>
    /// <returns>Limite atualizado ou null se não encontrado</returns>
    public async Task<MonthlySpendingLimit?> UpdateAsync(int id, CreateMonthlySpendingLimitDto dto)
    {
        var limit = await _context.MonthlySpendingLimits.FindAsync(id);

        if (limit == null)
        {
            _logger.LogWarning("Tentativa de atualizar limite não encontrado: {LimitId}", id);
            return null;
        }

        // Verificar se a mudança de tipo/mês/ano não cria duplicata
        if (limit.EstablishmentType != dto.EstablishmentType || 
            limit.Month != dto.Month || 
            limit.Year != dto.Year)
        {
            var existingLimit = await _context.MonthlySpendingLimits
                .FirstOrDefaultAsync(l => 
                    l.Id != id &&
                    l.EstablishmentType == dto.EstablishmentType && 
                    l.Month == dto.Month && 
                    l.Year == dto.Year);

            if (existingLimit != null)
            {
                _logger.LogWarning(
                    "Tentativa de atualizar limite criaria duplicata para {EstablishmentType} em {Month}/{Year}",
                    dto.EstablishmentType, dto.Month, dto.Year);
                throw new InvalidOperationException(
                    $"Já existe um limite para {dto.EstablishmentType} em {dto.Month}/{dto.Year}");
            }
        }

        limit.EstablishmentType = dto.EstablishmentType;
        limit.LimitAmount = dto.LimitAmount;
        limit.Month = dto.Month;
        limit.Year = dto.Year;
        limit.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Limite de gasto atualizado: {LimitId}", id);

        return limit;
    }

    /// <summary>
    /// Deleta um limite de gasto mensal
    /// </summary>
    /// <param name="id">ID do limite</param>
    /// <returns>True se deletado com sucesso, false se não encontrado</returns>
    public async Task<bool> DeleteAsync(int id)
    {
        var limit = await _context.MonthlySpendingLimits
            .FirstOrDefaultAsync(l => l.Id == id);

        if (limit == null)
        {
            _logger.LogWarning("Tentativa de deletar limite não encontrado: {LimitId}", id);
            return false;
        }

        _context.MonthlySpendingLimits.Remove(limit);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Limite de gasto deletado: {LimitId}", id);
        
        return true;
    }

    /// <summary>
    /// Ativa ou desativa um limite de gasto mensal
    /// </summary>
    /// <param name="id">ID do limite</param>
    /// <param name="isActive">Status desejado</param>
    /// <returns>Limite atualizado ou null se não encontrado</returns>
    public async Task<MonthlySpendingLimit?> ToggleActiveAsync(int id, bool isActive)
    {
        var limit = await _context.MonthlySpendingLimits.FindAsync(id);

        if (limit == null)
        {
            _logger.LogWarning("Tentativa de alterar status de limite não encontrado: {LimitId}", id);
            return null;
        }

        limit.IsActive = isActive;
        limit.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Status do limite {LimitId} alterado para: {IsActive}", id, isActive);

        return limit;
    }

    /// <summary>
    /// Duplica um limite de gasto mensal para o próximo mês
    /// </summary>
    /// <param name="id">ID do limite a ser duplicado</param>
    /// <param name="dto">Dados da duplicação (novo valor)</param>
    /// <returns>Novo limite criado ou null se o original não foi encontrado</returns>
    public async Task<MonthlySpendingLimit?> DuplicateToNextMonthAsync(int id, DuplicateMonthlySpendingLimitDto dto)
    {
        var originalLimit = await _context.MonthlySpendingLimits.FindAsync(id);

        if (originalLimit == null)
        {
            _logger.LogWarning("Tentativa de duplicar limite de gasto não encontrado: {LimitId}", id);
            return null;
        }

        // Calcular próximo mês e ano
        int nextMonth = originalLimit.Month + 1;
        int nextYear = originalLimit.Year;

        if (nextMonth > 12)
        {
            nextMonth = 1;
            nextYear++;
        }

        // Verificar se já existe um limite para este tipo de estabelecimento no próximo mês
        var existingLimit = await _context.MonthlySpendingLimits
            .FirstOrDefaultAsync(l => 
                l.EstablishmentType == originalLimit.EstablishmentType && 
                l.Month == nextMonth && 
                l.Year == nextYear);

        if (existingLimit != null)
        {
            _logger.LogWarning(
                "Já existe um limite para {EstablishmentType} em {Month}/{Year}",
                originalLimit.EstablishmentType, nextMonth, nextYear);
            throw new InvalidOperationException(
                $"Já existe um limite para {originalLimit.EstablishmentType} em {nextMonth}/{nextYear}");
        }

        // Criar novo limite com os mesmos dados, mas para o próximo mês
        var duplicatedLimit = new MonthlySpendingLimit
        {
            EstablishmentType = originalLimit.EstablishmentType,
            LimitAmount = dto.Amount, // Usar o valor do DTO (permite edição)
            Month = nextMonth,
            Year = nextYear,
            IsActive = true
        };

        _context.MonthlySpendingLimits.Add(duplicatedLimit);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Limite de gasto {OriginalId} duplicado para o próximo mês: {NewLimitId} - {EstablishmentType} - R$ {Amount} - {Month}/{Year}", 
            id, duplicatedLimit.Id, duplicatedLimit.EstablishmentType, duplicatedLimit.LimitAmount, nextMonth, nextYear);

        return duplicatedLimit;
    }
}
