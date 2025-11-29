import { motion } from "framer-motion";
import orbitWave from "@assets/generated_images/orbit_mascot_cyan_saturn_style.png";
import orbitPoint from "@assets/generated_images/orbit_mascot_pointing_helpful.png";

export type OrbitPose = "wave" | "point" | "think";

interface OrbitMascotProps {
  pose?: OrbitPose;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
  className?: string;
}

const poseImages: Record<OrbitPose, string> = {
  wave: orbitWave,
  point: orbitPoint,
  think: orbitWave,
};

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
};

export function OrbitMascot({ 
  pose = "wave", 
  size = "md", 
  animate = true,
  className = "" 
}: OrbitMascotProps) {
  const imageSrc = poseImages[pose];

  return (
    <motion.div
      initial={animate ? { scale: 0, rotate: -10 } : false}
      animate={animate ? { scale: 1, rotate: 0 } : false}
      transition={{ type: "spring", damping: 15, stiffness: 200 }}
      className={`relative ${className}`}
    >
      <motion.img
        src={imageSrc}
        alt="Orbit - Your helpful guide"
        className={`${sizeClasses[size]} object-contain drop-shadow-lg`}
        animate={animate ? {
          y: [0, -5, 0],
        } : false}
        transition={{
          y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
      />
      {animate && (
        <motion.div
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-cyan-500/20 rounded-full blur-sm"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  );
}

interface SpeechBubbleProps {
  children: React.ReactNode;
  position?: "right" | "left" | "top";
  className?: string;
}

export function SpeechBubble({ 
  children, 
  position = "right",
  className = "" 
}: SpeechBubbleProps) {
  const positionStyles = {
    right: "left-full ml-4",
    left: "right-full mr-4",
    top: "bottom-full mb-4 left-1/2 -translate-x-1/2",
  };

  const tailStyles = {
    right: "left-0 -translate-x-2 top-1/2 -translate-y-1/2 border-r-cyan-500/30 border-t-transparent border-b-transparent border-l-transparent",
    left: "right-0 translate-x-2 top-1/2 -translate-y-1/2 border-l-cyan-500/30 border-t-transparent border-b-transparent border-r-transparent",
    top: "top-full left-1/2 -translate-x-1/2 border-t-cyan-500/30 border-l-transparent border-r-transparent border-b-transparent",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className={`absolute ${positionStyles[position]} ${className}`}
    >
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/30 rounded-2xl p-4 shadow-lg shadow-cyan-500/10 max-w-xs">
        <div className={`absolute w-0 h-0 border-8 ${tailStyles[position]}`} />
        <div className="text-slate-200 text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

interface OrbitWithSpeechProps {
  message: string;
  pose?: OrbitPose;
  size?: "sm" | "md" | "lg";
  bubblePosition?: "right" | "left" | "top";
  className?: string;
}

export function OrbitWithSpeech({
  message,
  pose = "wave",
  size = "md",
  bubblePosition = "right",
  className = ""
}: OrbitWithSpeechProps) {
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <OrbitMascot pose={pose} size={size} />
      <SpeechBubble position={bubblePosition}>
        {message}
      </SpeechBubble>
    </div>
  );
}

export function OrbitGreeting({ name }: { name?: string }) {
  const greeting = name 
    ? `Hey ${name}! I'm Orbit, your guide to the platform. Let me show you around!`
    : "Hey there! I'm Orbit, your friendly guide. Ready to explore?";

  return (
    <div className="flex items-start gap-4 p-4">
      <OrbitMascot pose="wave" size="lg" />
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/30 rounded-2xl p-5 shadow-lg max-w-md"
      >
        <p className="text-white text-lg font-medium mb-2">
          {greeting}
        </p>
        <p className="text-slate-400 text-sm">
          Click through the tour to learn how everything works together!
        </p>
      </motion.div>
    </div>
  );
}
