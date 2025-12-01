import React from 'react';
import { Database, Users, Briefcase, FileText, DollarSign } from 'lucide-react';
import { SandboxToggle } from './SandboxBanner';
import { useMode } from '@/contexts/ModeContext';

interface EmptyStateProps {
  icon?: 'database' | 'users' | 'jobs' | 'documents' | 'money';
  title: string;
  description: string;
  showSandboxOption?: boolean;
}

const iconMap = {
  database: Database,
  users: Users,
  jobs: Briefcase,
  documents: FileText,
  money: DollarSign,
};

export function EmptyState({ 
  icon = 'database', 
  title, 
  description,
  showSandboxOption = true 
}: EmptyStateProps) {
  const { isLive } = useMode();
  const Icon = iconMap[icon];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center" data-testid="empty-state">
      <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm max-w-md mb-6">{description}</p>
      
      {showSandboxOption && isLive && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-gray-500">Want to see how this looks with data?</p>
          <SandboxToggle />
        </div>
      )}
    </div>
  );
}

export function LiveModeIndicator() {
  const { isLive } = useMode();
  
  if (!isLive) return null;
  
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-medium" data-testid="live-mode-indicator">
      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      Live Data
    </div>
  );
}
