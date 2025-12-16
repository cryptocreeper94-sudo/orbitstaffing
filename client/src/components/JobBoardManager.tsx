import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Link2, 
  Unlink, 
  ExternalLink, 
  Users, 
  Eye, 
  MousePointer,
  Briefcase,
  Plus,
  RefreshCw,
  Pause,
  Play,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

interface JobBoardConnection {
  id: string;
  tenantId: string;
  provider: string;
  accountId?: string;
  employerName?: string;
  isActive: boolean;
  connectionStatus: string;
  lastSyncAt?: string;
  createdAt: string;
}

interface JobPosting {
  id: string;
  provider: string;
  jobTitle: string;
  jobDescription?: string;
  location?: string;
  status: string;
  postUrl?: string;
  viewCount: number;
  applicantCount: number;
  clickCount: number;
  postedAt?: string;
  expiresAt?: string;
}

interface ProviderConfig {
  name: string;
  displayName: string;
  logoUrl: string;
  description: string;
  authType: string;
  features: string[];
}

const providerLogos: Record<string, string> = {
  indeed: "/icons/pro/3d_briefcase_jobs_icon.png",
  linkedin: "/icons/pro/3d_link_connection_icon.png",
  ziprecruiter: "/icons/pro/3d_star_talent_icon.png",
};

const providerColors: Record<string, string> = {
  indeed: "bg-blue-600",
  linkedin: "bg-blue-700",
  ziprecruiter: "bg-green-600",
};

