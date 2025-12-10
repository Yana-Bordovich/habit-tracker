import React, { useState } from 'react';
import { register } from '../api';
import type { User } from '../types';

interface RegistrationScreenProps {
  onRegistrationSuccess: (user: User) => void;
  onNavigateToLogin: () => void;
}

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onRegistrationSuccess, onNavigateToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username.length < 3 || password.length < 6) {  // Добавлена валидация
      setError('Имя пользователя минимум 3 символа, пароль минимум 6');
      return;
    }

    try {
      const newUser = await register(username, password);
      onRegistrationSuccess(newUser);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);  // Показывает конкретную ошибку с backend
      } else {
        setError('Произошла неизвестная ошибка');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans p-4 theme-dark">
      <div className="w-full max-w-sm mx-auto">
        <div className="p-8 rounded-2xl shadow-2xl border themed-bg-surface themed-border">
          <h2 className="text-2xl font-bold mb-6 text-center themed-text-primary">Создать аккаунт</h2>
          <p className="text-sm text-center themed-text-secondary mb-8">Присоединяйтесь к трекеру привычек</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <input
                type="text"
                id="reg-username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Имя пользователя"
                className="text-sm rounded-lg focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5 themed-input-bg themed-text-primary"
                required
              />
            </div>

            <div>
              <input
                type="password"
                id="reg-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="•••••••• (минимум 6 симв.)"
                className="text-sm rounded-lg focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5 themed-input-bg themed-text-primary"
                required
              />
            </div>

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <button type="submit" className="w-full px-6 py-3 rounded-lg bg-brand-primary hover:bg-brand-secondary text-white font-semibold transition">
              Зарегистрироваться
            </button>
          </form>

          <div className="text-center mt-6">
            <button 
              onClick={onNavigateToLogin}
              className="text-sm themed-text-secondary hover:themed-text-primary transition underline"
            >
              Уже есть аккаунт? Войти
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationScreen;