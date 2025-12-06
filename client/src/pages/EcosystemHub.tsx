import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Network, 
  Link2, 
  Code, 
  Activity, 
  Settings, 
  Plus,
  RefreshCw,
  Key,
  Shield,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  ExternalLink,
  Clock,
  BarChart3,
  Users,
  FileCode,
  Database,
  ArrowRightLeft
} from "lucide-react";

const ECOSYSTEM_PERMISSIONS = [
  { id: 'read:code', name: 'Read Code', description: 'Access shared code snippets' },
  { id: 'write:code', name: 'Write Code', description: 'Push code snippets to ecosystem' },
  { id: 'read:workers', name: 'Read Workers', description: 'Access worker/contractor data' },
  { id: 'write:workers', name: 'Write Workers', description: 'Sync worker data to ecosystem' },
  { id: 'read:1099', name: 'Read 1099', description: 'Access 1099 compliance data' },
  { id: 'write:1099', name: 'Write 1099', description: 'Push 1099 payment data' },
  { id: 'read:timesheets', name: 'Read Timesheets', description: 'Access timesheet data' },
  { id: 'write:timesheets', name: 'Write Timesheets', description: 'Sync timesheet records' },
  { id: 'read:certifications', name: 'Read Certifications', description: 'Access worker certifications' },
  { id: 'write:certifications', name: 'Write Certifications', description: 'Sync certification data' },
  { id: 'read:compliance', name: 'Read Compliance', description: 'Access compliance documents' },
  { id: 'write:compliance', name: 'Write Compliance', description: 'Push compliance records' },
  { id: 'sync:all', name: 'Full Sync', description: 'Complete read/write access' },
];

