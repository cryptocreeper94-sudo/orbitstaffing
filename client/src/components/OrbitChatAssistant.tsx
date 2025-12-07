import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Send, 
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const STORAGE_KEY = "orby_chat_history";
const GREETING_SHOWN_KEY = "orby_greeting_shown";

const ORBIT_RESPONSES: Record<string, string[]> = {
  payroll: [
    "Payroll processing is super easy! Go to Admin > Payroll Dashboard, select your workers, and click 'Process Payroll'. I'll handle all the tax calculations automatically!",
    "Need to run payroll? Head to the Payroll Processing page - you can process individual workers or do bulk payroll for everyone at once!",
  ],
  worker: [
    "To add a new worker, go to Workers and click 'Add Worker'. Fill in their details and I'll help onboard them with all the compliance requirements!",
    "Looking for worker info? The Talent Pool shows all available workers with their skills, ratings, and availability status!",
  ],
  compliance: [
    "Compliance is my specialty! Check the Compliance Dashboard to see I-9 status, certifications, and background check requirements for all workers.",
    "Need to verify a worker? Go to Compliance > Background Checks to request new checks or view existing results!",
  ],
  job: [
    "Post a new job on the Job Board! Employers can create listings with pay rates, locations, and requirements. Workers will see them instantly!",
    "The Talent Exchange connects employers with qualified workers. Use smart matching to find the perfect fit for each job!",
  ],
  time: [
    "GPS Clock-In keeps time tracking accurate! Workers clock in from their phones, and I verify they're at the right job site using geofencing.",
    "Need to approve timesheets? Check Timesheet Approval to review, approve, or reject submitted hours before payroll runs!",
  ],
  pricing: [
    "We have flexible pricing! Standalone tools start at $15/month, or bundle everything with our Starter ($99), Growth ($149), or Professional ($249) plans!",
    "Want to save money? Our bundles include multiple tools at a discount. The Growth bundle is most popular - it has everything most agencies need!",
  ],
  help: [
    "I'm here to help! You can ask me about payroll, workers, compliance, jobs, time tracking, or pricing. What would you like to know?",
    "Not sure where to start? Try the Dashboard for an overview, or check out the tutorial on any page by clicking the help button!",
  ],
  default: [
    "Great question! Let me point you in the right direction. What specifically would you like help with - payroll, workers, compliance, jobs, or something else?",
    "I'm still learning, but I can definitely help! Try asking about a specific feature like payroll, compliance, or job posting.",
    "Hmm, I'm not 100% sure about that one. But check out the help tutorials on each page - they explain everything step by step!",
  ],
};

function getOrbitResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("payroll") || lowerMessage.includes("pay") || lowerMessage.includes("salary")) {
    return ORBIT_RESPONSES.payroll[Math.floor(Math.random() * ORBIT_RESPONSES.payroll.length)];
  }
  if (lowerMessage.includes("worker") || lowerMessage.includes("employee") || lowerMessage.includes("staff")) {
    return ORBIT_RESPONSES.worker[Math.floor(Math.random() * ORBIT_RESPONSES.worker.length)];
  }
  if (lowerMessage.includes("compliance") || lowerMessage.includes("background") || lowerMessage.includes("i-9") || lowerMessage.includes("drug")) {
    return ORBIT_RESPONSES.compliance[Math.floor(Math.random() * ORBIT_RESPONSES.compliance.length)];
  }
  if (lowerMessage.includes("job") || lowerMessage.includes("posting") || lowerMessage.includes("talent") || lowerMessage.includes("hire")) {
    return ORBIT_RESPONSES.job[Math.floor(Math.random() * ORBIT_RESPONSES.job.length)];
  }
  if (lowerMessage.includes("time") || lowerMessage.includes("clock") || lowerMessage.includes("gps") || lowerMessage.includes("timesheet")) {
    return ORBIT_RESPONSES.time[Math.floor(Math.random() * ORBIT_RESPONSES.time.length)];
  }
  if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("plan") || lowerMessage.includes("subscription")) {
    return ORBIT_RESPONSES.pricing[Math.floor(Math.random() * ORBIT_RESPONSES.pricing.length)];
  }
  if (lowerMessage.includes("help") || lowerMessage.includes("how") || lowerMessage.includes("what")) {
    return ORBIT_RESPONSES.help[Math.floor(Math.random() * ORBIT_RESPONSES.help.length)];
  }
  
  return ORBIT_RESPONSES.default[Math.floor(Math.random() * ORBIT_RESPONSES.default.length)];
}

