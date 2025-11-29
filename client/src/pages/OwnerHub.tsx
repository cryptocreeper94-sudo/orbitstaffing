import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Building2,
  Users,
  FileText,
  BarChart3,
  Shield,
  Heart,
  ChevronLeft,
  Search,
  Phone,
  Mail,
  Eye,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Settings,
  User,
  DollarSign,
  FileCheck,
  AlertCircle,
  Cloud,
  MapPin,
  Filter,
  RefreshCw,
  Printer,
  Award,
  ShieldCheck,
  ClipboardCheck,
  FileWarning,
  CalendarDays,
  UserCheck,
  Briefcase,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Shell } from "@/components/layout/Shell";
import { Separator } from "@/components/ui/separator";
import { ReceiptScanner } from "@/components/ReceiptScanner";
import { Receipt } from "lucide-react";

interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  status: "active" | "onLeave" | "terminated" | "pending";
  hireDate: string;
  photoUrl?: string;
  complianceStatus: "compliant" | "pending" | "expired";
  insuranceEnrolled: boolean;
  lastClockIn?: string;
}

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  ein: string;
  industry: string;
  employeeCount: number;
  complianceScore: number;
  insuranceProvider: string;
  nextOpenEnrollment: string;
}

interface ComplianceItem {
  id: number;
  employeeId: number;
  employeeName: string;
  type: string;
  status: "completed" | "pending" | "expired";
  dueDate: string;
  completedDate?: string;
}

interface InsurancePlan {
  id: number;
  name: string;
  type: string;
  enrolledCount: number;
  monthlyCost: number;
}

const mockEmployees: Employee[] = [
  { id: 1, name: "Sarah Johnson", email: "sarah.johnson@company.com", phone: "(615) 555-0101", position: "Project Manager", department: "Operations", status: "active", hireDate: "2022-03-15", complianceStatus: "compliant", insuranceEnrolled: true, lastClockIn: "2024-11-28 08:00" },
  { id: 2, name: "Michael Chen", email: "michael.chen@company.com", phone: "(615) 555-0102", position: "Software Developer", department: "Engineering", status: "active", hireDate: "2021-08-20", complianceStatus: "compliant", insuranceEnrolled: true, lastClockIn: "2024-11-28 08:15" },
  { id: 3, name: "Emily Rodriguez", email: "emily.rodriguez@company.com", phone: "(615) 555-0103", position: "HR Specialist", department: "Human Resources", status: "active", hireDate: "2023-01-10", complianceStatus: "pending", insuranceEnrolled: true },
  { id: 4, name: "David Thompson", email: "david.thompson@company.com", phone: "(615) 555-0104", position: "Sales Representative", department: "Sales", status: "onLeave", hireDate: "2020-06-01", complianceStatus: "compliant", insuranceEnrolled: true },
  { id: 5, name: "Jessica Williams", email: "jessica.williams@company.com", phone: "(615) 555-0105", position: "Accountant", department: "Finance", status: "active", hireDate: "2022-11-28", complianceStatus: "expired", insuranceEnrolled: false },
  { id: 6, name: "Robert Martinez", email: "robert.martinez@company.com", phone: "(615) 555-0106", position: "Warehouse Manager", department: "Operations", status: "active", hireDate: "2019-04-12", complianceStatus: "compliant", insuranceEnrolled: true, lastClockIn: "2024-11-28 07:45" },
  { id: 7, name: "Amanda Foster", email: "amanda.foster@company.com", phone: "(615) 555-0107", position: "Customer Service", department: "Support", status: "pending", hireDate: "2024-11-15", complianceStatus: "pending", insuranceEnrolled: false },
  { id: 8, name: "James Wilson", email: "james.wilson@company.com", phone: "(615) 555-0108", position: "Marketing Coordinator", department: "Marketing", status: "active", hireDate: "2023-05-22", complianceStatus: "compliant", insuranceEnrolled: true },
];

