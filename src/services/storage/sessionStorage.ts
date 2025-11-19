import type { User } from '../../types';

export const sessionStorageService = {
  setCurrentUser(user: User): void {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  },

  getCurrentUser(): User | null {
    try {
      const userStr = sessionStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  removeCurrentUser(): void {
    sessionStorage.removeItem('currentUser');
  },

  getUserId(): string | null {
    const user = this.getCurrentUser();
    return user?.id || null;
  },

  getToken(): string | null {
    const user = this.getCurrentUser();
    return user?.token || null;
  },

  clear(): void {
    sessionStorage.clear();
  }
};
