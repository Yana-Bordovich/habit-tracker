// src/components/HabitItem.tsx
import { Edit2, Trash2, Check, Flame } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useHabitStore, getCurrentStreak, Habit } from '../store/habitStore';
import EditHabitModal from './EditHabitModal';

// Определяем интерфейс Props явно
interface HabitItemProps {
  habit: Habit;
  onStreakMilestone: () => void;
}

export default function HabitItem({ habit, onStreakMilestone }: HabitItemProps) {
  const { toggleHabit, archiveHabit } = useHabitStore(); // archiveHabit вместо deleteHabit
  const [showEdit, setShowEdit] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = habit.completedDates.includes(today);
  const streak = getCurrentStreak(habit.completedDates);

  // Проверяем, достигли ли сегодня 7/14/21
  if (isCompletedToday && (streak === 7 || streak === 14 || streak === 21)) {
    setTimeout(() => onStreakMilestone(), 300);
  }

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayIndex = (date.getDay() + 6) % 7; // Понедельник = 0
      days.push({
        date: dateStr,
        completed: habit.completedDates.includes(dateStr),
        label: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][dayIndex],
        isToday: i === 0,
      });
    }
    return days;
  };

  const last7Days = useMemo(() => getLast7Days(), [habit.completedDates]);

  return (
    <>
      <div
        className={`p-6 rounded-2xl shadow-lg border transform transition-all hover:scale-[1.02] ${
          habit.color
        }/20 border-${habit.color.split('-')[1]}-600/30`}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">{habit.name}</h3>
            <p className="text-sm text-gray-400">{habit.description}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEdit(true)}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition"
              aria-label="Редактировать привычку"
            >
              <Edit2 className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={() => archiveHabit(habit.id)} // Архивируем, а не удаляем
              className="p-2 hover:bg-gray-700/50 rounded-lg transition"
              aria-label="Архивировать привычку"
            >
              <Trash2 className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Week Progress */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {last7Days.map((day) => (
            <div
              key={day.date}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg ${
                day.completed ? 'bg-green-500 text-white' : 'bg-gray-800/50 text-gray-400'
              } ${day.isToday ? 'ring-2 ring-brand-primary' : ''}`}
            >
              <span className="text-xs font-bold">{day.label}</span>
              <span className="text-xs">
                {new Date(day.date).toLocaleDateString('ru-RU', { day: 'numeric' })}
              </span>
            </div>
          ))}
        </div>

        {/* Streak */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Flame className="w-6 h-6 text-orange-400" />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{streak}</p>
            <p className="text-sm text-gray-600">дней подряд</p>
            {streak >= 21 && <p className="text-yellow-600 font-bold mt-1">★ В архиве!</p>}
          </div>
        </div>

        <button
          onClick={() => toggleHabit(habit.id)}
          className={`mt-6 w-full py-4 rounded-xl font-bold text-lg transition-all ${
            isCompletedToday ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
          aria-label={isCompletedToday ? 'Отменить выполнение сегодня' : 'Отметить сегодня'}
        >
          {isCompletedToday ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="w-6 h-6" /> Выполнено сегодня!
            </span>
          ) : (
            'Отметить сегодня'
          )}
        </button>
      </div>

      <EditHabitModal isOpen={showEdit} onClose={() => setShowEdit(false)} habit={habit} />
    </>
  );
}