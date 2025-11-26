import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STEPS = [
  { id: 1, name: "Basic Info", description: "Personal details" },
  { id: 2, name: "Skills", description: "Your experience" },
  { id: 3, name: "Availability", description: "When you can work" },
  { id: 4, name: "Consent & Sign", description: "Final step" },
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
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">Application Submitted!</CardTitle>
            <CardDescription className="text-base mt-2">
              Thank you for applying to ORBIT Staffing. We'll review your application and contact you within 24 hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>✓ We'll verify your background check</li>
                <li>✓ You'll receive an SMS with your approval status</li>
                <li>✓ Once approved, download the ORBIT app to start accepting jobs</li>
              </ul>
            </div>
            {referrerId && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-900">
                  💰 Your referrer will earn $100 after you complete 40 hours of work!
                </p>
              </div>
            )}
            <Button
              data-testid="button-return-home"
              onClick={() => setLocation("/")}
              className="w-full"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">Join ORBIT Staffing</h1>
          <p className="text-center text-gray-600">Complete your application in minutes</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex-1">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep > step.id
                      ? "bg-green-500 text-white"
                      : currentStep === step.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}>
                    {currentStep > step.id ? "✓" : step.id}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      currentStep > step.id ? "bg-green-500" : "bg-gray-200"
                    }`} />
                  )}
                </div>
                <div className="mt-2 hidden sm:block">
                  <p className="text-xs font-semibold">{step.name}</p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].name}</CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Legal Name *</Label>
                  <Input
                    id="fullName"
                    data-testid="input-full-name"
                    value={formData.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    placeholder="John Smith"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      data-testid="input-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      data-testid="input-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    data-testid="input-dob"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField("dateOfBirth", e.target.value)}
                  />
                </div>

                <Separator />

                <div>
                  <Label htmlFor="streetAddress">Street Address *</Label>
                  <Input
                    id="streetAddress"
                    data-testid="input-address"
                    value={formData.streetAddress}
                    onChange={(e) => updateField("streetAddress", e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      data-testid="input-city"
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Select value={formData.state} onValueChange={(value) => updateField("state", value)}>
                      <SelectTrigger data-testid="select-state">
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
                    <Label htmlFor="zipCode">ZIP *</Label>
                    <Input
                      id="zipCode"
                      data-testid="input-zip"
                      value={formData.zipCode}
                      onChange={(e) => updateField("zipCode", e.target.value)}
                      placeholder="12345"
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ssn">Social Security Number *</Label>
                    <Input
                      id="ssn"
                      data-testid="input-ssn"
                      type="password"
                      value={formData.ssnEncrypted}
                      onChange={(e) => updateField("ssnEncrypted", e.target.value)}
                      placeholder="###-##-####"
                    />
                  </div>
                  <div>
                    <Label htmlFor="driversLicense">Driver's License # *</Label>
                    <Input
                      id="driversLicense"
                      data-testid="input-license"
                      value={formData.driversLicense}
                      onChange={(e) => updateField("driversLicense", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="driversLicenseState">License State *</Label>
                  <Select value={formData.driversLicenseState} onValueChange={(value) => updateField("driversLicenseState", value)}>
                    <SelectTrigger data-testid="select-license-state">
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <h3 className="font-semibold">Emergency Contact</h3>

                <div>
                  <Label htmlFor="emergencyContactName">Contact Name *</Label>
                  <Input
                    id="emergencyContactName"
                    data-testid="input-emergency-name"
                    value={formData.emergencyContactName}
                    onChange={(e) => updateField("emergencyContactName", e.target.value)}
                    placeholder="Jane Smith"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContactPhone">Contact Phone *</Label>
                    <Input
                      id="emergencyContactPhone"
                      data-testid="input-emergency-phone"
                      type="tel"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => updateField("emergencyContactPhone", e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactRelationship">Relationship *</Label>
                    <Input
                      id="emergencyContactRelationship"
                      data-testid="input-emergency-relationship"
                      value={formData.emergencyContactRelationship}
                      onChange={(e) => updateField("emergencyContactRelationship", e.target.value)}
                      placeholder="Spouse, Parent, etc."
                    />
                  </div>
                </div>

                {!referrerId && (
                  <>
                    <Separator />
                    <div>
                      <Label htmlFor="referrerPhone">Referred by a current ORBIT worker? (Optional)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="referrerPhone"
                          data-testid="input-referrer-phone"
                          type="tel"
                          value={formData.referrerPhone}
                          onChange={(e) => updateField("referrerPhone", e.target.value)}
                          placeholder="Referrer's phone number"
                        />
                        <Button
                          data-testid="button-verify-referrer"
                          type="button"
                          onClick={verifyReferrer}
                          disabled={!formData.referrerPhone || verifyingReferrer}
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
                  <Label>Select Your Skills *</Label>
                  <div className="space-y-2 mt-2">
                    {COMMON_SKILLS.map(skill => (
                      <div key={skill.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={skill.id}
                          data-testid={`checkbox-skill-${skill.id}`}
                          checked={formData.skills.includes(skill.id)}
                          onCheckedChange={() => toggleSkill(skill.id)}
                        />
                        <Label htmlFor={skill.id} className="cursor-pointer">{skill.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="otherSkills">Other Skills or Certifications</Label>
                  <Input
                    id="otherSkills"
                    data-testid="input-other-skills"
                    value={formData.otherSkills}
                    onChange={(e) => updateField("otherSkills", e.target.value)}
                    placeholder="List any additional skills..."
                  />
                </div>

                {hasSelectedSkilledTrade() && (
                  <>
                    <Separator />
                    <h3 className="font-semibold text-orange-700">Skilled Trade Information Required</h3>

                    <div>
                      <Label htmlFor="yearsExperience">Years of Experience</Label>
                      <Select value={formData.yearsExperience} onValueChange={(value) => updateField("yearsExperience", value)}>
                        <SelectTrigger data-testid="select-years-experience">
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
                      <Label htmlFor="licenseNumber">License Number</Label>
                      <Input
                        id="licenseNumber"
                        data-testid="input-license-number"
                        value={formData.licenseNumber}
                        onChange={(e) => updateField("licenseNumber", e.target.value)}
                        placeholder="License or certification number"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="licenseIssuingState">Issuing State</Label>
                        <Select value={formData.licenseIssuingState} onValueChange={(value) => updateField("licenseIssuingState", value)}>
                          <SelectTrigger data-testid="select-license-issuing-state">
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
                        <Label htmlFor="licenseExpirationDate">Expiration Date</Label>
                        <Input
                          id="licenseExpirationDate"
                          data-testid="input-license-expiration"
                          type="date"
                          value={formData.licenseExpirationDate}
                          onChange={(e) => updateField("licenseExpirationDate", e.target.value)}
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
                  <Label htmlFor="availableToStart">When can you start? *</Label>
                  <Select value={formData.availableToStart} onValueChange={(value) => updateField("availableToStart", value)}>
                    <SelectTrigger data-testid="select-start-date">
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
                  <Label htmlFor="preferredShift">Preferred Shift *</Label>
                  <Select value={formData.preferredShift} onValueChange={(value) => updateField("preferredShift", value)}>
                    <SelectTrigger data-testid="select-shift">
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
                  <Label>Days Available *</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {DAYS_OF_WEEK.map(day => (
                      <Button
                        key={day.id}
                        data-testid={`button-day-${day.id}`}
                        type="button"
                        variant={formData.daysAvailable.includes(day.id) ? "default" : "outline"}
                        onClick={() => toggleDay(day.id)}
                        className="flex-1 min-w-[60px]"
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
                  />
                  <Label htmlFor="willingToWorkWeekends" className="cursor-pointer">
                    I'm willing to work weekends
                  </Label>
                </div>

                <div>
                  <Label htmlFor="transportation">Transportation *</Label>
                  <Select value={formData.transportation} onValueChange={(value) => updateField("transportation", value)}>
                    <SelectTrigger data-testid="select-transportation">
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
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Background Check Required</h3>
                  <p className="text-sm text-blue-800">
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
                    />
                    <Label htmlFor="backgroundCheckConsent" className="cursor-pointer text-sm leading-relaxed">
                      I authorize ORBIT to conduct a criminal background check
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="mvrCheckConsent"
                      data-testid="checkbox-mvr-check"
                      checked={formData.mvrCheckConsent}
                      onCheckedChange={(checked) => updateField("mvrCheckConsent", checked)}
                    />
                    <Label htmlFor="mvrCheckConsent" className="cursor-pointer text-sm leading-relaxed">
                      I authorize ORBIT to conduct a motor vehicle record check
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="certificationAccuracyConsent"
                      data-testid="checkbox-accuracy"
                      checked={formData.certificationAccuracyConsent}
                      onCheckedChange={(checked) => updateField("certificationAccuracyConsent", checked)}
                    />
                    <Label htmlFor="certificationAccuracyConsent" className="cursor-pointer text-sm leading-relaxed">
                      I certify that all information provided in this application is true and accurate
                    </Label>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="signatureName">Electronic Signature *</Label>
                  <Input
                    id="signatureName"
                    data-testid="input-signature"
                    value={formData.signatureName}
                    onChange={(e) => updateField("signatureName", e.target.value)}
                    placeholder="Type your full legal name"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    By typing your name, you are electronically signing this application.
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded text-xs text-gray-600">
                  <p>Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-between gap-4">
          <Button
            data-testid="button-back"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
            className="flex-1"
          >
            Back
          </Button>

          {currentStep < 4 ? (
            <Button
              data-testid="button-next"
              onClick={handleNext}
              disabled={!canProceedToNextStep()}
              className="flex-1"
            >
              Next Step
            </Button>
          ) : (
            <Button
              data-testid="button-submit"
              onClick={handleSubmit}
              disabled={!canProceedToNextStep() || isSubmitting}
              className="flex-1 bg-green-600 hover:bg-green-700"
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
