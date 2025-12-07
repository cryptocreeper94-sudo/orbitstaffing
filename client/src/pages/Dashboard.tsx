import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { PoweredByOrbit } from "@/components/PoweredByOrbit";
import { useLocation } from 'wouter';
import { useEffect, useRef } from "react";
import { useOrbit } from "@/components/OrbitExperience";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { CarouselRail } from "@/components/ui/carousel-rail";
import { PageHeader, SectionHeader } from "@/components/ui/section-header";
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardContent, StatCard, ActionCard } from "@/components/ui/orbit-card";
import { 
  Users, 
  DollarSign, 
  Briefcase, 
  TrendingUp, 
  Activity,
  AlertCircle,
  AlertTriangle,
  Shield,
  FileSignature,
  Clock,
  UserCheck,
  MapPin
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

const data = [
  { name: 'Mon', revenue: 4000, placements: 24 },
  { name: 'Tue', revenue: 3000, placements: 13 },
  { name: 'Wed', revenue: 9000, placements: 38 },
  { name: 'Thu', revenue: 2780, placements: 39 },
  { name: 'Fri', revenue: 1890, placements: 48 },
  { name: 'Sat', revenue: 2390, placements: 38 },
  { name: 'Sun', revenue: 3490, placements: 43 },
];

import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { showWelcome } = useOrbit();
  const hasShownWelcome = useRef(false);

  useEffect(() => {
    const hasSeenDashboardWelcome = localStorage.getItem('orbit_dashboard_welcome');
    if (!hasSeenDashboardWelcome && !hasShownWelcome.current) {
      hasShownWelcome.current = true;
      const timer = setTimeout(() => {
        showWelcome();
        localStorage.setItem('orbit_dashboard_welcome', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  const stats = [
    { label: "Active Workers", value: "1,284", icon: <Users className="w-5 h-5" />, trend: { value: 12, positive: true } },
    { label: "Weekly Revenue", value: "$48,290", icon: <DollarSign className="w-5 h-5" />, trend: { value: 8.2, positive: true } },
    { label: "Open Orders", value: "42", icon: <Briefcase className="w-5 h-5" />, trend: { value: 3, positive: false } },
    { label: "Fill Rate", value: "94.2%", icon: <TrendingUp className="w-5 h-5" />, trend: { value: 1.1, positive: true } },
  ];

  const actionItems = [
    { title: "Sign CSA: TechCorp", description: "Contract pending signature", icon: <FileSignature className="w-5 h-5" />, urgent: true },
    { title: "Payroll Approval", description: "42 timesheets pending", icon: <Clock className="w-5 h-5" />, urgent: true },
    { title: "Onboarding: J. Doe", description: "Missing I-9 Verification", icon: <UserCheck className="w-5 h-5" />, urgent: false },
    { title: "Shift Fill: Warehouse A", description: "5 spots remaining", icon: <MapPin className="w-5 h-5" />, urgent: false },
  ];

  return (
    <Shell>
      <PageHeader 
        title="Command Center"
        subtitle="System Status: OPTIMAL"
        actions={
          <div className="flex gap-3 flex-wrap">
            <Button variant="outline" className="border-cyan-500/20 hover:bg-cyan-500/10 text-cyan-400">
              <Activity className="w-4 h-4 mr-2" />
              System Health
            </Button>
            <Button onClick={() => setLocation('/incident-reporting')} className="bg-red-600 hover:bg-red-700" data-testid="button-owner-incident-report">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Report Incident
            </Button>
            <Button onClick={() => setLocation('/workers-comp-admin')} className="bg-orange-600 hover:bg-orange-700" data-testid="button-owner-workers-comp">
              <Shield className="w-4 h-4 mr-2" />
              Workers Comp
            </Button>
            <Button className="bg-cyan-500 text-slate-900 hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              New Placement
            </Button>
          </div>
        }
      />

      {/* Stats - Grid on desktop, Carousel on mobile */}
      <div className="hidden md:block mb-8">
        <BentoGrid cols={4} gap="md">
          {stats.map((stat, index) => (
            <BentoTile key={index}>
              <div className="p-5">
                <StatCard 
                  label={stat.label}
                  value={stat.value}
                  icon={stat.icon}
                  trend={stat.trend}
                  className="border-0 p-0 bg-transparent hover:border-0 hover:shadow-none"
                />
              </div>
            </BentoTile>
          ))}
        </BentoGrid>
      </div>

      <div className="md:hidden mb-8">
        <CarouselRail gap="md" itemWidth="lg">
          {stats.map((stat, index) => (
            <StatCard 
              key={index}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
            />
          ))}
        </CarouselRail>
      </div>

      {/* Main Content Grid */}
      <BentoGrid cols={3} gap="md" className="mb-8">
        {/* Revenue Chart - Spans 2 columns */}
        <BentoTile span={2} className="p-0">
          <OrbitCard variant="glass" hover={false} className="h-full border-0">
            <OrbitCardHeader>
              <OrbitCardTitle>Revenue & Placements</OrbitCardTitle>
            </OrbitCardHeader>
            <OrbitCardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        borderColor: '#334155',
                        borderRadius: '8px',
                        color: '#fff'
                      }} 
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#06b6d4" fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </OrbitCardContent>
          </OrbitCard>
        </BentoTile>

        {/* Action Items */}
        <BentoTile className="p-0">
          <OrbitCard variant="glass" hover={false} className="h-full border-0">
            <OrbitCardHeader>
              <OrbitCardTitle>Action Items</OrbitCardTitle>
            </OrbitCardHeader>
            <OrbitCardContent className="space-y-3">
              {actionItems.map((item, index) => (
                <ActionItemRow 
                  key={index}
                  title={item.title}
                  desc={item.description}
                  icon={item.icon}
                  urgent={item.urgent}
                />
              ))}
            </OrbitCardContent>
          </OrbitCard>
        </BentoTile>
      </BentoGrid>

      {/* Quick Actions - Mobile Carousel */}
      <SectionHeader 
        title="Quick Actions" 
        subtitle="Common tasks and shortcuts"
        size="sm"
        className="md:hidden"
      />
      <div className="md:hidden mb-8">
        <CarouselRail gap="md" itemWidth="md">
          <ActionCard 
            title="View Workers"
            description="Manage your workforce"
            icon={<Users className="w-5 h-5" />}
            onClick={() => setLocation('/talent-pool')}
          />
          <ActionCard 
            title="Work Orders"
            description="Manage client requests"
            icon={<Briefcase className="w-5 h-5" />}
            onClick={() => setLocation('/work-orders')}
          />
          <ActionCard 
            title="Payroll"
            description="Process payments"
            icon={<DollarSign className="w-5 h-5" />}
            onClick={() => setLocation('/payroll-processing')}
          />
        </CarouselRail>
      </div>

      {/* Powered by ORBIT Footer Button */}
      <div className="flex justify-center mt-16 pt-8 border-t border-slate-700/30">
        <PoweredByOrbit />
      </div>
    </Shell>
  );
}

function ActionItemRow({ title, desc, icon, urgent }: { title: string; desc: string; icon?: React.ReactNode; urgent?: boolean }) {
  return (
    <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
      <div className={cn(
        "mt-1 w-2 h-2 rounded-full flex-shrink-0",
        urgent ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" : "bg-cyan-400"
      )} />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-white group-hover:text-cyan-300 transition-colors">{title}</h4>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
      {urgent && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
    </div>
  );
}