const DEFAULT_WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hi! I'm Orby, I'm here to help. Call me up anytime you need me! 🪐",
  timestamp: new Date().toISOString(),
};

export function OrbitChatAssistant() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEFAULT_WELCOME];
      }
    } catch {}
    return [DEFAULT_WELCOME];
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    const greetingShown = sessionStorage.getItem(GREETING_SHOWN_KEY);
    if (!greetingShown) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem(GREETING_SHOWN_KEY, "true");
        setTimeout(() => {
          setIsOpen(false);
        }, 4000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getOrbitResponse(userMessage.content);
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    const welcomeMsg: Message = {
      ...DEFAULT_WELCOME,
      id: `welcome-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMsg]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([welcomeMsg]));
  };

  if (!mounted) return null;

  return createPortal(
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-2 sm:inset-3 md:inset-4 z-[99999] flex flex-col"
          >
            <div className="w-full h-full flex flex-col sm:flex-row">
              <div className="flex items-center justify-center py-2 sm:py-0 sm:items-end sm:w-24 md:w-32 lg:w-40 flex-shrink-0">
                <motion.img
                  initial={{ scale: 0.5, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  src="/mascot/orbit_mascot_cyan_saturn_style_transparent.png"
                  alt="Orby"
                  className="w-20 h-20 sm:w-full sm:h-auto sm:max-h-[70%] object-contain"
                  style={{ filter: 'drop-shadow(0 0 30px rgba(6, 182, 212, 0.6))' }}
                />
              </div>
              
              <div className="flex-1 min-h-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl border-2 border-cyan-500/40 shadow-2xl shadow-cyan-500/30 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-700/50 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <span className="text-xl sm:text-2xl">🪐</span>
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-slate-800" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base sm:text-lg">Orby</h3>
                      <p className="text-xs sm:text-sm text-cyan-400">Your AI Assistant</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearChat}
                      className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 w-8 h-8 sm:w-10 sm:h-10"
                      title="Clear chat history"
                      data-testid="button-clear-chat"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="text-slate-400 hover:text-white hover:bg-slate-700 w-8 h-8 sm:w-10 sm:h-10"
                      data-testid="button-close-chat"
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </Button>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-3 sm:p-4 md:p-6" ref={scrollRef}>
                  <div className="space-y-3 sm:space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-3 py-2 sm:px-5 sm:py-3 ${
                            message.role === "user"
                              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                              : "bg-slate-700/50 text-slate-200 border border-slate-600/50"
                          }`}
                        >
                          <p className="text-sm sm:text-base leading-relaxed">{message.content}</p>
                        </div>
                      </motion.div>
                    ))}
                    
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="bg-slate-700/50 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 border border-slate-600/50">
                          <div className="flex gap-1.5 sm:gap-2">
                            <motion.span
                              animate={{ y: [0, -6, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                              className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-cyan-400 rounded-full"
                            />
                            <motion.span
                              animate={{ y: [0, -6, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                              className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-cyan-400 rounded-full"
                            />
                            <motion.span
                              animate={{ y: [0, -6, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                              className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-cyan-400 rounded-full"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </ScrollArea>

                <div className="p-3 sm:p-4 md:p-5 border-t border-slate-700/50 bg-slate-900/50">
                  <div className="flex gap-2 sm:gap-3">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask me anything..."
                      className="flex-1 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-cyan-500/50 h-10 sm:h-12 text-sm sm:text-base"
                      data-testid="input-chat-message"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || isTyping}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-4 sm:px-6 h-10 sm:h-12"
                      data-testid="button-send-message"
                    >
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-2 sm:mt-3 text-center">
                    Powered by Orby AI 🪐
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 z-[99999]"
          data-testid="button-orbit-chat"
          aria-label="Open Orby chat"
        >
          <motion.div 
            className="relative w-14 h-14 rounded-full bg-gradient-to-br from-cyan-600/90 to-blue-700/90 border-2 border-cyan-400/60 shadow-lg shadow-cyan-500/40 flex items-center justify-center"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: 'drop-shadow(0 0 15px rgba(6,182,212,0.6))' }}
          >
            <img 
              src="/mascot/orbit_mascot_cyan_saturn_style_transparent.png" 
              alt="Orby" 
              className="w-11 h-11 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="absolute text-2xl" style={{ display: 'none' }} data-fallback>🪐</span>
            <span 
              className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"
              style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
            />
          </motion.div>
        </motion.button>
      )}
    </>,
    document.body
  );
}
