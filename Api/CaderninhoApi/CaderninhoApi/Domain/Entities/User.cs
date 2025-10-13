namespace CaderninhoApi.Domain.Entities;

/// <summary>
/// Entidade que representa um usuário do sistema
/// </summary>
public class User : BaseEntity
{
    /// <summary>
    /// Nome completo do usuário
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Email do usuário (único no sistema)
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Hash da senha do usuário
    /// </summary>
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>
    /// Indica se o usuário está ativo no sistema
    /// </summary>
    public bool IsActive { get; set; } = true;
}