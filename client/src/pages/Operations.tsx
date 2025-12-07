import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { CarouselRail } from "@/components/ui/carousel-rail";
import { PageHeader } from "@/components/ui/section-header";
import { 
  OrbitCard, 
  OrbitCardHeader, 
  OrbitCardTitle, 
  OrbitCardDescription, 
  OrbitCardContent,
  StatCard, 
  ActionCard 
} from "@/components/ui/orbit-card";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  HardHat, 
  UserX,
  MessageSquare,
  Package,
  Activity
} from "lucide-react";

const issues = [
  {
    id: 1,
    type: "Equipment",
    priority: "Medium",
    worker: "Jason V.",
    site: "TechCorp Warehouse",
    msg: "Needs safety glasses delivered.",
    time: "2m ago",
    status: "Open"
  },
  {
    id: 2,
    type: "Attendance",
    priority: "High",
    worker: "Sarah C.",
    site: "Metro Hospitality Event",
    msg: "Car broke down, will be 30m late.",
    time: "15m ago",
    status: "Open"
  },
  {
    id: 3,
    type: "Safety",
    priority: "Critical",
    worker: "Mike R.",
    site: "Construction Site B",
    msg: "Exposed wiring on 2nd floor. Client notified.",
    time: "1h ago",
    status: "Investigating"
  },
  {
    id: 4,
    type: "Time Off",
    priority: "Low",
    worker: "David L.",
    site: "N/A",
    msg: "Requesting next Friday off for doctor appt.",
    time: "3h ago",
    status: "Resolved"
  }
];

export default function Operations() {
  return (
    <Shell>
      <PageHeader
        title="Operations Center"
        subtitle="Real-time issue tracking and workforce management."
        actions={
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium animate-pulse">
            <AlertTriangle className="w-4 h-4" />
            3 Critical Issues
          </div>
        }
      />

      <BentoGrid cols={3} gap="md">
        <BentoTile span={2} className="p-5">
          <OrbitCardHeader>
            <OrbitCardTitle>Live Issue Feed</OrbitCardTitle>
            <OrbitCardDescription>Incoming reports from Worker Portals.</OrbitCardDescription>
          </OrbitCardHeader>
          
          <div className="hidden md:block space-y-4">
            {issues.map((issue) => (
              <IssueRow key={issue.id} {...issue} />
            ))}
          </div>
          
          <div className="md:hidden">
            <CarouselRail gap="md" itemWidth="lg" showArrows={false}>
              {issues.map((issue) => (
                <div key={issue.id} className="min-w-[300px]">
                  <IssueRow {...issue} />
                </div>
              ))}
            </CarouselRail>
          </div>
        </BentoTile>

        <BentoTile className="p-0 bg-transparent border-0">
          <div className="space-y-4">
            <StatCard
              label="Attendance Rate"
              value="96.4%"
              icon={<Activity className="w-6 h-6" />}
              trend={{ value: 2.1, positive: true }}
            />

            <OrbitCard variant="stat">
              <OrbitCardHeader>
                <OrbitCardTitle className="text-base">Equipment Requests</OrbitCardTitle>
              </OrbitCardHeader>
              <OrbitCardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <HardHat className="w-4 h-4 text-cyan-400" />
                      PPE Kits
                    </div>
                    <span className="font-mono font-bold text-white">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Package className="w-4 h-4 text-cyan-400" />
                      Steel Toe Boots
                    </div>
                    <span className="font-mono font-bold text-white">4</span>
                  </div>
                </div>
              </OrbitCardContent>
            </OrbitCard>

            <ActionCard
              title="Manage Inventory"
              description="View and update equipment"
              icon={<HardHat className="w-5 h-5" />}
              onClick={() => {}}
            />
          </div>
        </BentoTile>
      </BentoGrid>
    </Shell>
  );
}

function IssueRow({ type, priority, worker, site, msg, time, status }: {
  type: string;
  priority: string;
  worker: string;
  site: string;
  msg: string;
  time: string;
  status: string;
}) {
  const icons: Record<string, any> = {
    Equipment: HardHat,
    Attendance: UserX,
    Safety: AlertTriangle,
    "Time Off": Clock
  };
  
  const Icon = icons[type] || MessageSquare;

  const priorityColors: Record<string, string> = {
    Critical: "text-red-500 bg-red-500/10 border-red-500/20",
    High: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    Medium: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    Low: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  };

  return (
    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 flex flex-col gap-3 hover:border-cyan-500/30 transition-colors" data-testid={`issue-row-${type.toLowerCase().replace(' ', '-')}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={priorityColors[priority]}>
            {priority}
          </Badge>
          <span className="font-bold text-white text-sm">{type}</span>
        </div>
        <span className="text-xs text-slate-400 font-mono">{time}</span>
      </div>
      
      <div className="flex gap-3">
        <div className="mt-1">
          <Icon className="w-5 h-5 text-slate-400" />
        </div>
        <div>
          <p className="text-sm text-white font-medium mb-1">{worker} <span className="text-slate-400 font-normal">at {site}</span></p>
          <p className="text-sm text-slate-400 leading-relaxed">"{msg}"</p>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-700/30">
        <Button size="sm" variant="ghost" className="h-7 text-xs text-slate-300 hover:text-white" data-testid="button-contact-worker">Contact Worker</Button>
        <Button size="sm" variant="outline" className="h-7 text-xs border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10" data-testid="button-resolve">Resolve</Button>
      </div>
    </div>
  );
}
