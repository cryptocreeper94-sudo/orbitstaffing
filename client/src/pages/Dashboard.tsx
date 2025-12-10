import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { useLocation } from 'wouter';
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { 
  Users, 
  DollarSign, 
  Briefcase, 
  TrendingUp, 
  Shield,
  Clock,
  BarChart3,
  Settings,
  MoreHorizontal,
  ChevronRight,
  Sparkles,
  Zap,
  FileCheck,
  UserCheck,
  MapPin,
  Phone,
  Building2,
  Receipt,
  ClipboardList,
  Calendar,
  AlertTriangle,
  Fingerprint,
  FileText,
  PieChart,
  Target,
  Wallet,
  CreditCard,
  Globe,
  Lock,
  HelpCircle,
  Plus,
  ArrowRight,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTutorial, PageTutorialContent } from "@/components/PageTutorial";

interface CategoryItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  description?: string;
}

const categories: { id: string; title: string; icon: React.ReactNode; color: string; items: CategoryItem[] }[] = [
  {
    id: "operations",
    title: "Core Operations",
    icon: <Zap className="w-5 h-5" />,
    color: "cyan",
    items: [
      { label: "Talent Pool", path: "/talent-pool", icon: <Users className="w-4 h-4" />, description: "Manage workers" },
      { label: "Work Orders", path: "/work-orders", icon: <ClipboardList className="w-4 h-4" />, description: "Client requests" },
      { label: "Scheduling", path: "/shift-scheduling", icon: <Calendar className="w-4 h-4" />, description: "Shift management" },
      { label: "Timesheet Approval", path: "/timesheet-approval", icon: <Clock className="w-4 h-4" />, description: "Review hours" },
      { label: "GPS Clock-In", path: "/gps-clockin", icon: <MapPin className="w-4 h-4" />, description: "Location verify" },
    ]
  },
  {
    id: "payroll",
    title: "Payroll & Billing",
    icon: <DollarSign className="w-5 h-5" />,
    color: "emerald",
    items: [
      { label: "Payroll Processing", path: "/payroll-processing", icon: <Wallet className="w-4 h-4" />, description: "Run payroll" },
      { label: "Invoicing", path: "/invoicing", icon: <Receipt className="w-4 h-4" />, description: "Bill clients" },
      { label: "ORBIT Pay Card", path: "/orbit-pay-card", icon: <CreditCard className="w-4 h-4" />, description: "Worker cards" },
      { label: "Collections", path: "/collections-dashboard", icon: <Target className="w-4 h-4" />, description: "Outstanding" },
    ]
  },
  {
    id: "compliance",
    title: "Compliance & Safety",
    icon: <Shield className="w-5 h-5" />,
    color: "violet",
    items: [
      { label: "Compliance Dashboard", path: "/compliance-dashboard", icon: <FileCheck className="w-4 h-4" />, description: "Overview" },
      { label: "Background Checks", path: "/background-checks", icon: <Fingerprint className="w-4 h-4" />, description: "Screen workers" },
      { label: "Drug Testing", path: "/drug-test-scheduling", icon: <FileText className="w-4 h-4" />, description: "Schedule tests" },
      { label: "I-9 Verification", path: "/i9-verification", icon: <UserCheck className="w-4 h-4" />, description: "Work authorization" },
      { label: "Workers Comp", path: "/workers-comp-admin", icon: <AlertTriangle className="w-4 h-4" />, description: "Claims & incidents" },
    ]
  },
  {
    id: "clients",
    title: "Client Management",
    icon: <Building2 className="w-5 h-5" />,
    color: "cyan",
    items: [
      { label: "CRM Dashboard", path: "/crm", icon: <BarChart3 className="w-4 h-4" />, description: "Sales pipeline" },
      { label: "Client Portal", path: "/client-portal", icon: <Globe className="w-4 h-4" />, description: "Client access" },
      { label: "Contracts", path: "/csa-signing", icon: <FileText className="w-4 h-4" />, description: "Agreements" },
      { label: "Communications", path: "/admin-sms-dashboard", icon: <Phone className="w-4 h-4" />, description: "SMS & calls" },
    ]
  },
  {
    id: "analytics",
    title: "Reports & Analytics",
    icon: <PieChart className="w-5 h-5" />,
    color: "violet",
    items: [
      { label: "Analytics Dashboard", path: "/analytics", icon: <BarChart3 className="w-4 h-4" />, description: "Insights" },
      { label: "Workforce Forecast", path: "/workforce-forecasting", icon: <TrendingUp className="w-4 h-4" />, description: "AI predictions" },
      { label: "Performance", path: "/worker-performance", icon: <Target className="w-4 h-4" />, description: "Worker ratings" },
      { label: "Financial Reports", path: "/financial-reports", icon: <DollarSign className="w-4 h-4" />, description: "Revenue & costs" },
    ]
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; glow: string; hover: string }> = {
  cyan: { 
    bg: "from-cyan-500/10 to-cyan-600/5", 
    border: "border-cyan-500/30", 
    text: "text-cyan-400",
    glow: "shadow-[0_0_20px_rgba(6,182,212,0.15)]",
    hover: "hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.25)]"
  },
  emerald: { 
    bg: "from-emerald-500/10 to-emerald-600/5", 
    border: "border-emerald-500/30", 
    text: "text-emerald-400",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    hover: "hover:border-emerald-400/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]"
  },
  violet: { 
    bg: "from-violet-500/10 to-violet-600/5", 
    border: "border-violet-500/30", 
    text: "text-violet-400",
    glow: "shadow-[0_0_20px_rgba(139,92,246,0.15)]",
    hover: "hover:border-violet-400/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.25)]"
  },
};

const dashboardTutorialContent: PageTutorialContent = {
  pageTitle: "Command Center",
  pageIcon: <Sparkles className="w-6 h-6" />,
  introduction: "Welcome to your ORBIT Command Center! This is your home base for managing your entire staffing operation. Let me show you around.",
  slides: [
    {
      title: "Quick Stats Overview",
      description: "The top cards show your key metrics at a glance - workers in your talent pool, active clients, open job orders, and overall business health. These update in real-time as you add data.",
      icon: <BarChart3 className="w-6 h-6" />,
      tips: [
        "Empty stats? Click 'Get Started' to add your first workers or clients",
        "Stats turn green when you have active, healthy data"
      ]
    },
    {
      title: "Core Operations",
      description: "This section handles day-to-day staffing tasks - managing your talent pool, processing work orders, scheduling shifts, and approving timesheets.",
      icon: <Zap className="w-6 h-6" />,
      tips: [
        "Start by adding workers to your Talent Pool",
        "Work Orders come from client requests for workers"
      ],
      connections: ["Talent Pool", "Workers", "Scheduling"]
    },
    {
      title: "Payroll & Billing",
      description: "Process payroll, generate invoices for clients, manage the ORBIT Pay Card program, and track outstanding payments.",
      icon: <DollarSign className="w-6 h-6" />,
      tips: [
        "Payroll runs automatically based on approved timesheets",
        "Invoicing pulls from completed work orders"
      ],
      connections: ["Payroll", "Invoicing"]
    },
    {
      title: "Compliance & Safety",
      description: "Stay compliant with background checks, drug testing, I-9 verification, and workers compensation management.",
      icon: <Shield className="w-6 h-6" />,
      tips: [
        "Compliance alerts appear when workers need renewals",
        "All documents are securely stored and tracked"
      ],
      connections: ["Compliance"]
    },
    {
      title: "Need Help?",
      description: "Click the floating help button anytime to replay this guide or get context-specific help on any page.",
      icon: <HelpCircle className="w-6 h-6" />,
      tips: [
        "Each page has its own tutorial",
        "Orby the AI assistant can answer questions too"
      ]
    }
  ]
};

function EmptyStatCard({ 
  icon, 
  label, 
  actionLabel, 
  actionPath 
}: { 
  icon: React.ReactNode; 
  label: string; 
  actionLabel: string; 
  actionPath: string;
}) {
  const [, setLocation] = useLocation();
  
  return (
    <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-dashed border-slate-600/50 rounded-xl p-4 flex flex-col items-center justify-center text-center min-h-[120px]">
      <div className="p-2 rounded-lg bg-slate-700/30 text-slate-400 mb-2">
        {icon}
      </div>
      <p className="text-xs text-slate-500 mb-2">{label}</p>
      <Button 
        size="sm" 
        variant="ghost" 
        className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 text-xs gap-1"
        onClick={() => setLocation(actionPath)}
        data-testid={`button-add-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <Plus className="w-3 h-3" />
        {actionLabel}
      </Button>
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  actionPath,
  isLoading
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number;
  actionPath: string;
  isLoading?: boolean;
}) {
  const [, setLocation] = useLocation();
  
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-xl p-4 flex flex-col min-h-[120px]">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
            {icon}
          </div>
        </div>
        <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
        <p className="text-xs text-slate-400 mt-2">{label}</p>
      </div>
    );
  }
  
  if (value === 0) {
    return (
      <EmptyStatCard 
        icon={icon} 
        label={`No ${label.toLowerCase()} yet`}
        actionLabel="Get Started"
        actionPath={actionPath}
      />
    );
  }
  
  return (
    <motion.div 
      className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-xl p-4 flex flex-col min-h-[120px] cursor-pointer hover:border-cyan-500/50 transition-all group"
      onClick={() => setLocation(actionPath)}
      whileHover={{ scale: 1.02 }}
      data-testid={`stat-card-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
          {icon}
        </div>
        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
      </div>
      <p className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
        {value.toLocaleString()}
      </p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </motion.div>
  );
}

function FloatingTutorialButton() {
  const { openTutorial, hasSeenTutorial } = useTutorial();
  const [pulse, setPulse] = useState(!hasSeenTutorial('dashboard'));
  
  useEffect(() => {
    if (!hasSeenTutorial('dashboard')) {
      const timer = setTimeout(() => {
        openTutorial(dashboardTutorialContent);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);
  
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring" }}
      onClick={() => openTutorial(dashboardTutorialContent)}
      className={cn(
        "fixed bottom-24 right-6 z-40 p-3 rounded-full",
        "bg-gradient-to-br from-cyan-500 to-violet-600",
        "text-white shadow-lg shadow-cyan-500/30",
        "hover:shadow-cyan-500/50 hover:scale-110 transition-all",
        pulse && "animate-pulse"
      )}
      data-testid="button-tutorial-help"
    >
      <HelpCircle className="w-5 h-5" />
    </motion.button>
  );
}

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/admin/business-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/business-stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
    refetchInterval: 30000,
  });

  const hasAnyData = stats && (stats.workers > 0 || stats.clients > 0 || stats.activeJobs > 0);

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              Command Center
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {hasAnyData ? "Your staffing operation at a glance" : "Let's get you set up!"}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-500/10 gap-2"
                data-testid="button-more-actions"
              >
                <MoreHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-700">
              <DropdownMenuLabel className="text-slate-400">Quick Actions</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem onClick={() => setLocation('/talent-pool')} className="text-slate-300 focus:bg-slate-800 focus:text-white">
                <Users className="w-4 h-4 mr-2 text-cyan-400" />
                Add Workers
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation('/crm')} className="text-slate-300 focus:bg-slate-800 focus:text-white">
                <Building2 className="w-4 h-4 mr-2 text-emerald-400" />
                Add Clients
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation('/work-orders')} className="text-slate-300 focus:bg-slate-800 focus:text-white">
                <ClipboardList className="w-4 h-4 mr-2 text-violet-400" />
                Create Work Order
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuLabel className="text-slate-400">Admin</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setLocation('/admin')} className="text-slate-300 focus:bg-slate-800 focus:text-white">
                <Lock className="w-4 h-4 mr-2 text-violet-400" />
                Admin Panel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation('/settings')} className="text-slate-300 focus:bg-slate-800 focus:text-white">
                <Settings className="w-4 h-4 mr-2 text-slate-400" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="Workers"
            value={stats?.workers || 0}
            actionPath="/talent-pool"
            isLoading={isLoading}
          />
          <StatCard
            icon={<Building2 className="w-5 h-5" />}
            label="Clients"
            value={stats?.clients || 0}
            actionPath="/crm"
            isLoading={isLoading}
          />
          <StatCard
            icon={<Briefcase className="w-5 h-5" />}
            label="Active Jobs"
            value={stats?.activeJobs || 0}
            actionPath="/work-orders"
            isLoading={isLoading}
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Tenants"
            value={stats?.tenants || 0}
            actionPath="/admin"
            isLoading={isLoading}
          />
        </div>

        {!hasAnyData && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-cyan-500/10 border border-cyan-500/30 rounded-xl p-6 text-center"
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Welcome to ORBIT!</h3>
            <p className="text-sm text-slate-400 mb-4 max-w-md mx-auto">
              Your staffing command center is ready. Start by adding your first workers or clients to see your dashboard come to life.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button 
                onClick={() => setLocation('/talent-pool')}
                className="bg-cyan-600 hover:bg-cyan-500 gap-2"
                data-testid="button-add-first-worker"
              >
                <Users className="w-4 h-4" />
                Add Workers
              </Button>
              <Button 
                onClick={() => setLocation('/crm')}
                variant="outline"
                className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 gap-2"
                data-testid="button-add-first-client"
              >
                <Building2 className="w-4 h-4" />
                Add Clients
              </Button>
            </div>
          </motion.div>
        )}

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Navigate</h2>
          
          <Accordion type="single" collapsible className="space-y-2">
            {categories.map((category) => {
              const colors = colorMap[category.color];
              return (
                <AccordionItem 
                  key={category.id} 
                  value={category.id}
                  className={cn(
                    "border rounded-xl overflow-hidden transition-all duration-300",
                    colors.border,
                    colors.glow,
                    colors.hover
                  )}
                >
                  <AccordionTrigger 
                    className={cn(
                      "px-4 py-3 hover:no-underline bg-gradient-to-r",
                      colors.bg
                    )}
                    data-testid={`accordion-${category.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg bg-slate-800/50", colors.text)}>
                        {category.icon}
                      </div>
                      <span className="font-medium text-white">{category.title}</span>
                      <span className="text-xs text-slate-500 ml-2">{category.items.length} items</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="bg-slate-900/50 px-4 pb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2">
                      {category.items.map((item) => (
                        <button
                          key={item.path}
                          onClick={() => setLocation(item.path)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200",
                            "bg-slate-800/30 hover:bg-slate-800/70",
                            "border border-transparent hover:border-slate-700",
                            "group"
                          )}
                          data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <div className={cn("p-1.5 rounded-md bg-slate-800", colors.text, "group-hover:scale-110 transition-transform")}>
                            {item.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors truncate">
                              {item.label}
                            </p>
                            {item.description && (
                              <p className="text-[10px] text-slate-500 truncate">{item.description}</p>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
      
      <FloatingTutorialButton />
    </Shell>
  );
}
