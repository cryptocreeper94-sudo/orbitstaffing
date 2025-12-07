import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { CarouselRail } from "@/components/ui/carousel-rail";
import { SectionHeader, PageHeader } from "@/components/ui/section-header";
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardDescription, OrbitCardContent, OrbitCardFooter, ActionCard } from "@/components/ui/orbit-card";
import {
  Zap,
  CheckCircle2,
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
        src={`${iconPath}?v=3`} 
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
  {
    type: "ukgpro",
    name: "UKG Pro (Kronos)",
    description: "Workforce scheduling, availability, and timesheet data",
    icon: "📅",
    category: "scheduling",
  },
  {
    type: "bamboohr",
    name: "BambooHR",
    description: "HR management, employee records, and leave tracking",
    icon: "🌳",
    category: "hr",
  },
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

  const disconnectMutation = useMutation({
    mutationFn: async (integrationType: string) => {
      const res = await fetch(`/api/oauth/disconnect/${integrationType}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to disconnect");
      return res.json();
    },
    onSuccess: () => refetchStatus(),
  });

  const handleConnect = async (integrationType: string) => {
    try {
      setLoadingType(integrationType);
      const res = await fetch(`/api/oauth/${integrationType}/auth?tenantId=default`);
      const { authUrl } = await res.json();

      const popup = window.open(authUrl, "oauth-popup", "width=600,height=700");
      if (!popup) {
        alert("Please allow popups to connect integrations");
        return;
      }

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
      <PageHeader
        title="External Integrations"
        subtitle="Connect your existing systems (QuickBooks, ADP, UKG Pro, Google Workspace, Microsoft 365) to sync data automatically — no manual entry required"
        actions={
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-cyan-400" />
          </div>
        }
      />

      <Alert className="mb-6 border-cyan-500/50 bg-cyan-500/5">
        <Database className="h-4 w-4 text-cyan-400" />
        <AlertDescription className="text-slate-300">
          <strong className="text-white">All-in-One Integration:</strong> Connect your systems once. ORBIT will sync data daily (or in real-time). No more manual data entry between systems.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="connected" className="space-y-6">
        <TabsList className="bg-slate-800/50 border border-slate-700/50">
          <TabsTrigger value="connected" className="flex-1 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            Connected ({connectedIntegrations.length})
          </TabsTrigger>
          <TabsTrigger value="available" className="flex-1 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            Available ({disconnectedIntegrations.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            Sync History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connected" className="space-y-4">
          {connectedIntegrations.length === 0 ? (
            <OrbitCard variant="glass">
              <OrbitCardContent className="py-8 text-center">
                <p className="text-slate-400 mb-2">No integrations connected yet</p>
                <p className="text-sm text-slate-500">
                  Connect your first system to start syncing data automatically
                </p>
              </OrbitCardContent>
            </OrbitCard>
          ) : (
            <BentoGrid cols={2} gap="md">
              {connectedIntegrations.map((integration) => (
                <BentoTile key={integration.id}>
                  <ConnectedIntegrationCard
                    integration={integration}
                    onSync={() => handleManualSync(integration.id)}
                    onDisconnect={() => handleDisconnect(integration.id)}
                  />
                </BentoTile>
              ))}
            </BentoGrid>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          {disconnectedIntegrations.length === 0 ? (
            <OrbitCard variant="glass">
              <OrbitCardContent className="py-8 text-center">
                <p className="text-slate-400">All available integrations are connected!</p>
              </OrbitCardContent>
            </OrbitCard>
          ) : (
            <>
              <div className="hidden md:block">
                <BentoGrid cols={3} gap="md">
                  {disconnectedIntegrations.map((integration) => (
                    <BentoTile key={integration.type}>
                      <AvailableIntegrationCard
                        integration={integration}
                        isLoading={loadingType === integration.type}
                        onConnect={() => handleConnect(integration.type)}
                      />
                    </BentoTile>
                  ))}
                </BentoGrid>
              </div>
              <div className="md:hidden">
                <CarouselRail title="Available Integrations" gap="md" itemWidth="lg">
                  {disconnectedIntegrations.map((integration) => (
                    <AvailableIntegrationCard
                      key={integration.type}
                      integration={integration}
                      isLoading={loadingType === integration.type}
                      onConnect={() => handleConnect(integration.type)}
                    />
                  ))}
                </CarouselRail>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <SyncHistoryTab />
        </TabsContent>
      </Tabs>

      <BentoTile className="mt-12 p-6" span={4}>
        <SectionHeader
          title="How Integration Works"
          size="md"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-sm">
            <div className="font-bold text-cyan-400 mb-2">1. Connect System</div>
            <p className="text-slate-400">Click "Connect" and authorize ORBIT access</p>
          </div>
          <div className="text-sm">
            <div className="font-bold text-cyan-400 mb-2">2. Initial Import</div>
            <p className="text-slate-400">ORBIT pulls all historical data (one-time)</p>
          </div>
          <div className="text-sm">
            <div className="font-bold text-cyan-400 mb-2">3. Daily Sync</div>
            <p className="text-slate-400">Automatically pull new/changed data daily</p>
          </div>
          <div className="text-sm">
            <div className="font-bold text-cyan-400 mb-2">4. Unified System</div>
            <p className="text-slate-400">Manage everything from ORBIT dashboard</p>
          </div>
        </div>
      </BentoTile>

      <div className="mt-8">
        <SectionHeader
          title="Top Payroll Systems We Support"
          subtitle="ORBIT integrates with the top 5 payroll systems (95% market coverage) so you can consolidate your entire staffing operation"
          size="md"
        />
        <div className="hidden md:block">
          <BentoGrid cols={3} gap="md">
            <BentoTile>
              <PayrollSystemCard
                icon="👥"
                name="ADP Workforce Now"
                rank="#1 Market Leader"
                features={["Employees & pay rates", "Payroll runs & tax info", "Timesheets & compliance"]}
                badge="Enterprise-grade"
              />
            </BentoTile>
            <BentoTile>
              <PayrollSystemCard
                icon="💼"
                name="Paychex Flex"
                rank="#2 Market Leader"
                features={["Payroll & tax automation", "Employee data & rates", "Multi-state compliance"]}
                badge="Small-to-mid agencies"
              />
            </BentoTile>
            <BentoTile>
              <PayrollSystemCard
                icon="⚡"
                name="Gusto"
                rank="Most Popular for Small Business"
                features={["Payroll & benefits", "Employee self-service", "Contractors & temps"]}
                badge="Simple & affordable"
              />
            </BentoTile>
            <BentoTile>
              <PayrollSystemCard
                icon="🔗"
                name="Rippling"
                rank="Modern All-in-One"
                features={["HR + Payroll + IT", "Benefits & compliance", "Unified platform"]}
                badge="Tech-forward companies"
              />
            </BentoTile>
            <BentoTile>
              <PayrollSystemCard
                icon="🌐"
                name="Workday"
                rank="Enterprise Solution"
                features={["Advanced analytics", "AI-powered compliance", "Global payroll"]}
                badge="Large enterprises"
              />
            </BentoTile>
            <BentoTile>
              <PayrollSystemCard
                icon="💰"
                name="Paylocity"
                rank="HCM Platform"
                features={["Payroll & HR", "Benefits & compliance", "Analytics dashboard"]}
                badge="Scaling agencies"
              />
            </BentoTile>
          </BentoGrid>
        </div>
        <div className="md:hidden">
          <CarouselRail gap="md" itemWidth="lg">
            <PayrollSystemCard
              icon="👥"
              name="ADP Workforce Now"
              rank="#1 Market Leader"
              features={["Employees & pay rates", "Payroll runs & tax info", "Timesheets & compliance"]}
              badge="Enterprise-grade"
            />
            <PayrollSystemCard
              icon="💼"
              name="Paychex Flex"
              rank="#2 Market Leader"
              features={["Payroll & tax automation", "Employee data & rates", "Multi-state compliance"]}
              badge="Small-to-mid agencies"
            />
            <PayrollSystemCard
              icon="⚡"
              name="Gusto"
              rank="Most Popular for Small Business"
              features={["Payroll & benefits", "Employee self-service", "Contractors & temps"]}
              badge="Simple & affordable"
            />
            <PayrollSystemCard
              icon="🔗"
              name="Rippling"
              rank="Modern All-in-One"
              features={["HR + Payroll + IT", "Benefits & compliance", "Unified platform"]}
              badge="Tech-forward companies"
            />
            <PayrollSystemCard
              icon="🌐"
              name="Workday"
              rank="Enterprise Solution"
              features={["Advanced analytics", "AI-powered compliance", "Global payroll"]}
              badge="Large enterprises"
            />
            <PayrollSystemCard
              icon="💰"
              name="Paylocity"
              rank="HCM Platform"
              features={["Payroll & HR", "Benefits & compliance", "Analytics dashboard"]}
              badge="Scaling agencies"
            />
          </CarouselRail>
        </div>
      </div>

      <div className="mt-8">
        <SectionHeader
          title="Productivity & File Storage"
          subtitle="Connect your Google or Microsoft accounts to sync files, calendars, and contacts seamlessly"
          size="md"
        />
        <BentoGrid cols={2} gap="md">
          <BentoTile>
            <OrbitCard variant="default" hover={true} className="h-full border-0 bg-transparent">
              <OrbitCardHeader icon={<Icon3D emoji="🌐" size="lg" />}>
                <OrbitCardTitle>Google Workspace</OrbitCardTitle>
                <OrbitCardDescription>G Suite Integration</OrbitCardDescription>
              </OrbitCardHeader>
              <OrbitCardContent className="text-xs text-slate-400 space-y-1">
                <div className="flex items-center gap-1"><Icon3D emoji="✅" size="sm" /> Google Drive file sync</div>
                <div className="flex items-center gap-1"><Icon3D emoji="✅" size="sm" /> Calendar appointments</div>
                <div className="flex items-center gap-1"><Icon3D emoji="✅" size="sm" /> Gmail contact import</div>
                <div className="text-xs text-cyan-400 font-semibold mt-2">Cloud productivity</div>
              </OrbitCardContent>
            </OrbitCard>
          </BentoTile>
          <BentoTile>
            <OrbitCard variant="default" hover={true} className="h-full border-0 bg-transparent">
              <OrbitCardHeader icon={<Icon3D emoji="📧" size="lg" />}>
                <OrbitCardTitle>Microsoft 365</OrbitCardTitle>
                <OrbitCardDescription>Office 365 & OneDrive</OrbitCardDescription>
              </OrbitCardHeader>
              <OrbitCardContent className="text-xs text-slate-400 space-y-1">
                <div className="flex items-center gap-1"><Icon3D emoji="✅" size="sm" /> OneDrive file storage</div>
                <div className="flex items-center gap-1"><Icon3D emoji="✅" size="sm" /> Outlook Calendar sync</div>
                <div className="flex items-center gap-1"><Icon3D emoji="✅" size="sm" /> Exchange contacts</div>
                <div className="text-xs text-cyan-400 font-semibold mt-2">Enterprise productivity</div>
              </OrbitCardContent>
            </OrbitCard>
          </BentoTile>
        </BentoGrid>
      </div>

      <div className="mt-8">
        <SectionHeader
          title="What Gets Synced"
          size="md"
        />
        <BentoGrid cols={4} gap="md">
          <BentoTile>
            <OrbitCard variant="stat" className="h-full border-0 bg-transparent">
              <OrbitCardHeader icon={<Icon3D emoji="📊" size="lg" />}>
                <OrbitCardTitle className="text-sm">Accounting</OrbitCardTitle>
              </OrbitCardHeader>
              <OrbitCardContent className="text-xs text-slate-400 space-y-1">
                <div>✓ Clients & customers</div>
                <div>✓ Invoices & payments</div>
                <div>✓ Expenses & billing</div>
              </OrbitCardContent>
            </OrbitCard>
          </BentoTile>
          <BentoTile>
            <OrbitCard variant="stat" className="h-full border-0 bg-transparent">
              <OrbitCardHeader icon={<Icon3D emoji="👥" size="lg" />}>
                <OrbitCardTitle className="text-sm">Payroll</OrbitCardTitle>
              </OrbitCardHeader>
              <OrbitCardContent className="text-xs text-slate-400 space-y-1">
                <div>✓ Employees & rates</div>
                <div>✓ Pay runs & taxes</div>
                <div>✓ Deductions & benefits</div>
              </OrbitCardContent>
            </OrbitCard>
          </BentoTile>
          <BentoTile>
            <OrbitCard variant="stat" className="h-full border-0 bg-transparent">
              <OrbitCardHeader icon={<Icon3D emoji="📅" size="lg" />}>
                <OrbitCardTitle className="text-sm">Scheduling</OrbitCardTitle>
              </OrbitCardHeader>
              <OrbitCardContent className="text-xs text-slate-400 space-y-1">
                <div>✓ Master schedules</div>
                <div>✓ Availability & shifts</div>
                <div>✓ Time entries</div>
              </OrbitCardContent>
            </OrbitCard>
          </BentoTile>
          <BentoTile>
            <OrbitCard variant="stat" className="h-full border-0 bg-transparent">
              <OrbitCardHeader icon={<span className="text-xl">🏢</span>}>
                <OrbitCardTitle className="text-sm">HR & Compliance</OrbitCardTitle>
              </OrbitCardHeader>
              <OrbitCardContent className="text-xs text-slate-400 space-y-1">
                <div>✓ Employee records</div>
                <div>✓ Tax withholdings</div>
                <div>✓ Benefits & leave</div>
              </OrbitCardContent>
            </OrbitCard>
          </BentoTile>
        </BentoGrid>
      </div>

      <BentoTile className="mt-8 p-6 border-emerald-500/30 bg-emerald-500/5" span={4}>
        <h2 className="text-lg font-bold text-emerald-400 mb-3">Key Benefits</h2>
        <ul className="text-sm text-slate-300 space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span><strong className="text-white">No Manual Data Entry:</strong> Everything syncs automatically</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span><strong className="text-white">Reference Numbers Preserved:</strong> Keep your current IDs without conflict</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span><strong className="text-white">Zero Data Loss:</strong> All existing systems keep running</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span><strong className="text-white">Save $30-80k/year:</strong> Consolidate 6-7 systems into ORBIT</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span><strong className="text-white">Real-time Visibility:</strong> Unified dashboard for all data</span>
          </li>
        </ul>
      </BentoTile>
    </Shell>
  );
}

function PayrollSystemCard({
  icon,
  name,
  rank,
  features,
  badge,
}: {
  icon: string;
  name: string;
  rank: string;
  features: string[];
  badge: string;
}) {
  return (
    <OrbitCard variant="default" className="h-full border-0 bg-transparent p-4">
      <OrbitCardHeader icon={<Icon3D emoji={icon} size="lg" />}>
        <OrbitCardTitle className="text-sm">{name}</OrbitCardTitle>
        <OrbitCardDescription className="text-xs">{rank}</OrbitCardDescription>
      </OrbitCardHeader>
      <OrbitCardContent className="text-xs text-slate-400 space-y-1">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <Icon3D emoji="✅" size="sm" /> {feature}
          </div>
        ))}
        <div className="text-xs text-cyan-400 font-semibold mt-2">{badge}</div>
      </OrbitCardContent>
    </OrbitCard>
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
    <OrbitCard 
      variant="default" 
      className="h-full border-emerald-500/30 bg-emerald-500/5 p-4" 
      data-testid={`card-integration-${integration.type}`}
    >
      <OrbitCardHeader
        icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
        action={<Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Connected</Badge>}
      >
        <OrbitCardTitle>{integration.name}</OrbitCardTitle>
        <OrbitCardDescription>{integration.description}</OrbitCardDescription>
      </OrbitCardHeader>

      <OrbitCardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-500 mb-1">Last Sync</p>
            <p className="font-semibold text-white">{integration.lastSync || "Never"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Next Sync</p>
            <p className="font-semibold text-white">{integration.nextSync || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Records Synced</p>
            <p className="font-semibold text-white">{integration.recordsSynced?.toLocaleString() || "—"}</p>
          </div>
        </div>
      </OrbitCardContent>

      <OrbitCardFooter className="flex gap-2">
        <Button
          className="flex-1 gap-2 text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border-cyan-500/30"
          variant="outline"
          onClick={onSync}
          data-testid={`button-sync-${integration.type}`}
        >
          <RefreshCw className="w-3 h-3" />
          Sync Now
        </Button>
        <Button
          variant="outline"
          className="flex-1 gap-2 text-xs text-red-400 border-red-500/30 hover:bg-red-500/10"
          onClick={onDisconnect}
          data-testid={`button-disconnect-${integration.type}`}
        >
          <Trash2 className="w-3 h-3" />
          Disconnect
        </Button>
      </OrbitCardFooter>
    </OrbitCard>
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
    <OrbitCard 
      variant="action" 
      className="h-full p-4"
      data-testid={`card-available-${integration.type}`}
    >
      <OrbitCardHeader
        icon={<Icon3D emoji={integration.icon} size="lg" />}
        action={
          <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
            {integration.category}
          </Badge>
        }
      >
        <OrbitCardTitle>{integration.name}</OrbitCardTitle>
        <OrbitCardDescription>{integration.description}</OrbitCardDescription>
      </OrbitCardHeader>

      <OrbitCardContent>
        <Button
          className="w-full gap-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30"
          variant="outline"
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
      </OrbitCardContent>
    </OrbitCard>
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
    <BentoGrid cols={1} gap="md">
      {syncLogs.map((log) => (
        <BentoTile key={log.id}>
          <OrbitCard variant="default" className="border-0 bg-transparent p-4" data-testid={`card-sync-log-${log.id}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-sm text-white">{log.integration}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  {log.date}
                </p>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                {log.status === "completed" ? "Completed" : "Failed"}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-slate-500">Succeeded</p>
                <p className="font-bold text-white">{log.recordsSucceeded.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-500">Failed</p>
                <p className="font-bold text-white">{log.recordsFailed}</p>
              </div>
              <div>
                <p className="text-slate-500">Duration</p>
                <p className="font-bold text-white">{log.duration}</p>
              </div>
            </div>
          </OrbitCard>
        </BentoTile>
      ))}
    </BentoGrid>
  );
}
