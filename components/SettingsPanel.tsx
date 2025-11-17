import React from 'react';
import type { Theme, User } from '../types';

interface ProfilePanelProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  currentUser: User | null;
  onLogout: () => void;
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({ currentTheme, onThemeChange, currentUser, onLogout }) => {
  const themes: { id: Theme; label: string; }[] = [
    { id: 'dark', label: 'Тёмная' },
    { id: 'light', label: 'Светлая' },
    { id: 'blue', label: 'Синяя' },
  ];

  return (
    <div className="p-6 rounded-2xl border animate-fade-in themed-bg-surface themed-border">
      <h2 className="text-2xl font-bold mb-6 themed-text-primary">Профиль и Настройки</h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 themed-text-primary">Цветовая тема</h3>
        <div className="flex space-x-2 sm:space-x-4">
          {themes.map(theme => (
            <button
              key={theme.id}
              onClick={() => onThemeChange(theme.id)}
              className={`flex-1 sm:flex-none sm:px-6 py-3 text-sm font-semibold rounded-lg border-2 transition-colors ${
                currentTheme === theme.id 
                ? 'border-brand-primary bg-brand-primary/20 text-brand-primary' 
                : 'themed-border themed-text-secondary hover:border-brand-secondary'
              }`}
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3 themed-text-primary">Аккаунт</h3>
        <div className="p-4 rounded-lg themed-bg-surface-secondary flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-sm themed-text-secondary">
                Вы вошли как: <span className="font-bold themed-text-primary">{currentUser?.username ?? 'Гость'}</span>
            </p>
            <button
              onClick={onLogout}
              className="px-6 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white font-semibold transition"
            >
              Выйти
            </button>
        </div>
      </div>

    </div>
  );
};

export default ProfilePanel;