import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  Building2,
  Calendar,
  CreditCard,
  Users,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  MapPin,
  FileText,
  AlertCircle,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  Sparkles,
  Lock
} from "lucide-react";

const STEPS = [
  { id: 1, name: "Company Info", icon: Building2, description: "Business details & address" },
  { id: 2, name: "Pay Schedule", icon: Calendar, description: "How often you pay workers" },
  { id: 3, name: "Tax Setup", icon: FileText, description: "Tax deposit & filing settings" },
  { id: 4, name: "Bank Account", icon: CreditCard, description: "Funding account for payroll" },
  { id: 5, name: "Add Workers", icon: Users, description: "Import or add your team" },
];

const US_STATES = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" }, { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" }, { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" }, { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" }
];

export default function PayrollSetupWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    companyName: "",
    ein: "",
    legalEntityType: "llc",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    payFrequency: "weekly",
    firstPayDate: "",
    payDayOfWeek: "friday",
    taxDepositSchedule: "semiweekly",
    suta: true,
    bankConnected: false,
    workerImportMethod: "manual",
  });

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsComplete(true);
    toast({
      title: "Payroll Setup Complete!",
      description: "Your payroll is configured and ready to run. Let's process your first payroll!",
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyName">Legal Business Name</Label>
                <Input
                  id="companyName"
                  placeholder="Acme Staffing LLC"
                  value={formData.companyName}
                  onChange={(e) => updateFormData("companyName", e.target.value)}
                  data-testid="input-company-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ein">EIN (Employer Identification Number)</Label>
                <Input
                  id="ein"
                  placeholder="XX-XXXXXXX"
                  value={formData.ein}
                  onChange={(e) => updateFormData("ein", e.target.value)}
                  data-testid="input-ein"
                />
                <p className="text-xs text-slate-400">Found on IRS Letter 147C</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="entityType">Entity Type</Label>
                <Select value={formData.legalEntityType} onValueChange={(v) => updateFormData("legalEntityType", v)}>
                  <SelectTrigger id="entityType" data-testid="select-entity-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="llc">LLC</SelectItem>
                    <SelectItem value="scorp">S-Corp</SelectItem>
                    <SelectItem value="ccorp">C-Corp</SelectItem>
                    <SelectItem value="sole_prop">Sole Proprietorship</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                Business Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="streetAddress">Street Address</Label>
                  <Input
                    id="streetAddress"
                    placeholder="123 Main Street, Suite 100"
                    value={formData.streetAddress}
                    onChange={(e) => updateFormData("streetAddress", e.target.value)}
                    data-testid="input-street-address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Nashville"
                    value={formData.city}
                    onChange={(e) => updateFormData("city", e.target.value)}
                    data-testid="input-city"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select value={formData.state} onValueChange={(v) => updateFormData("state", v)}>
                      <SelectTrigger id="state" data-testid="select-state">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map(s => (
                          <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      placeholder="37201"
                      value={formData.zipCode}
                      onChange={(e) => updateFormData("zipCode", e.target.value)}
                      data-testid="input-zip"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">How often do you pay your workers?</h3>
              <RadioGroup
                value={formData.payFrequency}
                onValueChange={(v) => updateFormData("payFrequency", v)}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {[
                  { value: "weekly", label: "Weekly", desc: "Every 7 days (52 pay periods/year)" },
                  { value: "biweekly", label: "Bi-Weekly", desc: "Every 14 days (26 pay periods/year)" },
                  { value: "semimonthly", label: "Semi-Monthly", desc: "Twice a month (24 pay periods/year)" },
                  { value: "monthly", label: "Monthly", desc: "Once a month (12 pay periods/year)" },
                ].map(option => (
                  <label
                    key={option.value}
                    className={`relative flex cursor-pointer rounded-lg border p-4 transition-all ${
                      formData.payFrequency === option.value
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                    data-testid={`radio-frequency-${option.value}`}
                  >
                    <RadioGroupItem value={option.value} className="sr-only" />
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                        formData.payFrequency === option.value
                          ? 'border-cyan-500 bg-cyan-500'
                          : 'border-slate-500'
                      }`}>
                        {formData.payFrequency === option.value && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-xs text-slate-400">{option.desc}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstPayDate">First Pay Date</Label>
                <Input
                  id="firstPayDate"
                  type="date"
                  value={formData.firstPayDate}
                  onChange={(e) => updateFormData("firstPayDate", e.target.value)}
                  data-testid="input-first-pay-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payDayOfWeek">Regular Pay Day</Label>
                <Select value={formData.payDayOfWeek} onValueChange={(v) => updateFormData("payDayOfWeek", v)}>
                  <SelectTrigger id="payDayOfWeek" data-testid="select-pay-day">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-cyan-900/20 border border-cyan-500/30">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-cyan-300">Pro Tip</p>
                  <p className="text-xs text-cyan-200/70">
                    Most staffing agencies choose weekly pay to stay competitive and attract more workers. 
                    ORBIT automates the entire process so there's no extra work for you!
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Federal Tax Deposit Schedule</h3>
              <RadioGroup
                value={formData.taxDepositSchedule}
                onValueChange={(v) => updateFormData("taxDepositSchedule", v)}
                className="space-y-3"
              >
                {[
                  { value: "monthly", label: "Monthly Depositor", desc: "Tax liability <$50,000 in lookback period. Deposits due 15th of following month." },
                  { value: "semiweekly", label: "Semi-Weekly Depositor", desc: "Tax liability ≥$50,000 in lookback period. Deposits due Wed/Fri based on pay date." },
                ].map(option => (
                  <label
                    key={option.value}
                    className={`relative flex cursor-pointer rounded-lg border p-4 transition-all ${
                      formData.taxDepositSchedule === option.value
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                    data-testid={`radio-tax-${option.value}`}
                  >
                    <RadioGroupItem value={option.value} className="sr-only" />
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                        formData.taxDepositSchedule === option.value
                          ? 'border-cyan-500 bg-cyan-500'
                          : 'border-slate-500'
                      }`}>
                        {formData.taxDepositSchedule === option.value && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-xs text-slate-400">{option.desc}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-400" />
                State Unemployment Tax (SUTA)
              </h3>
              <div className="flex items-center space-x-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <Checkbox
                  id="suta"
                  checked={formData.suta}
                  onCheckedChange={(checked) => updateFormData("suta", !!checked)}
                  data-testid="checkbox-suta"
                />
                <div>
                  <label htmlFor="suta" className="font-medium cursor-pointer">
                    Enable automatic SUTA calculations
                  </label>
                  <p className="text-xs text-slate-400">ORBIT will calculate state unemployment taxes based on your state's current rates</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
                <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <p className="text-xs font-medium">941 Quarterly Filing</p>
                <p className="text-xs text-slate-400">Automatic</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
                <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <p className="text-xs font-medium">W-2 Generation</p>
                <p className="text-xs text-slate-400">Year-end</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
                <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <p className="text-xs font-medium">State Filings</p>
                <p className="text-xs text-slate-400">50 states supported</p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-cyan-500/10 flex items-center justify-center">
                <CreditCard className="w-10 h-10 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Connect Your Bank Account</h3>
              <p className="text-slate-400 max-w-md mx-auto mb-6">
                Securely link your business bank account to fund payroll. We use bank-level encryption to protect your data.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto mb-6">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 text-left">
                  <Zap className="w-5 h-5 text-yellow-400 mb-2" />
                  <p className="text-sm font-medium">Instant Verification</p>
                  <p className="text-xs text-slate-400">Via Plaid (Coming Soon)</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 text-left">
                  <Shield className="w-5 h-5 text-green-400 mb-2" />
                  <p className="text-sm font-medium">256-bit Encryption</p>
                  <p className="text-xs text-slate-400">Bank-level security</p>
                </div>
              </div>

              <Button 
                disabled 
                className="bg-cyan-600/50 cursor-not-allowed mb-4"
                data-testid="button-connect-bank-wizard"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Connect with Plaid (Coming Soon)
              </Button>

              <p className="text-xs text-slate-500">
                For now, we'll use manual bank entry. Plaid integration coming Q1 2025.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-amber-900/20 border border-amber-500/30">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-300">Manual Entry Available</p>
                  <p className="text-xs text-amber-200/70">
                    You can skip this step and add bank details later through your admin settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">How would you like to add workers?</h3>
              <RadioGroup
                value={formData.workerImportMethod}
                onValueChange={(v) => updateFormData("workerImportMethod", v)}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {[
                  { value: "manual", label: "Add Manually", desc: "Enter workers one by one", icon: Users },
                  { value: "csv", label: "Import CSV", desc: "Upload from spreadsheet", icon: FileText },
                  { value: "skip", label: "Skip for Now", desc: "Add workers later", icon: Clock },
                ].map(option => (
                  <label
                    key={option.value}
                    className={`relative flex flex-col cursor-pointer rounded-lg border p-4 transition-all text-center ${
                      formData.workerImportMethod === option.value
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                    data-testid={`radio-import-${option.value}`}
                  >
                    <RadioGroupItem value={option.value} className="sr-only" />
                    <option.icon className={`w-8 h-8 mx-auto mb-2 ${
                      formData.workerImportMethod === option.value ? 'text-cyan-400' : 'text-slate-400'
                    }`} />
                    <p className="font-medium">{option.label}</p>
                    <p className="text-xs text-slate-400">{option.desc}</p>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="font-medium">Required Worker Info</span>
                </div>
                <ul className="space-y-1 text-sm text-slate-400">
                  <li>• Full legal name</li>
                  <li>• Social Security Number</li>
                  <li>• Date of birth</li>
                  <li>• Address</li>
                  <li>• Pay rate</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span className="font-medium">Auto-Collected via App</span>
                </div>
                <ul className="space-y-1 text-sm text-slate-400">
                  <li>• W-4 tax withholding</li>
                  <li>• I-9 employment verification</li>
                  <li>• Direct deposit info</li>
                  <li>• Emergency contacts</li>
                  <li>• Profile photo</li>
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-green-900/20 border border-green-500/30">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-300">SSN Protection</p>
                  <p className="text-xs text-green-200/70">
                    All Social Security Numbers are encrypted with AES-256 and never stored in plain text.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isComplete) {
    return (
      <Shell>
        <div className="max-w-2xl mx-auto py-12">
          <Card className="bg-gradient-to-br from-slate-800/50 to-green-900/20 border-green-500/30">
            <CardContent className="pt-12 pb-8 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              </div>
              <h1 className="text-3xl font-bold mb-3" data-testid="text-setup-complete">Payroll Setup Complete!</h1>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                Your payroll is configured and ready to run. You can now add workers and process your first payroll.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-sm font-medium">Run Payroll</p>
                  <p className="text-xs text-slate-400">Process your first payroll</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <Users className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <p className="text-sm font-medium">Add Workers</p>
                  <p className="text-xs text-slate-400">Build your team</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <FileText className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-sm font-medium">Tax Documents</p>
                  <p className="text-xs text-slate-400">Review tax settings</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => setLocation("/admin/payroll-dashboard")}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-go-to-payroll"
                >
                  Go to Payroll Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/admin")}
                  data-testid="button-go-to-admin"
                >
                  Back to Admin Panel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" data-testid="text-wizard-title">Payroll Setup Wizard</h1>
            <p className="text-muted-foreground">Get your payroll running in minutes</p>
          </div>
          <Badge className="bg-cyan-600/20 text-cyan-400 border-cyan-500/30">
            Step {currentStep} of {STEPS.length}
          </Badge>
        </div>

        <div className="flex items-center gap-2 p-1 rounded-lg bg-slate-800/50 overflow-x-auto">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            return (
              <div
                key={step.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all min-w-fit ${
                  isCurrent
                    ? 'bg-cyan-600/20 text-cyan-400'
                    : isCompleted
                    ? 'text-green-400'
                    : 'text-slate-500'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isCompleted ? 'bg-green-500' : isCurrent ? 'bg-cyan-500 text-slate-900' : 'bg-slate-700'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                </div>
                <span className="text-sm font-medium hidden md:inline">{step.name}</span>
              </div>
            );
          })}
        </div>

        <Progress value={progress} className="h-2" />

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              {(() => {
                const StepIcon = STEPS[currentStep - 1].icon;
                return <StepIcon className="w-6 h-6 text-cyan-400" />;
              })()}
              <div>
                <CardTitle>{STEPS[currentStep - 1].name}</CardTitle>
                <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
          <CardFooter className="flex justify-between border-t border-slate-700/50 pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              data-testid="button-back"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="bg-cyan-600 hover:bg-cyan-700"
              data-testid="button-next"
            >
              {currentStep === STEPS.length ? "Complete Setup" : "Continue"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>

        <div className="text-center text-xs text-slate-500">
          Powered by ORBIT v2.7.0 | All data encrypted with AES-256
        </div>
      </div>
    </Shell>
  );
}
