using CaderninhoApi.Domain.DTOs;
using CaderninhoApi.Domain.Entities;

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
}