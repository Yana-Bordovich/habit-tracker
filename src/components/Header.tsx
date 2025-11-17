import React, { useState, useEffect } from 'react';
import { UsersIcon } from './icons/UsersIcon';

interface HeaderProps {
  level: number;
  xp: number;
  xpToNextLevel: number;
  avatarUrl?: string | null;
}

const Header: React.FC<HeaderProps> = ({ level, xp, xpToNextLevel, avatarUrl }) => {
  const [prevLevel, setPrevLevel] = useState(level);
  const [levelUpAnimation, setLevelUpAnimation] = useState(false);
  
  useEffect(() => {
    if (level > prevLevel) {
      setLevelUpAnimation(true);
      const timer = setTimeout(() => setLevelUpAnimation(false), 1000);
      setPrevLevel(level);
      return () => clearTimeout(timer);
    }
  }, [level, prevLevel]);

  const progressPercentage = xpToNextLevel > 0 ? (xp / xpToNextLevel) * 100 : 100;

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-700 themed-bg-surface themed-border">
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">
          Трекер Привычек
        </h1>
        <div className="flex items-center space-x-4 w-full sm:w-auto">
           {avatarUrl ? (
            <img src={avatarUrl} alt="User Avatar" className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-brand-secondary flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
          )}
          <div className="text-center">
            <span className={`text-3xl font-bold text-amber-400 ${levelUpAnimation ? 'animate-level-up' : ''}`}>
              {level}
            </span>
            <p className="text-xs text-gray-400 themed-text-secondary">УРОВЕНЬ</p>
          </div>
          <div className="w-full sm:w-48">
            <div className="flex justify-between text-xs mb-1 text-gray-300 themed-text-secondary">
              <span>XP: {xp} / {xpToNextLevel}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5 themed-input-bg">
              <div
                className="bg-gradient-to-r from-brand-secondary to-brand-accent h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;