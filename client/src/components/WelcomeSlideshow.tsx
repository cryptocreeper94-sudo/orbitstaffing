import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronRight,
  ChevronLeft,
  Users,
  Briefcase,
  DollarSign,
  Building2,
  CreditCard,
  Zap,
  X,
  CheckCircle2,
  MapPin,
  Clock,
  Shield,
  Sparkles
} from 'lucide-react';

const orbitMascot = "/mascot/orbit_mascot_cyan_saturn_style_transparent.png";

interface WelcomeSlideshowProps {
  isOpen: boolean;
  onClose: () => void;
}

type UserRole = 'employee' | 'owner' | 'employer' | null;

export function WelcomeSlideshow({ isOpen, onClose }: WelcomeSlideshowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [, setLocation] = useLocation();

  if (!isOpen) return null;

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleNavigate = (path: string) => {
    onClose();
    setLocation(path);
  };

  const totalSlides = 4;

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const renderSlide = () => {
    switch (currentSlide) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <img
                src={orbitMascot}
                alt="Orbit Mascot"
                className="w-24 h-24 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]"
              />
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Welcome to ORBIT
              </h2>
              <p className="text-slate-300 text-lg">
                The complete staffing platform for modern workforce management
              </p>
            </div>

            <div className="text-center">
              <p className="text-cyan-400 font-semibold mb-4">Select Your Role</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => handleRoleSelect('employee')}
                  className={`p-4 rounded-lg border-2 transition-all text-center min-w-0 ${
                    selectedRole === 'employee'
                      ? 'border-cyan-500 bg-cyan-500/20'
                      : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                  }`}
                  data-testid="button-role-employee"
                >
                  <Users className="w-8 h-8 text-green-400 mb-2 mx-auto" />
                  <div className="font-bold text-white text-sm">I'm a Worker</div>
                  <p className="text-xs text-slate-400 mt-1">Find jobs, track hours, get paid</p>
                </button>

                <button
                  onClick={() => handleRoleSelect('owner')}
                  className={`p-4 rounded-lg border-2 transition-all text-center min-w-0 ${
                    selectedRole === 'owner'
                      ? 'border-cyan-500 bg-cyan-500/20'
                      : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                  }`}
                  data-testid="button-role-owner"
                >
                  <Building2 className="w-8 h-8 text-purple-400 mb-2 mx-auto" />
                  <div className="font-bold text-white text-sm">Business Owner</div>
                  <p className="text-xs text-slate-400 mt-1">Manage staff, payroll, scheduling</p>
                </button>

                <button
                  onClick={() => handleRoleSelect('employer')}
                  className={`p-4 rounded-lg border-2 transition-all text-center min-w-0 ${
                    selectedRole === 'employer'
                      ? 'border-cyan-500 bg-cyan-500/20'
                      : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                  }`}
                  data-testid="button-role-employer"
                >
                  <Briefcase className="w-8 h-8 text-amber-400 mb-2 mx-auto" />
                  <div className="font-bold text-white text-sm">I Need Workers</div>
                  <p className="text-xs text-slate-400 mt-1">Post jobs, hire talent quickly</p>
                </button>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Platform Features
              </h2>
              <p className="text-slate-300">Everything you need in one place</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <MapPin className="w-6 h-6 text-cyan-400 mb-2" />
                <div className="font-semibold text-white text-sm">GPS Clock-In</div>
                <p className="text-xs text-slate-400">Verified location tracking</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <DollarSign className="w-6 h-6 text-green-400 mb-2" />
                <div className="font-semibold text-white text-sm">Instant Payroll</div>
                <p className="text-xs text-slate-400">Automated processing</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <Clock className="w-6 h-6 text-purple-400 mb-2" />
                <div className="font-semibold text-white text-sm">Time Tracking</div>
                <p className="text-xs text-slate-400">Digital timesheets</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <Shield className="w-6 h-6 text-amber-400 mb-2" />
                <div className="font-semibold text-white text-sm">Compliance</div>
                <p className="text-xs text-slate-400">Built-in regulations</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CreditCard className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                ORBIT Pay Card
              </h2>
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                <Sparkles className="w-3 h-3 mr-1" />
                Coming Soon
              </Badge>
            </div>

            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-cyan-500/30">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>Same-Day Pay</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>No Monthly Fees</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>Free ATM Access</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>Cashback Rewards</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button
                onClick={() => handleNavigate('/orbit-pay-card')}
                className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500"
                data-testid="button-view-paycard"
              >
                Learn More & Join Waitlist
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="text-center text-sm text-slate-400">
              <p>Direct deposit to your bank account is available now!</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <DollarSign className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Flexible Pricing
              </h2>
              <p className="text-slate-300">Start free, scale as you grow</p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-white">CRM</div>
                  <p className="text-xs text-slate-400">Pipeline & contacts</p>
                </div>
                <div className="text-cyan-400 font-bold">$19/mo</div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-white">Talent Exchange</div>
                  <p className="text-xs text-slate-400">Job board & matching</p>
                </div>
                <div className="text-cyan-400 font-bold">$29/mo</div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-white">Payroll</div>
                  <p className="text-xs text-slate-400">Multi-state compliant</p>
                </div>
                <div className="text-cyan-400 font-bold">$39/mo</div>
              </div>
              <div className="p-3 bg-gradient-to-r from-cyan-900/30 to-purple-900/30 rounded-lg border border-cyan-500/30 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-white">Growth Bundle</div>
                  <p className="text-xs text-slate-400">All 5 tools included</p>
                </div>
                <div className="text-green-400 font-bold">$149/mo</div>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={() => handleNavigate('/pricing')}
                variant="outline"
                className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
                data-testid="button-view-pricing"
              >
                View Full Pricing
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStartPath = () => {
    switch (selectedRole) {
      case 'employee':
        return '/employee-hub';
      case 'owner':
        return '/owner-hub';
      case 'employer':
        return '/employer/register';
      default:
        return '/';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="max-w-2xl w-full bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-1">
              {[...Array(totalSlides)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentSlide ? 'bg-cyan-500 w-6' : 'bg-slate-600 w-2 hover:bg-slate-500'
                  }`}
                  data-testid={`button-slide-${idx}`}
                />
              ))}
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1"
              data-testid="button-close-welcome"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {renderSlide()}

          <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800">
            <Button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              variant="ghost"
              className="text-slate-400 disabled:opacity-30"
              data-testid="button-prev"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            {currentSlide === totalSlides - 1 ? (
              <Button
                onClick={() => handleNavigate(getStartPath())}
                className="bg-cyan-600 hover:bg-cyan-700"
                data-testid="button-get-started"
              >
                {selectedRole ? `Go to ${selectedRole === 'employee' ? 'Employee' : selectedRole === 'owner' ? 'Owner' : 'Employer'} Hub` : 'Get Started'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={nextSlide}
                className="bg-cyan-600 hover:bg-cyan-700"
                data-testid="button-next"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
