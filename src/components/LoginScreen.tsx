import React, { useState } from 'react';
import { login } from '../api';
import type { User } from './types';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  onNavigateToRegister: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onNavigateToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(username, password);
      onLoginSuccess(user);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Произошла неизвестная ошибка');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans p-4 theme-dark">
      <div className="w-full max-w-sm mx-auto">
        <div className="p-8 rounded-2xl shadow-xl themed-bg-surface-modal border themed-border">
          <h1 className="text-3xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">
            Трекер Привычек
          </h1>
          <p className="text-center mb-8 themed-text-secondary text-sm">Войдите в свой аккаунт</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              {/* Fix: Replaced invalid property 'ה' with 'className'. */}
              <label htmlFor="username" className="block mb-2 text-sm font-medium themed-text-secondary">Имя пользователя</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="text-sm rounded-lg focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5 themed-input-bg themed-text-primary"
                placeholder="например, admin"
                required
              />
            </div>
            <div>
              {/* Fix: Replaced invalid property 'ה' with 'className'. */}
              <label htmlFor="password" className="block mb-2 text-sm font-medium themed-text-secondary">Пароль</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="text-sm rounded-lg focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5 themed-input-bg themed-text-primary"
                placeholder="••••••••"
                required
              />
            </div>

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <button type="submit" className="w-full px-6 py-3 rounded-lg bg-brand-primary hover:bg-brand-secondary text-white font-semibold transition">
              Войти
            </button>
          </form>

          <div className="flex items-center my-6">
            <hr className="flex-grow themed-border" />
            <span className="mx-4 text-xs themed-text-secondary">ИЛИ</span>
            <hr className="flex-grow themed-border" />
          </div>

          <button 
            onClick={onNavigateToRegister}
            className="w-full px-6 py-3 rounded-lg themed-bg-surface-secondary hover:bg-gray-700/80 themed-text-primary font-semibold transition border themed-border"
          >
            Создать новый аккаунт
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;