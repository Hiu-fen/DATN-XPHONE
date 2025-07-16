import React from 'react';
import SendIcon from './icons/SendIcon';

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  onInputChange,
  onSendMessage,
  isLoading,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage(input.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-4 px-4 py-3 bg-gray-900 rounded-xl shadow-md border border-gray-700"
    >
      <input
        type="text"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="💬 Hỏi Xphone về điện thoại, đánh giá, khuyến mãi..."
        disabled={isLoading}
        className="flex-1 bg-gray-800 border-none rounded-full py-3 px-5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50"
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
        aria-label="Gửi tin nhắn"
      >
        <SendIcon className="h-5 w-5" />
      </button>
    </form>
  );
};

export default ChatInput;
