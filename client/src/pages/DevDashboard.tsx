import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { PageHeader, SectionHeader } from "@/components/ui/section-header";
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardDescription, OrbitCardContent, OrbitCardFooter, StatCard } from "@/components/ui/orbit-card";
import { 
  Network, 
  Link2, 
  Activity, 
  RefreshCw,
  Key,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  ExternalLink,
  Clock,
  BarChart3,
  Shield,
  Zap,
  Users,
  FileText,
  Megaphone,
  Download,
  Lock,
  Wifi,
  WifiOff,
  AlertTriangle,
  Eye,
  Check,
  X,
  Hash
} from "lucide-react";
import { useLocation } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const DEV_PIN = "0424";

interface DashboardStats {
  connectedApps: number;
  totalApps: number;
  apiCallsToday: number;
  activeDevelopers: number;
  blockchainAnchors: number;
  pendingAnchors: number;
  codeSnippets: number;
  dataSyncs: number;
  errorRate: number;
  trustvaultNetwork: 'connected' | 'disconnected';
  lastUpdated: string;
}

interface ActivityItem {
  id: string;
  type: 'ecosystem' | 'api_call';
  action: string;
  appName: string;
  resource?: string;
  details?: Record<string, any>;
  timestamp: string;
}

interface ConnectedApp {
  id: string;
  appName: string;
  appSlug: string;
  appUrl?: string;
  description?: string;
  apiKey?: string;
  permissions?: string[];
  isActive: boolean;
  lastSyncAt?: string;
  syncCount?: number;
  createdAt: string;
}

interface DeveloperApplication {
  id: number;
  email: string;
  name?: string;
  company?: string;
  reason?: string;
  status: string;
  createdAt: string;
}

interface UsageData {
  dailyUsage: Array<{ date: string; count: number; errors: number }>;
  callsByApp: Array<{ appName: string; count: number }>;
}

