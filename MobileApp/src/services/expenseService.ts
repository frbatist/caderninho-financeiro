/**
 * Serviço para gerenciar despesas
 * Este arquivo serve como bridge para o CaderninhoApiService com métodos mais intuitivos
 * 
 * NOTA: Para novos desenvolvimentos, você pode usar diretamente o CaderninhoApiService
 * ou este ExpenseService que fornece uma interface mais amigável
 */

import CaderninhoApiService, { 
  Expense, 
  CreateExpenseDto, 
  ExpenseFilterRequest, 
  PagedResponse 
} from './caderninhoApiService';

class ExpenseService {
  /**
   * Busca despesas com filtros e paginação
   */
  async getExpenses(
    filters?: ExpenseFilterRequest
  ): Promise<PagedResponse<Expense>> {
    return CaderninhoApiService.expenses.getAll(filters);
  }

  /**
   * Busca uma despesa por ID
   */
  async getExpenseById(id: number): Promise<Expense> {
    return CaderninhoApiService.expenses.getById(id);
  }

  /**
   * Cria uma nova despesa
   */
  async createExpense(data: CreateExpenseDto): Promise<Expense> {
    return CaderninhoApiService.expenses.create(data);
  }

  /**
   * Atualiza uma despesa existente
   */
  async updateExpense(id: number, data: CreateExpenseDto): Promise<Expense> {
    return CaderninhoApiService.expenses.update(id, data);
  }

  /**
   * Deleta uma despesa
   */
  async deleteExpense(id: number): Promise<void> {
    return CaderninhoApiService.expenses.delete(id);
  }

  // Métodos de compatibilidade (deprecated)
  /**
   * @deprecated Use getExpenses() em vez de getTransactions()
   */
  async getTransactions(filters?: ExpenseFilterRequest): Promise<PagedResponse<Expense>> {
    return this.getExpenses(filters);
  }

  /**
   * @deprecated Use getExpenseById() em vez de getTransactionById()
   */
  async getTransactionById(id: number): Promise<Expense> {
    return this.getExpenseById(id);
  }

  /**
   * @deprecated Use createExpense() em vez de createTransaction()
   */
  async createTransaction(data: CreateExpenseDto): Promise<Expense> {
    return this.createExpense(data);
  }

  /**
   * @deprecated Use deleteExpense() em vez de deleteTransaction()
   */
  async deleteTransaction(id: number): Promise<void> {
    return this.deleteExpense(id);
  }
}

export default new ExpenseService();
