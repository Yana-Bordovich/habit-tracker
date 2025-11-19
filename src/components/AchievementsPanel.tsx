import React from 'react';
import type { Achievement } from '../types';
import { TrophyIcon } from './icons/TrophyIcon';
import { LockIcon } from './icons/LockIcon';


interface AchievementsPanelProps {
  achievements: Achievement[];
}

const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ achievements }) => {
  return (
    <div className="p-6 rounded-2xl border animate-fade-in themed-bg-surface themed-border">
      <h2 className="text-2xl font-bold mb-4 themed-text-primary">Достижения</h2>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {achievements.map(ach => (
          <div
            key={ach.id}
            className={`flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 ${ach.unlocked ? 'bg-amber-500/10' : 'themed-bg-surface-secondary'}`}
          >
            <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${ach.unlocked ? 'bg-amber-500 text-white' : 'bg-gray-600 text-gray-400'}`}>
              {ach.unlocked ? <TrophyIcon className="w-6 h-6" /> : <LockIcon className="w-6 h-6" />}
            </div>
            <div>
              <h3 className={`font-semibold ${ach.unlocked ? 'text-amber-400' : 'themed-text-primary'}`}>
                {ach.name}
              </h3>
              <p className="text-sm themed-text-secondary">{ach.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsPanel;
