using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CaderninhoApi.Domain.Entities;
using CaderninhoApi.Infrastructure.Data;
using CaderninhoApi.Request;
using CaderninhoApi.Domain.Abstractions.ApplicationServices;
using CaderninhoApi.Domain.DTOs;

namespace CaderninhoApi.Controllers;

/// <summary>
/// Controller para gerenciamento de cartões
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class CardsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ICardService _cardService;
    private readonly ILogger<CardsController> _logger;

    public CardsController(
        ApplicationDbContext context,
        ICardService cardService,
        ILogger<CardsController> logger)
    {
        _context = context;
        _cardService = cardService;
        _logger = logger;
    }

    /// <summary>
    /// Obtém todos os cartões com filtro opcional por nome e paginação
    /// </summary>
    /// <param name="filter">Filtro com paginação e texto de busca</param>
    /// <returns>Lista paginada de cartões</returns>
    [HttpGet]
    public async Task<ActionResult<PagedResponse<Card>>> GetAll([FromQuery] CardFilterRequest filter)
    {
        try
        {
            var query = _context.Cards.AsQueryable();

            // Aplicar filtro por texto se fornecido
            if (!string.IsNullOrWhiteSpace(filter.SearchText))
            {
                query = query.Where(c => c.Name.Contains(filter.SearchText) || 
                                        c.LastFourDigits.Contains(filter.SearchText));
            }

            // Contar total de itens antes da paginação
            var totalItems = await query.CountAsync();

            // Calcular total de páginas
            var totalPages = (int)Math.Ceiling(totalItems / (double)filter.PageSize);

            // Aplicar paginação
            var cards = await query
                .OrderBy(c => c.Name)
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var response = new PagedResponse<Card>
            {
                Items = cards,
                PageNumber = filter.PageNumber,
                PageSize = filter.PageSize,
                TotalItems = totalItems,
                TotalPages = totalPages
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar cartões com filtro: {SearchText}", filter.SearchText);
            return StatusCode(500, "Erro interno do servidor");
        }
    }

    /// <summary>
    /// Obtém um cartão por ID
    /// </summary>
    /// <param name="id">ID do cartão</param>
    /// <returns>Cartão encontrado</returns>
    [HttpGet("{id}")]
    public async Task<ActionResult<Card>> GetById(int id)
    {
        try
        {
            var card = await _context.Cards
                .FirstOrDefaultAsync(c => c.Id == id);

            if (card == null)
            {
                return NotFound("Cartão não encontrado");
            }

            return Ok(card);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar cartão {CardId}", id);
            return StatusCode(500, "Erro interno do servidor");
        }
    }

    /// <summary>
    /// Cria um novo cartão
    /// </summary>
    /// <param name="dto">Dados do cartão a ser criado</param>
    /// <returns>Cartão criado</returns>
    [HttpPost]
    public async Task<ActionResult<Card>> Create([FromBody] CreateCardDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var card = await _cardService.AddAsync(dto);

            return CreatedAtAction(nameof(GetById), new { id = card.Id }, card);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao criar cartão");
            return StatusCode(500, "Erro interno do servidor");
        }
    }
}