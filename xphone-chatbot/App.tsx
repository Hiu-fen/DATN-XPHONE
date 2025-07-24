
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { type Message, Sender } from './types';
import { type Chat } from "@google/genai";
import { createChatSession } from './services/geminiService';
import Header from './components/Header';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-bot-message',
      text: 'Xin chào! Tôi là Xphone, trợ lý AI chuyên về điện thoại. Tôi có thể giúp gì cho bạn hôm nay?',
      sender: Sender.BOT
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSession = useRef<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      chatSession.current = createChatSession();
    } catch (error) {
      console.error("Failed to initialize chat session:", error);
      setMessages(prev => [...prev, {
        id: 'error-init',
        text: 'Rất tiếc, đã có lỗi khi khởi tạo chatbot. Vui lòng kiểm tra API key và làm mới trang.',
        sender: Sender.BOT
      }]);
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;
    if (!chatSession.current) {
      console.error("Chat session not initialized.");
      setMessages(prev => [...prev, {
        id: 'error-no-session',
        text: 'Lỗi: Phiên trò chuyện chưa được khởi tạo. Vui lòng thử lại.',
        sender: Sender.BOT
      }]);
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: messageText,
      sender: Sender.USER
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    const botMessageId = `bot-${Date.now()}`;
    // Add a placeholder for the bot's response
    setMessages(prev => [...prev, { id: botMessageId, text: '', sender: Sender.BOT }]);

    try {
      const stream = await chatSession.current.sendMessageStream({ message: messageText });

      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk.text;
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId ? { ...msg, text: fullResponse } : msg
        ));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = "Rất tiếc, tôi đang gặp sự cố. Vui lòng thử lại sau.";
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId ? { ...msg, text: errorMessage } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);


  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
      <Header />
      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && messages[messages.length-1].sender === Sender.USER && (
            <div className="flex items-start gap-3 justify-start">
                 <div className="bg-blue-600 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                 </div>
                <div className="bg-gray-800 rounded-lg p-3 max-w-lg animate-pulse">
                    <div className="h-2.5 bg-gray-700 rounded-full w-24"></div>
                </div>
            </div>
        )}
      </main>
      <footer className="p-4 md:p-6 border-t border-gray-700 bg-gray-900">
        <ChatInput 
          input={input}
          onInputChange={setInput}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </footer>
    </div>
  );
}
