import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { X } from "lucide-react";

export type OrbitPose = "wave" | "point" | "think";
export type OrbitDirection = "left" | "right" | "top" | "bottom";
export type OrbitChannel = "welcome" | "success" | "empty" | "error" | "tip" | "help";

const POSE_IMAGES: Record<OrbitPose, string> = {
  wave: "/mascot/orbit_mascot_cyan_saturn_style_transparent.png",
  point: "/mascot/orbit_mascot_pointing_helpful_transparent.png",
  think: "/mascot/orbit_mascot_thinking_pose_transparent.png",
};

interface OrbitMessage {
  id: string;
  channel: OrbitChannel;
  title?: string;
  message: string;
  pose: OrbitPose;
  enterFrom: OrbitDirection;
  exitTo: OrbitDirection;
  timeout?: number;
  dismissable?: boolean;
  onDismiss?: () => void;
}

interface OrbitContextType {
  showOrbit: (options: Omit<OrbitMessage, "id">) => string;
  hideOrbit: (id?: string) => void;
  showWelcome: (name?: string) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showTip: (message: string) => void;
  showEmpty: (context: string) => void;
}

const OrbitContext = createContext<OrbitContextType | null>(null);

export function useOrbit() {
  const context = useContext(OrbitContext);
  if (!context) {
    throw new Error("useOrbit must be used within OrbitExperienceProvider");
  }
  return context;
}

const getEntryVariants = (direction: OrbitDirection): Variants => {
  const distance = 400;
  const positions: Record<OrbitDirection, { x: number; y: number }> = {
    left: { x: -distance, y: 0 },
    right: { x: distance, y: 0 },
    top: { x: 0, y: -distance },
    bottom: { x: 0, y: distance },
  };

  return {
    hidden: {
      ...positions[direction],
      opacity: 0,
      scale: 0.5,
      rotate: direction === "left" ? -20 : direction === "right" ? 20 : 0,
    },
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 200,
        duration: 0.6,
      },
    },
  };
};

const getExitVariants = (direction: OrbitDirection) => {
  const distance = 400;
  const positions: Record<OrbitDirection, { x: number; y: number }> = {
    left: { x: -distance, y: 0 },
    right: { x: distance, y: 0 },
    top: { x: 0, y: -distance },
    bottom: { x: 0, y: distance },
  };

  return {
    ...positions[direction],
    opacity: 0,
    scale: 0.5,
    rotate: direction === "left" ? -20 : direction === "right" ? 20 : 0,
    transition: {
      type: "spring" as const,
      damping: 25,
      stiffness: 300,
      duration: 0.4,
    },
  };
};

function ComicBubble({ title, message, onClose, dismissable = true }: {
  title?: string;
  message: string;
  onClose: () => void;
  dismissable?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={{ delay: 0.3, type: "spring", damping: 20 }}
      className="relative max-w-sm"
    >
      <div className="relative bg-white rounded-2xl p-5 shadow-2xl border-4 border-slate-800">
        <div 
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: "16px solid transparent",
            borderRight: "16px solid transparent",
            borderTop: "20px solid #1e293b",
          }}
        />
        <div 
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: "12px solid transparent",
            borderRight: "12px solid transparent",
            borderTop: "16px solid white",
          }}
        />
        
        {dismissable && (
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center text-white hover:bg-slate-700 transition-colors shadow-lg"
            data-testid="button-orbit-close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        {title && (
          <h3 className="text-lg font-bold text-slate-800 mb-2 font-comic">
            {title}
          </h3>
        )}
        <p className="text-slate-700 leading-relaxed font-medium">
          {message}
        </p>
      </div>
    </motion.div>
  );
}

