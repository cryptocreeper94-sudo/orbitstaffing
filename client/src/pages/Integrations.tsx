import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  Loader,
} from "lucide-react";

const ICON_MAP: Record<string, string> = {
  "👥": "/icons/pro/3d_people_group_icon.png",
  "💼": "/icons/pro/3d_briefcase_jobs_icon.png",
  "⚡": "/icons/pro/3d_lightning_bolt_icon.png",
  "🔗": "/icons/pro/3d_link_connection_icon.png",
  "🌐": "/icons/pro/3d_globe_network_icon.png",
  "💰": "/icons/pro/3d_money_pay_icon.png",
  "📊": "/icons/pro/3d_chart_reports_icon.png",
  "✅": "/icons/pro/3d_checkmark_comply_icon.png",
  "🎯": "/icons/pro/3d_target_goal_icon.png",
  "⏱️": "/icons/pro/3d_clock_timer_icon.png",
  "📅": "/icons/pro/3d_calendar_schedule_icon.png",
  "🌳": "/icons/pro/3d_tree_growth_icon.png",
  "📧": "/icons/pro/3d_email_envelope_icon.png",
};

function Icon3D({ emoji, size = "md" }: { emoji: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const iconPath = ICON_MAP[emoji];
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-10 h-10"
  };
  
  if (iconPath) {
    return (
      <img 
        src={`${iconPath}?v=1`} 
        alt="" 
        className={`${sizeClasses[size]} object-contain drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]`} 
      />
    );
  }
  return <span>{emoji}</span>;
}

interface Integration {
  id: string;
  type:
    | "quickbooks"
    | "adp"
    | "paychex"
    | "gusto"
    | "rippling"
    | "workday"
    | "paylocity"
    | "onpay"
    | "bullhorn"
    | "wurknow"
    | "ukgpro"
    | "bamboohr"
    | "google-workspace"
    | "microsoft-365";
  name: string;
  description: string;
  status: "connected" | "disconnected" | "error" | "syncing";
  lastSync?: string;
  nextSync?: string;
  recordsSynced?: number;
  error?: string;
}

const AVAILABLE_INTEGRATIONS = [
  // Payroll Systems
  {
    type: "adp",
    name: "ADP Workforce Now",
    description: "Enterprise payroll, HR, compliance automation",
    icon: "👥",
    category: "payroll",
  },
  {
    type: "paychex",
    name: "Paychex Flex",
    description: "Small-to-mid business payroll with tax automation",
    icon: "💼",
    category: "payroll",
  },
  {
    type: "gusto",
    name: "Gusto",
    description: "Simple payroll, benefits, and HR for small businesses",
    icon: "⚡",
    category: "payroll",
  },
  {
    type: "rippling",
    name: "Rippling",
    description: "All-in-one HR, payroll, IT, and benefits platform",
    icon: "🔗",
    category: "payroll",
  },
  {
    type: "workday",
    name: "Workday",
    description: "Enterprise payroll and HCM with AI-powered analytics",
    icon: "🌐",
    category: "payroll",
  },
  {
    type: "paylocity",
    name: "Paylocity",
    description: "HCM platform with payroll, benefits, and analytics",
    icon: "💰",
    category: "payroll",
  },
  {
    type: "quickbooks",
    name: "QuickBooks Payroll",
    description: "Accounting + payroll integration for small businesses",
    icon: "📊",
    category: "accounting",
  },
  {
    type: "onpay",
    name: "OnPay",
    description: "Affordable payroll with tax filing and contractor payments",
    icon: "✅",
    category: "payroll",
  },

  // Staffing-Specific
  {
    type: "bullhorn",
    name: "Bullhorn",
    description: "All-in-one staffing platform (ATS, CRM, payroll)",
    icon: "🎯",
    category: "staffing",
  },
  {
    type: "wurknow",
    name: "WurkNow",
    description: "Staffing payroll built for high-volume temp workers",
    icon: "⏱️",
    category: "staffing",
  },

  // Scheduling & Time Tracking
  {
    type: "ukgpro",
    name: "UKG Pro (Kronos)",
    description: "Workforce scheduling, availability, and timesheet data",
    icon: "📅",
    category: "scheduling",
  },

  // HR & Benefits
  {
    type: "bamboohr",
    name: "BambooHR",
    description: "HR management, employee records, and leave tracking",
    icon: "🌳",
    category: "hr",
  },

  // Productivity & File Storage
  {
    type: "google-workspace",
    name: "Google Workspace",
    description: "Google Drive file sync, Calendar appointments, Gmail contacts",
    icon: "🌐",
    category: "productivity",
  },
  {
    type: "microsoft-365",
    name: "Microsoft 365",
    description: "OneDrive files, Outlook Calendar, Exchange contacts",
    icon: "📧",
    category: "productivity",
  },
];

