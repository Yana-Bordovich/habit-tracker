import React from 'react';
import { UsersIcon } from './icons/UsersIcon';

const SocialPanel: React.FC = () => {
  return (
    <div className="p-8 rounded-2xl text-center border animate-fade-in themed-bg-surface themed-border">
        <div className="flex justify-center mb-4">
            <div className="p-4 bg-brand-primary/20 rounded-full text-brand-primary">
                <UsersIcon className="w-12 h-12" />
            </div>
        </div>
      
    </div>
  );
};

export default SocialPanel;