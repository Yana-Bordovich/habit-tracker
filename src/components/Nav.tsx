import React from 'react';
import type { Tab } from '../types';
import { HomeIcon } from './icons/HomeIcon';
import { UsersIcon } from './icons/UsersIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { ShieldIcon } from './icons/ShieldIcon';
import { CommunityIcon } from './icons/CommunityIcon';

interface NavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isAdmin: boolean;
}

const Nav: React.FC<NavProps> = ({ activeTab, setActiveTab, isAdmin }) => {
  const baseNavItems = [
    { id: 'habits', label: 'Привычки', icon: <HomeIcon className="w-5 h-5" /> },
    { id: 'communities', label: 'Сообщества', icon: <CommunityIcon className="w-5 h-5" /> },
    { id: 'social', label: 'Сообщество', icon: <UsersIcon className="w-5 h-5" /> },
    { id: 'profile', label: 'Профиль', icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  const adminNavItem = { id: 'admin', label: 'Админ', icon: <ShieldIcon className="w-5 h-5" /> };

  const navItems = isAdmin ? [...baseNavItems, adminNavItem] : baseNavItems;

  return (
    <nav className="p-2 rounded-xl themed-bg-surface themed-border border">
      <ul className="flex justify-around items-center">
        {navItems.map(item => (
          <li key={item.id} className="flex-1">
            <button
              onClick={() => setActiveTab(item.id as Tab)}
              className={`w-full flex flex-col sm:flex-row items-center justify-center space-x-0 sm:space-x-2 p-2 rounded-lg transition-colors duration-200 ${
                activeTab === item.id 
                ? 'bg-brand-primary/20 text-brand-primary' 
                : 'themed-text-secondary hover:bg-brand-primary/10'
              }`}
            >
              {item.icon}
              <span className="text-sm font-medium mt-1 sm:mt-0">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Nav;