import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { CarouselRail, CarouselRailItem } from "@/components/ui/carousel-rail";
import { PageHeader, SectionHeader } from "@/components/ui/section-header";
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardDescription, OrbitCardContent, StatCard, ActionCard } from "@/components/ui/orbit-card";
import {
  User,
  FileText,
  DollarSign,
  Shield,
  Clock,
  Scale,
  Download,
  Phone,
  Mail,
  MessageSquare,
  Building2,
  CreditCard,
  Heart,
  AlertCircle,
  CheckCircle2,
  Calendar as CalendarIcon,
  ChevronRight,
  ExternalLink,
  Briefcase,
  UserCircle,
  MapPin,
  Globe,
  Coffee,
  Timer,
  TrendingUp
} from "lucide-react";

const mockEmployeeData = {
  firstName: "Jason",
  lastName: "Mitchell",
  email: "jason.mitchell@email.com",
  phone: "(615) 555-0123",
  employeeId: "EMP-2024-0847",
  position: "Forklift Operator",
  department: "Warehouse Operations",
  startDate: "2024-01-15",
  status: "Active",
  address: "456 Oak Street, Nashville, TN 37201",
  emergencyContact: "Sarah Mitchell - (615) 555-0456",
  ssn: "***-**-1234"
};

const mockEmployerData = {
  companyName: "TechCorp Distribution",
  managerName: "Jennifer Adams",
  managerPhone: "(615) 555-7890",
  managerEmail: "jadams@techcorp.com",
  hrEmail: "hr@techcorp.com",
  address: "123 Industrial Pkwy, Nashville, TN 37210"
};

const mockPayStubs = [
  { id: 1, period: "Nov 15 - Nov 21, 2024", grossPay: 1248.00, netPay: 982.45, status: "Paid" },
  { id: 2, period: "Nov 8 - Nov 14, 2024", grossPay: 1404.00, netPay: 1105.62, status: "Paid" },
  { id: 3, period: "Nov 1 - Nov 7, 2024", grossPay: 1170.00, netPay: 921.84, status: "Paid" },
  { id: 4, period: "Oct 25 - Oct 31, 2024", grossPay: 1326.00, netPay: 1044.13, status: "Paid" },
];

const mockTaxForms = [
  { id: 1, type: "W-2", year: "2023", status: "Available", dateAvailable: "Jan 31, 2024" },
  { id: 2, type: "W-4", year: "2024", status: "Current", dateUpdated: "Jan 15, 2024" },
  { id: 3, type: "W-2", year: "2022", status: "Available", dateAvailable: "Jan 31, 2023" },
];

const mockBenefits = {
  medical: { plan: "Blue Cross PPO Select", coverage: "Employee + Family", premium: 245.00, status: "Active" },
  dental: { plan: "Delta Dental Basic", coverage: "Employee Only", premium: 28.50, status: "Active" },
  vision: { plan: "VSP Standard", coverage: "Employee + Spouse", premium: 12.00, status: "Active" },
  openEnrollment: { start: "Nov 1, 2024", end: "Nov 30, 2024", status: "Open" }
};

const mockTimeCards = [
  { date: "Nov 25, 2024", day: "Mon", clockIn: "7:00 AM", clockOut: "3:30 PM", hours: 8.0, overtime: 0, status: "Approved" },
  { date: "Nov 26, 2024", day: "Tue", clockIn: "6:45 AM", clockOut: "4:15 PM", hours: 8.0, overtime: 1.5, status: "Approved" },
  { date: "Nov 27, 2024", day: "Wed", clockIn: "7:00 AM", clockOut: "3:30 PM", hours: 8.0, overtime: 0, status: "Pending" },
  { date: "Nov 28, 2024", day: "Thu", clockIn: "-", clockOut: "-", hours: 0, overtime: 0, status: "Holiday" },
  { date: "Nov 29, 2024", day: "Fri", clockIn: "-", clockOut: "-", hours: 0, overtime: 0, status: "Scheduled" },
];

