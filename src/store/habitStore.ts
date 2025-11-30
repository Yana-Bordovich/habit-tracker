import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Habit = {
  id: string;
  name: string;
  description: string;
  color: string;
  completedDates: string[]; // ISO строки дат
  createdAt: string;
};

type HabitStore = {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'completedDates' | 'createdAt'>) => void;
  toggleHabit: (id: string, date?: string) => void;
  editHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
};

const today = new Date().toISOString().split('T')[0];

export const useHabitStore = create<HabitStore>()(
  persist(
    (set) => ({
      habits: [],
      addHabit: (habit) =>
        set((state) => ({
          habits: [
            ...state.habits,
            {
              ...habit,
              id: Date.now().toString(),
              completedDates: [],
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      toggleHabit: (id, date = today) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id
              ? {
                  ...h,
                  completedDates: h.completedDates.includes(date)
                    ? h.completedDates.filter((d) => d !== date)
                    : [...h.completedDates, date],
                }
              : h
          ),
        })),
      editHabit: (id, updates) =>
        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        })),
      deleteHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        })),
    }),
    { name: 'habit-storage' }
  )
);

// Вспомогательная функция для расчёта текущего стриков
export const getCurrentStreak = (completedDates: string[]): number => {
  if (completedDates.length === 0) return 0;
  const sorted = [...completedDates].sort().reverse();
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < sorted.length; i++) {
    const date = new Date(sorted[i]);
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    if (date.toISOString().split('T')[0] === expected.toISOString().split('T')[0]) {
      streak++;
    } else if (i === 0) {
      return 0;
    } else {
      break;
    }
  }
  return streak;
};