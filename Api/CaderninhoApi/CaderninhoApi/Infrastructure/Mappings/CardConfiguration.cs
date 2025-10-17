using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CaderninhoApi.Domain.Entities;

namespace CaderninhoApi.Infrastructure.Mappings;

/// <summary>
/// Configuração do Entity Framework para a entidade Card
/// </summary>
public class CardConfiguration : IEntityTypeConfiguration<Card>
{
    public void Configure(EntityTypeBuilder<Card> builder)
    {
        // Tabela
        builder.ToTable("Cards");

        // Chave primária
        builder.HasKey(c => c.Id);

        // Propriedades
        builder.Property(c => c.Id)
            .ValueGeneratedOnAdd()
            .IsRequired();

        builder.Property(c => c.Name)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(c => c.Type)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(c => c.Brand)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(c => c.LastFourDigits)
            .HasMaxLength(4)
            .IsRequired();

        builder.Property(c => c.CreatedAt)
            .IsRequired();

        builder.Property(c => c.UpdatedAt)
            .IsRequired(false);

        builder.Property(c => c.IsDeleted)
            .HasDefaultValue(false)
            .IsRequired();

        // Índices
        builder.HasIndex(c => c.Name);
        builder.HasIndex(c => c.Type);
        builder.HasIndex(c => c.Brand);

        // Filtro global para soft delete
        builder.HasQueryFilter(c => !c.IsDeleted);
    }
}