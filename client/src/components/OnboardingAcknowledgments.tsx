import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronDown, 
  ChevronUp, 
  Scale, 
  Shield, 
  FileText, 
  AlertTriangle, 
  CreditCard,
  CheckCircle2,
  Clock,
  MapPin
} from "lucide-react";

interface OnboardingAcknowledgmentsProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: OnboardingData) => void;
  workerName?: string;
  state?: string;
}

interface OnboardingData {
  workersRightsAcknowledged: boolean;
  insuranceBenefitsAcknowledged: boolean;
  companyPoliciesAcknowledged: boolean;
  safetyTrainingAcknowledged: boolean;
  directDepositTaxAcknowledged: boolean;
  signature: string;
  signatureDate: string;
  ipAddress: string;
}

interface AcknowledgmentSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  content: React.ReactNode;
}

export function OnboardingAcknowledgments({ 
  isOpen, 
  onClose, 
  onComplete,
  workerName = "Worker",
  state = "Tennessee"
}: OnboardingAcknowledgmentsProps) {
  const [acknowledgments, setAcknowledgments] = useState({
    workersRights: false,
    insuranceBenefits: false,
    companyPolicies: false,
    safetyTraining: false,
    directDepositTax: false
  });
  
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [signature, setSignature] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [ipAddress] = useState("(Will be recorded by server)");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleAcknowledgmentChange = (key: keyof typeof acknowledgments, checked: boolean) => {
    setAcknowledgments(prev => ({ ...prev, [key]: checked }));
  };

  const allAcknowledged = Object.values(acknowledgments).every(Boolean);
  const canComplete = allAcknowledged && signature.trim().length >= 2;

  const handleComplete = () => {
    if (canComplete && onComplete) {
      onComplete({
        workersRightsAcknowledged: acknowledgments.workersRights,
        insuranceBenefitsAcknowledged: acknowledgments.insuranceBenefits,
        companyPoliciesAcknowledged: acknowledgments.companyPolicies,
        safetyTrainingAcknowledged: acknowledgments.safetyTraining,
        directDepositTaxAcknowledged: acknowledgments.directDepositTax,
        signature: signature.trim(),
        signatureDate: currentDateTime.toISOString(),
        ipAddress: ipAddress
      });
    }
    onClose();
  };

  const sections: AcknowledgmentSection[] = [
    {
      id: "workersRights",
      title: "Workers' Rights Information",
      icon: <Scale className="w-5 h-5" />,
      iconColor: "text-cyan-400",
      content: (
        <div className="space-y-4 text-sm text-slate-300">
          <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/20">
            <h4 className="font-semibold text-cyan-300 mb-2">State-Specific Information: {state}</h4>
            <div className="space-y-2">
              <p><strong>Minimum Wage:</strong> $7.25/hour (follows federal minimum wage)</p>
              <p><strong>Overtime:</strong> Time and a half (1.5x) for hours worked over 40 per week</p>
              <p><strong>Pay Frequency:</strong> Semi-monthly or bi-weekly as established by employer</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-white">Your Rights as a Worker:</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Right to a safe and healthy workplace</li>
              <li>Right to receive at least the minimum wage for all hours worked</li>
              <li>Right to overtime pay (1.5x) for hours over 40/week</li>
              <li>Right to workers' compensation if injured on the job</li>
              <li>Right to file complaints without retaliation</li>
              <li>Right to review your personnel file upon request</li>
              <li>Right to receive itemized pay stubs</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white">Break Requirements:</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Rest breaks: Reasonable breaks encouraged (breaks under 20 min must be paid)</li>
              <li>Meal breaks: 30 minutes recommended for shifts over 6 hours (unpaid if relieved of duties)</li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/20">
            <p className="text-amber-300 text-xs">
              <strong>Note:</strong> If you believe your rights have been violated, contact the Department of Labor 
              or speak with your supervisor immediately.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "insuranceBenefits",
      title: "Insurance & Benefits Overview",
      icon: <Shield className="w-5 h-5" />,
      iconColor: "text-green-400",
      content: (
        <div className="space-y-4 text-sm text-slate-300">
          <div className="p-3 rounded-lg bg-green-950/30 border border-green-500/20">
            <h4 className="font-semibold text-green-300 mb-2">Available Insurance Plans</h4>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-white">Medical Insurance</p>
                <p className="text-xs">PPO and HMO options available after 30-day waiting period</p>
              </div>
              <div>
                <p className="font-medium text-white">Dental Insurance</p>
                <p className="text-xs">Basic and premium plans covering preventive and major services</p>
              </div>
              <div>
                <p className="font-medium text-white">Vision Insurance</p>
                <p className="text-xs">Coverage for annual exams, glasses, and contact lenses</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white">Workers' Compensation & Indemnity Plan</h4>
            <p>All employees are covered under our workers' compensation insurance from day one. This includes:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Medical expenses for work-related injuries</li>
              <li>Wage replacement benefits (typically 66.67% of average weekly wage)</li>
              <li>Rehabilitation services if needed</li>
              <li>Disability benefits for permanent injuries</li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-500/20">
            <h4 className="font-semibold text-blue-300 mb-2">Open Enrollment Period</h4>
            <p className="text-xs">
              Open enrollment typically occurs in November each year. During this time, you can:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-xs mt-2">
              <li>Enroll in new benefits</li>
              <li>Change existing coverage levels</li>
              <li>Add or remove dependents</li>
              <li>Switch between plan options</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "companyPolicies",
      title: "Company Policies & Handbook",
      icon: <FileText className="w-5 h-5" />,
      iconColor: "text-purple-400",
      content: (
        <div className="space-y-4 text-sm text-slate-300">
          <div className="space-y-2">
            <h4 className="font-semibold text-white">Attendance Policy</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Arrive on time for all scheduled shifts</li>
              <li>Notify supervisor at least 2 hours before shift if unable to work</li>
              <li>No-call/no-show may result in disciplinary action</li>
              <li>Excessive tardiness will be documented and addressed</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white">Professional Conduct</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Treat all colleagues and clients with respect</li>
              <li>Follow dress code requirements for assigned locations</li>
              <li>Maintain confidentiality of company and client information</li>
              <li>No harassment or discrimination of any kind tolerated</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white">Drug & Alcohol Policy</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Zero tolerance for drugs or alcohol in the workplace</li>
              <li>Pre-employment and random drug testing may be required</li>
              <li>Prescription medications must be disclosed if they affect work ability</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white">Technology & Equipment Use</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Company equipment must be used for work purposes only</li>
              <li>Report any damaged or malfunctioning equipment immediately</li>
              <li>Personal cell phone use should be limited during work hours</li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-500/20">
            <p className="text-purple-300 text-xs">
              <strong>Note:</strong> A complete copy of the Employee Handbook will be provided to you. 
              You are responsible for reading and understanding all policies.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "safetyTraining",
      title: "Safety Training Acknowledgment",
      icon: <AlertTriangle className="w-5 h-5" />,
      iconColor: "text-amber-400",
      content: (
        <div className="space-y-4 text-sm text-slate-300">
          <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/20">
            <h4 className="font-semibold text-amber-300 mb-2">Required Safety Training</h4>
            <p className="text-xs mb-2">
              You must complete the following safety training within your first week of employment:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
              <li>General Workplace Safety Orientation</li>
              <li>Emergency Evacuation Procedures</li>
              <li>Hazard Communication (HazCom) Training</li>
              <li>Personal Protective Equipment (PPE) Usage</li>
              <li>Job-Specific Safety Protocols</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white">Your Safety Responsibilities</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Follow all safety rules and procedures at all times</li>
              <li>Wear required PPE for your assigned tasks</li>
              <li>Report unsafe conditions immediately to your supervisor</li>
              <li>Report all injuries, no matter how minor, immediately</li>
              <li>Know the location of emergency exits and first aid stations</li>
              <li>Never operate equipment without proper training</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white">Emergency Procedures</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>In case of fire: evacuate immediately using nearest exit</li>
              <li>In case of injury: notify supervisor and seek first aid</li>
              <li>Emergency contact: 911 for life-threatening situations</li>
              <li>Know your site-specific emergency assembly points</li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/20">
            <p className="text-red-300 text-xs">
              <strong>Important:</strong> Failure to follow safety protocols may result in disciplinary action 
              up to and including termination. Your safety and the safety of others is our top priority.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "directDepositTax",
      title: "Direct Deposit & Tax Information",
      icon: <CreditCard className="w-5 h-5" />,
      iconColor: "text-blue-400",
      content: (
        <div className="space-y-4 text-sm text-slate-300">
          <div className="space-y-2">
            <h4 className="font-semibold text-white">Direct Deposit Setup</h4>
            <p>Direct deposit is the fastest and most secure way to receive your pay. To set up direct deposit, you will need:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Bank name and routing number</li>
              <li>Account number (checking or savings)</li>
              <li>Voided check or bank letter verifying account</li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-500/20">
            <h4 className="font-semibold text-blue-300 mb-2">W-4 Tax Withholding</h4>
            <p className="text-xs mb-2">
              You must complete a W-4 form to determine your federal tax withholding. Key information needed:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
              <li>Filing status (Single, Married, Head of Household)</li>
              <li>Number of dependents</li>
              <li>Additional withholding amounts (if desired)</li>
              <li>Multiple jobs or spouse works (if applicable)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white">State Tax Information</h4>
            <p>
              {state === "Tennessee" || state === "TN" ? (
                "Tennessee does not have a state income tax on wages, so no state withholding form is required."
              ) : (
                `You may need to complete a state withholding form for ${state}. This will be provided separately.`
              )}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white">Pay Schedule</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Pay periods: Weekly or Bi-weekly (as assigned)</li>
              <li>Pay day: Typically Friday for the previous week's work</li>
              <li>First paycheck may be paper check or delayed based on bank processing</li>
              <li>View pay stubs online through your employee portal</li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-green-950/30 border border-green-500/20">
            <p className="text-green-300 text-xs">
              <strong>Tip:</strong> Keep your direct deposit and tax information up to date. 
              You can update your W-4 at any time through the employee portal or by contacting HR.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-3xl max-h-[90vh] overflow-hidden bg-slate-950 border border-cyan-500/30"
        data-testid="modal-onboarding-acknowledgments"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl text-cyan-300 flex items-center gap-2" data-testid="text-modal-title">
            <CheckCircle2 className="w-6 h-6" />
            Onboarding Acknowledgments
          </DialogTitle>
          <p className="text-sm text-slate-400">
            Welcome, {workerName}! Please review and acknowledge the following information to complete your onboarding.
          </p>
        </DialogHeader>

        <ScrollArea className="h-[50vh] pr-4">
          <div className="space-y-4">
            {sections.map((section) => (
              <div 
                key={section.id} 
                className="rounded-lg border border-slate-700/50 bg-slate-900/50 overflow-hidden"
                data-testid={`section-${section.id}`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`checkbox-${section.id}`}
                      checked={acknowledgments[section.id as keyof typeof acknowledgments]}
                      onCheckedChange={(checked) => 
                        handleAcknowledgmentChange(section.id as keyof typeof acknowledgments, checked as boolean)
                      }
                      className="mt-1 border-slate-500 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600"
                      data-testid={`checkbox-${section.id}`}
                    />
                    <div className="flex-1">
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection(section.id)}
                        data-testid={`toggle-${section.id}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={section.iconColor}>{section.icon}</span>
                          <Label 
                            htmlFor={`checkbox-${section.id}`}
                            className="text-base font-medium text-white cursor-pointer"
                          >
                            {section.title}
                          </Label>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-slate-400 hover:text-white"
                          data-testid={`button-expand-${section.id}`}
                        >
                          {expandedSections.includes(section.id) ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      
                      <p className="text-xs text-slate-400 mt-1">
                        Click to expand and read full details
                      </p>
                    </div>
                  </div>

                  {expandedSections.includes(section.id) && (
                    <div className="mt-4 ml-7 pl-4 border-l-2 border-slate-700" data-testid={`content-${section.id}`}>
                      {section.content}
                    </div>
                  )}

                  {acknowledgments[section.id as keyof typeof acknowledgments] && (
                    <div className="mt-3 ml-7 flex items-center gap-2 text-green-400 text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span data-testid={`status-acknowledged-${section.id}`}>I have read and understand this information</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <Separator className="bg-slate-700/50" />

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-cyan-300 mb-4">Electronic Signature</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="signature" className="text-sm text-slate-300">
                  Type Your Full Legal Name
                </Label>
                <Input
                  id="signature"
                  type="text"
                  placeholder="Enter your full name"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="bg-slate-800 border-slate-600 focus:border-cyan-500 text-white"
                  data-testid="input-signature"
                />
                {signature.trim().length > 0 && (
                  <p className="text-xs text-slate-400">
                    Signature: <span className="italic font-serif text-cyan-300" data-testid="text-signature-preview">{signature}</span>
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-sm text-slate-300 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Date & Time
                  </Label>
                  <p className="text-sm text-white" data-testid="text-signature-datetime">
                    {currentDateTime.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })} at {currentDateTime.toLocaleTimeString('en-US')}
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm text-slate-300 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    IP Address
                  </Label>
                  <p className="text-sm text-slate-400" data-testid="text-ip-address">
                    {ipAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>
              By clicking "Complete Onboarding", you acknowledge that you have read, understood, and agree to all the above terms.
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleComplete}
            disabled={!canComplete}
            className={`${
              canComplete 
                ? 'bg-cyan-600 hover:bg-cyan-700 text-white' 
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
            data-testid="button-complete-onboarding"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Complete Onboarding
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default OnboardingAcknowledgments;