const mockWorkersRights = {
  state: "Tennessee",
  breakRequirements: [
    { type: "Rest Break", duration: "No state requirement (federal: reasonable breaks)", paid: "If provided, breaks under 20 min must be paid" },
    { type: "Meal Break", duration: "30 minutes for 6+ hour shifts (recommended)", paid: "Unpaid if relieved of duties" },
  ],
  overtimeRules: {
    threshold: "40 hours/week",
    rate: "1.5x regular rate",
    exemptions: "Certain salaried positions may be exempt"
  },
  minimumWage: "$7.25/hour (follows federal minimum)",
  safetyRights: [
    "Right to a safe workplace free from recognized hazards",
    "Right to report safety concerns without retaliation",
    "Right to access OSHA safety training and information",
    "Right to refuse dangerous work under certain conditions"
  ]
};

const mockReports = [
  { id: 1, name: "YTD Earnings Summary", type: "Pay History", format: "PDF" },
  { id: 2, name: "Time Card History (Last 90 Days)", type: "Time Cards", format: "PDF" },
  { id: 3, name: "Benefits Election Summary", type: "Benefits", format: "PDF" },
  { id: 4, name: "Tax Withholding Summary", type: "Taxes", format: "PDF" },
  { id: 5, name: "PTO Balance Report", type: "Time Off", format: "PDF" },
];

