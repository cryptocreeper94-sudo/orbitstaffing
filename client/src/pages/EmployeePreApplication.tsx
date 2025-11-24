import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EmployeePreApplication() {
  const [step, setStep] = useState<'info' | 'work' | 'legal' | 'payment' | 'review' | 'success'>('info');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    skills: [] as string[],
    desiredRoles: [] as string[],
    availabilityStatus: 'available',
    hourlyRateExpectation: '',
    experienceYears: '',
    ssn: '',
    backgroundCheckConsent: false,
    bankAccountHolderName: '',
    bankRoutingNumber: '',
    bankAccountNumber: '',
    bankAccountType: 'checking',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
  });

  const skillOptions = ['Welding', 'Electrical', 'Plumbing', 'HVAC', 'Carpentry', 'Roofing', 'Painting', 'General Labor', 'Forklift Operation', 'Equipment Operation'];
  const roleOptions = ['Temporary Worker', 'Full-Time', 'Part-Time', 'On-Demand'];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      desiredRoles: prev.desiredRoles.includes(role)
        ? prev.desiredRoles.filter(r => r !== role)
        : [...prev.desiredRoles, role]
    }));
  };

  const validateStep = (currentStep: typeof step): boolean => {
    setError('');
    if (currentStep === 'info') {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        setError('Please fill in all personal information fields');
        return false;
      }
      if (!formData.email.includes('@')) {
        setError('Please enter a valid email');
        return false;
      }
    }
    if (currentStep === 'work') {
      if (formData.skills.length === 0 || formData.desiredRoles.length === 0) {
        setError('Please select at least one skill and role');
        return false;
      }
      if (!formData.experienceYears) {
        setError('Please enter your years of experience');
        return false;
      }
    }
    if (currentStep === 'legal') {
      if (!formData.ssn || formData.ssn.length < 9) {
        setError('Please enter a valid SSN');
        return false;
      }
      if (!formData.backgroundCheckConsent) {
        setError('You must consent to background check');
        return false;
      }
    }
    if (currentStep === 'payment') {
      if (!formData.bankAccountHolderName || !formData.bankRoutingNumber || !formData.bankAccountNumber) {
        setError('Please enter all banking information');
        return false;
      }
      if (!formData.emergencyContactName || !formData.emergencyContactPhone) {
        setError('Please enter emergency contact information');
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateStep(step)) return;
    
    const steps: (typeof step)[] = ['info', 'work', 'legal', 'payment', 'review'];
    const currentIdx = steps.indexOf(step);
    if (currentIdx < steps.length - 1) {
      setStep(steps[currentIdx + 1]);
    } else if (step === 'review') {
      // Submit application to database
      try {
        const response = await fetch('/api/employee-pre-applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth || null,
            addressLine1: formData.addressLine1 || null,
            addressLine2: formData.addressLine2 || null,
            city: formData.city || null,
            state: formData.state || null,
            zipCode: formData.zipCode || null,
            skills: formData.skills,
            desiredRoles: formData.desiredRoles,
            availabilityStatus: formData.availabilityStatus,
            hourlyRateExpectation: formData.hourlyRateExpectation ? parseFloat(formData.hourlyRateExpectation) : null,
            experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : null,
            ssn: formData.ssn,
            backgroundCheckConsent: formData.backgroundCheckConsent,
            bankAccountHolderName: formData.bankAccountHolderName || null,
            bankRoutingNumber: formData.bankRoutingNumber || null,
            bankAccountNumber: formData.bankAccountNumber || null,
            bankAccountType: formData.bankAccountType || 'checking',
            emergencyContactName: formData.emergencyContactName || null,
            emergencyContactPhone: formData.emergencyContactPhone || null,
            emergencyContactRelation: formData.emergencyContactRelation || null,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          setError(error.error || 'Failed to submit application');
          toast.error('Application submission failed');
          return;
        }

        const result = await response.json();
        toast.success('Application submitted successfully!');
        setStep('success');
      } catch (err) {
        console.error('Submission error:', err);
        setError('Network error - please try again');
        toast.error('Network error');
      }
    }
  };

  const handleBack = () => {
    const steps: (typeof step)[] = ['info', 'work', 'legal', 'payment', 'review'];
    const currentIdx = steps.indexOf(step);
    if (currentIdx > 0) {
      setStep(steps[currentIdx - 1]);
    }
  };

  const steps = [
    { key: 'info', label: 'Personal', completed: step !== 'info' && formData.firstName },
    { key: 'work', label: 'Work Experience', completed: step !== 'work' && formData.skills.length > 0 },
    { key: 'legal', label: 'Legal & Tax', completed: step !== 'legal' && formData.ssn },
    { key: 'payment', label: 'Payment & Emergency', completed: step !== 'payment' && formData.bankAccountNumber },
    { key: 'review', label: 'Review', completed: false },
  ];

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-green-700/50">
          <CardContent className="p-12 text-center space-y-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Application Submitted!</h2>
              <p className="text-muted-foreground">
                Your pre-application has been received. We'll review it and contact you within 24 hours with next steps.
              </p>
            </div>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <p className="text-sm text-foreground">
                <strong>What's next:</strong> Our team will verify your information and send you onboarding instructions via email.
              </p>
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90" data-testid="button-done">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Join ORBIT Staffing</h1>
          <p className="text-gray-400">Complete your pre-application in 5 minutes</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex gap-2 mb-4 flex-wrap">
            {steps.map((s, i) => (
              <div
                key={i}
                className={`flex-1 min-w-[100px] text-center py-2 px-2 rounded-lg text-xs font-bold transition ${
                  step === s.key
                    ? 'bg-primary text-primary-foreground'
                    : s.completed
                    ? 'bg-green-900/30 text-green-300 border border-green-700/50'
                    : 'bg-slate-700 text-gray-400'
                }`}
              >
                {s.label}
              </div>
            ))}
          </div>
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${(steps.findIndex(s => s.key === step) + 1) / steps.length * 100}%` }}
            />
          </div>
        </div>

        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">
              {step === 'info' && 'Personal Information'}
              {step === 'work' && 'Work Experience'}
              {step === 'legal' && 'Legal & Tax Information'}
              {step === 'payment' && 'Payment & Emergency Contact'}
              {step === 'review' && 'Review Your Application'}
            </CardTitle>
            <CardDescription>
              {step === 'info' && 'Tell us about yourself'}
              {step === 'work' && 'What are your skills and availability?'}
              {step === 'legal' && 'We need this for I-9 and payroll compliance'}
              {step === 'payment' && 'For direct deposit and emergency contact'}
              {step === 'review' && 'Make sure everything looks correct'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 flex gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            {/* Step: Personal Information */}
            {step === 'info' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">First Name *</label>
                    <Input
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      data-testid="input-first-name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Last Name *</label>
                    <Input
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      data-testid="input-last-name"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Email *</label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    data-testid="input-email"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Phone *</label>
                  <Input
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    data-testid="input-phone"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Date of Birth</label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    data-testid="input-dob"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Street Address</label>
                  <Input
                    placeholder="123 Main St"
                    value={formData.addressLine1}
                    onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                    data-testid="input-address1"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    data-testid="input-city"
                  />
                  <Input
                    placeholder="State"
                    maxLength={2}
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    data-testid="input-state"
                  />
                  <Input
                    placeholder="ZIP"
                    maxLength={5}
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    data-testid="input-zip"
                  />
                </div>
              </div>
            )}

            {/* Step: Work Experience */}
            {step === 'work' && (
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">Skills & Experience * (Select all that apply)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {skillOptions.map(skill => (
                      <label key={skill} className="flex items-center gap-2 cursor-pointer p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition">
                        <input
                          type="checkbox"
                          checked={formData.skills.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                          data-testid={`checkbox-skill-${skill}`}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-foreground">{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">Type of Work Desired * (Select all that apply)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {roleOptions.map(role => (
                      <label key={role} className="flex items-center gap-2 cursor-pointer p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition">
                        <input
                          type="checkbox"
                          checked={formData.desiredRoles.includes(role)}
                          onChange={() => handleRoleToggle(role)}
                          data-testid={`checkbox-role-${role}`}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-foreground">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Years of Experience *</label>
                  <Input
                    type="number"
                    placeholder="5"
                    value={formData.experienceYears}
                    onChange={(e) => handleInputChange('experienceYears', e.target.value)}
                    data-testid="input-experience"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Desired Hourly Rate</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                    <Input
                      type="number"
                      placeholder="18.50"
                      value={formData.hourlyRateExpectation}
                      onChange={(e) => handleInputChange('hourlyRateExpectation', e.target.value)}
                      className="pl-7"
                      data-testid="input-rate"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Availability</label>
                  <select
                    value={formData.availabilityStatus}
                    onChange={(e) => handleInputChange('availabilityStatus', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-foreground"
                    data-testid="select-availability"
                  >
                    <option value="available">Available Now</option>
                    <option value="limited">Limited Availability</option>
                    <option value="unavailable">Not Currently Available</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step: Legal & Tax */}
            {step === 'legal' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Social Security Number * (Encrypted)</label>
                  <Input
                    type="password"
                    placeholder="XXX-XX-1234"
                    value={formData.ssn}
                    onChange={(e) => handleInputChange('ssn', e.target.value)}
                    maxLength={11}
                    data-testid="input-ssn"
                  />
                  <p className="text-xs text-gray-500 mt-1">Your SSN is encrypted and secure</p>
                </div>

                <div className="border border-yellow-700/50 bg-yellow-900/10 rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.backgroundCheckConsent}
                      onChange={(e) => handleInputChange('backgroundCheckConsent', (e.target as HTMLInputElement).checked)}
                      data-testid="checkbox-background-consent"
                      className="mt-1 w-4 h-4"
                    />
                    <span className="text-sm text-foreground">
                      I consent to a background check as required by law. Background check will be conducted by a third party and results are confidential. *
                    </span>
                  </label>
                </div>

                <div className="bg-blue-900/10 border border-blue-700/50 rounded-lg p-4">
                  <p className="text-xs text-gray-400">
                    <strong>I-9 Verification:</strong> You'll complete an electronic I-9 form during onboarding. Your SSN is used for employment verification only and is encrypted at rest.
                  </p>
                </div>
              </div>
            )}

            {/* Step: Payment & Emergency */}
            {step === 'payment' && (
              <div className="space-y-4">
                <div className="bg-blue-900/10 border border-blue-700/50 rounded-lg p-4 mb-4">
                  <p className="text-xs text-gray-400">
                    Your banking information is encrypted and only used for direct deposit payroll.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Account Holder Name *</label>
                  <Input
                    placeholder="John Doe"
                    value={formData.bankAccountHolderName}
                    onChange={(e) => handleInputChange('bankAccountHolderName', e.target.value)}
                    data-testid="input-bank-name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Routing Number *</label>
                    <Input
                      placeholder="121000248"
                      value={formData.bankRoutingNumber}
                      onChange={(e) => handleInputChange('bankRoutingNumber', e.target.value.slice(0, 9))}
                      data-testid="input-routing"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Account Number *</label>
                    <Input
                      type="password"
                      placeholder="••••••••••••3456"
                      value={formData.bankAccountNumber}
                      onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                      data-testid="input-account"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Account Type</label>
                  <select
                    value={formData.bankAccountType}
                    onChange={(e) => handleInputChange('bankAccountType', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-foreground"
                    data-testid="select-account-type"
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                  </select>
                </div>

                <div className="border-t border-slate-600 pt-6">
                  <h3 className="font-bold text-foreground mb-4">Emergency Contact</h3>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Name *</label>
                    <Input
                      placeholder="Jane Doe"
                      value={formData.emergencyContactName}
                      onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                      data-testid="input-emergency-name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Phone *</label>
                      <Input
                        placeholder="+1 (555) 987-6543"
                        value={formData.emergencyContactPhone}
                        onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                        data-testid="input-emergency-phone"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Relationship</label>
                      <Input
                        placeholder="Spouse, Parent, Friend, etc."
                        value={formData.emergencyContactRelation}
                        onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                        data-testid="input-emergency-relation"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step: Review */}
            {step === 'review' && (
              <div className="space-y-4">
                <div className="bg-green-900/10 border border-green-700/50 rounded-lg p-4">
                  <p className="text-sm text-green-300">
                    ✓ All information looks good! Click submit to send your application for review.
                  </p>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <p className="text-gray-400 mb-2"><strong>Personal:</strong> {formData.firstName} {formData.lastName}</p>
                    <p className="text-gray-400"><strong>Email:</strong> {formData.email}</p>
                  </div>

                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <p className="text-gray-400 mb-2"><strong>Skills:</strong> {formData.skills.join(', ')}</p>
                    <p className="text-gray-400"><strong>Experience:</strong> {formData.experienceYears} years</p>
                  </div>

                  <div className="bg-yellow-900/10 border border-yellow-700/50 rounded-lg p-4">
                    <p className="text-xs text-yellow-300">
                      ⚠️ Your application will be reviewed within 24 hours. We'll contact you to schedule I-9 verification and complete onboarding.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-2 pt-4 border-t border-slate-600">
              {step !== 'info' && (
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-back"
                >
                  Back
                </Button>
              )}
              {step !== 'success' && (
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  data-testid={step === 'review' ? 'button-submit' : 'button-next'}
                >
                  {step === 'review' ? 'Submit Application' : 'Next'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-gray-500 text-xs mt-4">
          Your information is secure and encrypted. We'll never share it without your permission.
        </p>
      </div>
    </div>
  );
}
