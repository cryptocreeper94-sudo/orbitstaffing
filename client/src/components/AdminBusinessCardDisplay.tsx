import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Download, Share2, Copy } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const ICON_MAP: Record<string, string> = {
  "📧": "/icons/pro/3d_email_envelope_icon_clean.png",
  "📱": "/icons/pro/3d_smartphone_mobile_icon_clean.png",
};

function Icon3D({ emoji, size = "sm" }: { emoji: string; size?: "sm" | "md" | "lg" }) {
  const iconPath = ICON_MAP[emoji];
  const sizeClasses = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" };
  if (iconPath) {
    return <img src={`${iconPath}?v=1`} alt="" className={`${sizeClasses[size]} inline-block object-contain mr-1 drop-shadow-[0_0_4px_rgba(6,182,212,0.5)]`} />;
  }
  return <span>{emoji}</span>;
}

interface AdminBusinessCardDisplayProps {
  assetNumber: number;
  name: string;
  title: string;
  email?: string;
  phone?: string;
  customImage?: string;
  hallmarkNumber?: string;
  onCustomize?: () => void;
}

export function AdminBusinessCardDisplay({
  assetNumber,
  name,
  title,
  email,
  phone,
  customImage,
  hallmarkNumber,
  onCustomize,
}: AdminBusinessCardDisplayProps) {
  const [copied, setCopied] = useState(false);
  
  const qrData = {
    assetNumber,
    name,
    title,
    email,
    phone,
    hallmark: hallmarkNumber,
    timestamp: new Date().toISOString(),
  };

  const handleCopyHallmark = () => {
    navigator.clipboard.writeText(hallmarkNumber || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCard = () => {
    const qrElement = document.getElementById(`qr-${assetNumber}`);
    if (qrElement) {
      const link = document.createElement('a');
      link.href = (qrElement as any).toDataURL('image/png');
      link.download = `ORBIT-BusinessCard-Asset${assetNumber}.png`;
      link.click();
    }
  };

  return (
    <div className="space-y-4">
      {/* Business Card Display */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/30 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Left Side - Avatar/Image */}
            <div className="md:w-1/3 bg-slate-700 p-6 flex flex-col items-center justify-center">
              {customImage ? (
                <img
                  src={customImage}
                  alt={name}
                  className="w-24 h-24 rounded-full object-cover border-2 border-cyan-400"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-3xl">
                  A{assetNumber}
                </div>
              )}
              <p className="mt-2 text-xs text-slate-400">Asset #{assetNumber}</p>
            </div>

            {/* Right Side - Info */}
            <div className="md:w-2/3 p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{name}</h2>
                <p className="text-cyan-300 font-semibold text-sm mb-4">{title}</p>
                {email && <p className="text-xs text-slate-300 mb-1 flex items-center"><Icon3D emoji="📧" />{email}</p>}
                {phone && <p className="text-xs text-slate-300 mb-4 flex items-center"><Icon3D emoji="📱" />{phone}</p>}
              </div>

              <div className="pt-4 border-t border-slate-600">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    <p className="font-mono">ORBIT Staffing OS</p>
                    {hallmarkNumber && (
                      <p className="font-mono text-cyan-400 text-xs mt-1">{hallmarkNumber}</p>
                    )}
                  </div>
                  
                  {/* QR Code */}
                  <div className="bg-white p-2 rounded">
                    <QRCodeSVG
                      id={`qr-${assetNumber}`}
                      value={JSON.stringify(qrData)}
                      size={64}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {onCustomize && (
          <Button
            onClick={onCustomize}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
            data-testid="button-customize-card"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Customize
          </Button>
        )}
        <Button
          onClick={downloadCard}
          size="sm"
          variant="outline"
          className="text-slate-300"
          data-testid="button-download-card"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        {hallmarkNumber && (
          <Button
            onClick={handleCopyHallmark}
            size="sm"
            variant="outline"
            className="text-slate-300"
            data-testid="button-copy-hallmark"
          >
            <Copy className="w-4 h-4 mr-2" />
            {copied ? 'Copied!' : 'Copy Hallmark'}
          </Button>
        )}
      </div>
    </div>
  );
}
