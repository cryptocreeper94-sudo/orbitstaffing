import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, FileText, Building, Briefcase, MoreHorizontal } from "lucide-react";

const clients = [
  { name: "TechCorp Industries", industry: "Manufacturing", activeRoles: 12, status: "Active", csa: "Signed 2024-01-15" },
  { name: "Global Logistics", industry: "Transportation", activeRoles: 8, status: "Active", csa: "Signed 2023-11-02" },
  { name: "Apex Systems", industry: "IT Services", activeRoles: 0, status: "Pending", csa: "Awaiting Signature" },
  { name: "Stark Enterprises", industry: "Defense", activeRoles: 5, status: "Active", csa: "Signed 2024-02-10" },
];

export default function Clients() {
  return (
    <Shell>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Client Relations</h1>
          <p className="text-muted-foreground">Manage CSAs, job orders, and client profiles.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          + New Client Agreement
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {clients.map((client, i) => (
          <Card key={i} className="bg-card/50 border-border/50 backdrop-blur-sm hover:border-primary/50 transition-colors group">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                  <Building className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <CardTitle className="text-xl font-heading">{client.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{client.industry}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> Active Roles
                  </div>
                  <div className="text-2xl font-bold font-mono">{client.activeRoles}</div>
                </div>
                <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> CSA Status
                  </div>
                  <div className="flex items-center gap-2">
                    {client.status === "Active" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-500" />
                    )}
                    <span className="text-sm font-medium">{client.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border/30">
                <span className="text-xs text-muted-foreground">Last Activity: 2 hours ago</span>
                <Button variant="link" className="text-primary p-0 h-auto font-normal hover:no-underline">
                  View Details &rarr;
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Shell>
  );
}