
import React from 'react';
import BotIcon from './icons/BotIcon';

const Header: React.FC = () => {
  return (
    <header className="flex items-center p-4 border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-full">
            <BotIcon className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-white">Xphone</h1>
      </div>
    </header>
  );
};

export default Header;
