/**
 * ORBIT Emblem & Hallmark Download Page
 * Professional assets for franchisees and partners
 */
import React from 'react';
import { Download, Image as ImageIcon, FileJson, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmblemDownload() {
  const emblems = [
    {
      id: 'hallmark-seal',
      name: 'ORBIT Hallmark Seal',
      description: 'Professional seal badge for invoices, paystubs, contracts - 1:1 ratio',
      size: '1024x1024px',
      usage: 'Print on documents, digital watermarks, official correspondence',
      path: '/orbit-hallmark-emblem.png',
    },
    {
      id: 'saturn-icon',
      name: 'Saturn Logo Icon',
      description: 'Clean aqua Saturn emblem with transparent background',
      size: '512x512px',
      usage: 'Favicon, app icon, branding, small formats',
      path: '/orbit-saturn-logo.png',
    },
    {
      id: 'verification-badge',
      name: 'Verification Badge',
      description: 'Horizontal banner format - "Verified by ORBIT"',
      size: '1920x1080px',
      usage: 'Email signatures, website footers, letterheads',
      path: '/orbit-verification-badge.png',
    },
    {
      id: 'saturn-3d',
      name: 'ORBIT Saturn 3D',
      description: 'Original 3D rendered Saturn logo with rings',
      size: '1024x1024px',
      usage: 'Branding, presentations, marketing materials',
      path: '/orbit-logo.png',
    },
  ];

  const handleDownload = (path: string, name: string) => {
    const link = document.createElement('a');
    link.href = path;
    link.download = `${name.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const svgFormat = `<!-- ORBIT Saturn SVG Vector -->
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <!-- Saturn Planet -->
  <circle cx="100" cy="100" r="60" fill="#06B6D4" opacity="0.9"/>
  <circle cx="100" cy="100" r="60" fill="url(#saturnGradient)" />
  
  <!-- Saturn Rings -->
  <ellipse cx="100" cy="100" rx="90" ry="25" fill="none" stroke="#06B6D4" stroke-width="8"/>
  <ellipse cx="100" cy="100" rx="85" ry="22" fill="none" stroke="#22D3EE" stroke-width="6"/>
  
  <!-- Gradients -->
  <defs>
    <radialGradient id="saturnGradient">
      <stop offset="0%" style="stop-color:#22D3EE;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#06B6D4;stop-opacity:1" />
    </radialGradient>
  </defs>
</svg>`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <ImageIcon className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold">ORBIT Emblem Library</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Professional assets for franchisees, partners, and white-label implementations
          </p>
        </div>

        {/* Emblem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {emblems.map((emblem) => (
            <div
              key={emblem.id}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-500 transition-all"
            >
              {/* Preview */}
              <div className="bg-slate-900/50 rounded-lg p-6 mb-4 flex items-center justify-center h-32">
                <img
                  src={emblem.path}
                  alt={emblem.name}
                  className="h-20 w-20 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              {/* Info */}
              <h3 className="text-xl font-bold mb-2">{emblem.name}</h3>
              <p className="text-gray-400 text-sm mb-3">{emblem.description}</p>

              {/* Specs */}
              <div className="space-y-2 mb-4 text-xs text-gray-500">
                <div>
                  <span className="font-semibold">Size:</span> {emblem.size}
                </div>
                <div>
                  <span className="font-semibold">Best for:</span> {emblem.usage}
                </div>
              </div>

              {/* Download Button */}
              <Button
                onClick={() => handleDownload(emblem.path, emblem.name)}
                className="w-full bg-cyan-600 hover:bg-cyan-700 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </Button>
            </div>
          ))}
        </div>

        {/* Vector Format Section */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 mb-12">
          <div className="flex items-center gap-3 mb-4">
            <FileJson className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold">SVG Vector Format</h2>
          </div>
          <p className="text-gray-400 mb-4">
            Scalable vector version - perfect for web and print. Copy to use in your design tools.
          </p>

          {/* SVG Code Block */}
          <div className="bg-slate-900/70 rounded-lg p-4 mb-4">
            <pre className="text-xs text-gray-300 overflow-x-auto">
              <code>{svgFormat}</code>
            </pre>
          </div>

          <Button
            onClick={() => {
              navigator.clipboard.writeText(svgFormat);
              alert('SVG code copied to clipboard!');
            }}
            className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy SVG Code
          </Button>
        </div>

        {/* Usage Guidelines */}
        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Usage Guidelines</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">✓ What You Can Do</h3>
              <ul className="text-gray-400 space-y-2 text-sm">
                <li>✓ Add ORBIT emblem to invoices, paystubs, reports</li>
                <li>✓ Use on your company website and app</li>
                <li>✓ Include in email signatures</li>
                <li>✓ Print on contracts and agreements</li>
                <li>✓ Customize colors for white-label needs</li>
                <li>✓ Stamp on certification documents</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-red-400 mb-2">✗ What You Cannot Do</h3>
              <ul className="text-gray-400 space-y-2 text-sm">
                <li>✗ Remove the ORBIT watermark (franchise agreement requirement)</li>
                <li>✗ Modify the Saturn shape or core design</li>
                <li>✗ Claim ORBIT branding as your own</li>
                <li>✗ Use different aqua color (must be #06B6D4)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-2">📋 Recommended Usage</h3>
              <ul className="text-gray-400 space-y-2 text-sm">
                <li>• Place on bottom-right of invoices (75x75px)</li>
                <li>• Add to email footer as 50x50px icon</li>
                <li>• Use verification badge on website footer</li>
                <li>• Include Saturn icon in favicon</li>
                <li>• Print on company letterhead (small)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>ORBIT Staffing OS • White-Label Platform</p>
          <p className="mt-2">All assets are brand property. Franchisees: Use as required by your franchise agreement.</p>
        </div>
      </div>
    </div>
  );
}
