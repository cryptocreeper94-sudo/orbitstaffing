import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

type DemoFlow = 'employee' | 'owner';

interface Slide {
  step: number;
  title: string;
  description: string;
  icon: string;
  highlight: string;
}

const employeeSlides: Slide[] = [
  {
    step: 1,
    title: 'Download ORBIT',
    description: 'Available on iOS and Android. Get the worker app.',
    icon: '📱',
    highlight: 'Free app, biometric security',
  },
  {
    step: 2,
    title: 'Sign Up & Verify',
    description: 'Create account with phone/email. One-time verification.',
    icon: '✅',
    highlight: '2 minutes to complete',
  },
  {
    step: 3,
    title: 'Get Shift Alerts',
    description: 'Job assignments come to your phone in real-time. Accept or decline instantly.',
    icon: '🔔',
    highlight: 'Instant notifications',
  },
  {
    step: 4,
    title: 'Clock In with GPS',
    description: 'When you arrive, tap to clock in. GPS verifies you\'re at the location.',
    icon: '📍',
    highlight: 'Fair, transparent, ±15-30 feet',
  },
  {
    step: 5,
    title: 'Work & Track Earnings',
    description: 'Real-time earnings display. See exactly how much you\'re making.',
    icon: '💰',
    highlight: 'Transparent pay calculation',
  },
  {
    step: 6,
    title: 'Clock Out',
    description: 'Tap to clock out when done. GPS confirms location.',
    icon: '✔️',
    highlight: 'Instant confirmation',
  },
  {
    step: 7,
    title: 'Earn Bonuses',
    description: 'Weekly performance bonus ($35/week after 2 perfect weeks). Annual loyalty rewards ($480-$5,000/year).',
    icon: '🏆',
    highlight: 'Real money for showing up',
  },
  {
    step: 8,
    title: 'Get Paid Instantly',
    description: 'ORBIT Card delivers pay same day. Direct deposit or check available.',
    icon: '💳',
    highlight: 'No waiting 2 weeks',
  },
  {
    step: 9,
    title: 'See Your Loyalty Score',
    description: 'Track loyalty tier (Tier 1-4). Watch your annual bonus grow.',
    icon: '📊',
    highlight: 'Motivation on your phone',
  },
  {
    step: 10,
    title: 'Get Paid Again',
    description: 'Every paycheck includes: base wage + bonuses + loyalty rewards.',
    icon: '💵',
    highlight: 'Earning more than anywhere else',
  },
];

const ownerSlides: Slide[] = [
  {
    step: 1,
    title: 'Sign Up ORBIT',
    description: 'Create agency account. Set up your company profile.',
    icon: '🏢',
    highlight: '5 minutes setup',
  },
  {
    step: 2,
    title: 'Post a Job',
    description: 'Create assignment: date, time, location, wage, job type.',
    icon: '📝',
    highlight: 'One click posting',
  },
  {
    step: 3,
    title: 'System Matches Workers',
    description: 'ORBIT automatically suggests best available workers. No manual calling.',
    icon: '🤖',
    highlight: 'AI-powered matching',
  },
  {
    step: 4,
    title: 'Workers Confirm Instantly',
    description: 'Workers accept shifts in app. You see confirmations in real-time.',
    icon: '✅',
    highlight: 'Job filled in seconds',
  },
  {
    step: 5,
    title: 'Workers Clock In',
    description: 'GPS verifies they arrive at job site. You see real-time status.',
    icon: '📍',
    highlight: 'No time theft',
  },
  {
    step: 6,
    title: 'Real-Time Dashboard',
    description: 'See every worker, every assignment, every earning in one place.',
    icon: '📊',
    highlight: 'Complete visibility',
  },
  {
    step: 7,
    title: 'Workers Clock Out',
    description: 'Job complete. Hours recorded. You\'re instantly notified.',
    icon: '⏱️',
    highlight: 'Accurate time tracking',
  },
  {
    step: 8,
    title: 'Bonuses Auto-Calculate',
    description: 'Weekly bonuses ($35/week) and loyalty rewards ($480-$5k/year) automatically calculated.',
    icon: '✨',
    highlight: 'Keeps workers loyal',
  },
  {
    step: 9,
    title: 'Payroll Auto-Runs',
    description: 'Payroll processes automatically. Bonuses, taxes, deductions all handled.',
    icon: '💼',
    highlight: '0 manual payroll work',
  },
  {
    step: 10,
    title: 'Invoicing Auto-Generated',
    description: 'Client invoices created automatically with your markup. Send with one click.',
    icon: '📄',
    highlight: 'Full billing automation',
  },
  {
    step: 11,
    title: 'Worker Gets Paid Instantly',
    description: 'You know: your worker earns $18/hour + $7 weekly bonus + loyalty rewards.',
    icon: '💰',
    highlight: 'They choose you over competitors',
  },
  {
    step: 12,
    title: 'You Save Time & Money',
    description: '15+ hours/week freed up. $2,500+/month saved on turnover. Workers stay 3x longer.',
    icon: '🎯',
    highlight: '300-500% ROI on bonuses',
  },
];

