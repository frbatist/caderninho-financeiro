using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CaderninhoApi.Domain.Entities;
using CaderninhoApi.Infrastructure.Data;
using CaderninhoApi.Request;
using CaderninhoApi.Domain.Abstractions.ApplicationServices;
using CaderninhoApi.Domain.DTOs;

namespace CaderninhoApi.Controllers;

/// <summary>
/// Controller para gerenciamento de despesas
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ExpensesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IExpenseService _expenseService;
    private readonly ILogger<ExpensesController> _logger;

    public ExpensesController(
        ApplicationDbContext context,
        IExpenseService expenseService,
        ILogger<ExpensesController> logger)
    {
        _context = context;
        _expenseService = expenseService;
        _logger = logger;
    }

    /// <summary>
    /// Obtém todas as despesas com filtro opcional por mês/ano e paginação
    /// </summary>
    /// <param name="filter">Filtro com paginação e mês/ano</param>
    /// <returns>Lista paginada de despesas</returns>
    [HttpGet]
    public async Task<ActionResult<PagedResponse<Expense>>> GetAll([FromQuery] ExpenseFilterRequest filter)
    {
        try
        {
            var query = _context.Expenses
                .Include(e => e.Establishment)
                .Include(e => e.Card)
                .AsQueryable();

            // Aplicar filtro por ano se fornecido
            if (filter.Year.HasValue)
            {
                query = query.Where(e => e.CreatedAt.Year == filter.Year.Value);
            }

            // Aplicar filtro por mês se fornecido
            if (filter.Month.HasValue)
            {
                query = query.Where(e => e.CreatedAt.Month == filter.Month.Value);
            }

            // Contar total de itens antes da paginação
            var totalItems = await query.CountAsync();

            // Calcular total de páginas
            var totalPages = (int)Math.Ceiling(totalItems / (double)filter.PageSize);

            // Aplicar paginação
            var expenses = await query
                .OrderByDescending(e => e.CreatedAt)
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var response = new PagedResponse<Expense>
            {
                Items = expenses,
                PageNumber = filter.PageNumber,
                PageSize = filter.PageSize,
                TotalItems = totalItems,
                TotalPages = totalPages
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar despesas com filtro: Ano={Year}, Mês={Month}", 
                filter.Year, filter.Month);
            return StatusCode(500, "Erro interno do servidor");
        }
    }

    /// <summary>
    /// Obtém uma despesa por ID
    /// </summary>
    /// <param name="id">ID da despesa</param>
    /// <returns>Despesa encontrada</returns>
    [HttpGet("{id}")]
    public async Task<ActionResult<Expense>> GetById(int id)
    {
        try
        {
            var expense = await _context.Expenses
                .Include(e => e.Establishment)
                .Include(e => e.Card)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (expense == null)
            {
                return NotFound("Despesa não encontrada");
            }

            return Ok(expense);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar despesa {ExpenseId}", id);
            return StatusCode(500, "Erro interno do servidor");
        }
    }

    /// <summary>
    /// Cria uma nova despesa
    /// </summary>
    /// <param name="dto">Dados da despesa a ser criada</param>
    /// <returns>Despesa criada</returns>
    [HttpPost]
    public async Task<ActionResult<Expense>> Create([FromBody] CreateExpenseDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var expense = await _expenseService.AddAsync(dto);

            // Recarregar a despesa com as propriedades de navegação
            var expenseWithIncludes = await _context.Expenses
                .Include(e => e.Establishment)
                .Include(e => e.Card)
                .FirstOrDefaultAsync(e => e.Id == expense.Id);

            return CreatedAtAction(nameof(GetById), new { id = expense.Id }, expenseWithIncludes);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Erro de validação ao criar despesa");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao criar despesa");
            return StatusCode(500, "Erro interno do servidor");
        }
    }
}