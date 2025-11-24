import React from 'react';
import { default as QRCode } from 'qrcode.react';

interface HallmarkBadgeProps {
  serialNumber?: string;
  size?: 'sm' | 'md' | 'lg';
  verificationUrl?: string;
}

export function HallmarkBadge({ 
  serialNumber = '000', 
  size = 'md',
  verificationUrl = 'https://orbitstaffing.net/verify'
}: HallmarkBadgeProps) {
  
  const sizeMap = {
    sm: { container: 'w-24 h-24', qr: 80, text: 'text-xs' },
    md: { container: 'w-32 h-32', qr: 120, text: 'text-sm' },
    lg: { container: 'w-48 h-48', qr: 180, text: 'text-base' }
  };
  
  const { container, qr, text } = sizeMap[size];

  return (
    <div className={`${container} relative inline-flex items-center justify-center`} data-testid="hallmark-badge">
      {/* Outer holographic ring with gold trim */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 p-0.5 animate-pulse" 
        style={{
          backgroundImage: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 25%, #fcd34d 50%, #fbbf24 75%, #f59e0b 100%)',
          backgroundSize: '200% 200%',
          animation: 'shimmer 3s ease-in-out infinite'
        }}
      />
      
      {/* Middle ring - darker gold */}
      <div className="absolute inset-1 rounded-full bg-gradient-to-br from-amber-600 to-yellow-600 p-1" />
      
      {/* Inner container - dark background */}
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-slate-900 via-slate-950 to-black flex flex-col items-center justify-center">
        
        {/* Holographic shine effect */}
        <div 
          className="absolute inset-0 rounded-full opacity-30 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.5) 0%, transparent 50%)',
          }}
        />
        
        {/* QR Code - centered */}
        <div className="relative z-10 flex flex-col items-center gap-1">
          <QRCode
            value={verificationUrl}
            size={qr}
            level="H"
            includeMargin={false}
            className="rounded-sm"
            style={{ filter: 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.6))' }}
          />
          
          {/* Serial number below QR */}
          <div className={`${text} font-mono font-bold text-amber-300 text-center mt-1`}>
            <div className="text-[10px] text-yellow-200">SEAL</div>
            <div>#{serialNumber}</div>
          </div>
        </div>
      </div>

      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          boxShadow: '0 0 20px rgba(6, 182, 212, 0.4), 0 0 40px rgba(251, 191, 36, 0.2)',
        }}
      />
      
      {/* Animated shimmer style */}
      <style>{`
        @keyframes shimmer {
          0%, 100% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
        }
      `}</style>
    </div>
  );
}
