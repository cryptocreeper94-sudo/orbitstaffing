/**
 * Developer Landing Page
 * Public sandbox entry point - join as Owner or Employee with PIN 7777
 */
import React, { useState } from 'react';
import { Code, Shield, Users, LogOut, Briefcase, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { BentoGrid, BentoTile } from '@/components/ui/bento-grid';
import { CarouselRail } from '@/components/ui/carousel-rail';
import { SectionHeader, PageHeader } from '@/components/ui/section-header';
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardDescription, OrbitCardContent, ActionCard } from '@/components/ui/orbit-card';

export default function DeveloperLanding() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pinInput, setPinInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<'owner' | 'employee' | null>(null);
  const [error, setError] = useState('');
  const [showOwnerCodeInput, setShowOwnerCodeInput] = useState(false);
  const [showEmployeeCodeInput, setShowEmployeeCodeInput] = useState(false);
  const [ownerAccessCode, setOwnerAccessCode] = useState('');
  const [employeeAccessCode, setEmployeeAccessCode] = useState('');
  const [accessCodeError, setAccessCodeError] = useState('');

  const loginMutation = useMutation({
    mutationFn: async (sandboxRole: 'owner' | 'employee') => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: '7777',
          sandboxRole: sandboxRole,
        }),
      });
      if (!res.ok) throw new Error('Login failed');
      return res.json();
    },
    onSuccess: (user, sandboxRole) => {
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('userRole', user.role);
      
      if (sandboxRole === 'owner') {
        setLocation('/dashboard');
      } else {
        setLocation('/employee-app');
      }
    },
    onError: () => {
      setError('Failed to join sandbox. Please try again.');
      setPinInput('');
      setSelectedRole(null);
    },
  });

  const handleJoinSandbox = (role: 'owner' | 'employee') => {
    setSelectedRole(role);
    setError('');
    loginMutation.mutate(role);
  };

  const handleOwnerLogin = (code: string) => {
    setAccessCodeError('');
    if (!code.trim()) {
      setAccessCodeError('Access code required');
      return;
    }
    localStorage.setItem('userAccessCode', code);
    localStorage.setItem('userRole', 'owner');
    localStorage.setItem('currentUser', JSON.stringify({ role: 'owner', accessCode: code }));
    setLocation('/dashboard');
  };

  const handleEmployeeLogin = (code: string) => {
    setAccessCodeError('');
    if (!code.trim()) {
      setAccessCodeError('Access code required');
      return;
    }
    localStorage.setItem('userAccessCode', code);
    localStorage.setItem('userRole', 'worker');
    localStorage.setItem('currentUser', JSON.stringify({ role: 'worker', accessCode: code }));
    setLocation('/employee-app');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setPinInput('');
    setSelectedRole(null);
    setError('');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
  };

  const ownerFeatures = [
    'Create & manage jobs',
    'Assign workers instantly',
    'Process instant payroll',
    'Track earnings and bonuses',
  ];

  const employeeFeatures = [
    'View assigned jobs',
    'GPS clock-in/out',
    'Real-time earnings',
    'Track bonuses and payments',
  ];

  if (isAuthenticated && currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <PageHeader
            title="ORBIT Sandbox"
            subtitle={`Logged in as ${currentUser.firstName} (${currentUser.role})`}
            breadcrumb={
              <div className="flex items-center gap-2">
                <Code className="w-6 h-6 text-purple-400" />
              </div>
            }
            actions={
              <Button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
                data-testid="button-sandbox-logout"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            }
          />

          <BentoGrid cols={2} gap="md">
            {currentUser.role === 'admin' && (
              <BentoTile>
                <ActionCard
                  title="Admin Dashboard"
                  description="View all companies, workers, and system metrics"
                  icon={<Shield className="w-8 h-8 text-cyan-400" />}
                  onClick={() => setLocation('/admin')}
                  className="h-full border-0"
                />
              </BentoTile>
            )}

            {currentUser.role === 'owner' && (
              <BentoTile>
                <ActionCard
                  title="Owner Dashboard"
                  description="Manage jobs, assignments, and payroll"
                  icon={<Users className="w-8 h-8 text-green-400" />}
                  onClick={() => setLocation('/dashboard')}
                  className="h-full border-0"
                />
              </BentoTile>
            )}
          </BentoGrid>
        </div>
      </div>
    );
  }

  const SandboxCard = ({ 
    type, 
    icon, 
    color, 
    features 
  }: { 
    type: 'owner' | 'employee'; 
    icon: React.ReactNode; 
    color: 'green' | 'purple'; 
    features: string[] 
  }) => (
    <OrbitCard variant="default" className="flex flex-col h-full min-w-[280px] md:min-w-0">
      <OrbitCardHeader icon={icon}>
        <OrbitCardTitle className="text-center w-full">
          {type === 'owner' ? 'Owner Sandbox' : 'Employee Sandbox'}
        </OrbitCardTitle>
        <OrbitCardDescription className="text-center">
          {type === 'owner' 
            ? 'Full control - manage jobs, workers, payroll, and invoices'
            : 'View jobs, clock in, track earnings and bonuses'}
        </OrbitCardDescription>
      </OrbitCardHeader>
      <OrbitCardContent className="flex-grow">
        <div className="space-y-3 bg-slate-700/30 p-4 rounded mb-4">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
              <span className={color === 'green' ? 'text-green-400' : 'text-purple-400'}>✓</span>
              {feature}
            </div>
          ))}
        </div>
      </OrbitCardContent>
      <div className="mt-auto">
        <Button
          onClick={() => handleJoinSandbox(type)}
          disabled={loginMutation.isPending}
          className={`w-full ${color === 'green' ? 'bg-green-600 hover:bg-green-700 glow-green' : 'bg-purple-600 hover:bg-purple-700 glow-purple'} text-white py-2 text-base mb-2 font-bold`}
          data-testid={`button-join-${type}-sandbox`}
        >
          {loginMutation.isPending && selectedRole === type
            ? 'Joining...'
            : `Join as ${type === 'owner' ? 'Owner' : 'Employee'}`}
        </Button>
        <p className="text-xs text-gray-500 text-center">
          {type === 'owner' ? 'Full control sandbox' : 'Worker experience sandbox'}
        </p>
      </div>
    </OrbitCard>
  );

  const LoginCard = ({
    type,
    icon,
    color,
    showInput,
    setShowInput,
    accessCode,
    setAccessCode,
    onSubmit,
    disabled = false
  }: {
    type: 'owner' | 'employee' | 'admin';
    icon: React.ReactNode;
    color: 'green' | 'purple' | 'cyan';
    showInput?: boolean;
    setShowInput?: (v: boolean) => void;
    accessCode?: string;
    setAccessCode?: (v: string) => void;
    onSubmit?: () => void;
    disabled?: boolean;
  }) => (
    <OrbitCard 
      variant="glass" 
      className={`min-w-[200px] md:min-w-0 ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${showInput ? `border-${color}-500/50` : ''}`}
    >
      <div className="flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className={`text-lg font-bold mb-2 text-center ${disabled ? 'text-gray-500' : 'text-white'}`}>
        {type === 'owner' ? 'Owner Login' : type === 'employee' ? 'Employee Login' : 'Admin Portal'}
      </h3>
      <p className={`text-xs mb-4 text-center ${disabled ? 'text-gray-500' : 'text-gray-400'}`}>
        {type === 'owner' 
          ? 'Access your staffing business dashboard'
          : type === 'employee'
          ? 'View assignments and track earnings'
          : 'System administration and oversight'}
      </p>
      
      {type === 'admin' ? (
        <Button
          onClick={() => setLocation('/admin')}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold glow-cyan"
          data-testid="button-admin-login-section"
        >
          Admin Access
        </Button>
      ) : !showInput ? (
        <Button
          onClick={() => setShowInput?.(true)}
          className={`w-full ${color === 'green' ? 'bg-green-600 hover:bg-green-700 glow-green' : 'bg-purple-600 hover:bg-purple-700 glow-purple'} text-white font-bold py-2 px-4`}
          data-testid={`button-${type}-login-enable`}
        >
          Access Code
        </Button>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Enter access code"
            value={accessCode}
            onChange={(e) => {
              setAccessCode?.(e.target.value);
              setAccessCodeError('');
            }}
            className={`w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-${color}-400`}
            data-testid={`input-${type}-access-code`}
          />
          {accessCodeError && <p className="text-xs text-red-400">{accessCodeError}</p>}
          <div className="flex gap-2">
            <Button
              onClick={onSubmit}
              className={`flex-1 ${color === 'green' ? 'bg-green-600 hover:bg-green-700 glow-green' : 'bg-purple-600 hover:bg-purple-700 glow-purple'} text-white font-bold text-sm py-2`}
              data-testid={`button-${type}-access-submit`}
            >
              Submit
            </Button>
            <Button
              onClick={() => {
                setShowInput?.(false);
                setAccessCode?.('');
                setAccessCodeError('');
              }}
              variant="outline"
              className="flex-1 text-sm border-gray-500 text-gray-300 hover:bg-slate-700"
              data-testid={`button-${type}-access-cancel`}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </OrbitCard>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <PageHeader
          title="ORBIT Staffing OS"
          subtitle="Complete Staffing Platform Demo"
          breadcrumb={
            <div className="flex items-center justify-center w-full">
              <Code className="w-10 h-10 text-purple-400" />
            </div>
          }
          className="text-center mb-8"
        />

        {error && (
          <OrbitCard variant="default" className="border-red-700 bg-red-900/20 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-200">{error}</p>
            </div>
          </OrbitCard>
        )}

        <SectionHeader
          title="Try the Sandbox"
          subtitle="Experience the full platform without registration"
          align="center"
          size="md"
          className="mb-6"
        />

        <div className="hidden md:block mb-8">
          <BentoGrid cols={2} gap="md">
            <BentoTile>
              <SandboxCard 
                type="owner" 
                icon={<Users className="w-8 h-8 text-green-400" />}
                color="green"
                features={ownerFeatures}
              />
            </BentoTile>
            <BentoTile>
              <SandboxCard 
                type="employee" 
                icon={<Users className="w-8 h-8 text-purple-400" />}
                color="purple"
                features={employeeFeatures}
              />
            </BentoTile>
          </BentoGrid>
        </div>

        <div className="md:hidden mb-8">
          <CarouselRail gap="md" itemWidth="lg" showArrows={false}>
            <SandboxCard 
              type="owner" 
              icon={<Users className="w-8 h-8 text-green-400" />}
              color="green"
              features={ownerFeatures}
            />
            <SandboxCard 
              type="employee" 
              icon={<Users className="w-8 h-8 text-purple-400" />}
              color="purple"
              features={employeeFeatures}
            />
          </CarouselRail>
        </div>

        <SectionHeader
          title="Production Access"
          subtitle="Sign in with your registered account or access code"
          align="center"
          size="md"
          className="mb-6"
        />

        <div className="hidden md:block mb-8">
          <BentoGrid cols={3} gap="md">
            <BentoTile>
              <LoginCard
                type="owner"
                icon={<Briefcase className="w-6 h-6 text-green-400" />}
                color="green"
                showInput={showOwnerCodeInput}
                setShowInput={setShowOwnerCodeInput}
                accessCode={ownerAccessCode}
                setAccessCode={setOwnerAccessCode}
                onSubmit={() => handleOwnerLogin(ownerAccessCode)}
              />
            </BentoTile>
            <BentoTile>
              <LoginCard
                type="employee"
                icon={<Users className="w-6 h-6 text-purple-400" />}
                color="purple"
                showInput={showEmployeeCodeInput}
                setShowInput={setShowEmployeeCodeInput}
                accessCode={employeeAccessCode}
                setAccessCode={setEmployeeAccessCode}
                onSubmit={() => handleEmployeeLogin(employeeAccessCode)}
              />
            </BentoTile>
            <BentoTile>
              <LoginCard
                type="admin"
                icon={<Shield className="w-6 h-6 text-gray-500" />}
                color="cyan"
                disabled
              />
            </BentoTile>
          </BentoGrid>
        </div>

        <div className="md:hidden mb-8">
          <CarouselRail gap="md" itemWidth="md" showArrows={false}>
            <LoginCard
              type="owner"
              icon={<Briefcase className="w-6 h-6 text-green-400" />}
              color="green"
              showInput={showOwnerCodeInput}
              setShowInput={setShowOwnerCodeInput}
              accessCode={ownerAccessCode}
              setAccessCode={setOwnerAccessCode}
              onSubmit={() => handleOwnerLogin(ownerAccessCode)}
            />
            <LoginCard
              type="employee"
              icon={<Users className="w-6 h-6 text-purple-400" />}
              color="purple"
              showInput={showEmployeeCodeInput}
              setShowInput={setShowEmployeeCodeInput}
              accessCode={employeeAccessCode}
              setAccessCode={setEmployeeAccessCode}
              onSubmit={() => handleEmployeeLogin(employeeAccessCode)}
            />
            <LoginCard
              type="admin"
              icon={<Shield className="w-6 h-6 text-gray-500" />}
              color="cyan"
              disabled
            />
          </CarouselRail>
        </div>

        <OrbitCard variant="glass" className="text-center">
          <p className="text-gray-400 text-sm mb-2">
            Complete demo environment ready for production testing
          </p>
          <p className="text-xs text-gray-500">
            Request a free demo to get your access code
          </p>
        </OrbitCard>
      </div>
    </div>
  );
}
