/**
 * CRM Account Visibility Toggle
 * Allows Dev and Sidonie to hide/show accounts
 */
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CRMVisibilityToggleProps {
  companyId: string;
  companyName: string;
  isHidden: boolean;
  canToggle: boolean;
  onToggle: (companyId: string, isHidden: boolean) => Promise<void>;
}

export default function CRMVisibilityToggle({
  companyId,
  companyName,
  isHidden,
  canToggle,
  onToggle,
}: CRMVisibilityToggleProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (!canToggle || isLoading) return;

    setIsLoading(true);
    try {
      await onToggle(companyId, !isHidden);
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!canToggle) return null;

  return (
    <Button
      onClick={handleToggle}
      disabled={isLoading}
      size="sm"
      className={`flex items-center gap-1 ${
        isHidden
          ? 'bg-red-900/30 hover:bg-red-900/50 text-red-300 border border-red-600/50'
          : 'bg-green-900/30 hover:bg-green-900/50 text-green-300 border border-green-600/50'
      }`}
      data-testid={`toggle-visibility-${companyId}`}
      title={isHidden ? 'Click to show account to other admins' : 'Click to hide account from other admins'}
    >
      {isHidden ? (
        <>
          <EyeOff className="w-3 h-3" />
          Hidden
        </>
      ) : (
        <>
          <Eye className="w-3 h-3" />
          Visible
        </>
      )}
    </Button>
  );
}