export default function WorkflowDemo({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [flow, setFlow] = useState<DemoFlow>('employee');
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = flow === 'employee' ? employeeSlides : ownerSlides;
  const slide = slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleFlowChange = (newFlow: DemoFlow) => {
    setFlow(newFlow);
    setCurrentSlide(0);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      data-testid="modal-backdrop"
    >
      <div 
        className="bg-white rounded-lg w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:p-6 py-4 flex justify-between items-center gap-4">
          <h2 className="text-lg sm:text-2xl font-bold flex-1">How ORBIT Works</h2>
          <button
            onClick={onClose}
            className="hover:bg-blue-800 p-2 rounded transition flex-shrink-0"
            data-testid="button-close-demo"
            aria-label="Close demo"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Flow Toggle */}
        <div className="bg-gray-100 p-3 sm:p-4 flex gap-2 sm:gap-4 justify-center border-b flex-wrap">
          <button
            onClick={() => handleFlowChange('employee')}
            className={`px-3 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base transition ${
              flow === 'employee'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600'
            }`}
            data-testid="button-flow-employee"
          >
            👷 Worker
          </button>
          <button
            onClick={() => handleFlowChange('owner')}
            className={`px-3 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base transition ${
              flow === 'owner'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600'
            }`}
            data-testid="button-flow-owner"
          >
            🏢 Owner
          </button>
        </div>

        {/* Slide Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto">
          <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">{slide.icon}</div>
          <div className="text-center max-w-sm sm:max-w-md">
            <p className="text-xs sm:text-sm font-medium text-blue-600 mb-2">
              Step {slide.step} of {slides.length}
            </p>
            <h3 className="text-xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">{slide.title}</h3>
            <p className="text-sm sm:text-lg text-gray-700 mb-3 sm:mb-4 leading-relaxed">{slide.description}</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 inline-block">
              <p className="text-blue-900 font-semibold text-xs sm:text-sm">{slide.highlight}</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-200 h-1">
          <div
            className="bg-blue-600 h-full transition-all"
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          />
        </div>

        {/* Navigation */}
        <div className="bg-gray-50 p-3 sm:p-6 flex justify-between items-center gap-2 sm:gap-4 flex-wrap">
          <button
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition ${
              currentSlide === 0
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            data-testid="button-prev-slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Back</span>
          </button>

          <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition ${
                  idx === currentSlide ? 'bg-blue-600 w-6 sm:w-8' : 'bg-gray-300'
                }`}
                data-testid={`button-dot-${idx}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentSlide === slides.length - 1}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition ${
              currentSlide === slides.length - 1
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            data-testid="button-next-slide"
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