const mockCompanyInfo: CompanyInfo = {
  name: "ORBIT Staffing Solutions",
  address: "123 Business Center Dr, Nashville, TN 37201",
  phone: "(615) 555-0100",
  email: "contact@orbitstaffing.com",
  ein: "XX-XXXXXXX",
  industry: "Staffing & Recruitment",
  employeeCount: 8,
  complianceScore: 87,
  insuranceProvider: "BlueCross BlueShield TN",
  nextOpenEnrollment: "2025-01-15",
};

const mockComplianceItems: ComplianceItem[] = [
  { id: 1, employeeId: 1, employeeName: "Sarah Johnson", type: "Background Check", status: "completed", dueDate: "2024-12-15", completedDate: "2024-11-20" },
  { id: 2, employeeId: 2, employeeName: "Michael Chen", type: "I-9 Verification", status: "completed", dueDate: "2024-11-30", completedDate: "2024-11-01" },
  { id: 3, employeeId: 3, employeeName: "Emily Rodriguez", type: "Safety Training", status: "pending", dueDate: "2024-12-01" },
  { id: 4, employeeId: 5, employeeName: "Jessica Williams", type: "Drug Test", status: "expired", dueDate: "2024-11-15" },
  { id: 5, employeeId: 7, employeeName: "Amanda Foster", type: "Onboarding Docs", status: "pending", dueDate: "2024-12-05" },
  { id: 6, employeeId: 4, employeeName: "David Thompson", type: "Annual Review", status: "completed", dueDate: "2024-10-30", completedDate: "2024-10-28" },
];

const mockInsurancePlans: InsurancePlan[] = [
  { id: 1, name: "Premium Health Plus", type: "Medical", enrolledCount: 5, monthlyCost: 450 },
  { id: 2, name: "Basic Dental", type: "Dental", enrolledCount: 6, monthlyCost: 45 },
  { id: 3, name: "Vision Care", type: "Vision", enrolledCount: 4, monthlyCost: 15 },
  { id: 4, name: "401(k) Match", type: "Retirement", enrolledCount: 7, monthlyCost: 0 },
];

function getStatusBadge(status: Employee["status"]) {
  const styles = {
    active: "bg-green-600/20 text-green-300 border-green-500/30",
    onLeave: "bg-amber-600/20 text-amber-300 border-amber-500/30",
    terminated: "bg-red-600/20 text-red-300 border-red-500/30",
    pending: "bg-blue-600/20 text-blue-300 border-blue-500/30",
  };
  const labels = {
    active: "Active",
    onLeave: "On Leave",
    terminated: "Terminated",
    pending: "Pending",
  };
  return <Badge className={styles[status]}>{labels[status]}</Badge>;
}

