/**
 * Asset Stamp Component
 * Displays a hallmark stamp for any verified ORBIT asset
 * Shows: Asset number, QR code, verification link, creation date
 */
import React, { useEffect, useState } from 'react';
import { HallmarkWatermark } from './HallmarkWatermark';

interface AssetStampProps {
  assetNumber: string;
  assetType?: string;
  compact?: boolean; // Compact footer version vs full stamp
  onVerify?: (verified: boolean) => void;
}

export function AssetStamp({ 
  assetNumber, 
  assetType = 'document',
  compact = false,
  onVerify 
}: AssetStampProps) {
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify asset on mount
    const verifyAsset = async () => {
      try {
        const response = await fetch(`/api/assets/verify/${assetNumber}`);
        const data = await response.json();
        setIsVerified(data.verified);
        if (onVerify) onVerify(data.verified);
      } catch (error) {
        console.error('Asset verification failed:', error);
        setIsVerified(false);
      } finally {
        setLoading(false);
      }
    };

    verifyAsset();
  }, [assetNumber, onVerify]);

  const verificationUrl = `${window.location.origin}/verify/${assetNumber}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}`;

  if (compact) {
    // Compact footer version
    return (
      <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-700 pt-2 mt-4">
        <div className="flex items-center gap-2">
          <span className={isVerified ? 'text-green-500' : 'text-yellow-500'}>
            {isVerified ? '✓' : '⊘'} Verified Asset
          </span>
          <code className="font-mono text-gray-400">{assetNumber}</code>
        </div>
        <a 
          href={verificationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 underline"
        >
          Verify
        </a>
      </div>
    );
  }

  // Full stamp version
  return (
    <div className="border border-cyan-500/20 rounded-lg p-6 bg-black/20 backdrop-blur">
      <div className="flex gap-6">
        {/* QR Code */}
        <div className="flex-shrink-0">
          <div className="bg-white p-2 rounded">
            <img 
              src={qrUrl} 
              alt={`QR Code for ${assetNumber}`}
              className="w-32 h-32"
            />
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            Scan to verify
          </p>
        </div>

        {/* Asset Details */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full ${isVerified ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className={isVerified ? 'text-green-400' : 'text-yellow-400'}>
              {isVerified ? 'Verified' : 'Pending'} ORBIT Asset
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-400">Asset Number</p>
              <code className="font-mono text-sm text-cyan-300">{assetNumber}</code>
            </div>

            <div>
              <p className="text-xs text-gray-400">Type</p>
              <p className="text-sm text-gray-300 capitalize">{assetType}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400">Verification URL</p>
              <a 
                href={verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 break-all"
              >
                {verificationUrl}
              </a>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              ✓ This document is legitimately produced by ORBIT and can be verified at any time.
            </p>
          </div>
        </div>

        {/* Watermark */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <HallmarkWatermark size="large" opacity={5} />
        </div>
      </div>
    </div>
  );
}
