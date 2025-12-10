import { useState, useEffect, useMemo } from 'react';  // Добавлен useMemo для оптимизации
import Confetti from 'react-confetti';
import { Plus, Trophy, Flame, Archive, Check } from 'lucide-react';  // Добавлен Check
import { useHabitStore, getCurrentStreak, Habit } from './store/habitStore';
import AddHabitModal from './components/AddHabitModal';
import HabitItem from './components/HabitItem';

function App() {
  const { habits } = useHabitStore();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'archive'>('all');
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {  // Авто-выключение confetti
    if (confetti) {
      const timer = setTimeout(() => setConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [confetti]);

  // Мемоизация фильтров для оптимизации (пересчитываются только при изменении habits)
const activeHabits = useMemo(() => habits.filter(h => !h.isArchived && getCurrentStreak(h.completedDates) < 21), [habits]);
  const archivedHabits = useMemo(() => habits.filter(h => h.isArchived || getCurrentStreak(h.completedDates) >= 21), [habits]);

  const totalCompletedToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return habits.filter(h => h.completedDates.includes(today)).length;
  }, [habits]);

  const maxStreak = useMemo(() => {
    if (habits.length === 0) return 0;  // Fallback для пустого массива
    return Math.max(...habits.map(h => getCurrentStreak(h.completedDates)));
  }, [habits]);

  const displayedHabits = useMemo(() => {
    switch (filter) {
      case 'active': return activeHabits;
      case 'archive': return archivedHabits;
      default: return habits;
    }
  }, [filter, activeHabits, archivedHabits, habits]);

  return (
    <>
      {confetti && <Confetti recycle={false} numberOfPieces={200} />}
      <div className="min-h-screen bg-gray-900 text-white p-8 font-sans theme-dark">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-brand-primary to-brand-accent text-transparent bg-clip-text">
              Трекер привычек
            </h1>
            <p className="text-gray-400">Каждый день на шаг ближе к цели. 21 день — и привычка сформирована!</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 flex items-center justify-center gap-3">
              <Trophy className="w-8 h-8 text-amber-400" />
              <div>
                <p className="text-2xl font-bold">{habits.length}</p>
                <p className="text-sm text-gray-400">Всего привычек</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 flex items-center justify-center gap-3">
              <Check className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold">{totalCompletedToday}</p>
                <p className="text-sm text-gray-400">Сегодня выполнено</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 flex items-center justify-center gap-3">
              <Flame className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold">{maxStreak}</p>
                <p className="text-sm text-gray-400">Лучший стрик</p>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg ${filter === 'all' ? 'bg-brand-primary text-white' : 'bg-gray-800/50 text-gray-400'} transition`}
              aria-label="Показать все привычки"
              role="button"  // Добавлено для accessibility
            >
              Все ({habits.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-6 py-2 rounded-lg ${filter === 'active' ? 'bg-brand-primary text-white' : 'bg-gray-800/50 text-gray-400'} transition`}
              aria-label="Показать активные привычки"
              role="button"
            >
              Активные ({activeHabits.length})
            </button>
            <button
              onClick={() => setFilter('archive')}
              className={`px-6 py-2 rounded-lg ${filter === 'archive' ? 'bg-brand-primary text-white' : 'bg-gray-800/50 text-gray-400'} transition`}
              aria-label="Показать архивные привычки"
              role="button"
            >
              Архив ({archivedHabits.length})
            </button>
          </div>

          {/* Habits List */}
          <div className="space-y-6">
            {displayedHabits.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
                <p className="text-gray-400 text-lg">
                  {filter === 'all' ? 'Пока нет привычек. Добавьте первую!' : 'Здесь пусто'}
                </p>
              </div>
            ) : (
              displayedHabits.map(habit => (
                <HabitItem
                  key={habit.id}
                  habit={habit}
                  onStreakMilestone={() => setConfetti(true)}
                />
              ))
            )}
          </div>

          {/* Add Button */}
          <button
            onClick={() => setShowModal(true)}
            className="fixed bottom-8 right-8 bg-purple-600 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:bg-purple-700 transition transform hover:scale-110"
            aria-label="Добавить новую привычку"
            role="button"  // Добавлено
          >
            <Plus className="w-8 h-8" />
          </button>

          <AddHabitModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </div>
      </div>
    </>
  );
}

export default App;