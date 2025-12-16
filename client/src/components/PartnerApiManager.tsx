import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key, Copy, Check, Eye, EyeOff, Plus, Trash2, RefreshCw,
  Shield, Clock, Activity, AlertTriangle, Settings, ChevronDown,
  Zap, Lock, Globe, BarChart3, Code2, Webhook, FlaskConical, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WebhookManager } from "./WebhookManager";

interface ApiCredential {
  id: string;
  name: string;
  description?: string;
  apiKey: string;
  environment: string;
  sandboxDataPrefix?: string;
  scopes: string[];
  rateLimitPerMinute: number;
  rateLimitPerDay: number;
  requestCount: number;
  requestCountDaily: number;
  isActive: boolean;
  expiresAt?: string;
  lastUsedAt?: string;
  createdAt: string;
}

interface ApiLog {
  id: string;
  method: string;
  endpoint: string;
  statusCode: number;
  responseTimeMs: number;
  errorCode?: string;
  ipAddress?: string;
  createdAt: string;
}

const AVAILABLE_SCOPES = [
  { id: 'workers:read', label: 'Workers (Read)', category: 'Workers' },
  { id: 'workers:write', label: 'Workers (Write)', category: 'Workers' },
  { id: 'jobs:read', label: 'Jobs (Read)', category: 'Jobs' },
  { id: 'jobs:write', label: 'Jobs (Write)', category: 'Jobs' },
  { id: 'timesheets:read', label: 'Timesheets (Read)', category: 'Timesheets' },
  { id: 'timesheets:write', label: 'Timesheets (Write)', category: 'Timesheets' },
  { id: 'payroll:read', label: 'Payroll (Read)', category: 'Payroll' },
  { id: 'payroll:write', label: 'Payroll (Write)', category: 'Payroll' },
  { id: 'invoices:read', label: 'Invoices (Read)', category: 'Billing' },
  { id: 'invoices:write', label: 'Invoices (Write)', category: 'Billing' },
  { id: 'clients:read', label: 'Clients (Read)', category: 'Clients' },
  { id: 'clients:write', label: 'Clients (Write)', category: 'Clients' },
  { id: 'locations:read', label: 'Locations (Read)', category: 'Locations' },
  { id: 'locations:write', label: 'Locations (Write)', category: 'Locations' },
  { id: 'billing:read', label: 'Billing Info (Read)', category: 'Billing' },
  { id: 'analytics:read', label: 'Analytics (Read)', category: 'Analytics' },
  { id: 'compliance:read', label: 'Compliance (Read)', category: 'Compliance' },
  { id: 'compliance:write', label: 'Compliance (Write)', category: 'Compliance' },
];

