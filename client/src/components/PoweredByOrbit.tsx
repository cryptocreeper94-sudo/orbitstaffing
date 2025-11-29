/**
 * ORBIT Hallmark Asset Component
 * Every rendered instance of this gets a unique ORBIT-ASSET-XXXX-XXXX serial number
 * Auditable, trackable, and designed for future blockchain/QR code integration
 */
import React, { useMemo, useEffect } from 'react';
import { HallmarkWatermark } from './HallmarkWatermark';
import { generateAssetNumber } from '@shared/asset-tracking';

interface HallmarkAssetProps {
  assetType?: string;
  franchiseeId?: string;
  customerId?: string;
  metadata?: Record<string, any>;
  onAssetGenerated?: (assetNumber: string) => void;
}

export function HallmarkAsset({
  assetType = 'powered_by_button',
  franchiseeId,
  customerId,
  metadata = {},
  onAssetGenerated,
}: HallmarkAssetProps) {
  const assetNumber = useMemo(() => generateAssetNumber(), []);

  // Register asset to database on component mount
  useEffect(() => {
    const registerAsset = async () => {
      try {
        const response = await fetch('/api/assets/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assetNumber,
            type: assetType,
            franchiseeId,
            customerId,
            metadata: {
              ...metadata,
              registeredAt: new Date().toISOString(),
              userAgent: navigator.userAgent,
            },
          }),
        });

        if (response.ok && onAssetGenerated) {
          onAssetGenerated(assetNumber);
        }
      } catch (error) {
        console.error('Failed to register asset:', error);
        // Still render the component even if registration fails
      }
    };

    registerAsset();
  }, [assetNumber, assetType, franchiseeId, customerId, metadata, onAssetGenerated]);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Saturn Watermark Background - The Hallmark */}
      <div className="relative overflow-hidden group rounded-lg p-8 border border-cyan-500/20 hover:border-cyan-400/50 transition-all">
        <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
          <HallmarkWatermark size="large" opacity={20} />
        </div>

        {/* Main Asset Content */}
        <div className="relative z-10 flex flex-col items-center gap-4">
          {/* Brand Text */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm tracking-wide">
              powered by
            </span>
            <span className="font-black text-cyan-400 text-2xl">
              ORBIT
            </span>
          </div>

          {/* Asset Number - Unique Hallmark */}
          <div className="text-center">
            <div className="font-mono text-cyan-300 text-sm tracking-widest font-bold">
              {assetNumber}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              ORBIT Hallmark Asset
            </div>
          </div>

          {/* QR Code Placeholder (for future use) */}
          <div 
            className="w-16 h-16 bg-white/5 border border-cyan-500/30 rounded flex items-center justify-center text-xs text-gray-500"
            title="QR Code / Verification Code (Future)"
          >
            QR
          </div>

          {/* Verification Info */}
          <div className="text-xs text-gray-400 text-center max-w-xs">
            <p>This is a legitimate ORBIT licensed asset.</p>
            <p className="mt-1 text-cyan-400">Verify at orbitstaffing.io/verify</p>
          </div>
        </div>
      </div>

      {/* Compliance Footer */}
      <div className="text-xs text-gray-600 text-center max-w-xs border-t border-gray-700 pt-3">
        <p>
          ⚖️ This hallmark asset is non-removable per ORBIT franchise agreement.
        </p>
        <p className="mt-1 text-gray-500">
          Asset tracking for audit and verification purposes.
        </p>
      </div>
    </div>
  );
}

/**
 * Powered by ORBIT Button - Simplified version for dashboard footers
 * Non-removable required hallmark with unique asset number
 * Click to visit ORBIT landing page & lead generation
 */
interface PoweredByOrbitProps {
  franchiseeId?: string;
  customerId?: string;
  onAssetGenerated?: (assetNumber: string) => void;
}

export function PoweredByOrbit({ 
  franchiseeId, 
  customerId,
  onAssetGenerated 
}: PoweredByOrbitProps = {}) {
  const assetNumber = useMemo(() => generateAssetNumber(), []);

  useEffect(() => {
    const registerAsset = async () => {
      try {
        const response = await fetch('/api/assets/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assetNumber,
            type: 'powered_by_button',
            franchiseeId,
            customerId,
            metadata: {
              location: 'dashboard_footer',
              isClickable: true,
              registeredAt: new Date().toISOString(),
            },
          }),
        });

        if (response.ok && onAssetGenerated) {
          onAssetGenerated(assetNumber);
        }
      } catch (error) {
        console.error('Failed to register asset:', error);
      }
    };

    registerAsset();
  }, [assetNumber, franchiseeId, customerId, onAssetGenerated]);

  const handleClick = () => {
    window.location.href = '/?source=hallmark&asset=' + assetNumber;
  };

  return (
    <button
      onClick={handleClick}
      className="relative overflow-hidden group px-8 py-4 rounded-lg transition-all hover:scale-105 active:scale-95 flex flex-col items-center gap-3"
      data-testid="button-powered-by-orbit"
      data-asset-number={assetNumber}
      aria-label="Powered by ORBIT - Click to learn more"
      style={{
        pointerEvents: 'auto',
        cursor: 'pointer',
      }}
    >
      {/* Saturn Watermark Background */}
      <div className="absolute inset-0 opacity-25 group-hover:opacity-40 transition-opacity">
        <HallmarkWatermark size="medium" opacity={25} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        {/* Brand Text */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-sm tracking-wide">
            powered by
          </span>
          <span className="font-black text-cyan-400 text-lg">
            ORBIT
          </span>
        </div>

        {/* Asset Number */}
        <div 
          className="font-mono text-cyan-300 text-xs tracking-widest font-bold"
          title="ORBIT Hallmark Asset Number - Verifiable & Auditable"
          data-testid="asset-number-display"
        >
          {assetNumber}
        </div>

        {/* Badge */}
        <div className="text-xs text-gray-400 text-center">
          Licensed ORBIT Asset
        </div>
      </div>

      {/* Border */}
      <div className="absolute inset-0 border border-cyan-500/30 rounded-lg group-hover:border-cyan-400/60 transition-colors pointer-events-none" />
    </button>
  );
}
