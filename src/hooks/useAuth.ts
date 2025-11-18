import { useState, useCallback } from 'react';
import { authService } from '../services/api/authService';
import type { User } from './types';

// Temporary local type
interface AuthCredentials {
  username: string;
  password: string;
  email?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: AuthCredentials): Promise<User> => {
    setLoading(true);
    setError(null);
    
    try {
      const userData = await authService.login(credentials);
      setUser(userData);
      return userData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (credentials: AuthCredentials): Promise<User> => {
    setLoading(true);
    setError(null);
    
    try {
      const userData = await authService.register(credentials);
      setUser(userData);
      return userData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback((): void => {
    authService.logout();
    setUser(null);
    setError(null);
  }, []);

  const isAuthenticated = useCallback((): boolean => {
    return user !== null;
  }, [user]);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: isAuthenticated(),
  };
};