using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace CaderninhoApi.Infrastructure.Helpers;

/// <summary>
/// Helper para obter informações de enums
/// </summary>
public static class EnumHelper
{
    /// <summary>
    /// Obtém o valor do atributo Display Name de um enum
    /// </summary>
    /// <param name="enumValue">Valor do enum</param>
    /// <returns>Display Name do enum ou o nome do valor se não tiver Display</returns>
    public static string GetDisplayName(this Enum enumValue)
    {
        var displayAttribute = enumValue
            .GetType()
            .GetMember(enumValue.ToString())
            .FirstOrDefault()
            ?.GetCustomAttribute<DisplayAttribute>();

        return displayAttribute?.Name ?? enumValue.ToString();
    }
}
