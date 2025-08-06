import React, { useState } from 'react';
import { MessageCircle, Heart } from 'lucide-react';
import { FirstAidChatbot } from './FirstAidChatbot';

export const ChatbotFloatingButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-lg z-[150] transition-all duration-300 hover:scale-110 pulse-red"
        aria-label="Open First Aid Assistant"
        title="Emergency First Aid Assistant"
      >
        <div className="relative">
          <Heart className="h-6 w-6" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
          </div>
        </div>
      </button>
      
      <FirstAidChatbot isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};