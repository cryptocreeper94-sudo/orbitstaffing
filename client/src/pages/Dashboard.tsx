import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { useLocation } from 'wouter';
import { useState } from "react";
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
  Lock
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const revenueData = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 9000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 1890 },
  { name: 'Sat', revenue: 2390 },
  { name: 'Sun', revenue: 3490 },
];

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
    color: "amber",
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
    color: "rose",
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
  amber: { 
    bg: "from-amber-500/10 to-amber-600/5", 
    border: "border-amber-500/30", 
    text: "text-amber-400",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    hover: "hover:border-amber-400/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.25)]"
  },
  rose: { 
    bg: "from-rose-500/10 to-rose-600/5", 
    border: "border-rose-500/30", 
    text: "text-rose-400",
    glow: "shadow-[0_0_20px_rgba(244,63,94,0.15)]",
    hover: "hover:border-rose-400/50 hover:shadow-[0_0_30px_rgba(244,63,94,0.25)]"
  },
};

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const stats = [
    { label: "Active Workers", value: "1,284", icon: <Users className="w-5 h-5" />, trend: "+12%", positive: true },
    { label: "Weekly Revenue", value: "$48,290", icon: <DollarSign className="w-5 h-5" />, trend: "+8.2%", positive: true },
    { label: "Open Orders", value: "42", icon: <Briefcase className="w-5 h-5" />, trend: "-3", positive: false },
    { label: "Fill Rate", value: "94.2%", icon: <TrendingUp className="w-5 h-5" />, trend: "+1.1%", positive: true },
  ];

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header - Clean and minimal */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              Command Center
            </h1>
            <p className="text-sm text-slate-400 mt-1">All systems operational</p>
          </div>
          
          {/* More Actions Dropdown */}
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
              <DropdownMenuItem onClick={() => setLocation('/incident-reporting')} className="text-slate-300 focus:bg-slate-800 focus:text-white">
                <AlertTriangle className="w-4 h-4 mr-2 text-red-400" />
                Report Incident
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation('/new-placement')} className="text-slate-300 focus:bg-slate-800 focus:text-white">
                <UserCheck className="w-4 h-4 mr-2 text-cyan-400" />
                New Placement
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

        {/* Stats Row - Bento Grid with 3D effect */}
        <BentoGrid cols={4} gap="md" className="hidden sm:grid">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <BentoTile className="group">
                <div className="p-4 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn(
                      "p-2 rounded-lg bg-gradient-to-br",
                      stat.positive ? "from-cyan-500/20 to-cyan-600/10" : "from-red-500/20 to-red-600/10"
                    )}>
                      <span className={stat.positive ? "text-cyan-400" : "text-red-400"}>{stat.icon}</span>
                    </div>
                    <span className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full",
                      stat.positive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                    )}>
                      {stat.trend}
                    </span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">{stat.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
                  </div>
                </div>
              </BentoTile>
            </motion.div>
          ))}
        </BentoGrid>

        {/* Mobile Stats - 2 column grid */}
        <div className="grid grid-cols-2 gap-3 sm:hidden">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-xl p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={stat.positive ? "text-cyan-400" : "text-red-400"}>{stat.icon}</span>
                <span className={cn(
                  "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                  stat.positive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                )}>
                  {stat.trend}
                </span>
              </div>
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-[10px] text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Main Content - Chart + Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2">
            <BentoTile className="h-full">
              <div className="p-4">
                <h3 className="text-sm font-medium text-slate-300 mb-4">Weekly Revenue</h3>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${v/1000}k`} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          borderColor: '#334155',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px'
                        }} 
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#06b6d4" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </BentoTile>
          </div>

          {/* Quick Stats Summary */}
          <BentoTile>
            <div className="p-4 h-full flex flex-col">
              <h3 className="text-sm font-medium text-slate-300 mb-4">Today's Snapshot</h3>
              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
                  <span className="text-xs text-slate-400">Pending Approvals</span>
                  <span className="text-sm font-bold text-amber-400">12</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
                  <span className="text-xs text-slate-400">Active Shifts</span>
                  <span className="text-sm font-bold text-emerald-400">47</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
                  <span className="text-xs text-slate-400">New Applications</span>
                  <span className="text-sm font-bold text-cyan-400">8</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
                  <span className="text-xs text-slate-400">Compliance Alerts</span>
                  <span className="text-sm font-bold text-red-400">3</span>
                </div>
              </div>
            </div>
          </BentoTile>
        </div>

        {/* Category Accordions - The Heart of the Clean UI */}
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
    </Shell>
  );
}
