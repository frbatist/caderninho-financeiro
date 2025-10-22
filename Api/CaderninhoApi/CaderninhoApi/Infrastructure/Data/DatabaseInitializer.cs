using Microsoft.EntityFrameworkCore;
using CaderninhoApi.Infrastructure.Data;

namespace CaderninhoApi.Infrastructure.Data;

/// <summary>
/// Servi�o respons�vel por inicializar o banco de dados
/// </summary>
public static class DatabaseInitializer
{
    /// <summary>
    /// Aplica as migra��es pendentes e inicializa o banco de dados
    /// </summary>
    /// <param name="serviceProvider">Provedor de servi�os</param>
    /// <param name="logger">Logger para registrar opera��es</param>
    public static async Task InitializeAsync(IServiceProvider serviceProvider, ILogger logger)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        try
        {
            logger.LogInformation("Inicializando banco de dados...");

            // Aplicar migra��es pendentes
            if ((await context.Database.GetPendingMigrationsAsync()).Any())
            {
                logger.LogInformation("Aplicando migra��es pendentes...");
                await context.Database.MigrateAsync();
                logger.LogInformation("Migra��es aplicadas com sucesso.");
            }
            else
            {
                logger.LogInformation("Nenhuma migra��o pendente encontrada.");
            }

            // Certificar que o banco foi criado
            await context.Database.EnsureCreatedAsync();
            
            logger.LogInformation("Banco de dados inicializado com sucesso.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao inicializar o banco de dados: {Message}", ex.Message);
            throw;
        }
    }
}