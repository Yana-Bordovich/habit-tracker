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
    try {
      const newUser = await register(username, password);
      onRegistrationSuccess(newUser);
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
            Создать аккаунт
          </h1>
          <p className="text-center mb-8 themed-text-secondary text-sm">Присоединяйтесь к нам!</p>
          
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              {/* Fix: Replaced invalid property 'ה' with 'className'. */}
              <label htmlFor="reg-username" className="block mb-2 text-sm font-medium themed-text-secondary">Имя пользователя</label>
              <input
                type="text"
                id="reg-username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="text-sm rounded-lg focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5 themed-input-bg themed-text-primary"
                required
              />
            </div>
            <div>
              {/* Fix: Replaced invalid property 'ה' with 'className'. */}
              <label htmlFor="reg-password" className="block mb-2 text-sm font-medium themed-text-secondary">Пароль (мин. 4 симв.)</label>
              <input
                type="password"
                id="reg-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
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