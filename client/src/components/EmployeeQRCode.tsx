import { useState } from 'react';
import QRCode from 'react-qr-code';
import { Download, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmployeeQRCodeProps {
  workerId: string;
  employeeName: string;
  companyName: string;
  verificationCode: string;
  qrValue?: string;
}

export function EmployeeQRCode({
  workerId,
  employeeName,
  companyName,
  verificationCode,
  qrValue = ''
}: EmployeeQRCodeProps) {
  const [copied, setCopied] = useState(false);

  // QR code should link to verification portal
  const qrData = qrValue || `https://orbitstaffing.io/verify/${verificationCode}`;

  const downloadQR = () => {
    const element = document.getElementById('employee-qr-code');
    if (!element) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 400;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const svgData = new XMLSerializer().serializeToString(element);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${employeeName}-employee-id-${verificationCode}.png`;
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const copyCode = () => {
    navigator.clipboard.writeText(verificationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-cyan-700/50 p-8">
      <h3 className="text-xl font-bold text-white mb-6">Your ORBIT Employee ID</h3>

      {/* QR Code Container */}
      <div className="flex flex-col items-center gap-6 mb-8">
        {/* QR Code Display */}
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <div id="employee-qr-code">
            <QRCode
              value={qrData}
              size={256}
              level="H"
            />
          </div>
        </div>

        {/* Employee Info */}
        <div className="text-center w-full">
          <p className="text-gray-300 text-sm mb-2">{employeeName}</p>
          <p className="text-gray-400 text-xs mb-4">{companyName}</p>
          
          {/* Verification Code */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-cyan-600/30">
            <p className="text-gray-400 text-xs mb-2">Verification Code</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-cyan-400 font-mono font-bold text-lg">
                {verificationCode}
              </code>
              <button
                onClick={copyCode}
                className="text-gray-400 hover:text-cyan-400 transition"
                data-testid="button-copy-code"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div className="bg-cyan-900/20 border border-cyan-700/30 rounded-lg p-4 mb-6">
        <h4 className="text-cyan-300 font-bold text-sm mb-3">How to Use Your ID</h4>
        <ul className="text-xs text-gray-300 space-y-2">
          <li className="flex gap-2">
            <span className="text-cyan-400">1.</span>
            <span>Show QR code to on-site employers to verify employment</span>
          </li>
          <li className="flex gap-2">
            <span className="text-cyan-400">2.</span>
            <span>Share verification code for document authentication</span>
          </li>
          <li className="flex gap-2">
            <span className="text-cyan-400">3.</span>
            <span>Use code on pay stubs, work histories, and certifications</span>
          </li>
          <li className="flex gap-2">
            <span className="text-cyan-400">4.</span>
            <span>Employers can verify your identity via verification portal</span>
          </li>
        </ul>
      </div>

      {/* Download Button */}
      <Button
        onClick={downloadQR}
        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
        data-testid="button-download-qr"
      >
        <Download className="w-4 h-4 mr-2" />
        Download Employee ID Card
      </Button>

      {/* Info */}
      <p className="text-xs text-gray-500 text-center mt-4">
        Keep this code safe. Never share with unauthorized people.
      </p>
    </div>
  );
}
