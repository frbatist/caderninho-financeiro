using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CaderninhoApi.Infrastructure.Data;
using CaderninhoApi.Domain.Entities;

namespace CaderninhoApi.Controllers;

/// <summary>
/// Controller para opera��es relacionadas a usu�rios
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<UsersController> _logger;

    public UsersController(ApplicationDbContext context, ILogger<UsersController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obt�m todos os usu�rios
    /// </summary>
    /// <returns>Lista de usu�rios</returns>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        try
        {
            var users = await _context.Users
                .Where(u => u.IsActive)
                .OrderBy(u => u.Name)
                .ToListAsync();

            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar usu�rios");
            return StatusCode(500, "Erro interno do servidor");
        }
    }

    /// <summary>
    /// Obt�m um usu�rio espec�fico por ID
    /// </summary>
    /// <param name="id">ID do usu�rio</param>
    /// <returns>Usu�rio encontrado</returns>
    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUser(int id)
    {
        try
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.IsActive);

            if (user == null)
            {
                return NotFound("Usu�rio n�o encontrado");
            }

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar usu�rio {UserId}", id);
            return StatusCode(500, "Erro interno do servidor");
        }
    }

    /// <summary>
    /// Cria um novo usu�rio
    /// </summary>
    /// <param name="user">Dados do usu�rio</param>
    /// <returns>Usu�rio criado</returns>
    [HttpPost]
    public async Task<ActionResult<User>> CreateUser(User user)
    {
        try
        {
            // Verificar se email j� existe
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == user.Email);

            if (existingUser != null)
            {
                return BadRequest("Email j� est� em uso");
            }

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Usu�rio criado com sucesso: {UserId}", user.Id);

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao criar usu�rio");
            return StatusCode(500, "Erro interno do servidor");
        }
    }

    /// <summary>
    /// Atualiza um usu�rio existente
    /// </summary>
    /// <param name="id">ID do usu�rio</param>
    /// <param name="user">Dados atualizados do usu�rio</param>
    /// <returns>Usu�rio atualizado</returns>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, User user)
    {
        if (id != user.Id)
        {
            return BadRequest("ID do usu�rio n�o confere");
        }

        try
        {
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (existingUser == null)
            {
                return NotFound("Usu�rio n�o encontrado");
            }

            // Atualizar apenas campos permitidos
            existingUser.Name = user.Name;
            existingUser.Email = user.Email;
            existingUser.IsActive = user.IsActive;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Usu�rio atualizado com sucesso: {UserId}", id);

            return NoContent();
        }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict("Conflito de concorr�ncia");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar usu�rio {UserId}", id);
            return StatusCode(500, "Erro interno do servidor");
        }
    }

    /// <summary>
    /// Exclui um usu�rio (soft delete)
    /// </summary>
    /// <param name="id">ID do usu�rio</param>
    /// <returns>Resultado da opera��o</returns>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        try
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound("Usu�rio n�o encontrado");
            }

            // Soft delete
            user.IsDeleted = true;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Usu�rio exclu�do com sucesso: {UserId}", id);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao excluir usu�rio {UserId}", id);
            return StatusCode(500, "Erro interno do servidor");
        }
    }
}