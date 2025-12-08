import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import saturnImage from '@assets/generated_images/floating_saturn_planet_pure_transparency.png';
import { Download, X } from 'lucide-react';

interface HallmarkBadgeProps {
  serialNumber?: string;
  size?: 'sm' | 'md' | 'lg';
  verificationUrl?: string;
}

export function HallmarkBadge({ 
  serialNumber = '000000001-01', 
  size = 'md',
  verificationUrl = 'https://orbitstaffing.io/verify'
}: HallmarkBadgeProps) {
  const [showQRModal, setShowQRModal] = useState(false);
  
  const sizeMap = {
    sm: { 
      container: 'w-32 h-40',
      saturn: 'w-32 h-32',
      qr: 24,
      qrContainer: 'w-6 h-6',
      serialText: 'text-xs',
      poweredText: 'text-[8px]'
    },
    md: { 
      container: 'w-48 h-56',
      saturn: 'w-48 h-48',
      qr: 32,
      qrContainer: 'w-8 h-8',
      serialText: 'text-sm',
      poweredText: 'text-[10px]'
    },
    lg: { 
      container: 'w-64 h-72',
      saturn: 'w-64 h-64',
      qr: 40,
      qrContainer: 'w-10 h-10',
      serialText: 'text-base',
      poweredText: 'text-xs'
    }
  };
  
  const { container, saturn, qr, qrContainer, serialText, poweredText } = sizeMap[size];

  const downloadQR = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1000;
    canvas.height = 1000;
    
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 1000, 1000);
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000"></svg>`;
      const qrSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      qrSvg.setAttribute('width', '1000');
      qrSvg.setAttribute('height', '1000');
      
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ORBIT-QR-${serialNumber}.png`;
            a.click();
            URL.revokeObjectURL(url);
          }
        });
      };
      
      const svgElement = document.getElementById(`qr-${serialNumber}`);
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
        img.src = URL.createObjectURL(svgBlob);
      }
    }
  };

  return (
    <>
      <div className={`${container} relative inline-flex flex-col items-center justify-center`} data-testid="hallmark-badge">
        {/* Saturn Background with Glow */}
        <div className="relative">
          <div className={`${saturn} relative`}>
            <img 
              src={saturnImage} 
              alt="ORBIT Saturn" 
              className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]"
              style={{
                filter: 'drop-shadow(0 0 30px rgba(6, 182, 212, 0.5)) drop-shadow(0 0 10px rgba(6, 182, 212, 0.8))'
              }}
            />
            
            {/* QR Code Centered in Saturn */}
            <div 
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${qrContainer} bg-white rounded-lg p-1 cursor-pointer hover:scale-110 transition-transform shadow-lg`}
              onClick={() => setShowQRModal(true)}
              title="Click to enlarge QR code"
            >
              <QRCodeSVG
                id={`qr-${serialNumber}`}
                value={verificationUrl}
                size={qr}
                level="H"
                includeMargin={false}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* Serial Number Below Saturn */}
        <div className="mt-2 text-center space-y-1">
          <div className={`${poweredText} text-cyan-400 font-semibold tracking-wider uppercase`}>
            Powered by ORBIT
          </div>
          <div className={`${serialText} font-mono font-bold text-amber-300 tracking-wider`}>
            #{serialNumber}
          </div>
        </div>

        {/* Subtle outer glow */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none -z-10"
          style={{
            boxShadow: '0 0 40px rgba(6, 182, 212, 0.3)',
          }}
        />
      </div>

      {/* QR Code Enlargement Modal */}
      {showQRModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowQRModal(false)}
        >
          <div 
            className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-cyan-400 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Title */}
            <h3 className="text-2xl font-bold text-cyan-300 mb-6 text-center">
              Verification QR Code
            </h3>

            {/* Large QR Code */}
            <div className="bg-white p-6 rounded-xl mb-6 flex items-center justify-center">
              <QRCodeSVG
                value={verificationUrl}
                size={300}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* Serial Number */}
            <div className="text-center mb-6">
              <div className="text-xs text-gray-400 mb-1">Asset Serial Number</div>
              <div className="text-xl font-mono font-bold text-amber-300">
                #{serialNumber}
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={downloadQR}
              className="w-full py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download QR Code
            </button>

            {/* Verification URL */}
            <div className="mt-4 text-center">
              <div className="text-xs text-gray-400 mb-1">Verification URL</div>
              <div className="text-xs text-cyan-300 font-mono break-all bg-slate-950 rounded p-2 border border-cyan-900">
                {verificationUrl}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
