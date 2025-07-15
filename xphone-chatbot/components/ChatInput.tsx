
import React from 'react';
import SendIcon from './icons/SendIcon';

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ input, onInputChange, onSendMessage, isLoading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage(input);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <input
        type="text"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="Hỏi Xphone về bất kỳ điện thoại nào..."
        disabled={isLoading}
        className="flex-1 bg-gray-800 border border-gray-600 rounded-full py-3 px-5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 disabled:opacity-50"
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full p-3 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        aria-label="Send message"
      >
        <SendIcon className="h-6 w-6" />
      </button>
    </form>
  );
};

export default ChatInput;