function getComplianceBadge(status: ComplianceItem["status"]) {
  const styles = {
    completed: "bg-green-600/20 text-green-300 border-green-500/30",
    pending: "bg-amber-600/20 text-amber-300 border-amber-500/30",
    expired: "bg-red-600/20 text-red-300 border-red-500/30",
  };
  return <Badge className={styles[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
}

function StatCard({ icon: Icon, label, value, subtext, color, testId }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
  testId: string;
}) {
  return (
    <Card className="bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/30 transition-all" data-testid={testId}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-sm mb-1">{label}</p>
            <p className="text-3xl font-bold text-white" data-testid={`${testId}-value`}>{value}</p>
            {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WeatherVerificationWidget() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState("37201");
  const [weather, setWeather] = useState<{
    temperature: number;
    condition: string;
    humidity: number;
    precipitation: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async () => {
    setLoading(true);
    const zipCoords: Record<string, [number, number, string]> = {
      '37201': [36.1627, -86.7816, 'Nashville, TN'],
      '90210': [34.0901, -118.4065, 'Beverly Hills, CA'],
      '10001': [40.7505, -73.9972, 'New York, NY'],
      '60601': [41.8842, -87.6188, 'Chicago, IL'],
      '98101': [47.6062, -122.3321, 'Seattle, WA'],
    };
    
    try {
      const coords = zipCoords[location] || zipCoords['37201'];
      const [lat, lon] = coords;
      
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto&start_date=${date}&end_date=${date}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.daily) {
          const code = data.daily.weather_code[0];
          let condition = "Clear";
          if (code >= 1 && code <= 3) condition = "Partly Cloudy";
          if (code >= 45 && code <= 48) condition = "Foggy";
          if (code >= 51 && code <= 67) condition = "Rain";
          if (code >= 71 && code <= 86) condition = "Snow";
          
          setWeather({
            temperature: Math.round((data.daily.temperature_2m_max[0] + data.daily.temperature_2m_min[0]) / 2),
            condition,
            humidity: 65,
            precipitation: data.daily.precipitation_sum[0] || 0,
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch weather:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Cloud className="w-5 h-5 text-cyan-400" />
          Weather Verification
        </CardTitle>
        <CardDescription className="text-slate-400">
          Check historical weather for any date/location for time card verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-400 text-sm">Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              data-testid="input-weather-date"
            />
          </div>
          <div>
            <Label className="text-slate-400 text-sm">ZIP Code</Label>
            <Input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value.slice(0, 5))}
              placeholder="Enter ZIP"
              maxLength={5}
              className="bg-slate-700 border-slate-600 text-white"
              data-testid="input-weather-location"
            />
          </div>
        </div>
        <Button
          onClick={fetchWeather}
          disabled={loading}
          className="w-full bg-cyan-600 hover:bg-cyan-700"
          data-testid="button-check-weather"
        >
          {loading ? "Checking..." : "Check Weather"}
        </Button>
        
        {weather && (
          <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Temperature</span>
              <span className="text-white font-bold">{weather.temperature}°C</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Condition</span>
              <span className="text-white">{weather.condition}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Precipitation</span>
              <span className={weather.precipitation > 0 ? "text-blue-400" : "text-white"}>
                {weather.precipitation.toFixed(1)} mm
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmployeeCard({ employee, onViewFile, onQuickAction }: {
  employee: Employee;
  onViewFile: (emp: Employee) => void;
  onQuickAction: (emp: Employee, action: string) => void;
}) {
  return (
    <Card className="bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/40 transition-all" data-testid={`card-employee-${employee.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {employee.name.split(' ').map(n => n[0]).join('')}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="text-white font-semibold truncate" data-testid={`text-employee-name-${employee.id}`}>
                {employee.name}
              </h3>
              {getStatusBadge(employee.status)}
            </div>
            
            <p className="text-slate-400 text-sm mb-2">{employee.position} • {employee.department}</p>
            
            <div className="space-y-1">
              <a
                href={`tel:${employee.phone}`}
                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
                data-testid={`link-phone-${employee.id}`}
              >
                <Phone className="w-4 h-4" />
                {employee.phone}
              </a>
              <a
                href={`mailto:${employee.email}`}
                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm transition-colors truncate"
                data-testid={`link-email-${employee.id}`}
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{employee.email}</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-700/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewFile(employee)}
            className="text-slate-400 hover:text-cyan-400 flex-1"
            data-testid={`button-view-file-${employee.id}`}
          >
            <Eye className="w-4 h-4 mr-1" />
            View File
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onQuickAction(employee, "message")}
            className="text-slate-400 hover:text-cyan-400"
            data-testid={`button-message-${employee.id}`}
          >
            <Mail className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onQuickAction(employee, "call")}
            className="text-slate-400 hover:text-green-400"
            data-testid={`button-call-${employee.id}`}
          >
            <Phone className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OwnerHub() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeFileOpen, setEmployeeFileOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportType, setReportType] = useState("timecard");
  const [reportEmployee, setReportEmployee] = useState<string>("all");
  const [reportDateFrom, setReportDateFrom] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [reportDateTo, setReportDateTo] = useState(new Date().toISOString().split('T')[0]);

  const filteredEmployees = mockEmployees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.phone.includes(searchQuery) ||
      emp.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewFile = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEmployeeFileOpen(true);
  };

  const handleQuickAction = (employee: Employee, action: string) => {
    if (action === "call") {
      window.location.href = `tel:${employee.phone}`;
    } else if (action === "message") {
      window.location.href = `mailto:${employee.email}`;
    }
  };

  const generateReport = () => {
    console.log(`Generating ${reportType} report for ${reportEmployee} from ${reportDateFrom} to ${reportDateTo}`);
    setReportDialogOpen(false);
  };

  const complianceStats = {
    compliant: mockComplianceItems.filter(c => c.status === "completed").length,
    pending: mockComplianceItems.filter(c => c.status === "pending").length,
    expired: mockComplianceItems.filter(c => c.status === "expired").length,
  };

  return (
    <Shell>
      <div className="min-h-screen bg-slate-900" data-testid="owner-hub-page">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="text-slate-400 hover:text-white"
              data-testid="button-back"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Building2 className="w-8 h-8 text-cyan-400" />
                Owner Hub
              </h1>
              <p className="text-slate-400 mt-1">Complete business management dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              data-testid="button-refresh"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              className="bg-cyan-600 hover:bg-cyan-700"
              data-testid="button-settings"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700/50 p-1 flex-wrap h-auto gap-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-slate-400"
              data-testid="tab-overview"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Company Overview
            </TabsTrigger>
            <TabsTrigger
              value="employees"
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-slate-400"
              data-testid="tab-employees"
            >
              <Users className="w-4 h-4 mr-2" />
              All Employees
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-slate-400"
              data-testid="tab-files"
            >
              <FileText className="w-4 h-4 mr-2" />
              Employee Files
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-slate-400"
              data-testid="tab-reports"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Reports Center
            </TabsTrigger>
            <TabsTrigger
              value="insurance"
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-slate-400"
              data-testid="tab-insurance"
            >
              <Heart className="w-4 h-4 mr-2" />
              Insurance Admin
            </TabsTrigger>
            <TabsTrigger
              value="compliance"
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-slate-400"
              data-testid="tab-compliance"
            >
              <Shield className="w-4 h-4 mr-2" />
              Compliance
            </TabsTrigger>
            <TabsTrigger
              value="receipts"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-slate-400"
              data-testid="tab-receipts"
            >
              <Receipt className="w-4 h-4 mr-2" />
              Receipts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Users}
                label="Total Employees"
                value={mockCompanyInfo.employeeCount}
                subtext="Active workforce"
                color="bg-cyan-600"
                testId="stat-employees"
              />
              <StatCard
                icon={CheckCircle2}
                label="Compliance Score"
                value={`${mockCompanyInfo.complianceScore}%`}
                subtext="Overall rating"
                color="bg-green-600"
                testId="stat-compliance"
              />
              <StatCard
                icon={Heart}
                label="Insurance Enrolled"
                value={mockEmployees.filter(e => e.insuranceEnrolled).length}
                subtext="Employees covered"
                color="bg-pink-600"
                testId="stat-insurance"
              />
              <StatCard
                icon={AlertTriangle}
                label="Pending Items"
                value={complianceStats.pending + complianceStats.expired}
                subtext="Requires attention"
                color="bg-amber-600"
                testId="stat-pending"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-cyan-400" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-400 text-xs">Company Name</Label>
                      <p className="text-white font-medium">{mockCompanyInfo.name}</p>
                    </div>
                    <div>
                      <Label className="text-slate-400 text-xs">Industry</Label>
                      <p className="text-white">{mockCompanyInfo.industry}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-slate-400 text-xs">Address</Label>
                      <p className="text-white">{mockCompanyInfo.address}</p>
                    </div>
                    <div>
                      <Label className="text-slate-400 text-xs">Phone</Label>
                      <a href={`tel:${mockCompanyInfo.phone}`} className="text-cyan-400 hover:text-cyan-300 block">
                        {mockCompanyInfo.phone}
                      </a>
                    </div>
                    <div>
                      <Label className="text-slate-400 text-xs">Email</Label>
                      <a href={`mailto:${mockCompanyInfo.email}`} className="text-cyan-400 hover:text-cyan-300 block truncate">
                        {mockCompanyInfo.email}
                      </a>
                    </div>
                    <div>
                      <Label className="text-slate-400 text-xs">EIN</Label>
                      <p className="text-white">{mockCompanyInfo.ein}</p>
                    </div>
                    <div>
                      <Label className="text-slate-400 text-xs">Insurance Provider</Label>
                      <p className="text-white">{mockCompanyInfo.insuranceProvider}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <WeatherVerificationWidget />
            </div>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockEmployees.filter(e => e.lastClockIn).slice(0, 4).map((emp) => (
                    <div key={emp.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{emp.name}</p>
                          <p className="text-slate-400 text-xs">Clocked in</p>
                        </div>
                      </div>
                      <span className="text-slate-400 text-sm">{emp.lastClockIn}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    All Employees ({filteredEmployees.length})
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Search employees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-slate-700 border-slate-600 text-white w-64"
                        data-testid="input-search-employees"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-36 bg-slate-700 border-slate-600 text-white" data-testid="select-status-filter">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="onLeave">On Leave</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="terminated">Terminated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredEmployees.map((employee) => (
                      <EmployeeCard
                        key={employee.id}
                        employee={employee}
                        onViewFile={handleViewFile}
                        onQuickAction={handleQuickAction}
                      />
                    ))}
                    {filteredEmployees.length === 0 && (
                      <div className="col-span-2 text-center py-12 text-slate-400">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No employees found matching your criteria</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  Employee Files
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Click on any employee to view their complete file including documents, pay history, and more
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {mockEmployees.map((employee) => (
                      <div
                        key={employee.id}
                        onClick={() => handleViewFile(employee)}
                        className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors"
                        data-testid={`file-row-${employee.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-white font-medium">{employee.name}</p>
                            <p className="text-slate-400 text-sm">{employee.position} • Hired {new Date(employee.hireDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(employee.status)}
                          <Eye className="w-5 h-5 text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                    Generate Reports
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Create custom reports for employees, time cards, and payroll
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-slate-400 text-sm">Report Type</Label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white" data-testid="select-report-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="timecard">Time Cards</SelectItem>
                        <SelectItem value="payroll">Payroll Summary</SelectItem>
                        <SelectItem value="attendance">Attendance Report</SelectItem>
                        <SelectItem value="compliance">Compliance Status</SelectItem>
                        <SelectItem value="insurance">Insurance Enrollment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-slate-400 text-sm">Employee</Label>
                    <Select value={reportEmployee} onValueChange={setReportEmployee}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white" data-testid="select-report-employee">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all">All Employees</SelectItem>
                        {mockEmployees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id.toString()}>{emp.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-400 text-sm">From Date</Label>
                      <Input
                        type="date"
                        value={reportDateFrom}
                        onChange={(e) => setReportDateFrom(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                        data-testid="input-report-from"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-400 text-sm">To Date</Label>
                      <Input
                        type="date"
                        value={reportDateTo}
                        onChange={(e) => setReportDateTo(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                        data-testid="input-report-to"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={generateReport}
                      className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                      data-testid="button-generate-report"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                    <Button
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      data-testid="button-print-report"
                    >
                      <Printer className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    Quick Reports
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                    data-testid="button-quick-weekly"
                  >
                    <Calendar className="w-4 h-4 mr-3 text-cyan-400" />
                    Weekly Time Card Summary
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                    data-testid="button-quick-payroll"
                  >
                    <DollarSign className="w-4 h-4 mr-3 text-green-400" />
                    Current Payroll Report
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                    data-testid="button-quick-compliance"
                  >
                    <Shield className="w-4 h-4 mr-3 text-amber-400" />
                    Compliance Status Report
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                    data-testid="button-quick-attendance"
                  >
                    <UserCheck className="w-4 h-4 mr-3 text-purple-400" />
                    Attendance Summary
                  </Button>
                </CardContent>
              </Card>
            </div>

            <WeatherVerificationWidget />
          </TabsContent>

          <TabsContent value="insurance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                icon={Heart}
                label="Total Enrolled"
                value={mockEmployees.filter(e => e.insuranceEnrolled).length}
                subtext={`of ${mockEmployees.length} employees`}
                color="bg-pink-600"
                testId="stat-enrolled"
              />
              <StatCard
                icon={CreditCard}
                label="Monthly Premium"
                value="$3,825"
                subtext="Total company cost"
                color="bg-green-600"
                testId="stat-premium"
              />
              <StatCard
                icon={Calendar}
                label="Open Enrollment"
                value={new Date(mockCompanyInfo.nextOpenEnrollment).toLocaleDateString()}
                subtext="Next enrollment period"
                color="bg-blue-600"
                testId="stat-enrollment-date"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-400" />
                    Insurance Plans
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockInsurancePlans.map((plan) => (
                      <div key={plan.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{plan.name}</p>
                          <p className="text-slate-400 text-sm">{plan.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-cyan-400 font-bold">{plan.enrolledCount} enrolled</p>
                          <p className="text-slate-400 text-sm">
                            {plan.monthlyCost > 0 ? `$${plan.monthlyCost}/mo` : 'Company Match'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    Employee Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {mockEmployees.map((emp) => (
                        <div key={emp.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                              {emp.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-white">{emp.name}</span>
                          </div>
                          <Badge className={emp.insuranceEnrolled ? "bg-green-600/20 text-green-300 border-green-500/30" : "bg-slate-600/20 text-slate-400 border-slate-500/30"}>
                            {emp.insuranceEnrolled ? "Enrolled" : "Not Enrolled"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-pink-900/30 to-purple-900/30 border-pink-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Open Enrollment Starting Soon</h3>
                    <p className="text-slate-300">
                      Next open enrollment period begins {new Date(mockCompanyInfo.nextOpenEnrollment).toLocaleDateString()}. 
                      Prepare your team for benefits selection.
                    </p>
                  </div>
                  <Button className="bg-pink-600 hover:bg-pink-700" data-testid="button-manage-enrollment">
                    Manage Enrollment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                icon={CheckCircle2}
                label="Completed"
                value={complianceStats.compliant}
                subtext="All requirements met"
                color="bg-green-600"
                testId="stat-compliant"
              />
              <StatCard
                icon={Clock}
                label="Pending"
                value={complianceStats.pending}
                subtext="Awaiting completion"
                color="bg-amber-600"
                testId="stat-compliance-pending"
              />
              <StatCard
                icon={AlertCircle}
                label="Expired"
                value={complianceStats.expired}
                subtext="Requires immediate action"
                color="bg-red-600"
                testId="stat-expired"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    Items Requiring Attention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {mockComplianceItems
                        .filter(item => item.status !== "completed")
                        .map((item) => (
                          <div key={item.id} className="p-4 bg-slate-700/30 rounded-lg border-l-4 border-l-amber-500">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-medium">{item.employeeName}</span>
                              {getComplianceBadge(item.status)}
                            </div>
                            <p className="text-slate-400 text-sm">{item.type}</p>
                            <p className="text-slate-500 text-xs mt-1">
                              Due: {new Date(item.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-400" />
                    Recent Completions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {mockComplianceItems
                        .filter(item => item.status === "completed")
                        .map((item) => (
                          <div key={item.id} className="p-4 bg-slate-700/30 rounded-lg border-l-4 border-l-green-500">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-medium">{item.employeeName}</span>
                              {getComplianceBadge(item.status)}
                            </div>
                            <p className="text-slate-400 text-sm">{item.type}</p>
                            <p className="text-green-400 text-xs mt-1">
                              Completed: {item.completedDate && new Date(item.completedDate).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-cyan-400" />
                  Compliance Tracking by Employee
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockEmployees.map((emp) => {
                    const empCompliance = mockComplianceItems.filter(c => c.employeeId === emp.id);
                    const completedCount = empCompliance.filter(c => c.status === "completed").length;
                    const totalCount = empCompliance.length || 1;
                    const percentage = Math.round((completedCount / totalCount) * 100);
                    
                    return (
                      <div key={emp.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                            {emp.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <span className="text-white">{emp.name}</span>
                            <p className="text-slate-400 text-xs">{emp.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-slate-600 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${percentage === 100 ? 'bg-green-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${percentage === 100 ? 'text-green-400' : percentage >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="receipts" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-green-400" />
                  Business Expense Scanner
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Scan gas receipts, office supplies, and business expenses for tax deductions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReceiptScanner />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={employeeFileOpen} onOpenChange={setEmployeeFileOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-white">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  {selectedEmployee?.name.split(' ').map(n => n[0]).join('')}
                </div>
                {selectedEmployee?.name}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Complete employee file and records
              </DialogDescription>
            </DialogHeader>
            
            {selectedEmployee && (
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-400 text-xs">Position</Label>
                    <p className="text-white">{selectedEmployee.position}</p>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs">Department</Label>
                    <p className="text-white">{selectedEmployee.department}</p>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedEmployee.status)}</div>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs">Hire Date</Label>
                    <p className="text-white">{new Date(selectedEmployee.hireDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-cyan-400" />
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-400 text-xs">Phone</Label>
                      <a href={`tel:${selectedEmployee.phone}`} className="text-cyan-400 hover:text-cyan-300 block">
                        {selectedEmployee.phone}
                      </a>
                    </div>
                    <div>
                      <Label className="text-slate-400 text-xs">Email</Label>
                      <a href={`mailto:${selectedEmployee.email}`} className="text-cyan-400 hover:text-cyan-300 block truncate">
                        {selectedEmployee.email}
                      </a>
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    Documents
                  </h4>
                  <div className="space-y-2">
                    {["W-4 Form", "I-9 Verification", "Direct Deposit", "Emergency Contact", "Signed Handbook"].map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <span className="text-slate-300">{doc}</span>
                        <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    Pay Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-700/30 rounded-lg">
                      <Label className="text-slate-400 text-xs">Current Pay Rate</Label>
                      <p className="text-green-400 font-bold">$25.00/hr</p>
                    </div>
                    <div className="p-3 bg-slate-700/30 rounded-lg">
                      <Label className="text-slate-400 text-xs">YTD Earnings</Label>
                      <p className="text-green-400 font-bold">$52,000.00</p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-400" />
                    Compliance Status
                  </h4>
                  <Badge className={
                    selectedEmployee.complianceStatus === "compliant" ? "bg-green-600/20 text-green-300" :
                    selectedEmployee.complianceStatus === "pending" ? "bg-amber-600/20 text-amber-300" :
                    "bg-red-600/20 text-red-300"
                  }>
                    {selectedEmployee.complianceStatus.charAt(0).toUpperCase() + selectedEmployee.complianceStatus.slice(1)}
                  </Badge>
                </div>
              </div>
            )}
            
            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setEmployeeFileOpen(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Close
              </Button>
              <Button className="bg-cyan-600 hover:bg-cyan-700" data-testid="button-edit-employee">
                Edit Employee
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Shell>
  );
}
