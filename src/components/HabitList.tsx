import React from 'react';
import type { Habit } from '../types';
import HabitItem from './HabitItem';

interface HabitListProps {
  habits: Habit[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  today: string; // YYYY-MM-DD
}

const HabitList: React.FC<HabitListProps> = ({ habits, onComplete, onDelete, today }) => {
  if (habits.length === 0) {
    return (
      <div className="bg-gray-800/50 p-8 rounded-2xl text-center border themed-bg-surface themed-border">
        <h2 className="text-xl font-semibold mb-2 themed-text-primary">Начните свой путь!</h2>
        <p className="themed-text-secondary">У вас пока нет привычек. Нажмите кнопку ниже, чтобы добавить первую.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 themed-text-primary">Мои Привычки</h2>
      {habits.map(habit => (
        <HabitItem 
          key={habit.id} 
          habit={habit} 
          onComplete={onComplete} 
          onDelete={onDelete} 
          isCompletedToday={habit.lastCompleted === today}
        />
      ))}
    </div>
  );
};

export default HabitList;
