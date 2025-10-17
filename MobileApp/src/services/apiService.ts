/**
 * Cliente HTTP base usando Axios
 * Centraliza a configuração de requisições HTTP para a API
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../constants/api';

/**
 * Instância configurada do Axios
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de requisições
 * Aqui você pode adicionar tokens de autenticação, logs, etc.
 */
apiClient.interceptors.request.use(
  (config) => {
    // Aqui você pode adicionar um token de autenticação
    // const token = await getAuthToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Interceptor de respostas
 * Trata erros globalmente
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      // Erro retornado pela API
      console.error(`[API Error] ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      // Erro de rede (sem resposta)
      console.error('[Network Error]', error.message);
    } else {
      // Erro ao configurar a requisição
      console.error('[Request Error]', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Classe de serviço HTTP genérica
 */
class ApiService {
  /**
   * Requisição GET
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  }

  /**
   * Requisição POST
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Requisição PUT
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Requisição DELETE
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  }

  /**
   * Constrói URL com query parameters
   */
  buildUrlWithParams(baseUrl: string, params?: Record<string, any>): string {
    if (!params) return baseUrl;
    
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }
}

export default new ApiService();
