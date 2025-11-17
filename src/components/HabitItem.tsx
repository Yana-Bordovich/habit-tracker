import React from 'react';
import type { Habit } from '../types';
import { BookOpenIcon, DumbbellIcon, WaterDropIcon, CodeIcon, MeditateIcon, RunIcon } from './icons/HabitIcons';
import { FlameIcon } from './icons/FlameIcon';
import { CheckIcon } from './icons/CheckIcon';
import { TrashIcon } from './icons/TrashIcon';

interface HabitItemProps {
  habit: Habit;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  isCompletedToday: boolean;
}

const iconMap = {
  book: <BookOpenIcon className="w-8 h-8" />,
  dumbbell: <DumbbellIcon className="w-8 h-8" />,
  water: <WaterDropIcon className="w-8 h-8" />,
  code: <CodeIcon className="w-8 h-8" />,
  meditate: <MeditateIcon className="w-8 h-8" />,
  run: <RunIcon className="w-8 h-8" />,
};

const HabitItem: React.FC<HabitItemProps> = ({ habit, onComplete, onDelete, isCompletedToday }) => {
  
  return (
    <div className={`p-4 rounded-xl shadow-md flex items-center justify-between transition-all duration-300 border-l-4 themed-bg-surface ${isCompletedToday ? 'border-green-500' : 'border-brand-primary'}`}>
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${isCompletedToday ? 'bg-green-500/20 text-green-400' : 'bg-brand-primary/20 text-brand-primary'}`}>
          {iconMap[habit.icon]}
        </div>
        <div>
          <p className="font-semibold text-lg themed-text-primary">{habit.name}</p>
          <div className="flex items-center text-sm text-amber-400 mt-1">
            <FlameIcon className="w-4 h-4 mr-1" />
            <span>Серия: {habit.streak} {habit.streak > 0 ? 'д.' : ''}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onComplete(habit.id)}
          disabled={isCompletedToday}
          className={`p-2 rounded-full transition duration-200 ease-in-out ${
            isCompletedToday 
              ? 'bg-green-600 text-white cursor-not-allowed' 
              : 'bg-brand-secondary hover:bg-brand-accent text-white transform hover:scale-110'
          }`}
          aria-label={`Complete ${habit.name}`}
        >
          <CheckIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDelete(habit.id)}
          className="p-2 rounded-full text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition duration-200"
          aria-label={`Delete ${habit.name}`}
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default HabitItem;
