import React, { useState, useEffect } from 'react';
import { 
  Store, Search, Star, Download, Trash2, Settings, ExternalLink, 
  Check, Filter, ChevronRight, X, Loader2, DollarSign, Shield, 
  Users, CreditCard, MessageCircle, BarChart3, Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BentoTile } from '@/components/ui/bento-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface MarketplaceApp {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  provider: string;
  iconUrl: string;
  websiteUrl: string;
  docsUrl: string;
  pricingType: 'free' | 'paid' | 'freemium';
  monthlyPrice: string | null;
  features: string[];
  requiredScopes: string[];
  isActive: boolean;
  isFeatured: boolean;
  rating: string;
  installCount: number;
}

interface InstalledApp {
  id: string;
  tenantId: string;
  appId: string;
  status: string;
  configData: any;
  installedAt: string;
  lastUsedAt: string | null;
  app: MarketplaceApp;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const getCategoryIcon = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    'chart': <BarChart3 className="w-5 h-5" />,
    'users': <Users className="w-5 h-5" />,
    'money': <DollarSign className="w-5 h-5" />,
    'message': <MessageCircle className="w-5 h-5" />,
    'shield': <Shield className="w-5 h-5" />,
    'credit-card': <CreditCard className="w-5 h-5" />,
  };
  return icons[iconName] || <Briefcase className="w-5 h-5" />;
};

const getPricingBadge = (pricingType: string, monthlyPrice: string | null) => {
  if (pricingType === 'free') {
    return <Badge className="bg-green-600/20 text-green-400 border-green-600/30">Free</Badge>;
  }
  if (pricingType === 'freemium') {
    return <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">Freemium</Badge>;
  }
  if (monthlyPrice && parseFloat(monthlyPrice) > 0) {
    return <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30">${monthlyPrice}/mo</Badge>;
  }
  return <Badge className="bg-amber-600/20 text-amber-400 border-amber-600/30">Pay per use</Badge>;
};

