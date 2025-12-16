import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key, Copy, Check, Eye, EyeOff, Plus, Trash2, RefreshCw,
  Shield, Clock, Activity, AlertTriangle, Settings, ChevronDown,
  Lock, Globe, Link2, ExternalLink, CheckCircle, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

interface OAuthClient {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  redirectUris: string[];
  scopes: string[];
  grantTypes: string[];
  isConfidential?: boolean;
  isActive: boolean;
  logoUrl?: string;
  homepageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const AVAILABLE_SCOPES = [
  { id: 'read', label: 'Read Access', description: 'Read-only access to resources' },
  { id: 'write', label: 'Write Access', description: 'Create and update resources' },
  { id: 'workers:read', label: 'Workers (Read)', description: 'View worker profiles and data' },
  { id: 'workers:write', label: 'Workers (Write)', description: 'Manage worker records' },
  { id: 'jobs:read', label: 'Jobs (Read)', description: 'View job postings and assignments' },
  { id: 'jobs:write', label: 'Jobs (Write)', description: 'Create and manage jobs' },
  { id: 'timesheets:read', label: 'Timesheets (Read)', description: 'View time entries' },
  { id: 'timesheets:write', label: 'Timesheets (Write)', description: 'Manage timesheets' },
  { id: 'payroll:read', label: 'Payroll (Read)', description: 'View payroll data' },
  { id: 'invoices:read', label: 'Invoices (Read)', description: 'View billing invoices' },
  { id: 'analytics:read', label: 'Analytics (Read)', description: 'Access analytics data' },
];

const GRANT_TYPES = [
  { id: 'authorization_code', label: 'Authorization Code', description: 'Standard OAuth flow for web apps' },
  { id: 'client_credentials', label: 'Client Credentials', description: 'Server-to-server authentication' },
  { id: 'refresh_token', label: 'Refresh Token', description: 'Allow token refresh' },
];

export function OAuthManager() {
  const { toast } = useToast();
  const [clients, setClients] = useState<OAuthClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [newClientSecret, setNewClientSecret] = useState<string | null>(null);
  const [newClientId, setNewClientId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    redirectUris: [""],
    scopes: ["read"],
    grantTypes: ["authorization_code"],
    isConfidential: true,
    homepageUrl: "",
    logoUrl: "",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/admin/oauth/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error("Failed to fetch OAuth clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClient = async () => {
    try {
      const validRedirectUris = formData.redirectUris.filter(uri => uri.trim() !== "");
      
      if (!formData.name.trim()) {
        toast({ title: "Error", description: "Application name is required", variant: "destructive" });
        return;
      }
      
      if (validRedirectUris.length === 0) {
        toast({ title: "Error", description: "At least one redirect URI is required", variant: "destructive" });
        return;
      }

      const res = await fetch("/api/admin/oauth/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          redirectUris: validRedirectUris,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNewClientId(data.client.clientId);
        setNewClientSecret(data.clientSecret);
        setShowCreateModal(false);
        setShowSecretModal(true);
        fetchClients();
        setFormData({
          name: "",
          description: "",
          redirectUris: [""],
          scopes: ["read"],
          grantTypes: ["authorization_code"],
          isConfidential: true,
          homepageUrl: "",
          logoUrl: "",
        });
        toast({ title: "Success", description: "OAuth application created" });
      } else {
        const error = await res.json();
        toast({ title: "Error", description: error.error || "Failed to create application", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create OAuth application", variant: "destructive" });
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/oauth/clients/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchClients();
        toast({ title: "Success", description: "OAuth application deleted" });
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete application", variant: "destructive" });
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/oauth/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (res.ok) {
        fetchClients();
        toast({ title: "Success", description: `Application ${!isActive ? 'activated' : 'deactivated'}` });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update application", variant: "destructive" });
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      toast({ title: "Copied", description: `${field} copied to clipboard` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to copy", variant: "destructive" });
    }
  };

  const addRedirectUri = () => {
    setFormData({ ...formData, redirectUris: [...formData.redirectUris, ""] });
  };

  const removeRedirectUri = (index: number) => {
    const newUris = formData.redirectUris.filter((_, i) => i !== index);
    setFormData({ ...formData, redirectUris: newUris.length > 0 ? newUris : [""] });
  };

  const updateRedirectUri = (index: number, value: string) => {
    const newUris = [...formData.redirectUris];
    newUris[index] = value;
    setFormData({ ...formData, redirectUris: newUris });
  };

  const toggleScope = (scopeId: string) => {
    const newScopes = formData.scopes.includes(scopeId)
      ? formData.scopes.filter(s => s !== scopeId)
      : [...formData.scopes, scopeId];
    setFormData({ ...formData, scopes: newScopes });
  };

  const toggleGrantType = (grantType: string) => {
    const newGrants = formData.grantTypes.includes(grantType)
      ? formData.grantTypes.filter(g => g !== grantType)
      : [...formData.grantTypes, grantType];
    setFormData({ ...formData, grantTypes: newGrants });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8" data-testid="oauth-loading">
        <RefreshCw className="w-6 h-6 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="oauth-manager">
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-900/80 to-slate-800/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <CardTitle className="text-white">OAuth 2.0 Applications</CardTitle>
                <CardDescription>Manage third-party applications that can access your API</CardDescription>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
              data-testid="button-create-oauth-app"
            >
              <Plus className="w-4 h-4 mr-2" />
              Register Application
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-12" data-testid="oauth-empty-state">
              <Lock className="w-12 h-12 mx-auto mb-4 text-slate-500" />
              <h3 className="text-lg font-medium text-white mb-2">No OAuth Applications</h3>
              <p className="text-slate-400 mb-4">Register your first OAuth application to enable third-party integrations</p>
              <Button
                onClick={() => setShowCreateModal(true)}
                variant="outline"
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Application
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {clients.map((client) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                  data-testid={`oauth-client-${client.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-white">{client.name}</h4>
                        <Badge variant={client.isActive ? "default" : "secondary"} className={client.isActive ? "bg-green-500/20 text-green-400" : ""}>
                          {client.isActive ? (
                            <><CheckCircle className="w-3 h-3 mr-1" /> Active</>
                          ) : (
                            <><XCircle className="w-3 h-3 mr-1" /> Inactive</>
                          )}
                        </Badge>
                      </div>
                      
                      {client.description && (
                        <p className="text-sm text-slate-400 mb-3">{client.description}</p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-slate-500 text-xs">Client ID</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-xs bg-slate-900/50 px-2 py-1 rounded font-mono text-cyan-400 truncate max-w-[200px]">
                              {client.clientId}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(client.clientId, "Client ID")}
                              className="h-6 w-6 p-0"
                              data-testid={`button-copy-client-id-${client.id}`}
                            >
                              {copiedField === "Client ID" ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-slate-500 text-xs">Grant Types</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {client.grantTypes.map((grant) => (
                              <Badge key={grant} variant="outline" className="text-xs">
                                {grant.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-slate-500 text-xs">Redirect URIs</Label>
                          <div className="flex flex-col gap-1 mt-1">
                            {client.redirectUris.slice(0, 2).map((uri, i) => (
                              <div key={i} className="flex items-center gap-1">
                                <Link2 className="w-3 h-3 text-slate-500" />
                                <span className="text-xs text-slate-300 truncate max-w-[180px]">{uri}</span>
                              </div>
                            ))}
                            {client.redirectUris.length > 2 && (
                              <span className="text-xs text-slate-500">+{client.redirectUris.length - 2} more</span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-slate-500 text-xs">Scopes</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {client.scopes.slice(0, 3).map((scope) => (
                              <Badge key={scope} variant="secondary" className="text-xs bg-slate-700/50">
                                {scope}
                              </Badge>
                            ))}
                            {client.scopes.length > 3 && (
                              <Badge variant="secondary" className="text-xs bg-slate-700/50">
                                +{client.scopes.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Created {new Date(client.createdAt).toLocaleDateString()}
                        </span>
                        {client.homepageUrl && (
                          <a
                            href={client.homepageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Switch
                        checked={client.isActive}
                        onCheckedChange={() => handleToggleActive(client.id, client.isActive)}
                        data-testid={`switch-active-${client.id}`}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(client.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        data-testid={`button-delete-${client.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-900/80 to-slate-800/40">
        <CardHeader>
          <CardTitle className="text-white text-lg">OAuth 2.0 Flow Reference</CardTitle>
          <CardDescription>Endpoints for implementing OAuth authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-500/20 text-blue-400">GET</Badge>
                <code className="text-cyan-400">/oauth/authorize</code>
              </div>
              <p className="text-slate-400 text-xs">Authorization endpoint - redirects user to consent screen</p>
            </div>
            
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-500/20 text-green-400">POST</Badge>
                <code className="text-cyan-400">/oauth/token</code>
              </div>
              <p className="text-slate-400 text-xs">Token endpoint - exchange code for access token</p>
            </div>
            
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-500/20 text-green-400">POST</Badge>
                <code className="text-cyan-400">/oauth/token/refresh</code>
              </div>
              <p className="text-slate-400 text-xs">Refresh access token using refresh token</p>
            </div>
            
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-yellow-500/20 text-yellow-400">POST</Badge>
                <code className="text-cyan-400">/oauth/revoke</code>
              </div>
              <p className="text-slate-400 text-xs">Revoke access or refresh token</p>
            </div>
            
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-500/20 text-blue-400">GET</Badge>
                <code className="text-cyan-400">/oauth/userinfo</code>
              </div>
              <p className="text-slate-400 text-xs">Get authenticated user information</p>
            </div>
            
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-purple-500/20 text-purple-400">POST</Badge>
                <code className="text-cyan-400">/oauth/introspect</code>
              </div>
              <p className="text-slate-400 text-xs">Token introspection (RFC 7662)</p>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-cyan-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-cyan-400 mb-1">PKCE Support</h4>
                <p className="text-sm text-slate-300">
                  This OAuth implementation supports PKCE (Proof Key for Code Exchange) for enhanced security 
                  with public clients. Use <code className="bg-slate-800 px-1 rounded">code_challenge</code> and 
                  <code className="bg-slate-800 px-1 rounded ml-1">code_verifier</code> parameters.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Register OAuth Application</DialogTitle>
            <DialogDescription>
              Create a new OAuth client for third-party integration
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Application Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Application"
                  className="mt-1 bg-slate-800 border-slate-700"
                  data-testid="input-app-name"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of your application"
                  className="mt-1 bg-slate-800 border-slate-700"
                  rows={2}
                  data-testid="input-description"
                />
              </div>
              
              <div>
                <Label htmlFor="homepageUrl">Homepage URL</Label>
                <Input
                  id="homepageUrl"
                  value={formData.homepageUrl}
                  onChange={(e) => setFormData({ ...formData, homepageUrl: e.target.value })}
                  placeholder="https://myapp.com"
                  className="mt-1 bg-slate-800 border-slate-700"
                  data-testid="input-homepage"
                />
              </div>
            </div>
            
            <div>
              <Label>Redirect URIs *</Label>
              <p className="text-xs text-slate-400 mb-2">Authorized callback URLs for your application</p>
              <div className="space-y-2">
                {formData.redirectUris.map((uri, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={uri}
                      onChange={(e) => updateRedirectUri(index, e.target.value)}
                      placeholder="https://myapp.com/callback"
                      className="bg-slate-800 border-slate-700"
                      data-testid={`input-redirect-uri-${index}`}
                    />
                    {formData.redirectUris.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRedirectUri(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addRedirectUri}
                  className="border-slate-700 text-slate-300"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add URI
                </Button>
              </div>
            </div>
            
            <div>
              <Label>Grant Types</Label>
              <p className="text-xs text-slate-400 mb-2">Authentication flows this application can use</p>
              <div className="grid gap-3">
                {GRANT_TYPES.map((grant) => (
                  <div
                    key={grant.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.grantTypes.includes(grant.id)
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                    }`}
                    onClick={() => toggleGrantType(grant.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={formData.grantTypes.includes(grant.id)}
                        onCheckedChange={() => toggleGrantType(grant.id)}
                      />
                      <div>
                        <p className="font-medium text-white text-sm">{grant.label}</p>
                        <p className="text-xs text-slate-400">{grant.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label>Scopes</Label>
              <p className="text-xs text-slate-400 mb-2">Permissions this application can request</p>
              <ScrollArea className="h-48 rounded-lg border border-slate-700 p-3">
                <div className="space-y-2">
                  {AVAILABLE_SCOPES.map((scope) => (
                    <div
                      key={scope.id}
                      className={`p-2 rounded cursor-pointer transition-colors ${
                        formData.scopes.includes(scope.id)
                          ? "bg-cyan-500/10 border border-cyan-500/50"
                          : "bg-slate-800/50 hover:bg-slate-800 border border-transparent"
                      }`}
                      onClick={() => toggleScope(scope.id)}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={formData.scopes.includes(scope.id)}
                          onCheckedChange={() => toggleScope(scope.id)}
                        />
                        <div>
                          <p className="font-medium text-white text-sm">{scope.label}</p>
                          <p className="text-xs text-slate-400">{scope.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
              <div>
                <p className="font-medium text-white text-sm">Confidential Client</p>
                <p className="text-xs text-slate-400">Requires client secret for token requests</p>
              </div>
              <Switch
                checked={formData.isConfidential}
                onCheckedChange={(checked) => setFormData({ ...formData, isConfidential: checked })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateClient}
              className="bg-gradient-to-r from-cyan-600 to-blue-600"
              data-testid="button-submit-create"
            >
              <Key className="w-4 h-4 mr-2" />
              Create Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSecretModal} onOpenChange={setShowSecretModal}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Application Created
            </DialogTitle>
            <DialogDescription>
              Save your client credentials securely. The client secret will not be shown again.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-400 mb-1">Important</p>
                  <p className="text-sm text-slate-300">
                    Copy and store these credentials securely. The client secret cannot be retrieved once you close this dialog.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <Label className="text-slate-400">Client ID</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={newClientId || ""}
                  readOnly
                  className="bg-slate-800 border-slate-700 font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(newClientId || "", "Client ID")}
                >
                  {copiedField === "Client ID" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <div>
              <Label className="text-slate-400">Client Secret</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={newClientSecret || ""}
                  readOnly
                  className="bg-slate-800 border-slate-700 font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(newClientSecret || "", "Client Secret")}
                >
                  {copiedField === "Client Secret" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowSecretModal(false)} data-testid="button-close-secret">
              I've Saved My Credentials
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Delete OAuth Application
            </DialogTitle>
            <DialogDescription>
              This will revoke all access tokens and permanently delete the application. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => showDeleteConfirm && handleDeleteClient(showDeleteConfirm)}
              data-testid="button-confirm-delete"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OAuthManager;
