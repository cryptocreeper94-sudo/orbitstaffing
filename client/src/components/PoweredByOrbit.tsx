/**
 * Powered by ORBIT Button
 * For franchisee/customer dashboards
 * Click to visit ORBIT landing page
 */
import React from 'react';
import { HallmarkWatermark } from './HallmarkWatermark';

export function PoweredByOrbit() {
  const handleClick = () => {
    // Navigate to ORBIT landing page
    window.location.href = '/';
  };

  return (
    <button
      onClick={handleClick}
      className="relative overflow-hidden group px-6 py-3 rounded-lg transition-all hover:scale-105 active:scale-95"
      data-testid="button-powered-by-orbit"
      aria-label="Powered by ORBIT - Click to learn more"
    >
      {/* Saturn Watermark Background */}
      <div className="absolute inset-0 opacity-30 group-hover:opacity-40 transition-opacity">
        <HallmarkWatermark size="medium" opacity={30} />
      </div>

      {/* Text Content */}
      <div className="relative z-10 flex items-center gap-2">
        <span className="font-bold text-white text-sm tracking-wide">
          powered by
        </span>
        <span className="font-black text-cyan-400 text-lg">
          ORBIT
        </span>
      </div>

      {/* Subtle Border */}
      <div className="absolute inset-0 border border-cyan-500/30 rounded-lg group-hover:border-cyan-400/60 transition-colors pointer-events-none" />
    </button>
  );
}
