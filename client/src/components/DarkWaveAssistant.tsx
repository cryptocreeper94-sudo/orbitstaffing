import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import darkwaveSoundwave from '@assets/darkwave_soundwave_nobg.png';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const darkwaveResponses: Record<string, string> = {
  hello: "Welcome to DarkWave Studios! I'm Wave, your guide to our enterprise solutions ecosystem. How can I help you today?",
  hi: "Hey there! I'm Wave from DarkWave Studios. Ask me about any of our products - ORBIT, DarkWave Pulse, Lot Ops Pro, or Brew & Board!",
  orbit: "ORBIT Staffing OS is our flagship product - a 100% automated flexible labor marketplace. GPS-verified check-ins, automated matching, and comprehensive payroll with 2025 tax calculations. Zero manual intervention!",
  staffing: "ORBIT Staffing OS handles everything from worker registration to payroll. Features include GPS verification, automated timesheet approval, multi-state compliance, and blockchain-verified documents.",
  pulse: "DarkWave Pulse is our lightning-fast compliance & safety platform. Real-time incident detection, OSHA compliance automation, and safety culture analytics for enterprises.",
  safety: "DarkWave Pulse provides enterprise-grade safety management with real-time incident reporting, multi-site safety management, and predictive safety alerts powered by AI.",
  lot: "Lot Ops Pro is our smart inventory & fleet operations platform. Real-time GPS tracking, automated maintenance scheduling, and fleet utilization analytics.",
  fleet: "Lot Ops Pro tracks every vehicle with GPS/RFID, automates maintenance schedules based on mileage/time, and provides comprehensive utilization dashboards.",
  brew: "Brew & Board Coffee is our B2B coffee delivery platform for Nashville businesses. Schedule pre-meeting deliveries from 20+ local and national vendors with transparent distance-based pricing.",
  coffee: "Brew & Board connects businesses with Nashville's finest coffee shops - Crema, Barista Parlor, Starbucks, and more. Features calendar scheduling, blockchain-verified receipts, and flexible subscriptions.",
  blockchain: "All DarkWave Studios products feature Solana blockchain verification. Every document gets an unforgeable hallmark that can be verified instantly via QR code.",
  pricing: "We offer flexible à la carte pricing! Choose individual modules or bundle packages. Contact us for custom enterprise pricing tailored to your needs.",
  contact: "Ready to transform your business? Visit any product page to learn more, or reach out to our sales team for a personalized demo!",
  default: "I'm Wave, your DarkWave Studios guide! I can tell you about ORBIT (staffing), DarkWave Pulse (safety), Lot Ops Pro (fleet), or Brew & Board (coffee delivery). What interests you?"
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, response] of Object.entries(darkwaveResponses)) {
    if (key !== 'default' && lower.includes(key)) {
      return response;
    }
  }
  return darkwaveResponses.default;
}

export function DarkWaveAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hey! I'm Wave, your DarkWave Studios guide. Ask me about any of our products!" }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    
    setTimeout(() => {
      const response = getResponse(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 500);
  };

  return (
    <>
      {/* Floating Soundwave Button - Bottom RIGHT corner */}
      <div
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          zIndex: 9999,
        }}
      >
        <motion.button
          onClick={() => setIsOpen(true)}
          className="hover:scale-110 transition-transform"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          data-testid="button-darkwave-assistant"
        >
          <img 
            src={darkwaveSoundwave} 
            alt="DarkWave Assistant" 
            className="w-24 h-14 sm:w-32 sm:h-20 object-contain brightness-125 saturate-150"
            style={{ filter: 'drop-shadow(0 0 25px rgba(168, 85, 247, 1)) drop-shadow(0 0 40px rgba(236, 72, 153, 0.8)) drop-shadow(0 0 15px rgba(6, 182, 212, 0.6))' }}
          />
        </motion.button>
      </div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-4 z-[9999] w-80 sm:w-96 max-h-[60vh] bg-gradient-to-br from-slate-900 via-purple-950/50 to-slate-900 rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-500/20 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-purple-500/30 bg-gradient-to-r from-purple-900/50 to-pink-900/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center overflow-hidden">
                  <img 
                    src={darkwaveSoundwave} 
                    alt="Wave" 
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Wave</h3>
                  <p className="text-xs text-purple-300">DarkWave Studios Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-purple-500/20 rounded-lg transition"
                data-testid="button-close-darkwave-chat"
              >
                <X className="w-5 h-5 text-purple-300" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-slate-800/80 text-gray-200 border border-purple-500/20'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-purple-500/30 bg-slate-900/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about our products..."
                  className="flex-1 bg-slate-800/80 border border-purple-500/30 rounded-xl px-4 py-2 text-sm text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500"
                  data-testid="input-darkwave-chat"
                />
                <button
                  onClick={handleSend}
                  className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:opacity-90 transition"
                  data-testid="button-send-darkwave"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
