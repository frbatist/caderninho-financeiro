using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CaderninhoApi.Domain.Entities;
using CaderninhoApi.Infrastructure.Data;
using CaderninhoApi.Request;

namespace CaderninhoApi.Controllers;

/// <summary>
/// Controller para gerenciamento de estabelecimentos
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class EstablishmentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<EstablishmentsController> _logger;

    public EstablishmentsController(
        ApplicationDbContext context,
        ILogger<EstablishmentsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtém todos os estabelecimentos com filtro opcional por nome e paginação
    /// </summary>
    /// <param name="filter">Filtro com paginação e texto de busca</param>
    /// <returns>Lista paginada de estabelecimentos</returns>
    [HttpGet]
    public async Task<ActionResult<PagedResponse<Establishment>>> GetAll([FromQuery] EstablishmentFilterRequest filter)
    {
        try
        {
            var query = _context.Establishments.AsQueryable();

            // Aplicar filtro por texto se fornecido
            if (!string.IsNullOrWhiteSpace(filter.SearchText))
            {
                query = query.Where(e => e.Name.Contains(filter.SearchText));
            }

            // Contar total de itens antes da paginação
            var totalItems = await query.CountAsync();

            // Calcular total de páginas
            var totalPages = (int)Math.Ceiling(totalItems / (double)filter.PageSize);

            // Aplicar paginação
            var establishments = await query
                .OrderBy(e => e.Name)
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var response = new PagedResponse<Establishment>
            {
                Items = establishments,
                PageNumber = filter.PageNumber,
                PageSize = filter.PageSize,
                TotalItems = totalItems,
                TotalPages = totalPages
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar estabelecimentos com filtro: {SearchText}", filter.SearchText);
            return StatusCode(500, "Erro interno do servidor");
        }
    }

    /// <summary>
    /// Obtém um estabelecimento por ID
    /// </summary>
    /// <param name="id">ID do estabelecimento</param>
    /// <returns>Estabelecimento encontrado</returns>
    [HttpGet("{id}")]
    public async Task<ActionResult<Establishment>> GetById(int id)
    {
        try
        {
            var establishment = await _context.Establishments
                .FirstOrDefaultAsync(e => e.Id == id);

            if (establishment == null)
            {
                return NotFound("Estabelecimento não encontrado");
            }

            return Ok(establishment);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar estabelecimento {EstablishmentId}", id);
            return StatusCode(500, "Erro interno do servidor");
        }
    }
}