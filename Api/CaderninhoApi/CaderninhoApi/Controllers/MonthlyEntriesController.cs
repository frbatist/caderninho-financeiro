using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CaderninhoApi.Domain.Entities;
using CaderninhoApi.Domain.DTOs;
using CaderninhoApi.Infrastructure.Data;
using CaderninhoApi.Request;
using CaderninhoApi.Domain.Abstractions.ApplicationServices;

namespace CaderninhoApi.Controllers;

/// <summary>
/// Controller para gerenciamento de entradas mensais
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class MonthlyEntriesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMonthlyEntryService _monthlyEntryService;
    private readonly ILogger<MonthlyEntriesController> _logger;

    public MonthlyEntriesController(
        ApplicationDbContext context,
        IMonthlyEntryService monthlyEntryService,
        ILogger<MonthlyEntriesController> logger)
    {
        _context = context;
        _monthlyEntryService = monthlyEntryService;
        _logger = logger;
    }

    /// <summary>
    /// Obtém todas as entradas mensais com filtro opcional e paginação
    /// </summary>
    /// <param name="filter">Filtro com paginação, mês, ano e status</param>
    /// <returns>Lista paginada de entradas mensais</returns>
    [HttpGet]
    public async Task<ActionResult<PagedResponse<MonthlyEntry>>> GetAll([FromQuery] MonthlyEntryFilterRequest filter)
    {
        try
        {
            var query = _context.MonthlyEntries.AsQueryable();

            // Aplicar busca por texto se fornecido
            if (!string.IsNullOrWhiteSpace(filter.SearchText))
            {
                query = query.Where(e => e.Description.Contains(filter.SearchText));
            }

            // Aplicar filtro de mês se fornecido
            if (filter.Month.HasValue)
            {
                query = query.Where(e => e.Month == filter.Month.Value);
            }

            // Aplicar filtro de ano se fornecido
            if (filter.Year.HasValue)
            {
                query = query.Where(e => e.Year == filter.Year.Value);
            }

            // Aplicar filtro de status ativo/inativo se fornecido
            if (filter.IsActive.HasValue)
            {
                query = query.Where(e => e.IsActive == filter.IsActive.Value);
            }

            // Contar total de itens antes da paginação
            var totalItems = await query.CountAsync();

            // Calcular total de páginas
            var totalPages = (int)Math.Ceiling(totalItems / (double)filter.PageSize);

            // Aplicar paginação
            var entries = await query
                .OrderByDescending(e => e.Year)
                .ThenByDescending(e => e.Month)
                .ThenByDescending(e => e.CreatedAt)
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var response = new PagedResponse<MonthlyEntry>
            {
                Items = entries,
                PageNumber = filter.PageNumber,
                PageSize = filter.PageSize,
                TotalItems = totalItems,
                TotalPages = totalPages
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar entradas mensais");
            return StatusCode(500, "Erro interno do servidor");
        }
    }

    /// <summary>
    /// Obtém uma entrada mensal por ID
    /// </summary>
    /// <param name="id">ID da entrada mensal</param>
    /// <returns>Entrada mensal encontrada</returns>
    [HttpGet("{id}")]
    public async Task<ActionResult<MonthlyEntry>> GetById(int id)
    {
        try
        {
            var entry = await _context.MonthlyEntries
                .FirstOrDefaultAsync(e => e.Id == id);

            if (entry == null)
            {
                return NotFound("Entrada mensal não encontrada");
            }

            return Ok(entry);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar entrada mensal {EntryId}", id);
            return StatusCode(500, "Erro interno do servidor");
        }
    }

    /// <summary>
    /// Cria uma nova entrada mensal
    /// </summary>
    /// <param name="dto">Dados da entrada mensal a ser criada</param>
    /// <returns>Entrada mensal criada</returns>
    [HttpPost]
    public async Task<ActionResult<MonthlyEntry>> Create([FromBody] CreateMonthlyEntryDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var entry = await _monthlyEntryService.CreateAsync(dto);

            return CreatedAtAction(nameof(GetById), new { id = entry.Id }, entry);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao criar entrada mensal");
            return StatusCode(500, "Erro interno do servidor");
        }
    }

    /// <summary>
    /// Atualiza uma entrada mensal existente
    /// </summary>
    /// <param name="id">ID da entrada mensal</param>
    /// <param name="dto">Dados atualizados</param>
    /// <returns>Entrada mensal atualizada</returns>
    [HttpPut("{id}")]
    public async Task<ActionResult<MonthlyEntry>> Update(int id, [FromBody] CreateMonthlyEntryDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var entry = await _monthlyEntryService.UpdateAsync(id, dto);

            if (entry == null)
            {
                return NotFound("Entrada mensal não encontrada");
            }

            return Ok(entry);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar entrada mensal {EntryId}", id);
            return StatusCode(500, "Erro interno do servidor");
        }
    }

    /// <summary>
    /// Deleta uma entrada mensal por ID
    /// </summary>
    /// <param name="id">ID da entrada mensal</param>
    /// <returns>Resultado da operação</returns>
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        try
        {
            var deleted = await _monthlyEntryService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound("Entrada mensal não encontrada");
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar entrada mensal {EntryId}", id);
            return StatusCode(500, "Erro interno do servidor");
        }
    }

    /// <summary>
    /// Ativa ou desativa uma entrada mensal
    /// </summary>
    /// <param name="id">ID da entrada mensal</param>
    /// <param name="isActive">Status desejado</param>
    /// <returns>Entrada mensal atualizada</returns>
    [HttpPatch("{id}/toggle-active")]
    public async Task<ActionResult<MonthlyEntry>> ToggleActive(int id, [FromBody] bool isActive)
    {
        try
        {
            var entry = await _monthlyEntryService.ToggleActiveAsync(id, isActive);

            if (entry == null)
            {
                return NotFound("Entrada mensal não encontrada");
            }

            return Ok(entry);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao alterar status da entrada mensal {EntryId}", id);
            return StatusCode(500, "Erro interno do servidor");
        }
    }
}
