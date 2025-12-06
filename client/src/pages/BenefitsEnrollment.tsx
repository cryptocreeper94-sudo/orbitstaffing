import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import {
  Heart,
  Shield,
  Stethoscope,
  Eye,
  DollarSign,
  Wallet,
  Users,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronRight,
  PiggyBank,
  Building2,
  Calendar,
  Clock,
  FileText,
  Lock,
  Sparkles,
  XCircle
} from "lucide-react";

type BenefitTier = "none" | "employee" | "employee_spouse" | "employee_children" | "family";

export default function BenefitsEnrollment() {
  const [activeTab, setActiveTab] = useState("overview");
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState<string | null>(null);
  const { toast } = useToast();

  const [enrollments, setEnrollments] = useState({
    health: "employee" as BenefitTier,
    dental: "family" as BenefitTier,
    vision: "employee" as BenefitTier,
    life: true,
    disability: true,
    retirement401k: { enrolled: true, contribution: 6 },
    hsa: { enrolled: true, monthlyContribution: 200 },
    fsa: { enrolled: false, annualElection: 0 },
  });

  const mockBenefitPlans = {
    health: [
      { tier: "employee", label: "Employee Only", cost: 150, employerContribution: 400 },
      { tier: "employee_spouse", label: "Employee + Spouse", cost: 350, employerContribution: 400 },
      { tier: "employee_children", label: "Employee + Children", cost: 300, employerContribution: 400 },
      { tier: "family", label: "Family", cost: 450, employerContribution: 400 },
    ],
    dental: [
      { tier: "employee", label: "Employee Only", cost: 25, employerContribution: 25 },
      { tier: "employee_spouse", label: "Employee + Spouse", cost: 50, employerContribution: 25 },
      { tier: "employee_children", label: "Employee + Children", cost: 45, employerContribution: 25 },
      { tier: "family", label: "Family", cost: 75, employerContribution: 25 },
    ],
    vision: [
      { tier: "employee", label: "Employee Only", cost: 10, employerContribution: 10 },
      { tier: "employee_spouse", label: "Employee + Spouse", cost: 20, employerContribution: 10 },
      { tier: "employee_children", label: "Employee + Children", cost: 18, employerContribution: 10 },
      { tier: "family", label: "Family", cost: 28, employerContribution: 10 },
    ],
  };

  const calculateMonthlyTotal = () => {
    let total = 0;
    const healthPlan = mockBenefitPlans.health.find(p => p.tier === enrollments.health);
    const dentalPlan = mockBenefitPlans.dental.find(p => p.tier === enrollments.dental);
    const visionPlan = mockBenefitPlans.vision.find(p => p.tier === enrollments.vision);
    if (healthPlan) total += healthPlan.cost;
    if (dentalPlan) total += dentalPlan.cost;
    if (visionPlan) total += visionPlan.cost;
    if (enrollments.life) total += 15;
    if (enrollments.disability) total += 25;
    if (enrollments.retirement401k.enrolled) total += enrollments.retirement401k.contribution * 50;
    if (enrollments.hsa.enrolled) total += enrollments.hsa.monthlyContribution;
    return total;
  };

  const handleEnrollmentChange = () => {
    toast({
      title: "Benefits Updated",
      description: "Your benefit elections have been saved. Changes take effect next pay period.",
    });
    setEnrollDialogOpen(false);
  };

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Benefits</h1>
            <p className="text-muted-foreground">Manage your health, dental, vision, and retirement benefits</p>
          </div>
          <Badge className="bg-green-600/20 text-green-400 border-green-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Enrolled
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-cyan-900/30 to-slate-800/50 border-cyan-500/30" data-testid="card-monthly-cost">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-400">Monthly Cost</span>
              </div>
              <div className="text-2xl font-bold">${calculateMonthlyTotal()}</div>
              <p className="text-xs text-slate-400">Per paycheck (bi-weekly): ${Math.round(calculateMonthlyTotal() / 2)}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700/50" data-testid="card-employer-contribution">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-green-400" />
                <span className="text-xs text-slate-400">Employer Contribution</span>
              </div>
              <div className="text-2xl font-bold text-green-400">$435</div>
              <p className="text-xs text-slate-400">Monthly employer contribution</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700/50" data-testid="card-401k">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <PiggyBank className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-slate-400">401(k) Contribution</span>
              </div>
              <div className="text-2xl font-bold">{enrollments.retirement401k.contribution}%</div>
              <p className="text-xs text-slate-400">+ 3% employer match</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700/50" data-testid="card-hsa">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-slate-400">HSA Balance</span>
              </div>
              <div className="text-2xl font-bold">$2,450</div>
              <p className="text-xs text-slate-400">Contributing ${enrollments.hsa.monthlyContribution}/mo</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 bg-slate-800/50 p-1" data-testid="tabs-benefits">
            <TabsTrigger value="overview" className="text-xs sm:text-sm" data-testid="tab-overview">
              <Shield className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="health" className="text-xs sm:text-sm" data-testid="tab-health">
              <Stethoscope className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Health</span>
            </TabsTrigger>
            <TabsTrigger value="retirement" className="text-xs sm:text-sm" data-testid="tab-retirement">
              <PiggyBank className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Retirement</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-xs sm:text-sm" data-testid="tab-documents">
              <FileText className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Health Insurance Card */}
              <Card className="bg-slate-800/50 border-slate-700/50" data-testid="card-health">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Health Insurance</CardTitle>
                        <CardDescription className="text-xs">BlueCross BlueShield PPO</CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-green-600/20 text-green-400">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Coverage</span>
                    <span className="capitalize">{enrollments.health.replace('_', ' + ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Your Cost</span>
                    <span>${mockBenefitPlans.health.find(p => p.tier === enrollments.health)?.cost}/mo</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Deductible</span>
                    <span>$1,500 (In-Network)</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2" data-testid="button-view-health">
                    View Plan Details
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              {/* Dental Card */}
              <Card className="bg-slate-800/50 border-slate-700/50" data-testid="card-dental">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Dental</CardTitle>
                        <CardDescription className="text-xs">Delta Dental PPO</CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-green-600/20 text-green-400">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Coverage</span>
                    <span className="capitalize">{enrollments.dental.replace('_', ' + ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Your Cost</span>
                    <span>${mockBenefitPlans.dental.find(p => p.tier === enrollments.dental)?.cost}/mo</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Annual Max</span>
                    <span>$2,000 per person</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2" data-testid="button-view-dental">
                    View Plan Details
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              {/* Vision Card */}
              <Card className="bg-slate-800/50 border-slate-700/50" data-testid="card-vision">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Eye className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Vision</CardTitle>
                        <CardDescription className="text-xs">VSP Vision Care</CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-green-600/20 text-green-400">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Coverage</span>
                    <span className="capitalize">{enrollments.vision.replace('_', ' + ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Your Cost</span>
                    <span>${mockBenefitPlans.vision.find(p => p.tier === enrollments.vision)?.cost}/mo</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Frames Allowance</span>
                    <span>$200/year</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2" data-testid="button-view-vision">
                    View Plan Details
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              {/* Life Insurance Card */}
              <Card className="bg-slate-800/50 border-slate-700/50" data-testid="card-life">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Life Insurance</CardTitle>
                        <CardDescription className="text-xs">MetLife</CardDescription>
                      </div>
                    </div>
                    {enrollments.life ? (
                      <Badge className="bg-green-600/20 text-green-400">Active</Badge>
                    ) : (
                      <Badge className="bg-slate-600/20 text-slate-400">Not Enrolled</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Coverage</span>
                    <span>$50,000 (1x Salary)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Your Cost</span>
                    <span>$15/mo</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Beneficiary</span>
                    <span>Jane Smith (Spouse)</span>
                  </div>
                </CardContent>
              </Card>

              {/* Disability Card */}
              <Card className="bg-slate-800/50 border-slate-700/50" data-testid="card-disability">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Disability</CardTitle>
                        <CardDescription className="text-xs">Short & Long-Term</CardDescription>
                      </div>
                    </div>
                    {enrollments.disability ? (
                      <Badge className="bg-green-600/20 text-green-400">Active</Badge>
                    ) : (
                      <Badge className="bg-slate-600/20 text-slate-400">Not Enrolled</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">STD Benefit</span>
                    <span>60% of salary</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">LTD Benefit</span>
                    <span>60% of salary</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Your Cost</span>
                    <span>$25/mo</span>
                  </div>
                </CardContent>
              </Card>

              {/* 401k Card */}
              <Card className="bg-slate-800/50 border-slate-700/50" data-testid="card-retirement">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <PiggyBank className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base">401(k)</CardTitle>
                        <CardDescription className="text-xs">Fidelity</CardDescription>
                      </div>
                    </div>
                    {enrollments.retirement401k.enrolled ? (
                      <Badge className="bg-green-600/20 text-green-400">Contributing</Badge>
                    ) : (
                      <Badge className="bg-slate-600/20 text-slate-400">Not Enrolled</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Your Contribution</span>
                    <span>{enrollments.retirement401k.contribution}% of salary</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Employer Match</span>
                    <span className="text-green-400">3% (50% of first 6%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">YTD Contribution</span>
                    <span>$8,450</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-amber-900/20 border-amber-500/30">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-300">Open Enrollment Period</p>
                    <p className="text-xs text-amber-200/70 mt-1">
                      Open enrollment for 2025 benefits runs November 1 - November 30, 2024. 
                      You can make changes to your elections during this period.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* HEALTH TAB */}
          <TabsContent value="health" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-400" />
                      Medical Plan Details
                    </CardTitle>
                    <CardDescription>BlueCross BlueShield PPO - High Deductible Health Plan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                        <p className="text-xs text-slate-400 mb-1">In-Network Deductible</p>
                        <p className="text-xl font-bold">$1,500</p>
                        <p className="text-xs text-slate-400">Individual / $3,000 Family</p>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                        <p className="text-xs text-slate-400 mb-1">Out-of-Pocket Max</p>
                        <p className="text-xl font-bold">$5,000</p>
                        <p className="text-xs text-slate-400">Individual / $10,000 Family</p>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                        <p className="text-xs text-slate-400 mb-1">Primary Care Visit</p>
                        <p className="text-xl font-bold">$25 copay</p>
                        <p className="text-xs text-slate-400">After deductible</p>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                        <p className="text-xs text-slate-400 mb-1">Specialist Visit</p>
                        <p className="text-xl font-bold">$50 copay</p>
                        <p className="text-xs text-slate-400">After deductible</p>
                      </div>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="coverage">
                        <AccordionTrigger>Coverage Details</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span>Emergency Room</span><span>$250 copay + 20%</span></div>
                            <div className="flex justify-between"><span>Urgent Care</span><span>$50 copay</span></div>
                            <div className="flex justify-between"><span>Hospital Stay</span><span>20% after deductible</span></div>
                            <div className="flex justify-between"><span>Prescription (Generic)</span><span>$10 copay</span></div>
                            <div className="flex justify-between"><span>Prescription (Brand)</span><span>$35 copay</span></div>
                            <div className="flex justify-between"><span>Mental Health</span><span>$25 copay</span></div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="dependents">
                        <AccordionTrigger>Covered Dependents</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-slate-400">
                            Currently enrolled as: <strong className="text-white capitalize">{enrollments.health.replace('_', ' + ')}</strong>
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Deductible Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Individual</span>
                        <span>$750 / $1,500</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Out-of-Pocket</span>
                        <span>$1,200 / $5,000</span>
                      </div>
                      <Progress value={24} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">ID Cards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" className="w-full mb-2" data-testid="button-view-id-card">
                      <FileText className="w-4 h-4 mr-2" />
                      View Medical ID Card
                    </Button>
                    <Button variant="outline" size="sm" className="w-full" data-testid="button-view-dental-id">
                      <FileText className="w-4 h-4 mr-2" />
                      View Dental ID Card
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-cyan-900/20 border-cyan-500/30">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-cyan-300">HSA Eligible</p>
                        <p className="text-xs text-cyan-200/70 mt-1">
                          Your HDHP qualifies you for a Health Savings Account with tax-free contributions.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* RETIREMENT TAB */}
          <TabsContent value="retirement" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PiggyBank className="w-5 h-5 text-purple-400" />
                    401(k) Retirement Plan
                  </CardTitle>
                  <CardDescription>Fidelity Investments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                      <p className="text-xs text-slate-400 mb-1">Your Contribution</p>
                      <p className="text-2xl font-bold">{enrollments.retirement401k.contribution}%</p>
                      <p className="text-xs text-slate-400">~${enrollments.retirement401k.contribution * 50}/paycheck</p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-900/20 border border-green-500/30">
                      <p className="text-xs text-slate-400 mb-1">Employer Match</p>
                      <p className="text-2xl font-bold text-green-400">3%</p>
                      <p className="text-xs text-slate-400">50% match up to 6%</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>2024 YTD Contributions</span>
                        <span className="font-medium">$8,450</span>
                      </div>
                      <Progress value={(8450 / 23000) * 100} className="h-2" />
                      <p className="text-xs text-slate-400 mt-1">IRS Limit: $23,000 (2024)</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                    <p className="text-xs text-slate-400 mb-1">Account Balance</p>
                    <p className="text-3xl font-bold">$45,320</p>
                    <p className="text-xs text-green-400 mt-1">+12.5% YTD return</p>
                  </div>

                  <Button className="w-full bg-purple-600 hover:bg-purple-700" data-testid="button-change-contribution">
                    Change Contribution Rate
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-amber-400" />
                    Health Savings Account (HSA)
                  </CardTitle>
                  <CardDescription>Tax-advantaged medical savings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                      <p className="text-xs text-slate-400 mb-1">Monthly Contribution</p>
                      <p className="text-2xl font-bold">${enrollments.hsa.monthlyContribution}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-900/20 border border-green-500/30">
                      <p className="text-xs text-slate-400 mb-1">Current Balance</p>
                      <p className="text-2xl font-bold text-green-400">$2,450</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>2024 YTD Contributions</span>
                        <span className="font-medium">$2,200</span>
                      </div>
                      <Progress value={(2200 / 4150) * 100} className="h-2" />
                      <p className="text-xs text-slate-400 mt-1">IRS Limit: $4,150 (Individual, 2024)</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-amber-900/20 border border-amber-500/30">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-300">Triple Tax Advantage</p>
                        <p className="text-xs text-amber-200/70 mt-1">
                          Pre-tax contributions, tax-free growth, and tax-free withdrawals for medical expenses.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" data-testid="button-change-hsa">
                    Change HSA Contribution
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* DOCUMENTS TAB */}
          <TabsContent value="documents" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  Benefit Documents
                </CardTitle>
                <CardDescription>Plan summaries, ID cards, and enrollment documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Medical Plan Summary (SPD)", type: "PDF", size: "2.4 MB" },
                    { name: "Dental Plan Summary", type: "PDF", size: "1.1 MB" },
                    { name: "Vision Plan Summary", type: "PDF", size: "890 KB" },
                    { name: "401(k) Plan Document", type: "PDF", size: "3.2 MB" },
                    { name: "HSA Enrollment Confirmation", type: "PDF", size: "450 KB" },
                    { name: "Life Insurance Certificate", type: "PDF", size: "620 KB" },
                    { name: "2024 Benefits Enrollment Confirmation", type: "PDF", size: "180 KB" },
                  ].map((doc, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700/50"
                      data-testid={`card-doc-${index}`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-slate-400">{doc.type} • {doc.size}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Download</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  );
}
