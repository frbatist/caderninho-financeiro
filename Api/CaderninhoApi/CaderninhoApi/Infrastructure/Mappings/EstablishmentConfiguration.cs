using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CaderninhoApi.Domain.Entities;

namespace CaderninhoApi.Infrastructure.Mappings;

/// <summary>
/// Configuração do Entity Framework para a entidade Establishment
/// </summary>
public class EstablishmentConfiguration : IEntityTypeConfiguration<Establishment>
{
    public void Configure(EntityTypeBuilder<Establishment> builder)
    {
        // Tabela
        builder.ToTable("Establishments");

        // Chave primária
        builder.HasKey(e => e.Id);

        // Propriedades
        builder.Property(e => e.Id)
            .ValueGeneratedOnAdd()
            .IsRequired();

        builder.Property(e => e.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.Type)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(e => e.CardInvoiceName)
            .HasMaxLength(200)
            .IsRequired(false);

        builder.Property(e => e.CreatedAt)
            .IsRequired();

        builder.Property(e => e.UpdatedAt)
            .IsRequired(false);

        builder.Property(e => e.IsDeleted)
            .HasDefaultValue(false)
            .IsRequired();

        // Índices
        builder.HasIndex(e => e.Name);
        builder.HasIndex(e => e.Type);

        // Filtro global para soft delete
        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}