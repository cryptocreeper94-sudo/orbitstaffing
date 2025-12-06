import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Network, 
  LayoutDashboard, 
  Settings,
  ExternalLink,
  Activity,
  Users,
  Code,
  ArrowRightLeft,
  Zap,
  Shield,
  Globe,
  Coffee,
  Car,
  Wrench,
  Sparkles,
  ChevronRight,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2
} from "lucide-react";

const DARKWAVE_PRODUCTS = [
  {
    id: 'orbit-staffing',
    name: 'ORBIT Staffing OS',
    tagline: 'Automated Staffing Platform',
    description: 'End-to-end staffing automation for temporary workers',
    url: 'https://orbitstaffing.io',
    internalPath: '/admin',
    icon: Users,
    color: 'from-cyan-500 to-cyan-700',
    status: 'active',
    features: ['Payroll', 'Compliance', 'Worker Management', 'Client Portal'],
  },
  {
    id: 'brewandboard',
    name: 'Brew & Board Coffee',
    tagline: 'Coffee Shop Management',
    description: 'Scheduling, inventory, and staff management for coffee shops',
    url: 'https://brewandboard.coffee',
    internalPath: null,
    icon: Coffee,
    color: 'from-amber-600 to-amber-800',
    status: 'connected',
    features: ['Scheduling', 'Inventory', 'POS Integration', 'Staff Tips'],
  },
  {
    id: 'lotops',
    name: 'Lot Ops Pro',
    tagline: 'Vehicle Lot Management',
    description: 'Inventory tracking and lot operations for dealerships',
    url: 'https://lotops.pro',
    internalPath: null,
    icon: Car,
    color: 'from-emerald-600 to-emerald-800',
    status: 'pending',
    features: ['Vehicle Tracking', 'Lot Mapping', 'Sales Integration', 'Recon Status'],
  },
  {
    id: 'garagebot',
    name: 'GarageBot',
    tagline: 'Auto Shop Assistant',
    description: 'AI-powered assistant for automotive repair shops',
    url: 'https://garagebot.io',
    internalPath: null,
    icon: Wrench,
    color: 'from-slate-600 to-slate-800',
    status: 'pending',
    features: ['Work Orders', 'Parts Lookup', 'Customer CRM', 'Scheduling'],
  },
  {
    id: 'orby',
    name: 'Orby',
    tagline: 'AI Mascot Platform',
    description: 'Customizable AI mascot for brand engagement',
    url: 'https://getorby.io',
    internalPath: null,
    icon: Sparkles,
    color: 'from-purple-600 to-purple-800',
    status: 'pending',
    features: ['Chat Assistant', 'Brand Customization', 'Analytics', 'Integrations'],
  },
];

