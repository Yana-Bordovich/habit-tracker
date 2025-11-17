import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { AppState, HabitIcon, Theme, Tab, User } from './types';
import { XP_PER_HABIT, LEVEL_THRESHOLDS, INITIAL_ACHIEVEMENTS } from './constants';
import * as api from './api';
import Header from './components/Header';
import HabitList from './components/HabitList';
import AddHabitModal from './components/AddHabitModal';
import AchievementsPanel from './components/AchievementsPanel';
import Nav from './components/Nav';
import ProfilePanel from './components/SettingsPanel';
import SocialPanel from './components/SocialPanel';
import LoginScreen from './components/LoginScreen';
import RegistrationScreen from './components/RegistrationScreen';
import AdminPanel from './components/AdminPanel';
import Communities from './components/Communities';
import { adjustHexColor, hexToHsl, hslToRgb, rgbToHex } from './utils/color';

// Helper to get date string (YYYY-MM-DD)
const toISODateString = (date: Date) => date.toISOString().split('T')[0];

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [authStatus, setAuthStatus] = useState<'login' | 'register' | 'app'>('login');
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const userJson = sessionStorage.getItem('currentUser');
    try {
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  });

  const [globalDateOverride, setGlobalDateOverride] = useState<string | null>(null);

  const [state, setState] = useState<AppState>({
    habits: [],
    xp: 0,
    level: 1,
    achievements: INITIAL_ACHIEVEMENTS,
    theme: 'dark',
    primaryColor: '#4F46E5',
    avatarUrl: undefined
  });
  
  const [isLoading, setIsLoading] = useState(true);

  // State for the active tab, initialized from sessionStorage
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const savedTab = sessionStorage.getItem('activeTab');
    return (savedTab as Tab) || 'habits';
  });

  const debounceTimeoutRef = useRef<number | null>(null);

  // Effect to save the active tab to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    document.body.className = `theme-${state.theme}`;
    const root = document.documentElement;
    
    if (state.primaryColor) {
        const primary = state.primaryColor;
        const secondary = adjustHexColor(primary, 20);
        const accent = adjustHexColor(primary, -10);
        const primaryHsl = hexToHsl(primary);

        root.style.setProperty('--brand-primary', primary);
        root.style.setProperty('--brand-secondary', secondary);
        root.style.setProperty('--brand-accent', accent);
        
        if (primaryHsl) {
             root.style.setProperty('--brand-primary-hsl', `${primaryHsl.h} ${primaryHsl.s * 100}% ${primaryHsl.l * 100}%`);

             if (state.theme === 'custom') {
                // Calculate custom theme colors from primary color
                const bgHsl = { h: primaryHsl.h, s: 0.15, l: 0.1 };
                const surfaceHsl = { ...bgHsl, l: 0.15 };
                const surfaceSecondaryHsl = { ...bgHsl, l: 0.18 };
                const surfaceModalHsl = { ...bgHsl, l: 0.12 };
                const textPrimaryHsl = { h: primaryHsl.h, s: 0.1, l: 0.95 };
                const textSecondaryHsl = { h: primaryHsl.h, s: 0.08, l: 0.65 };
                const borderHsl = { ...bgHsl, l: 0.25 };

                root.style.setProperty('--custom-bg', rgbToHex(hslToRgb(bgHsl)));
                root.style.setProperty('--custom-surface', rgbToHex(hslToRgb(surfaceHsl)));
                root.style.setProperty('--custom-surface-secondary', rgbToHex(hslToRgb(surfaceSecondaryHsl)));
                root.style.setProperty('--custom-surface-modal', rgbToHex(hslToRgb(surfaceModalHsl)));
                root.style.setProperty('--custom-text-primary', rgbToHex(hslToRgb(textPrimaryHsl)));
                root.style.setProperty('--custom-text-secondary', rgbToHex(hslToRgb(textSecondaryHsl)));
                root.style.setProperty('--custom-border', rgbToHex(hslToRgb(borderHsl)));
             }
        }
    }
  }, [state.theme, state.primaryColor]);
  
  useEffect(() => {
    if (currentUser) {
      setAuthStatus('app');
      setIsLoading(true);

      api.getState(currentUser.id)
        .then(fetchedState => {
          setState(prevState => ({
            ...prevState,
            ...fetchedState,
          }));
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      setAuthStatus('login');
      setIsLoading(false);
    }
  }, [currentUser]);

  // FIX: Re-introduced debounced state saving for robustness and performance.
  useEffect(() => {
    if (isLoading || !currentUser) {
      return;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = window.setTimeout(() => {
      api.saveState(currentUser.id, state).catch(err => {
        console.error("Failed to save state:", err);
      });
    }, 800); // Wait 800ms after the last change to save

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [state, currentUser, isLoading]);

  
  const getEffectiveDate = useCallback(() => {
    const date = globalDateOverride ? new Date(globalDateOverride) : new Date();
    if (isNaN(date.getTime())) {
      return new Date();
    }
    return date;
  }, [globalDateOverride]);

  useEffect(() => {
    if (currentUser?.username !== 'admin' && activeTab === 'admin') {
        setActiveTab('habits');
    }
  }, [currentUser, activeTab]);

  const levelUp = useCallback((currentXp: number, currentLevel: number): { newLevel: number, leveledUp: boolean } => {
    const nextLevelXp = LEVEL_THRESHOLDS[currentLevel];
    if (nextLevelXp !== undefined && currentXp >= nextLevelXp) {
        return { newLevel: currentLevel + 1, leveledUp: true };
    }
    return { newLevel: currentLevel, leveledUp: false };
  }, []);

  const checkAchievements = useCallback((currentState: AppState): AppState => {
    let changed = false;
    const updatedAchievements = currentState.achievements.map(ach => {
      if (!ach.unlocked && ach.check(currentState)) {
        changed = true;
        return { ...ach, unlocked: true };
      }
      return ach;
    });

    if (changed) {
      return { ...currentState, achievements: updatedAchievements };
    }
    return currentState;
  }, []);
  
  const handleThemeChange = (theme: Theme) => {
    setState(prevState => ({ ...prevState, theme }));
  };

  const handlePrimaryColorChange = (color: string) => {
    setState(prevState => ({ ...prevState, primaryColor: color, theme: 'custom' }));
  };

  const handleAvatarChange = (avatarUrl: string) => {
    setState(prevState => ({ ...prevState, avatarUrl }));
  };

  const addHabit = (name: string, icon: HabitIcon) => {
    setState(prevState => {
      const newState: AppState = {
        ...prevState,
        habits: [
          ...prevState.habits,
          { id: crypto.randomUUID(), name, icon, streak: 0, lastCompleted: null },
        ],
      };
      return checkAchievements(newState);
    });
    setIsModalOpen(false);
  };

  const deleteHabit = (id: string) => {
    setState(prevState => ({
      ...prevState,
      habits: prevState.habits.filter(habit => habit.id !== id),
    }));
  };

  const completeHabit = (id: string) => {
    setState(prevState => {
      const today = toISODateString(getEffectiveDate());
      
      const yesterdayDate = getEffectiveDate();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = toISODateString(yesterdayDate);

      let stateAfterHabitUpdate: AppState = { ...prevState };

      const newHabits = prevState.habits.map(habit => {
        if (habit.id === id && habit.lastCompleted !== today) {
          const newStreak = habit.lastCompleted === yesterday ? habit.streak + 1 : 1;
          stateAfterHabitUpdate.xp += XP_PER_HABIT;
          return { ...habit, streak: newStreak, lastCompleted: today };
        }
        return habit;
      });

      stateAfterHabitUpdate.habits = newHabits;
      
      const { newLevel } = levelUp(stateAfterHabitUpdate.xp, stateAfterHabitUpdate.level);
      stateAfterHabitUpdate.level = newLevel;

      return checkAchievements(stateAfterHabitUpdate);
    });
  };
  
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    setAuthStatus('app');
    setActiveTab('habits');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('activeTab');
    setAuthStatus('login');
    setActiveTab('habits');
  };

  const currentLevelXp = useMemo(() => LEVEL_THRESHOLDS[state.level - 1] ?? 0, [state.level]);
  const nextLevelXp = useMemo(() => LEVEL_THRESHOLDS[state.level] ?? Infinity, [state.level]);
  const xpForCurrentLevel = state.xp - currentLevelXp;
  const xpToNextLevel = nextLevelXp - currentLevelXp;
  
  const renderContent = () => {
    if (isLoading) {
        return <div className="text-center p-10 themed-text-primary">Загрузка данных...</div>;
    }
    switch (activeTab) {
      case 'habits':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <HabitList 
                habits={state.habits} 
                onComplete={completeHabit} 
                onDelete={deleteHabit}
                today={toISODateString(getEffectiveDate())}
              />
               <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full mt-4 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-accent">
                + Добавить новую привычку
              </button>
            </div>
            <AchievementsPanel achievements={state.achievements} />
          </div>
        );
      case 'social':
        return <SocialPanel />;
      case 'communities':
        return <Communities currentUser={currentUser} />; // Передаем currentUser в компонент
      case 'profile':
        return <ProfilePanel 
                  appState={state}
                  onThemeChange={handleThemeChange} 
                  currentUser={currentUser}
                  onLogout={handleLogout}
                  onPrimaryColorChange={handlePrimaryColorChange}
                  onAvatarChange={handleAvatarChange}
               />;
      case 'admin':
        return currentUser?.username === 'admin' ? <AdminPanel dateOverride={globalDateOverride} setDateOverride={setGlobalDateOverride} /> : null;
      default:
        return null;
    }
  };

  if (authStatus === 'login') {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} onNavigateToRegister={() => setAuthStatus('register')} />;
  }
  
  if (authStatus === 'register') {
    return <RegistrationScreen onRegistrationSuccess={handleLoginSuccess} onNavigateToLogin={() => setAuthStatus('login')} />;
  }

  return (
    <div className="min-h-screen font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Header 
          level={state.level} 
          xp={xpForCurrentLevel}
          xpToNextLevel={xpToNextLevel}
          avatarUrl={state.avatarUrl}
        />
        <main className="mt-8">
          <Nav activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={currentUser?.username === 'admin'} />
          <div className="mt-6">
            {renderContent()}
          </div>
        </main>
      </div>

      <AddHabitModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddHabit={addHabit}
      />
    </div>
  );
}

export default App;