import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Mic, MicOff, Volume2, VolumeX } from "lucide-react";

const GREETING_SHOWN_KEY = "orby_greeting_shown";

// Orby's keyword-based responses
const ORBIT_RESPONSES: Record<string, string[]> = {
  payroll: [
    "Payroll processing is super easy! Go to Admin > Payroll Dashboard, select your workers, and click 'Process Payroll'. I handle all the tax calculations automatically! 💰",
    "Need to run payroll? Head to the Payroll Processing page - you can process individual workers or do bulk payroll for everyone at once!",
  ],
  worker: [
    "To add a new worker, go to Workers and click 'Add Worker'. Fill in their details and I'll help onboard them with all the compliance requirements! 👷",
    "Looking for worker info? The Talent Pool shows all available workers with their skills, ratings, and availability status!",
  ],
  compliance: [
    "Compliance is my specialty! Check the Compliance Dashboard to see I-9 status, certifications, and background check requirements for all workers. ✅",
    "Need to verify a worker? Go to Compliance > Background Checks to request new checks or view existing results!",
  ],
  job: [
    "Post a new job on the Job Board! Employers can create listings with pay rates, locations, and requirements. Workers will see them instantly! 📋",
    "The Talent Exchange connects employers with qualified workers. Use smart matching to find the perfect fit for each job!",
  ],
  time: [
    "GPS Clock-In keeps time tracking accurate! Workers clock in from their phones, and I verify they're at the right job site using geofencing. ⏰",
    "Need to approve timesheets? Check Timesheet Approval to review, approve, or reject submitted hours before payroll runs!",
  ],
  pricing: [
    "We have flexible pricing! Standalone tools start at $15/month, or bundle everything with our Starter ($99), Growth ($149), or Professional ($249) plans! 💎",
    "Want to save money? Our bundles include multiple tools at a discount. The Growth bundle is most popular!",
  ],
  help: [
    "I'm here to help! You can ask me about payroll, workers, compliance, jobs, time tracking, or pricing. What would you like to know? 🪐",
    "Not sure where to start? Try the Dashboard for an overview, or ask me anything about ORBIT!",
  ],
  hello: [
    "Hey there! 👋 I'm Orby, your friendly ORBIT assistant. What can I help you with today?",
    "Hi! Great to see you! Ask me anything about staffing, payroll, or compliance!",
  ],
  default: [
    "Great question! I can help with payroll, workers, compliance, jobs, time tracking, and more. What specifically would you like to know? 🪐",
    "Hmm, I'm not 100% sure about that one. Try asking about payroll, workers, or compliance - those are my specialties!",
    "I'm still learning! Can you ask that in a different way? Or try topics like 'payroll', 'workers', or 'jobs'.",
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

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// Voice types for browser compatibility
type SpeechRecognitionType = typeof window extends { SpeechRecognition: infer T } ? T : any;

// Voice helper functions
const getSpeechRecognition = (): SpeechRecognitionType | null => {
  if (typeof window === 'undefined') return null;
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  return SR || null;
};

const getSpeechSynthesis = (): SpeechSynthesis | null => {
  if (typeof window === 'undefined') return null;
  return window.speechSynthesis || null;
};

export function OrbitChatAssistant() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setMounted(true);
    // Check browser support for speech APIs
    const SpeechRecognitionClass = getSpeechRecognition();
    const synth = getSpeechSynthesis();
    setSpeechSupported(!!(SpeechRecognitionClass && synth));
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (!mounted) return;
    
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
      // Auto-send after voice input
      setTimeout(() => {
        const sendBtn = document.querySelector('[data-testid="button-send-orby"]') as HTMLButtonElement;
        if (sendBtn) sendBtn.click();
      }, 300);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, [mounted]);

  // Text-to-speech function
  const speakText = useCallback((text: string) => {
    if (!voiceEnabled) return;
    
    const synth = getSpeechSynthesis();
    if (!synth) return;
    
    // Cancel any ongoing speech
    synth.cancel();
    
    // Remove emojis for cleaner speech
    const cleanText = text.replace(/[\\u{1F600}-\\u{1F64F}]|[\\u{1F300}-\\u{1F5FF}]|[\\u{1F680}-\\u{1F6FF}]|[\\u{1F1E0}-\u{1F1FF}]|[\\u{2600}-\u{26FF}]|[\\u{2700}-\\u{27BF}]/gu, '').trim();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    utterance.volume = 0.9;
    
    // Try to get a friendly voice
    const voices = synth.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.toLowerCase().includes('samantha') || 
      v.name.toLowerCase().includes('google') ||
      v.name.toLowerCase().includes('female')
    ) || voices.find(v => v.lang.startsWith('en'));
    
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    utteranceRef.current = utterance;
    synth.speak(utterance);
  }, [voiceEnabled]);

  // Toggle voice listening
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.abort();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error('Failed to start recognition:', e);
      }
    }
  }, [isListening]);

  // Toggle voice output
  const toggleVoiceOutput = useCallback(() => {
    const synth = getSpeechSynthesis();
    if (isSpeaking && synth) {
      synth.cancel();
      setIsSpeaking(false);
    }
    setVoiceEnabled(prev => !prev);
  }, [isSpeaking]);

  // Show greeting on first visit
  useEffect(() => {
    if (!mounted) return;
    
    const greetingShown = sessionStorage.getItem(GREETING_SHOWN_KEY);
    if (!greetingShown) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setMessages([{
          id: "welcome",
          role: "assistant",
          content: "Hey there! 👋 I'm Orby, your ORBIT assistant. Ask me anything about staffing, payroll, or compliance!"
        }]);
        sessionStorage.setItem(GREETING_SHOWN_KEY, "true");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [mounted]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: "Hey there! 👋 I'm Orby, your ORBIT assistant. What can I help you with?"
      }]);
    }
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

    // Simulate typing delay
    setTimeout(() => {
      const response = getOrbitResponse(userMessage.content);
      setMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response
      }]);
      setIsTyping(false);
      
      // Speak the response if voice is enabled
      if (voiceEnabled) {
        speakText(response);
      }
    }, 800 + Math.random() * 600);
  }, [input, voiceEnabled, speakText]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div style={{ position: 'fixed', bottom: '16px', right: '16px', zIndex: 999999 }}>
      {/* Chat bubble and input - appears above Orby */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            style={{
              position: 'absolute',
              bottom: '90px',
              right: '0',
              width: '320px',
              maxHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              background: 'white',
              borderRadius: '20px',
              boxShadow: '0 8px 40px rgba(0, 0, 0, 0.25), 0 0 0 2px rgba(6, 182, 212, 0.3)',
              overflow: 'hidden'
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(0,0,0,0.1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
              data-testid="button-close-orby"
            >
              <X size={16} color="#64748b" />
            </button>

            {/* Messages area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              paddingTop: '40px',
              maxHeight: '280px'
            }}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginBottom: '12px',
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.role === 'user' 
                      ? 'linear-gradient(135deg, #06b6d4, #0284c7)' 
                      : '#f1f5f9',
                    color: msg.role === 'user' ? 'white' : '#1e293b',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: 'flex', gap: '4px', padding: '10px 14px' }}
                >
                  {[0, 1, 2].map(i => (
                    <motion.span
                      key={i}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#06b6d4'
                      }}
                    />
                  ))}
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Voice controls bar */}
            {speechSupported && (
              <div style={{
                padding: '8px 12px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                background: '#f1f5f9'
              }}>
                <button
                  onClick={toggleVoiceOutput}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: 'none',
                    background: voiceEnabled ? 'rgba(6, 182, 212, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  title={voiceEnabled ? 'Mute Orby' : 'Unmute Orby'}
                  data-testid="button-toggle-voice"
                >
                  {voiceEnabled ? (
                    <Volume2 size={16} color={isSpeaking ? '#06b6d4' : '#64748b'} />
                  ) : (
                    <VolumeX size={16} color="#ef4444" />
                  )}
                </button>
                {isSpeaking && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    padding: '0 8px'
                  }}>
                    {[0, 1, 2, 3].map(i => (
                      <motion.div
                        key={i}
                        animate={{ scaleY: [1, 1.8, 1] }}
                        transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                        style={{
                          width: '3px',
                          height: '12px',
                          background: '#06b6d4',
                          borderRadius: '2px'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Input area */}
            <div style={{
              padding: '12px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '8px',
              background: '#f8fafc'
            }}>
              {/* Mic button */}
              {speechSupported && (
                <button
                  onClick={toggleListening}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: 'none',
                    background: isListening 
                      ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                      : 'rgba(6, 182, 212, 0.1)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    transition: 'all 0.2s'
                  }}
                  title={isListening ? 'Stop listening' : 'Speak to Orby'}
                  data-testid="button-mic-orby"
                >
                  {isListening ? (
                    <>
                      <MicOff size={18} color="white" />
                      <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        style={{
                          position: 'absolute',
                          inset: '-4px',
                          borderRadius: '50%',
                          border: '2px solid #ef4444'
                        }}
                      />
                    </>
                  ) : (
                    <Mic size={18} color="#06b6d4" />
                  )}
                </button>
              )}
              
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Listening..." : "Ask me anything..."}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '20px',
                  border: isListening ? '2px solid #ef4444' : '1px solid #e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  background: 'white',
                  transition: 'border 0.2s'
                }}
                data-testid="input-orby-chat"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: 'none',
                  background: input.trim() ? 'linear-gradient(135deg, #06b6d4, #0284c7)' : '#e2e8f0',
                  cursor: input.trim() ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                data-testid="button-send-orby"
              >
                <Send size={18} color={input.trim() ? 'white' : '#94a3b8'} />
              </button>
            </div>

            {/* Bubble tail */}
            <div style={{
              position: 'absolute',
              bottom: '-10px',
              right: '30px',
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderTop: '12px solid white'
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orby Mascot Button */}
      <motion.button
        onClick={handleOpen}
        animate={{
          scale: isOpen ? 1.15 : 1,
          y: isOpen ? -5 : 0
        }}
        whileHover={{ scale: isOpen ? 1.2 : 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", damping: 15, stiffness: 300 }}
        style={{
          width: '72px',
          height: '72px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          position: 'relative'
        }}
        data-testid="button-orbit-chat"
      >
        <motion.img 
          src="/mascot/clean/orbit_saturn_mascot_waving_transparent_clean.png" 
          alt="Orby - Your AI Assistant"
          animate={{
            filter: isOpen 
              ? 'drop-shadow(0 0 20px rgba(6, 182, 212, 0.8)) drop-shadow(0 6px 12px rgba(0,0,0,0.4))'
              : 'drop-shadow(0 0 10px rgba(6, 182, 212, 0.5)) drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
        
        {/* Online indicator */}
        <motion.span 
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.8, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '14px',
            height: '14px',
            backgroundColor: '#4ade80',
            borderRadius: '50%',
            border: '2px solid white',
            boxShadow: '0 0 8px rgba(74, 222, 128, 0.7)'
          }}
        />
      </motion.button>
    </div>,
    document.body
  );
}
