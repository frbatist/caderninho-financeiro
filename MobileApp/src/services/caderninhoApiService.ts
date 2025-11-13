/**
 * Serviços específicos para a API do Caderninho Financeiro
 * Contém métodos tipados para cada entidade da API .NET
 */

import apiService from './apiService';
import { API_ENDPOINTS } from '../constants/api';
import { EstablishmentType } from '../types/establishmentType';

// Tipos baseados na API .NET
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Card {
  id: number;
  name: string;
  type: CardType;
  brand: CardBrand;
  lastFourDigits: string;
  closingDay?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Expense {
  id: number;
  description: string;
  establishmentId: number;
  establishment: Establishment;
  paymentType: PaymentType;
  cardId?: number;
  card?: Card;
  amount: number;
  date: string;
  installmentCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Establishment {
  id: number;
  name: string;
  type: EstablishmentType;
  createdAt: string;
  updatedAt?: string;
}

export interface MonthlyEntry {
  id: number;
  type: MonthlyEntryType;
  description: string;
  amount: number;
  operation: OperationType;
  isActive: boolean;
  month: number;
  year: number;
  createdAt: string;
  updatedAt?: string;
}

export interface MonthlySpendingLimit {
  id: number;
  establishmentType: EstablishmentType;
  limitAmount: number;
  isActive: boolean;
  month: number;
  year: number;
  createdAt: string;
  updatedAt?: string;
}

// Enums baseados na API .NET
export enum CardType {
  Credit = 0,
  Debit = 1,
  Voucher = 2
}

export enum CardBrand {
  Visa = 0,
  Mastercard = 1,
  Elo = 2,
  AmericanExpress = 3,
  Hipercard = 4,
  Other = 5
}

export enum PaymentType {
  CreditCard = 1,
  DebitCard = 2,
  Pix = 3,
  Deposit = 4,
  Cash = 5,
  BankSlip = 6
}

export enum MonthlyEntryType {
  Salary = 1,
  Tax = 2,
  MonthlyBill = 3,
  Other = 4
}

export enum OperationType {
  Income = 1,
  Expense = 2
}

// DTOs para criação
export interface CreateUserDto {
  name: string;
  email: string;
}

export interface CreateCardDto {
  name: string;
  type: CardType;
  brand: CardBrand;
  lastFourDigits: string;
  closingDay?: number;
}

export interface CreateExpenseDto {
  userId: number;
  description: string;
  establishmentId: number;
  paymentType: PaymentType;
  cardId?: number;
  amount: number;
  date: string;
  installmentCount: number;
}

export interface CreateEstablishmentDto {
  name: string;
  type: EstablishmentType;
}

export interface CreateMonthlyEntryDto {
  type: MonthlyEntryType;
  description: string;
  amount: number;
  operation: OperationType;
  month: number;
  year: number;
}

export interface DuplicateMonthlyEntryDto {
  amount: number;
}

export interface DuplicateMonthlySpendingLimitDto {
  amount: number;
}

export interface CreateMonthlySpendingLimitDto {
  establishmentType: EstablishmentType;
  limitAmount: number;
  month: number;
  year: number;
}

// DTOs para MonthlyStatement
export interface MonthlyStatementDto {
  year: number;
  month: number;
  expensesByType: ExpenseByTypeDto[];
  totalExpenses: number;
  totalLimits: number;
  availableBalance: number;
  percentageUsed: number;
}

export interface ExpenseByTypeDto {
  establishmentType: EstablishmentType;
  establishmentTypeName: string;
  monthlyLimit: number | null;
  totalSpent: number;
  availableBalance: number | null;
  percentageUsed: number | null;
  isOverLimit: boolean;
  transactions: StatementTransactionDto[];
}

export interface StatementTransactionDto {
  expenseId: number;
  description: string;
  establishmentName: string;
  date: string;
  amount: number;
  paymentType: PaymentType;
  paymentTypeName: string;
  cardName?: string | null;
  installmentInfo?: string | null;
  isCreditCardInstallment: boolean;
  dueDate?: string | null;
}

// Resposta paginada
export interface PagedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Filtros
export interface FilterRequest {
  pageNumber?: number;
  pageSize?: number;
  searchText?: string;
}

export interface ExpenseFilterRequest extends FilterRequest {
  year?: number;
  month?: number;
}

export interface MonthlyEntryFilterRequest extends FilterRequest {
  year?: number;
  month?: number;
  isActive?: boolean;
}

export interface MonthlySpendingLimitFilterRequest extends FilterRequest {
  establishmentType?: EstablishmentType;
  year?: number;
  month?: number;
  isActive?: boolean;
}

/**
 * Serviços para Usuários
 */
export class UsersService {
  static async getAll(): Promise<User[]> {
    console.log('[UsersService] getAll() chamado');
    console.log('[UsersService] Endpoint:', API_ENDPOINTS.USERS);
    const result = await apiService.get<User[]>(API_ENDPOINTS.USERS);
    console.log('[UsersService] Resultado recebido:', result);
    return result;
  }

  static async getById(id: number): Promise<User> {
    return apiService.get<User>(API_ENDPOINTS.USER_BY_ID(id));
  }

  static async create(data: CreateUserDto): Promise<User> {
    return apiService.post<User>(API_ENDPOINTS.CREATE_USER, data);
  }

  static async update(id: number, data: CreateUserDto): Promise<User> {
    return apiService.put<User>(API_ENDPOINTS.UPDATE_USER(id), data);
  }

  static async delete(id: number): Promise<void> {
    return apiService.delete<void>(API_ENDPOINTS.DELETE_USER(id));
  }
}

/**
 * Serviços para Cartões
 */
export class CardsService {
  static async getAll(filter?: FilterRequest): Promise<PagedResponse<Card>> {
    const params: Record<string, any> = {};
    if (filter?.pageNumber) params.pageNumber = filter.pageNumber;
    if (filter?.pageSize) params.pageSize = filter.pageSize;
    if (filter?.searchText) params.searchText = filter.searchText;

    const url = apiService.buildUrlWithParams(API_ENDPOINTS.CARDS, params);
    return apiService.get<PagedResponse<Card>>(url);
  }

  static async getById(id: number): Promise<Card> {
    return apiService.get<Card>(API_ENDPOINTS.CARD_BY_ID(id));
  }

  static async create(data: CreateCardDto): Promise<Card> {
    return apiService.post<Card>(API_ENDPOINTS.CREATE_CARD, data);
  }
}

/**
 * Serviços para Despesas
 */
export class ExpensesService {
  static async getAll(filter?: ExpenseFilterRequest): Promise<PagedResponse<Expense>> {
    const params: Record<string, any> = {};
    if (filter?.pageNumber) params.pageNumber = filter.pageNumber;
    if (filter?.pageSize) params.pageSize = filter.pageSize;
    if (filter?.searchText) params.searchText = filter.searchText;
    if (filter?.year) params.year = filter.year;
    if (filter?.month) params.month = filter.month;

    const url = apiService.buildUrlWithParams(API_ENDPOINTS.EXPENSES, params);
    return apiService.get<PagedResponse<Expense>>(url);
  }

  static async getById(id: number): Promise<Expense> {
    return apiService.get<Expense>(API_ENDPOINTS.EXPENSE_BY_ID(id));
  }

  static async create(data: CreateExpenseDto): Promise<Expense> {
    return apiService.post<Expense>(API_ENDPOINTS.CREATE_EXPENSE, data);
  }

  static async update(id: number, data: CreateExpenseDto): Promise<Expense> {
    return apiService.put<Expense>(API_ENDPOINTS.UPDATE_EXPENSE(id), data);
  }

  static async delete(id: number): Promise<void> {
    return apiService.delete<void>(API_ENDPOINTS.DELETE_EXPENSE(id));
  }
}

/**
 * Serviços para Estabelecimentos
 */
export class EstablishmentsService {
  static async getAll(filter?: FilterRequest): Promise<PagedResponse<Establishment>> {
    const params: Record<string, any> = {};
    if (filter?.pageNumber) params.pageNumber = filter.pageNumber;
    if (filter?.pageSize) params.pageSize = filter.pageSize;
    if (filter?.searchText) params.searchText = filter.searchText;

    const url = apiService.buildUrlWithParams(API_ENDPOINTS.ESTABLISHMENTS, params);
    return apiService.get<PagedResponse<Establishment>>(url);
  }

  static async getById(id: number): Promise<Establishment> {
    return apiService.get<Establishment>(API_ENDPOINTS.ESTABLISHMENT_BY_ID(id));
  }

  static async create(data: CreateEstablishmentDto): Promise<Establishment> {
    return apiService.post<Establishment>(API_ENDPOINTS.CREATE_ESTABLISHMENT, data);
  }
}

/**
 * Serviços para Entradas Mensais
 */
export class MonthlyEntriesService {
  static async getAll(filter?: MonthlyEntryFilterRequest): Promise<PagedResponse<MonthlyEntry>> {
    const params: Record<string, any> = {};
    if (filter?.pageNumber) params.pageNumber = filter.pageNumber;
    if (filter?.pageSize) params.pageSize = filter.pageSize;
    if (filter?.searchText) params.searchText = filter.searchText;
    if (filter?.year) params.year = filter.year;
    if (filter?.month) params.month = filter.month;
    if (filter?.isActive !== undefined) params.isActive = filter.isActive;

    const url = apiService.buildUrlWithParams(API_ENDPOINTS.MONTHLY_ENTRIES, params);
    return apiService.get<PagedResponse<MonthlyEntry>>(url);
  }

  static async getById(id: number): Promise<MonthlyEntry> {
    return apiService.get<MonthlyEntry>(API_ENDPOINTS.MONTHLY_ENTRY_BY_ID(id));
  }

  static async create(data: CreateMonthlyEntryDto): Promise<MonthlyEntry> {
    return apiService.post<MonthlyEntry>(API_ENDPOINTS.CREATE_MONTHLY_ENTRY, data);
  }

  static async update(id: number, data: CreateMonthlyEntryDto): Promise<MonthlyEntry> {
    return apiService.put<MonthlyEntry>(API_ENDPOINTS.UPDATE_MONTHLY_ENTRY(id), data);
  }

  static async delete(id: number): Promise<void> {
    return apiService.delete<void>(API_ENDPOINTS.DELETE_MONTHLY_ENTRY(id));
  }

  static async toggleActive(id: number, isActive: boolean): Promise<MonthlyEntry> {
    return apiService.patch<MonthlyEntry>(API_ENDPOINTS.TOGGLE_MONTHLY_ENTRY_ACTIVE(id), isActive);
  }

  static async duplicateToNextMonth(id: number, data: DuplicateMonthlyEntryDto): Promise<MonthlyEntry> {
    return apiService.post<MonthlyEntry>(API_ENDPOINTS.DUPLICATE_MONTHLY_ENTRY_TO_NEXT_MONTH(id), data);
  }
}

/**
 * Serviços para Limites de Gasto Mensal
 */
export class MonthlySpendingLimitsService {
  static async getAll(filter?: MonthlySpendingLimitFilterRequest): Promise<PagedResponse<MonthlySpendingLimit>> {
    const params: Record<string, any> = {};
    if (filter?.pageNumber) params.pageNumber = filter.pageNumber;
    if (filter?.pageSize) params.pageSize = filter.pageSize;
    if (filter?.searchText) params.searchText = filter.searchText;
    if (filter?.establishmentType !== undefined) params.establishmentType = filter.establishmentType;
    if (filter?.year) params.year = filter.year;
    if (filter?.month) params.month = filter.month;
    if (filter?.isActive !== undefined) params.isActive = filter.isActive;

    const url = apiService.buildUrlWithParams(API_ENDPOINTS.MONTHLY_SPENDING_LIMITS, params);
    return apiService.get<PagedResponse<MonthlySpendingLimit>>(url);
  }

  static async getById(id: number): Promise<MonthlySpendingLimit> {
    return apiService.get<MonthlySpendingLimit>(API_ENDPOINTS.MONTHLY_SPENDING_LIMIT_BY_ID(id));
  }

  static async create(data: CreateMonthlySpendingLimitDto): Promise<MonthlySpendingLimit> {
    return apiService.post<MonthlySpendingLimit>(API_ENDPOINTS.CREATE_MONTHLY_SPENDING_LIMIT, data);
  }

  static async update(id: number, data: CreateMonthlySpendingLimitDto): Promise<MonthlySpendingLimit> {
    return apiService.put<MonthlySpendingLimit>(API_ENDPOINTS.UPDATE_MONTHLY_SPENDING_LIMIT(id), data);
  }

  static async delete(id: number): Promise<void> {
    return apiService.delete<void>(API_ENDPOINTS.DELETE_MONTHLY_SPENDING_LIMIT(id));
  }

  static async toggleActive(id: number, isActive: boolean): Promise<MonthlySpendingLimit> {
    return apiService.patch<MonthlySpendingLimit>(API_ENDPOINTS.TOGGLE_MONTHLY_SPENDING_LIMIT_ACTIVE(id), isActive);
  }

  static async duplicateToNextMonth(id: number, data: DuplicateMonthlySpendingLimitDto): Promise<MonthlySpendingLimit> {
    return apiService.post<MonthlySpendingLimit>(API_ENDPOINTS.DUPLICATE_MONTHLY_SPENDING_LIMIT_TO_NEXT_MONTH(id), data);
  }
}

/**
 * Serviços para Extrato Mensal
 */
export class MonthlyStatementService {
  static async getMonthlyStatement(year: number, month: number): Promise<MonthlyStatementDto> {
    const params: Record<string, any> = { year, month };
    const url = apiService.buildUrlWithParams(API_ENDPOINTS.MONTHLY_STATEMENT, params);
    return apiService.get<MonthlyStatementDto>(url);
  }
}

// Export default com todos os serviços
const CaderninhoApiService = {
  users: UsersService,
  cards: CardsService,
  expenses: ExpensesService,
  establishments: EstablishmentsService,
  monthlyEntries: MonthlyEntriesService,
  monthlySpendingLimits: MonthlySpendingLimitsService,
  monthlyStatement: MonthlyStatementService,
};

export default CaderninhoApiService;