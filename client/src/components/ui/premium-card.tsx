import React, { ReactNode, HTMLAttributes, ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface PremiumCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  variant?: 'default' | 'glow' | 'gradient' | 'glass';
  hover?: boolean;
}

export const PremiumCard = forwardRef<HTMLDivElement, PremiumCardProps>(({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  onClick,
  ...props
}, ref) => {
  const baseClasses = "rounded-xl border p-4 transition-all duration-200";
  
  const variantClasses = {
    default: "bg-slate-800/50 border-slate-700/50",
    glow: "bg-slate-800/50 border-cyan-500/30 shadow-lg shadow-cyan-500/10",
    gradient: "bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50",
    glass: "bg-slate-800/30 backdrop-blur-sm border-slate-600/30",
  };

  const hoverClasses = hover ? "card-lift cursor-pointer" : "";

  return (
    <motion.div
      ref={ref}
      className={cn(baseClasses, variantClasses[variant], hoverClasses, className)}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
});
PremiumCard.displayName = 'PremiumCard';

interface PremiumStatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export function PremiumStatCard({
  label,
  value,
  subtext,
  icon,
  trend,
  trendValue,
  className = '',
}: PremiumStatCardProps) {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  return (
    <PremiumCard variant="gradient" className={cn("relative overflow-hidden", className)}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400 font-medium">{label}</span>
          {icon && (
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              {icon}
            </div>
          )}
        </div>
        
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        
        <div className="flex items-center justify-between">
          {subtext && <span className="text-xs text-gray-500">{subtext}</span>}
          {trend && trendValue && (
            <span className={cn("text-xs font-medium", trendColors[trend])}>
              {trendIcons[trend]} {trendValue}
            </span>
          )}
        </div>
      </div>
    </PremiumCard>
  );
}

interface PremiumButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg';
}

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  ...props
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 btn-squish focus-ring";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white shadow-lg shadow-cyan-500/25",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600",
    ghost: "bg-transparent hover:bg-slate-800 text-gray-300 hover:text-white",
    glow: "bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white shadow-lg shadow-cyan-500/30 glow-border",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], disabledClasses, className)}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      {...props}
    >
      {children}
    </motion.button>
  );
});
PremiumButton.displayName = 'PremiumButton';

interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(({ 
  title, 
  subtitle, 
  action, 
  className = '',
  ...props 
}, ref) => {
  return (
    <div ref={ref} className={cn("flex items-center justify-between mb-4", className)} {...props}>
      <div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
});
SectionHeader.displayName = 'SectionHeader';

interface GlowDividerProps {
  className?: string;
}

export function GlowDivider({ className = '' }: GlowDividerProps) {
  return (
    <div className={cn("relative h-px my-6", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent blur-sm" />
    </div>
  );
}
