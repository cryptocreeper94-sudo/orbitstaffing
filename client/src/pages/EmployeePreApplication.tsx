import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, CheckCircle2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface WorkHistory {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  notes: string;
}

interface Reference {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  company: string;
}

export default function EmployeePreApplication() {
  const [step, setStep] = useState<'info' | 'contact' | 'work' | 'references' | 'legal' | 'agreements' | 'payment' | 'equipment' | 'review' | 'success'>('info');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    phone2: '',
    dateOfBirth: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: 'TN',
    zipCode: '',
    
    workHistory: [] as WorkHistory[],
    references: [] as Reference[],
    
    ssn: '',
    backgroundCheckConsent: false,
    drugTestConsent: false,
    accidentDrugTestConsent: false,
    tennesseeRightToWorkAcknowledged: false,
    
    skills: [] as string[],
    experienceYears: '',
    hourlyRateExpectation: '',
    
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    
    equipmentAcknowledgmentConsent: false,
    equipmentReturnTermsAccepted: false,
    
    bankAccountHolderName: '',
    bankRoutingNumber: '',
    bankAccountNumber: '',
    bankAccountType: 'checking',
  });

  const skillOptions = ['Welding', 'Electrical', 'Plumbing', 'HVAC', 'Carpentry', 'Roofing', 'Painting', 'General Labor', 'Forklift Operation', 'Equipment Operation'];

  // Auto-save progress every 30 seconds
  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveProgress();
    }, 30000);
    return () => clearInterval(saveInterval);
  }, [formData]);

  const saveProgress = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/employee-pre-applications/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          currentStep: step,
          progressSavedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const now = new Date().toLocaleTimeString();
        setLastSavedTime(now);
        console.log('Progress saved at', now);
      }
    } catch (err) {
      console.error('Save progress error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    toast.promise(saveProgress(), {
      loading: 'Saving progress...',
      success: 'Progress saved to your file!',
      error: 'Failed to save progress',
    });
  };

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

  const addWorkHistory = () => {
    setFormData(prev => ({
      ...prev,
      workHistory: [...prev.workHistory, {
        id: Math.random().toString(),
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        notes: '',
      }]
    }));
  };

  const updateWorkHistory = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      workHistory: prev.workHistory.map(w => w.id === id ? { ...w, [field]: value } : w)
    }));
  };

  const removeWorkHistory = (id: string) => {
    setFormData(prev => ({
      ...prev,
      workHistory: prev.workHistory.filter(w => w.id !== id)
    }));
  };

  const addReference = () => {
    setFormData(prev => ({
      ...prev,
      references: [...prev.references, {
        id: Math.random().toString(),
        name: '',
        phone: '',
        relationship: '',
        company: '',
      }]
    }));
  };

  const updateReference = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.map(r => r.id === id ? { ...r, [field]: value } : r)
    }));
  };

  const removeReference = (id: string) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.filter(r => r.id !== id)
    }));
  };

  const validateStep = (currentStep: typeof step): boolean => {
    setError('');
    
    if (currentStep === 'info') {
      if (!formData.firstName || !formData.lastName) {
        setError('First and last name are required');
        return false;
      }
    }
    
    if (currentStep === 'contact') {
      if (!formData.email || !formData.phone) {
        setError('Email and phone number are required');
        return false;
      }
      if (!formData.email.includes('@')) {
        setError('Please enter a valid email');
        return false;
      }
      if (!formData.addressLine1 || !formData.city || !formData.zipCode) {
        setError('Please complete your address');
        return false;
      }
    }
    
    if (currentStep === 'work') {
      if (!formData.experienceYears) {
        setError('Please enter your years of experience');
        return false;
      }
      if (formData.skills.length === 0) {
        setError('Please select at least one skill');
        return false;
      }
    }
    
    if (currentStep === 'references') {
      if (formData.references.length < 3) {
        setError('Please provide at least 3 references');
        return false;
      }
      for (let ref of formData.references) {
        if (!ref.name || !ref.phone || !ref.relationship) {
          setError('Please complete all reference information');
          return false;
        }
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
    
    if (currentStep === 'agreements') {
      if (!formData.drugTestConsent || !formData.accidentDrugTestConsent) {
        setError('You must consent to both drug testing policies');
        return false;
      }
      if (!formData.tennesseeRightToWorkAcknowledged) {
        setError('You must acknowledge right-to-work status');
        return false;
      }
    }
    
    if (currentStep === 'payment') {
      if (!formData.emergencyContactName || !formData.emergencyContactPhone) {
        setError('Please enter emergency contact information');
        return false;
      }
      if (!formData.bankAccountHolderName || !formData.bankRoutingNumber || !formData.bankAccountNumber) {
        setError('Please enter banking information');
        return false;
      }
    }
    
    if (currentStep === 'equipment') {
      if (!formData.equipmentAcknowledgmentConsent || !formData.equipmentReturnTermsAccepted) {
        setError('You must acknowledge equipment terms');
        return false;
      }
    }
    
    return true;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    
    const steps: (typeof step)[] = ['info', 'contact', 'work', 'references', 'legal', 'agreements', 'payment', 'equipment', 'review'];
    const currentIdx = steps.indexOf(step);
    if (currentIdx < steps.length - 1) {
      setStep(steps[currentIdx + 1]);
    }
  };

  const handleBack = () => {
    const steps: (typeof step)[] = ['info', 'contact', 'work', 'references', 'legal', 'agreements', 'payment', 'equipment', 'review'];
    const currentIdx = steps.indexOf(step);
    if (currentIdx > 0) {
      setStep(steps[currentIdx - 1]);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep('review')) return;

    try {
      const response = await fetch('/api/employee-pre-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          workHistory: formData.workHistory,
          references: formData.references,
          submittedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit application');
        toast.error('Application submission failed');
        return;
      }

      toast.success('Application submitted successfully!');
      setStep('success');
    } catch (err) {
      console.error('Submission error:', err);
      setError('Network error - please try again');
      toast.error('Network error');
    }
  };

  const steps = [
    { key: 'info', label: 'Basic Info', icon: '👤' },
    { key: 'contact', label: 'Contact', icon: '📞' },
    { key: 'work', label: 'Work Experience', icon: '💼' },
    { key: 'references', label: 'References', icon: '⭐' },
    { key: 'legal', label: 'Legal & Tax', icon: '📋' },
    { key: 'agreements', label: 'Agreements', icon: '✍️' },
    { key: 'payment', label: 'Payment & Emergency', icon: '💳' },
    { key: 'equipment', label: 'Equipment', icon: '🔧' },
    { key: 'review', label: 'Review', icon: '✅' },
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
                Your application has been received and saved to your employee file. We'll review it and contact you within 24 hours.
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
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Employee Pre-Application</h1>
          <div className="flex justify-between items-center">
            <p className="text-gray-400">Complete your application - your progress is automatically saved</p>
            {lastSavedTime && <p className="text-xs text-green-400">✓ Saved at {lastSavedTime}</p>}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((s, idx) => (
              <div key={s.key} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    steps.map(st => st.key).indexOf(step) >= idx
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-700 text-gray-400'
                  }`}
                  data-testid={`step-${s.key}`}
                >
                  {s.icon}
                </div>
                <span className="text-xs text-gray-400 mt-1 text-center">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Form Content */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardContent className="p-8">
            {/* Basic Info */}
            {step === 'info' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Basic Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">First Name *</label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="First name"
                      data-testid="input-firstname"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Last Name *</label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Last name"
                      data-testid="input-lastname"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                    <Input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      data-testid="input-dob"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Contact Info */}
            {step === 'contact' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Contact Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Email address"
                      data-testid="input-email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone #1 *</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Primary phone"
                      data-testid="input-phone"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone #2</label>
                    <Input
                      value={formData.phone2}
                      onChange={(e) => handleInputChange('phone2', e.target.value)}
                      placeholder="Secondary phone"
                      data-testid="input-phone2"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Address Line 1 *</label>
                    <Input
                      value={formData.addressLine1}
                      onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                      placeholder="Street address"
                      data-testid="input-address1"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Address Line 2</label>
                    <Input
                      value={formData.addressLine2}
                      onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                      placeholder="Apt, suite, etc."
                      data-testid="input-address2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">City *</label>
                    <Input
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="City"
                      data-testid="input-city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">State *</label>
                    <Input
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="TN"
                      data-testid="input-state"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Zip Code *</label>
                    <Input
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="Zip code"
                      data-testid="input-zip"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Work Experience */}
            {step === 'work' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Work Experience</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Years of Experience *</label>
                  <Input
                    type="number"
                    value={formData.experienceYears}
                    onChange={(e) => handleInputChange('experienceYears', e.target.value)}
                    placeholder="Years"
                    data-testid="input-experience-years"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Skills *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {skillOptions.map(skill => (
                      <div key={skill} className="flex items-center gap-2">
                        <Checkbox
                          checked={formData.skills.includes(skill)}
                          onCheckedChange={() => handleSkillToggle(skill)}
                          data-testid={`checkbox-skill-${skill}`}
                        />
                        <label className="text-sm text-gray-300">{skill}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Hourly Rate Expectation</label>
                  <Input
                    type="number"
                    step="0.50"
                    value={formData.hourlyRateExpectation}
                    onChange={(e) => handleInputChange('hourlyRateExpectation', e.target.value)}
                    placeholder="$/hour"
                    data-testid="input-hourly-rate"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">2-Year Work History (Most Recent First)</h3>
                    <Button
                      onClick={addWorkHistory}
                      variant="outline"
                      size="sm"
                      className="text-cyan-400 border-cyan-400"
                      data-testid="button-add-work"
                    >
                      + Add Entry
                    </Button>
                  </div>
                  
                  {formData.workHistory.map((work, idx) => (
                    <div key={work.id} className="bg-slate-700/30 p-4 rounded mb-3 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Company"
                          value={work.company}
                          onChange={(e) => updateWorkHistory(work.id, 'company', e.target.value)}
                          data-testid={`input-work-company-${idx}`}
                        />
                        <Input
                          placeholder="Position"
                          value={work.position}
                          onChange={(e) => updateWorkHistory(work.id, 'position', e.target.value)}
                          data-testid={`input-work-position-${idx}`}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          type="date"
                          placeholder="Start Date"
                          value={work.startDate}
                          onChange={(e) => updateWorkHistory(work.id, 'startDate', e.target.value)}
                          data-testid={`input-work-start-${idx}`}
                        />
                        <Input
                          type="date"
                          placeholder="End Date"
                          value={work.endDate}
                          onChange={(e) => updateWorkHistory(work.id, 'endDate', e.target.value)}
                          data-testid={`input-work-end-${idx}`}
                        />
                      </div>
                      <Input
                        placeholder="Notes (optional)"
                        value={work.notes}
                        onChange={(e) => updateWorkHistory(work.id, 'notes', e.target.value)}
                        data-testid={`input-work-notes-${idx}`}
                      />
                      <Button
                        onClick={() => removeWorkHistory(work.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-400 border-red-400 w-full"
                        data-testid={`button-remove-work-${idx}`}
                      >
                        Remove Entry
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* References */}
            {step === 'references' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Professional References (At Least 3) *</h2>
                
                {formData.references.map((ref, idx) => (
                  <div key={ref.id} className="bg-slate-700/30 p-4 rounded space-y-3">
                    <div className="font-semibold text-white mb-3">Reference #{idx + 1}</div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Name"
                        value={ref.name}
                        onChange={(e) => updateReference(ref.id, 'name', e.target.value)}
                        data-testid={`input-ref-name-${idx}`}
                      />
                      <Input
                        placeholder="Phone"
                        value={ref.phone}
                        onChange={(e) => updateReference(ref.id, 'phone', e.target.value)}
                        data-testid={`input-ref-phone-${idx}`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Relationship (Manager, Coworker, etc.)"
                        value={ref.relationship}
                        onChange={(e) => updateReference(ref.id, 'relationship', e.target.value)}
                        data-testid={`input-ref-relationship-${idx}`}
                      />
                      <Input
                        placeholder="Company"
                        value={ref.company}
                        onChange={(e) => updateReference(ref.id, 'company', e.target.value)}
                        data-testid={`input-ref-company-${idx}`}
                      />
                    </div>
                    {formData.references.length > 3 && (
                      <Button
                        onClick={() => removeReference(ref.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-400 border-red-400 w-full"
                        data-testid={`button-remove-ref-${idx}`}
                      >
                        Remove Reference
                      </Button>
                    )}
                  </div>
                ))}

                {formData.references.length < 3 && (
                  <Button
                    onClick={addReference}
                    className="w-full bg-cyan-600 hover:bg-cyan-700"
                    data-testid="button-add-reference"
                  >
                    + Add Reference ({formData.references.length}/3)
                  </Button>
                )}
                {formData.references.length >= 3 && (
                  <Button
                    onClick={addReference}
                    variant="outline"
                    className="w-full text-cyan-400 border-cyan-400"
                    data-testid="button-add-more-references"
                  >
                    + Add Another Reference
                  </Button>
                )}
              </div>
            )}

            {/* Legal & Tax */}
            {step === 'legal' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Legal & Tax Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">SSN (Last 4 will be visible) *</label>
                  <Input
                    type="password"
                    value={formData.ssn}
                    onChange={(e) => handleInputChange('ssn', e.target.value)}
                    placeholder="XXX-XX-XXXX"
                    maxLength={11}
                    data-testid="input-ssn"
                  />
                </div>

                <div className="flex items-start gap-3 bg-slate-700/30 p-4 rounded">
                  <Checkbox
                    checked={formData.backgroundCheckConsent}
                    onCheckedChange={(checked) => handleInputChange('backgroundCheckConsent', !!checked)}
                    data-testid="checkbox-background-check"
                  />
                  <label className="text-sm text-gray-300">
                    I consent to a background check as part of the hiring process *
                  </label>
                </div>
              </div>
            )}

            {/* Agreements & Disclosures */}
            {step === 'agreements' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Employment Agreements & Disclosures</h2>
                
                <div className="space-y-4">
                  <div className="border-b border-slate-600 pb-4">
                    <h3 className="font-semibold text-white mb-3">Drug Testing Policy</h3>
                    <div className="flex items-start gap-3 mb-3">
                      <Checkbox
                        checked={formData.drugTestConsent}
                        onCheckedChange={(checked) => handleInputChange('drugTestConsent', !!checked)}
                        data-testid="checkbox-drug-test"
                      />
                      <label className="text-sm text-gray-300">
                        I consent to pre-employment drug testing *
                      </label>
                    </div>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={formData.accidentDrugTestConsent}
                        onCheckedChange={(checked) => handleInputChange('accidentDrugTestConsent', !!checked)}
                        data-testid="checkbox-accident-drug"
                      />
                      <label className="text-sm text-gray-300">
                        I understand accident-related drug testing may be required and consent *
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-3">Tennessee Right-to-Work</h3>
                    <div className="bg-slate-700/30 p-3 rounded mb-3 text-sm text-gray-300">
                      Tennessee is a right-to-work state. No person may be denied employment or required to join a labor union as a condition of employment.
                    </div>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={formData.tennesseeRightToWorkAcknowledged}
                        onCheckedChange={(checked) => handleInputChange('tennesseeRightToWorkAcknowledged', !!checked)}
                        data-testid="checkbox-tennessee"
                      />
                      <label className="text-sm text-gray-300">
                        I acknowledge and understand my right-to-work protections in Tennessee *
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment & Emergency */}
            {step === 'payment' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Payment & Emergency Contact</h2>
                
                <div>
                  <h3 className="font-semibold text-white mb-4">Emergency Contact *</h3>
                  <div className="space-y-3">
                    <Input
                      placeholder="Name"
                      value={formData.emergencyContactName}
                      onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                      data-testid="input-emergency-name"
                    />
                    <Input
                      placeholder="Phone"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                      data-testid="input-emergency-phone"
                    />
                    <Input
                      placeholder="Relationship"
                      value={formData.emergencyContactRelation}
                      onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                      data-testid="input-emergency-relation"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-4">Banking Information *</h3>
                  <div className="space-y-3">
                    <Input
                      placeholder="Account Holder Name"
                      value={formData.bankAccountHolderName}
                      onChange={(e) => handleInputChange('bankAccountHolderName', e.target.value)}
                      data-testid="input-bank-name"
                    />
                    <Input
                      placeholder="Routing Number"
                      value={formData.bankRoutingNumber}
                      onChange={(e) => handleInputChange('bankRoutingNumber', e.target.value)}
                      data-testid="input-routing"
                    />
                    <Input
                      placeholder="Account Number"
                      value={formData.bankAccountNumber}
                      onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                      data-testid="input-account-number"
                    />
                    <select
                      value={formData.bankAccountType}
                      onChange={(e) => handleInputChange('bankAccountType', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                      data-testid="select-account-type"
                    >
                      <option value="checking">Checking</option>
                      <option value="savings">Savings</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Equipment */}
            {step === 'equipment' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Equipment Acknowledgment</h2>
                
                <div className="bg-slate-700/30 p-4 rounded space-y-4">
                  <h3 className="font-semibold text-white">PPE & Equipment Policy</h3>
                  <p className="text-sm text-gray-300">
                    ORBIT will provide all necessary Personal Protective Equipment (PPE) and work-related materials needed to perform your job duties, such as hard hats, reflective vests, safety glasses, and required tools.
                  </p>
                  <p className="text-sm text-gray-300 font-semibold">
                    Equipment must be returned at the end of your assignment. If equipment is not returned within 2 days of the assignment end date, the cost of the equipment will be deducted from your final paycheck.
                  </p>
                  
                  <div className="flex items-start gap-3 pt-4">
                    <Checkbox
                      checked={formData.equipmentAcknowledgmentConsent}
                      onCheckedChange={(checked) => handleInputChange('equipmentAcknowledgmentConsent', !!checked)}
                      data-testid="checkbox-equipment-ack"
                    />
                    <label className="text-sm text-gray-300">
                      I acknowledge that ORBIT will provide necessary PPE and equipment for my work *
                    </label>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={formData.equipmentReturnTermsAccepted}
                      onCheckedChange={(checked) => handleInputChange('equipmentReturnTermsAccepted', !!checked)}
                      data-testid="checkbox-equipment-terms"
                    />
                    <label className="text-sm text-gray-300">
                      I understand the 2-day equipment return policy and accept the deduction terms *
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Review */}
            {step === 'review' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Review Your Application</h2>
                <p className="text-gray-300">Please review all information before submitting. You can go back to edit any section.</p>
                
                <div className="bg-slate-700/30 p-4 rounded space-y-3 text-sm">
                  <div><strong className="text-cyan-400">Name:</strong> {formData.firstName} {formData.lastName}</div>
                  <div><strong className="text-cyan-400">Email:</strong> {formData.email}</div>
                  <div><strong className="text-cyan-400">Phone:</strong> {formData.phone} {formData.phone2 ? `/ ${formData.phone2}` : ''}</div>
                  <div><strong className="text-cyan-400">Address:</strong> {formData.addressLine1}, {formData.city}, {formData.state} {formData.zipCode}</div>
                  <div><strong className="text-cyan-400">Experience:</strong> {formData.experienceYears} years</div>
                  <div><strong className="text-cyan-400">Work History Entries:</strong> {formData.workHistory.length}</div>
                  <div><strong className="text-cyan-400">References:</strong> {formData.references.length}</div>
                  <div><strong className="text-cyan-400">Emergency Contact:</strong> {formData.emergencyContactName}</div>
                  <div className="pt-3 text-green-400">
                    ✓ All required consents and agreements accepted
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          {step !== 'info' && (
            <Button
              onClick={handleBack}
              variant="outline"
              className="text-gray-300 border-gray-600 hover:bg-slate-700"
              data-testid="button-back"
            >
              ← Back
            </Button>
          )}
          
          {step !== 'success' && step !== 'review' && (
            <Button
              onClick={handleNext}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
              data-testid="button-next"
            >
              Next →
            </Button>
          )}
          
          {step === 'review' && (
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              data-testid="button-submit"
            >
              Submit Application
            </Button>
          )}

          {step !== 'success' && (
            <Button
              onClick={handleSaveNow}
              disabled={isSaving}
              variant="outline"
              className="text-cyan-400 border-cyan-400 hover:bg-cyan-400/10"
              data-testid="button-save-progress"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Progress'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
