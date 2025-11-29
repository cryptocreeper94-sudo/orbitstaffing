import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Calendar,
  MessageSquare,
  BarChart3,
  Plus,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Target,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  StickyNote,
  GitMerge,
  Workflow,
  Settings,
  ChevronRight,
  GripVertical,
  X,
  Pin,
  Video,
  MapPin,
  Send,
  Eye,
  MousePointer,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const PIPELINE_STAGES = [
  { id: "lead", label: "Lead", color: "bg-slate-500", probability: 10 },
  { id: "qualified", label: "Qualified", color: "bg-blue-500", probability: 25 },
  { id: "proposal", label: "Proposal", color: "bg-amber-500", probability: 50 },
  { id: "negotiation", label: "Negotiation", color: "bg-purple-500", probability: 75 },
  { id: "closed_won", label: "Closed Won", color: "bg-green-500", probability: 100 },
  { id: "closed_lost", label: "Closed Lost", color: "bg-red-500", probability: 0 },
];

export default function CRMDashboard() {
  const [activeTab, setActiveTab] = useState("pipeline");
  const [showDealModal, setShowDealModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [selectedEntity, setSelectedEntity] = useState<{ type: string; id: string } | null>(null);
  const [draggedDeal, setDraggedDeal] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["crm-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/crm/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json();
    },
  });

  const { data: dealsData, isLoading: dealsLoading } = useQuery({
    queryKey: ["crm-deals"],
    queryFn: async () => {
      const res = await fetch("/api/crm/deals");
      if (!res.ok) throw new Error("Failed to fetch deals");
      return res.json();
    },
  });

  const { data: meetingsData } = useQuery({
    queryKey: ["crm-meetings"],
    queryFn: async () => {
      const res = await fetch("/api/crm/meetings");
      if (!res.ok) throw new Error("Failed to fetch meetings");
      return res.json();
    },
  });

  const { data: duplicatesData } = useQuery({
    queryKey: ["crm-duplicates"],
    queryFn: async () => {
      const res = await fetch("/api/crm/duplicates?status=pending");
      if (!res.ok) throw new Error("Failed to fetch duplicates");
      return res.json();
    },
  });

  const { data: emailTrackingData } = useQuery({
    queryKey: ["crm-email-tracking"],
    queryFn: async () => {
      const res = await fetch("/api/crm/email-tracking?days=30");
      if (!res.ok) throw new Error("Failed to fetch email tracking");
      return res.json();
    },
  });

  const createDealMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/crm/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create deal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-deals"] });
      queryClient.invalidateQueries({ queryKey: ["crm-dashboard"] });
      setShowDealModal(false);
      toast({ title: "Deal created successfully" });
    },
  });

  const updateDealMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/crm/deals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update deal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-deals"] });
      queryClient.invalidateQueries({ queryKey: ["crm-dashboard"] });
      toast({ title: "Deal updated" });
    },
  });

  const createMeetingMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/crm/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create meeting");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-meetings"] });
      setShowMeetingModal(false);
      toast({ title: "Meeting scheduled" });
    },
  });

  const scanDuplicatesMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/crm/duplicates/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType: "worker" }),
      });
      if (!res.ok) throw new Error("Failed to scan for duplicates");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["crm-duplicates"] });
      toast({ title: data.message });
    },
  });

  const handleDragStart = (deal: any) => {
    setDraggedDeal(deal);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stage: string) => {
    if (draggedDeal && draggedDeal.stage !== stage) {
      updateDealMutation.mutate({
        id: draggedDeal.id,
        data: { stage },
      });
    }
    setDraggedDeal(null);
  };

  const deals = dealsData?.deals || [];
  const meetings = meetingsData?.meetings || [];
  const duplicates = duplicatesData?.duplicates || [];
  const emailStats = emailTrackingData?.stats || {};

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3" data-testid="text-crm-title">
              <BarChart3 className="w-8 h-8 text-cyan-400" />
              CRM Dashboard
            </h1>
            <p className="text-slate-400 mt-1">
              Complete customer relationship management - better than HubSpot
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowMeetingModal(true)}
              variant="outline"
              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
              data-testid="button-schedule-meeting"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
            <Button
              onClick={() => setShowDealModal(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
              data-testid="button-new-deal"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Deal
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-cyan-900/50 to-slate-800 border-cyan-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Pipeline Value</p>
                  <p className="text-2xl font-bold text-cyan-400" data-testid="text-pipeline-value">
                    {formatCurrency(dashboardData?.pipeline?.total || 0)}
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-cyan-500/50" />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {dashboardData?.pipeline?.dealCount || 0} active deals
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-slate-800 border-green-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Closed Won</p>
                  <p className="text-2xl font-bold text-green-400" data-testid="text-closed-won">
                    {formatCurrency(dashboardData?.pipeline?.byStage?.closed_won || 0)}
                  </p>
                </div>
                <CheckCircle2 className="w-10 h-10 text-green-500/50" />
              </div>
              <p className="text-xs text-slate-500 mt-2">This period</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-slate-800 border-purple-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Meetings Today</p>
                  <p className="text-2xl font-bold text-purple-400" data-testid="text-meetings-today">
                    {dashboardData?.upcomingMeetings?.length || 0}
                  </p>
                </div>
                <Calendar className="w-10 h-10 text-purple-500/50" />
              </div>
              <p className="text-xs text-slate-500 mt-2">Upcoming scheduled</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-900/50 to-slate-800 border-amber-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Email Open Rate</p>
                  <p className="text-2xl font-bold text-amber-400" data-testid="text-email-open-rate">
                    {emailStats.openRate || 0}%
                  </p>
                </div>
                <Mail className="w-10 h-10 text-amber-500/50" />
              </div>
              <p className="text-xs text-slate-500 mt-2">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-slate-800/50 border border-slate-700/50 p-1">
            <TabsTrigger
              value="pipeline"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
              data-testid="tab-pipeline"
            >
              <Target className="w-4 h-4 mr-2" />
              Pipeline Board
            </TabsTrigger>
            <TabsTrigger
              value="activities"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
              data-testid="tab-activities"
            >
              <Clock className="w-4 h-4 mr-2" />
              Activity Timeline
            </TabsTrigger>
            <TabsTrigger
              value="meetings"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
              data-testid="tab-meetings"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Meetings
            </TabsTrigger>
            <TabsTrigger
              value="duplicates"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
              data-testid="tab-duplicates"
            >
              <GitMerge className="w-4 h-4 mr-2" />
              Duplicates
              {duplicates.length > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {duplicates.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="emails"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
              data-testid="tab-emails"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Tracking
            </TabsTrigger>
            <TabsTrigger
              value="workflows"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
              data-testid="tab-workflows"
            >
              <Workflow className="w-4 h-4 mr-2" />
              Workflows
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline" className="space-y-4">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {PIPELINE_STAGES.slice(0, -1).map((stage) => (
                <div
                  key={stage.id}
                  className="flex-shrink-0 w-72"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(stage.id)}
                >
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                          <CardTitle className="text-sm text-white">{stage.label}</CardTitle>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {deals.filter((d: any) => d.stage === stage.id).length}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        {formatCurrency(
                          deals
                            .filter((d: any) => d.stage === stage.id)
                            .reduce((sum: number, d: any) => sum + parseFloat(d.value || 0), 0)
                        )}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                      {deals
                        .filter((d: any) => d.stage === stage.id)
                        .map((deal: any) => (
                          <Card
                            key={deal.id}
                            className="bg-slate-700/50 border-slate-600/50 cursor-grab active:cursor-grabbing"
                            draggable
                            onDragStart={() => handleDragStart(deal)}
                            onClick={() => {
                              setSelectedDeal(deal);
                              setShowDealModal(true);
                            }}
                            data-testid={`deal-card-${deal.id}`}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium text-white text-sm">{deal.name}</p>
                                  <p className="text-xs text-slate-400 mt-1">{deal.contactName}</p>
                                </div>
                                <GripVertical className="w-4 h-4 text-slate-500" />
                              </div>
                              <div className="flex items-center justify-between mt-3">
                                <p className="text-cyan-400 font-semibold text-sm">
                                  {formatCurrency(parseFloat(deal.value || 0))}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  {deal.probability}%
                                </Badge>
                              </div>
                              {deal.expectedCloseDate && (
                                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Close: {new Date(deal.expectedCloseDate).toLocaleDateString()}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      {deals.filter((d: any) => d.stage === stage.id).length === 0 && (
                        <div className="text-center py-8 text-slate-500 text-sm">
                          <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          Drop deals here
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    Closed Won
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-32">
                    {deals.filter((d: any) => d.stage === "closed_won").length === 0 ? (
                      <p className="text-slate-500 text-center py-4">No closed deals yet</p>
                    ) : (
                      deals
                        .filter((d: any) => d.stage === "closed_won")
                        .map((deal: any) => (
                          <div
                            key={deal.id}
                            className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0"
                          >
                            <span className="text-white">{deal.name}</span>
                            <span className="text-green-400 font-semibold">
                              {formatCurrency(parseFloat(deal.value || 0))}
                            </span>
                          </div>
                        ))
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-400" />
                    Closed Lost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-32">
                    {deals.filter((d: any) => d.stage === "closed_lost").length === 0 ? (
                      <p className="text-slate-500 text-center py-4">No lost deals</p>
                    ) : (
                      deals
                        .filter((d: any) => d.stage === "closed_lost")
                        .map((deal: any) => (
                          <div
                            key={deal.id}
                            className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0"
                          >
                            <div>
                              <span className="text-white">{deal.name}</span>
                              {deal.lostReason && (
                                <p className="text-xs text-slate-500">{deal.lostReason}</p>
                              )}
                            </div>
                            <span className="text-red-400 font-semibold">
                              {formatCurrency(parseFloat(deal.value || 0))}
                            </span>
                          </div>
                        ))
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity Timeline</CardTitle>
                <CardDescription>All interactions across your CRM</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  {(dashboardData?.recentActivities || []).length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No activities yet</p>
                      <p className="text-sm">Interactions will appear here as you use the CRM</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(dashboardData?.recentActivities || []).map((activity: any) => (
                        <div
                          key={activity.id}
                          className="flex gap-4 p-4 rounded-lg bg-slate-700/30 border border-slate-600/30"
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.activityType === 'email' ? 'bg-blue-500/20 text-blue-400' :
                            activity.activityType === 'call' ? 'bg-green-500/20 text-green-400' :
                            activity.activityType === 'meeting' ? 'bg-purple-500/20 text-purple-400' :
                            activity.activityType === 'note' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-slate-500/20 text-slate-400'
                          }`}>
                            {activity.activityType === 'email' && <Mail className="w-5 h-5" />}
                            {activity.activityType === 'call' && <Phone className="w-5 h-5" />}
                            {activity.activityType === 'meeting' && <Calendar className="w-5 h-5" />}
                            {activity.activityType === 'note' && <StickyNote className="w-5 h-5" />}
                            {activity.activityType === 'status_change' && <ArrowRight className="w-5 h-5" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-white">{activity.subject}</p>
                              <span className="text-xs text-slate-500">
                                {formatDate(activity.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-slate-400 mt-1">{activity.description}</p>
                            <Badge variant="outline" className="mt-2 text-xs">
                              {activity.entityType}: {activity.entityId?.slice(0, 8)}...
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meetings" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">Upcoming Meetings</CardTitle>
                  <CardDescription>Your scheduled meetings and calls</CardDescription>
                </div>
                <Button
                  onClick={() => setShowMeetingModal(true)}
                  className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
                  data-testid="button-add-meeting"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Meeting
                </Button>
              </CardHeader>
              <CardContent>
                {meetings.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No meetings scheduled</p>
                    <Button
                      variant="link"
                      className="text-cyan-400 mt-2"
                      onClick={() => setShowMeetingModal(true)}
                    >
                      Schedule your first meeting
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {meetings.map((meeting: any) => (
                      <Card
                        key={meeting.id}
                        className="bg-slate-700/30 border-slate-600/30"
                        data-testid={`meeting-card-${meeting.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-white">{meeting.title}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {formatDate(meeting.startTime)}
                                </span>
                                {meeting.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {meeting.location}
                                  </span>
                                )}
                                {meeting.locationType === 'virtual' && (
                                  <span className="flex items-center gap-1">
                                    <Video className="w-4 h-4" />
                                    Virtual
                                  </span>
                                )}
                              </div>
                            </div>
                            <Badge className={
                              meeting.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                              meeting.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              'bg-slate-500/20 text-slate-400'
                            }>
                              {meeting.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="duplicates" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <GitMerge className="w-5 h-5 text-cyan-400" />
                    Duplicate Detection
                  </CardTitle>
                  <CardDescription>
                    AI-powered duplicate record detection and merge
                  </CardDescription>
                </div>
                <Button
                  onClick={() => scanDuplicatesMutation.mutate()}
                  disabled={scanDuplicatesMutation.isPending}
                  className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
                  data-testid="button-scan-duplicates"
                >
                  {scanDuplicatesMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Scan for Duplicates
                </Button>
              </CardHeader>
              <CardContent>
                {duplicates.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50 text-green-500" />
                    <p>No duplicate records found</p>
                    <p className="text-sm">Click "Scan for Duplicates" to check your database</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {duplicates.map((dup: any) => (
                      <Card
                        key={dup.id}
                        className="bg-slate-700/30 border-amber-500/30"
                        data-testid={`duplicate-card-${dup.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-400" />
                                <p className="font-medium text-white">
                                  Potential Duplicate ({dup.entityType})
                                </p>
                              </div>
                              <p className="text-sm text-slate-400 mt-1">
                                Confidence: {dup.confidenceScore}%
                              </p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {(dup.matchReasons || []).map((reason: string) => (
                                  <Badge key={reason} variant="outline" className="text-xs">
                                    {reason.replace(/_/g, ' ')}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-400 border-red-500/30"
                              >
                                Not Duplicate
                              </Button>
                              <Button
                                size="sm"
                                className="bg-cyan-500/20 text-cyan-400"
                              >
                                Merge
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emails" className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Total Sent</p>
                      <p className="text-2xl font-bold text-white">{emailStats.total || 0}</p>
                    </div>
                    <Send className="w-8 h-8 text-slate-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Opened</p>
                      <p className="text-2xl font-bold text-green-400">{emailStats.opened || 0}</p>
                    </div>
                    <Eye className="w-8 h-8 text-green-500/50" />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{emailStats.openRate || 0}% open rate</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Clicked</p>
                      <p className="text-2xl font-bold text-cyan-400">{emailStats.clicked || 0}</p>
                    </div>
                    <MousePointer className="w-8 h-8 text-cyan-500/50" />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{emailStats.clickRate || 0}% click rate</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Bounced</p>
                      <p className="text-2xl font-bold text-red-400">{emailStats.bounced || 0}</p>
                    </div>
                    <XCircle className="w-8 h-8 text-red-500/50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Email Activity</CardTitle>
                <CardDescription>Real-time tracking of email opens and clicks</CardDescription>
              </CardHeader>
              <CardContent>
                {(emailTrackingData?.emails || []).length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No tracked emails yet</p>
                    <p className="text-sm">Email tracking data will appear here</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {(emailTrackingData?.emails || []).map((email: any) => (
                        <div
                          key={email.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30"
                        >
                          <div className="flex-1">
                            <p className="text-white text-sm">{email.subject || 'No subject'}</p>
                            <p className="text-xs text-slate-400">To: {email.toEmail}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            {email.openedAt && (
                              <Badge className="bg-green-500/20 text-green-400">
                                <Eye className="w-3 h-3 mr-1" />
                                Opened
                              </Badge>
                            )}
                            {email.clickedAt && (
                              <Badge className="bg-cyan-500/20 text-cyan-400">
                                <MousePointer className="w-3 h-3 mr-1" />
                                Clicked
                              </Badge>
                            )}
                            {email.bouncedAt && (
                              <Badge className="bg-red-500/20 text-red-400">
                                <XCircle className="w-3 h-3 mr-1" />
                                Bounced
                              </Badge>
                            )}
                            {!email.openedAt && !email.bouncedAt && (
                              <Badge className="bg-slate-500/20 text-slate-400">
                                Delivered
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Workflow className="w-5 h-5 text-cyan-400" />
                    Automation Workflows
                  </CardTitle>
                  <CardDescription>
                    Create automated actions triggered by events
                  </CardDescription>
                </div>
                <Button
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                  data-testid="button-create-workflow"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Workflow
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-slate-500">
                  <Workflow className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No workflows created yet</p>
                  <p className="text-sm mt-2">
                    Automate tasks like sending follow-up emails, updating deal stages, or assigning workers
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4">
                  <Card className="bg-slate-700/30 border-slate-600/30 p-4">
                    <h4 className="text-white font-medium mb-2">Deal Stage Automation</h4>
                    <p className="text-sm text-slate-400">
                      Automatically send emails when deals move to specific stages
                    </p>
                    <Badge className="mt-2 bg-cyan-500/20 text-cyan-400">Popular</Badge>
                  </Card>
                  <Card className="bg-slate-700/30 border-slate-600/30 p-4">
                    <h4 className="text-white font-medium mb-2">Lead Follow-up</h4>
                    <p className="text-sm text-slate-400">
                      Send automatic follow-up emails to new leads
                    </p>
                  </Card>
                  <Card className="bg-slate-700/30 border-slate-600/30 p-4">
                    <h4 className="text-white font-medium mb-2">Meeting Reminders</h4>
                    <p className="text-sm text-slate-400">
                      Send SMS/email reminders before scheduled meetings
                    </p>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showDealModal} onOpenChange={setShowDealModal}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedDeal ? "Edit Deal" : "Create New Deal"}
            </DialogTitle>
            <DialogDescription>
              Add a new opportunity to your sales pipeline
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = {
                name: formData.get("name"),
                value: formData.get("value"),
                stage: formData.get("stage"),
                contactName: formData.get("contactName"),
                contactEmail: formData.get("contactEmail"),
                expectedCloseDate: formData.get("expectedCloseDate"),
                source: formData.get("source"),
                probability: PIPELINE_STAGES.find(s => s.id === formData.get("stage"))?.probability || 10,
              };
              if (selectedDeal) {
                updateDealMutation.mutate({ id: selectedDeal.id, data });
              } else {
                createDealMutation.mutate(data);
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">Deal Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={selectedDeal?.name}
                placeholder="Enterprise staffing contract"
                className="bg-slate-700 border-slate-600"
                required
                data-testid="input-deal-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value" className="text-slate-300">Value ($)</Label>
                <Input
                  id="value"
                  name="value"
                  type="number"
                  defaultValue={selectedDeal?.value}
                  placeholder="50000"
                  className="bg-slate-700 border-slate-600"
                  data-testid="input-deal-value"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stage" className="text-slate-300">Stage</Label>
                <Select name="stage" defaultValue={selectedDeal?.stage || "lead"}>
                  <SelectTrigger className="bg-slate-700 border-slate-600" data-testid="select-deal-stage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {PIPELINE_STAGES.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName" className="text-slate-300">Contact Name</Label>
                <Input
                  id="contactName"
                  name="contactName"
                  defaultValue={selectedDeal?.contactName}
                  placeholder="John Smith"
                  className="bg-slate-700 border-slate-600"
                  data-testid="input-contact-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="text-slate-300">Contact Email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  defaultValue={selectedDeal?.contactEmail}
                  placeholder="john@company.com"
                  className="bg-slate-700 border-slate-600"
                  data-testid="input-contact-email"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expectedCloseDate" className="text-slate-300">Expected Close</Label>
                <Input
                  id="expectedCloseDate"
                  name="expectedCloseDate"
                  type="date"
                  defaultValue={selectedDeal?.expectedCloseDate}
                  className="bg-slate-700 border-slate-600"
                  data-testid="input-expected-close"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source" className="text-slate-300">Source</Label>
                <Select name="source" defaultValue={selectedDeal?.source || "website"}>
                  <SelectTrigger className="bg-slate-700 border-slate-600" data-testid="select-source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="cold_call">Cold Call</SelectItem>
                    <SelectItem value="trade_show">Trade Show</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDealModal(false);
                  setSelectedDeal(null);
                }}
                className="border-slate-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-cyan-500 to-blue-600"
                disabled={createDealMutation.isPending || updateDealMutation.isPending}
                data-testid="button-save-deal"
              >
                {selectedDeal ? "Update Deal" : "Create Deal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showMeetingModal} onOpenChange={setShowMeetingModal}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Schedule Meeting</DialogTitle>
            <DialogDescription>
              Add a meeting to your calendar
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const startTime = new Date(`${formData.get("date")}T${formData.get("startTime")}`);
              const endTime = new Date(`${formData.get("date")}T${formData.get("endTime")}`);
              createMeetingMutation.mutate({
                title: formData.get("title"),
                description: formData.get("description"),
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                locationType: formData.get("locationType"),
                location: formData.get("location"),
              });
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-300">Meeting Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Sales call with prospect"
                className="bg-slate-700 border-slate-600"
                required
                data-testid="input-meeting-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-300">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Discuss staffing needs and pricing..."
                className="bg-slate-700 border-slate-600"
                data-testid="input-meeting-description"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-slate-300">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  className="bg-slate-700 border-slate-600"
                  required
                  data-testid="input-meeting-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-slate-300">Start</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  defaultValue="09:00"
                  className="bg-slate-700 border-slate-600"
                  required
                  data-testid="input-meeting-start"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-slate-300">End</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  defaultValue="10:00"
                  className="bg-slate-700 border-slate-600"
                  required
                  data-testid="input-meeting-end"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="locationType" className="text-slate-300">Type</Label>
                <Select name="locationType" defaultValue="virtual">
                  <SelectTrigger className="bg-slate-700 border-slate-600" data-testid="select-location-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="in_person">In Person</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-slate-300">Location/Link</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Zoom link or address"
                  className="bg-slate-700 border-slate-600"
                  data-testid="input-meeting-location"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMeetingModal(false)}
                className="border-slate-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-cyan-500 to-blue-600"
                disabled={createMeetingMutation.isPending}
                data-testid="button-save-meeting"
              >
                Schedule Meeting
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
