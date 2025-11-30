import { useState } from 'react';
import Confetti from 'react-confetti';
import { Plus, Trophy, Flame, Archive } from 'lucide-react';
import { useHabitStore, getCurrentStreak, Habit } from './store/habitStore';
import AddHabitModal from './components/AddHabitModal';
import HabitItem from './components/HabitItem';

function App() {
  const { habits } = useHabitStore();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'archive'>('all');
  const [confetti, setConfetti] = useState(false);

  const activeHabits = habits.filter(h => getCurrentStreak(h.completedDates) < 21);
  const archivedHabits = habits.filter(h => getCurrentStreak(h.completedDates) >= 21);

  const totalCompletedToday = habits.filter(h =>
    h.completedDates.includes(new Date().toISOString().split('T')[0])
  ).length;

  const maxStreak = Math.max(...habits.map(h => getCurrentStreak(h.completedDates)), 0);

  const displayedHabits = filter === 'all' ? habits :
                          filter === 'active' ? activeHabits : archivedHabits;

  return (
    <>
      {confetti && <Confetti recycle={false} numberOfPieces={300} onConfettiComplete={() => setConfetti(false)} />}
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto p-4">
          {/* Header */}
          <div className="text-center py-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Трекер привычек</h1>
            <p className="text-gray-600">21 день — и привычка сформирована!</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-800">{totalCompletedToday}</p>
              <p className="text-sm text-gray-600">Сегодня</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-800">{maxStreak}</p>
              <p className="text-sm text-gray-600">Лучший стрик</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <Archive className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-800">{archivedHabits.length}</p>
              <p className="text-sm text-gray-600">В архиве</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex justify-center gap-4 mb-6">
            {(['all', 'active', 'archive'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-full font-medium transition ${
                  filter === f
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {f === 'all' && 'Все'}
                {f === 'active' && 'Активные'}
                {f === 'archive' && 'Архив'}
              </button>
            ))}
          </div>

          {/* Habits List */}
          <div className="space-y-4 mb-24">
            {displayedHabits.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
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