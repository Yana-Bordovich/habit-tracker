export type HabitIcon = 'book' | 'dumbbell' | 'water' | 'code' | 'meditate' | 'run';

export type Theme = 'dark' | 'light' | 'blue' | 'custom';

export type Tab = 'habits' | 'social' | 'profile' | 'admin'| 'communities';


// Добавьте интерфейс для сообществ
export interface Community {
  id: number;
  name: string;
  description: string;
  category: string;
  members_count: number;
  habits_count: number;
  joined_at?: string;
}
export interface Habit {
  id: string;
  name: string;
  icon: HabitIcon;
  streak: number;
  lastCompleted: string | null; // ISO date string
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  check: (state: AppState) => boolean;
}

export interface AppState {
  habits: Habit[];
  xp: number;
  level: number;
  achievements: Achievement[];
  theme: Theme;
  primaryColor?: string;
  avatarUrl?: string;
}

export interface User {
  id: string;
  username: string;
}