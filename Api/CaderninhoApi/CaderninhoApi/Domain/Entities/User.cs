namespace CaderninhoApi.Domain.Entities;

/// <summary>
/// Entidade que representa um usu�rio do sistema
/// </summary>
public class User : BaseEntity
{
    /// <summary>
    /// Nome completo do usu�rio
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Email do usu�rio (�nico no sistema)
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Hash da senha do usu�rio
    /// </summary>
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>
    /// Indica se o usu�rio est� ativo no sistema
    /// </summary>
    public bool IsActive { get; set; } = true;
}