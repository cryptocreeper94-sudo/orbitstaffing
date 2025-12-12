import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Mic, MicOff, Volume2, VolumeX } from "lucide-react";

const GREETING_SHOWN_KEY = "orby_greeting_shown";

const ORBIT_RESPONSES: Record<string, string[]> = {
  payroll: [
    "Payroll processing is super easy! Go to Admin > Payroll Dashboard, select your workers, and click 'Process Payroll'. I handle all the tax calculations automatically!",
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
    "Want to save money? Our bundles include multiple tools at a discount. The Growth bundle is most popular!",
  ],
  help: [
    "I'm here to help! You can ask me about payroll, workers, compliance, jobs, time tracking, or pricing. What would you like to know?",
    "Not sure where to start? Try the Dashboard for an overview, or ask me anything about ORBIT!",
  ],
  hello: [
    "Hey there! I'm Orby, your friendly ORBIT assistant. What can I help you with today?",
    "Hi! Great to see you! Ask me anything about staffing, payroll, or compliance!",
  ],
  default: [
    "Great question! I can help with payroll, workers, compliance, jobs, time tracking, and more. What specifically would you like to know?",
    "Hmm, I'm not 100% sure about that one. Try asking about payroll, workers, or compliance - those are my specialties!",
  ],
};

function getOrbitResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
    return ORBIT_RESPONSES.hello[Math.floor(Math.random() * ORBIT_RESPONSES.hello.length)];
  }
  if (lowerMessage.includes("payroll") || lowerMessage.includes("pay") || lowerMessage.includes("salary")) {
    return ORBIT_RESPONSES.payroll[Math.floor(Math.random() * ORBIT_RESPONSES.payroll.length)];
  }
  if (lowerMessage.includes("worker") || lowerMessage.includes("employee") || lowerMessage.includes("staff")) {
    return ORBIT_RESPONSES.worker[Math.floor(Math.random() * ORBIT_RESPONSES.worker.length)];
  }
  if (lowerMessage.includes("compliance") || lowerMessage.includes("background") || lowerMessage.includes("i-9")) {
    return ORBIT_RESPONSES.compliance[Math.floor(Math.random() * ORBIT_RESPONSES.compliance.length)];
  }
  if (lowerMessage.includes("job") || lowerMessage.includes("posting") || lowerMessage.includes("talent")) {
    return ORBIT_RESPONSES.job[Math.floor(Math.random() * ORBIT_RESPONSES.job.length)];
  }
  if (lowerMessage.includes("time") || lowerMessage.includes("clock") || lowerMessage.includes("gps")) {
    return ORBIT_RESPONSES.time[Math.floor(Math.random() * ORBIT_RESPONSES.time.length)];
  }
  if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("plan")) {
    return ORBIT_RESPONSES.pricing[Math.floor(Math.random() * ORBIT_RESPONSES.pricing.length)];
  }
  if (lowerMessage.includes("help") || lowerMessage.includes("how") || lowerMessage.includes("what")) {
    return ORBIT_RESPONSES.help[Math.floor(Math.random() * ORBIT_RESPONSES.help.length)];
  }
  
  return ORBIT_RESPONSES.default[Math.floor(Math.random() * ORBIT_RESPONSES.default.length)];
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const getSpeechRecognition = (): any => {
  if (typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
};

const getSpeechSynthesis = (): SpeechSynthesis | null => {
  if (typeof window === 'undefined') return null;
  return window.speechSynthesis || null;
};

export function FooterOrbyChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showGreetingBubble, setShowGreetingBubble] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female');
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognitionClass = getSpeechRecognition();
    const synth = getSpeechSynthesis();
    setSpeechSupported(!!(SpeechRecognitionClass && synth));
    
    const savedGender = localStorage.getItem('orby_voice_gender');
    if (savedGender === 'male' || savedGender === 'female') {
      setVoiceGender(savedGender);
    }
    
    const greetingShown = sessionStorage.getItem(GREETING_SHOWN_KEY);
    if (!greetingShown) {
      setTimeout(() => {
        setShowGreetingBubble(true);
        sessionStorage.setItem(GREETING_SHOWN_KEY, "true");
        setTimeout(() => setShowGreetingBubble(false), 4000);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) return;
    
    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognitionRef.current = recognition;
    
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, []);

  const speakText = useCallback((text: string) => {
    if (!voiceEnabled) return;
    
    const synth = getSpeechSynthesis();
    if (!synth) return;
    
    synth.cancel();
    const cleanText = text.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').replace(/[^\x00-\x7F]/g, ' ').replace(/\s+/g, ' ').trim();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = voiceGender === 'female' ? 1.1 : 0.95;
    utterance.volume = 0.9;
    
    const voices = synth.getVoices();
    const femaleNames = ['samantha', 'victoria', 'karen', 'google us english female', 'microsoft aria', 'female'];
    const maleNames = ['alex', 'daniel', 'google uk english male', 'microsoft guy', 'male'];
    const preferredNames = voiceGender === 'female' ? femaleNames : maleNames;
    
    let selectedVoice: SpeechSynthesisVoice | undefined;
    for (const name of preferredNames) {
      selectedVoice = voices.find(v => v.name.toLowerCase().includes(name) && v.lang.startsWith('en'));
      if (selectedVoice) break;
    }
    if (!selectedVoice) selectedVoice = voices.find(v => v.lang.startsWith('en'));
    if (selectedVoice) utterance.voice = selectedVoice;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synth.speak(utterance);
  }, [voiceEnabled, voiceGender]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.abort();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {}
    }
  }, [isListening]);

  const toggleVoiceGender = useCallback(() => {
    setVoiceGender(prev => {
      const newGender = prev === 'female' ? 'male' : 'female';
      localStorage.setItem('orby_voice_gender', newGender);
      return newGender;
    });
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleOpen = () => {
    setIsOpen(true);
    setShowGreetingBubble(false);
    if (messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: "Hey there! I'm Orby, your ORBIT assistant. What can I help you with?"
      }]);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSend = useCallback(() => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getOrbitResponse(userMessage.content);
      setMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response
      }]);
      setIsTyping(false);
      if (voiceEnabled) speakText(response);
    }, 800 + Math.random() * 600);
  }, [input, voiceEnabled, speakText]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {showGreetingBubble && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-full right-0 mb-2 bg-white rounded-xl px-3 py-2 shadow-lg text-xs text-slate-700 whitespace-nowrap"
            style={{ zIndex: 1000 }}
          >
            Hi! Click me anytime for help
            <div className="absolute bottom-0 right-4 translate-y-1/2 rotate-45 w-2 h-2 bg-white" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-full right-0 mb-2 w-80 max-h-96 bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ zIndex: 1000, boxShadow: '0 8px 40px rgba(0, 0, 0, 0.25), 0 0 0 2px rgba(6, 182, 212, 0.3)' }}
          >
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center z-10"
              data-testid="button-close-orby"
            >
              <X size={14} className="text-slate-600" />
            </button>

            <div className="flex-1 overflow-y-auto p-4 pt-10 max-h-64">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-sm' 
                      : 'bg-slate-100 text-slate-700 rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-1 p-3">
                  {[0, 1, 2].map(i => (
                    <motion.span
                      key={i}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                      className="w-2 h-2 rounded-full bg-cyan-500"
                    />
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {speechSupported && (
              <div className="px-3 py-2 border-t border-slate-100 flex justify-between items-center bg-slate-50">
                <button
                  onClick={toggleVoiceGender}
                  className={`px-2 py-1 rounded-full text-[10px] font-semibold text-white ${
                    voiceGender === 'female' 
                      ? 'bg-gradient-to-r from-pink-400 to-pink-500' 
                      : 'bg-gradient-to-r from-blue-400 to-blue-500'
                  }`}
                  data-testid="button-toggle-gender"
                >
                  {voiceGender === 'female' ? '♀ Female' : '♂ Male'}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`p-1.5 rounded-full ${voiceEnabled ? 'bg-cyan-100' : 'bg-red-100'}`}
                    data-testid="button-toggle-voice"
                  >
                    {voiceEnabled ? <Volume2 size={14} className="text-cyan-600" /> : <VolumeX size={14} className="text-red-500" />}
                  </button>
                  {isSpeaking && (
                    <div className="flex gap-0.5">
                      {[0, 1, 2, 3].map(i => (
                        <motion.div
                          key={i}
                          animate={{ scaleY: [1, 1.8, 1] }}
                          transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                          className="w-0.5 h-3 bg-cyan-500 rounded"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="p-3 border-t border-slate-100 flex gap-2 bg-slate-50">
              {speechSupported && (
                <button
                  onClick={toggleListening}
                  className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    isListening ? 'bg-red-500' : 'bg-cyan-100'
                  }`}
                  data-testid="button-mic-orby"
                >
                  {isListening ? <MicOff size={16} className="text-white" /> : <Mic size={16} className="text-cyan-600" />}
                </button>
              )}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Listening..." : "Ask me anything..."}
                className="flex-1 px-3 py-2 rounded-full border border-slate-200 text-sm focus:outline-none focus:border-cyan-400"
                data-testid="input-orby-chat"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  input.trim() ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-slate-200'
                }`}
                data-testid="button-send-orby"
              >
                <Send size={16} className={input.trim() ? 'text-white' : 'text-slate-400'} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition group"
        data-testid="button-footer-orby"
        title="Chat with Orby"
      >
        <motion.img
          src="/mascot/clean/orbit_saturn_mascot_waving_transparent_clean.png"
          alt="Orby"
          className="w-6 h-6 object-contain"
          animate={{ y: isOpen ? 0 : [0, -2, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ filter: 'drop-shadow(0 0 4px rgba(6, 182, 212, 0.5))' }}
        />
        <span className="text-xs font-medium hidden sm:inline group-hover:text-cyan-300">Orby</span>
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-green-400"
          style={{ boxShadow: '0 0 4px rgba(74, 222, 128, 0.8)' }}
        />
      </button>
    </div>
  );
}
