/**
 * Serviço para gerenciar o usuário logado no armazenamento local
 * Usa localStorage para web e um wrapper simples para React Native
 */

import { User } from './caderninhoApiService';

const USER_STORAGE_KEY = '@caderninho:user';

// Wrapper simples para armazenamento que funciona tanto em web quanto em mobile
class SimpleStorage {
  private static memoryStorage: { [key: string]: string } = {};

  static async setItem(key: string, value: string): Promise<void> {
    try {
      // Tenta usar localStorage (web)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      } else {
        // Fallback para memória (mobile sem AsyncStorage instalado)
        this.memoryStorage[key] = value;
      }
    } catch (error) {
      // Se falhar, usa memória
      this.memoryStorage[key] = value;
    }
  }

  static async getItem(key: string): Promise<string | null> {
    try {
      // Tenta usar localStorage (web)
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      } else {
        // Fallback para memória (mobile sem AsyncStorage instalado)
        return this.memoryStorage[key] || null;
      }
    } catch (error) {
      // Se falhar, usa memória
      return this.memoryStorage[key] || null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      // Tenta usar localStorage (web)
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      } else {
        // Fallback para memória (mobile sem AsyncStorage instalado)
        delete this.memoryStorage[key];
      }
    } catch (error) {
      // Se falhar, usa memória
      delete this.memoryStorage[key];
    }
  }
}

/**
 * Serviço de armazenamento do usuário
 */
export class UserStorageService {
  /**
   * Salva o usuário no storage
   */
  static async saveUser(user: User): Promise<void> {
    try {
      await SimpleStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Erro ao salvar usuário no storage:', error);
      throw new Error('Não foi possível salvar o usuário');
    }
  }

  /**
   * Busca o usuário do storage
   */
  static async getUser(): Promise<User | null> {
    try {
      const userJson = await SimpleStorage.getItem(USER_STORAGE_KEY);
      if (!userJson) return null;
      
      return JSON.parse(userJson) as User;
    } catch (error) {
      console.error('Erro ao buscar usuário do storage:', error);
      return null;
    }
  }

  /**
   * Remove o usuário do storage
   */
  static async removeUser(): Promise<void> {
    try {
      await SimpleStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao remover usuário do storage:', error);
      throw new Error('Não foi possível remover o usuário');
    }
  }

  /**
   * Verifica se existe usuário salvo
   */
  static async hasUser(): Promise<boolean> {
    try {
      const user = await this.getUser();
      return user !== null;
    } catch (error) {
      return false;
    }
  }
}

export default UserStorageService;