export default function DevDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<DashboardStats>({
    queryKey: ['/api/dev/dashboard/stats'],
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const { data: activity = [], isLoading: activityLoading } = useQuery<ActivityItem[]>({
    queryKey: ['/api/dev/dashboard/activity'],
    enabled: isAuthenticated,
    refetchInterval: 10000,
  });

  const { data: apps = [], isLoading: appsLoading } = useQuery<ConnectedApp[]>({
    queryKey: ['/api/dev/dashboard/apps'],
    enabled: isAuthenticated,
  });

  const { data: applications = [] } = useQuery<DeveloperApplication[]>({
    queryKey: ['/api/dev/dashboard/applications'],
    enabled: isAuthenticated,
  });

  const { data: usageData } = useQuery<UsageData>({
    queryKey: ['/api/dev/dashboard/usage'],
    enabled: isAuthenticated,
  });

  const updateApplicationMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      const res = await fetch(`/api/dev/dashboard/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dev/dashboard/applications'] });
      toast({ title: 'Application updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update application', description: error.message, variant: 'destructive' });
    },
  });

  const regenerateKeyMutation = useMutation({
    mutationFn: async (appId: string) => {
      const res = await fetch(`/api/admin/ecosystem/apps/${appId}/regenerate`, { method: 'POST' });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/dev/dashboard/apps'] });
      toast({ 
        title: 'Credentials regenerated', 
        description: 'New API key generated. Make sure to save the new secret.',
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to regenerate key', description: error.message, variant: 'destructive' });
    },
  });

  const deactivateAppMutation = useMutation({
    mutationFn: async (appId: string) => {
      const res = await fetch(`/api/admin/ecosystem/apps/${appId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dev/dashboard/apps'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dev/dashboard/stats'] });
      toast({ title: 'App disconnected' });
    },
  });

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === DEV_PIN) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied to clipboard` });
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };

  const getActionIcon = (action: string) => {
    if (action.includes('sync')) return <RefreshCw className="h-4 w-4 text-blue-400" />;
    if (action.includes('register')) return <CheckCircle className="h-4 w-4 text-green-400" />;
    if (action.includes('credentials')) return <Key className="h-4 w-4 text-amber-400" />;
    if (action.includes('GET') || action.includes('POST')) return <Activity className="h-4 w-4 text-cyan-400" />;
    return <Activity className="h-4 w-4 text-slate-400" />;
  };

  const CHART_COLORS = ['#22d3ee', '#06b6d4', '#0891b2', '#0e7490', '#155e75'];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4" data-testid="dev-dashboard-login">
        <OrbitCard className="w-full max-w-md">
          <OrbitCardHeader icon={<Lock className="h-8 w-8 text-cyan-400" />}>
            <OrbitCardTitle>Developer Access</OrbitCardTitle>
            <OrbitCardDescription>Enter developer PIN to access the Ecosystem Command Center</OrbitCardDescription>
          </OrbitCardHeader>
          <OrbitCardContent>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter PIN"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className={`bg-slate-800 border-slate-600 text-center text-2xl tracking-widest ${pinError ? 'border-red-500' : ''}`}
                  maxLength={4}
                  data-testid="input-dev-pin"
                />
                {pinError && (
                  <p className="text-red-400 text-sm text-center" data-testid="text-pin-error">Invalid PIN. Try again.</p>
                )}
              </div>
              <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700" data-testid="button-submit-pin">
                <Shield className="h-4 w-4 mr-2" />
                Access Dashboard
              </Button>
            </form>
          </OrbitCardContent>
        </OrbitCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6" data-testid="dev-dashboard-page">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Orbit Ecosystem Command Center"
          subtitle={`Real-time ecosystem monitoring | ${currentTime.toLocaleString()}`}
          actions={
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {stats?.trustvaultNetwork === 'connected' ? (
                  <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30" data-testid="status-connected">
                    <Wifi className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge className="bg-red-600/20 text-red-400 border-red-600/30" data-testid="status-disconnected">
                    <WifiOff className="h-3 w-3 mr-1" />
                    Disconnected
                  </Badge>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => refetchStats()}
                className="border-cyan-600/30 text-cyan-400 hover:bg-cyan-950/30"
                data-testid="button-refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          }
        />

        <BentoGrid cols={4} gap="md">
          <BentoTile>
            <StatCard
              label="Connected Apps"
              value={stats?.connectedApps || 0}
              icon={<Link2 className="h-8 w-8" />}
              data-testid="stat-connected-apps"
            />
          </BentoTile>
          <BentoTile>
            <StatCard
              label="API Calls Today"
              value={stats?.apiCallsToday || 0}
              icon={<Activity className="h-8 w-8 text-emerald-400" />}
              className="[&_.text-cyan-400]:text-emerald-400"
              data-testid="stat-api-calls"
            />
          </BentoTile>
          <BentoTile>
            <StatCard
              label="Active Developers"
              value={stats?.activeDevelopers || 0}
              icon={<Users className="h-8 w-8 text-amber-400" />}
              className="[&_.text-cyan-400]:text-amber-400"
              data-testid="stat-developers"
            />
          </BentoTile>
          <BentoTile>
            <StatCard
              label="Blockchain Anchors"
              value={stats?.blockchainAnchors || 0}
              icon={<Hash className="h-8 w-8 text-purple-400" />}
              className="[&_.text-cyan-400]:text-purple-400"
              data-testid="stat-blockchain"
            />
          </BentoTile>
        </BentoGrid>

        <Tabs defaultValue="apps" className="w-full">
          <TabsList className="bg-slate-800/50 border border-slate-700 flex-wrap h-auto p-1">
            <TabsTrigger value="apps" className="data-[state=active]:bg-cyan-600" data-testid="tab-apps">
              <Link2 className="h-4 w-4 mr-2" />
              Connected Apps
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-cyan-600" data-testid="tab-activity">
              <Activity className="h-4 w-4 mr-2" />
              Activity Feed
            </TabsTrigger>
            <TabsTrigger value="applications" className="data-[state=active]:bg-cyan-600" data-testid="tab-applications">
              <Users className="h-4 w-4 mr-2" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="usage" className="data-[state=active]:bg-cyan-600" data-testid="tab-usage">
              <BarChart3 className="h-4 w-4 mr-2" />
              API Usage
            </TabsTrigger>
            <TabsTrigger value="blockchain" className="data-[state=active]:bg-cyan-600" data-testid="tab-blockchain">
              <Hash className="h-4 w-4 mr-2" />
              Blockchain
            </TabsTrigger>
          </TabsList>

          <TabsContent value="apps" className="space-y-4 mt-4">
            <SectionHeader title="Connected Ecosystem Apps" subtitle="Manage apps connected to the ORBIT ecosystem" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {apps.map((app) => (
                <OrbitCard key={app.id} data-testid={`app-card-${app.appSlug}`}>
                  <OrbitCardHeader
                    icon={
                      <div className="h-12 w-12 bg-gradient-to-br from-cyan-600 to-cyan-800 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{app.appName[0]}</span>
                      </div>
                    }
                    action={
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => regenerateKeyMutation.mutate(app.id)}
                          className="border-amber-600/30 text-amber-400 hover:bg-amber-950/30"
                          data-testid={`button-regenerate-${app.appSlug}`}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deactivateAppMutation.mutate(app.id)}
                          className="border-red-600/30 text-red-400 hover:bg-red-950/30"
                          data-testid={`button-disconnect-${app.appSlug}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    }
                  >
                    <OrbitCardTitle className="flex items-center gap-2">
                      {app.appName}
                      {app.isActive ? (
                        <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30">Active</Badge>
                      ) : (
                        <Badge className="bg-red-600/20 text-red-400 border-red-600/30">Inactive</Badge>
                      )}
                    </OrbitCardTitle>
                    <OrbitCardDescription>{app.appUrl || app.appSlug}</OrbitCardDescription>
                  </OrbitCardHeader>
                  <OrbitCardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">API Key:</span>
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-slate-300 bg-slate-800 px-2 py-1 rounded">
                            {app.apiKey || 'Not set'}
                          </code>
                          {app.apiKey && (
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(app.apiKey!, 'API Key')}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {app.permissions?.slice(0, 3).map((p) => (
                          <Badge key={p} variant="outline" className="text-xs border-slate-600 text-slate-400">{p}</Badge>
                        ))}
                        {(app.permissions?.length || 0) > 3 && (
                          <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">+{(app.permissions?.length || 0) - 3}</Badge>
                        )}
                      </div>
                    </div>
                  </OrbitCardContent>
                  <OrbitCardFooter>
                    <div className="text-sm">
                      <p className="text-slate-400">Last sync</p>
                      <p className="text-white">{formatDate(app.lastSyncAt)}</p>
                    </div>
                    <div className="text-sm text-right">
                      <p className="text-slate-400">Syncs</p>
                      <p className="text-white">{app.syncCount || 0}</p>
                    </div>
                  </OrbitCardFooter>
                </OrbitCard>
              ))}
              {apps.length === 0 && !appsLoading && (
                <div className="col-span-full text-center py-12 text-slate-400">
                  No connected apps yet. Register an app to get started.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <SectionHeader title="Recent Activity" subtitle="Real-time ecosystem events and API calls" />
            <OrbitCard>
              <OrbitCardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {activity.map((item) => (
                      <div 
                        key={`${item.type}-${item.id}`} 
                        className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                        data-testid={`activity-item-${item.id}`}
                      >
                        {getActionIcon(item.action)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-white">{item.appName}</span>
                            <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                              {item.type === 'api_call' ? 'API' : 'Ecosystem'}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-300 mt-1">{item.action}</p>
                          {item.details && Object.keys(item.details).length > 0 && (
                            <p className="text-xs text-slate-500 mt-1">
                              {JSON.stringify(item.details)}
                            </p>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 whitespace-nowrap">
                          {formatDate(item.timestamp)}
                        </div>
                      </div>
                    ))}
                    {activity.length === 0 && !activityLoading && (
                      <div className="text-center py-12 text-slate-400">
                        No recent activity
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </OrbitCardContent>
            </OrbitCard>
          </TabsContent>

          <TabsContent value="applications" className="mt-4">
            <SectionHeader title="Developer Applications" subtitle="Pending applications from developers wanting to join the ecosystem" />
            <OrbitCard>
              <OrbitCardContent>
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div 
                      key={app.id} 
                      className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
                      data-testid={`application-${app.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{app.name || app.email}</span>
                          <Badge 
                            className={
                              app.status === 'approved' ? 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30' :
                              app.status === 'rejected' ? 'bg-red-600/20 text-red-400 border-red-600/30' :
                              'bg-amber-600/20 text-amber-400 border-amber-600/30'
                            }
                          >
                            {app.status}
                          </Badge>
                        </div>
                        {app.company && <p className="text-sm text-slate-400 mt-1">{app.company}</p>}
                        {app.reason && <p className="text-sm text-slate-300 mt-2">{app.reason}</p>}
                        <p className="text-xs text-slate-500 mt-2">Applied: {formatDate(app.createdAt)}</p>
                      </div>
                      {app.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateApplicationMutation.mutate({ id: app.id, status: 'approved' })}
                            className="border-emerald-600/30 text-emerald-400 hover:bg-emerald-950/30"
                            data-testid={`button-approve-${app.id}`}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateApplicationMutation.mutate({ id: app.id, status: 'rejected' })}
                            className="border-red-600/30 text-red-400 hover:bg-red-950/30"
                            data-testid={`button-reject-${app.id}`}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {applications.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                      No developer applications
                    </div>
                  )}
                </div>
              </OrbitCardContent>
            </OrbitCard>
          </TabsContent>

          <TabsContent value="usage" className="space-y-4 mt-4">
            <SectionHeader title="API Usage Analytics" subtitle="Track API call volume and error rates" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <OrbitCard>
                <OrbitCardHeader icon={<BarChart3 className="h-6 w-6 text-cyan-400" />}>
                  <OrbitCardTitle>Daily API Calls</OrbitCardTitle>
                  <OrbitCardDescription>Last 7 days of API activity</OrbitCardDescription>
                </OrbitCardHeader>
                <OrbitCardContent>
                  <div className="h-[300px]">
                    {usageData?.dailyUsage && usageData.dailyUsage.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={usageData.dailyUsage}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                          <YAxis stroke="#9ca3af" fontSize={12} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                            labelStyle={{ color: '#e2e8f0' }}
                          />
                          <Bar dataKey="count" fill="#22d3ee" name="Calls" />
                          <Bar dataKey="errors" fill="#ef4444" name="Errors" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400">
                        No usage data available
                      </div>
                    )}
                  </div>
                </OrbitCardContent>
              </OrbitCard>

              <OrbitCard>
                <OrbitCardHeader icon={<Network className="h-6 w-6 text-cyan-400" />}>
                  <OrbitCardTitle>Calls by App</OrbitCardTitle>
                  <OrbitCardDescription>Distribution of API calls by application</OrbitCardDescription>
                </OrbitCardHeader>
                <OrbitCardContent>
                  <div className="h-[300px]">
                    {usageData?.callsByApp && usageData.callsByApp.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={usageData.callsByApp}
                            dataKey="count"
                            nameKey="appName"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={({ appName, percent }) => `${appName}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {usageData.callsByApp.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400">
                        No app usage data available
                      </div>
                    )}
                  </div>
                </OrbitCardContent>
              </OrbitCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <OrbitCard>
                <OrbitCardContent className="text-center py-6">
                  <div className="text-3xl font-bold text-cyan-400" data-testid="stat-total-calls">
                    {usageData?.dailyUsage?.reduce((sum, d) => sum + Number(d.count), 0) || 0}
                  </div>
                  <p className="text-slate-400 mt-1">Total Calls (7 days)</p>
                </OrbitCardContent>
              </OrbitCard>
              <OrbitCard>
                <OrbitCardContent className="text-center py-6">
                  <div className="text-3xl font-bold text-red-400" data-testid="stat-error-rate">
                    {stats?.errorRate?.toFixed(1) || 0}%
                  </div>
                  <p className="text-slate-400 mt-1">Error Rate</p>
                </OrbitCardContent>
              </OrbitCard>
              <OrbitCard>
                <OrbitCardContent className="text-center py-6">
                  <div className="text-3xl font-bold text-emerald-400" data-testid="stat-data-syncs">
                    {stats?.dataSyncs || 0}
                  </div>
                  <p className="text-slate-400 mt-1">Data Syncs</p>
                </OrbitCardContent>
              </OrbitCard>
            </div>
          </TabsContent>

          <TabsContent value="blockchain" className="space-y-4 mt-4">
            <SectionHeader title="Blockchain Stats" subtitle="TrustVault network anchoring statistics" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <OrbitCard>
                <OrbitCardContent className="text-center py-6">
                  <Hash className="h-10 w-10 text-purple-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-purple-400" data-testid="stat-total-anchors">
                    {stats?.blockchainAnchors || 0}
                  </div>
                  <p className="text-slate-400 mt-1">Total Anchored</p>
                </OrbitCardContent>
              </OrbitCard>
              <OrbitCard>
                <OrbitCardContent className="text-center py-6">
                  <Clock className="h-10 w-10 text-amber-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-amber-400" data-testid="stat-pending-anchors">
                    {stats?.pendingAnchors || 0}
                  </div>
                  <p className="text-slate-400 mt-1">Pending Anchors</p>
                </OrbitCardContent>
              </OrbitCard>
              <OrbitCard>
                <OrbitCardContent className="text-center py-6">
                  {stats?.trustvaultNetwork === 'connected' ? (
                    <>
                      <Wifi className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
                      <div className="text-xl font-bold text-emerald-400">Connected</div>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-10 w-10 text-red-400 mx-auto mb-3" />
                      <div className="text-xl font-bold text-red-400">Disconnected</div>
                    </>
                  )}
                  <p className="text-slate-400 mt-1">TrustVault Network</p>
                </OrbitCardContent>
              </OrbitCard>
              <OrbitCard>
                <OrbitCardContent className="text-center py-6">
                  <Zap className="h-10 w-10 text-cyan-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-cyan-400" data-testid="stat-code-snippets">
                    {stats?.codeSnippets || 0}
                  </div>
                  <p className="text-slate-400 mt-1">Code Snippets</p>
                </OrbitCardContent>
              </OrbitCard>
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="border-cyan-600/30 text-cyan-400 hover:bg-cyan-950/30 h-auto py-4"
            onClick={() => setLocation('/ecosystem-hub')}
            data-testid="button-register-app"
          >
            <div className="text-center">
              <Network className="h-6 w-6 mx-auto mb-2" />
              <span>Register New App</span>
            </div>
          </Button>
          <Button
            variant="outline"
            className="border-emerald-600/30 text-emerald-400 hover:bg-emerald-950/30 h-auto py-4"
            onClick={() => window.open('/api/docs', '_blank')}
            data-testid="button-api-docs"
          >
            <div className="text-center">
              <FileText className="h-6 w-6 mx-auto mb-2" />
              <span>API Documentation</span>
            </div>
          </Button>
          <Button
            variant="outline"
            className="border-amber-600/30 text-amber-400 hover:bg-amber-950/30 h-auto py-4"
            onClick={() => toast({ title: 'Coming soon', description: 'Report download feature is under development' })}
            data-testid="button-download-report"
          >
            <div className="text-center">
              <Download className="h-6 w-6 mx-auto mb-2" />
              <span>Download Report</span>
            </div>
          </Button>
          <Button
            variant="outline"
            className="border-purple-600/30 text-purple-400 hover:bg-purple-950/30 h-auto py-4"
            onClick={() => toast({ title: 'Coming soon', description: 'Announcement feature is under development' })}
            data-testid="button-broadcast"
          >
            <div className="text-center">
              <Megaphone className="h-6 w-6 mx-auto mb-2" />
              <span>Broadcast Announcement</span>
            </div>
          </Button>
        </div>

        <div className="text-center text-xs text-slate-500 pt-4">
          Last updated: {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleString() : 'Never'}
        </div>
      </div>
    </div>
  );
}
