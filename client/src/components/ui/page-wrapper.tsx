import React, { ReactNode } from 'react';
import { motion, Transition } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  variant?: 'fade' | 'slide' | 'scale';
}

const transitions: Record<string, Transition> = {
  fade: { duration: 0.2 },
  slide: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
  scale: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
};

const variantConfigs = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  },
};

export function PageWrapper({ 
  children, 
  className = '', 
  variant = 'slide' 
}: PageWrapperProps) {
  const config = variantConfigs[variant];
  
  return (
    <motion.div
      className={cn("min-h-screen", className)}
      initial={config.initial}
      animate={config.animate}
      exit={config.exit}
      transition={transitions[variant]}
    >
      {children}
    </motion.div>
  );
}

interface ContentSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ContentSection({ children, className = '', delay = 0 }: ContentSectionProps) {
  return (
    <motion.section
      className={cn("", className)}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.section>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({ children, className = '', staggerDelay = 0.05 }: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className = '' }: StaggerItemProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      {children}
    </motion.div>
  );
}

export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <motion.div
      className={cn(
        "rounded-full border-t-cyan-500 border-r-cyan-500/30 border-b-cyan-500/30 border-l-cyan-500/30",
        sizes[size],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" as const }}
    />
  );
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <motion.div
          className="mb-4"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" as const }}
        >
          <img 
            src="/mascot/orbit_mascot_cyan_saturn_style_transparent.png" 
            alt="Loading..." 
            className="w-24 h-24 mx-auto drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]"
          />
        </motion.div>
        <LoadingSpinner size="md" className="mx-auto mb-3" />
        <p className="text-cyan-400 text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}
