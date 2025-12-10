import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Habit = {
  id: string;
  name: string;
  description: string;
  color: string;
  completedDates: string[]; // ISO строки дат
  createdAt: string;
  isArchived: boolean;  // Добавлено
};

type HabitStore = {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'completedDates' | 'createdAt' | 'isArchived'>) => void;
  toggleHabit: (id: string, date?: string) => void;
  editHabit: (id: string, updates: Partial<Habit>) => void;
  archiveHabit: (id: string) => void;  // Изменено с deleteHabit
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
              isArchived: false,  // Добавлено
            },
          ],
        })),
      toggleHabit: (id, date = today) => {
        if (new Date(date) > new Date()) return;
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id
              ? {
                  ...h,
                  completedDates: h.completedDates.includes(date)
                    ? h.completedDates.filter((d) => d !== date)
                    : [...h.completedDates, date].sort(),
                }
              : h
          ),
        }));
      },
      editHabit: (id, updates) =>
        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        })),
      archiveHabit: (id) =>  // Изменено: архивируем вместо удаления
        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? { ...h, isArchived: true } : h)),
        })),
    }),
    { name: 'habit-storage' }
  )
);

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