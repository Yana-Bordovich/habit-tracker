import { Edit2, Trash2, Check, Flame } from 'lucide-react';
import { useState } from 'react';
import { useHabitStore, getCurrentStreak, Habit } from '../store/habitStore';
import EditHabitModal from './EditHabitModal';

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

interface Props {
  habit: Habit;
  onStreakMilestone: () => void;
}

export default function HabitItem({ habit, onStreakMilestone }: Props) {
  const { toggleHabit, deleteHabit } = useHabitStore();
  const [showEdit, setShowEdit] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = habit.completedDates.includes(today);
  const streak = getCurrentStreak(habit.completedDates);

  // Проверяем, достигли ли сегодня 7/14/21
  if (isCompletedToday && (streak === 7 || streak === 14 || streak === 21)) {
    setTimeout(() => onStreakMilestone(), 300);
  }

  const getLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const last7 = getLast7Days();

  return (
    <>
      <div className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all ${streak >= 21 ? 'ring-4 ring-yellow-400' : ''}`}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800">{habit.name}</h3>
              {habit.description && <p className="text-gray-600 text-sm mt-1">{habit.description}</p>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEdit(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Edit2 className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => deleteHabit(habit.id)}
                className="p-2 hover:bg-red-100 rounded-lg transition"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {last7.map((date, i) => {
                const completed = habit.completedDates.includes(date);
                const isToday = date === today;
                return (
                  <div
                    key={date}
                    className={`w-10 h-12 rounded-lg flex flex-col items-center justify-center transition-all ${
                      completed
                        ? 'bg-purple-600 text-white'
                        : isToday
                        ? 'bg-purple-200'
                        : 'bg-gray-100'
                    }`}
                  >
                    <span className="text-xs font-medium">{weekDays[(new Date(date).getDay() + 6) % 7]}</span>
                    <span className="text-xs">{new Date(date).getDate()}</span>
                  </div>
                );
              })}
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2">
                <Flame className={`w-8 h-8 ${streak > 0 ? 'text-orange-500' : 'text-gray-300'}`} />
                <span className="text-3xl font-bold text-gray-800">{streak}</span>
              </div>
              <p className="text-sm text-gray-600">дней подряд</p>
              {streak >= 21 && <p className="text-yellow-600 font-bold mt-1">★ В архиве!</p>}
            </div>
          </div>

          <button
            onClick={() => toggleHabit(habit.id)}
            className={`mt-6 w-full py-4 rounded-xl font-bold text-lg transition-all ${
              isCompletedToday
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
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
      </div>

      <EditHabitModal isOpen={showEdit} onClose={() => setShowEdit(false)} habit={habit} />
    </>
  );
}