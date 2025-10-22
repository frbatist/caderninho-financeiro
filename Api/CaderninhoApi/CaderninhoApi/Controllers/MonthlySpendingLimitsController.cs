using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CaderninhoApi.Domain.Entities;
using CaderninhoApi.Domain.DTOs;
using CaderninhoApi.Infrastructure.Data;
using CaderninhoApi.Request;
using CaderninhoApi.Domain.Abstractions.ApplicationServices;

namespace CaderninhoApi.Controllers;

/// <summary>
/// Controller para gerenciamento de limites de gasto mensal
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class MonthlySpendingLimitsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMonthlySpendingLimitService _monthlySpendingLimitService;
    private readonly ILogger<MonthlySpendingLimitsController> _logger;

    public MonthlySpendingLimitsController(
        ApplicationDbContext context,
        IMonthlySpendingLimitService monthlySpendingLimitService,
        ILogger<MonthlySpendingLimitsController> logger)
    {
        _context = context;
        _monthlySpendingLimitService = monthlySpendingLimitService;
        _logger = logger;
    }

    /// <summary>
    /// Obtém todos os limites de gasto mensal com filtro opcional e paginação
    /// </summary>
    /// <param name="filter">Filtro com paginação, mês, ano, tipo e status</param>
    /// <returns>Lista paginada de limites de gasto</returns>
    [HttpGet]
    public async Task<ActionResult<PagedResponse<MonthlySpendingLimit>>> GetAll([FromQuery] MonthlySpendingLimitFilterRequest filter)
    {
        try
        {
            var query = _context.MonthlySpendingLimits.AsQueryable();

            // Aplicar filtro de tipo de estabelecimento se fornecido
            if (filter.EstablishmentType.HasValue)
            {
                query = query.Where(l => l.EstablishmentType == filter.EstablishmentType.Value);
            }

            // Aplicar filtro de mês se fornecido
            if (filter.Month.HasValue)
            {
                query = query.Where(l => l.Month == filter.Month.Value);
            }

            // Aplicar filtro de ano se fornecido
            if (filter.Year.HasValue)
            {
                query = query.Where(l => l.Year == filter.Year.Value);
            }

            // Aplicar filtro de status ativo/inativo se fornecido
            if (filter.IsActive.HasValue)
            {
                query = query.Where(l => l.IsActive == filter.IsActive.Value);
            }

            // Contar total de itens antes da paginação
            var totalItems = await query.CountAsync();

            // Calcular total de páginas
            var totalPages = (int)Math.Ceiling(totalItems / (double)filter.PageSize);

            // Aplicar paginação
            var limits = await query
                .OrderByDescending(l => l.Year)
                .ThenByDescending(l => l.Month)
                .ThenBy(l => l.EstablishmentType)
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var response = new PagedResponse<MonthlySpendingLimit>
            {
                Items = limits,
                PageNumber = filter.PageNumber,
                PageSize = filter.PageSize,
                TotalItems = totalItems,
                TotalPages = totalPages
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar limites de gasto mensal");
            return StatusCode(500, "Erro interno do servidor");
        }
    }

    /// <summary>
    /// Obtém um limite de gasto por ID
    /// </summary>
    /// <param name="id">ID do limite</param>
    /// <returns>Limite encontrado</returns>
    [HttpGet("{id}")]
    public async Task<ActionResult<MonthlySpendingLimit>> GetById(int id)
    {
        try
        {
            var limit = await _context.MonthlySpendingLimits
                .FirstOrDefaultAsync(l => l.Id == id);

            if (limit == null)
            {
                return NotFound("Limite de gasto não encontrado");
            }

            return Ok(limit);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar limite de gasto {LimitId}", id);
            return StatusCode(500, "Erro interno do servidor");
        }
    }

    /// <summary>
    /// Cria um novo limite de gasto mensal
    /// </summary>
    /// <param name="dto">Dados do limite a ser criado</param>
    /// <returns>Limite criado</returns>
    [HttpPost]
    public async Task<ActionResult<MonthlySpendingLimit>> Create([FromBody] CreateMonthlySpendingLimitDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var limit = await _monthlySpendingLimitService.CreateAsync(dto);

            return CreatedAtAction(nameof(GetById), new { id = limit.Id }, limit);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Erro de validação ao criar limite de gasto");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao criar limite de gasto");
            return StatusCode(500, "Erro interno do servidor");
        }
    }

    /// <summary>
    /// Atualiza um limite de gasto existente
    /// </summary>
    /// <param name="id">ID do limite</param>
    /// <param name="dto">Dados atualizados</param>
    /// <returns>Limite atualizado</returns>
    [HttpPut("{id}")]
    public async Task<ActionResult<MonthlySpendingLimit>> Update(int id, [FromBody] CreateMonthlySpendingLimitDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var limit = await _monthlySpendingLimitService.UpdateAsync(id, dto);

            if (limit == null)
            {
                return NotFound("Limite de gasto não encontrado");
            }

            return Ok(limit);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Erro de validação ao atualizar limite de gasto {LimitId}", id);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar limite de gasto {LimitId}", id);
            return StatusCode(500, "Erro interno do servidor");
        }
    }

    /// <summary>
    /// Deleta um limite de gasto por ID
    /// </summary>
    /// <param name="id">ID do limite</param>
    /// <returns>Resultado da operação</returns>
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        try
        {
            var deleted = await _monthlySpendingLimitService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound("Limite de gasto não encontrado");
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar limite de gasto {LimitId}", id);
            return StatusCode(500, "Erro interno do servidor");
        }
    }

    /// <summary>
    /// Ativa ou desativa um limite de gasto
    /// </summary>
    /// <param name="id">ID do limite</param>
    /// <param name="isActive">Status desejado</param>
    /// <returns>Limite atualizado</returns>
    [HttpPatch("{id}/toggle-active")]
    public async Task<ActionResult<MonthlySpendingLimit>> ToggleActive(int id, [FromBody] bool isActive)
    {
        try
        {
            var limit = await _monthlySpendingLimitService.ToggleActiveAsync(id, isActive);

            if (limit == null)
            {
                return NotFound("Limite de gasto não encontrado");
            }

            return Ok(limit);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao alterar status do limite de gasto {LimitId}", id);
            return StatusCode(500, "Erro interno do servidor");
        }
    }
}
