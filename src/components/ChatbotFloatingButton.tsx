import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { FirstAidChatbot } from './FirstAidChatbot';

export const ChatbotFloatingButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg z-[150] transition-all duration-300 hover:scale-110"
        aria-label="Open First Aid Assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
      
      <FirstAidChatbot isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};