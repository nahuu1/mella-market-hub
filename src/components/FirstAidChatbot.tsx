import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, AlertTriangle } from 'lucide-react';
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
      text: "Hello! I'm your AI First Aid Assistant. I can provide basic first aid guidance, but I am NOT a doctor. In case of serious emergencies, please call 911 or your local emergency services immediately. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiModel, setAiModel] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize AI model
  useEffect(() => {
    if (isOpen && !aiModel) {
      initializeAI();
    }
  }, [isOpen, aiModel]);

  const initializeAI = async () => {
    try {
      const { pipeline } = await import('@huggingface/transformers');
      const model = await pipeline('text-generation', 'Xenova/LaMini-Flan-T5-248M', {
        device: 'webgpu',
        dtype: 'fp16',
      });
      setAiModel(model);
    } catch (error) {
      console.error('Error initializing AI model:', error);
      // Fallback to CPU if WebGPU is not available
      try {
        const { pipeline } = await import('@huggingface/transformers');
        const model = await pipeline('text-generation', 'Xenova/LaMini-Flan-T5-248M');
        setAiModel(model);
      } catch (fallbackError) {
        console.error('Error initializing AI model on CPU:', fallbackError);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateFirstAidResponse = async (userMessage: string): Promise<string> => {
    if (!aiModel) {
      return "I'm still loading. Please wait a moment and try again.";
    }

    try {
      // First aid knowledge base responses
      const firstAidKnowledge = getFirstAidResponse(userMessage.toLowerCase());
      if (firstAidKnowledge) {
        return firstAidKnowledge;
      }

      // Use AI for more complex queries
      const prompt = `You are a helpful first aid assistant. Provide basic first aid guidance for: ${userMessage}. 
      Always remind the user that you are not a doctor and in serious emergencies they should call emergency services. 
      Keep the response practical, safe, and under 200 words.`;

      const response = await aiModel(prompt, {
        max_new_tokens: 150,
        temperature: 0.7,
        do_sample: true,
      });

      let aiResponse = response[0]?.generated_text || "I'm not sure about that. Please consult a medical professional.";
      
      // Clean up the response
      aiResponse = aiResponse.replace(prompt, '').trim();
      
      // Add disclaimer if not present
      if (!aiResponse.includes('not a doctor') && !aiResponse.includes('emergency services')) {
        aiResponse += "\n\nRemember: I'm not a doctor. For serious injuries or emergencies, call 911 immediately.";
      }

      return aiResponse;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return "I'm having trouble processing your request. For medical emergencies, please call 911 or consult a healthcare professional.";
    }
  };

  const getFirstAidResponse = (message: string): string | null => {
    const responses: { [key: string]: string } = {
      'cut': "For minor cuts:\n1. Clean your hands\n2. Stop the bleeding with direct pressure\n3. Clean the wound with water\n4. Apply antibiotic ointment\n5. Cover with a bandage\n\nFor deep cuts or heavy bleeding, seek immediate medical attention!",
      'burn': "For minor burns:\n1. Cool the burn with cold running water for 10-20 minutes\n2. Remove jewelry/clothing before swelling\n3. Apply aloe vera or burn gel\n4. Cover with sterile gauze\n5. Take pain relievers if needed\n\nFor severe burns, call 911 immediately!",
      'choking': "For choking:\n1. Encourage coughing if they can still breathe\n2. If unable to cough/speak:\n   - Stand behind them\n   - Give 5 back blows between shoulder blades\n   - Give 5 abdominal thrusts (Heimlich maneuver)\n3. Repeat until object is expelled\n4. Call 911 if unsuccessful\n\nFor infants under 1 year, use different technique!",
      'bleeding': "For bleeding:\n1. Apply direct pressure with clean cloth\n2. Elevate the injured area above heart level\n3. Apply pressure to pressure points if needed\n4. Don't remove embedded objects\n5. Monitor for shock\n\nCall 911 for severe bleeding, arterial bleeding, or if bleeding won't stop!",
      'sprain': "For sprains (R.I.C.E. method):\n1. Rest - avoid using the injured area\n2. Ice - apply for 15-20 minutes every 2-3 hours\n3. Compression - wrap with elastic bandage\n4. Elevation - raise above heart level\n\nSeek medical attention if severe pain, numbness, or inability to bear weight.",
      'fever': "For fever:\n1. Rest and stay hydrated\n2. Take fever-reducing medication (acetaminophen/ibuprofen)\n3. Use cool, damp cloths on forehead\n4. Wear light clothing\n5. Monitor temperature\n\nSeek medical attention for fever over 103°F (39.4°C) or if accompanied by severe symptoms.",
    };

    for (const [keyword, response] of Object.entries(responses)) {
      if (message.includes(keyword)) {
        return response + "\n\nRemember: I'm not a doctor. For serious injuries, call emergency services immediately.";
      }
    }

    return null;
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
    setInputMessage('');
    setIsLoading(true);

    try {
      const botResponse = await generateFirstAidResponse(inputMessage);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble responding right now. For medical emergencies, please call 911.",
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[80vh] flex flex-col bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5 text-blue-600" />
            First Aid Assistant
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <Alert className="m-4 mb-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            This is AI guidance only. For emergencies, call 911 immediately.
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
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 text-sm ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
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
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 text-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about first aid..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
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