export function IntegrationMarketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<MarketplaceApp | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configAppId, setConfigAppId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['marketplace-apps', selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      const res = await fetch(`/api/marketplace/apps?${params}`);
      return res.json();
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['marketplace-categories'],
    queryFn: async () => {
      const res = await fetch('/api/marketplace/categories');
      return res.json();
    },
  });

  const { data: installedData, isLoading: installedLoading } = useQuery({
    queryKey: ['installed-apps'],
    queryFn: async () => {
      const res = await fetch('/api/admin/marketplace/installed');
      return res.json();
    },
  });

  const installMutation = useMutation({
    mutationFn: async (appId: string) => {
      const res = await fetch(`/api/admin/marketplace/install/${appId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: 'default' }),
      });
      if (!res.ok) throw new Error('Failed to install');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installed-apps'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace-apps'] });
    },
  });

  const uninstallMutation = useMutation({
    mutationFn: async (appId: string) => {
      const res = await fetch(`/api/admin/marketplace/uninstall/${appId}?tenantId=default`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to uninstall');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installed-apps'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace-apps'] });
    },
  });

  const apps: MarketplaceApp[] = appsData?.apps || [];
  const categories: Category[] = categoriesData?.categories || [];
  const installedApps: InstalledApp[] = installedData?.installed || [];
  const installedAppIds = new Set(installedApps.map(i => i.appId));

  const filteredApps = apps.filter(app => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      app.name.toLowerCase().includes(query) ||
      app.description?.toLowerCase().includes(query) ||
      app.provider?.toLowerCase().includes(query)
    );
  });

  const featuredApps = apps.filter(app => app.isFeatured);

  return (
    <div className="space-y-6" data-testid="integration-marketplace">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Store className="w-7 h-7 text-cyan-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">App Marketplace</h2>
            <p className="text-sm text-gray-400">Connect third-party services to supercharge your workflow</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full md:w-80 bg-slate-800 border-slate-700"
            data-testid="input-marketplace-search"
          />
        </div>
      </div>

      {featuredApps.length > 0 && !selectedCategory && !searchQuery && (
        <BentoTile className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Featured Integrations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredApps.slice(0, 3).map((app) => (
              <div
                key={app.id}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-cyan-600/30 hover:border-cyan-500/50 transition-all cursor-pointer"
                onClick={() => setSelectedApp(app)}
                data-testid={`card-featured-app-${app.slug}`}
              >
                <div className="flex items-start gap-3">
                  <img src={app.iconUrl} alt={app.name} className="w-12 h-12 rounded-lg bg-slate-700 p-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white truncate">{app.name}</h4>
                      {installedAppIds.has(app.id) && (
                        <Check className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{app.provider}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300 mt-2 line-clamp-2">{app.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm text-gray-300">{app.rating}</span>
                  </div>
                  {getPricingBadge(app.pricingType, app.monthlyPrice)}
                </div>
              </div>
            ))}
          </div>
        </BentoTile>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory(null)}
          className={selectedCategory === null ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
          data-testid="button-category-all"
        >
          All Apps
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            className={selectedCategory === cat.id ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
            data-testid={`button-category-${cat.id}`}
          >
            {getCategoryIcon(cat.icon)}
            <span className="ml-2">{cat.name}</span>
          </Button>
        ))}
      </div>

      {installedApps.length > 0 && !selectedCategory && !searchQuery && (
        <BentoTile className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-green-400" />
            Installed Apps ({installedApps.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {installedApps.map((installed) => (
              <div
                key={installed.id}
                className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 flex items-center gap-3"
                data-testid={`card-installed-app-${installed.app.slug}`}
              >
                <img src={installed.app.iconUrl} alt={installed.app.name} className="w-10 h-10 rounded-lg bg-slate-700 p-1" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white text-sm truncate">{installed.app.name}</h4>
                  <p className="text-xs text-gray-400 capitalize">{installed.status}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-cyan-400"
                    onClick={() => {
                      setConfigAppId(installed.appId);
                      setShowConfigModal(true);
                    }}
                    data-testid={`button-config-${installed.app.slug}`}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
                    onClick={() => uninstallMutation.mutate(installed.appId)}
                    disabled={uninstallMutation.isPending}
                    data-testid={`button-uninstall-${installed.app.slug}`}
                  >
                    {uninstallMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </BentoTile>
      )}

      <BentoTile className="p-4">
        <h3 className="text-lg font-semibold text-white mb-4">
          {selectedCategory 
            ? `${categories.find(c => c.id === selectedCategory)?.name || 'Apps'}`
            : searchQuery 
              ? `Search Results (${filteredApps.length})`
              : 'All Integrations'
          }
        </h3>
        
        {appsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Store className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No apps found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApps.map((app) => (
              <div
                key={app.id}
                className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-all"
                data-testid={`card-app-${app.slug}`}
              >
                <div className="flex items-start gap-3">
                  <img src={app.iconUrl} alt={app.name} className="w-12 h-12 rounded-lg bg-slate-700 p-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white truncate">{app.name}</h4>
                      {installedAppIds.has(app.id) && (
                        <Badge className="bg-green-600/20 text-green-400 border-green-600/30 text-xs">Installed</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{app.provider}</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-300 mt-3 line-clamp-2">{app.description}</p>
                
                <div className="flex flex-wrap gap-1 mt-3">
                  {app.features?.slice(0, 2).map((feature, idx) => (
                    <span key={idx} className="text-xs bg-slate-700/50 text-gray-300 px-2 py-0.5 rounded">
                      {feature}
                    </span>
                  ))}
                  {app.features?.length > 2 && (
                    <span className="text-xs text-gray-500">+{app.features.length - 2} more</span>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm text-gray-300">{app.rating}</span>
                    </div>
                    <span className="text-xs text-gray-500">{app.installCount.toLocaleString()} installs</span>
                  </div>
                  {getPricingBadge(app.pricingType, app.monthlyPrice)}
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedApp(app)}
                    data-testid={`button-details-${app.slug}`}
                  >
                    Details
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                  {installedAppIds.has(app.id) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-red-600/50 text-red-400 hover:bg-red-600/10"
                      onClick={() => uninstallMutation.mutate(app.id)}
                      disabled={uninstallMutation.isPending}
                      data-testid={`button-uninstall-${app.slug}`}
                    >
                      {uninstallMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-1" />
                      )}
                      Uninstall
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                      onClick={() => installMutation.mutate(app.id)}
                      disabled={installMutation.isPending}
                      data-testid={`button-install-${app.slug}`}
                    >
                      {installMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      ) : (
                        <Download className="w-4 h-4 mr-1" />
                      )}
                      Install
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </BentoTile>

      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-700">
          {selectedApp && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <img src={selectedApp.iconUrl} alt={selectedApp.name} className="w-16 h-16 rounded-xl bg-slate-800 p-2" />
                  <div>
                    <DialogTitle className="text-white text-xl">{selectedApp.name}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      by {selectedApp.provider}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-white">{selectedApp.rating}</span>
                  </div>
                  <span className="text-gray-400">{selectedApp.installCount.toLocaleString()} installs</span>
                  {getPricingBadge(selectedApp.pricingType, selectedApp.monthlyPrice)}
                </div>
                
                <p className="text-gray-300">{selectedApp.description}</p>
                
                <div>
                  <h4 className="font-semibold text-white mb-2">Features</h4>
                  <ul className="grid grid-cols-2 gap-2">
                    {selectedApp.features?.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-green-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-2">Required Permissions</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.requiredScopes?.map((scope, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {scope}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-slate-700">
                  {selectedApp.websiteUrl && (
                    <a
                      href={selectedApp.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Website
                    </a>
                  )}
                  {selectedApp.docsUrl && (
                    <a
                      href={selectedApp.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Documentation
                    </a>
                  )}
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setSelectedApp(null)}>
                    Close
                  </Button>
                  {installedAppIds.has(selectedApp.id) ? (
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={() => {
                        uninstallMutation.mutate(selectedApp.id);
                        setSelectedApp(null);
                      }}
                      disabled={uninstallMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Uninstall
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                      onClick={() => {
                        installMutation.mutate(selectedApp.id);
                        setSelectedApp(null);
                      }}
                      disabled={installMutation.isPending}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Install App
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">App Configuration</DialogTitle>
            <DialogDescription className="text-gray-400">
              Configure settings for this integration
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center text-gray-400">
            <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Configuration options will appear here based on the app requirements.</p>
            <p className="text-sm mt-2">Each app has unique configuration needs - API keys, webhooks, sync settings, etc.</p>
          </div>
          <Button variant="outline" onClick={() => setShowConfigModal(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default IntegrationMarketplace;
