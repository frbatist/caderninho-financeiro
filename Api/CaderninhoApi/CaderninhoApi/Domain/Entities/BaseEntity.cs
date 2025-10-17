namespace CaderninhoApi.Domain.Entities;

/// <summary>
/// Classe base para todas as entidades do dom�nio
/// </summary>
public abstract class BaseEntity
{
    /// <summary>
    /// Identificador �nico da entidade
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Data de cria��o do registro
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Data da �ltima atualiza��o do registro
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// Indica se o registro foi exclu�do logicamente (soft delete)
    /// </summary>
    public bool IsDeleted { get; set; } = false;
}