using CaderninhoApi.Domain.Entities;

namespace CaderninhoApi.Domain.Abstractions;

/// <summary>
/// Interface para o serviço de domínio de parcelas de cartão de crédito
/// </summary>
public interface ICreditCardInstallmentDomainService
{
    /// <summary>
    /// Cria as parcelas de cartão de crédito para uma despesa
    /// </summary>
    /// <param name="expense">Despesa que será parcelada</param>
    /// <param name="cancellationToken">Token de cancelamento</param>
    /// <returns>Lista de parcelas criadas</returns>
    Task<List<CreditCardInstallment>> CreateInstallmentsAsync(Expense expense, CancellationToken cancellationToken = default);

    /// <summary>
    /// Obtém todas as parcelas de uma despesa
    /// </summary>
    /// <param name="expenseId">ID da despesa</param>
    /// <param name="cancellationToken">Token de cancelamento</param>
    /// <returns>Lista de parcelas da despesa</returns>
    Task<List<CreditCardInstallment>> GetInstallmentsByExpenseIdAsync(int expenseId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Obtém todas as parcelas de um cartão em um período
    /// </summary>
    /// <param name="cardId">ID do cartão</param>
    /// <param name="startDate">Data inicial</param>
    /// <param name="endDate">Data final</param>
    /// <param name="cancellationToken">Token de cancelamento</param>
    /// <returns>Lista de parcelas do cartão no período</returns>
    Task<List<CreditCardInstallment>> GetInstallmentsByCardAndPeriodAsync(int cardId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Marca uma parcela como paga
    /// </summary>
    /// <param name="installmentId">ID da parcela</param>
    /// <param name="paidDate">Data de pagamento</param>
    /// <param name="cancellationToken">Token de cancelamento</param>
    /// <returns>Parcela atualizada</returns>
    Task<CreditCardInstallment> MarkAsPaidAsync(int installmentId, DateTime paidDate, CancellationToken cancellationToken = default);
}
