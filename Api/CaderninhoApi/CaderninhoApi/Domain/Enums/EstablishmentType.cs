using System.ComponentModel.DataAnnotations;

namespace CaderninhoApi.Domain.Enums;

/// <summary>
/// Representa os tipos de estabelecimento disponíveis no sistema
/// </summary>
public enum EstablishmentType
{
    /// <summary>
    /// Supermercados e mercados
    /// </summary>
    [Display(Name = "Mercado")]
    Supermarket = 1,

    /// <summary>
    /// Lojas de roupas e vestuário
    /// </summary>
    [Display(Name = "Loja de Roupas")]
    ClothingStore = 2,

    /// <summary>
    /// Postos de combustível
    /// </summary>
    [Display(Name = "Posto de Combustível")]
    GasStation = 3,

    /// <summary>
    /// Serviços online e digitais
    /// </summary>
    [Display(Name = "Serviço Online")]
    OnlineService = 4,

    /// <summary>
    /// Jogos e entretenimento digital
    /// </summary>
    [Display(Name = "Games")]
    Games = 5,

    /// <summary>
    /// Lojas de departamentos
    /// </summary>
    [Display(Name = "Loja de Departamentos")]
    DepartmentStore = 6,

    /// <summary>
    /// Restaurantes e similares
    /// </summary>
    [Display(Name = "Restaurante")]
    Restaurant = 7,

    /// <summary>
    /// Serviços de delivery
    /// </summary>
    [Display(Name = "Delivery")]
    Delivery = 8,

    /// <summary>
    /// Instituições de caridade
    /// </summary>
    [Display(Name = "Caridade")]
    Charity = 9,

    /// <summary>
    /// Igrejas e instituições religiosas
    /// </summary>
    [Display(Name = "Igreja")]
    Church = 10,

    /// <summary>
    /// Eventos e shows
    /// </summary>
    [Display(Name = "Eventos")]
    Events = 11,

    /// <summary>
    /// Lazer e entretenimento
    /// </summary>
    [Display(Name = "Lazer")]
    Entertainment = 12,

    /// <summary>
    /// Farmácias e drogarias
    /// </summary>
    [Display(Name = "Farmácia")]
    Pharmacy = 13,

    /// <summary>
    /// Serviços de saúde
    /// </summary>
    [Display(Name = "Saúde")]
    Health = 14,

    /// <summary>
    /// Transporte e mobilidade
    /// </summary>
    [Display(Name = "Transporte")]
    Transport = 15,

    /// <summary>
    /// Serviços diversos
    /// </summary>
    [Display(Name = "Serviços")]
    Services = 16,

    /// <summary>
    /// Cuidados pessoais
    /// </summary>
    [Display(Name = "Cuidados pessoais")]
    PersonalCare = 17,

    /// <summary>
    /// Comércio eletrônico
    /// </summary>
    [Display(Name = "E-Commerce")]
    ECommerce = 18,

    /// <summary>
    /// Outros tipos de estabelecimento
    /// </summary>
    [Display(Name = "Outros")]
    Other = 19
}