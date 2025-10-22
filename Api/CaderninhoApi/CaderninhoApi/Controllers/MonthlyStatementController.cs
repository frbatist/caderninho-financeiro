using CaderninhoApi.Domain.Abstractions.ApplicationServices;
using CaderninhoApi.Domain.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace CaderninhoApi.Controllers;

/// <summary>
/// Controller para extrato mensal
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class MonthlyStatementController : ControllerBase
{
    private readonly IMonthlyStatementService _statementService;
    private readonly ILogger<MonthlyStatementController> _logger;

    public MonthlyStatementController(
        IMonthlyStatementService statementService,
        ILogger<MonthlyStatementController> logger)
    {
        _statementService = statementService;
        _logger = logger;
    }

    /// <summary>
    /// Obtém o extrato mensal com todas as despesas agrupadas por tipo
    /// </summary>
    /// <param name="year">Ano do extrato</param>
    /// <param name="month">Mês do extrato (1-12)</param>
    /// <param name="cancellationToken">Token de cancelamento</param>
    /// <returns>Extrato mensal completo</returns>
    /// <response code="200">Retorna o extrato mensal</response>
    /// <response code="400">Parâmetros inválidos</response>
    [HttpGet]
    [ProducesResponseType(typeof(MonthlyStatementDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<MonthlyStatementDto>> GetMonthlyStatement(
        [FromQuery] int year,
        [FromQuery] int month,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Requisição de extrato mensal recebida: {Month}/{Year}", month, year);

        // Validações
        if (year < 2000 || year > 2100)
        {
            _logger.LogWarning("Ano inválido fornecido: {Year}", year);
            return BadRequest(new { message = "Ano inválido. Deve estar entre 2000 e 2100." });
        }

        if (month < 1 || month > 12)
        {
            _logger.LogWarning("Mês inválido fornecido: {Month}", month);
            return BadRequest(new { message = "Mês inválido. Deve estar entre 1 e 12." });
        }

        try
        {
            var statement = await _statementService.GetMonthlyStatementAsync(year, month, cancellationToken);
            
            _logger.LogInformation(
                "Extrato mensal gerado com sucesso: {Month}/{Year} - {TypeCount} tipos de despesa, Total: {Total:C}",
                month, year, statement.ExpensesByType.Count, statement.TotalExpenses);

            return Ok(statement);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao gerar extrato mensal para {Month}/{Year}", month, year);
            return StatusCode(500, new { message = "Erro ao gerar extrato mensal. Tente novamente." });
        }
    }
}
