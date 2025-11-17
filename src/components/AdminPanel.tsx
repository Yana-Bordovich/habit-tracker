import React from 'react';
import { ShieldIcon } from './icons/ShieldIcon';

interface AdminPanelProps {
  dateOverride: string | null;
  setDateOverride: (date: string | null) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ dateOverride, setDateOverride }) => {

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateOverride(e.target.value || null);
  };
  
  const handleResetDate = () => {
    setDateOverride(null);
  };
  
  // Format date for input type="date" which requires YYYY-MM-DD
  const dateValue = dateOverride ? dateOverride.split('T')[0] : new Date().toISOString().split('T')[0];

  return (
    <div className="p-6 rounded-2xl border animate-fade-in themed-bg-surface themed-border">
      <div className="flex items-center mb-6">
        <ShieldIcon className="w-8 h-8 mr-3 text-brand-accent"/>
        <h2 className="text-2xl font-bold themed-text-primary">Панель Администратора</h2>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold themed-text-primary">Управление временем</h3>
        <p className="themed-text-secondary text-sm">
          Эта функция позволяет вам изменить текущую дату в приложении для тестирования серий привычек и достижений.
        </p>
        <div className="p-4 rounded-lg themed-bg-surface-secondary flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-grow w-full sm:w-auto">
                <label htmlFor="date-override" className="block text-sm font-medium themed-text-secondary mb-1">
                    Текущая дата приложения
                </label>
                <input
                    type="date"
                    id="date-override"
                    value={dateValue}
                    onChange={handleDateChange}
                    className="text-sm rounded-lg focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5 themed-input-bg themed-text-primary"
                />
            </div>
            <button 
                onClick={handleResetDate}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg themed-bg-surface hover:bg-gray-700/80 themed-text-primary font-semibold transition border themed-border"
            >
                Сбросить на сегодня
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;