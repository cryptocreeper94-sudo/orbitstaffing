import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  Database,
  ArrowRight,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

interface Integration {
  id: string;
  type: "quickbooks" | "adp" | "ukgpro" | "paylocity" | "bamboohr";
  name: string;
  description: string;
  status: "connected" | "disconnected" | "error" | "syncing";
  lastSync?: string;
  nextSync?: string;
  recordsSynced?: number;
  error?: string;
}

const AVAILABLE_INTEGRATIONS = [
  {
    type: "quickbooks",
    name: "QuickBooks Online",
    description: "Sync clients, invoices, payments, and billing data",
    icon: "💼",
    category: "accounting",
  },
  {
    type: "adp",
    name: "ADP Workforce Now",
    description: "Sync employees, pay rates, payroll, and hours",
    icon: "👥",
    category: "payroll",
  },
  {
    type: "ukgpro",
    name: "UKG Pro (Kronos)",
    description: "Sync schedules, availability, and timesheet data",
    icon: "📅",
    category: "scheduling",
  },
  {
    type: "paylocity",
    name: "Paylocity",
    description: "Sync payroll, HR, benefits, and employee data",
    icon: "💰",
    category: "payroll",
  },
  {
    type: "bamboohr",
    name: "BambooHR",
    description: "Sync employee records, documents, and leave tracking",
    icon: "🌳",
    category: "hr",
  },
];

export default function Integrations() {
  const [connectedIntegrations, setConnectedIntegrations] = useState<Integration[]>([
    {
      id: "1",
      type: "quickbooks",
      name: "QuickBooks Online",
      description: "Sync clients, invoices, payments, and billing data",
      status: "connected",
      lastSync: "2025-11-22 at 2:00 AM",
      nextSync: "2025-11-23 at 2:00 AM",
      recordsSynced: 1250,
    },
  ]);

  const handleConnect = (integrationType: string) => {
    const integration = AVAILABLE_INTEGRATIONS.find((i) => i.type === integrationType);
    if (integration) {
      alert(`Connecting to ${integration.name}...\n\nIn production, this would redirect to their OAuth login.`);
    }
  };

  const handleDisconnect = (id: string) => {
    setConnectedIntegrations((prev) => prev.filter((i) => i.id !== id));
    alert("Integration disconnected. All synced data remains in ORBIT.");
  };

  const handleManualSync = (id: string) => {
    alert("Manual sync started. This will pull the latest data from the connected system.");
  };

  const disconnectedIntegrations = AVAILABLE_INTEGRATIONS.filter(
    (avail) => !connectedIntegrations.find((conn) => conn.type === avail.type)
  );

  return (
    <Shell>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading tracking-tight mb-2 flex items-center gap-2">
          <Zap className="w-8 h-8 text-primary" />
          External Integrations
        </h1>
        <p className="text-muted-foreground">
          Connect your existing systems (QuickBooks, ADP, UKG Pro) to sync data automatically
        </p>
      </div>

      {/* Info Alert */}
      <Alert className="mb-6 border-blue-500/50 bg-blue-500/5">
        <Database className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <strong>All-in-One Integration:</strong> Connect your systems once. ORBIT will sync data daily (or in real-time). No more manual data entry between systems.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="connected" className="space-y-6">
        <TabsList className="bg-card border border-border/50">
          <TabsTrigger value="connected" className="flex-1">
            Connected ({connectedIntegrations.length})
          </TabsTrigger>
          <TabsTrigger value="available" className="flex-1">
            Available ({disconnectedIntegrations.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1">
            Sync History
          </TabsTrigger>
        </TabsList>

        {/* Connected Integrations */}
        <TabsContent value="connected" className="space-y-4">
          {connectedIntegrations.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">No integrations connected yet</p>
                <p className="text-sm text-muted-foreground">
                  Connect your first system to start syncing data automatically
                </p>
              </CardContent>
            </Card>
          ) : (
            connectedIntegrations.map((integration) => (
              <ConnectedIntegrationCard
                key={integration.id}
                integration={integration}
                onSync={() => handleManualSync(integration.id)}
                onDisconnect={() => handleDisconnect(integration.id)}
              />
            ))
          )}
        </TabsContent>

        {/* Available Integrations */}
        <TabsContent value="available" className="space-y-4">
          {disconnectedIntegrations.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">All available integrations are connected!</p>
              </CardContent>
            </Card>
          ) : (
            disconnectedIntegrations.map((integration) => (
              <AvailableIntegrationCard
                key={integration.type}
                integration={integration}
                onConnect={() => handleConnect(integration.type)}
              />
            ))
          )}
        </TabsContent>

        {/* Sync History */}
        <TabsContent value="history" className="space-y-4">
          <SyncHistoryTab />
        </TabsContent>
      </Tabs>

      {/* How It Works Section */}
      <div className="mt-12 p-6 rounded-lg bg-primary/5 border border-primary/30">
        <h2 className="text-xl font-bold font-heading mb-4">How Integration Works</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-sm">
            <div className="font-bold text-primary mb-2">1. Connect System</div>
            <p className="text-muted-foreground">Click "Connect" and authorize ORBIT access</p>
          </div>
          <div className="flex justify-center items-end mb-2 text-primary">
            <ArrowRight className="w-5 h-5" />
          </div>
          <div className="text-sm">
            <div className="font-bold text-primary mb-2">2. Initial Import</div>
            <p className="text-muted-foreground">ORBIT pulls all historical data (one-time)</p>
          </div>
          <div className="flex justify-center items-end mb-2 text-primary">
            <ArrowRight className="w-5 h-5" />
          </div>
          <div className="text-sm">
            <div className="font-bold text-primary mb-2">3. Daily Sync</div>
            <p className="text-muted-foreground">Automatically pull new/changed data daily</p>
          </div>
          <div className="flex justify-center items-end mb-2 text-primary">
            <ArrowRight className="w-5 h-5" />
          </div>
          <div className="text-sm">
            <div className="font-bold text-primary mb-2">4. Unified System</div>
            <p className="text-muted-foreground">Manage everything from ORBIT dashboard</p>
          </div>
        </div>
      </div>

      {/* What Gets Synced */}
      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-bold font-heading">What Gets Synced</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <span>💼</span> QuickBooks
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <div>✓ Clients & customers</div>
              <div>✓ Invoices & payments</div>
              <div>✓ Billing info</div>
              <div>✓ Payment history</div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <span>👥</span> ADP Workforce
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <div>✓ Employee directory</div>
              <div>✓ Pay rates & codes</div>
              <div>✓ Payroll runs</div>
              <div>✓ Tax info & history</div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <span>📅</span> UKG Pro
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <div>✓ Master schedules</div>
              <div>✓ Worker availability</div>
              <div>✓ Time entries</div>
              <div>✓ Shift patterns</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Benefits */}
      <div className="mt-8 p-6 rounded-lg bg-green-500/5 border border-green-500/30">
        <h2 className="text-lg font-bold text-green-700 mb-3">Key Benefits</h2>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span><strong>No Manual Data Entry:</strong> Everything syncs automatically</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span><strong>Reference Numbers Preserved:</strong> Keep your current IDs without conflict</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span><strong>Zero Data Loss:</strong> All existing systems keep running</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span><strong>Save $30-80k/year:</strong> Consolidate 6-7 systems into ORBIT</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span><strong>Real-time Visibility:</strong> Unified dashboard for all data</span>
          </li>
        </ul>
      </div>
    </Shell>
  );
}

