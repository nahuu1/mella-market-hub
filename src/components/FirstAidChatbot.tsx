import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface FirstAidChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirstAidChatbot: React.FC<FirstAidChatbotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "🚨 IMPORTANT DISCLAIMER: I am NOT a doctor or medical professional. I can only provide basic first aid guidance. In case of serious emergencies, please call 911 or your local emergency services IMMEDIATELY.\n\nFor minor issues, I can offer general first aid tips. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Comprehensive first aid knowledge base for instant responses
  const getFirstAidResponse = (message: string): string | null => {
    const lowerMessage = message.toLowerCase();
    
    const responses: { [key: string]: string } = {
      'cut': "🩸 For minor cuts:\n1. Clean your hands first\n2. Stop bleeding with direct pressure using clean cloth\n3. Clean wound gently with water\n4. Apply antibiotic ointment if available\n5. Cover with sterile bandage\n\n⚠️ Seek immediate medical attention for:\n- Deep cuts (you can see fat/muscle)\n- Cuts that won't stop bleeding\n- Signs of infection",
      
      'burn': "🔥 For minor burns:\n1. Cool immediately with cold running water (10-20 minutes)\n2. Remove jewelry/tight clothing before swelling\n3. Do NOT use ice, butter, or oils\n4. Apply aloe vera or burn gel\n5. Cover loosely with sterile gauze\n\n🚨 Call 911 for:\n- Burns larger than palm of hand\n- Burns on face, hands, feet, genitals\n- Chemical or electrical burns",
      
      'choking': "🫁 For choking adult:\n1. If they can cough/speak - encourage coughing\n2. If they CANNOT breathe:\n   - Stand behind them\n   - 5 sharp back blows between shoulder blades\n   - 5 abdominal thrusts (Heimlich maneuver)\n   - Repeat until object comes out\n\n📞 Call 911 immediately if unsuccessful\n⚠️ Different technique needed for babies/infants",
      
      'bleeding': "🩸 For serious bleeding:\n1. Apply direct pressure with clean cloth/bandage\n2. Do NOT remove if cloth soaks through - add more layers\n3. Elevate injured area above heart if possible\n4. Apply pressure to pressure points if needed\n5. Do NOT remove embedded objects\n\n🚨 Call 911 for:\n- Spurting blood (arterial)\n- Bleeding that won't stop\n- Signs of shock (pale, weak, dizzy)",
      
      'sprain': "🦵 For sprains (R.I.C.E. method):\n1. REST - Stop activity, don't walk on it\n2. ICE - 15-20 minutes every 2-3 hours (first 48 hours)\n3. COMPRESSION - Wrap with elastic bandage (not too tight)\n4. ELEVATION - Raise above heart level when possible\n\n🏥 See doctor if:\n- Severe pain or can't bear weight\n- Numbness or tingling\n- No improvement after 2-3 days",
      
      'fever': "🌡️ For fever:\n1. Rest and drink plenty of fluids\n2. Take fever-reducing medication (follow dosage)\n3. Use cool, damp cloths on forehead\n4. Wear light, breathable clothing\n5. Monitor temperature regularly\n\n🚨 Seek immediate care for:\n- Fever over 103°F (39.4°C)\n- Fever with stiff neck, severe headache\n- Difficulty breathing",
      
      'allergic': "⚠️ For allergic reactions:\nMILD (skin rash, itching):\n1. Remove/avoid trigger if known\n2. Take antihistamine (Benadryl)\n3. Apply cool compress to affected area\n\n🚨 SEVERE (trouble breathing, swelling of face/throat):\n1. Call 911 IMMEDIATELY\n2. Use EpiPen if available\n3. Help person sit upright\n4. Be ready to perform CPR",
      
      'seizure': "🧠 For seizures:\n1. Keep person safe - move sharp objects away\n2. Time the seizure\n3. Turn person on side if possible\n4. Do NOT put anything in their mouth\n5. Stay with them until they're fully conscious\n\n📞 Call 911 if:\n- Seizure lasts over 5 minutes\n- Person has trouble breathing after\n- Another seizure happens soon after",
    };

    // Check for keywords in the message
    for (const [keyword, response] of Object.entries(responses)) {
      if (lowerMessage.includes(keyword)) {
        return response + "\n\n⚠️ REMINDER: I'm not a doctor. This is basic first aid guidance only.";
      }
    }

    // Check for emergency keywords that require immediate 911 call
    const emergencyKeywords = ['unconscious', 'not breathing', 'chest pain', 'heart attack', 'stroke', 'overdose', 'poisoning', 'severe bleeding'];
    for (const keyword of emergencyKeywords) {
      if (lowerMessage.includes(keyword)) {
        return `🚨 EMERGENCY SITUATION DETECTED 🚨\n\nCall 911 IMMEDIATELY for: ${keyword.toUpperCase()}\n\nWhile waiting for help:\n- Stay with the person\n- Follow dispatcher instructions\n- Be ready to provide CPR if trained\n- Keep person calm and comfortable\n\n⚠️ Do not delay - professional medical help is urgently needed!`;
      }
    }

    return null;
  };

  const generateResponse = async (userMessage: string): Promise<string> => {
    // First check our knowledge base for instant responses
    const knowledgeResponse = getFirstAidResponse(userMessage);
    if (knowledgeResponse) {
      return knowledgeResponse;
    }

    // For other queries, provide general guidance
    const generalResponses = [
      "I can help with basic first aid for cuts, burns, sprains, choking, bleeding, fever, and allergic reactions. Could you be more specific about what you need help with?",
      "For the best first aid guidance, please tell me specifically what happened - for example: 'cut on finger', 'burn from stove', 'sprained ankle', etc.",
      "I have information about common first aid situations. Try asking about: cuts, burns, choking, bleeding, sprains, fever, or allergic reactions.",
    ];
    
    const randomResponse = generalResponses[Math.floor(Math.random() * generalResponses.length)];
    return randomResponse + "\n\n⚠️ Remember: For serious emergencies, always call 911 first!";
  };
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const botResponse = await generateResponse(currentInput);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "🚨 I'm having trouble right now. For any medical emergency, please call 911 immediately or contact your local emergency services.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Card className="w-full max-w-md max-h-[85vh] flex flex-col bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b bg-red-50">
          <CardTitle className="flex items-center gap-2 text-lg text-red-700">
            <Bot className="h-5 w-5" />
            🚨 First Aid Assistant
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-red-600 hover:text-red-800">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <Alert className="m-4 mb-2 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-sm font-medium text-red-800">
            ⚠️ NOT MEDICAL ADVICE - For emergencies, call 911 immediately!
          </AlertDescription>
        </Alert>

        <CardContent className="flex-1 p-0 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.sender === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-red-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-lg p-3 text-sm ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900 border border-gray-200'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.text}</div>
                    <div
                      className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  {message.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Loader2 className="h-4 w-4 text-red-600 animate-spin" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 text-sm">
                    <div className="text-gray-600">Thinking...</div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="border-t p-4 bg-gray-50">
            <div className="text-xs text-gray-600 mb-2 text-center">
              💡 Try: "cut on finger", "burn from stove", "sprained ankle"
            </div>
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your first aid situation..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};