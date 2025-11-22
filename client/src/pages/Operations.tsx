import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  HardHat, 
  UserX,
  MessageSquare
} from "lucide-react";

export default function Operations() {
  return (
    <Shell>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Operations Center</h1>
          <p className="text-muted-foreground">Real-time issue tracking and workforce management.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium animate-pulse">
            <AlertTriangle className="w-4 h-4" />
            3 Critical Issues
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Issue Feed */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-heading">Live Issue Feed</CardTitle>
              <CardDescription>Incoming reports from Worker Portals.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <IssueRow 
                type="Equipment"
                priority="Medium"
                worker="Jason V."
                site="TechCorp Warehouse"
                msg="Needs safety glasses delivered."
                time="2m ago"
                status="Open"
              />
              <IssueRow 
                type="Attendance"
                priority="High"
                worker="Sarah C."
                site="Metro Hospitality Event"
                msg="Car broke down, will be 30m late."
                time="15m ago"
                status="Open"
              />
              <IssueRow 
                type="Safety"
                priority="Critical"
                worker="Mike R."
                site="Construction Site B"
                msg="Exposed wiring on 2nd floor. Client notified."
                time="1h ago"
                status="Investigating"
              />
              <IssueRow 
                type="Time Off"
                priority="Low"
                worker="David L."
                site="N/A"
                msg="Requesting next Friday off for doctor appt."
                time="3h ago"
                status="Resolved"
              />
            </CardContent>
          </Card>
        </div>

        {/* Ops Metrics */}
        <div className="space-y-6">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
             <CardHeader>
               <CardTitle className="font-heading">Attendance Rate</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-4xl font-bold font-mono text-primary mb-2">96.4%</div>
               <p className="text-sm text-muted-foreground">2 call-outs today out of 56 shifts.</p>
               <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
                 <div className="h-full bg-primary w-[96.4%]"></div>
               </div>
             </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
             <CardHeader>
               <CardTitle className="font-heading">Equipment Requests</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 <div className="flex justify-between items-center">
                   <div className="flex items-center gap-2 text-sm">
                     <HardHat className="w-4 h-4 text-muted-foreground" />
                     PPE Kits
                   </div>
                   <span className="font-mono font-bold">12</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <div className="flex items-center gap-2 text-sm">
                     <span className="w-4 h-4 text-center text-muted-foreground text-xs border border-muted-foreground rounded flex items-center justify-center">S</span>
                     Steel Toe Boots
                   </div>
                   <span className="font-mono font-bold">4</span>
                 </div>
               </div>
               <Button className="w-full mt-6" variant="outline">Manage Inventory</Button>
             </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}

function IssueRow({ type, priority, worker, site, msg, time, status }: any) {
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
    <div className="p-4 rounded-lg bg-background/50 border border-border/50 flex flex-col gap-3 hover:border-primary/30 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={priorityColors[priority]}>
            {priority}
          </Badge>
          <span className="font-bold text-foreground text-sm">{type}</span>
        </div>
        <span className="text-xs text-muted-foreground font-mono">{time}</span>
      </div>
      
      <div className="flex gap-3">
        <div className="mt-1">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm text-foreground font-medium mb-1">{worker} <span className="text-muted-foreground font-normal">at {site}</span></p>
          <p className="text-sm text-muted-foreground leading-relaxed">"{msg}"</p>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-border/30">
        <Button size="sm" variant="ghost" className="h-7 text-xs">Contact Worker</Button>
        <Button size="sm" variant="outline" className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10">Resolve</Button>
      </div>
    </div>
  );
}