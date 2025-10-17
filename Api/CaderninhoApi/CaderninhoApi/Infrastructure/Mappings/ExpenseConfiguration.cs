using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CaderninhoApi.Domain.Entities;

namespace CaderninhoApi.Infrastructure.Mappings;

/// <summary>
/// Configuração do Entity Framework para a entidade Expense
/// </summary>
public class ExpenseConfiguration : IEntityTypeConfiguration<Expense>
{
    public void Configure(EntityTypeBuilder<Expense> builder)
    {
        // Tabela
        builder.ToTable("Expenses");

        // Chave primária
        builder.HasKey(e => e.Id);

        // Propriedades
        builder.Property(e => e.Id)
            .ValueGeneratedOnAdd()
            .IsRequired();

        builder.Property(e => e.Description)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(e => e.EstablishmentId)
            .IsRequired();

        builder.Property(e => e.PaymentType)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(e => e.CardId)
            .IsRequired(false);

        builder.Property(e => e.Amount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(e => e.InstallmentCount)
            .IsRequired();

        builder.Property(e => e.CreatedAt)
            .IsRequired();

        builder.Property(e => e.UpdatedAt)
            .IsRequired(false);

        builder.Property(e => e.IsDeleted)
            .HasDefaultValue(false)
            .IsRequired();

        // Relacionamentos
        builder.HasOne(e => e.Establishment)
            .WithMany()
            .HasForeignKey(e => e.EstablishmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Card)
            .WithMany()
            .HasForeignKey(e => e.CardId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        // Índices
        builder.HasIndex(e => e.EstablishmentId);
        builder.HasIndex(e => e.PaymentType);
        builder.HasIndex(e => e.CardId);
        builder.HasIndex(e => e.CreatedAt);

        // Filtro global para soft delete
        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}