export function JobBoardManager() {
  const queryClient = useQueryClient();
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [accountId, setAccountId] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    location: "",
    city: "",
    state: "",
    zipCode: "",
    isRemote: false,
    jobType: "full-time",
    salaryMin: "",
    salaryMax: "",
    salaryType: "hourly",
  });

  const { data: providers = [] } = useQuery<ProviderConfig[]>({
    queryKey: ["/api/admin/job-boards/providers"],
  });

  const { data: connections = [], isLoading: connectionsLoading } = useQuery<JobBoardConnection[]>({
    queryKey: ["/api/admin/job-boards/connections"],
  });

  const { data: postings = [], isLoading: postingsLoading } = useQuery<JobPosting[]>({
    queryKey: ["/api/admin/job-boards/postings"],
  });

  const connectMutation = useMutation({
    mutationFn: async ({ provider, accessToken, accountId, employerName }: any) => {
      const res = await fetch(`/api/admin/job-boards/connect/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, accountId, employerName }),
      });
      if (!res.ok) throw new Error("Failed to connect");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/job-boards/connections"] });
      setShowConnectDialog(false);
      setApiKey("");
      setAccountId("");
      setEmployerName("");
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/job-boards/disconnect/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to disconnect");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/job-boards/connections"] });
    },
  });

  const postJobMutation = useMutation({
    mutationFn: async ({ providers, jobData }: any) => {
      const res = await fetch("/api/admin/job-boards/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providers, jobData }),
      });
      if (!res.ok) throw new Error("Failed to post job");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/job-boards/postings"] });
      setShowPostDialog(false);
      setSelectedProviders([]);
      setJobData({
        title: "",
        description: "",
        location: "",
        city: "",
        state: "",
        zipCode: "",
        isRemote: false,
        jobType: "full-time",
        salaryMin: "",
        salaryMax: "",
        salaryType: "hourly",
      });
    },
  });

  const updatePostingMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/admin/job-boards/postings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update posting");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/job-boards/postings"] });
    },
  });

  const deletePostingMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/job-boards/postings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete posting");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/job-boards/postings"] });
    },
  });

  const syncStatsMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/job-boards/postings/${id}/sync`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to sync stats");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/job-boards/postings"] });
    },
  });

  const getConnectionByProvider = (provider: string) => 
    connections.find(c => c.provider === provider);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" /> Active</Badge>;
      case "paused":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Pause className="w-3 h-3 mr-1" /> Paused</Badge>;
      case "expired":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><Clock className="w-3 h-3 mr-1" /> Expired</Badge>;
      case "closed":
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30"><AlertCircle className="w-3 h-3 mr-1" /> Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const activeConnections = connections.filter(c => c.isActive && c.connectionStatus === 'connected');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Job Board Integration</h2>
          <p className="text-gray-400">Post jobs to Indeed, LinkedIn, and ZipRecruiter</p>
        </div>
        <Button 
          onClick={() => setShowPostDialog(true)}
          disabled={activeConnections.length === 0}
          data-testid="button-post-job"
        >
          <Plus className="w-4 h-4 mr-2" /> Post New Job
        </Button>
      </div>

      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList className="bg-gray-800/50">
          <TabsTrigger value="connections" data-testid="tab-connections">
            <Link2 className="w-4 h-4 mr-2" /> Connections ({connections.length})
          </TabsTrigger>
          <TabsTrigger value="postings" data-testid="tab-postings">
            <Briefcase className="w-4 h-4 mr-2" /> Active Postings ({postings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["indeed", "linkedin", "ziprecruiter"].map(provider => {
              const connection = getConnectionByProvider(provider);
              const isConnected = connection?.isActive && connection?.connectionStatus === 'connected';

              return (
                <Card key={provider} className="bg-gray-800/50 border-gray-700" data-testid={`card-provider-${provider}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={providerLogos[provider]} 
                          alt={provider} 
                          className="w-10 h-10 rounded-lg"
                        />
                        <div>
                          <CardTitle className="text-lg capitalize">{provider}</CardTitle>
                          {connection?.employerName && (
                            <p className="text-sm text-gray-400">{connection.employerName}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant={isConnected ? "default" : "secondary"}>
                        {isConnected ? "Connected" : "Not Connected"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isConnected ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Account ID</span>
                          <span className="text-gray-200">{connection?.accountId || "N/A"}</span>
                        </div>
                        {connection?.lastSyncAt && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Last Sync</span>
                            <span className="text-gray-200">
                              {new Date(connection.lastSyncAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="w-full"
                          onClick={() => disconnectMutation.mutate(connection!.id)}
                          disabled={disconnectMutation.isPending}
                          data-testid={`button-disconnect-${provider}`}
                        >
                          <Unlink className="w-4 h-4 mr-2" /> Disconnect
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-400">
                          Connect your {provider} employer account to post jobs.
                        </p>
                        <Button 
                          className="w-full"
                          onClick={() => {
                            setSelectedProvider(provider);
                            setShowConnectDialog(true);
                          }}
                          data-testid={`button-connect-${provider}`}
                        >
                          <Link2 className="w-4 h-4 mr-2" /> Connect
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="bg-amber-900/20 border-amber-600/30">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-200">API Credentials Required</h4>
                  <p className="text-sm text-amber-300/70 mt-1">
                    To connect to job boards, you'll need employer API credentials from each platform. 
                    Contact Indeed, LinkedIn, or ZipRecruiter to obtain partner API access.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="postings" className="space-y-4">
          {postings.length === 0 ? (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="py-12 text-center">
                <Briefcase className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300">No Job Postings</h3>
                <p className="text-gray-400 mt-2">Post your first job to start attracting candidates.</p>
                <Button 
                  className="mt-4"
                  onClick={() => setShowPostDialog(true)}
                  disabled={activeConnections.length === 0}
                  data-testid="button-post-first-job"
                >
                  <Plus className="w-4 h-4 mr-2" /> Post a Job
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {postings.map(posting => (
                <Card key={posting.id} className="bg-gray-800/50 border-gray-700" data-testid={`card-posting-${posting.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <img 
                          src={providerLogos[posting.provider]} 
                          alt={posting.provider} 
                          className="w-10 h-10 rounded-lg mt-1"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">{posting.jobTitle}</h3>
                            {getStatusBadge(posting.status)}
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            {posting.location || "Remote"} • Posted on {posting.provider}
                          </p>
                          {posting.postedAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              Posted: {new Date(posting.postedAt).toLocaleDateString()}
                              {posting.expiresAt && ` • Expires: ${new Date(posting.expiresAt).toLocaleDateString()}`}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {posting.postUrl && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => window.open(posting.postUrl, '_blank')}
                            data-testid={`button-view-posting-${posting.id}`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => syncStatsMutation.mutate(posting.id)}
                          disabled={syncStatsMutation.isPending}
                          data-testid={`button-sync-${posting.id}`}
                        >
                          <RefreshCw className={`w-4 h-4 ${syncStatsMutation.isPending ? 'animate-spin' : ''}`} />
                        </Button>
                        {posting.status === 'active' && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => updatePostingMutation.mutate({ id: posting.id, status: 'paused' })}
                            data-testid={`button-pause-${posting.id}`}
                          >
                            <Pause className="w-4 h-4" />
                          </Button>
                        )}
                        {posting.status === 'paused' && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => updatePostingMutation.mutate({ id: posting.id, status: 'active' })}
                            data-testid={`button-resume-${posting.id}`}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deletePostingMutation.mutate(posting.id)}
                          disabled={deletePostingMutation.isPending}
                          data-testid={`button-delete-${posting.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-700">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">{posting.viewCount || 0} views</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MousePointer className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">{posting.clickCount || 0} clicks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-medium text-cyan-300">{posting.applicantCount || 0} applicants</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="capitalize">Connect to {selectedProvider}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>API Key / Access Token</Label>
              <Input 
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                data-testid="input-api-key"
              />
            </div>
            <div className="space-y-2">
              <Label>Employer Account ID (Optional)</Label>
              <Input 
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="Enter your employer account ID"
                data-testid="input-account-id"
              />
            </div>
            <div className="space-y-2">
              <Label>Company Name (Optional)</Label>
              <Input 
                value={employerName}
                onChange={(e) => setEmployerName(e.target.value)}
                placeholder="Your company name on the platform"
                data-testid="input-employer-name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectDialog(false)}>Cancel</Button>
            <Button 
              onClick={() => connectMutation.mutate({ 
                provider: selectedProvider, 
                accessToken: apiKey,
                accountId,
                employerName,
              })}
              disabled={!apiKey || connectMutation.isPending}
              data-testid="button-confirm-connect"
            >
              {connectMutation.isPending ? "Connecting..." : "Connect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post a New Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Job Boards</Label>
              <div className="flex flex-wrap gap-3">
                {activeConnections.map(conn => (
                  <label 
                    key={conn.id} 
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedProviders.includes(conn.provider)
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <Checkbox
                      checked={selectedProviders.includes(conn.provider)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedProviders([...selectedProviders, conn.provider]);
                        } else {
                          setSelectedProviders(selectedProviders.filter(p => p !== conn.provider));
                        }
                      }}
                      data-testid={`checkbox-provider-${conn.provider}`}
                    />
                    <img src={providerLogos[conn.provider]} alt={conn.provider} className="w-6 h-6" />
                    <span className="capitalize">{conn.provider}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Job Title *</Label>
              <Input 
                value={jobData.title}
                onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
                placeholder="e.g., Warehouse Associate"
                data-testid="input-job-title"
              />
            </div>

            <div className="space-y-2">
              <Label>Job Description</Label>
              <Textarea 
                value={jobData.description}
                onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
                placeholder="Describe the role, responsibilities, and requirements..."
                rows={4}
                data-testid="input-job-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input 
                  value={jobData.city}
                  onChange={(e) => setJobData({ ...jobData, city: e.target.value })}
                  placeholder="e.g., Atlanta"
                  data-testid="input-city"
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input 
                  value={jobData.state}
                  onChange={(e) => setJobData({ ...jobData, state: e.target.value })}
                  placeholder="e.g., GA"
                  data-testid="input-state"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={jobData.isRemote}
                onCheckedChange={(checked) => setJobData({ ...jobData, isRemote: checked })}
                data-testid="switch-remote"
              />
              <Label>Remote Position</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Type</Label>
                <Select 
                  value={jobData.jobType} 
                  onValueChange={(v) => setJobData({ ...jobData, jobType: v })}
                >
                  <SelectTrigger data-testid="select-job-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-Time</SelectItem>
                    <SelectItem value="part-time">Part-Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="temp">Temporary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Pay Type</Label>
                <Select 
                  value={jobData.salaryType} 
                  onValueChange={(v) => setJobData({ ...jobData, salaryType: v })}
                >
                  <SelectTrigger data-testid="select-salary-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="salary">Salary</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Pay</Label>
                <Input 
                  type="number"
                  value={jobData.salaryMin}
                  onChange={(e) => setJobData({ ...jobData, salaryMin: e.target.value })}
                  placeholder="e.g., 15"
                  data-testid="input-salary-min"
                />
              </div>
              <div className="space-y-2">
                <Label>Max Pay</Label>
                <Input 
                  type="number"
                  value={jobData.salaryMax}
                  onChange={(e) => setJobData({ ...jobData, salaryMax: e.target.value })}
                  placeholder="e.g., 20"
                  data-testid="input-salary-max"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPostDialog(false)}>Cancel</Button>
            <Button 
              onClick={() => postJobMutation.mutate({ 
                providers: selectedProviders, 
                jobData: {
                  ...jobData,
                  salaryMin: jobData.salaryMin ? parseFloat(jobData.salaryMin) : undefined,
                  salaryMax: jobData.salaryMax ? parseFloat(jobData.salaryMax) : undefined,
                },
              })}
              disabled={!jobData.title || selectedProviders.length === 0 || postJobMutation.isPending}
              data-testid="button-confirm-post"
            >
              {postJobMutation.isPending ? "Posting..." : `Post to ${selectedProviders.length} Board${selectedProviders.length !== 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}