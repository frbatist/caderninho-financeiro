using CaderninhoApi.Domain.DTOs;
using CaderninhoApi.Domain.Entities;
using CaderninhoApi.Request;

namespace CaderninhoApi.Domain.Abstractions.ApplicationServices;

/// <summary>
/// Interface para serviço de despesas
/// </summary>
public interface IExpenseService
{
    /// <summary>
    /// Adiciona uma nova despesa
    /// </summary>
    /// <param name="dto">Dados da despesa a ser criada</param>
    /// <returns>Despesa criada</returns>
    Task<Expense> AddAsync(CreateExpenseDto dto);

    /// <summary>
    /// Importa fatura de cartão de crédito a partir de um CSV
    /// </summary>
    /// <param name="request">Dados da importação com linhas da fatura</param>
    /// <returns>Lista de despesas criadas</returns>
    Task<List<Expense>> ImportCardInvoiceAsync(ImportCardInvoiceRequest request);
}