export type HabitIcon = 'book' | 'dumbbell' | 'water' | 'code' | 'meditate' | 'run';
export type Theme = 'dark' | 'light' | 'blue' | 'custom';
export type Tab = 'habits' | 'social' | 'profile' | 'admin'| 'communities';

export interface Community {
  id: number;
  name: string;
  description: string;
  category: string;
  members_count?: number;
  habits_count: number;
  created_at: string;
  is_member?: boolean;

}
export interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  goal: number;
  completed: number;
  streak: number;
  category: string;
  created_at: string;
  updated_at: string;
  completed_today?: boolean;
  icon?: HabitIcon;
  lastCompleted?: string;
}

export interface User {
  id: string;
  username: string;
  token: string;
  created_at?: string;
}
export interface User {
  id: string;
  username: string;
  token: string;
  created_at?: string;
}

export interface AppState {
  user: User;
  habits: any[];
  achievements: any[];
  communities: Community[];
  selectedHabit?: string;
  lastUpdated: string;
  
  // Добавленные свойства
  xp: number;
  level: number;
  theme: Theme;
  primaryColor: string;
  avatarUrl?: string;
}

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface CreateCommunityData {
  name: string;
  description: string;
  category: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

// === ДОБАВЬТЕ ЭТИ НОВЫЕ ТИПЫ ===

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  timestamp?: string;
}

export interface CommunityMember {
  id: string;
  username: string;
  join_date: string;
  role: 'member' | 'admin' | 'creator';
}

export interface CreateHabitData {
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  goal: number;
  category: string;
}

export interface UpdateHabitData {
  name?: string;
  description?: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  goal?: number;
  category?: string;
  completed?: number;
  streak?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UserStats {
  total_habits: number;
  completed_habits: number;
  current_streak: number;
  longest_streak: number;
  level: number;
  experience: number;
}
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
  unlocked_at?: string;
  // ДОБАВЬТЕ ЭТО СВОЙСТВО:
  check?: (state: AppState) => boolean;
}
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface ErrorState {
  message: string;
  code?: number;
  details?: any;
}