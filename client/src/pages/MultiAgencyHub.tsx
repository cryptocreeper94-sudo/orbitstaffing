import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, TrendingUp, Users, DollarSign, CheckCircle2, Plus } from "lucide-react";
import { toast } from "sonner";

interface Agency {
  id: string;
  name: string;
  revenue: number;
  workers: number;
  clients: number;
  status: "active" | "paused";
}

export default function MultiAgencyHub() {
  const [agencies, setAgencies] = useState<Agency[]>([
    {
      id: "1",
      name: "Superior Staffing - Nashville",
      revenue: 96000,
      workers: 45,
      clients: 12,
      status: "active",
    },
    {
      id: "2",
      name: "Elite Placements - Memphis",
      revenue: 54000,
      workers: 28,
      clients: 8,
      status: "active",
    },
    {
      id: "3",
      name: "TempForce - Knoxville",
      revenue: 38000,
      workers: 18,
      clients: 5,
      status: "active",
    },
  ]);

  const totalRevenue = agencies.reduce((sum, a) => sum + a.revenue, 0);
  const totalWorkers = agencies.reduce((sum, a) => sum + a.workers, 0);
  const totalClients = agencies.reduce((sum, a) => sum + a.clients, 0);
  const avgRevenuePerWorker = totalRevenue / totalWorkers;

  return (
    <Shell>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold font-heading tracking-tight">Multi-Agency Hub</h1>
            <p className="text-muted-foreground">Consolidated control of all your staffing agencies</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2" data-testid="button-add-agency">
            <Plus className="w-4 h-4" />
            Add Agency
          </Button>
        </div>
      </div>

      {/* Consolidated Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">Total Revenue</p>
            <p className="text-3xl font-bold text-primary">${(totalRevenue / 1000).toFixed(0)}k</p>
            <p className="text-xs text-muted-foreground mt-2">{agencies.length} agencies</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">Total Workers</p>
            <p className="text-3xl font-bold text-green-600">{totalWorkers}</p>
            <p className="text-xs text-muted-foreground mt-2">Active placements</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">Total Clients</p>
            <p className="text-3xl font-bold text-blue-600">{totalClients}</p>
            <p className="text-xs text-muted-foreground mt-2">End-user companies</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">Avg Revenue/Worker</p>
            <p className="text-3xl font-bold text-orange-600">${avgRevenuePerWorker.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground mt-2">Per month</p>
          </CardContent>
        </Card>
      </div>

      {/* Agency Management */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-card border border-border/50">
          <TabsTrigger value="overview" className="flex-1">Agency Overview</TabsTrigger>
          <TabsTrigger value="decisions" className="flex-1">Cross-Agency Decisions</TabsTrigger>
          <TabsTrigger value="compliance" className="flex-1">Compliance</TabsTrigger>
        </TabsList>

        {/* Agency Overview */}
        <TabsContent value="overview" className="space-y-4">
          {agencies.map((agency) => (
            <Card key={agency.id} className="border-border/50 hover:border-primary/50 transition-colors cursor-pointer" data-testid={`card-agency-${agency.id}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <Building2 className="w-6 h-6 text-primary" />
                    <div>
                      <h3 className="font-bold">{agency.name}</h3>
                      <p className="text-xs text-muted-foreground">Click to view details</p>
                    </div>
                  </div>
                  <Badge className={agency.status === "active" ? "bg-green-500/20 text-green-600" : "bg-yellow-500/20 text-yellow-600"}>
                    {agency.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Monthly Revenue</p>
                    <p className="font-bold text-lg">${(agency.revenue / 1000).toFixed(0)}k</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Active Workers</p>
                    <p className="font-bold text-lg text-green-600">{agency.workers}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Clients</p>
                    <p className="font-bold text-lg text-blue-600">{agency.clients}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Utilization</p>
                    <p className="font-bold text-lg">{((agency.revenue / (agency.workers * 20 * 160)) * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Cross-Agency Decisions */}
        <TabsContent value="decisions" className="space-y-6">
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle>Apply Changes Across Agencies</CardTitle>
              <CardDescription>Make decisions that affect multiple agencies at once</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-border/50 bg-card/50">
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Adjust Billing Model
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">Switch multiple agencies between Monthly and Revenue Share at once</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold mb-2">Current Billing:</p>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        {agencies.map(a => (
                          <li key={a.id}>✓ {a.name}: Revenue Share (2%)</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <Button className="bg-primary/20 text-primary text-xs h-8 w-full" data-testid="button-change-billing">
                        Change Billing for Selected
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-border/50 bg-card/50">
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Unified Compliance Rules
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">Apply the same compliance standards across all agencies</p>
                  <Button className="bg-primary/20 text-primary text-xs h-8" data-testid="button-set-compliance">
                    Set Compliance Rules
                  </Button>
                </div>

                <div className="p-4 rounded-lg border border-border/50 bg-card/50">
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Adjust Worker Rates
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">Increase minimum rates across all agencies (respects existing contracts)</p>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      placeholder="% increase"
                      className="text-xs px-2 py-1 rounded border border-border/50 bg-background w-20"
                      data-testid="input-rate-increase"
                    />
                    <Button className="bg-primary/20 text-primary text-xs h-8" data-testid="button-apply-rates">
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance */}
        <TabsContent value="compliance" className="space-y-4">
          {agencies.map((agency) => (
            <Card key={agency.id} className="border-border/50" data-testid={`card-compliance-${agency.id}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{agency.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">TN/KY State Compliance</p>
                    <p className="text-xs text-muted-foreground">All workers I-9 verified, prevailing wage compliant</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Audit Trail</p>
                    <p className="text-xs text-muted-foreground">100% logging of changes, access, decisions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Data Security</p>
                    <p className="text-xs text-muted-foreground">Encrypted SSNs, secure backups, GDPR compliant</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Add New Agency CTA */}
      <div className="mt-12 p-8 rounded-lg border border-primary/50 bg-primary/5">
        <h2 className="text-2xl font-bold font-heading mb-2">Consolidate More Agencies</h2>
        <p className="text-muted-foreground mb-6">Bring additional staffing agencies under unified management</p>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" size="lg" data-testid="button-add-new-agency">
          <Plus className="w-4 h-4 mr-2" />
          Add New Agency to Hub
        </Button>
      </div>
    </Shell>
  );
}