export default function EcosystemHub() {
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [credentialsDialog, setCredentialsDialog] = useState<{ open: boolean; apiKey?: string; apiSecret?: string }>({ open: false });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [newApp, setNewApp] = useState({ appName: '', appSlug: '', appUrl: '', description: '' });
  const [externalHub, setExternalHub] = useState({ hubName: '', hubUrl: '', apiKey: '', apiSecret: '' });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats } = useQuery<{
    totalApps: number;
    activeApps: number;
    totalSnippets: number;
    totalSyncs: number;
    recentActivity: any[];
  }>({
    queryKey: ['/api/admin/ecosystem/stats'],
    refetchInterval: 30000,
  });

  const { data: connectedApps = [] } = useQuery({
    queryKey: ['/api/admin/ecosystem/apps'],
  });

  const { data: externalHubs = [] } = useQuery({
    queryKey: ['/api/admin/ecosystem/external-hubs'],
  });

  const { data: syncHistory = [] } = useQuery({
    queryKey: ['/api/admin/ecosystem/syncs'],
  });

  const { data: snippets = [] } = useQuery({
    queryKey: ['/api/admin/ecosystem/snippets'],
  });

  const registerAppMutation = useMutation({
    mutationFn: async (data: typeof newApp & { permissions: string[] }) => {
      const res = await fetch('/api/admin/ecosystem/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ecosystem/apps'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ecosystem/stats'] });
      setRegisterDialogOpen(false);
      setNewApp({ appName: '', appSlug: '', appUrl: '', description: '' });
      setSelectedPermissions([]);
      setCredentialsDialog({
        open: true,
        apiKey: data.credentials.apiKey,
        apiSecret: data.credentials.apiSecret,
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to register app', description: error.message, variant: 'destructive' });
    },
  });

  const deactivateAppMutation = useMutation({
    mutationFn: async (appId: string) => {
      const res = await fetch(`/api/admin/ecosystem/apps/${appId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ecosystem/apps'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ecosystem/stats'] });
      toast({ title: 'App deactivated' });
    },
  });

  const regenerateCredentialsMutation = useMutation({
    mutationFn: async (appId: string) => {
      const res = await fetch(`/api/admin/ecosystem/apps/${appId}/regenerate`, { method: 'POST' });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data) => {
      setCredentialsDialog({
        open: true,
        apiKey: data.apiKey,
        apiSecret: data.apiSecret,
      });
    },
  });

  const connectHubMutation = useMutation({
    mutationFn: async (data: typeof externalHub) => {
      const res = await fetch('/api/admin/ecosystem/external-hubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ecosystem/external-hubs'] });
      setConnectDialogOpen(false);
      setExternalHub({ hubName: '', hubUrl: '', apiKey: '', apiSecret: '' });
      toast({ title: 'Connected to external hub' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to connect', description: error.message, variant: 'destructive' });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (hubId: string) => {
      const res = await fetch(`/api/admin/ecosystem/external-hubs/${hubId}/test`, { method: 'POST' });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.connected ? 'Connection successful' : 'Connection failed',
        description: data.connected ? `Permissions: ${data.permissions.join(', ')}` : 'Check credentials',
        variant: data.connected ? 'default' : 'destructive',
      });
    },
  });

  const removeHubMutation = useMutation({
    mutationFn: async (hubId: string) => {
      const res = await fetch(`/api/admin/ecosystem/external-hubs/${hubId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ecosystem/external-hubs'] });
      toast({ title: 'Hub disconnected' });
    },
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied to clipboard` });
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) 
        ? prev.filter(p => p !== permId)
        : [...prev, permId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6" data-testid="ecosystem-hub-page">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Network className="h-8 w-8 text-cyan-400" />
              DarkWave Ecosystem Hub
            </h1>
            <p className="text-slate-400 mt-1">Connect and manage integrations across all DarkWave products</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-cyan-600/30 text-cyan-400 hover:bg-cyan-950/30" data-testid="connect-hub-button">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect to Hub
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Connect to External Hub</DialogTitle>
                  <DialogDescription>Connect ORBIT to another DarkWave ecosystem hub</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Hub Name</Label>
                    <Input
                      placeholder="Brew & Board Hub"
                      value={externalHub.hubName}
                      onChange={(e) => setExternalHub(prev => ({ ...prev, hubName: e.target.value }))}
                      className="bg-slate-800 border-slate-600"
                      data-testid="input-hub-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hub URL</Label>
                    <Input
                      placeholder="https://brewandboard.coffee"
                      value={externalHub.hubUrl}
                      onChange={(e) => setExternalHub(prev => ({ ...prev, hubUrl: e.target.value }))}
                      className="bg-slate-800 border-slate-600"
                      data-testid="input-hub-url"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input
                      placeholder="dw_app_..."
                      value={externalHub.apiKey}
                      onChange={(e) => setExternalHub(prev => ({ ...prev, apiKey: e.target.value }))}
                      className="bg-slate-800 border-slate-600"
                      data-testid="input-hub-api-key"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>API Secret</Label>
                    <Input
                      type="password"
                      placeholder="dw_secret_..."
                      value={externalHub.apiSecret}
                      onChange={(e) => setExternalHub(prev => ({ ...prev, apiSecret: e.target.value }))}
                      className="bg-slate-800 border-slate-600"
                      data-testid="input-hub-api-secret"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => connectHubMutation.mutate(externalHub)}
                    disabled={!externalHub.hubName || !externalHub.hubUrl || connectHubMutation.isPending}
                    className="bg-cyan-600 hover:bg-cyan-700"
                    data-testid="button-connect-hub"
                  >
                    {connectHubMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                    Connect
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-cyan-600 hover:bg-cyan-700" data-testid="register-app-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Register App
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white">Register New App</DialogTitle>
                  <DialogDescription>Allow a DarkWave product to connect to this ecosystem hub</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label>App Name</Label>
                    <Input
                      placeholder="Brew & Board Coffee"
                      value={newApp.appName}
                      onChange={(e) => setNewApp(prev => ({ ...prev, appName: e.target.value }))}
                      className="bg-slate-800 border-slate-600"
                      data-testid="input-app-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>App Slug</Label>
                    <Input
                      placeholder="brewandboard"
                      value={newApp.appSlug}
                      onChange={(e) => setNewApp(prev => ({ ...prev, appSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                      className="bg-slate-800 border-slate-600"
                      data-testid="input-app-slug"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>App URL (optional)</Label>
                    <Input
                      placeholder="https://brewandboard.coffee"
                      value={newApp.appUrl}
                      onChange={(e) => setNewApp(prev => ({ ...prev, appUrl: e.target.value }))}
                      className="bg-slate-800 border-slate-600"
                      data-testid="input-app-url"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Description (optional)</Label>
                    <Input
                      placeholder="Coffee shop management platform"
                      value={newApp.description}
                      onChange={(e) => setNewApp(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-slate-800 border-slate-600"
                      data-testid="input-app-description"
                    />
                  </div>
                  <div className="col-span-2 space-y-3">
                    <Label>Permissions</Label>
                    <ScrollArea className="h-48 border border-slate-700 rounded-lg p-3">
                      <div className="space-y-2">
                        {ECOSYSTEM_PERMISSIONS.map((perm) => (
                          <div key={perm.id} className="flex items-center space-x-3">
                            <Checkbox
                              id={perm.id}
                              checked={selectedPermissions.includes(perm.id)}
                              onCheckedChange={() => togglePermission(perm.id)}
                              data-testid={`checkbox-${perm.id}`}
                            />
                            <label htmlFor={perm.id} className="flex-1 cursor-pointer">
                              <span className="text-white font-medium">{perm.name}</span>
                              <span className="text-slate-400 text-sm ml-2">- {perm.description}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => registerAppMutation.mutate({ ...newApp, permissions: selectedPermissions })}
                    disabled={!newApp.appName || !newApp.appSlug || registerAppMutation.isPending}
                    className="bg-cyan-600 hover:bg-cyan-700"
                    data-testid="button-register-app"
                  >
                    {registerAppMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                    Register & Generate Credentials
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Connected Apps</p>
                  <p className="text-3xl font-bold text-white">{stats?.activeApps || 0}</p>
                </div>
                <Link2 className="h-10 w-10 text-cyan-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Code Snippets</p>
                  <p className="text-3xl font-bold text-white">{stats?.totalSnippets || 0}</p>
                </div>
                <Code className="h-10 w-10 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Data Syncs</p>
                  <p className="text-3xl font-bold text-white">{stats?.totalSyncs || 0}</p>
                </div>
                <ArrowRightLeft className="h-10 w-10 text-amber-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">External Hubs</p>
                  <p className="text-3xl font-bold text-white">{(externalHubs as any[])?.length || 0}</p>
                </div>
                <Network className="h-10 w-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="apps" className="w-full">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="apps" className="data-[state=active]:bg-cyan-600" data-testid="tab-apps">
              <Link2 className="h-4 w-4 mr-2" />
              Connected Apps
            </TabsTrigger>
            <TabsTrigger value="hubs" className="data-[state=active]:bg-cyan-600" data-testid="tab-hubs">
              <Network className="h-4 w-4 mr-2" />
              External Hubs
            </TabsTrigger>
            <TabsTrigger value="syncs" className="data-[state=active]:bg-cyan-600" data-testid="tab-syncs">
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Sync History
            </TabsTrigger>
            <TabsTrigger value="snippets" className="data-[state=active]:bg-cyan-600" data-testid="tab-snippets">
              <Code className="h-4 w-4 mr-2" />
              Code Snippets
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-cyan-600" data-testid="tab-activity">
              <Activity className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="apps" className="mt-4">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Apps Connected to ORBIT Hub</CardTitle>
                <CardDescription>Other DarkWave products that can sync data with ORBIT</CardDescription>
              </CardHeader>
              <CardContent>
                {(connectedApps as any[])?.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No apps connected yet</p>
                    <p className="text-sm">Register an app to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(connectedApps as any[])?.map((app: any) => (
                      <div key={app.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700" data-testid={`app-${app.appSlug}`}>
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-gradient-to-br from-cyan-600 to-cyan-800 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">{app.appName[0]}</span>
                          </div>
                          <div>
                            <h3 className="text-white font-semibold flex items-center gap-2">
                              {app.appName}
                              {app.isActive ? (
                                <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30">Active</Badge>
                              ) : (
                                <Badge className="bg-red-600/20 text-red-400 border-red-600/30">Inactive</Badge>
                              )}
                            </h3>
                            <p className="text-slate-400 text-sm">{app.appUrl || app.appSlug}</p>
                            <div className="flex gap-1 mt-1">
                              {app.permissions?.slice(0, 3).map((p: string) => (
                                <Badge key={p} variant="outline" className="text-xs border-slate-600 text-slate-400">{p}</Badge>
                              ))}
                              {app.permissions?.length > 3 && (
                                <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">+{app.permissions.length - 3}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm">
                            <p className="text-slate-400">Last sync</p>
                            <p className="text-white">{formatDate(app.lastSyncAt)}</p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="text-slate-400">Syncs</p>
                            <p className="text-white">{app.syncCount || 0}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => regenerateCredentialsMutation.mutate(app.id)}
                              className="border-amber-600/30 text-amber-400 hover:bg-amber-950/30"
                              data-testid={`regenerate-${app.appSlug}`}
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deactivateAppMutation.mutate(app.id)}
                              className="border-red-600/30 text-red-400 hover:bg-red-950/30"
                              data-testid={`deactivate-${app.appSlug}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hubs" className="mt-4">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">External Ecosystem Hubs</CardTitle>
                <CardDescription>Other DarkWave hubs that ORBIT connects to</CardDescription>
              </CardHeader>
              <CardContent>
                {(externalHubs as any[])?.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No external hubs connected</p>
                    <p className="text-sm">Connect to other DarkWave products to share data</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(externalHubs as any[])?.map((hub: any) => (
                      <div key={hub.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700" data-testid={`hub-${hub.id}`}>
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
                            <ExternalLink className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold flex items-center gap-2">
                              {hub.hubName}
                              {hub.isActive ? (
                                <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30">Connected</Badge>
                              ) : (
                                <Badge className="bg-slate-600/20 text-slate-400 border-slate-600/30">Inactive</Badge>
                              )}
                            </h3>
                            <p className="text-slate-400 text-sm">{hub.hubUrl}</p>
                            <div className="flex gap-1 mt-1">
                              {hub.permissions?.slice(0, 3).map((p: string) => (
                                <Badge key={p} variant="outline" className="text-xs border-slate-600 text-slate-400">{p}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm">
                            <p className="text-slate-400">Last sync</p>
                            <p className="text-white">{formatDate(hub.lastSyncAt)}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => testConnectionMutation.mutate(hub.id)}
                              disabled={testConnectionMutation.isPending}
                              className="border-cyan-600/30 text-cyan-400 hover:bg-cyan-950/30"
                              data-testid={`test-hub-${hub.id}`}
                            >
                              {testConnectionMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeHubMutation.mutate(hub.id)}
                              className="border-red-600/30 text-red-400 hover:bg-red-950/30"
                              data-testid={`remove-hub-${hub.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="syncs" className="mt-4">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Sync History</CardTitle>
                <CardDescription>Recent data synchronizations across the ecosystem</CardDescription>
              </CardHeader>
              <CardContent>
                {(syncHistory as any[])?.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <ArrowRightLeft className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No sync history yet</p>
                    <p className="text-sm">Data syncs will appear here when apps exchange data</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(syncHistory as any[])?.map((sync: any) => (
                      <div key={sync.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/50" data-testid={`sync-${sync.id}`}>
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            sync.status === 'completed' ? 'bg-emerald-600/20' : 
                            sync.status === 'failed' ? 'bg-red-600/20' : 'bg-amber-600/20'
                          }`}>
                            {sync.status === 'completed' ? <CheckCircle className="h-5 w-5 text-emerald-400" /> :
                             sync.status === 'failed' ? <XCircle className="h-5 w-5 text-red-400" /> :
                             <Clock className="h-5 w-5 text-amber-400" />}
                          </div>
                          <div>
                            <p className="text-white font-medium">{sync.syncType}</p>
                            <p className="text-slate-400 text-sm">{sync.sourceAppName} - {sync.direction}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="border-slate-600">{sync.recordCount} records</Badge>
                          <span className="text-slate-400 text-sm">{formatDate(sync.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="snippets" className="mt-4">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Shared Code Snippets</CardTitle>
                <CardDescription>Reusable code shared across DarkWave products</CardDescription>
              </CardHeader>
              <CardContent>
                {(snippets as any[])?.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No code snippets shared yet</p>
                    <p className="text-sm">Apps can push reusable code components here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(snippets as any[])?.map((snippet: any) => (
                      <div key={snippet.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700" data-testid={`snippet-${snippet.id}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-semibold">{snippet.name}</h4>
                          <Badge variant="outline" className="border-cyan-600/30 text-cyan-400">{snippet.language}</Badge>
                        </div>
                        <p className="text-slate-400 text-sm mb-3">{snippet.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            <Badge variant="outline" className="text-xs border-slate-600">{snippet.category}</Badge>
                            {snippet.tags?.map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-xs border-slate-600">{tag}</Badge>
                            ))}
                          </div>
                          <span className="text-slate-500 text-xs">{snippet.usageCount || 0} uses</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
                <CardDescription>Latest ecosystem events and actions</CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.recentActivity?.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No activity yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {stats?.recentActivity?.map((log: any) => (
                      <div key={log.id} className="flex items-center gap-3 p-2 hover:bg-slate-800/30 rounded" data-testid={`activity-${log.id}`}>
                        <div className="h-8 w-8 bg-slate-800 rounded flex items-center justify-center">
                          <Activity className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm">
                            <span className="text-cyan-400">{log.appName}</span>
                            <span className="text-slate-400"> - </span>
                            {log.action}
                          </p>
                        </div>
                        <span className="text-slate-500 text-xs">{formatDate(log.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={credentialsDialog.open} onOpenChange={(open) => setCredentialsDialog(prev => ({ ...prev, open }))}>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-400" />
                API Credentials Generated
              </DialogTitle>
              <DialogDescription className="text-amber-400">
                Save these credentials now. The API secret will not be shown again.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-slate-400">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    value={credentialsDialog.apiKey || ''}
                    readOnly
                    className="bg-slate-800 border-slate-600 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(credentialsDialog.apiKey || '', 'API Key')}
                    data-testid="copy-api-key"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400">API Secret</Label>
                <div className="flex gap-2">
                  <Input
                    value={credentialsDialog.apiSecret || ''}
                    readOnly
                    className="bg-slate-800 border-slate-600 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(credentialsDialog.apiSecret || '', 'API Secret')}
                    data-testid="copy-api-secret"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setCredentialsDialog({ open: false })}
                className="bg-cyan-600 hover:bg-cyan-700"
                data-testid="close-credentials"
              >
                I've Saved These Credentials
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
