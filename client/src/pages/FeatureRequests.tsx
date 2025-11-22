import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, CheckCircle, Clock, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  estimatedImplementation?: string;
  createdAt: string;
}

const CATEGORIES = {
  automation: { label: "Automation", color: "bg-blue-500/20 text-blue-600" },
  integration: { label: "Integration", color: "bg-purple-500/20 text-purple-600" },
  reporting: { label: "Reporting", color: "bg-green-500/20 text-green-600" },
  ui: { label: "User Interface", color: "bg-orange-500/20 text-orange-600" },
  other: { label: "Other", color: "bg-gray-500/20 text-gray-600" },
};

const PRIORITIES = {
  low: { label: "Low", color: "bg-gray-500/20 text-gray-600" },
  medium: { label: "Medium", color: "bg-yellow-500/20 text-yellow-600" },
  high: { label: "High", color: "bg-orange-500/20 text-orange-600" },
  critical: { label: "Critical", color: "bg-red-500/20 text-red-600" },
};

const STATUS_ICONS = {
  open: { icon: MessageSquare, color: "text-blue-600" },
  "in-review": { icon: Clock, color: "text-yellow-600" },
  planned: { icon: Clock, color: "text-purple-600" },
  "in-progress": { icon: Clock, color: "text-orange-600" },
  completed: { icon: CheckCircle, color: "text-green-600" },
  declined: { icon: MessageSquare, color: "text-red-600" },
};

export default function FeatureRequests() {
  const [requests, setRequests] = useState<FeatureRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "automation",
    priority: "medium",
  });

  // Mock data for demo
  useEffect(() => {
    setRequests([
      {
        id: "1",
        title: "Multi-language Support",
        description: "Support for Spanish and French languages in the platform",
        category: "ui",
        priority: "high",
        status: "in-progress",
        estimatedImplementation: "2025-12-15",
        createdAt: "2025-11-10T10:00:00Z",
      },
      {
        id: "2",
        title: "QuickBooks Integration",
        description: "Direct integration with QuickBooks for automated accounting",
        category: "integration",
        priority: "critical",
        status: "planned",
        estimatedImplementation: "2025-12-30",
        createdAt: "2025-11-15T14:30:00Z",
      },
      {
        id: "3",
        title: "Mobile App for Workers",
        description: "Native iOS and Android app for worker check-ins and communications",
        category: "automation",
        priority: "high",
        status: "planned",
        createdAt: "2025-11-20T09:15:00Z",
      },
      {
        id: "4",
        title: "Advanced Analytics Dashboard",
        description: "Real-time analytics with revenue forecasting and trend analysis",
        category: "reporting",
        priority: "medium",
        status: "open",
        createdAt: "2025-11-22T11:00:00Z",
      },
    ]);
  }, []);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    // Mock submission
    const newRequest: FeatureRequest = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      status: "open",
      createdAt: new Date().toISOString(),
    };

    setRequests([newRequest, ...requests]);
    setFormData({ title: "", description: "", category: "automation", priority: "medium" });
    setShowForm(false);
    toast.success("Feature request submitted successfully!");
  };

  const activeCount = requests.filter(r => r.status === "open").length;
  const completedCount = requests.filter(r => r.status === "completed").length;

  return (
    <Shell>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Feature Requests</h1>
          <p className="text-muted-foreground">Tell us what features would help your business</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowForm(!showForm)}>
          <Lightbulb className="w-4 h-4 mr-2" />
          Suggest a Feature
        </Button>
      </div>

      {/* Request Form */}
      {showForm && (
        <Card className="mb-8 bg-primary/5 border-primary/30">
          <CardHeader>
            <CardTitle>Submit a Feature Request</CardTitle>
            <CardDescription>Help us build the features you need</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Feature Title</label>
                <input
                  type="text"
                  placeholder="e.g., Salesforce Integration"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-border/50 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  data-testid="input-feature-title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  placeholder="Describe how this feature would help your workflow..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border/50 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 h-24 resize-none"
                  data-testid="input-feature-description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-border/50 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    data-testid="select-category"
                  >
                    {Object.entries(CATEGORIES).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-border/50 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    data-testid="select-priority"
                  >
                    {Object.entries(PRIORITIES).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="bg-primary" data-testid="button-submit-request">
                  Submit Request
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  data-testid="button-cancel-request"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Requests</p>
            <p className="text-2xl font-bold text-primary">{requests.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Open</p>
            <p className="text-2xl font-bold text-blue-600">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">{completedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold text-orange-600">
              {requests.filter(r => r.status === "in-progress").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      <Tabs defaultValue="open" className="space-y-6">
        <TabsList className="bg-card border border-border/50 w-full">
          <TabsTrigger value="open" className="flex-1">Open</TabsTrigger>
          <TabsTrigger value="in-progress" className="flex-1">In Progress</TabsTrigger>
          <TabsTrigger value="all" className="flex-1">All Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-4">
          {requests
            .filter((r) => r.status === "open")
            .map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          {!requests.some(r => r.status === "open") && (
            <p className="text-center text-muted-foreground py-8">No open requests</p>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-4">
          {requests
            .filter((r) => r.status === "in-progress" || r.status === "in-review" || r.status === "planned")
            .map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          {!requests.some(r => ["in-progress", "in-review", "planned"].includes(r.status)) && (
            <p className="text-center text-muted-foreground py-8">No requests in progress</p>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </TabsContent>
      </Tabs>
    </Shell>
  );
}

function RequestCard({ request }: { request: FeatureRequest }) {
  const category = CATEGORIES[request.category as keyof typeof CATEGORIES];
  const priority = PRIORITIES[request.priority as keyof typeof PRIORITIES];
  const statusInfo = STATUS_ICONS[request.status as keyof typeof STATUS_ICONS];
  const StatusIcon = statusInfo?.icon || MessageSquare;

  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors"
      data-testid={`card-request-${request.id}`}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <StatusIcon className={`w-4 h-4 ${statusInfo?.color}`} />
              <h3 className="text-lg font-semibold" data-testid={`title-${request.id}`}>
                {request.title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{request.description}</p>

            <div className="flex items-center gap-2 flex-wrap">
              {category && (
                <Badge className={`${category.color} border-0`} data-testid={`badge-category-${request.id}`}>
                  {category.label}
                </Badge>
              )}
              {priority && (
                <Badge className={`${priority.color} border-0`} data-testid={`badge-priority-${request.id}`}>
                  {priority.label}
                </Badge>
              )}
              <Badge className="bg-slate-500/20 text-slate-600 border-0" data-testid={`badge-status-${request.id}`}>
                {request.status.replace("-", " ").charAt(0).toUpperCase() + request.status.replace("-", " ").slice(1)}
              </Badge>
              {request.estimatedImplementation && (
                <Badge className="bg-green-500/20 text-green-600 border-0">
                  Est. {new Date(request.estimatedImplementation).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