export default function DarkWaveHQ() {
  const [, setLocation] = useLocation();

  const { data: ecosystemStats, refetch: refetchStats, isLoading: statsLoading } = useQuery<{
    totalApps: number;
    activeApps: number;
    totalSnippets: number;
    totalSyncs: number;
    recentActivity: any[];
  }>({
    queryKey: ['/api/admin/ecosystem/stats'],
    refetchInterval: 30000,
    retry: false,
  });

  const { data: connectedApps = [], isLoading: appsLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/ecosystem/apps'],
    retry: false,
  });

  const { data: syncHistory = [], isLoading: syncsLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/ecosystem/syncs'],
    retry: false,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'connected':
        return <Badge className="bg-cyan-600/20 text-cyan-400 border-cyan-600/30"><Zap className="h-3 w-3 mr-1" />Connected</Badge>;
      case 'pending':
        return <Badge className="bg-amber-600/20 text-amber-400 border-amber-600/30"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge className="bg-slate-600/20 text-slate-400 border-slate-600/30"><AlertCircle className="h-3 w-3 mr-1" />Offline</Badge>;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" data-testid="darkwave-hq-page">
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Network className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">DarkWave Studios</h1>
                <p className="text-slate-400 text-sm">Developer Headquarters</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/studio">
                <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800" data-testid="link-landing">
                  <Globe className="h-4 w-4 mr-2" />
                  Public Site
                </Button>
              </Link>
              <Link href="/ecosystem-hub">
                <Button variant="outline" size="sm" className="border-cyan-600/30 text-cyan-400 hover:bg-cyan-950/30" data-testid="link-ecosystem">
                  <Settings className="h-4 w-4 mr-2" />
                  Ecosystem Hub
                </Button>
              </Link>
              <Link href="/developer">
                <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700" data-testid="link-dev-panel">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  ORBIT Dev Panel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Products</p>
                  <p className="text-3xl font-bold text-white">{DARKWAVE_PRODUCTS.length}</p>
                </div>
                <Globe className="h-10 w-10 text-cyan-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Connected</p>
                  <p className="text-3xl font-bold text-white">{ecosystemStats?.activeApps || 0}</p>
                </div>
                <Zap className="h-10 w-10 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Syncs</p>
                  <p className="text-3xl font-bold text-white">{ecosystemStats?.totalSyncs || 0}</p>
                </div>
                <ArrowRightLeft className="h-10 w-10 text-amber-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Code Snippets</p>
                  <p className="text-3xl font-bold text-white">{ecosystemStats?.totalSnippets || 0}</p>
                </div>
                <Code className="h-10 w-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="products" className="data-[state=active]:bg-cyan-600" data-testid="tab-products">
              <Globe className="h-4 w-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="ecosystem" className="data-[state=active]:bg-cyan-600" data-testid="tab-ecosystem">
              <Network className="h-4 w-4 mr-2" />
              Ecosystem
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-cyan-600" data-testid="tab-activity">
              <Activity className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DARKWAVE_PRODUCTS.map((product) => {
                const IconComponent = product.icon;
                return (
                  <Card key={product.id} className="bg-slate-900/50 border-slate-700 hover:border-slate-600 transition-colors" data-testid={`product-card-${product.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className={`h-12 w-12 bg-gradient-to-br ${product.color} rounded-lg flex items-center justify-center`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        {getStatusBadge(product.status)}
                      </div>
                      <CardTitle className="text-white mt-3">{product.name}</CardTitle>
                      <CardDescription className="text-cyan-400">{product.tagline}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-400 text-sm mb-4">{product.description}</p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {product.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs border-slate-600 text-slate-400">{feature}</Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        {product.internalPath && (
                          <Link href={product.internalPath}>
                            <Button size="sm" className="flex-1 bg-cyan-600 hover:bg-cyan-700" data-testid={`btn-admin-${product.id}`}>
                              <LayoutDashboard className="h-4 w-4 mr-2" />
                              Dashboard
                            </Button>
                          </Link>
                        )}
                        <a href={product.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <Button size="sm" variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-800" data-testid={`btn-visit-${product.id}`}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Visit
                          </Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="ecosystem" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Network className="h-5 w-5 text-cyan-400" />
                    Connected Apps
                  </CardTitle>
                  <CardDescription>Apps registered in the ecosystem hub</CardDescription>
                </CardHeader>
                <CardContent>
                  {(connectedApps as any[])?.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <Network className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>No apps connected yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(connectedApps as any[])?.map((app: any) => (
                        <div key={app.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg" data-testid={`connected-app-${app.appSlug}`}>
                          <div>
                            <p className="text-white font-medium">{app.appName}</p>
                            <p className="text-slate-400 text-sm">{app.appSlug}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-slate-400 text-xs">Last sync</p>
                            <p className="text-slate-300 text-sm">{formatDate(app.lastSyncAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Link href="/ecosystem-hub">
                    <Button className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700" data-testid="btn-manage-ecosystem">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Ecosystem
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-amber-400" />
                    Recent Syncs
                  </CardTitle>
                  <CardDescription>Data synchronization activity</CardDescription>
                </CardHeader>
                <CardContent>
                  {(syncHistory as any[])?.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <ArrowRightLeft className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>No sync activity yet</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {(syncHistory as any[])?.slice(0, 10).map((sync: any) => (
                          <div key={sync.id} className="flex items-center justify-between p-2 hover:bg-slate-800/30 rounded" data-testid={`sync-${sync.id}`}>
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${sync.status === 'completed' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                              <span className="text-white text-sm">{sync.syncType}</span>
                            </div>
                            <span className="text-slate-400 text-xs">{sync.recordCount} records</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Activity Log</CardTitle>
                    <CardDescription>Recent ecosystem events</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => refetchStats()} className="border-slate-600" data-testid="btn-refresh-activity">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {ecosystemStats?.recentActivity?.length === 0 || !ecosystemStats?.recentActivity ? (
                  <div className="text-center py-12 text-slate-400">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No activity yet</p>
                    <p className="text-sm">Events will appear here as apps sync data</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ecosystemStats?.recentActivity?.map((log: any) => (
                      <div key={log.id} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg" data-testid={`activity-${log.id}`}>
                        <div className="h-8 w-8 bg-slate-700 rounded flex items-center justify-center">
                          <Activity className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm">
                            <span className="text-cyan-400">{log.appName}</span>
                            <span className="text-slate-400"> - </span>
                            {log.action}
                          </p>
                          <p className="text-slate-500 text-xs">{formatDate(log.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="bg-gradient-to-r from-cyan-950/50 to-purple-950/50 border-cyan-600/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold text-lg">Quick Actions</h3>
                <p className="text-slate-400 text-sm">Jump to common developer tasks</p>
              </div>
              <div className="flex gap-2">
                <Link href="/developer">
                  <Button variant="outline" className="border-cyan-600/30 text-cyan-400 hover:bg-cyan-950/30" data-testid="quick-todo">
                    To-Do List
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
                <Link href="/ecosystem-hub">
                  <Button variant="outline" className="border-purple-600/30 text-purple-400 hover:bg-purple-950/30" data-testid="quick-register">
                    Register App
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
                <Link href="/changelog">
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800" data-testid="quick-changelog">
                    Changelog
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <p>DarkWave Studios © 2025</p>
            <p>v2.6.1</p>
          </div>
        </div>
      </div>
    </div>
  );
}
