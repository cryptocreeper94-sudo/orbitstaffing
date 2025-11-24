import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PoweredByOrbit } from "@/components/PoweredByOrbit";
import { useLocation } from 'wouter';
import { 
  Users, 
  DollarSign, 
  Briefcase, 
  TrendingUp, 
  Activity,
  AlertCircle,
  AlertTriangle,
  Shield
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

  return (
    <Shell>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-heading tracking-tight">Command Center</h1>
          <p className="text-muted-foreground mt-1">System Status: <span className="text-primary font-mono">OPTIMAL</span></p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button variant="outline" className="border-primary/20 hover:bg-primary/10 text-primary">
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
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            New Placement
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title="Active Workers" 
          value="1,284" 
          change="+12%" 
          icon={Users} 
          trend="up"
        />
        <MetricCard 
          title="Weekly Revenue" 
          value="$48,290" 
          change="+8.2%" 
          icon={DollarSign} 
          trend="up"
        />
        <MetricCard 
          title="Open Orders" 
          value="42" 
          change="-3%" 
          icon={Briefcase} 
          trend="down"
        />
        <MetricCard 
          title="Fill Rate" 
          value="94.2%" 
          change="+1.1%" 
          icon={TrendingUp} 
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-heading">Revenue & Placements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-heading">Action Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ActionItem 
                title="Sign CSA: TechCorp" 
                desc="Contract pending signature" 
                urgent 
              />
              <ActionItem 
                title="Payroll Approval" 
                desc="42 timesheets pending" 
                urgent 
              />
              <ActionItem 
                title="Onboarding: J. Doe" 
                desc="Missing I-9 Verification" 
              />
              <ActionItem 
                title="Shift Fill: Warehouse A" 
                desc="5 spots remaining" 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Powered by ORBIT Footer Button */}
      <div className="flex justify-center mt-16 pt-8 border-t border-border/30">
        <PoweredByOrbit />
      </div>
    </Shell>
  );
}

function MetricCard({ title, value, change, icon: Icon, trend }: any) {
  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:bg-card/80 transition-colors group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-2 font-heading group-hover:text-primary transition-colors">{value}</h3>
          </div>
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <span className={cn(
            "font-medium",
            trend === 'up' ? "text-green-500" : "text-red-500"
          )}>
            {change}
          </span>
          <span className="text-muted-foreground ml-2">vs last week</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionItem({ title, desc, urgent }: any) {
  return (
    <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
      <div className={cn(
        "mt-1 w-2 h-2 rounded-full",
        urgent ? "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" : "bg-primary"
      )} />
      <div>
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      {urgent && <AlertCircle className="w-4 h-4 text-destructive ml-auto" />}
    </div>
  );
}