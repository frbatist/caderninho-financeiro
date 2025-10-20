using Microsoft.EntityFrameworkCore;
using CaderninhoApi.Infrastructure.Data;
using CaderninhoApi.Domain.Abstractions.ApplicationServices;
using CaderninhoApi.Application.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Configurar CORS para aceitar qualquer origem (apenas para ambiente local)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Registrar serviços da aplicação
builder.Services.AddScoped<IEstablishmentService, EstablishmentService>();
builder.Services.AddScoped<ICardService, CardService>();
builder.Services.AddScoped<IExpenseService, ExpenseService>();

// Configuração do Entity Framework com SQLite
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
        ?? "Data Source=caderninho.db";
    
    options.UseSqlite(connectionString);
    
    // Configura��es adicionais para desenvolvimento
    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    }
});

var app = builder.Build();

// Aplicar migrations e inicializar banco de dados na inicialização da aplicação
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    
    try
    {
        // Aplicar migrations pendentes automaticamente
        logger.LogInformation("Verificando e aplicando migrations...");
        await context.Database.MigrateAsync();
        logger.LogInformation("Migrations aplicadas com sucesso");
        
        // Inicializar dados seed
        await DatabaseInitializer.InitializeAsync(scope.ServiceProvider, logger);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro ao aplicar migrations ou inicializar banco de dados");
        throw;
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Habilitar CORS
app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();
