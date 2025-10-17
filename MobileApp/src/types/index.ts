/**
 * Tipos TypeScript que correspondem aos modelos da API
 */

// Enums
export enum PaymentType {
  Credito = 0,
  Debito = 1,
  Dinheiro = 2,
  Pix = 3,
  Boleto = 4,
  Outros = 5
}

export enum TransactionType {
  Receita = 0,
  Despesa = 1
}

export enum AccountStatus {
  Ativa = 0,
  Inativa = 1,
  Bloqueada = 2
}

// Entidades
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Account {
  id: number;
  userId: number;
  name: string;
  balance: number;
  status: AccountStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface Card {
  id: number;
  userId: number;
  name: string;
  lastFourDigits: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  type: TransactionType;
  userId?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Transaction {
  id: number;
  userId: number;
  accountId: number;
  categoryId?: number;
  cardId?: number;
  description: string;
  amount: number;
  type: TransactionType;
  paymentType: PaymentType;
  date: string;
  isPaid: boolean;
  isRecurring: boolean;
  installments?: number;
  currentInstallment?: number;
  createdAt: string;
  updatedAt?: string;
  
  // Relacionamentos
  account?: Account;
  category?: Category;
  card?: Card;
}

// DTOs para criação
export interface CreateUserDto {
  name: string;
  email: string;
}

export interface CreateAccountDto {
  userId: number;
  name: string;
  balance: number;
}

export interface CreateCardDto {
  userId: number;
  name: string;
  lastFourDigits: string;
  limit: number;
  closingDay: number;
  dueDay: number;
}

export interface CreateCategoryDto {
  name: string;
  type: TransactionType;
  userId?: number;
}

export interface CreateTransactionDto {
  userId: number;
  accountId: number;
  categoryId?: number;
  cardId?: number;
  description: string;
  amount: number;
  type: TransactionType;
  paymentType: PaymentType;
  date: string;
  isPaid: boolean;
  isRecurring: boolean;
  installments?: number;
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

// Filtros de busca
export interface FilterRequest {
  pageNumber?: number;
  pageSize?: number;
  searchText?: string;
}

export interface TransactionFilterRequest extends FilterRequest {
  userId?: number;
  accountId?: number;
  categoryId?: number;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
}
