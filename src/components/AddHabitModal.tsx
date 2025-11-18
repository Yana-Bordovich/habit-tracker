import React, { useState } from 'react';
import type { HabitIcon } from './types';
import { BookOpenIcon, DumbbellIcon, WaterDropIcon, CodeIcon, MeditateIcon, RunIcon } from './icons/HabitIcons';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHabit: (name: string, icon: HabitIcon) => void;
}

// Fix: Replaced JSX.Element with React.ReactElement to resolve namespace error.
const icons: { name: HabitIcon, component: React.ReactElement }[] = [
  { name: 'book', component: <BookOpenIcon /> },
  { name: 'dumbbell', component: <DumbbellIcon /> },
  { name: 'water', component: <WaterDropIcon /> },
  { name: 'code', component: <CodeIcon /> },
  { name: 'meditate', component: <MeditateIcon /> },
  { name: 'run', component: <RunIcon /> },
];

const AddHabitModal: React.FC<AddHabitModalProps> = ({ isOpen, onClose, onAddHabit }) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<HabitIcon>('book');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddHabit(name.trim(), selectedIcon);
      setName('');
      setSelectedIcon('book');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8 themed-bg-surface-modal" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6 text-center themed-text-primary">Новая привычка</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="habit-name" className="block mb-2 text-sm font-medium themed-text-secondary">Название</label>
            <input
              type="text"
              id="habit-name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="text-sm rounded-lg focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5 themed-input-bg themed-text-primary"
              placeholder="Напр., Читать 30 минут"
              required
            />
          </div>
          <div className="mb-8">
            <label className="block mb-2 text-sm font-medium themed-text-secondary">Выберите иконку</label>
            <div className="grid grid-cols-6 gap-2">
              {icons.map(icon => (
                <button
                  key={icon.name}
                  type="button"
                  onClick={() => setSelectedIcon(icon.name)}
                  className={`p-3 rounded-lg border-2 transition-colors ${selectedIcon === icon.name ? 'border-brand-primary bg-brand-primary/20' : 'themed-border hover:border-brand-secondary'}`}
                >
                  {icon.component}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg themed-text-secondary hover:bg-gray-700 transition">Отмена</button>
            <button type="submit" className="px-6 py-2 rounded-lg bg-brand-primary hover:bg-brand-secondary text-white font-semibold transition">Добавить</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHabitModal;
