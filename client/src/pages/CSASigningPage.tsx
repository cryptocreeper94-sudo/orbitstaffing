import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { CheckCircle2, FileText, AlertTriangle, Shield, DollarSign, Scale } from 'lucide-react';

interface CSATemplate {
  id: number;
  version: string;
  effectiveDate: string;
  templateContent: string;
  conversionFeeDollars: number;
  conversionPeriodMonths: number;
  conversionPeriodHours: number;
  defaultMarkupMultiplier: number;
  latePaymentInterestRate: number;
}

export default function CSASigningPage() {
  const [, params] = useRoute('/clients/:clientId/csa/sign');
  const [, setLocation] = useLocation();
  const clientId = params?.clientId;
  
  const [template, setTemplate] = useState<CSATemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [signing, setSigning] = useState(false);
  
  // Form state
  const [signedName, setSignedName] = useState('');
  const [paymentTerms, setPaymentTerms] = useState<'Net 7' | 'Net 15' | 'Net 30'>('Net 30');
  
  // Acknowledgment checkboxes
  const [ackConversionFee, setAckConversionFee] = useState(false);
  const [ackPaymentTerms, setAckPaymentTerms] = useState(false);
  const [ackLiability, setAckLiability] = useState(false);
  const [ackMarkup, setAckMarkup] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  useEffect(() => {
    loadTemplate();
  }, []);
  
  async function loadTemplate() {
    try {
      const res = await fetch('/api/csa/current');
      if (res.ok) {
        const data = await res.json();
        setTemplate(data);
      } else {
        setError('Failed to load CSA template. Please contact support.');
      }
    } catch (err) {
      console.error('Failed to load CSA template:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  
  async function handleSign() {
    if (!template || !clientId) return;
    
    // Validation
    if (!signedName.trim()) {
      alert('Please enter your full legal name');
      return;
    }
    
    if (!ackConversionFee || !ackPaymentTerms || !ackLiability || !ackMarkup || !agreeToTerms) {
      alert('Please check all acknowledgment boxes to proceed');
      return;
    }
    
    setSigning(true);
    
    try {
      // Capture device info
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
      };
      
      // Get IP address (backend will capture this)
      const res = await fetch('/api/csa/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: parseInt(clientId),
          templateId: template.id,
          signedName,
          paymentTerms,
          acceptedTerms: {
            conversionFee: ackConversionFee,
            paymentTerms: ackPaymentTerms,
            liability: ackLiability,
            markup: ackMarkup,
            agreeToTerms: agreeToTerms,
          },
          deviceInfo,
          signedAt: new Date().toISOString(),
        }),
      });
      
      if (res.ok) {
        alert('CSA signed successfully! You can now proceed with service requests.');
        setLocation('/dashboard');
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || 'Failed to sign CSA. Please try again.');
      }
    } catch (err) {
      console.error('Failed to sign CSA:', err);
      setError('Network error. Please try again.');
    } finally {
      setSigning(false);
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Client Service Agreement...</div>
      </div>
    );
  }
  
  if (error && !template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-8 max-w-lg">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white text-center mb-4">Error Loading CSA</h2>
          <p className="text-gray-300 text-center">{error}</p>
        </div>
      </div>
    );
  }
  
  if (!template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-8 max-w-lg">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white text-center mb-4">No CSA Template Available</h2>
          <p className="text-gray-300 text-center">
            Please contact ORBIT Staffing support to set up your Client Service Agreement.
          </p>
        </div>
      </div>
    );
  }
  
  const allChecked = ackConversionFee && ackPaymentTerms && ackLiability && ackMarkup && agreeToTerms;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-700/50 rounded-lg p-8 text-center">
          <Scale className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">Client Service Agreement</h1>
          <p className="text-xl text-gray-300">ORBIT Staffing OS - Version {template.version}</p>
          <p className="text-sm text-gray-400 mt-2">Effective Date: {new Date(template.effectiveDate).toLocaleDateString()}</p>
        </div>
        
        {/* Important Notice */}
        <div className="bg-cyan-900/20 border border-cyan-700/50 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-cyan-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-cyan-300 mb-2">📋 Before You Sign</h3>
              <p className="text-cyan-100 text-sm mb-3">
                This Client Service Agreement (CSA) outlines the terms and conditions for staffing services provided by ORBIT Staffing OS. 
                Please read carefully and check all acknowledgment boxes below.
              </p>
              <p className="text-cyan-200 text-xs">
                ⚖️ We strongly recommend having this agreement reviewed by your legal counsel before signing.
              </p>
            </div>
          </div>
        </div>
        
        {/* Key Terms Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <DollarSign className="w-8 h-8 text-green-400 mb-3" />
            <h4 className="font-bold text-white mb-2">Worker Conversion Fee</h4>
            <p className="text-2xl font-bold text-green-400 mb-2">${template.conversionFeeDollars}</p>
            <p className="text-sm text-gray-300">
              Applies if you hire our worker within {template.conversionPeriodMonths} months or {template.conversionPeriodHours} hours
            </p>
          </div>
          
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <FileText className="w-8 h-8 text-purple-400 mb-3" />
            <h4 className="font-bold text-white mb-2">Labor Markup</h4>
            <p className="text-2xl font-bold text-purple-400 mb-2">{template.defaultMarkupMultiplier}x</p>
            <p className="text-sm text-gray-300">
              Transparent pricing: {template.defaultMarkupMultiplier}x worker pay rate covers insurance, compliance, and service
            </p>
          </div>
        </div>
        
        {/* Full CSA Document */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            Full Service Agreement
          </h3>
          <div className="bg-white text-black p-8 rounded max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {template.templateContent}
            </pre>
          </div>
        </div>
        
        {/* Payment Terms Selection */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">💳 Select Payment Terms</h3>
          <div className="flex gap-4">
            {(['Net 7', 'Net 15', 'Net 30'] as const).map((term) => (
              <button
                key={term}
                onClick={() => setPaymentTerms(term)}
                className={`flex-1 py-3 px-4 rounded-lg font-bold border-2 transition-all ${
                  paymentTerms === term
                    ? 'bg-cyan-600 border-cyan-400 text-white'
                    : 'bg-slate-700 border-slate-600 text-gray-300 hover:border-slate-500'
                }`}
                data-testid={`button-payment-term-${term.replace(' ', '-').toLowerCase()}`}
              >
                {term}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Late payments incur {template.latePaymentInterestRate}% monthly interest
          </p>
        </div>
        
        {/* Critical Acknowledgments */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">✅ Required Acknowledgments</h3>
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={ackConversionFee}
                onChange={(e) => setAckConversionFee(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-600 text-cyan-600 focus:ring-cyan-500"
                data-testid="checkbox-ack-conversion-fee"
              />
              <span className="text-gray-300">
                <strong className="text-white">I understand the ${template.conversionFeeDollars} worker conversion fee</strong> applies if I hire any ORBIT worker within {template.conversionPeriodMonths} months or {template.conversionPeriodHours} hours of their first assignment.
              </span>
            </label>
            
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={ackPaymentTerms}
                onChange={(e) => setAckPaymentTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-600 text-cyan-600 focus:ring-cyan-500"
                data-testid="checkbox-ack-payment-terms"
              />
              <span className="text-gray-300">
                <strong className="text-white">I agree to payment terms and late fees</strong> - Invoices are due per selected payment terms. Late payments incur {template.latePaymentInterestRate}% monthly interest. ORBIT may suspend services for non-payment.
              </span>
            </label>
            
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={ackLiability}
                onChange={(e) => setAckLiability(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-600 text-cyan-600 focus:ring-cyan-500"
                data-testid="checkbox-ack-liability"
              />
              <span className="text-gray-300">
                <strong className="text-white">I acknowledge liability for workers on our job site</strong> - My company has "control, care, and custody" of workers during assignments. We are responsible for workplace safety, injuries, and equipment damage. We maintain our own liability insurance.
              </span>
            </label>
            
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={ackMarkup}
                onChange={(e) => setAckMarkup(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-600 text-cyan-600 focus:ring-cyan-500"
                data-testid="checkbox-ack-markup"
              />
              <span className="text-gray-300">
                <strong className="text-white">I agree to {template.defaultMarkupMultiplier}x markup on all labor</strong> - I understand ORBIT's transparent pricing model charges {template.defaultMarkupMultiplier}x the worker's hourly rate to cover insurance, payroll taxes, compliance, and service operations.
              </span>
            </label>
          </div>
        </div>
        
        {/* Signature Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">✍️ Electronic Signature</h3>
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Full Legal Name (as authorized signatory)
            </label>
            <input
              type="text"
              value={signedName}
              onChange={(e) => setSignedName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded text-white"
              placeholder="Enter your full legal name"
              data-testid="input-signed-name"
            />
          </div>
          
          <label className="flex items-start gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-600 text-green-600 focus:ring-green-500"
              data-testid="checkbox-agree-to-terms"
            />
            <span className="text-gray-300">
              <strong className="text-white text-lg">I agree to the terms and conditions</strong> outlined in this Client Service Agreement. 
              I acknowledge that my electronic signature has the same legal effect as a handwritten signature.
            </span>
          </label>
          
          <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-purple-200">
              <strong>🔒 Security Notice:</strong> Your signature will be captured along with timestamp, IP address, and device information for authentication and legal compliance.
            </p>
          </div>
          
          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-4">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}
          
          <Button
            onClick={handleSign}
            disabled={!allChecked || !signedName.trim() || signing}
            className={`w-full py-6 text-xl font-bold ${
              allChecked && signedName.trim()
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
            data-testid="button-sign-csa"
          >
            {signing ? (
              'Signing...'
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6 mr-3" />
                Sign Client Service Agreement
              </>
            )}
          </Button>
        </div>
        
        {/* Legal Disclaimer */}
        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-yellow-300 mb-2">⚖️ Legal Disclaimer</h4>
              <p className="text-sm text-yellow-100">
                This CSA is a preliminary agreement. ORBIT Staffing OS strongly recommends review by legal counsel before use. 
                This template is not a substitute for professional legal advice tailored to your specific business needs and applicable state laws.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
