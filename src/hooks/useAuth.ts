// src/hooks/useAuth.ts
import { useState } from 'react';
import { register, login } from '../services/api/authService'; // ← правильный импорт

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (username: string, password: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await register(username, password);
      setUser(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (username: string, password: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await login(username, password);
      setUser(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return { user, loading, error, register: handleRegister, login: handleLogin, logout };
};