export function PartnerApiManager() {
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<ApiCredential[]>([]);
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [newCredential, setNewCredential] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("credentials");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    environment: "production",
    scopes: ["workers:read"],
    rateLimitPerMinute: 60,
    rateLimitPerDay: 10000,
  });

  useEffect(() => {
    fetchCredentials();
    fetchLogs();
  }, []);

  const fetchCredentials = async () => {
    try {
      const res = await fetch("/api/admin/partner-api/credentials");
      if (res.ok) {
        const data = await res.json();
        setCredentials(data);
      }
    } catch (error) {
      console.error("Failed to fetch credentials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/partner-api/logs?limit=100");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  const createCredential = async () => {
    try {
      const res = await fetch("/api/admin/partner-api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        const data = await res.json();
        setNewCredential(data);
        setShowCreateModal(false);
        setShowSecretModal(true);
        fetchCredentials();
        toast({ title: "API Credential Created", description: "Save the API secret - it won't be shown again!" });
      } else {
        const error = await res.json();
        toast({ title: "Error", description: error.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create credential", variant: "destructive" });
    }
  };

  const toggleCredential = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/partner-api/credentials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      
      if (res.ok) {
        fetchCredentials();
        toast({ title: isActive ? "Credential Enabled" : "Credential Disabled" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update credential", variant: "destructive" });
    }
  };

  const regenerateCredential = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/partner-api/credentials/${id}/regenerate`, {
        method: "POST",
      });
      
      if (res.ok) {
        const data = await res.json();
        setNewCredential(data);
        setShowSecretModal(true);
        fetchCredentials();
        toast({ title: "Credentials Regenerated", description: "Save the new API secret!" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to regenerate credentials", variant: "destructive" });
    }
  };

  const deleteCredential = async (id: string) => {
    if (!confirm("Are you sure you want to delete this API credential? This cannot be undone.")) return;
    
    try {
      const res = await fetch(`/api/admin/partner-api/credentials/${id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        fetchCredentials();
        toast({ title: "Credential Deleted" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete credential", variant: "destructive" });
    }
  };

  const resetSandboxData = async (id: string) => {
    if (!confirm("Reset sandbox data? This will restore all mock data to its initial state.")) return;
    
    try {
      const res = await fetch(`/api/admin/partner-api/credentials/${id}/reset-sandbox`, {
        method: "POST",
      });
      
      if (res.ok) {
        toast({ 
          title: "Sandbox Data Reset", 
          description: "All sandbox mock data has been restored to initial state"
        });
      } else {
        const error = await res.json();
        toast({ title: "Error", description: error.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to reset sandbox data", variant: "destructive" });
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copied!", description: "Copied to clipboard" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleScope = (scope: string) => {
    setFormData(prev => ({
      ...prev,
      scopes: prev.scopes.includes(scope)
        ? prev.scopes.filter(s => s !== scope)
        : [...prev.scopes, scope]
    }));
  };

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return "text-green-400";
    if (statusCode >= 400 && statusCode < 500) return "text-yellow-400";
    return "text-red-400";
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-blue-500/20 text-blue-400";
      case "POST": return "bg-green-500/20 text-green-400";
      case "PUT": return "bg-yellow-500/20 text-yellow-400";
      case "PATCH": return "bg-orange-500/20 text-orange-400";
      case "DELETE": return "bg-red-500/20 text-red-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Key className="h-6 w-6 text-cyan-400" />
            Partner API Management
          </h2>
          <p className="text-gray-400 mt-1">
            Create and manage API credentials for B2B integrations
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          data-testid="btn-create-api-key"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create API Key
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-800/50 border border-gray-700">
          <TabsTrigger value="credentials" className="data-[state=active]:bg-cyan-500/20">
            <Key className="h-4 w-4 mr-2" />
            Credentials
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-cyan-500/20">
            <Activity className="h-4 w-4 mr-2" />
            API Logs
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="data-[state=active]:bg-cyan-500/20">
            <Webhook className="h-4 w-4 mr-2" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="docs" className="data-[state=active]:bg-cyan-500/20">
            <Code2 className="h-4 w-4 mr-2" />
            Documentation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="credentials" className="mt-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Loading credentials...</div>
          ) : credentials.length === 0 ? (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="py-12 text-center">
                <Key className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No API Credentials</h3>
                <p className="text-gray-400 mb-4">Create your first API key to enable partner integrations</p>
                <Button onClick={() => setShowCreateModal(true)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First API Key
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {credentials.map((cred) => (
                <motion.div
                  key={cred.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-cyan-500/30 transition-all"
                  data-testid={`credential-${cred.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white">{cred.name}</h3>
                        <Badge variant={cred.isActive ? "default" : "secondary"} className={cred.isActive ? "bg-green-500/20 text-green-400" : ""}>
                          {cred.isActive ? "Active" : "Disabled"}
                        </Badge>
                        {cred.environment === "sandbox" ? (
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 flex items-center gap-1">
                            <FlaskConical className="h-3 w-3" />
                            Test Mode
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30">
                            <Globe className="h-3 w-3 mr-1" />
                            Production
                          </Badge>
                        )}
                      </div>
                      
                      {cred.description && (
                        <p className="text-sm text-gray-400 mb-3">{cred.description}</p>
                      )}

                      <div className="flex items-center gap-2 mb-3">
                        <code className="px-3 py-1.5 rounded bg-gray-800 text-cyan-400 text-sm font-mono">
                          {cred.apiKey.substring(0, 20)}...
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(cred.apiKey, cred.id)}
                          className="h-8 w-8 p-0"
                        >
                          {copiedId === cred.id ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {cred.scopes.slice(0, 5).map((scope) => (
                          <Badge key={scope} variant="outline" className="text-xs bg-gray-800/50">
                            {scope}
                          </Badge>
                        ))}
                        {cred.scopes.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{cred.scopes.length - 5} more
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          {cred.requestCountDaily || 0} / {cred.rateLimitPerDay} today
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {cred.lastUsedAt ? new Date(cred.lastUsedAt).toLocaleDateString() : "Never used"}
                        </span>
                      </div>
                      
                      {cred.environment === "sandbox" && (
                        <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-amber-400 text-sm font-medium flex items-center gap-2">
                                <FlaskConical className="h-4 w-4" />
                                Sandbox Environment
                              </p>
                              <p className="text-amber-300/70 text-xs mt-1">
                                All API calls return mock data. No real data is affected.
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resetSandboxData(cred.id)}
                              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                              data-testid={`btn-reset-sandbox-${cred.id}`}
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Reset Data
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={cred.isActive}
                        onCheckedChange={(checked) => toggleCredential(cred.id, checked)}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => regenerateCredential(cred.id)}
                        className="h-8 w-8 p-0"
                        title="Regenerate credentials"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteCredential(cred.id)}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                        title="Delete credential"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-cyan-400" />
                Recent API Requests
              </CardTitle>
              <CardDescription>Last 100 API requests across all credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {logs.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">No API requests logged yet</p>
                  ) : (
                    logs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 text-sm"
                      >
                        <Badge className={getMethodColor(log.method)}>
                          {log.method}
                        </Badge>
                        <code className="text-gray-300 flex-1 truncate">{log.endpoint}</code>
                        <span className={`font-mono ${getStatusColor(log.statusCode)}`}>
                          {log.statusCode}
                        </span>
                        <span className="text-gray-500">{log.responseTimeMs}ms</span>
                        <span className="text-gray-500 text-xs">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-4">
          <WebhookManager />
        </TabsContent>

        <TabsContent value="docs" className="mt-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-cyan-400" />
                    API Documentation
                  </CardTitle>
                  <CardDescription>Quick reference for Partner API v1</CardDescription>
                </div>
                <Button
                  onClick={() => window.open('/api/docs', '_blank')}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  data-testid="btn-view-interactive-docs"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  View Interactive Docs
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-white mb-2">Base URL</h4>
                <code className="block p-3 rounded bg-gray-800 text-cyan-400">
                  {window.location.origin}/api/partner/v1
                </code>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Authentication</h4>
                <p className="text-gray-400 text-sm mb-2">
                  Include your API key in the <code className="text-cyan-400">X-API-Key</code> header:
                </p>
                <pre className="p-3 rounded bg-gray-800 text-sm overflow-x-auto">
                  <code className="text-gray-300">{`curl -H "X-API-Key: orbit_live_your_key_here" \\
  ${window.location.origin}/api/partner/v1/me`}</code>
                </pre>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Endpoints</h4>
                <div className="space-y-2">
                  {[
                    { method: "GET", path: "/health", desc: "Health check (no auth)" },
                    { method: "GET", path: "/scopes", desc: "List available scopes (no auth)" },
                    { method: "GET", path: "/me", desc: "Get current credential info" },
                    { method: "GET", path: "/workers", desc: "List workers (workers:read)" },
                    { method: "GET", path: "/locations", desc: "List locations (locations:read)" },
                    { method: "POST", path: "/locations", desc: "Create location (locations:write)" },
                    { method: "GET", path: "/analytics", desc: "Get analytics (analytics:read)" },
                    { method: "GET", path: "/billing", desc: "Get billing info (billing:read)" },
                  ].map((endpoint) => (
                    <div key={`${endpoint.method}-${endpoint.path}`} className="flex items-center gap-3 p-2 rounded bg-gray-800/50">
                      <Badge className={getMethodColor(endpoint.method)}>{endpoint.method}</Badge>
                      <code className="text-cyan-400">{endpoint.path}</code>
                      <span className="text-gray-400 text-sm">{endpoint.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Rate Limits</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 rounded bg-gray-800">
                    <span className="text-gray-400">Sandbox</span>
                    <p className="text-white">30/min, 1,000/day</p>
                  </div>
                  <div className="p-3 rounded bg-gray-800">
                    <span className="text-gray-400">Standard</span>
                    <p className="text-white">60/min, 10,000/day</p>
                  </div>
                  <div className="p-3 rounded bg-gray-800">
                    <span className="text-gray-400">Premium</span>
                    <p className="text-white">120/min, 50,000/day</p>
                  </div>
                  <div className="p-3 rounded bg-gray-800">
                    <span className="text-gray-400">Enterprise</span>
                    <p className="text-white">300/min, 100,000/day</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-6">
                <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-cyan-400" />
                  Official SDKs
                </h4>
                <p className="text-gray-400 text-sm mb-4">
                  Download our official SDKs for easy integration with your applications.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                          <span className="text-yellow-400 text-sm font-bold">JS</span>
                        </div>
                        <div>
                          <h5 className="font-semibold text-white">JavaScript SDK</h5>
                          <p className="text-xs text-gray-400">Browser & Node.js</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open('/api/partner/sdk/javascript', '_blank')}
                        className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
                        data-testid="btn-download-js-sdk"
                      >
                        Download
                      </Button>
                    </div>
                    <pre className="p-2 rounded bg-gray-900 text-xs overflow-x-auto">
                      <code className="text-gray-300">{`const api = new OrbitPartnerAPI(
  'orbit_pk_...', 
  'orbit_sk_...'
);
const workers = await api.getWorkers();`}</code>
                    </pre>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <span className="text-blue-400 text-sm font-bold">PY</span>
                        </div>
                        <div>
                          <h5 className="font-semibold text-white">Python SDK</h5>
                          <p className="text-xs text-gray-400">Python 3.7+</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open('/api/partner/sdk/python', '_blank')}
                        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                        data-testid="btn-download-python-sdk"
                      >
                        Download
                      </Button>
                    </div>
                    <pre className="p-2 rounded bg-gray-900 text-xs overflow-x-auto">
                      <code className="text-gray-300">{`api = OrbitPartnerAPI(
    'orbit_pk_...', 
    'orbit_sk_...'
)
workers = api.get_workers()`}</code>
                    </pre>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                  <h5 className="font-semibold text-cyan-400 mb-2">Quick Start</h5>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p><span className="text-cyan-400">1.</span> Create an API credential above with the scopes you need</p>
                    <p><span className="text-cyan-400">2.</span> Download the SDK for your language</p>
                    <p><span className="text-cyan-400">3.</span> Initialize with your API key and secret</p>
                    <p><span className="text-cyan-400">4.</span> Start making API calls!</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Key className="h-5 w-5 text-cyan-400" />
              Create API Credential
            </DialogTitle>
            <DialogDescription>
              Generate a new API key for partner integrations
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Production API Key"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div>
                <Label htmlFor="environment">Environment</Label>
                <Select
                  value={formData.environment}
                  onValueChange={(v) => setFormData({ ...formData, environment: v })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">Sandbox</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="Used for franchise XYZ integration"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-gray-800 border-gray-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rateMin">Rate Limit (per minute)</Label>
                <Input
                  id="rateMin"
                  type="number"
                  value={formData.rateLimitPerMinute}
                  onChange={(e) => setFormData({ ...formData, rateLimitPerMinute: parseInt(e.target.value) })}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div>
                <Label htmlFor="rateDay">Rate Limit (per day)</Label>
                <Input
                  id="rateDay"
                  type="number"
                  value={formData.rateLimitPerDay}
                  onChange={(e) => setFormData({ ...formData, rateLimitPerDay: parseInt(e.target.value) })}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Permissions (Scopes)</Label>
              <ScrollArea className="h-48 rounded border border-gray-700 p-3">
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_SCOPES.map((scope) => (
                    <label
                      key={scope.id}
                      className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.scopes.includes(scope.id)}
                        onChange={() => toggleScope(scope.id)}
                        className="rounded border-gray-600"
                      />
                      <span className="text-sm text-gray-300">{scope.label}</span>
                    </label>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={createCredential}
              disabled={!formData.name || formData.scopes.length === 0}
              className="bg-gradient-to-r from-cyan-500 to-blue-500"
            >
              <Key className="h-4 w-4 mr-2" />
              Generate API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSecretModal} onOpenChange={setShowSecretModal}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              Save Your API Credentials
            </DialogTitle>
            <DialogDescription>
              This is the only time you'll see the API secret. Copy and save it securely.
            </DialogDescription>
          </DialogHeader>

          {newCredential && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <p className="text-yellow-400 text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  The API secret will not be shown again after closing this dialog!
                </p>
              </div>

              <div>
                <Label className="text-gray-400">API Key</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-3 rounded bg-gray-800 text-cyan-400 text-sm font-mono break-all">
                    {newCredential.apiKey}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(newCredential.apiKey, "key")}
                  >
                    {copiedId === "key" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-gray-400">API Secret</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-3 rounded bg-gray-800 text-green-400 text-sm font-mono break-all">
                    {newCredential.apiSecret}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(newCredential.apiSecret, "secret")}
                  >
                    {copiedId === "secret" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setShowSecretModal(false)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500"
            >
              I've Saved My Credentials
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
