import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, CheckCircle, Clock, MessageSquare, Users, Zap } from "lucide-react";
import { toast } from "sonner";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { PageHeader, SectionHeader } from "@/components/ui/section-header";
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardDescription, OrbitCardContent, StatCard } from "@/components/ui/orbit-card";

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
  automation: { label: "Automation", color: "bg-blue-500/20 text-blue-400" },
  integration: { label: "Integration", color: "bg-purple-500/20 text-purple-400" },
  reporting: { label: "Reporting", color: "bg-green-500/20 text-green-400" },
  ui: { label: "User Interface", color: "bg-orange-500/20 text-orange-400" },
  other: { label: "Other", color: "bg-gray-500/20 text-gray-400" },
};

const PRIORITIES = {
  low: { label: "Low", color: "bg-gray-500/20 text-gray-400" },
  medium: { label: "Medium", color: "bg-yellow-500/20 text-yellow-400" },
  high: { label: "High", color: "bg-orange-500/20 text-orange-400" },
  critical: { label: "Critical", color: "bg-red-500/20 text-red-400" },
};

const STATUS_ICONS = {
  open: { icon: MessageSquare, color: "text-blue-400" },
  "in-review": { icon: Clock, color: "text-yellow-400" },
  planned: { icon: Clock, color: "text-purple-400" },
  "in-progress": { icon: Clock, color: "text-orange-400" },
  completed: { icon: CheckCircle, color: "text-green-400" },
  declined: { icon: MessageSquare, color: "text-red-400" },
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
  const inProgressCount = requests.filter(r => r.status === "in-progress").length;

  return (
    <Shell>
      <PageHeader
        title="Feature Requests"
        subtitle="Tell us what features would help your business"
        actions={
          <Button className="bg-cyan-600 hover:bg-cyan-500" onClick={() => setShowForm(!showForm)}>
            <Lightbulb className="w-4 h-4 mr-2" />
            Suggest a Feature
          </Button>
        }
      />

      {showForm && (
        <OrbitCard variant="action" hover={false} className="mb-8 border-cyan-500/30">
          <OrbitCardHeader>
            <OrbitCardTitle>Submit a Feature Request</OrbitCardTitle>
            <OrbitCardDescription>Help us build the features you need</OrbitCardDescription>
          </OrbitCardHeader>
          <OrbitCardContent>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Feature Title</label>
                <input
                  type="text"
                  placeholder="e.g., Salesforce Integration"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  data-testid="input-feature-title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  placeholder="Describe how this feature would help your workflow..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 h-24 resize-none"
                  data-testid="input-feature-description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
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
                  <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
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
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-500" data-testid="button-submit-request">
                  Submit Request
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-600 hover:border-cyan-500"
                  onClick={() => setShowForm(false)}
                  data-testid="button-cancel-request"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </OrbitCardContent>
        </OrbitCard>
      )}

      <BentoGrid cols={4} gap="md" className="mb-8">
        <BentoTile className="p-0">
          <StatCard
            label="Total Requests"
            value={requests.length}
            icon={<Users className="w-6 h-6" />}
          />
        </BentoTile>
        <BentoTile className="p-0">
          <StatCard
            label="Open"
            value={activeCount}
            icon={<MessageSquare className="w-6 h-6" />}
          />
        </BentoTile>
        <BentoTile className="p-0">
          <StatCard
            label="Completed"
            value={completedCount}
            icon={<CheckCircle className="w-6 h-6" />}
          />
        </BentoTile>
        <BentoTile className="p-0">
          <StatCard
            label="In Progress"
            value={inProgressCount}
            icon={<Zap className="w-6 h-6" />}
          />
        </BentoTile>
      </BentoGrid>

      <SectionHeader
        title="All Requests"
        subtitle="Browse and track feature requests"
        size="md"
      />
      
      <Tabs defaultValue="open" className="space-y-6">
        <TabsList className="bg-slate-800 border border-slate-700 w-full">
          <TabsTrigger value="open" className="flex-1 data-[state=active]:bg-cyan-600">Open</TabsTrigger>
          <TabsTrigger value="in-progress" className="flex-1 data-[state=active]:bg-cyan-600">In Progress</TabsTrigger>
          <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-cyan-600">All Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-4">
          <BentoGrid cols={1} gap="md">
            {requests
              .filter((r) => r.status === "open")
              .map((request) => (
                <BentoTile key={request.id} className="p-0">
                  <RequestCard request={request} />
                </BentoTile>
              ))}
          </BentoGrid>
          {!requests.some(r => r.status === "open") && (
            <p className="text-center text-slate-400 py-8">No open requests</p>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-4">
          <BentoGrid cols={1} gap="md">
            {requests
              .filter((r) => r.status === "in-progress" || r.status === "in-review" || r.status === "planned")
              .map((request) => (
                <BentoTile key={request.id} className="p-0">
                  <RequestCard request={request} />
                </BentoTile>
              ))}
          </BentoGrid>
          {!requests.some(r => ["in-progress", "in-review", "planned"].includes(r.status)) && (
            <p className="text-center text-slate-400 py-8">No requests in progress</p>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <BentoGrid cols={1} gap="md">
            {requests.map((request) => (
              <BentoTile key={request.id} className="p-0">
                <RequestCard request={request} />
              </BentoTile>
            ))}
          </BentoGrid>
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
    <OrbitCard
      variant="default"
      className="cursor-pointer"
      data-testid={`card-request-${request.id}`}
    >
      <OrbitCardContent>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <StatusIcon className={`w-4 h-4 ${statusInfo?.color}`} />
              <OrbitCardTitle data-testid={`title-${request.id}`}>
                {request.title}
              </OrbitCardTitle>
            </div>
            <OrbitCardDescription className="mb-3">{request.description}</OrbitCardDescription>

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
              <Badge className="bg-slate-600/50 text-slate-300 border-0" data-testid={`badge-status-${request.id}`}>
                {request.status.replace("-", " ").charAt(0).toUpperCase() + request.status.replace("-", " ").slice(1)}
              </Badge>
              {request.estimatedImplementation && (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                  Est. {new Date(request.estimatedImplementation).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </OrbitCardContent>
    </OrbitCard>
  );
}