function ConnectedIntegrationCard({
  integration,
  onSync,
  onDisconnect,
}: {
  integration: Integration;
  onSync: () => void;
  onDisconnect: () => void;
}) {
  return (
    <Card className="border-green-500/50 bg-green-500/5" data-testid={`card-integration-${integration.type}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              {integration.name}
            </CardTitle>
            <CardDescription className="text-xs mt-2">{integration.description}</CardDescription>
          </div>
          <Badge className="bg-green-500/20 text-green-600">Connected</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Last Sync</p>
            <p className="font-semibold">{integration.lastSync || "Never"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Next Sync</p>
            <p className="font-semibold">{integration.nextSync || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Records Synced</p>
            <p className="font-semibold">{integration.recordsSynced?.toLocaleString() || "—"}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1 gap-2 text-xs"
            onClick={onSync}
            data-testid={`button-sync-${integration.type}`}
          >
            <RefreshCw className="w-3 h-3" />
            Sync Now
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2 text-xs text-red-600"
            onClick={onDisconnect}
            data-testid={`button-disconnect-${integration.type}`}
          >
            <Trash2 className="w-3 h-3" />
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AvailableIntegrationCard({
  integration,
  onConnect,
}: {
  integration: { type: string; name: string; description: string; icon: string; category: string };
  onConnect: () => void;
}) {
  return (
    <Card className="border-border/50 hover:border-primary/50 transition-colors" data-testid={`card-available-${integration.type}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="text-2xl">{integration.icon}</span>
              {integration.name}
            </CardTitle>
            <CardDescription className="text-xs mt-2">{integration.description}</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {integration.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Button
          className="w-full gap-2"
          onClick={onConnect}
          data-testid={`button-connect-${integration.type}`}
        >
          <Plus className="w-4 h-4" />
          Connect {integration.name}
        </Button>
      </CardContent>
    </Card>
  );
}

function SyncHistoryTab() {
  const syncLogs = [
    {
      id: 1,
      integration: "QuickBooks Online",
      date: "2025-11-22 at 2:00 AM",
      status: "completed",
      recordsSucceeded: 1250,
      recordsFailed: 0,
      duration: "45 seconds",
    },
    {
      id: 2,
      integration: "QuickBooks Online",
      date: "2025-11-21 at 2:00 AM",
      status: "completed",
      recordsSucceeded: 1200,
      recordsFailed: 0,
      duration: "42 seconds",
    },
    {
      id: 3,
      integration: "QuickBooks Online",
      date: "2025-11-20 at 2:00 AM",
      status: "completed",
      recordsSucceeded: 1200,
      recordsFailed: 0,
      duration: "38 seconds",
    },
  ];

  return (
    <div className="space-y-4">
      {syncLogs.map((log) => (
        <Card key={log.id} className="border-border/50" data-testid={`card-sync-log-${log.id}`}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-sm">{log.integration}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  {log.date}
                </p>
              </div>
              <Badge className="bg-green-500/20 text-green-600">
                {log.status === "completed" ? "Completed" : "Failed"}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-muted-foreground">Succeeded</p>
                <p className="font-bold">{log.recordsSucceeded.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Failed</p>
                <p className="font-bold">{log.recordsFailed}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p className="font-bold">{log.duration}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
