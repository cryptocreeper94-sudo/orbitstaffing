import React, { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { CarouselRail } from "@/components/ui/carousel-rail";
import { PageHeader } from "@/components/ui/section-header";
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardDescription, OrbitCardContent, StatCard } from "@/components/ui/orbit-card";
import {
  Heart,
  Shield,
  Stethoscope,
  Eye,
  DollarSign,
  Wallet,
  CheckCircle2,
  Info,
  ChevronRight,
  PiggyBank,
  Building2,
  Calendar,
  FileText,
  Lock,
  Sparkles,
} from "lucide-react";

type BenefitTier = "none" | "employee" | "employee_spouse" | "employee_children" | "family";

export default function BenefitsEnrollment() {
  const [activeTab, setActiveTab] = useState("overview");
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

  type BenefitDetail = { label: string; value: string; isHighlight?: boolean };
  
  const benefitCards: Array<{
    id: string;
    icon: React.ReactNode;
    iconBg: string;
    title: string;
    provider: string;
    details: BenefitDetail[];
    active: boolean;
    badgeText?: string;
  }> = [
    {
      id: "health",
      icon: <Heart className="w-5 h-5 text-red-400" />,
      iconBg: "bg-red-500/20",
      title: "Health Insurance",
      provider: "BlueCross BlueShield PPO",
      details: [
        { label: "Coverage", value: enrollments.health.replace('_', ' + ') },
        { label: "Your Cost", value: `$${mockBenefitPlans.health.find(p => p.tier === enrollments.health)?.cost}/mo` },
        { label: "Deductible", value: "$1,500 (In-Network)" },
      ],
      active: true,
    },
    {
      id: "dental",
      icon: <Stethoscope className="w-5 h-5 text-cyan-400" />,
      iconBg: "bg-cyan-500/20",
      title: "Dental",
      provider: "Delta Dental PPO",
      details: [
        { label: "Coverage", value: enrollments.dental.replace('_', ' + ') },
        { label: "Your Cost", value: `$${mockBenefitPlans.dental.find(p => p.tier === enrollments.dental)?.cost}/mo` },
        { label: "Annual Max", value: "$2,000 per person" },
      ],
      active: true,
    },
    {
      id: "vision",
      icon: <Eye className="w-5 h-5 text-purple-400" />,
      iconBg: "bg-purple-500/20",
      title: "Vision",
      provider: "VSP Vision Care",
      details: [
        { label: "Coverage", value: enrollments.vision.replace('_', ' + ') },
        { label: "Your Cost", value: `$${mockBenefitPlans.vision.find(p => p.tier === enrollments.vision)?.cost}/mo` },
        { label: "Frames Allowance", value: "$200/year" },
      ],
      active: true,
    },
    {
      id: "life",
      icon: <Shield className="w-5 h-5 text-green-400" />,
      iconBg: "bg-green-500/20",
      title: "Life Insurance",
      provider: "MetLife",
      details: [
        { label: "Coverage", value: "$50,000 (1x Salary)" },
        { label: "Your Cost", value: "$15/mo" },
        { label: "Beneficiary", value: "Jane Smith (Spouse)" },
      ],
      active: enrollments.life,
    },
    {
      id: "disability",
      icon: <Lock className="w-5 h-5 text-amber-400" />,
      iconBg: "bg-amber-500/20",
      title: "Disability",
      provider: "Short & Long-Term",
      details: [
        { label: "STD Benefit", value: "60% of salary" },
        { label: "LTD Benefit", value: "60% of salary" },
        { label: "Your Cost", value: "$25/mo" },
      ],
      active: enrollments.disability,
    },
    {
      id: "401k",
      icon: <PiggyBank className="w-5 h-5 text-purple-400" />,
      iconBg: "bg-purple-500/20",
      title: "401(k)",
      provider: "Fidelity",
      details: [
        { label: "Your Contribution", value: `${enrollments.retirement401k.contribution}% of salary` },
        { label: "Employer Match", value: "3% (50% of first 6%)", isHighlight: true },
        { label: "YTD Contribution", value: "$8,450" },
      ],
      active: enrollments.retirement401k.enrolled,
      badgeText: "Contributing",
    },
  ];

  const BenefitCard = ({ benefit }: { benefit: typeof benefitCards[0] }) => (
    <OrbitCard 
      className="h-full min-w-[280px] md:min-w-0"
      data-testid={`card-${benefit.id}`}
    >
      <OrbitCardHeader
        icon={
          <div className={`w-10 h-10 rounded-lg ${benefit.iconBg} flex items-center justify-center`}>
            {benefit.icon}
          </div>
        }
        action={
          benefit.active ? (
            <Badge className="bg-green-600/20 text-green-400">{benefit.badgeText || "Active"}</Badge>
          ) : (
            <Badge className="bg-slate-600/20 text-slate-400">Not Enrolled</Badge>
          )
        }
      >
        <OrbitCardTitle>{benefit.title}</OrbitCardTitle>
        <OrbitCardDescription>{benefit.provider}</OrbitCardDescription>
      </OrbitCardHeader>
      <OrbitCardContent className="space-y-3">
        {benefit.details.map((detail, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span className="text-slate-400">{detail.label}</span>
            <span className={`capitalize ${detail.isHighlight ? 'text-green-400' : ''}`}>{detail.value}</span>
          </div>
        ))}
        {(benefit.id === "health" || benefit.id === "dental" || benefit.id === "vision") && (
          <Button variant="outline" size="sm" className="w-full mt-2" data-testid={`button-view-${benefit.id}`}>
            View Plan Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </OrbitCardContent>
    </OrbitCard>
  );

  return (
    <Shell>
      <div className="space-y-6">
        <PageHeader
          title="Benefits"
          subtitle="Manage your health, dental, vision, and retirement benefits"
          actions={
            <Badge className="bg-green-600/20 text-green-400 border-green-500/30">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Enrolled
            </Badge>
          }
          data-testid="text-page-title"
        />

        <BentoGrid cols={4} gap="md">
          <BentoTile className="p-0" data-testid="card-monthly-cost">
            <StatCard
              label="Monthly Cost"
              value={`$${calculateMonthlyTotal()}`}
              icon={<DollarSign className="w-5 h-5" />}
              className="border-0 bg-gradient-to-br from-cyan-900/30 to-slate-800/50"
            />
          </BentoTile>
          <BentoTile className="p-0" data-testid="card-employer-contribution">
            <OrbitCard variant="stat" className="border-0 h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wide">Employer Contribution</p>
                  <p className="text-2xl md:text-3xl font-bold text-green-400 mt-1">$435</p>
                  <p className="text-xs text-slate-400 mt-1">Monthly employer contribution</p>
                </div>
                <Building2 className="w-5 h-5 text-green-400" />
              </div>
            </OrbitCard>
          </BentoTile>
          <BentoTile className="p-0" data-testid="card-401k">
            <OrbitCard variant="stat" className="border-0 h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wide">401(k) Contribution</p>
                  <p className="text-2xl md:text-3xl font-bold text-white mt-1">{enrollments.retirement401k.contribution}%</p>
                  <p className="text-xs text-slate-400 mt-1">+ 3% employer match</p>
                </div>
                <PiggyBank className="w-5 h-5 text-purple-400" />
              </div>
            </OrbitCard>
          </BentoTile>
          <BentoTile className="p-0" data-testid="card-hsa">
            <OrbitCard variant="stat" className="border-0 h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wide">HSA Balance</p>
                  <p className="text-2xl md:text-3xl font-bold text-white mt-1">$2,450</p>
                  <p className="text-xs text-slate-400 mt-1">Contributing ${enrollments.hsa.monthlyContribution}/mo</p>
                </div>
                <Wallet className="w-5 h-5 text-amber-400" />
              </div>
            </OrbitCard>
          </BentoTile>
        </BentoGrid>

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

          <TabsContent value="overview" className="space-y-4">
            <div className="block md:hidden">
              <CarouselRail 
                title="Your Benefits" 
                subtitle="Swipe to view all your enrolled benefits"
                gap="md"
                showArrows={false}
              >
                {benefitCards.map((benefit) => (
                  <BenefitCard key={benefit.id} benefit={benefit} />
                ))}
              </CarouselRail>
            </div>

            <div className="hidden md:block">
              <BentoGrid cols={3} gap="md">
                {benefitCards.map((benefit) => (
                  <BentoTile key={benefit.id} className="p-0">
                    <BenefitCard benefit={benefit} />
                  </BentoTile>
                ))}
              </BentoGrid>
            </div>

            <OrbitCard variant="glass" className="bg-amber-900/20 border-amber-500/30">
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
            </OrbitCard>
          </TabsContent>

          <TabsContent value="health" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <OrbitCard>
                  <OrbitCardHeader
                    icon={<Heart className="w-5 h-5 text-red-400" />}
                  >
                    <OrbitCardTitle>Medical Plan Details</OrbitCardTitle>
                    <OrbitCardDescription>BlueCross BlueShield PPO - High Deductible Health Plan</OrbitCardDescription>
                  </OrbitCardHeader>
                  <OrbitCardContent>
                    <BentoGrid cols={2} gap="sm" className="mb-6">
                      <BentoTile className="p-4">
                        <p className="text-xs text-slate-400 mb-1">In-Network Deductible</p>
                        <p className="text-xl font-bold">$1,500</p>
                        <p className="text-xs text-slate-400">Individual / $3,000 Family</p>
                      </BentoTile>
                      <BentoTile className="p-4">
                        <p className="text-xs text-slate-400 mb-1">Out-of-Pocket Max</p>
                        <p className="text-xl font-bold">$5,000</p>
                        <p className="text-xs text-slate-400">Individual / $10,000 Family</p>
                      </BentoTile>
                      <BentoTile className="p-4">
                        <p className="text-xs text-slate-400 mb-1">Primary Care Visit</p>
                        <p className="text-xl font-bold">$25 copay</p>
                        <p className="text-xs text-slate-400">After deductible</p>
                      </BentoTile>
                      <BentoTile className="p-4">
                        <p className="text-xs text-slate-400 mb-1">Specialist Visit</p>
                        <p className="text-xl font-bold">$50 copay</p>
                        <p className="text-xs text-slate-400">After deductible</p>
                      </BentoTile>
                    </BentoGrid>

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
                  </OrbitCardContent>
                </OrbitCard>
              </div>

              <div className="space-y-4">
                <OrbitCard>
                  <OrbitCardHeader>
                    <OrbitCardTitle className="text-sm">Deductible Progress</OrbitCardTitle>
                  </OrbitCardHeader>
                  <OrbitCardContent className="space-y-3">
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
                  </OrbitCardContent>
                </OrbitCard>

                <OrbitCard>
                  <OrbitCardHeader>
                    <OrbitCardTitle className="text-sm">ID Cards</OrbitCardTitle>
                  </OrbitCardHeader>
                  <OrbitCardContent>
                    <Button variant="outline" size="sm" className="w-full mb-2" data-testid="button-view-id-card">
                      <FileText className="w-4 h-4 mr-2" />
                      View Medical ID Card
                    </Button>
                    <Button variant="outline" size="sm" className="w-full" data-testid="button-view-dental-id">
                      <FileText className="w-4 h-4 mr-2" />
                      View Dental ID Card
                    </Button>
                  </OrbitCardContent>
                </OrbitCard>

                <OrbitCard variant="glass" className="bg-cyan-900/20 border-cyan-500/30">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-cyan-300">HSA Eligible</p>
                      <p className="text-xs text-cyan-200/70 mt-1">
                        Your HDHP qualifies you for a Health Savings Account with tax-free contributions.
                      </p>
                    </div>
                  </div>
                </OrbitCard>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="retirement" className="space-y-4">
            <BentoGrid cols={2} gap="lg">
              <BentoTile className="p-0">
                <OrbitCard className="border-0 h-full">
                  <OrbitCardHeader icon={<PiggyBank className="w-5 h-5 text-purple-400" />}>
                    <OrbitCardTitle>401(k) Retirement Plan</OrbitCardTitle>
                    <OrbitCardDescription>Fidelity Investments</OrbitCardDescription>
                  </OrbitCardHeader>
                  <OrbitCardContent className="space-y-4">
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
                  </OrbitCardContent>
                </OrbitCard>
              </BentoTile>

              <BentoTile className="p-0">
                <OrbitCard className="border-0 h-full">
                  <OrbitCardHeader icon={<Wallet className="w-5 h-5 text-amber-400" />}>
                    <OrbitCardTitle>Health Savings Account (HSA)</OrbitCardTitle>
                    <OrbitCardDescription>Tax-advantaged medical savings</OrbitCardDescription>
                  </OrbitCardHeader>
                  <OrbitCardContent className="space-y-4">
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

                    <OrbitCard variant="glass" className="bg-amber-900/20 border-amber-500/30 p-3">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-300">Triple Tax Advantage</p>
                          <p className="text-xs text-amber-200/70 mt-1">
                            Pre-tax contributions, tax-free growth, and tax-free withdrawals for medical expenses.
                          </p>
                        </div>
                      </div>
                    </OrbitCard>

                    <Button variant="outline" className="w-full" data-testid="button-change-hsa">
                      Change HSA Contribution
                    </Button>
                  </OrbitCardContent>
                </OrbitCard>
              </BentoTile>
            </BentoGrid>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <OrbitCard>
              <OrbitCardHeader icon={<FileText className="w-5 h-5 text-cyan-400" />}>
                <OrbitCardTitle>Benefit Documents</OrbitCardTitle>
                <OrbitCardDescription>Plan summaries, ID cards, and enrollment documents</OrbitCardDescription>
              </OrbitCardHeader>
              <OrbitCardContent>
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
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-cyan-500/30 transition-colors"
                      data-testid={`card-doc-${index}`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-slate-400">{doc.type} • {doc.size}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" data-testid={`button-download-${index}`}>Download</Button>
                    </div>
                  ))}
                </div>
              </OrbitCardContent>
            </OrbitCard>
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  );
}
