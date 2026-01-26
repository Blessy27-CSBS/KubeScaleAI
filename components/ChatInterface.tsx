
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, PredictionResult } from '../types';
import { startComplexChat } from '../services/groqService';

interface ChatInterfaceProps {
  prediction: PredictionResult | null;
}

const DEFAULT_GREETING = "Hello! I'm Nova AI, your predictive cluster companion. How can I assist you with your scaling architecture today?";

const ChatBotLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" stroke="#10B981" strokeWidth="6" />
    <path d="M32 48C32 48 36 42 42 48" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
    <path d="M58 48C58 48 62 42 68 48" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
    <path d="M42 68C42 68 50 78 58 68" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
    <circle cx="12" cy="38" r="4" fill="#10B981" />
    <circle cx="88" cy="38" r="4" fill="#10B981" />
    <path d="M12 38V50" stroke="#10B981" strokeWidth="3" />
    <path d="M88 38V50" stroke="#10B981" strokeWidth="3" />
    <path d="M38 12L50 18L62 12" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChatInterface: React.FC<ChatInterfaceProps> = ({ prediction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: DEFAULT_GREETING }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prediction) {
      setMessages(prev => {
        const firstMsg = prev[0];
        if (firstMsg && firstMsg.role === 'model' && !firstMsg.content.includes('Nova Scaling Context')) {
          const summary = `[NOVA SCALING CONTEXT LOADED]\nI've finalized my analysis. Current traffic estimates suggest ${prediction.estimatedUsers.toLocaleString()} concurrent users. I recommend scaling to ${prediction.recommendedPods} pods for stability.\n\n`;
          return [{ role: 'model', content: summary + DEFAULT_GREETING }, ...prev.slice(1)];
        }
        return prev;
      });
    }
  }, [prediction]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);
    try {
      const chat = await startComplexChat(messages, prediction);
      const response = await chat.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', content: response.text || "I'm processing that scaling request..." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "Nova AI encountered an uplink error. Please re-initiate scaling." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[1000] flex flex-col items-end">
      {isOpen && (
        <div className="mb-6 w-[380px] h-[580px] bg-white rounded-[3rem] border border-brand-brown/5 shadow-2xl overflow-hidden flex flex-col animate-zoomIn origin-bottom-right">
          <div className="p-8 pb-4 bg-brand-softPink flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-[1.25rem] p-2 shadow-sm flex items-center justify-center border border-brand-brown/5">
                  <ChatBotLogo className="w-full h-full" />
                </div>
                <div>
                  <h3 className="font-serif text-brand-brown font-bold text-sm italic">Nova AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-brand-rose rounded-full animate-pulse"></span>
                    <span className="text-[9px] font-bold text-brand-rose/60 uppercase tracking-widest">Active Analysis</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-brand-rose/10 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-brand-brown/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Context Awareness Banner */}
            {prediction && (
              <div className="bg-white rounded-2xl p-3 border border-brand-brown/5 flex justify-between items-center text-[10px] font-bold text-brand-rose/80 uppercase tracking-widest soft-shadow">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-brand-rose rounded-full"></span>
                  <span>{prediction.estimatedUsers.toLocaleString()} Load</span>
                </div>
                <div className="w-px h-3 bg-brand-brown/10"></div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-brand-accent rounded-full"></span>
                  <span>{prediction.recommendedPods} Pods</span>
                </div>
              </div>
            )}
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-white">
            {messages.map((m, i) => (
              <div key={i} className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {m.role === 'model' && (
                  <div className="w-8 h-8 rounded-xl bg-brand-softPink flex-shrink-0 flex items-center justify-center border border-brand-brown/5 shadow-sm">
                    <ChatBotLogo className="w-6 h-6" />
                  </div>
                )}
                <div className={`max-w-[85%] px-5 py-3 rounded-[1.5rem] text-[13px] leading-relaxed whitespace-pre-wrap shadow-sm ${m.role === 'user'
                    ? 'bg-brand-rose text-white rounded-tr-none font-bold'
                    : 'bg-brand-softPink text-brand-brown/80 rounded-tl-none border border-brand-brown/5'
                  }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-softPink flex-shrink-0 flex items-center justify-center border border-brand-brown/5">
                  <ChatBotLogo className="w-6 h-6 animate-bounce" />
                </div>
                <div className="bg-brand-softPink px-4 py-2 rounded-[1.25rem] rounded-tl-none text-[9px] font-bold text-brand-rose/60 uppercase tracking-widest border border-brand-brown/5">
                  Consulting Architecture...
                </div>
              </div>
            )}
          </div>

          <div className="p-8 bg-white border-t border-brand-brown/5">
            <div className="relative">
              <input
                type="text"
                className="w-full pl-6 pr-14 py-4 bg-brand-softPink border border-brand-brown/5 rounded-full text-[13px] text-brand-brown placeholder:text-brand-brown/30 focus:outline-none focus:ring-4 focus:ring-brand-rose/5"
                placeholder="Ask Nova about your cluster..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-2 w-12 h-12 bg-brand-rose text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-30 shadow-lg shadow-brand-rose/20"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-90 overflow-hidden border-8 border-white ${isOpen ? 'bg-brand-softPink rotate-12' : 'bg-brand-rose'
          }`}
      >
        <ChatBotLogo className={`w-12 h-12 ${isOpen ? '' : 'brightness-200'}`} />
      </button>

      <style>{`
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-zoomIn {
          animation: zoomIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;
