import type { Achievement } from ./types';

export const XP_PER_HABIT = 15;
export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 1750, 2500, 5000, 10000];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'FIRST_STEP',
    name: 'Первый шаг',
    description: 'Выполните привычку в первый раз',
    unlocked: false,
    check: (state) => state.habits.some(h => h.streak > 0),
  },
  {
    id: 'STREAK_3',
    name: 'Начало положено',
    description: 'Поддерживайте серию в 3 дня для любой привычки',
    unlocked: false,
    check: (state) => state.habits.some(h => h.streak >= 3),
  },
  {
    id: 'STREAK_7',
    name: 'Неделя огня',
    description: 'Поддерживайте серию в 7 дней для любой привычки',
    unlocked: false,
    check: (state) => state.habits.some(h => h.streak >= 7),
  },
  {
    id: 'STREAK_10',
    name: 'Упорство',
    description: 'Поддерживайте серию в 10 дней для любой привычки',
    unlocked: false,
    check: (state) => state.habits.some(h => h.streak >= 10),
  },
  {
    id: 'STREAK_30',
    name: 'Мастер привычек',
    description: 'Поддерживайте серию в 30 дней для любой привычки',
    unlocked: false,
    check: (state) => state.habits.some(h => h.streak >= 30),
  },
  {
    id: 'LEVEL_3',
    name: 'Новичок',
    description: 'Достигните 3-го уровня',
    unlocked: false,
    check: (state) => state.level >= 3,
  },
  {
    id: 'LEVEL_5',
    name: 'Ученик',
    description: 'Достигните 5-го уровня',
    unlocked: false,
    check: (state) => state.level >= 5,
  },
  {
    id: 'LEVEL_10',
    name: 'Эксперт',
    description: 'Достигните 10-го уровня',
    unlocked: false,
    check: (state) => state.level >= 10,
  },
  {
    id: 'FIVE_HABITS',
    name: 'Многозадачность',
    description: 'Создайте 5 привычек',
    unlocked: false,
    check: (state) => state.habits.length >= 5,
  },
];