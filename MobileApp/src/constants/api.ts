/**
 * Configurações da API do Caderninho Financeiro
 * 
 * IMPORTANTE: Atualize o BASE_URL com o endereço da sua API
 */

// URL base da API
// Para desenvolvimento local: use o IP da sua máquina (não use localhost no dispositivo físico)
// Exemplo: 'http://192.168.1.100:5054/api' ou 'http://seu-ip:porta/api'
export const API_BASE_URL = 'http://localhost:5054/api';

// Timeout para requisições (em milissegundos)
export const API_TIMEOUT = 10000;

// Endpoints da API baseados nos Controllers da API .NET
export const API_ENDPOINTS = {
  // Usuários
  USERS: '/users',
  USER_BY_ID: (id: number) => `/users/${id}`,
  CREATE_USER: '/users',
  UPDATE_USER: (id: number) => `/users/${id}`,
  DELETE_USER: (id: number) => `/users/${id}`,
  
  // Cartões (Cards)
  CARDS: '/cards',
  CARD_BY_ID: (id: number) => `/cards/${id}`,
  CREATE_CARD: '/cards',
  
  // Despesas (Expenses)
  EXPENSES: '/expenses',
  EXPENSE_BY_ID: (id: number) => `/expenses/${id}`,
  CREATE_EXPENSE: '/expenses',
  UPDATE_EXPENSE: (id: number) => `/expenses/${id}`,
  DELETE_EXPENSE: (id: number) => `/expenses/${id}`,
  
  // Estabelecimentos (Establishments)
  ESTABLISHMENTS: '/establishments',
  ESTABLISHMENT_BY_ID: (id: number) => `/establishments/${id}`,
  CREATE_ESTABLISHMENT: '/establishments',
  
  // Entradas Mensais (Monthly Entries)
  MONTHLY_ENTRIES: '/monthlyentries',
  MONTHLY_ENTRY_BY_ID: (id: number) => `/monthlyentries/${id}`,
  CREATE_MONTHLY_ENTRY: '/monthlyentries',
  UPDATE_MONTHLY_ENTRY: (id: number) => `/monthlyentries/${id}`,
  DELETE_MONTHLY_ENTRY: (id: number) => `/monthlyentries/${id}`,
  TOGGLE_MONTHLY_ENTRY_ACTIVE: (id: number) => `/monthlyentries/${id}/toggle-active`,
  
  // Limites de Gasto Mensal (Monthly Spending Limits)
  MONTHLY_SPENDING_LIMITS: '/monthlyspendinglimits',
  MONTHLY_SPENDING_LIMIT_BY_ID: (id: number) => `/monthlyspendinglimits/${id}`,
  CREATE_MONTHLY_SPENDING_LIMIT: '/monthlyspendinglimits',
  UPDATE_MONTHLY_SPENDING_LIMIT: (id: number) => `/monthlyspendinglimits/${id}`,
  DELETE_MONTHLY_SPENDING_LIMIT: (id: number) => `/monthlyspendinglimits/${id}`,
  TOGGLE_MONTHLY_SPENDING_LIMIT_ACTIVE: (id: number) => `/monthlyspendinglimits/${id}/toggle-active`,
  
  // Extrato Mensal (Monthly Statement)
  MONTHLY_STATEMENT: '/monthlystatement',
} as const;

// Parâmetros de consulta para filtros
export const API_QUERY_PARAMS = {
  // Paginação
  PAGE_NUMBER: 'pageNumber',
  PAGE_SIZE: 'pageSize',
  
  // Filtros de busca
  SEARCH_TEXT: 'searchText',
  
  // Filtros de data para despesas
  YEAR: 'year',
  MONTH: 'month',
} as const;
