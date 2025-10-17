using CaderninhoApi.Domain.Abstractions.ApplicationServices;
using CaderninhoApi.Domain.DTOs;
using CaderninhoApi.Domain.Entities;
using CaderninhoApi.Infrastructure.Data;

namespace CaderninhoApi.Application.Services;

/// <summary>
/// Serviço para operações com cartões
/// </summary>
public class CardService : ICardService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CardService> _logger;

    public CardService(
        ApplicationDbContext context,
        ILogger<CardService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Adiciona um novo cartão
    /// </summary>
    /// <param name="dto">Dados do cartão a ser criado</param>
    /// <returns>Cartão criado</returns>
    public async Task<Card> AddAsync(CreateCardDto dto)
    {
        try
        {
            var card = new Card
            {
                Name = dto.Name,
                Type = dto.Type,
                Brand = dto.Brand,
                LastFourDigits = dto.LastFourDigits
            };

            _context.Cards.Add(card);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Cartão criado com sucesso: {CardId} - {CardName} - {LastFourDigits}", 
                card.Id, card.Name, card.LastFourDigits);

            return card;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao criar cartão: {CardName}", dto.Name);
            throw;
        }
    }
}