export default function EmployeeHub() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <Shell>
      <div className="space-y-6">
        <PageHeader
          title="Employee Hub"
          subtitle="Access all your employment information, pay records, and benefits in one place."
          data-testid="text-page-title"
        />

        <div className="md:hidden">
          <CarouselRail gap="sm" showArrows={false}>
            <CarouselRailItem>
              <ActionCard
                title="View Pay"
                icon={<DollarSign className="w-5 h-5" />}
                onClick={() => setActiveTab("pay")}
                className="min-w-[140px]"
              />
            </CarouselRailItem>
            <CarouselRailItem>
              <ActionCard
                title="Time Cards"
                icon={<Clock className="w-5 h-5" />}
                onClick={() => setActiveTab("timecards")}
                className="min-w-[140px]"
              />
            </CarouselRailItem>
            <CarouselRailItem>
              <ActionCard
                title="Benefits"
                icon={<Heart className="w-5 h-5" />}
                onClick={() => setActiveTab("benefits")}
                className="min-w-[140px]"
              />
            </CarouselRailItem>
            <CarouselRailItem>
              <ActionCard
                title="Reports"
                icon={<Download className="w-5 h-5" />}
                onClick={() => setActiveTab("reports")}
                className="min-w-[140px]"
              />
            </CarouselRailItem>
            <CarouselRailItem>
              <ActionCard
                title="Contact"
                icon={<Phone className="w-5 h-5" />}
                onClick={() => setActiveTab("contact")}
                className="min-w-[140px]"
              />
            </CarouselRailItem>
          </CarouselRail>
        </div>

        <BentoGrid cols={3} gap="md">
          <BentoTile span={2}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid grid-cols-7 gap-1 bg-slate-800/50 p-1 h-auto m-4 mb-0" data-testid="tabs-list">
                <TabsTrigger value="profile" className="text-xs px-2 py-2" data-testid="tab-profile">
                  <User className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="pay" className="text-xs px-2 py-2" data-testid="tab-pay">
                  <DollarSign className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Pay</span>
                </TabsTrigger>
                <TabsTrigger value="benefits" className="text-xs px-2 py-2" data-testid="tab-benefits">
                  <Heart className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Benefits</span>
                </TabsTrigger>
                <TabsTrigger value="timecards" className="text-xs px-2 py-2" data-testid="tab-timecards">
                  <Clock className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Time</span>
                </TabsTrigger>
                <TabsTrigger value="rights" className="text-xs px-2 py-2" data-testid="tab-rights">
                  <Scale className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Rights</span>
                </TabsTrigger>
                <TabsTrigger value="reports" className="text-xs px-2 py-2" data-testid="tab-reports">
                  <Download className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Reports</span>
                </TabsTrigger>
                <TabsTrigger value="contact" className="text-xs px-2 py-2" data-testid="tab-contact">
                  <Phone className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Contact</span>
                </TabsTrigger>
              </TabsList>

              <div className="p-4 space-y-4">
                <TabsContent value="profile" className="space-y-4 mt-0">
                  <OrbitCard>
                    <OrbitCardHeader icon={<UserCircle className="w-5 h-5 text-cyan-400" />}>
                      <OrbitCardTitle>Personal Information</OrbitCardTitle>
                      <OrbitCardDescription>Your personal details and employment info</OrbitCardDescription>
                    </OrbitCardHeader>
                    <OrbitCardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400">Full Name</p>
                          <p className="font-medium" data-testid="text-employee-name">{mockEmployeeData.firstName} {mockEmployeeData.lastName}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400">Employee ID</p>
                          <p className="font-medium" data-testid="text-employee-id">{mockEmployeeData.employeeId}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400">Email</p>
                          <p className="font-medium">{mockEmployeeData.email}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400">Phone</p>
                          <p className="font-medium">{mockEmployeeData.phone}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400">Position</p>
                          <p className="font-medium">{mockEmployeeData.position}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400">Department</p>
                          <p className="font-medium">{mockEmployeeData.department}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400">Start Date</p>
                          <p className="font-medium">{mockEmployeeData.startDate}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400">Status</p>
                          <Badge className="bg-green-600/20 text-green-400 border-green-500/30">{mockEmployeeData.status}</Badge>
                        </div>
                      </div>
                      <Separator className="bg-slate-700/50" />
                      <div className="space-y-1">
                        <p className="text-xs text-slate-400">Address</p>
                        <p className="font-medium">{mockEmployeeData.address}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-400">Emergency Contact</p>
                        <p className="font-medium">{mockEmployeeData.emergencyContact}</p>
                      </div>
                    </OrbitCardContent>
                  </OrbitCard>

                  <OrbitCard>
                    <OrbitCardHeader icon={<FileText className="w-5 h-5 text-cyan-400" />}>
                      <OrbitCardTitle>Employee Documents</OrbitCardTitle>
                      <OrbitCardDescription>Access your employment documents</OrbitCardDescription>
                    </OrbitCardHeader>
                    <OrbitCardContent>
                      <div className="space-y-3">
                        {["Employment Agreement", "Non-Disclosure Agreement", "Direct Deposit Authorization", "I-9 Employment Eligibility"].map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-cyan-500/30 transition-all">
                            <div className="flex items-center gap-3">
                              <FileText className="w-4 h-4 text-slate-400" />
                              <span className="text-sm">{doc}</span>
                            </div>
                            <Button variant="ghost" size="sm" data-testid={`button-download-doc-${idx}`}>
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </OrbitCardContent>
                  </OrbitCard>
                </TabsContent>

                <TabsContent value="pay" className="space-y-4 mt-0">
                  <OrbitCard variant="action" hover={false}>
                    <OrbitCardHeader 
                      icon={<DollarSign className="w-5 h-5 text-cyan-400" />}
                      action={<Badge className="bg-cyan-600/20 text-cyan-400 border-cyan-500/30">Dec 6, 2024</Badge>}
                    >
                      <OrbitCardTitle>Upcoming Pay Estimate</OrbitCardTitle>
                      <OrbitCardDescription>Based on your approved hours this pay period</OrbitCardDescription>
                    </OrbitCardHeader>
                    <OrbitCardContent>
                      <BentoGrid cols={4} gap="sm" className="mb-4">
                        <StatCard
                          label="Regular Hours"
                          value="40.0"
                          icon={<Clock className="w-5 h-5" />}
                          data-testid="text-upcoming-regular-hours"
                        />
                        <StatCard
                          label="Overtime Hours"
                          value="4.5"
                          icon={<Timer className="w-5 h-5 text-amber-400" />}
                          className="[&>div>p:last-child]:text-amber-400"
                          data-testid="text-upcoming-overtime-hours"
                        />
                        <StatCard
                          label="Est. Gross Pay"
                          value="$1,469.25"
                          icon={<DollarSign className="w-5 h-5" />}
                          data-testid="text-upcoming-gross"
                        />
                        <StatCard
                          label="Est. Net Pay"
                          value="$1,156.89"
                          icon={<CreditCard className="w-5 h-5 text-green-400" />}
                          className="border-green-500/30 [&>div>p:last-child]:text-green-400"
                          data-testid="text-upcoming-net"
                        />
                      </BentoGrid>
                      <div className="grid grid-cols-3 gap-4 text-center text-sm mb-4">
                        <div className="p-2 rounded bg-slate-900/30">
                          <p className="text-xs text-red-400">Federal Tax</p>
                          <p className="font-medium text-red-300" data-testid="text-upcoming-fed-tax">-$176.31</p>
                        </div>
                        <div className="p-2 rounded bg-slate-900/30">
                          <p className="text-xs text-red-400">State Tax</p>
                          <p className="font-medium text-red-300" data-testid="text-upcoming-state-tax">-$0.00</p>
                        </div>
                        <div className="p-2 rounded bg-slate-900/30">
                          <p className="text-xs text-red-400">FICA (SS + Med)</p>
                          <p className="font-medium text-red-300" data-testid="text-upcoming-fica">-$112.40</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-cyan-900/20 border border-cyan-500/20">
                        <div className="flex items-center gap-2 text-sm text-cyan-300">
                          <Clock className="w-4 h-4" />
                          Pay Period: Nov 25 - Dec 1, 2024
                        </div>
                        <Button size="sm" variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10" data-testid="button-view-detailed-breakdown">
                          View Detailed Breakdown
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </OrbitCardContent>
                  </OrbitCard>

                  <OrbitCard>
                    <OrbitCardHeader icon={<CreditCard className="w-5 h-5 text-green-400" />}>
                      <OrbitCardTitle>Recent Pay Stubs</OrbitCardTitle>
                      <OrbitCardDescription>View and download your pay statements</OrbitCardDescription>
                    </OrbitCardHeader>
                    <OrbitCardContent>
                      <div className="space-y-3">
                        {mockPayStubs.map((stub) => (
                          <div key={stub.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-green-500/30 transition-all" data-testid={`card-paystub-${stub.id}`}>
                            <div>
                              <p className="font-medium">{stub.period}</p>
                              <div className="flex gap-4 mt-1">
                                <span className="text-xs text-slate-400">Gross: <span className="text-white">${stub.grossPay.toFixed(2)}</span></span>
                                <span className="text-xs text-slate-400">Net: <span className="text-green-400">${stub.netPay.toFixed(2)}</span></span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-600/20 text-green-400 border-green-500/30">{stub.status}</Badge>
                              <Button variant="ghost" size="sm" data-testid={`button-download-paystub-${stub.id}`}>
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </OrbitCardContent>
                  </OrbitCard>

                  <OrbitCard>
                    <OrbitCardHeader icon={<FileText className="w-5 h-5 text-amber-400" />}>
                      <OrbitCardTitle>Tax Forms</OrbitCardTitle>
                      <OrbitCardDescription>Access your W-2s, W-4s, and other tax documents</OrbitCardDescription>
                    </OrbitCardHeader>
                    <OrbitCardContent>
                      <div className="space-y-3">
                        {mockTaxForms.map((form) => (
                          <div key={form.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-amber-500/30 transition-all" data-testid={`card-taxform-${form.id}`}>
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                <span className="text-amber-400 font-bold text-sm">{form.type}</span>
                              </div>
                              <div>
                                <p className="font-medium">{form.type} - {form.year}</p>
                                <p className="text-xs text-slate-400">
                                  {form.status === "Current" ? `Updated: ${form.dateUpdated}` : `Available: ${form.dateAvailable}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={form.status === "Current" ? "bg-blue-600/20 text-blue-400 border-blue-500/30" : "bg-green-600/20 text-green-400 border-green-500/30"}>
                                {form.status}
                              </Badge>
                              <Button variant="ghost" size="sm" data-testid={`button-download-taxform-${form.id}`}>
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </OrbitCardContent>
                  </OrbitCard>

                  <OrbitCard>
                    <OrbitCardHeader icon={<TrendingUp className="w-5 h-5 text-purple-400" />}>
                      <OrbitCardTitle>Current Withholdings</OrbitCardTitle>
                    </OrbitCardHeader>
                    <OrbitCardContent>
                      <BentoGrid cols={4} gap="sm">
                        <StatCard label="Federal" value="$186.42" />
                        <StatCard label="State (TN)" value="$0.00" />
                        <StatCard label="Social Security" value="$77.38" />
                        <StatCard label="Medicare" value="$18.10" />
                      </BentoGrid>
                    </OrbitCardContent>
                  </OrbitCard>
                </TabsContent>

                <TabsContent value="benefits" className="space-y-4 mt-0">
                  <OrbitCard variant="action" hover={false}>
                    <OrbitCardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-cyan-400" />
                          <div>
                            <p className="font-medium text-cyan-300">Open Enrollment Period</p>
                            <p className="text-sm text-slate-300">{mockBenefits.openEnrollment.start} - {mockBenefits.openEnrollment.end}</p>
                          </div>
                        </div>
                        <Badge className="bg-cyan-600/30 text-cyan-300 border-cyan-500/30">{mockBenefits.openEnrollment.status}</Badge>
                      </div>
                    </OrbitCardContent>
                  </OrbitCard>

                  <OrbitCard>
                    <OrbitCardHeader icon={<Heart className="w-5 h-5 text-red-400" />}>
                      <OrbitCardTitle>Medical Insurance</OrbitCardTitle>
                    </OrbitCardHeader>
                    <OrbitCardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400">Plan</p>
                          <p className="font-medium">{mockBenefits.medical.plan}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400">Coverage</p>
                          <p className="font-medium">{mockBenefits.medical.coverage}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400">Premium (per pay period)</p>
                          <p className="font-medium">${mockBenefits.medical.premium.toFixed(2)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400">Status</p>
                          <Badge className="bg-green-600/20 text-green-400 border-green-500/30">{mockBenefits.medical.status}</Badge>
                        </div>
                      </div>
                    </OrbitCardContent>
                  </OrbitCard>

                  <BentoGrid cols={2} gap="md">
                    <OrbitCard>
                      <OrbitCardHeader icon={<Shield className="w-4 h-4 text-blue-400" />}>
                        <OrbitCardTitle className="text-base">Dental Insurance</OrbitCardTitle>
                      </OrbitCardHeader>
                      <OrbitCardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-400">Plan</span>
                            <span className="text-sm">{mockBenefits.dental.plan}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-400">Coverage</span>
                            <span className="text-sm">{mockBenefits.dental.coverage}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-400">Premium</span>
                            <span className="text-sm">${mockBenefits.dental.premium.toFixed(2)}</span>
                          </div>
                        </div>
                      </OrbitCardContent>
                    </OrbitCard>

                    <OrbitCard>
                      <OrbitCardHeader icon={<Globe className="w-4 h-4 text-purple-400" />}>
                        <OrbitCardTitle className="text-base">Vision Insurance</OrbitCardTitle>
                      </OrbitCardHeader>
                      <OrbitCardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-400">Plan</span>
                            <span className="text-sm">{mockBenefits.vision.plan}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-400">Coverage</span>
                            <span className="text-sm">{mockBenefits.vision.coverage}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-400">Premium</span>
                            <span className="text-sm">${mockBenefits.vision.premium.toFixed(2)}</span>
                          </div>
                        </div>
                      </OrbitCardContent>
                    </OrbitCard>
                  </BentoGrid>

                  <OrbitCard>
                    <OrbitCardHeader icon={<Briefcase className="w-5 h-5 text-amber-400" />}>
                      <OrbitCardTitle>Workers' Compensation & Indemnity</OrbitCardTitle>
                      <OrbitCardDescription>Coverage information for work-related injuries</OrbitCardDescription>
                    </OrbitCardHeader>
                    <OrbitCardContent>
                      <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-slate-400">Carrier</p>
                            <p className="font-medium">Liberty Mutual Insurance</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Policy Number</p>
                            <p className="font-medium">WC-2024-89745621</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Coverage Type</p>
                            <p className="font-medium">Full Medical + Wage Replacement</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Status</p>
                            <Badge className="bg-green-600/20 text-green-400 border-green-500/30">Active</Badge>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-4">Report any work-related injury immediately to your supervisor.</p>
                      </div>
                    </OrbitCardContent>
                  </OrbitCard>
                </TabsContent>

                <TabsContent value="timecards" className="space-y-4 mt-0">
                  <BentoGrid cols={3} gap="md">
                    <BentoTile span={2} className="p-0">
                      <OrbitCard className="border-0 bg-transparent">
                        <OrbitCardHeader icon={<Clock className="w-5 h-5 text-cyan-400" />}>
                          <OrbitCardTitle>Weekly Time Card</OrbitCardTitle>
                          <OrbitCardDescription>Week of November 25, 2024</OrbitCardDescription>
                        </OrbitCardHeader>
                        <OrbitCardContent>
                          <ScrollArea className="h-[300px]">
                            <div className="space-y-2">
                              {mockTimeCards.map((entry, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700/50" data-testid={`row-timecard-${idx}`}>
                                  <div className="flex items-center gap-4">
                                    <div className="text-center w-12">
                                      <p className="text-xs text-slate-400">{entry.day}</p>
                                      <p className="font-medium text-sm">{entry.date.split(", ")[0].split(" ")[1]}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm">
                                        {entry.clockIn !== "-" ? `${entry.clockIn} - ${entry.clockOut}` : "—"}
                                      </p>
                                      <p className="text-xs text-slate-400">
                                        {entry.hours > 0 ? `${entry.hours} hrs${entry.overtime > 0 ? ` + ${entry.overtime} OT` : ""}` : "—"}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge className={
                                    entry.status === "Approved" ? "bg-green-600/20 text-green-400 border-green-500/30" :
                                    entry.status === "Pending" ? "bg-amber-600/20 text-amber-400 border-amber-500/30" :
                                    entry.status === "Holiday" ? "bg-purple-600/20 text-purple-400 border-purple-500/30" :
                                    "bg-slate-600/20 text-slate-400 border-slate-500/30"
                                  }>
                                    {entry.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                          <div className="mt-4 pt-4 border-t border-slate-700/50">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Total Regular Hours</span>
                              <span className="font-bold">24.0 hrs</span>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-slate-400">Total Overtime</span>
                              <span className="font-bold text-amber-400">1.5 hrs</span>
                            </div>
                          </div>
                        </OrbitCardContent>
                      </OrbitCard>
                    </BentoTile>
                    <BentoTile className="p-0">
                      <OrbitCard className="border-0 bg-transparent h-full">
                        <OrbitCardHeader icon={<CalendarIcon className="w-4 h-4 text-cyan-400" />}>
                          <OrbitCardTitle className="text-base">Select Week</OrbitCardTitle>
                        </OrbitCardHeader>
                        <OrbitCardContent>
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md"
                            data-testid="calendar-timecard"
                          />
                        </OrbitCardContent>
                      </OrbitCard>
                    </BentoTile>
                  </BentoGrid>
                </TabsContent>

                <TabsContent value="rights" className="space-y-4 mt-0">
                  <OrbitCard>
                    <OrbitCardHeader icon={<Scale className="w-5 h-5 text-cyan-400" />}>
                      <OrbitCardTitle>{mockWorkersRights.state} Workers' Rights</OrbitCardTitle>
                      <OrbitCardDescription>Know your rights as an employee in {mockWorkersRights.state}</OrbitCardDescription>
                    </OrbitCardHeader>
                    <OrbitCardContent className="space-y-6">
                      <div>
                        <h4 className="font-medium flex items-center gap-2 mb-3">
                          <Coffee className="w-4 h-4 text-amber-400" />
                          Break Requirements
                        </h4>
                        <div className="space-y-3">
                          {mockWorkersRights.breakRequirements.map((req, idx) => (
                            <div key={idx} className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
                              <p className="font-medium text-sm">{req.type}</p>
                              <p className="text-xs text-slate-400 mt-1">{req.duration}</p>
                              <p className="text-xs text-slate-500 mt-1">{req.paid}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator className="bg-slate-700/50" />

                      <div>
                        <h4 className="font-medium flex items-center gap-2 mb-3">
                          <Timer className="w-4 h-4 text-purple-400" />
                          Overtime Rules
                        </h4>
                        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-slate-400">Threshold</p>
                              <p className="font-medium">{mockWorkersRights.overtimeRules.threshold}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Rate</p>
                              <p className="font-medium text-green-400">{mockWorkersRights.overtimeRules.rate}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Exemptions</p>
                              <p className="font-medium text-xs">{mockWorkersRights.overtimeRules.exemptions}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-slate-700/50" />

                      <div>
                        <h4 className="font-medium flex items-center gap-2 mb-3">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          Minimum Wage
                        </h4>
                        <p className="text-lg font-bold">{mockWorkersRights.minimumWage}</p>
                      </div>

                      <Separator className="bg-slate-700/50" />

                      <div>
                        <h4 className="font-medium flex items-center gap-2 mb-3">
                          <Shield className="w-4 h-4 text-blue-400" />
                          Workplace Safety Rights
                        </h4>
                        <div className="space-y-2">
                          {mockWorkersRights.safetyRights.map((right, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-slate-300">{right}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </OrbitCardContent>
                  </OrbitCard>

                  <ActionCard
                    title="Tennessee Department of Labor"
                    description="Official state labor resources"
                    icon={<ExternalLink className="w-5 h-5" />}
                    onClick={() => window.open('https://www.tn.gov/workforce.html', '_blank')}
                  />
                </TabsContent>

                <TabsContent value="reports" className="space-y-4 mt-0">
                  <OrbitCard>
                    <OrbitCardHeader icon={<Download className="w-5 h-5 text-cyan-400" />}>
                      <OrbitCardTitle>Self-Service Reports</OrbitCardTitle>
                      <OrbitCardDescription>Download reports for your records</OrbitCardDescription>
                    </OrbitCardHeader>
                    <OrbitCardContent>
                      <div className="space-y-3">
                        {mockReports.map((report) => (
                          <div key={report.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-cyan-500/30 transition-all" data-testid={`card-report-${report.id}`}>
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-cyan-400" />
                              </div>
                              <div>
                                <p className="font-medium">{report.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">{report.type}</Badge>
                                  <span className="text-xs text-slate-400">{report.format}</span>
                                </div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="gap-2" data-testid={`button-download-report-${report.id}`}>
                              <Download className="w-4 h-4" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </OrbitCardContent>
                  </OrbitCard>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4 mt-0">
                  <OrbitCard>
                    <OrbitCardHeader icon={<Building2 className="w-5 h-5 text-cyan-400" />}>
                      <OrbitCardTitle>Employer Contact Information</OrbitCardTitle>
                    </OrbitCardHeader>
                    <OrbitCardContent className="space-y-4">
                      <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-600/10 to-blue-600/10 border border-cyan-500/30">
                        <h3 className="font-bold text-lg text-cyan-300" data-testid="text-company-name">{mockEmployerData.companyName}</h3>
                        <p className="text-sm text-slate-300 mt-1">{mockEmployerData.address}</p>
                      </div>

                      <BentoGrid cols={2} gap="md">
                        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                          <p className="text-xs text-slate-400 mb-2">Your Manager</p>
                          <p className="font-medium text-lg">{mockEmployerData.managerName}</p>
                          <div className="mt-3 space-y-2">
                            <a href={`tel:${mockEmployerData.managerPhone}`} className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300">
                              <Phone className="w-4 h-4" />
                              {mockEmployerData.managerPhone}
                            </a>
                            <a href={`mailto:${mockEmployerData.managerEmail}`} className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300">
                              <Mail className="w-4 h-4" />
                              {mockEmployerData.managerEmail}
                            </a>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                          <p className="text-xs text-slate-400 mb-2">Human Resources</p>
                          <p className="font-medium text-lg">HR Department</p>
                          <div className="mt-3">
                            <a href={`mailto:${mockEmployerData.hrEmail}`} className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300">
                              <Mail className="w-4 h-4" />
                              {mockEmployerData.hrEmail}
                            </a>
                          </div>
                        </div>
                      </BentoGrid>

                      <Button className="w-full bg-cyan-600 hover:bg-cyan-700" data-testid="button-send-message">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send Direct Message
                      </Button>
                    </OrbitCardContent>
                  </OrbitCard>
                </TabsContent>
              </div>
            </Tabs>
          </BentoTile>

          <BentoTile className="space-y-4 p-4">
            <OrbitCard variant="action" hover={false}>
              <OrbitCardHeader icon={<Building2 className="w-5 h-5 text-cyan-300" />}>
                <OrbitCardTitle className="text-cyan-300">Contact Your Employer</OrbitCardTitle>
              </OrbitCardHeader>
              <OrbitCardContent className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400">Company</p>
                  <p className="font-bold text-lg text-white" data-testid="sidebar-company-name">{mockEmployerData.companyName}</p>
                </div>
                <Separator className="bg-cyan-500/20" />
                <div>
                  <p className="text-xs text-slate-400">Your Manager</p>
                  <p className="font-medium" data-testid="sidebar-manager-name">{mockEmployerData.managerName}</p>
                  <a href={`tel:${mockEmployerData.managerPhone}`} className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 mt-1" data-testid="link-manager-phone">
                    <Phone className="w-3 h-3" />
                    {mockEmployerData.managerPhone}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <a href={`mailto:${mockEmployerData.managerEmail}`} className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300" data-testid="link-manager-email">
                    <Mail className="w-3 h-3" />
                    {mockEmployerData.managerEmail}
                  </a>
                </div>
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700 mt-2" data-testid="button-sidebar-message">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Direct Message
                </Button>
              </OrbitCardContent>
            </OrbitCard>

            <OrbitCard>
              <OrbitCardHeader icon={<CheckCircle2 className="w-4 h-4 text-green-400" />}>
                <OrbitCardTitle className="text-base">Quick Status</OrbitCardTitle>
              </OrbitCardHeader>
              <OrbitCardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Employment</span>
                  <Badge className="bg-green-600/20 text-green-400 border-green-500/30">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Benefits</span>
                  <Badge className="bg-green-600/20 text-green-400 border-green-500/30">Enrolled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Direct Deposit</span>
                  <Badge className="bg-green-600/20 text-green-400 border-green-500/30">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Tax Forms</span>
                  <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30">Current</Badge>
                </div>
              </OrbitCardContent>
            </OrbitCard>

            <OrbitCard>
              <OrbitCardHeader icon={<MapPin className="w-4 h-4 text-cyan-400" />}>
                <OrbitCardTitle className="text-base">Current Assignment</OrbitCardTitle>
              </OrbitCardHeader>
              <OrbitCardContent>
                <p className="font-medium">TechCorp Warehouse A</p>
                <p className="text-sm text-slate-400">123 Industrial Pkwy</p>
                <p className="text-sm text-slate-400">Nashville, TN 37210</p>
                <div className="flex gap-2 mt-3">
                  <Badge variant="outline">Forklift Operator</Badge>
                </div>
              </OrbitCardContent>
            </OrbitCard>
          </BentoTile>
        </BentoGrid>
      </div>
    </Shell>
  );
}
