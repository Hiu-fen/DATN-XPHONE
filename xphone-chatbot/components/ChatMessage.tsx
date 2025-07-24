
import React from 'react';
import { type Message, Sender } from '../types';
import BotIcon from './icons/BotIcon';
import UserIcon from './icons/UserIcon';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.sender === Sender.BOT;

  return (
    <div className={`flex items-start gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className="bg-blue-600 p-2 rounded-full flex-shrink-0">
          <BotIcon className="h-6 w-6 text-white" />
        </div>
      )}
      <div
        className={`rounded-2xl p-4 max-w-lg md:max-w-xl lg:max-w-2xl break-words ${
          isBot
      ? 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
      : 'bg-blue-100 text-blue-800 rounded-br-none'
  }`}
      >
        {message.text || <span className="animate-pulse">...</span>}
      </div>
       {!isBot && (
        <div className="bg-white-700 p-2 rounded-full flex-shrink-0">
          <UserIcon className="h-6 w-6 text-gray-300" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
