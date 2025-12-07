import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Loader2, User, Briefcase, Clock, FileCheck, Phone, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/section-header";
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardDescription, OrbitCardContent } from "@/components/ui/orbit-card";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";

const STEPS = [
  { id: 1, name: "Basic Info", description: "Personal details", icon: User },
  { id: 2, name: "Skills", description: "Your experience", icon: Briefcase },
  { id: 3, name: "Availability", description: "When you can work", icon: Clock },
  { id: 4, name: "Consent & Sign", description: "Final step", icon: FileCheck },
];

const COMMON_SKILLS = [
  { id: "general_labor", label: "General Labor (no experience required)" },
  { id: "construction", label: "Construction (framing, concrete, demolition)" },
  { id: "hospitality", label: "Hospitality (kitchen, cleaning, event staff)" },
  { id: "warehouse", label: "Warehouse (forklift certified, packing, shipping)" },
  { id: "landscaping", label: "Landscaping (mowing, trimming, planting)" },
  { id: "electrician", label: "Electrician (licensed)", skilled: true },
  { id: "plumber", label: "Plumber (licensed)", skilled: true },
  { id: "hvac", label: "HVAC (licensed)", skilled: true },
];

const DAYS_OF_WEEK = [
  { id: "monday", label: "Mon" },
  { id: "tuesday", label: "Tue" },
  { id: "wednesday", label: "Wed" },
  { id: "thursday", label: "Thu" },
  { id: "friday", label: "Fri" },
  { id: "saturday", label: "Sat" },
  { id: "sunday", label: "Sun" },
];

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export default function WorkerApplication() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [referrerId, setReferrerId] = useState<string | null>(null);
  const [verifyingReferrer, setVerifyingReferrer] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    ssnEncrypted: "",
    driversLicense: "",
    driversLicenseState: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    
    skills: [] as string[],
    otherSkills: "",
    yearsExperience: "",
    licenseNumber: "",
    licenseIssuingState: "",
    licenseExpirationDate: "",
    
    availableToStart: "",
    preferredShift: "",
    daysAvailable: [] as string[],
    willingToWorkWeekends: false,
    transportation: "",
    
    backgroundCheckConsent: false,
    mvrCheckConsent: false,
    certificationAccuracyConsent: false,
    signatureName: "",
    
    referrerPhone: "",
    tenantId: "default-tenant",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get("ref");
    if (refParam) {
      setReferrerId(refParam);
    }
  }, []);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSkill = (skillId: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter(s => s !== skillId)
        : [...prev.skills, skillId]
    }));
  };

  const toggleDay = (dayId: string) => {
    setFormData(prev => ({
      ...prev,
      daysAvailable: prev.daysAvailable.includes(dayId)
        ? prev.daysAvailable.filter(d => d !== dayId)
        : [...prev.daysAvailable, dayId]
    }));
  };

  const verifyReferrer = async () => {
    if (!formData.referrerPhone) return;
    
    setVerifyingReferrer(true);
    try {
      const response = await fetch(`/api/workers/apply/verify-referrer?phone=${encodeURIComponent(formData.referrerPhone)}`);
      const data = await response.json();
      
      if (data.valid) {
        setReferrerId(data.referrerId);
        toast({
          title: "Referrer Verified",
          description: `${data.referrerName} will receive a bonus when you complete 40 hours!`,
        });
      } else {
        toast({
          title: "Referrer Not Valid",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Could not verify referrer. You can continue without a referral.",
        variant: "destructive",
      });
    } finally {
      setVerifyingReferrer(false);
    }
  };

  const isStep1Valid = () => {
    return formData.fullName && formData.phone && formData.email && 
           formData.dateOfBirth && formData.streetAddress && formData.city && 
           formData.state && formData.zipCode && formData.ssnEncrypted && 
           formData.driversLicense && formData.driversLicenseState &&
           formData.emergencyContactName && formData.emergencyContactPhone &&
           formData.emergencyContactRelationship;
  };

  const isStep2Valid = () => {
    return formData.skills.length > 0;
  };

  const isStep3Valid = () => {
    return formData.availableToStart && formData.preferredShift && 
           formData.daysAvailable.length > 0 && formData.transportation;
  };

  const isStep4Valid = () => {
    return formData.backgroundCheckConsent && formData.mvrCheckConsent && 
           formData.certificationAccuracyConsent && formData.signatureName;
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: return isStep1Valid();
      case 2: return isStep2Valid();
      case 3: return isStep3Valid();
      case 4: return isStep4Valid();
      default: return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNextStep() && currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    if (!isStep4Valid()) return;

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        skills: formData.skills,
        daysAvailable: formData.daysAvailable,
        willingToWorkWeekends: formData.willingToWorkWeekends,
        backgroundCheckConsentDate: new Date().toISOString(),
        mvrCheckConsentDate: new Date().toISOString(),
        certificationAccuracyConsentDate: new Date().toISOString(),
        referredBy: referrerId || undefined,
      };

      const response = await fetch("/api/workers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Application submission failed");
      }

      const result = await response.json();
      setIsSuccess(true);
      toast({
        title: "Application Submitted!",
        description: result.message,
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasSelectedSkilledTrade = () => {
    return formData.skills.some(skill => 
      COMMON_SKILLS.find(s => s.id === skill)?.skilled
    );
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <OrbitCard variant="glass" className="max-w-md w-full">
          <OrbitCardHeader className="text-center flex-col items-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <OrbitCardTitle className="text-2xl text-emerald-400">Application Submitted!</OrbitCardTitle>
            <OrbitCardDescription className="text-base mt-2 text-slate-300">
              Thank you for applying to ORBIT Staffing. We'll review your application and contact you within 24 hours.
            </OrbitCardDescription>
          </OrbitCardHeader>
          <OrbitCardContent className="space-y-4">
            <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-lg">
              <h3 className="font-semibold text-cyan-300 mb-2">What's Next?</h3>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>✓ We'll verify your background check</li>
                <li>✓ You'll receive an SMS with your approval status</li>
                <li>✓ Once approved, download the ORBIT app to start accepting jobs</li>
              </ul>
            </div>
            {referrerId && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
                <p className="text-sm text-amber-300">
                  💰 Your referrer will earn $100 after you complete 40 hours of work!
                </p>
              </div>
            )}
            <Button
              data-testid="button-return-home"
              onClick={() => setLocation("/")}
              className="w-full bg-cyan-600 hover:bg-cyan-700"
            >
              Return to Home
            </Button>
          </OrbitCardContent>
        </OrbitCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <PageHeader 
          title="Join ORBIT Staffing"
          subtitle="Complete your application in minutes"
        />

        <div className="mb-8">
          <BentoGrid cols={4} gap="sm">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isComplete = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              return (
                <BentoTile 
                  key={step.id} 
                  className={`p-3 ${
                    isComplete 
                      ? "bg-emerald-500/20 border-emerald-500/40" 
                      : isCurrent 
                      ? "bg-cyan-500/20 border-cyan-500/40" 
                      : "bg-slate-800/50"
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold mb-2 ${
                      isComplete
                        ? "bg-emerald-500 text-white"
                        : isCurrent
                        ? "bg-cyan-500 text-white"
                        : "bg-slate-700 text-slate-400"
                    }`}>
                      {isComplete ? "✓" : <Icon className="w-5 h-5" />}
                    </div>
                    <p className={`text-xs font-semibold ${isCurrent ? "text-cyan-300" : isComplete ? "text-emerald-300" : "text-slate-400"}`}>
                      {step.name}
                    </p>
                    <p className="text-xs text-slate-500 hidden sm:block">{step.description}</p>
                  </div>
                </BentoTile>
              );
            })}
          </BentoGrid>
        </div>

        <OrbitCard variant="default">
          <OrbitCardHeader 
            icon={
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                {(() => {
                  const Icon = STEPS[currentStep - 1].icon;
                  return <Icon className="w-5 h-5 text-cyan-400" />;
                })()}
              </div>
            }
          >
            <OrbitCardTitle>{STEPS[currentStep - 1].name}</OrbitCardTitle>
            <OrbitCardDescription>{STEPS[currentStep - 1].description}</OrbitCardDescription>
          </OrbitCardHeader>
          <OrbitCardContent>
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-slate-300">Full Legal Name *</Label>
                  <Input
                    id="fullName"
                    data-testid="input-full-name"
                    value={formData.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    placeholder="John Smith"
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-slate-300">Phone Number *</Label>
                    <Input
                      id="phone"
                      data-testid="input-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="(555) 123-4567"
                      className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-slate-300">Email Address *</Label>
                    <Input
                      id="email"
                      data-testid="input-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="john@example.com"
                      className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="dateOfBirth" className="text-slate-300">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    data-testid="input-dob"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField("dateOfBirth", e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white"
                  />
                </div>

                <Separator className="bg-slate-700" />

                <div>
                  <Label htmlFor="streetAddress" className="text-slate-300">Street Address *</Label>
                  <Input
                    id="streetAddress"
                    data-testid="input-address"
                    value={formData.streetAddress}
                    onChange={(e) => updateField("streetAddress", e.target.value)}
                    placeholder="123 Main Street"
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <Label htmlFor="city" className="text-slate-300">City *</Label>
                    <Input
                      id="city"
                      data-testid="input-city"
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      className="bg-slate-800/50 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-slate-300">State *</Label>
                    <Select value={formData.state} onValueChange={(value) => updateField("state", value)}>
                      <SelectTrigger data-testid="select-state" className="bg-slate-800/50 border-slate-600 text-white">
                        <SelectValue placeholder="State" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="zipCode" className="text-slate-300">ZIP *</Label>
                    <Input
                      id="zipCode"
                      data-testid="input-zip"
                      value={formData.zipCode}
                      onChange={(e) => updateField("zipCode", e.target.value)}
                      placeholder="12345"
                      className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ssn" className="text-slate-300">Social Security Number *</Label>
                    <Input
                      id="ssn"
                      data-testid="input-ssn"
                      type="password"
                      value={formData.ssnEncrypted}
                      onChange={(e) => updateField("ssnEncrypted", e.target.value)}
                      placeholder="###-##-####"
                      className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="driversLicense" className="text-slate-300">Driver's License # *</Label>
                    <Input
                      id="driversLicense"
                      data-testid="input-license"
                      value={formData.driversLicense}
                      onChange={(e) => updateField("driversLicense", e.target.value)}
                      className="bg-slate-800/50 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="driversLicenseState" className="text-slate-300">License State *</Label>
                  <Select value={formData.driversLicenseState} onValueChange={(value) => updateField("driversLicenseState", value)}>
                    <SelectTrigger data-testid="select-license-state" className="bg-slate-800/50 border-slate-600 text-white">
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="bg-slate-700" />

                <h3 className="font-semibold text-cyan-300 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Emergency Contact
                </h3>

                <div>
                  <Label htmlFor="emergencyContactName" className="text-slate-300">Contact Name *</Label>
                  <Input
                    id="emergencyContactName"
                    data-testid="input-emergency-name"
                    value={formData.emergencyContactName}
                    onChange={(e) => updateField("emergencyContactName", e.target.value)}
                    placeholder="Jane Smith"
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContactPhone" className="text-slate-300">Contact Phone *</Label>
                    <Input
                      id="emergencyContactPhone"
                      data-testid="input-emergency-phone"
                      type="tel"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => updateField("emergencyContactPhone", e.target.value)}
                      placeholder="(555) 123-4567"
                      className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactRelationship" className="text-slate-300">Relationship *</Label>
                    <Input
                      id="emergencyContactRelationship"
                      data-testid="input-emergency-relationship"
                      value={formData.emergencyContactRelationship}
                      onChange={(e) => updateField("emergencyContactRelationship", e.target.value)}
                      placeholder="Spouse, Parent, etc."
                      className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {!referrerId && (
                  <>
                    <Separator className="bg-slate-700" />
                    <div>
                      <Label htmlFor="referrerPhone" className="text-slate-300">Referred by a current ORBIT worker? (Optional)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="referrerPhone"
                          data-testid="input-referrer-phone"
                          type="tel"
                          value={formData.referrerPhone}
                          onChange={(e) => updateField("referrerPhone", e.target.value)}
                          placeholder="Referrer's phone number"
                          className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                        />
                        <Button
                          data-testid="button-verify-referrer"
                          type="button"
                          onClick={verifyReferrer}
                          disabled={!formData.referrerPhone || verifyingReferrer}
                          className="bg-cyan-600 hover:bg-cyan-700"
                        >
                          {verifyingReferrer ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Select Your Skills *</Label>
                  <div className="space-y-2 mt-2">
                    {COMMON_SKILLS.map(skill => (
                      <div key={skill.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={skill.id}
                          data-testid={`checkbox-skill-${skill.id}`}
                          checked={formData.skills.includes(skill.id)}
                          onCheckedChange={() => toggleSkill(skill.id)}
                          className="border-slate-600 data-[state=checked]:bg-cyan-500"
                        />
                        <Label htmlFor={skill.id} className="cursor-pointer text-slate-300">{skill.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="otherSkills" className="text-slate-300">Other Skills or Certifications</Label>
                  <Input
                    id="otherSkills"
                    data-testid="input-other-skills"
                    value={formData.otherSkills}
                    onChange={(e) => updateField("otherSkills", e.target.value)}
                    placeholder="List any additional skills..."
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>

                {hasSelectedSkilledTrade() && (
                  <>
                    <Separator className="bg-slate-700" />
                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
                      <h3 className="font-semibold text-amber-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Skilled Trade Information Required
                      </h3>
                    </div>

                    <div>
                      <Label htmlFor="yearsExperience" className="text-slate-300">Years of Experience</Label>
                      <Select value={formData.yearsExperience} onValueChange={(value) => updateField("yearsExperience", value)}>
                        <SelectTrigger data-testid="select-years-experience" className="bg-slate-800/50 border-slate-600 text-white">
                          <SelectValue placeholder="Select years" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="less_than_1">Less than 1 year</SelectItem>
                          <SelectItem value="1_to_3">1-3 years</SelectItem>
                          <SelectItem value="3_to_5">3-5 years</SelectItem>
                          <SelectItem value="5_to_10">5-10 years</SelectItem>
                          <SelectItem value="10_plus">10+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="licenseNumber" className="text-slate-300">License Number</Label>
                      <Input
                        id="licenseNumber"
                        data-testid="input-license-number"
                        value={formData.licenseNumber}
                        onChange={(e) => updateField("licenseNumber", e.target.value)}
                        placeholder="License or certification number"
                        className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="licenseIssuingState" className="text-slate-300">Issuing State</Label>
                        <Select value={formData.licenseIssuingState} onValueChange={(value) => updateField("licenseIssuingState", value)}>
                          <SelectTrigger data-testid="select-license-issuing-state" className="bg-slate-800/50 border-slate-600 text-white">
                            <SelectValue placeholder="State" />
                          </SelectTrigger>
                          <SelectContent>
                            {US_STATES.map(state => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="licenseExpirationDate" className="text-slate-300">Expiration Date</Label>
                        <Input
                          id="licenseExpirationDate"
                          data-testid="input-license-expiration"
                          type="date"
                          value={formData.licenseExpirationDate}
                          onChange={(e) => updateField("licenseExpirationDate", e.target.value)}
                          className="bg-slate-800/50 border-slate-600 text-white"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="availableToStart" className="text-slate-300">When can you start? *</Label>
                  <Select value={formData.availableToStart} onValueChange={(value) => updateField("availableToStart", value)}>
                    <SelectTrigger data-testid="select-start-date" className="bg-slate-800/50 border-slate-600 text-white">
                      <SelectValue placeholder="Select start date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediately">Immediately</SelectItem>
                      <SelectItem value="1_week">1 week</SelectItem>
                      <SelectItem value="2_weeks">2 weeks</SelectItem>
                      <SelectItem value="1_month">1 month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="preferredShift" className="text-slate-300">Preferred Shift *</Label>
                  <Select value={formData.preferredShift} onValueChange={(value) => updateField("preferredShift", value)}>
                    <SelectTrigger data-testid="select-shift" className="bg-slate-800/50 border-slate-600 text-white">
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (6am-2pm)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (2pm-10pm)</SelectItem>
                      <SelectItem value="night">Night (10pm-6am)</SelectItem>
                      <SelectItem value="any">Any shift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-300">Days Available *</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {DAYS_OF_WEEK.map(day => (
                      <Button
                        key={day.id}
                        data-testid={`button-day-${day.id}`}
                        type="button"
                        variant={formData.daysAvailable.includes(day.id) ? "default" : "outline"}
                        onClick={() => toggleDay(day.id)}
                        className={`flex-1 min-w-[60px] ${
                          formData.daysAvailable.includes(day.id) 
                            ? "bg-cyan-600 hover:bg-cyan-700" 
                            : "border-slate-600 text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        {day.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="willingToWorkWeekends"
                    data-testid="checkbox-weekends"
                    checked={formData.willingToWorkWeekends}
                    onCheckedChange={(checked) => updateField("willingToWorkWeekends", checked)}
                    className="border-slate-600 data-[state=checked]:bg-cyan-500"
                  />
                  <Label htmlFor="willingToWorkWeekends" className="cursor-pointer text-slate-300">
                    I'm willing to work weekends
                  </Label>
                </div>

                <div>
                  <Label htmlFor="transportation" className="text-slate-300">Transportation *</Label>
                  <Select value={formData.transportation} onValueChange={(value) => updateField("transportation", value)}>
                    <SelectTrigger data-testid="select-transportation" className="bg-slate-800/50 border-slate-600 text-white">
                      <SelectValue placeholder="How do you get to work?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="own_vehicle">I have my own vehicle</SelectItem>
                      <SelectItem value="public_transit">Public transportation</SelectItem>
                      <SelectItem value="need_ride">I need a ride</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-cyan-300 mb-2">Background Check Required</h3>
                  <p className="text-sm text-slate-300">
                    ORBIT requires background checks for all workers to ensure safety and compliance.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="backgroundCheckConsent"
                      data-testid="checkbox-background-check"
                      checked={formData.backgroundCheckConsent}
                      onCheckedChange={(checked) => updateField("backgroundCheckConsent", checked)}
                      className="border-slate-600 data-[state=checked]:bg-cyan-500 mt-0.5"
                    />
                    <Label htmlFor="backgroundCheckConsent" className="cursor-pointer text-sm leading-relaxed text-slate-300">
                      I authorize ORBIT to conduct a criminal background check
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="mvrCheckConsent"
                      data-testid="checkbox-mvr-check"
                      checked={formData.mvrCheckConsent}
                      onCheckedChange={(checked) => updateField("mvrCheckConsent", checked)}
                      className="border-slate-600 data-[state=checked]:bg-cyan-500 mt-0.5"
                    />
                    <Label htmlFor="mvrCheckConsent" className="cursor-pointer text-sm leading-relaxed text-slate-300">
                      I authorize ORBIT to conduct a motor vehicle record check
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="certificationAccuracyConsent"
                      data-testid="checkbox-accuracy"
                      checked={formData.certificationAccuracyConsent}
                      onCheckedChange={(checked) => updateField("certificationAccuracyConsent", checked)}
                      className="border-slate-600 data-[state=checked]:bg-cyan-500 mt-0.5"
                    />
                    <Label htmlFor="certificationAccuracyConsent" className="cursor-pointer text-sm leading-relaxed text-slate-300">
                      I certify that all information provided in this application is true and accurate
                    </Label>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <div>
                  <Label htmlFor="signatureName" className="text-slate-300">Electronic Signature *</Label>
                  <Input
                    id="signatureName"
                    data-testid="input-signature"
                    value={formData.signatureName}
                    onChange={(e) => updateField("signatureName", e.target.value)}
                    placeholder="Type your full legal name"
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    By typing your name, you are electronically signing this application.
                  </p>
                </div>

                <div className="bg-slate-800/50 p-3 rounded text-xs text-slate-400">
                  <p>Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </OrbitCardContent>
        </OrbitCard>

        <div className="mt-6 flex justify-between gap-4">
          <Button
            data-testid="button-back"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Back
          </Button>

          {currentStep < 4 ? (
            <Button
              data-testid="button-next"
              onClick={handleNext}
              disabled={!canProceedToNextStep()}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700"
            >
              Next Step
            </Button>
          ) : (
            <Button
              data-testid="button-submit"
              onClick={handleSubmit}
              disabled={!canProceedToNextStep() || isSubmitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application - Get Started!"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
