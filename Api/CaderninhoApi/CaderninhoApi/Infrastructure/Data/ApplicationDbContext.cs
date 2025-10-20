using Microsoft.EntityFrameworkCore;
using CaderninhoApi.Domain.Entities;

namespace CaderninhoApi.Infrastructure.Data;

/// <summary>
/// Contexto do banco de dados da aplica��o
/// </summary>
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    /// <summary>
    /// DbSet para a entidade User
    /// </summary>
    public DbSet<User> Users { get; set; } = null!;

    /// <summary>
    /// DbSet para a entidade Establishment
    /// </summary>
    public DbSet<Establishment> Establishments { get; set; } = null!;

    /// <summary>
    /// DbSet para a entidade Card
    /// </summary>
    public DbSet<Card> Cards { get; set; } = null!;

    /// <summary>
    /// DbSet para a entidade Expense
    /// </summary>
    public DbSet<Expense> Expenses { get; set; } = null!;

    /// <summary>
    /// DbSet para a entidade MonthlyEntry
    /// </summary>
    public DbSet<MonthlyEntry> MonthlyEntries { get; set; } = null!;

    /// <summary>
    /// DbSet para a entidade MonthlySpendingLimit
    /// </summary>
    public DbSet<MonthlySpendingLimit> MonthlySpendingLimits { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Aplicar configura��es do Fluent API
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        // Configurar filtro global para soft delete
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType)
                    .HasQueryFilter(GetSoftDeleteFilter(entityType.ClrType));
            }
        }

        // Seed data para usu�rios
        SeedUsers(modelBuilder);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Atualizar timestamps automaticamente
        UpdateTimestamps();
        return await base.SaveChangesAsync(cancellationToken);
    }

    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries<BaseEntity>();

        foreach (var entry in entries)
        {
            var entity = entry.Entity;
            
            switch (entry.State)
            {
                case EntityState.Added:
                    entity.CreatedAt = DateTime.UtcNow;
                    entity.UpdatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Modified:
                    entity.UpdatedAt = DateTime.UtcNow;
                    break;
            }
        }
    }

    private static System.Linq.Expressions.LambdaExpression GetSoftDeleteFilter(Type entityType)
    {
        var parameter = System.Linq.Expressions.Expression.Parameter(entityType, "e");
        var property = System.Linq.Expressions.Expression.Property(parameter, nameof(BaseEntity.IsDeleted));
        var condition = System.Linq.Expressions.Expression.Equal(property, System.Linq.Expressions.Expression.Constant(false));
        return System.Linq.Expressions.Expression.Lambda(condition, parameter);
    }

    /// <summary>
    /// Configura os dados iniciais (seed data) para a tabela de usu�rios
    /// </summary>
    private static void SeedUsers(ModelBuilder modelBuilder)
    {
        var now = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                Name = "Fernando",
                Email = "frbatist@gmail.com",
                PasswordHash = string.Empty,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now,
                IsDeleted = false
            },
            new User
            {
                Id = 2,
                Name = "Luana",
                Email = "luh.silva.vieira@gmail.com",
                PasswordHash = string.Empty,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now,
                IsDeleted = false
            }
        );
    }
}