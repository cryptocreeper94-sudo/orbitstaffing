import { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, AlertCircle, Shield, Lock } from 'lucide-react';

interface VerificationStep {
  step: number;
  title: string;
  completed: boolean;
}

export default function PartnerVerification() {
  const [step, setStep] = useState<'intro' | 'details' | 'verify' | 'success'>('intro');
  const [companyName, setCompanyName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');

  const steps: VerificationStep[] = [
    { step: 1, title: 'Verify Request', completed: step !== 'intro' },
    { step: 2, title: 'Enter Details', completed: step === 'verify' || step === 'success' },
    { step: 3, title: 'Confirm', completed: step === 'success' }
  ];

  const handleVerifyRequest = () => {
    // In production, verify the integration token from URL
    setStep('details');
  };

  const handleSubmitDetails = () => {
    if (!companyName || !contactEmail) {
      setError('Please fill in all required fields');
      return;
    }
    setStep('verify');
  };

  const handleConfirmVerification = () => {
    if (verificationCode.length < 6) {
      setError('Invalid verification code');
      return;
    }
    setStep('success');
  };

  if (step === 'intro') {
    return (
      <Shell>
        <div className="max-w-2xl mx-auto">
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Connect to ORBIT Staffing
              </CardTitle>
              <CardDescription>
                A customer has invited you to connect your staffing agency to their ORBIT dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Benefits */}
              <div className="space-y-3">
                <h3 className="font-bold text-foreground">Benefits of Connecting:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span>Unified employee & assignment management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span>Real-time data synchronization</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span>Direct communication with customer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span>No more scattered emails and spreadsheets</span>
                  </li>
                </ul>
              </div>

              {/* What Happens */}
              <div className="space-y-3">
                <h3 className="font-bold text-foreground">What Happens Next:</h3>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="text-primary font-bold flex-shrink-0">1.</span>
                    <span>Verify your company details</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold flex-shrink-0">2.</span>
                    <span>Confirm the connection with a verification code</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold flex-shrink-0">3.</span>
                    <span>Your employees and assignments sync to their dashboard</span>
                  </li>
                </ol>
              </div>

              <Button
                onClick={handleVerifyRequest}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-start-verification"
              >
                Start Verification
              </Button>
            </CardContent>
          </Card>
        </div>
      </Shell>
    );
  }

  if (step === 'success') {
    return (
      <Shell>
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-700/50 bg-green-900/20">
            <CardContent className="p-12 text-center space-y-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Connection Verified!</h2>
                <p className="text-muted-foreground">
                  Your staffing agency is now connected to {companyName}.
                </p>
              </div>

              <div className="bg-card/50 border border-border/50 rounded-lg p-6 text-left space-y-3">
                <h3 className="font-bold text-foreground">What's Next:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>Your employees are syncing to their dashboard</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>They can now manage assignments directly</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>Direct communication channel is open</span>
                  </li>
                </ul>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90" data-testid="button-done">
                Done
              </Button>
            </CardContent>
          </Card>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="max-w-2xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {steps.map((s, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 ${s.completed ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    s.completed
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border/50'
                  }`}
                >
                  {s.completed ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                </div>
                <span className="hidden md:inline text-sm">{s.title}</span>
              </div>
            ))}
          </div>
          <div className="h-1 bg-card rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{
                width: step === 'details' ? '33%' : step === 'verify' ? '66%' : '100%'
              }}
            />
          </div>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>
              {step === 'details' && 'Company Details'}
              {step === 'verify' && 'Verify Connection'}
            </CardTitle>
            <CardDescription>
              {step === 'details' && 'Please provide your company information'}
              {step === 'verify' && 'Enter the verification code sent to your email'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 flex gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            {step === 'details' && (
              <>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Company Name *
                  </label>
                  <Input
                    placeholder="e.g., Pro Staffing Solutions"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    data-testid="input-company-name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Contact Email *
                  </label>
                  <Input
                    type="email"
                    placeholder="contact@staffing-agency.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    data-testid="input-contact-email"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Contact Phone
                  </label>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    data-testid="input-contact-phone"
                  />
                </div>
              </>
            )}

            {step === 'verify' && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Verification Code
                </label>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    data-testid="input-verification-code"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Check your email for the code (valid for 10 minutes)
                </p>
              </div>
            )}

            <div className="flex gap-2">
              {step === 'verify' && (
                <Button
                  onClick={() => setStep('details')}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-back"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={step === 'details' ? handleSubmitDetails : handleConfirmVerification}
                className={`flex-1 bg-primary text-primary-foreground hover:bg-primary/90`}
                data-testid={step === 'details' ? 'button-next' : 'button-verify'}
              >
                {step === 'details' ? 'Continue' : 'Verify Connection'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
