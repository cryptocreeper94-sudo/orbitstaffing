/**
 * Hallmark Watermark Component
 * Digital seal/logo that stamps everything as authentic ORBIT product
 * Can be used on documents, credentials, emails, etc.
 */
import React from 'react';
import { Shield } from 'lucide-react';

interface HallmarkWatermarkProps {
  size?: 'small' | 'medium' | 'large'; // small: 80px, medium: 120px, large: 200px
  showText?: boolean;
  opacity?: number; // 0-100, default 30
  className?: string;
}

export function HallmarkWatermark({
  size = 'medium',
  showText = true,
  opacity = 30,
  className = '',
}: HallmarkWatermarkProps) {
  const sizeMap = {
    small: 'w-20 h-20',
    medium: 'w-32 h-32',
    large: 'w-52 h-52',
  };

  const textSizeMap = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-lg',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center ${sizeMap[size]} ${className}`}
      style={{ opacity: opacity / 100 }}
    >
      {/* Outer Ring */}
      <div className={`absolute ${sizeMap[size]} border-2 border-cyan-400 rounded-full`} />

      {/* Middle Ring */}
      <div
        className={`absolute ${sizeMap[size]} border border-cyan-300 rounded-full`}
        style={{ width: size === 'small' ? '64px' : size === 'medium' ? '104px' : '184px', height: size === 'small' ? '64px' : size === 'medium' ? '104px' : '184px' }}
      />

      {/* Inner Content */}
      <div className="flex flex-col items-center justify-center z-10">
        <Shield className={`text-cyan-400 ${size === 'small' ? 'w-6 h-6' : size === 'medium' ? 'w-10 h-10' : 'w-16 h-16'}`} />
        {showText && (
          <>
            <div className={`font-bold text-cyan-400 mt-1 ${textSizeMap[size]}`}>ORBIT</div>
            <div className={`text-cyan-300 whitespace-nowrap ${size === 'small' ? 'text-[10px]' : size === 'medium' ? 'text-[11px]' : 'text-xs'}`}>
              VERIFIED
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Hallmark Badge - Smaller, inline version
 * Can be placed on emails, invoices, worker profiles, etc.
 */
export function HallmarkBadge() {
  return (
    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-900/20 to-cyan-800/20 border border-cyan-500/30 rounded-full px-3 py-1.5">
      <Shield className="w-4 h-4 text-cyan-400" />
      <span className="text-xs font-bold text-cyan-300">Digital Hallmark™</span>
    </div>
  );
}

/**
 * Hallmark Watermark - Full page background
 * Subtle watermark that appears in background of documents/credentials
 */
export function HallmarkPageWatermark() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <div className="relative w-96 h-96">
          {/* Outer Ring */}
          <div className="absolute inset-0 border-4 border-cyan-400 rounded-full" />

          {/* Middle Ring */}
          <div className="absolute inset-8 border-2 border-cyan-300 rounded-full" />

          {/* Inner Ring */}
          <div className="absolute inset-16 border border-cyan-200 rounded-full" />

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Shield className="w-24 h-24 text-cyan-400" />
            <div className="text-2xl font-bold text-cyan-400 mt-4">ORBIT</div>
            <div className="text-sm text-cyan-300">Digital Hallmark™</div>
          </div>
        </div>
      </div>
    </div>
  );
}
