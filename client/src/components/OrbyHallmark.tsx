import React, { useState, useId } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, X, ExternalLink } from 'lucide-react';

interface OrbyHallmarkProps {
  serialNumber?: string;
  size?: 'thumbnail' | 'small' | 'medium' | 'large';
  verificationUrl?: string;
  showExpand?: boolean;
  className?: string;
}

export function OrbyHallmark({ 
  serialNumber = '000000001-01', 
  size = 'medium',
  verificationUrl,
  showExpand = true,
  className = ''
}: OrbyHallmarkProps) {
  const [showModal, setShowModal] = useState(false);
  const instanceId = useId();
  
  const fullVerificationUrl = verificationUrl || `https://orbitstaffing.io/verify/${serialNumber}`;
  
  const sizeConfig = {
    thumbnail: { 
      container: 'w-36 h-24',
      orby: 'w-12 h-12',
      cert: 'w-16 h-20',
      qr: 28,
      serial: 'text-[6px]',
      powered: 'text-[5px]',
      stars: 6
    },
    small: { 
      container: 'w-44 h-28',
      orby: 'w-14 h-14',
      cert: 'w-20 h-24',
      qr: 36,
      serial: 'text-[7px]',
      powered: 'text-[6px]',
      stars: 8
    },
    medium: { 
      container: 'w-56 h-40',
      orby: 'w-20 h-20',
      cert: 'w-28 h-32',
      qr: 50,
      serial: 'text-[9px]',
      powered: 'text-[8px]',
      stars: 10
    },
    large: { 
      container: 'w-72 h-52',
      orby: 'w-24 h-24',
      cert: 'w-36 h-40',
      qr: 70,
      serial: 'text-xs',
      powered: 'text-[10px]',
      stars: 14
    }
  };
  
  const config = sizeConfig[size];
  const qrId = `orby-qr-${instanceId}`;

  const downloadQR = () => {
    const svgElement = document.getElementById(qrId);
    if (!svgElement) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 500;
    
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 500, 500);
      
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 50, 50, 400, 400);
        canvas.toBlob((blob) => {
          if (blob) {
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `ORBIT-Hallmark-${serialNumber}.png`;
            a.click();
            URL.revokeObjectURL(downloadUrl);
          }
        });
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  const TwinklingStars = ({ count }: { count: number }) => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(count)].map((_, i) => {
        const size = Math.random() * 3 + 1;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = Math.random() * 3;
        const duration = Math.random() * 2 + 1;
        
        return (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${left}%`,
              top: `${top}%`,
              animation: `twinkle ${duration}s ease-in-out ${delay}s infinite`,
              boxShadow: `0 0 ${size * 2}px rgba(6, 182, 212, 0.8)`
            }}
          />
        );
      })}
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes certGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(251, 191, 36, 0.4), 0 0 30px rgba(6, 182, 212, 0.2); }
          50% { box-shadow: 0 0 25px rgba(251, 191, 36, 0.6), 0 0 40px rgba(6, 182, 212, 0.4); }
        }
      `}</style>

      <div 
        className={`${config.container} relative inline-flex items-center justify-center cursor-pointer group ${className}`}
        onClick={() => showExpand && setShowModal(true)}
        data-testid="orby-hallmark"
        title={showExpand ? "Click to view full hallmark" : undefined}
      >
        <TwinklingStars count={config.stars} />
        
        {/* Badge wrapper for positioning context */}
        <div className="relative">
          {/* Certificate badge */}
          <div 
            className={`relative ${config.cert} bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-lg border-2 border-amber-400/60 p-1.5 flex flex-col items-center justify-center group-hover:scale-105 transition-transform z-10`}
            style={{ animation: 'certGlow 3s ease-in-out infinite' }}
          >
          
          {/* Orby at bottom-left corner of the badge, pointing up */}
          <div className="absolute -left-8 -bottom-6 z-20" style={{ animation: 'float 4s ease-in-out infinite' }}>
            <img 
              src="/mascot/clean/orbit_mascot_presenting_certificate.png" 
              alt="Orby" 
              className={`${config.orby} object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.6)] group-hover:drop-shadow-[0_0_25px_rgba(6,182,212,0.9)] transition-all duration-300`}
            />
          </div>
          <div className={`${config.powered} text-cyan-400 font-bold tracking-wider mb-0.5`}>
            ORBIT
          </div>
          
          <div className="bg-white rounded p-0.5 mb-1">
            <QRCodeSVG
              id={qrId}
              value={fullVerificationUrl}
              size={config.qr}
              level="H"
              includeMargin={false}
            />
          </div>
          
          <div className={`${config.serial} font-mono font-bold text-amber-300 tracking-tight`}>
            #{serialNumber}
          </div>
          
          <div 
            className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border border-white"
            style={{ boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)' }}
          />
          </div>
        </div>
        
        {showExpand && (
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[8px] text-cyan-300 whitespace-nowrap">Click to expand</span>
          </div>
        )}
      </div>

      {showModal && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-cyan-500/50 rounded-3xl p-8 max-w-lg w-full relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <TwinklingStars count={30} />
            
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
              data-testid="close-hallmark-modal"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6 relative z-10">
              <div className="text-xs text-cyan-400 font-semibold tracking-widest uppercase mb-1">
                Blockchain Verified
              </div>
              <h3 className="text-2xl font-bold text-white">
                ORBIT Hallmark
              </h3>
            </div>

            <div className="flex items-center justify-center gap-4 mb-6 relative z-10">
              {/* Orby on the left, presenting the certificate */}
              <div style={{ animation: 'float 8s ease-in-out infinite' }}>
                <img 
                  src="/mascot/clean/orbit_mascot_presenting_certificate.png" 
                  alt="Orby presenting hallmark" 
                  className="w-36 h-36 object-contain drop-shadow-[0_0_30px_rgba(6,182,212,0.6)]"
                />
              </div>
              
              {/* Certificate on the right, being presented by Orby */}
              <div 
                className="w-44 h-52 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-xl border-2 border-amber-400 p-3 flex flex-col items-center justify-center relative"
                style={{ animation: 'certGlow 3s ease-in-out infinite' }}
              >
                <div className="text-[10px] text-cyan-400 font-bold tracking-wider mb-2 uppercase">
                  Powered by ORBIT
                </div>
                
                <div className="bg-white rounded-lg p-2 mb-2 shadow-lg">
                  <QRCodeSVG
                    value={fullVerificationUrl}
                    size={100}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                
                <div className="text-base font-mono font-bold text-amber-300 tracking-wide">
                  #{serialNumber}
                </div>
                
                <div 
                  className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white flex items-center justify-center"
                  style={{ boxShadow: '0 0 12px rgba(34, 197, 94, 0.8)' }}
                >
                  <span className="text-[8px] text-white font-bold">✓</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/50 rounded-xl p-4 mb-4 border border-cyan-900/50 relative z-10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Serial Number:</span>
                <span className="font-mono font-bold text-amber-300">#{serialNumber}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-400">Network:</span>
                <span className="text-purple-300 flex items-center gap-1">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  Solana Mainnet
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Verified
                </span>
              </div>
            </div>

            <div className="flex gap-3 relative z-10">
              <button
                onClick={downloadQR}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                data-testid="download-hallmark"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <a
                href={fullVerificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                data-testid="verify-on-chain"
              >
                <ExternalLink className="w-4 h-4" />
                Verify On-Chain
              </a>
            </div>

            <div className="mt-4 text-center text-xs text-gray-500 relative z-10">
              Hallmark permanently recorded on Solana blockchain
            </div>
          </div>
        </div>
      )}
    </>
  );
}