export default function Integrations() {
  const [connectedIntegrations, setConnectedIntegrations] = useState<Integration[]>([]);
  const [loadingType, setLoadingType] = useState<string | null>(null);

  // Fetch integration status
  const { data: statusData, refetch: refetchStatus } = useQuery({
    queryKey: ["integrations-status"],
    queryFn: async () => {
      const types = [
        "quickbooks", "adp", "paychex", "gusto", "rippling", "workday",
        "paylocity", "onpay", "bullhorn", "wurknow", "ukgpro", "bamboohr",
        "google-workspace", "microsoft-365"
      ];
      const results: { [key: string]: any } = {};
      for (const type of types) {
        try {
          const res = await fetch(`/api/oauth/status/${type}`);
          if (res.ok) results[type] = await res.json();
        } catch (err) {
          // Integration not configured yet, skip
        }
      }
      return results;
    },
    refetchInterval: 5000,
  });

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: async (integrationType: string) => {
      const res = await fetch(`/api/oauth/disconnect/${integrationType}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to disconnect");
      return res.json();
    },
    onSuccess: () => refetchStatus(),
  });

  // Trigger OAuth flow
  const handleConnect = async (integrationType: string) => {
    try {
      setLoadingType(integrationType);
      const res = await fetch(`/api/oauth/${integrationType}/auth?tenantId=default`);
      const { authUrl } = await res.json();

      // Open OAuth popup
      const popup = window.open(authUrl, "oauth-popup", "width=600,height=700");
      if (!popup) {
        alert("Please allow popups to connect integrations");
        return;
      }

      // Poll for completion
      const checkInterval = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkInterval);
          setLoadingType(null);
          setTimeout(() => refetchStatus(), 1000);
        }
      }, 500);
    } catch (error) {
      console.error("OAuth connection failed:", error);
      alert("Failed to connect. Please check your API keys.");
      setLoadingType(null);
    }
  };

  const handleDisconnect = async (type: string) => {
    await disconnectMutation.mutateAsync(type);
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
          Connect your existing systems (QuickBooks, ADP, UKG Pro, Google Workspace, Microsoft 365) to sync data automatically — no manual entry required
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
                isLoading={loadingType === integration.type}
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

      {/* Top Payroll Systems */}
      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-bold font-heading">Top Payroll Systems We Support</h2>
        <p className="text-sm text-muted-foreground mb-4">
          ORBIT integrates with the top 5 payroll systems (95% market coverage) so you can consolidate your entire staffing operation
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Icon3D emoji="👥" size="md" /> ADP Workforce Now
              </CardTitle>
              <p className="text-xs text-muted-foreground font-normal mt-1">#1 Market Leader</p>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-1"><Icon3D emoji="✅" size="sm" /> Employees & pay rates</div>
              <div className="flex items-center gap-1"><Icon3D emoji="✅" size="sm" /> Payroll runs & tax info</div>
              <div className="flex items-center gap-1"><Icon3D emoji="✅" size="sm" /> Timesheets & compliance</div>
              <div className="text-xs text-primary font-semibold mt-2">Enterprise-grade</div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Icon3D emoji="💼" size="md" /> Paychex Flex
              </CardTitle>
              <p className="text-xs text-muted-foreground font-normal mt-1">#2 Market Leader</p>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-1"><Icon3D emoji="✅" size="sm" /> Payroll & tax automation</div>
              <div className="flex items-center gap-1"><Icon3D emoji="✅" size="sm" /> Employee data & rates</div>
              <div className="flex items-center gap-1"><Icon3D emoji="✅" size="sm" /> Multi-state compliance</div>
              <div className="text-xs text-primary font-semibold mt-2">Small-to-mid agencies</div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Icon3D emoji="⚡" size="md" /> Gusto
              </CardTitle>
              <p className="text-xs text-muted-foreground font-normal mt-1">Most Popular for Small Business</p>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-1"><Icon3D emoji="✅" size="sm" /> Payroll & benefits</div>
              <div className="flex items-center gap-1"><Icon3D emoji="✅" size="sm" /> Employee self-service</div>
              <div className="flex items-center gap-1"><Icon3D emoji="✅" size="sm" /> Contractors & temps</div>
              <div className="text-xs text-primary font-semibold mt-2">Simple & affordable</div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Icon3D emoji="🔗" size="md" /> Rippling
              </CardTitle>
              <p className="text-xs text-muted-foreground font-normal mt-1">Modern All-in-One</p>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-1"><Icon3D emoji="✅" size="sm" /> HR + Payroll + IT</div>
              <div className="flex items-center gap-1"><Icon3D emoji="✅" size="sm" /> Benefits & compliance</div>
              <div className="flex items-center gap-1"><Icon3D emoji="✅" size="sm" /> Unified platform</div>
              <div className="text-xs text-primary font-semibold mt-2">Tech-forward companies</div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Icon3D emoji="🌐" size="md" /> Workday
              </CardTitle>
              <p className="text-xs text-muted-foreground font-normal mt-1">Enterprise Solution</p>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-1"><Icon3D emoji="✅" size="sm" /> Advanced analytics</div>
              <div className="flex items-center gap-1"><Icon3D emoji="✅" size="sm" /> AI-powered compliance</div>
              <div className="flex items-center gap-1"><Icon3D emoji="✅" size="sm" /> Global payroll</div>
              <div className="text-xs text-primary font-semibold mt-2">Large enterprises</div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Icon3D emoji="💰" size="md" /> Paylocity
              </CardTitle>
              <p className="text-xs text-muted-foreground font-normal mt-1">HCM Platform</p>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-1"><Icon3D emoji="✅" size="sm" /> Payroll & HR</div>
              <div className="flex items-center gap-1"><Icon3D emoji="✅" size="sm" /> Benefits & compliance</div>
              <div className="flex items-center gap-1"><Icon3D emoji="✅" size="sm" /> Analytics dashboard</div>
              <div className="text-xs text-primary font-semibold mt-2">Scaling agencies</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Productivity & File Storage */}
      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-bold font-heading">Productivity & File Storage</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Connect your Google or Microsoft accounts to sync files, calendars, and contacts seamlessly
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                <span className="text-xl mr-2">🌐</span> Google Workspace
              </CardTitle>
              <p className="text-xs text-muted-foreground font-normal mt-1">G Suite Integration</p>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <div>✓ Google Drive file sync</div>
              <div>✓ Calendar appointments</div>
              <div>✓ Gmail contact import</div>
              <div className="text-xs text-primary font-semibold mt-2">Cloud productivity</div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                <span className="text-xl mr-2">📧</span> Microsoft 365
              </CardTitle>
              <p className="text-xs text-muted-foreground font-normal mt-1">Office 365 & OneDrive</p>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <div>✓ OneDrive file storage</div>
              <div>✓ Outlook Calendar sync</div>
              <div>✓ Exchange contacts</div>
              <div className="text-xs text-primary font-semibold mt-2">Enterprise productivity</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* What Gets Synced */}
      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-bold font-heading">What Gets Synced</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                <span className="text-xl mr-2">📊</span> Accounting
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <div>✓ Clients & customers</div>
              <div>✓ Invoices & payments</div>
              <div>✓ Expenses & billing</div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                <span className="text-xl mr-2">👥</span> Payroll
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <div>✓ Employees & rates</div>
              <div>✓ Pay runs & taxes</div>
              <div>✓ Deductions & benefits</div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                <span className="text-xl mr-2">📅</span> Scheduling
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <div>✓ Master schedules</div>
              <div>✓ Availability & shifts</div>
              <div>✓ Time entries</div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                <span className="text-xl mr-2">🏢</span> HR & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <div>✓ Employee records</div>
              <div>✓ Tax withholdings</div>
              <div>✓ Benefits & leave</div>
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
  isLoading,
  onConnect,
}: {
  integration: { type: string; name: string; description: string; icon: string; category: string };
  isLoading?: boolean;
  onConnect: () => void;
}) {
  return (
    <Card className="border-border/50 hover:border-primary/50 transition-colors" data-testid={`card-available-${integration.type}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Icon3D emoji={integration.icon} size="lg" />
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
          disabled={isLoading}
          data-testid={`button-connect-${integration.type}`}
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Connect {integration.name}
            </>
          )}
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
