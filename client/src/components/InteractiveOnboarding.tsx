import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Users, Briefcase, DollarSign, Zap, X } from 'lucide-react';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  cta: string;
  action: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: "Your Personal Marketplace Platform",
    description: "ORBIT is the infrastructure for ANY flexible labor or service business. Electricians. Cleaners. Tutors. Rides. Delivery. You choose. In 5 minutes, you'll understand how it works and why it could scale to millions.",
    icon: <Briefcase className="w-12 h-12 text-cyan-400" />,
    cta: "Show Me How",
    action: "next",
  },
  {
    id: 2,
    title: "Step 1: Add Service Providers (1 minute)",
    description: "Create profiles for people offering services. Name, skills, availability, rates. Could be electricians, cleaners, tutors - anything. No code needed. Pure simplicity.",
    icon: <Users className="w-12 h-12 text-green-400" />,
    cta: "Create Provider",
    action: "demo_worker",
  },
  {
    id: 3,
    title: "Step 2: Post Demand (1 minute)",
    description: "Someone needs a service? Create a posting. What's needed, rate offered, location, timing. Service providers see available work instantly. Done.",
    icon: <Briefcase className="w-12 h-12 text-purple-400" />,
    cta: "Post Demand",
    action: "demo_job",
  },
  {
    id: 4,
    title: "Step 3: Match & Automate (Instant)",
    description: "Match providers to demand. ORBIT handles everything: timesheets, payments, invoicing, compliance. You focus on growth. The system handles scale.",
    icon: <DollarSign className="w-12 h-12 text-amber-400" />,
    cta: "See Dashboard",
    action: "demo_assign",
  },
  {
    id: 5,
    title: "Scale to Millions Without the Chaos",
    description: "Start with 1 provider. Scale to 1,000. ORBIT scales with you - same simplicity at every level. GPS verification, instant payments, compliance built-in. This is what enterprise software should be.",
    icon: <Zap className="w-12 h-12 text-cyan-400" />,
    cta: "Ready to Build?",
    action: "close",
  },
];

interface InteractiveOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'employee' | 'owner' | 'admin';
}

export function InteractiveOnboarding({ isOpen, onClose, userRole = 'owner' }: InteractiveOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showDemo, setShowDemo] = useState(false);

  if (!isOpen) return null;

  const step = ONBOARDING_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="max-w-2xl w-full bg-gradient-to-br from-slate-900 to-slate-800 border border-cyan-500/30 shadow-2xl">
        <CardHeader className="flex flex-row items-start justify-between pb-3">
          <div>
            <CardTitle className="text-2xl text-cyan-300">
              {step.title}
            </CardTitle>
          </div>
          <button
            onClick={handleSkip}
            className="text-slate-400 hover:text-slate-200"
            data-testid="button-close-onboarding"
          >
            <X className="w-6 h-6" />
          </button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step Icon */}
          <div className="flex justify-center">{step.icon}</div>

          {/* Description */}
          <p className="text-slate-300 text-center text-lg leading-relaxed">
            {step.description}
          </p>

          {/* Demo Content */}
          {showDemo && (
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-700 space-y-3">
              {currentStep === 1 && (
                <div className="space-y-2 text-sm text-slate-300">
                  <p>✓ Name: John Smith (Electrician)</p>
                  <p>✓ Skills: Residential electrical, 15 years</p>
                  <p>✓ Rate: $45/hour</p>
                  <p>✓ Available: Mon-Fri, 6am-6pm</p>
                  <p className="text-green-400 font-semibold">→ Ready for assignments!</p>
                </div>
              )}
              {currentStep === 2 && (
                <div className="space-y-2 text-sm text-slate-300">
                  <p>✓ Demand: 5 electricians needed</p>
                  <p>✓ Client: ABC Construction</p>
                  <p>✓ Rate: $60/hour (you charge client this)</p>
                  <p>✓ Duration: Next 2 weeks</p>
                  <p className="text-green-400 font-semibold">→ Posted! Providers can apply</p>
                </div>
              )}
              {currentStep === 3 && (
                <div className="space-y-2 text-sm text-slate-300">
                  <p>✓ John matched to ABC Construction job</p>
                  <p>✓ He clocks in via mobile app (GPS verified)</p>
                  <p>✓ You invoice client: $60/hr × 40 hours = $2,400</p>
                  <p>✓ ORBIT pays John: $45/hr × 40 hours = $1,800</p>
                  <p className="text-amber-400 font-semibold">→ Your margin: $600 this week</p>
                  <p className="text-cyan-400 font-semibold">→ Scale to 100 providers = $60k/week</p>
                </div>
              )}
            </div>
          )}

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Step {currentStep + 1} of {ONBOARDING_STEPS.length}</span>
              <span>{Math.round(((currentStep + 1) / ONBOARDING_STEPS.length) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1 overflow-hidden">
              <div
                className="bg-cyan-500 h-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {!showDemo && currentStep > 0 && currentStep < 4 && (
              <Button
                onClick={() => setShowDemo(true)}
                variant="outline"
                className="flex-1 text-slate-300"
                data-testid="button-show-demo"
              >
                Show Example
              </Button>
            )}
            {!showDemo && currentStep === 0 && (
              <Button
                onClick={handleSkip}
                variant="outline"
                className="flex-1 text-slate-300"
                data-testid="button-skip-tour"
              >
                Skip Tour
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center gap-2"
              data-testid="button-next-onboarding"
            >
              {currentStep === ONBOARDING_STEPS.length - 1 ? 'Start Building!' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
