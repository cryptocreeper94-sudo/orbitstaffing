import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

const GREETING_SHOWN_KEY = "orby_greeting_shown";

// Orby's dialogue responses
const ORBY_DIALOGUES = [
  "Hey there! 👋 Need help navigating ORBIT? Just ask!",
  "I'm Orby, your friendly staffing assistant! 🪐",
  "Payroll, compliance, workers - I've got you covered!",
  "Click around and explore! I'll be right here if you need me.",
  "Running a staffing agency? Let me show you the ropes!",
  "Welcome to ORBIT Staffing OS! The future of workforce management.",
  "Got questions? I've got answers! Well, most of the time... 😄",
  "Time tracking, job matching, payroll - it's all automated here!",
];

export function OrbitChatAssistant() {
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentDialogue, setCurrentDialogue] = useState(0);
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show greeting bubble on first visit
  useEffect(() => {
    if (!mounted) return;
    
    const greetingShown = sessionStorage.getItem(GREETING_SHOWN_KEY);
    if (!greetingShown) {
      const timer = setTimeout(() => {
        setShowBubble(true);
        sessionStorage.setItem(GREETING_SHOWN_KEY, "true");
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setShowBubble(false);
        }, 5000);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [mounted]);

  const handleMascotClick = () => {
    if (isExpanded) {
      // If already expanded, close
      setIsExpanded(false);
      setShowBubble(false);
    } else {
      // Expand and show new dialogue
      setIsExpanded(true);
      setCurrentDialogue((prev) => (prev + 1) % ORBY_DIALOGUES.length);
      setShowBubble(true);
      
      // Auto-hide bubble after 6 seconds
      setTimeout(() => {
        setShowBubble(false);
        setIsExpanded(false);
      }, 6000);
    }
  };

  const handleBubbleClick = () => {
    // Cycle to next dialogue
    setCurrentDialogue((prev) => (prev + 1) % ORBY_DIALOGUES.length);
  };

  if (!mounted) return null;

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '8px'
      }}
    >
      {/* Comic-style dialogue bubble */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0, x: 100, y: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0, x: 100, y: 50 }}
            transition={{ 
              type: "spring", 
              damping: 15, 
              stiffness: 200,
              duration: 0.5 
            }}
            onClick={handleBubbleClick}
            style={{
              maxWidth: '280px',
              padding: '16px 20px',
              background: 'white',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 3px rgba(6, 182, 212, 0.4)',
              position: 'relative',
              cursor: 'pointer',
              marginBottom: '8px'
            }}
            data-testid="orby-dialogue-bubble"
          >
            {/* Dialogue text */}
            <p style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: 500,
              color: '#1e293b',
              lineHeight: 1.5
            }}>
              {ORBY_DIALOGUES[currentDialogue]}
            </p>
            
            {/* Click hint */}
            <p style={{
              margin: '8px 0 0 0',
              fontSize: '11px',
              color: '#94a3b8',
              textAlign: 'right'
            }}>
              tap for more
            </p>

            {/* Comic bubble tail pointing down-right */}
            <div style={{
              position: 'absolute',
              bottom: '-12px',
              right: '24px',
              width: 0,
              height: 0,
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderTop: '14px solid white',
              filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))'
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orby Mascot */}
      <motion.button
        onClick={handleMascotClick}
        animate={{
          scale: isExpanded ? 1.3 : 1,
          y: isExpanded ? -10 : 0
        }}
        whileHover={{ scale: isExpanded ? 1.35 : 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", damping: 15, stiffness: 300 }}
        style={{
          width: isExpanded ? '100px' : '72px',
          height: isExpanded ? '100px' : '72px',
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
            filter: isExpanded 
              ? 'drop-shadow(0 0 24px rgba(6, 182, 212, 0.9)) drop-shadow(0 8px 16px rgba(0,0,0,0.5))'
              : 'drop-shadow(0 0 12px rgba(6, 182, 212, 0.6)) drop-shadow(0 4px 8px rgba(0,0,0,0.4))'
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
          onError={(e) => {
            console.error('Orby mascot image failed to load');
            (e.target as HTMLImageElement).style.display = 'none';
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
            border: '2px solid #1e293b',
            boxShadow: '0 0 8px rgba(74, 222, 128, 0.7)'
          }}
        />
      </motion.button>
    </div>,
    document.body
  );
}
