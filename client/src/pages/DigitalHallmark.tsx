import React, { useState } from 'react';
import { Check, Shield, AlertCircle, Download, Share2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DigitalHallmark() {
  const [copied, setCopied] = useState(false);

  // Mock worker data
  const worker = {
    id: 'WRK-2024-45892',
    name: 'John Michael Rodriguez',
    verificationCode: 'ORBIT-XK9M2Q7W8P',
    status: 'verified',
    issuedDate: '2024-11-15',
    expiresDate: '2025-11-15',
    backgroundCheck: 'clear',
    drugTest: 'passed',
    i9Verified: true,
    skills: ['Electrician', 'HVAC', 'General Labor'],
    certifications: ['EPA 608 Certified', 'OSHA 30'],
  };

  const qrData = {
    code: worker.verificationCode,
    workerId: worker.id,
    verified: true,
    timestamp: new Date().toISOString(),
  };

  const copyCode = () => {
    navigator.clipboard.writeText(worker.verificationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Digital Hallmark™</h1>
          <p className="text-gray-400">Worker Verification Credential</p>
        </div>

        {/* Main Credential Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-cyan-400/30 shadow-2xl overflow-hidden mb-8">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 h-2" />

          <div className="p-8">
            {/* Logo & Status */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="text-2xl font-bold text-cyan-400 mb-1">ORBIT</div>
                <p className="text-xs text-gray-400">Staffing Platform</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 bg-green-900/30 border border-green-700 rounded-lg px-3 py-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-bold text-green-300">VERIFIED</span>
                </div>
              </div>
            </div>

            {/* Worker Info */}
            <div className="mb-8">
              <p className="text-xs text-gray-400 mb-1">WORKER NAME</p>
              <h2 className="text-3xl font-bold text-white mb-4">{worker.name}</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Worker ID</p>
                  <p className="text-sm font-mono text-cyan-300">{worker.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Verification Code</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono text-cyan-300 font-bold">{worker.verificationCode}</p>
                    <button onClick={copyCode} className="text-gray-400 hover:text-cyan-300">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  {copied && <p className="text-xs text-green-400">Copied!</p>}
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="bg-slate-800/50 rounded-lg p-6 mb-8 border border-slate-700">
              <p className="text-xs text-gray-400 mb-4 font-bold">SCAN TO VERIFY</p>
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-lg">
                  <div className="w-[200px] h-[200px] bg-gray-300 rounded-lg flex items-center justify-center text-gray-600 text-sm font-mono">
                    [QR Code Here]<br/>
                    {worker.verificationCode}
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center">
                Scan with smartphone or QR reader to verify worker credential
              </p>
            </div>

            {/* Compliance Status */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <p className="text-xs font-bold text-gray-300">BACKGROUND CHECK</p>
                </div>
                <p className="text-sm font-bold text-green-300">Clear</p>
                <p className="text-xs text-gray-500 mt-1">No record found</p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <p className="text-xs font-bold text-gray-300">DRUG TEST</p>
                </div>
                <p className="text-sm font-bold text-green-300">Passed</p>
                <p className="text-xs text-gray-500 mt-1">Valid through 12/15/25</p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <p className="text-xs font-bold text-gray-300">I-9 VERIFIED</p>
                </div>
                <p className="text-sm font-bold text-green-300">Verified</p>
                <p className="text-xs text-gray-500 mt-1">Valid for hire</p>
              </div>
            </div>

            {/* Skills & Certifications */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-xs font-bold text-gray-300 mb-3">SKILLS</p>
                <div className="flex flex-wrap gap-2">
                  {worker.skills.map((skill) => (
                    <span key={skill} className="bg-cyan-900/30 border border-cyan-700 text-cyan-300 text-xs px-3 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-300 mb-3">CERTIFICATIONS</p>
                <div className="flex flex-wrap gap-2">
                  {worker.certifications.map((cert) => (
                    <span key={cert} className="bg-purple-900/30 border border-purple-700 text-purple-300 text-xs px-3 py-1 rounded-full">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Validity Info */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 mb-8">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-400">ISSUED</p>
                  <p className="text-sm font-bold text-white">{worker.issuedDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">EXPIRES</p>
                  <p className="text-sm font-bold text-white">{worker.expiresDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">STATUS</p>
                  <p className="text-sm font-bold text-green-300">ACTIVE</p>
                </div>
              </div>
            </div>

            {/* Security Features */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 mb-8">
              <p className="text-xs font-bold text-gray-300 mb-3">🔒 SECURITY FEATURES</p>
              <ul className="space-y-2 text-xs text-gray-400">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-400" />
                  UUID-based verification code (impossible to counterfeit)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-400" />
                  QR code links to live verification database
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-400" />
                  Real-time status updates (revoked if worker terminated)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-400" />
                  Tamper-evident design (any changes flagged immediately)
                </li>
              </ul>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-700 pt-6 text-center">
              <p className="text-xs text-gray-400 mb-4">
                To verify this credential, scan the QR code or visit: orbit.staffing/verify/{worker.verificationCode}
              </p>
              <p className="text-xs text-gray-500">
                This credential is tamper-evident and linked to a live database. Any alterations will be detected.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-2xl mb-3">📱</div>
            <h3 className="font-bold text-white mb-2">Employer Scans</h3>
            <p className="text-sm text-gray-400">
              Client/employer scans QR code with their phone to instantly verify worker credentials
            </p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-2xl mb-3">⚡</div>
            <h3 className="font-bold text-white mb-2">Real-Time Check</h3>
            <p className="text-sm text-gray-400">
              System checks live database to confirm all verifications (background, drug test, I-9, status)
            </p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-2xl mb-3">✅</div>
            <h3 className="font-bold text-white mb-2">Instant Verification</h3>
            <p className="text-sm text-gray-400">
              Employer sees worker is verified, compliant, and safe to hire in seconds
            </p>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 rounded-lg p-6 border border-cyan-700/30 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Why Digital Hallmark?</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-cyan-400" />
              <strong>Portable Credential:</strong> Workers carry their verification with them (QR code on phone)
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-cyan-400" />
              <strong>Instant Verification:</strong> No more calling to verify worker, just scan QR code
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-cyan-400" />
              <strong>Legal Compliance:</strong> Proof that you verified before hiring (liability protection)
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-cyan-400" />
              <strong>Fraud Prevention:</strong> Impossible to counterfeit, linked to live database
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-cyan-400" />
              <strong>Trust & Professionalism:</strong> Shows worker takes job seriously
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button className="bg-cyan-600 hover:bg-cyan-700" data-testid="button-download-hallmark">
            <Download className="w-4 h-4 mr-2" />
            Download Credential
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700" data-testid="button-share-hallmark">
            <Share2 className="w-4 h-4 mr-2" />
            Share Credential
          </Button>
        </div>
      </div>
    </div>
  );
}
