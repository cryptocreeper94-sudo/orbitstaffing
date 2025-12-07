import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/section-header";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardContent, OrbitCardFooter, StatCard } from "@/components/ui/orbit-card";
import { CheckCircle2, Clock, FileText, Building, Briefcase, MoreHorizontal } from "lucide-react";

const clients = [
  { name: "TechCorp Industries", industry: "Manufacturing", activeRoles: 12, status: "Active", csa: "Signed 2024-01-15" },
  { name: "Global Logistics", industry: "Transportation", activeRoles: 8, status: "Active", csa: "Signed 2023-11-02" },
  { name: "Apex Systems", industry: "IT Services", activeRoles: 0, status: "Pending", csa: "Awaiting Signature" },
  { name: "Stark Enterprises", industry: "Defense", activeRoles: 5, status: "Active", csa: "Signed 2024-02-10" },
];

const totalActiveRoles = clients.reduce((sum, c) => sum + c.activeRoles, 0);
const activeClients = clients.filter(c => c.status === "Active").length;

export default function Clients() {
  return (
    <Shell>
      <PageHeader
        title="Client Relations"
        subtitle="Manage CSAs, job orders, and client profiles."
        actions={
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            data-testid="button-new-client"
          >
            + New Client Agreement
          </Button>
        }
      />

      <BentoGrid cols={4} gap="md" className="mb-8">
        <BentoTile className="p-0">
          <StatCard
            label="Total Clients"
            value={clients.length}
            icon={<Building className="w-6 h-6" />}
          />
        </BentoTile>
        <BentoTile className="p-0">
          <StatCard
            label="Active Clients"
            value={activeClients}
            icon={<CheckCircle2 className="w-6 h-6" />}
            trend={{ value: 12, positive: true }}
          />
        </BentoTile>
        <BentoTile className="p-0">
          <StatCard
            label="Active Roles"
            value={totalActiveRoles}
            icon={<Briefcase className="w-6 h-6" />}
          />
        </BentoTile>
        <BentoTile className="p-0">
          <StatCard
            label="Pending CSAs"
            value={clients.filter(c => c.status === "Pending").length}
            icon={<Clock className="w-6 h-6" />}
          />
        </BentoTile>
      </BentoGrid>

      <BentoGrid cols={2} gap="md">
        {clients.map((client, i) => (
          <BentoTile key={i} className="p-0">
            <OrbitCard hover={true} data-testid={`card-client-${i}`}>
              <OrbitCardHeader
                icon={
                  <div className="h-12 w-12 rounded-lg bg-slate-700/50 flex items-center justify-center">
                    <Building className="w-6 h-6 text-cyan-400" />
                  </div>
                }
                action={
                  <Button variant="ghost" size="icon" data-testid={`button-client-menu-${i}`}>
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                }
              >
                <OrbitCardTitle>{client.name}</OrbitCardTitle>
                <p className="text-sm text-slate-400">{client.industry}</p>
              </OrbitCardHeader>
              
              <OrbitCardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> Active Roles
                    </div>
                    <div className="text-2xl font-bold font-mono text-white">{client.activeRoles}</div>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> CSA Status
                    </div>
                    <div className="flex items-center gap-2">
                      {client.status === "Active" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500" />
                      )}
                      <span className="text-sm font-medium text-white">{client.status}</span>
                    </div>
                  </div>
                </div>
              </OrbitCardContent>

              <OrbitCardFooter>
                <span className="text-xs text-slate-500">Last Activity: 2 hours ago</span>
                <Button 
                  variant="link" 
                  className="text-cyan-400 p-0 h-auto font-normal hover:text-cyan-300 hover:no-underline"
                  data-testid={`button-view-client-${i}`}
                >
                  View Details &rarr;
                </Button>
              </OrbitCardFooter>
            </OrbitCard>
          </BentoTile>
        ))}
      </BentoGrid>
    </Shell>
  );
}
