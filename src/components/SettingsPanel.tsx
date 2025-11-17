import React, { useRef } from 'react';
import type { AppState, Theme, User } from '../types';
import ColorPicker from './ColorPicker';

interface ProfilePanelProps {
  appState: AppState;
  onThemeChange: (theme: Theme) => void;
  currentUser: User | null;
  onLogout: () => void;
  onPrimaryColorChange: (color: string) => void;
  onAvatarChange: (dataUrl: string) => void;
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({ appState, onThemeChange, currentUser, onLogout, onPrimaryColorChange, onAvatarChange }) => {
  const { theme: currentTheme, primaryColor } = appState;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const themes: { id: Theme; label: string; }[] = [
    { id: 'dark', label: 'Тёмная' },
    { id: 'light', label: 'Светлая' },
    { id: 'blue', label: 'Синяя' },
    { id: 'custom', label: 'Своя' },
  ];

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onAvatarChange(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 rounded-2xl border animate-fade-in themed-bg-surface themed-border space-y-8">
      <h2 className="text-2xl font-bold themed-text-primary">Профиль и Настройки</h2>
      
       <div>
        <h3 className="text-lg font-semibold mb-3 themed-text-primary">Аватар</h3>
        <div className="flex items-center gap-4">
          <img 
            src={appState.avatarUrl || `https://api.dicebear.com/8.x/bottts/svg?seed=${currentUser?.username}`} 
            alt="Avatar" 
            className="w-20 h-20 rounded-full object-cover bg-gray-700"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2 rounded-lg themed-bg-surface-secondary hover:bg-gray-700/80 themed-text-primary font-semibold transition border themed-border"
          >
            Сменить фото
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3 themed-text-primary">Цветовая тема</h3>
        <div className="flex space-x-2 sm:space-x-4 mb-4">
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

        {currentTheme === 'custom' && (
          <div className="p-4 rounded-lg themed-bg-surface-secondary animate-fade-in">
             <h4 className="text-md font-semibold mb-3 themed-text-primary">Основной цвет темы</h4>
            <ColorPicker 
              color={primaryColor || '#4F46E5'} 
              onChange={onPrimaryColorChange} 
            />
          </div>
        )}
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
