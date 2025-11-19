import { apiClient } from './apiClient';
import type { User, AuthCredentials, ApiResponse } from '../../types';

export const authService = {
  async register(credentials: AuthCredentials): Promise<User> {
    const response = await apiClient.post('/api/register', credentials);
    
    if (response.data) {
      sessionStorage.setItem('currentUser', JSON.stringify(response.data));
    }
    
    return response.data;
  },

  async login(credentials: AuthCredentials): Promise<User> {
    const response = await apiClient.post('/api/login', credentials);
    
    if (response.data) {
      sessionStorage.setItem('currentUser', JSON.stringify(response.data));
    }
    
    return response.data;
  },

  logout(): void {
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('currentUser');
  },

  getCurrentUser(): User | null {
    try {
      const userStr = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },

  getToken(): string | null {
    const user = this.getCurrentUser();
    return user?.token || null;
  }
};