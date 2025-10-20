/**
 * Serviços específicos para a API do Caderninho Financeiro
 * Contém métodos tipados para cada entidade da API .NET
 */

import apiService from './apiService';
import { API_ENDPOINTS } from '../constants/api';

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

export enum EstablishmentType {
  Restaurant = 0,
  Supermarket = 1,
  GasStation = 2,
  Pharmacy = 3,
  Clothing = 4,
  Electronics = 5,
  Services = 6,
  Education = 7,
  Health = 8,
  Entertainment = 9,
  Transport = 10,
  Other = 11
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
}

export interface CreateExpenseDto {
  description: string;
  establishmentId: number;
  paymentType: PaymentType;
  cardId?: number;
  amount: number;
  installmentCount: number;
}

export interface CreateEstablishmentDto {
  name: string;
  type: EstablishmentType;
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

/**
 * Serviços para Usuários
 */
export class UsersService {
  static async getAll(): Promise<User[]> {
    return apiService.get<User[]>(API_ENDPOINTS.USERS);
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

// Export default com todos os serviços
const CaderninhoApiService = {
  users: UsersService,
  cards: CardsService,
  expenses: ExpensesService,
  establishments: EstablishmentsService,
};

export default CaderninhoApiService;