function OrbitCharacter({ pose, direction }: { pose: OrbitPose; direction: OrbitDirection }) {
  return (
    <motion.div
      animate={{
        y: [0, -8, 0],
      }}
      transition={{
        y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
      }}
      className="relative"
    >
      <img
        src={POSE_IMAGES[pose]}
        alt="Orbit"
        className="w-32 h-32 object-contain drop-shadow-2xl"
        style={{ filter: "drop-shadow(0 10px 20px rgba(6, 182, 212, 0.4))" }}
      />
      <motion.div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-3 bg-cyan-500/30 rounded-full blur-md"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  );
}

function OrbitPopup({ 
  message, 
  onClose 
}: { 
  message: OrbitMessage; 
  onClose: () => void;
}) {
  const entryVariants = getEntryVariants(message.enterFrom);
  const exitVariants = getExitVariants(message.exitTo);

  useEffect(() => {
    if (message.timeout && message.timeout > 0) {
      const timer = setTimeout(onClose, message.timeout);
      return () => clearTimeout(timer);
    }
  }, [message.timeout, onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
        onClick={message.dismissable !== false ? onClose : undefined}
      />
      
      <motion.div
        variants={entryVariants}
        initial="hidden"
        animate="visible"
        exit={exitVariants}
        className="relative flex flex-col items-center pointer-events-auto"
      >
        <ComicBubble
          title={message.title}
          message={message.message}
          onClose={onClose}
          dismissable={message.dismissable}
        />
        
        <div className="mt-4">
          <OrbitCharacter pose={message.pose} direction={message.enterFrom} />
        </div>
      </motion.div>
    </motion.div>
  );
}

export function OrbitExperienceProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<OrbitMessage[]>([]);
  const [recentlyDismissed, setRecentlyDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem("orbit_dismissed");
    if (saved) {
      setRecentlyDismissed(new Set(JSON.parse(saved)));
    }
  }, []);

  const generateId = () => `orbit-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const showOrbit = useCallback((options: Omit<OrbitMessage, "id">) => {
    const id = generateId();
    const message: OrbitMessage = { ...options, id };
    setMessages(prev => [...prev, message]);
    return id;
  }, []);

  const hideOrbit = useCallback((id?: string) => {
    if (id) {
      setMessages(prev => prev.filter(m => m.id !== id));
    } else {
      setMessages([]);
    }
  }, []);

  const getRandomDirection = (): OrbitDirection => {
    const directions: OrbitDirection[] = ["left", "right", "top", "bottom"];
    return directions[Math.floor(Math.random() * directions.length)];
  };

  const getOppositeDirection = (dir: OrbitDirection): OrbitDirection => {
    const opposites: Record<OrbitDirection, OrbitDirection> = {
      left: "right",
      right: "left",
      top: "bottom",
      bottom: "top",
    };
    return opposites[dir];
  };

  const showWelcome = useCallback((name?: string) => {
    const enterFrom = getRandomDirection();
    showOrbit({
      channel: "welcome",
      title: name ? `Hey ${name}!` : "Hey there!",
      message: "I'm Orbit, your friendly guide! Need help? Just click the help button on any page and I'll show you around!",
      pose: "wave",
      enterFrom,
      exitTo: getOppositeDirection(enterFrom),
      timeout: 6000,
      dismissable: true,
    });
  }, [showOrbit]);

  const showSuccess = useCallback((message: string) => {
    const enterFrom = getRandomDirection();
    showOrbit({
      channel: "success",
      title: "Awesome!",
      message,
      pose: "wave",
      enterFrom,
      exitTo: getOppositeDirection(enterFrom),
      timeout: 4000,
      dismissable: true,
    });
  }, [showOrbit]);

  const showError = useCallback((message: string) => {
    const enterFrom = getRandomDirection();
    showOrbit({
      channel: "error",
      title: "Hmm, something's not right...",
      message,
      pose: "think",
      enterFrom,
      exitTo: getOppositeDirection(enterFrom),
      timeout: 8000,
      dismissable: true,
    });
  }, [showOrbit]);

  const showTip = useCallback((message: string) => {
    const enterFrom = getRandomDirection();
    showOrbit({
      channel: "tip",
      title: "Pro Tip!",
      message,
      pose: "point",
      enterFrom,
      exitTo: getOppositeDirection(enterFrom),
      timeout: 5000,
      dismissable: true,
    });
  }, [showOrbit]);

  const showEmpty = useCallback((context: string) => {
    const enterFrom = getRandomDirection();
    showOrbit({
      channel: "empty",
      title: "Let's get started!",
      message: context,
      pose: "point",
      enterFrom,
      exitTo: getOppositeDirection(enterFrom),
      timeout: 7000,
      dismissable: true,
    });
  }, [showOrbit]);

  const handleClose = (id: string) => {
    hideOrbit(id);
  };

  return (
    <OrbitContext.Provider value={{ 
      showOrbit, 
      hideOrbit, 
      showWelcome, 
      showSuccess, 
      showError, 
      showTip,
      showEmpty 
    }}>
      {children}
      
      <AnimatePresence mode="wait">
        {messages.length > 0 && (
          <OrbitPopup
            key={messages[0].id}
            message={messages[0]}
            onClose={() => handleClose(messages[0].id)}
          />
        )}
      </AnimatePresence>
    </OrbitContext.Provider>
  );
}

export function OrbitEmptyState({ 
  title,
  message, 
  actionLabel,
  onAction,
  icon
}: { 
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="mb-6"
      >
        <img
          src={POSE_IMAGES.point}
          alt="Orbit"
          className="w-28 h-28 object-contain drop-shadow-xl"
          style={{ filter: "drop-shadow(0 8px 16px rgba(6, 182, 212, 0.3))" }}
        />
      </motion.div>
      
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-md text-center border border-cyan-500/30 shadow-xl shadow-cyan-500/10">
        <div 
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: "12px solid transparent",
            borderRight: "12px solid transparent",
            borderBottom: "16px solid rgba(6, 182, 212, 0.3)",
          }}
        />
        
        {icon && (
          <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4 text-cyan-400">
            {icon}
          </div>
        )}
        
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-300 mb-6">{message}</p>
        
        {actionLabel && onAction && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAction}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow"
            data-testid="button-orbit-action"
          >
            {actionLabel}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

export function OrbitSuccessToast({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={POSE_IMAGES.wave}
        alt="Orbit"
        className="w-10 h-10 object-contain"
      />
      <div>
        <p className="font-medium text-slate-800">{message}</p>
      </div>
    </div>
  );
}

export function OrbitFloatingHelper() {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState("");
  const { showTip } = useOrbit();

  const tips = [
    "Click any help button to learn about that feature!",
    "Use the sidebar to navigate between modules.",
    "Need to add workers? Head to the Workers page!",
    "Check the Dashboard for a quick overview of everything.",
    "The Pricing page shows all available tools and bundles.",
  ];

  const showRandomTip = () => {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    showTip(randomTip);
  };

  return null;
}
