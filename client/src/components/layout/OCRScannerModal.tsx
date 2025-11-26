import { useState } from 'react';
import { X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BusinessCardScanner } from '@/components/BusinessCardScanner';
import { toast } from 'sonner';

interface OCRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OCRScannerModal({ isOpen, onClose }: OCRScannerModalProps) {
  if (!isOpen) return null;

  const handleCardScanned = (cardData: any) => {
    toast.success('Scan successful - Data processed');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/50 rounded-lg shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-cyan-500/30 flex items-center justify-between p-4 rounded-t-lg">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">OCR Scanner</h2>
            <span className="text-xs text-cyan-300">Business Cards • Tickets • QR/UPC</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-cyan-400 hover:text-cyan-300"
            data-testid="button-close-ocr-scanner"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          <BusinessCardScanner
            onCardScanned={handleCardScanned}
            context="orbid"
          />
        </div>
      </div>
    </div>
  );
}
