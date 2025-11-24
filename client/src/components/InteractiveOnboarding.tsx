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
    title: "Welcome to Your Staffing Business",
    description: "ORBIT makes it dead simple to run a staffing agency. In the next 2 minutes, you'll see how easy it is to hire workers and make money.",
    icon: <Briefcase className="w-12 h-12 text-cyan-400" />,
    cta: "Show Me How",
    action: "next",
  },
  {
    id: 2,
    title: "Step 1: Add Workers (30 seconds)",
    description: "Import or create worker profiles. These are the people you'll assign to jobs. Add their skills, availability, and rates. That's it.",
    icon: <Users className="w-12 h-12 text-green-400" />,
    cta: "Create Worker",
    action: "demo_worker",
  },
  {
    id: 3,
    title: "Step 2: Post a Job (30 seconds)",
    description: "Create a job listing for clients. Set the rate, location, skills needed, and when they need workers. Clients see available workers instantly.",
    icon: <Briefcase className="w-12 h-12 text-purple-400" />,
    cta: "Post Job",
    action: "demo_job",
  },
  {
    id: 4,
    title: "Step 3: Assign & Profit (Instant)",
    description: "Match workers to jobs. ORBIT handles the rest: timesheets, payroll, invoicing to clients. You keep the difference.",
    icon: <DollarSign className="w-12 h-12 text-amber-400" />,
    cta: "See Dashboard",
    action: "demo_assign",
  },
  {
    id: 5,
    title: "That's It. You're a Staffing Business.",
    description: "Scale from 1 worker to 1000. ORBIT handles payroll, compliance, and invoicing. Focus on growing. That's your job now.",
    icon: <Zap className="w-12 h-12 text-cyan-400" />,
    cta: "Start Building",
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
                  <p>✓ Name: John Smith</p>
                  <p>✓ Skills: Electrician, 15 years experience</p>
                  <p>✓ Rate: $45/hour</p>
                  <p>✓ Available: Mon-Fri, 6am-6pm</p>
                  <p className="text-green-400 font-semibold">→ Ready to assign!</p>
                </div>
              )}
              {currentStep === 2 && (
                <div className="space-y-2 text-sm text-slate-300">
                  <p>✓ Client: ABC Construction</p>
                  <p>✓ Need: 5 electricians</p>
                  <p>✓ Rate: $60/hour (you charge client)</p>
                  <p>✓ Duration: Next 2 weeks</p>
                  <p className="text-green-400 font-semibold">→ Posted! Workers can apply</p>
                </div>
              )}
              {currentStep === 3 && (
                <div className="space-y-2 text-sm text-slate-300">
                  <p>✓ Assigned: John to ABC Construction</p>
                  <p>✓ He clocks in via app (GPS verified)</p>
                  <p>✓ Client pays you $60/hr → You pay John $45/hr</p>
                  <p className="text-amber-400 font-semibold">→ Your profit: $15/hr per worker</p>
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
              {currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started!' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
