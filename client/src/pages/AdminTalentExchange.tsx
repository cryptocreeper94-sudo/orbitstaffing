import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Building2,
  Briefcase,
  Users,
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ChevronLeft,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface PendingEmployer {
  id: number;
  company_name: string;
  industry: string;
  company_size: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  city: string;
  state: string;
  website: string;
  description: string;
  created_at: string;
}

interface PendingJob {
  id: number;
  title: string;
  employer_name: string;
  employer_id: number;
  category: string;
  city: string;
  state: string;
  pay_range_min: number;
  pay_range_max: number;
  pay_type: string;
  job_type: string;
  description: string;
  requirements: string;
  is_featured: boolean;
  created_at: string;
}

interface WorkerRequest {
  id: number;
  employer_name: string;
  employer_id: number;
  candidate_name: string;
  candidate_id: number;
  job_title: string;
  job_id: number;
  requested_at: string;
  message: string;
  status: string;
}

interface Analytics {
  totalEmployers: number;
  totalJobs: number;
  totalCandidates: number;
  totalHires: number;
  employerTrend: { date: string; count: number }[];
  jobTrend: { date: string; count: number }[];
  categoryDistribution: { name: string; value: number }[];
  statusDistribution: { name: string; value: number }[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function formatPayRange(min: number | null, max: number | null, payType: string): string {
  if (!min && !max) return "Competitive";
  const formatNum = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`);
  const suffix = payType === "hourly" ? "/hr" : payType === "yearly" ? "/yr" : "";
  if (min && max) return `${formatNum(min)} - ${formatNum(max)}${suffix}`;
  if (min) return `From ${formatNum(min)}${suffix}`;
  if (max) return `Up to ${formatNum(max)}${suffix}`;
  return "Competitive";
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
  testId,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  subtext?: string;
  color: string;
  testId: string;
}) {
  return (
    <Card className="bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/30 transition-all" data-testid={testId}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-sm mb-1">{label}</p>
            <p className="text-3xl font-bold text-white" data-testid={`${testId}-value`}>
              {value}
            </p>
            {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminTalentExchange() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("employers");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type: string; id: number; name: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<any>(null);

  const { data: pendingEmployers, isLoading: loadingEmployers, refetch: refetchEmployers } = useQuery<PendingEmployer[]>({
    queryKey: ["pending-employers"],
    queryFn: async () => {
      const res = await fetch("/api/talent-exchange/admin/pending-employers");
      if (!res.ok) throw new Error("Failed to fetch pending employers");
      const data = await res.json();
      return data.employers || [];
    },
  });

  const { data: pendingJobs, isLoading: loadingJobs, refetch: refetchJobs } = useQuery<PendingJob[]>({
    queryKey: ["pending-jobs"],
    queryFn: async () => {
      const res = await fetch("/api/talent-exchange/admin/pending-jobs");
      if (!res.ok) throw new Error("Failed to fetch pending jobs");
      const data = await res.json();
      return data.jobs || [];
    },
  });

  const { data: workerRequests, isLoading: loadingRequests, refetch: refetchRequests } = useQuery<WorkerRequest[]>({
    queryKey: ["worker-requests"],
    queryFn: async () => {
      const res = await fetch("/api/talent-exchange/admin/worker-requests");
      if (!res.ok) throw new Error("Failed to fetch worker requests");
      const data = await res.json();
      return data.requests || [];
    },
  });

  const { data: analytics, isLoading: loadingAnalytics } = useQuery<Analytics>({
    queryKey: ["talent-exchange-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/talent-exchange/admin/analytics");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const data = await res.json();
      return data.analytics || {
        totalEmployers: 0,
        totalJobs: 0,
        totalCandidates: 0,
        totalHires: 0,
        employerTrend: [],
        jobTrend: [],
        categoryDistribution: [],
        statusDistribution: [],
      };
    },
  });

  const verifyEmployerMutation = useMutation({
    mutationFn: async ({ employerId, status, reason }: { employerId: number; status: string; reason?: string }) => {
      const res = await fetch(`/api/talent-exchange/admin/employers/${employerId}/verify`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejection_reason: reason }),
      });
      if (!res.ok) throw new Error("Failed to update employer status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-employers"] });
      queryClient.invalidateQueries({ queryKey: ["talent-exchange-analytics"] });
      setApproveDialogOpen(false);
      setRejectDialogOpen(false);
      setSelectedItem(null);
      setRejectionReason("");
    },
  });

  const moderateJobMutation = useMutation({
    mutationFn: async ({ jobId, status, reason }: { jobId: number; status: string; reason?: string }) => {
      const res = await fetch(`/api/talent-exchange/admin/jobs/${jobId}/moderate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejection_reason: reason }),
      });
      if (!res.ok) throw new Error("Failed to update job status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["talent-exchange-analytics"] });
      setApproveDialogOpen(false);
      setRejectDialogOpen(false);
      setSelectedItem(null);
      setRejectionReason("");
    },
  });

  const updateWorkerRequestMutation = useMutation({
    mutationFn: async ({ requestId, status, reason }: { requestId: number; status: string; reason?: string }) => {
      const res = await fetch(`/api/talent-exchange/admin/worker-requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejection_reason: reason }),
      });
      if (!res.ok) throw new Error("Failed to update worker request");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worker-requests"] });
      queryClient.invalidateQueries({ queryKey: ["talent-exchange-analytics"] });
      setApproveDialogOpen(false);
      setRejectDialogOpen(false);
      setSelectedItem(null);
      setRejectionReason("");
    },
  });

  const handleApprove = (type: string, id: number, name: string) => {
    setSelectedItem({ type, id, name });
    setApproveDialogOpen(true);
  };

  const handleReject = (type: string, id: number, name: string) => {
    setSelectedItem({ type, id, name });
    setRejectDialogOpen(true);
  };

  const confirmApprove = () => {
    if (!selectedItem) return;
    
    if (selectedItem.type === "employer") {
      verifyEmployerMutation.mutate({ employerId: selectedItem.id, status: "verified" });
    } else if (selectedItem.type === "job") {
      moderateJobMutation.mutate({ jobId: selectedItem.id, status: "active" });
    } else if (selectedItem.type === "request") {
      updateWorkerRequestMutation.mutate({ requestId: selectedItem.id, status: "approved" });
    }
  };

  const confirmReject = () => {
    if (!selectedItem || !rejectionReason.trim()) return;
    
    if (selectedItem.type === "employer") {
      verifyEmployerMutation.mutate({ employerId: selectedItem.id, status: "rejected", reason: rejectionReason });
    } else if (selectedItem.type === "job") {
      moderateJobMutation.mutate({ jobId: selectedItem.id, status: "rejected", reason: rejectionReason });
    } else if (selectedItem.type === "request") {
      updateWorkerRequestMutation.mutate({ requestId: selectedItem.id, status: "rejected", reason: rejectionReason });
    }
  };

  const handleViewDetails = (item: any, type: string) => {
    setSelectedDetails({ ...item, type });
    setDetailsDialogOpen(true);
  };

  const refreshAll = () => {
    refetchEmployers();
    refetchJobs();
    refetchRequests();
  };

  const pendingEmployersCount = pendingEmployers?.length || 0;
  const pendingJobsCount = pendingJobs?.length || 0;
  const pendingRequestsCount = workerRequests?.filter(r => r.status === "pending")?.length || 0;
  const totalCandidates = analytics?.totalCandidates || 0;

  const CHART_COLORS = ["#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <div className="min-h-screen bg-slate-900" data-testid="admin-talent-exchange-page">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/admin")}
              className="text-slate-400 hover:text-white"
              data-testid="button-back"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Admin
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAll}
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
            data-testid="button-refresh"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold text-white" data-testid="text-page-title">
              Talent Exchange Moderation
            </h1>
          </div>
          <p className="text-slate-400">
            Review and moderate employers, job postings, and worker hire requests
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Building2}
            label="Pending Employers"
            value={pendingEmployersCount}
            subtext="Awaiting verification"
            color="bg-amber-600"
            testId="card-pending-employers"
          />
          <StatCard
            icon={Briefcase}
            label="Pending Jobs"
            value={pendingJobsCount}
            subtext="Awaiting review"
            color="bg-cyan-600"
            testId="card-pending-jobs"
          />
          <StatCard
            icon={UserCheck}
            label="Worker Requests"
            value={pendingRequestsCount}
            subtext="Hire requests pending"
            color="bg-purple-600"
            testId="card-worker-requests"
          />
          <StatCard
            icon={Users}
            label="Total Candidates"
            value={totalCandidates}
            subtext="Registered on platform"
            color="bg-green-600"
            testId="card-total-candidates"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700/50 p-1">
            <TabsTrigger
              value="employers"
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-slate-400"
              data-testid="tab-employers"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Employers ({pendingEmployersCount})
            </TabsTrigger>
            <TabsTrigger
              value="jobs"
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-slate-400"
              data-testid="tab-jobs"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Jobs ({pendingJobsCount})
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-slate-400"
              data-testid="tab-requests"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Worker Requests ({pendingRequestsCount})
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-slate-400"
              data-testid="tab-analytics"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employers" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cyan-400" />
                  Pending Employer Approvals
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Review and verify new employer registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingEmployers ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 bg-slate-700/50" />
                    ))}
                  </div>
                ) : pendingEmployers && pendingEmployers.length > 0 ? (
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700/50 hover:bg-transparent">
                          <TableHead className="text-slate-400">Company</TableHead>
                          <TableHead className="text-slate-400">Contact</TableHead>
                          <TableHead className="text-slate-400">Location</TableHead>
                          <TableHead className="text-slate-400">Submitted</TableHead>
                          <TableHead className="text-slate-400 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingEmployers.map((employer) => (
                          <TableRow
                            key={employer.id}
                            className="border-slate-700/50 hover:bg-slate-700/30"
                            data-testid={`row-employer-${employer.id}`}
                          >
                            <TableCell>
                              <div>
                                <p className="font-medium text-white" data-testid={`text-employer-name-${employer.id}`}>
                                  {employer.company_name}
                                </p>
                                <p className="text-sm text-slate-400">{employer.industry}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="text-sm text-white">{employer.contact_name}</p>
                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {employer.contact_email}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm text-slate-300 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {employer.city}, {employer.state}
                              </p>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm text-slate-400">{formatDate(employer.created_at)}</p>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDetails(employer, "employer")}
                                  className="text-slate-400 hover:text-cyan-400"
                                  data-testid={`button-view-employer-${employer.id}`}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApprove("employer", employer.id, employer.company_name)}
                                  className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
                                  data-testid={`button-approve-employer-${employer.id}`}
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReject("employer", employer.id, employer.company_name)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                  data-testid={`button-reject-employer-${employer.id}`}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12">
                    <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400" data-testid="text-no-pending-employers">
                      No pending employer approvals
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-cyan-400" />
                  Pending Job Reviews
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Review and approve job postings before they go live
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingJobs ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 bg-slate-700/50" />
                    ))}
                  </div>
                ) : pendingJobs && pendingJobs.length > 0 ? (
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700/50 hover:bg-transparent">
                          <TableHead className="text-slate-400">Job Title</TableHead>
                          <TableHead className="text-slate-400">Employer</TableHead>
                          <TableHead className="text-slate-400">Pay Range</TableHead>
                          <TableHead className="text-slate-400">Location</TableHead>
                          <TableHead className="text-slate-400">Submitted</TableHead>
                          <TableHead className="text-slate-400 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingJobs.map((job) => (
                          <TableRow
                            key={job.id}
                            className="border-slate-700/50 hover:bg-slate-700/30"
                            data-testid={`row-job-${job.id}`}
                          >
                            <TableCell>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-white" data-testid={`text-job-title-${job.id}`}>
                                    {job.title}
                                  </p>
                                  {job.is_featured && (
                                    <Badge className="bg-amber-600/20 text-amber-300 border-amber-500/30 text-xs">
                                      Featured
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-slate-400">{job.category}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm text-slate-300">{job.employer_name}</p>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm text-green-400 flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                {formatPayRange(job.pay_range_min, job.pay_range_max, job.pay_type)}
                              </p>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm text-slate-300 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {job.city}, {job.state}
                              </p>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm text-slate-400">{formatDate(job.created_at)}</p>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDetails(job, "job")}
                                  className="text-slate-400 hover:text-cyan-400"
                                  data-testid={`button-view-job-${job.id}`}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApprove("job", job.id, job.title)}
                                  className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
                                  data-testid={`button-approve-job-${job.id}`}
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReject("job", job.id, job.title)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                  data-testid={`button-reject-job-${job.id}`}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12">
                    <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400" data-testid="text-no-pending-jobs">
                      No pending job reviews
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-cyan-400" />
                  Worker Hire Requests
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Review employer requests to hire candidates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingRequests ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 bg-slate-700/50" />
                    ))}
                  </div>
                ) : workerRequests && workerRequests.filter(r => r.status === "pending").length > 0 ? (
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700/50 hover:bg-transparent">
                          <TableHead className="text-slate-400">Employer</TableHead>
                          <TableHead className="text-slate-400">Candidate</TableHead>
                          <TableHead className="text-slate-400">Position</TableHead>
                          <TableHead className="text-slate-400">Requested</TableHead>
                          <TableHead className="text-slate-400">Status</TableHead>
                          <TableHead className="text-slate-400 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {workerRequests.filter(r => r.status === "pending").map((request) => (
                          <TableRow
                            key={request.id}
                            className="border-slate-700/50 hover:bg-slate-700/30"
                            data-testid={`row-request-${request.id}`}
                          >
                            <TableCell>
                              <p className="font-medium text-white" data-testid={`text-request-employer-${request.id}`}>
                                {request.employer_name}
                              </p>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm text-slate-300" data-testid={`text-request-candidate-${request.id}`}>
                                {request.candidate_name}
                              </p>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm text-slate-300">{request.job_title}</p>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(request.requested_at)}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-amber-600/20 text-amber-300 border-amber-500/30">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDetails(request, "request")}
                                  className="text-slate-400 hover:text-cyan-400"
                                  data-testid={`button-view-request-${request.id}`}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApprove("request", request.id, `${request.candidate_name} for ${request.employer_name}`)}
                                  className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
                                  data-testid={`button-approve-request-${request.id}`}
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReject("request", request.id, `${request.candidate_name} for ${request.employer_name}`)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                  data-testid={`button-reject-request-${request.id}`}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12">
                    <UserCheck className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400" data-testid="text-no-pending-requests">
                      No pending worker hire requests
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                icon={Building2}
                label="Total Employers"
                value={analytics?.totalEmployers || 0}
                color="bg-cyan-600"
                testId="card-total-employers"
              />
              <StatCard
                icon={Briefcase}
                label="Total Jobs"
                value={analytics?.totalJobs || 0}
                color="bg-green-600"
                testId="card-total-jobs"
              />
              <StatCard
                icon={Users}
                label="Total Candidates"
                value={analytics?.totalCandidates || 0}
                color="bg-purple-600"
                testId="card-analytics-candidates"
              />
              <StatCard
                icon={TrendingUp}
                label="Total Hires"
                value={analytics?.totalHires || 0}
                color="bg-amber-600"
                testId="card-total-hires"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    Growth Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingAnalytics ? (
                    <Skeleton className="h-[300px] bg-slate-700/50" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={analytics?.employerTrend?.length ? analytics.employerTrend : [
                          { date: "Jan", employers: 12, jobs: 45 },
                          { date: "Feb", employers: 18, jobs: 62 },
                          { date: "Mar", employers: 25, jobs: 78 },
                          { date: "Apr", employers: 32, jobs: 95 },
                          { date: "May", employers: 40, jobs: 120 },
                          { date: "Jun", employers: 48, jobs: 145 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="employers"
                          stroke="#06b6d4"
                          strokeWidth={2}
                          name="Employers"
                        />
                        <Line
                          type="monotone"
                          dataKey="jobs"
                          stroke="#10b981"
                          strokeWidth={2}
                          name="Jobs"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                    Jobs by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingAnalytics ? (
                    <Skeleton className="h-[300px] bg-slate-700/50" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={analytics?.categoryDistribution?.length ? analytics.categoryDistribution : [
                          { name: "Industrial", value: 45 },
                          { name: "Warehouse", value: 38 },
                          { name: "Manufacturing", value: 32 },
                          { name: "Logistics", value: 28 },
                          { name: "Construction", value: 22 },
                          { name: "Other", value: 15 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    Application Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingAnalytics ? (
                    <Skeleton className="h-[300px] bg-slate-700/50" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analytics?.statusDistribution?.length ? analytics.statusDistribution : [
                            { name: "Hired", value: 35 },
                            { name: "Interviewing", value: 25 },
                            { name: "Applied", value: 45 },
                            { name: "Rejected", value: 15 },
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {(analytics?.statusDistribution?.length ? analytics.statusDistribution : [
                            { name: "Hired", value: 35 },
                            { name: "Interviewing", value: 25 },
                            { name: "Applied", value: 45 },
                            { name: "Rejected", value: 15 },
                          ]).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                      <div className="p-2 bg-green-600/20 rounded-full">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white">New employer verified</p>
                        <p className="text-xs text-slate-400">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                      <div className="p-2 bg-cyan-600/20 rounded-full">
                        <Briefcase className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white">5 new jobs posted</p>
                        <p className="text-xs text-slate-400">4 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                      <div className="p-2 bg-purple-600/20 rounded-full">
                        <UserCheck className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white">Worker hire approved</p>
                        <p className="text-xs text-slate-400">6 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                      <div className="p-2 bg-amber-600/20 rounded-full">
                        <Users className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white">12 new candidates registered</p>
                        <p className="text-xs text-slate-400">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              Confirm Approval
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to approve{" "}
              <span className="text-white font-medium">{selectedItem?.name}</span>?
              This action will take effect immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApprove}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-confirm-approve"
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              Reject {selectedItem?.type === "employer" ? "Employer" : selectedItem?.type === "job" ? "Job" : "Request"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Please provide a reason for rejecting{" "}
              <span className="text-white font-medium">{selectedItem?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason" className="text-white">
                Rejection Reason <span className="text-red-400">*</span>
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 min-h-[100px]"
                data-testid="input-rejection-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmReject}
              disabled={!rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-reject"
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-cyan-400" />
              {selectedDetails?.type === "employer" ? "Employer Details" : 
               selectedDetails?.type === "job" ? "Job Details" : "Request Details"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedDetails?.type === "employer" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-400 text-sm">Company Name</Label>
                    <p className="text-white">{selectedDetails.company_name}</p>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-sm">Industry</Label>
                    <p className="text-white">{selectedDetails.industry}</p>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-sm">Company Size</Label>
                    <p className="text-white">{selectedDetails.company_size}</p>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-sm">Website</Label>
                    <p className="text-cyan-400">{selectedDetails.website || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-sm">Contact Name</Label>
                    <p className="text-white">{selectedDetails.contact_name}</p>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-sm">Contact Email</Label>
                    <p className="text-white">{selectedDetails.contact_email}</p>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-sm">Contact Phone</Label>
                    <p className="text-white">{selectedDetails.contact_phone || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-sm">Location</Label>
                    <p className="text-white">{selectedDetails.city}, {selectedDetails.state}</p>
                  </div>
                </div>
                {selectedDetails.description && (
                  <div>
                    <Label className="text-slate-400 text-sm">Description</Label>
                    <p className="text-white mt-1">{selectedDetails.description}</p>
                  </div>
                )}
              </div>
            )}
            {selectedDetails?.type === "job" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-400 text-sm">Job Title</Label>
                    <p className="text-white">{selectedDetails.title}</p>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-sm">Employer</Label>
                    <p className="text-white">{selectedDetails.employer_name}</p>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-sm">Category</Label>
                    <p className="text-white">{selectedDetails.category}</p>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-sm">Job Type</Label>
                    <p className="text-white">{selectedDetails.job_type}</p>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-sm">Pay Range</Label>
                    <p className="text-green-400">
                      {formatPayRange(selectedDetails.pay_range_min, selectedDetails.pay_range_max, selectedDetails.pay_type)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-sm">Location</Label>
                    <p className="text-white">{selectedDetails.city}, {selectedDetails.state}</p>
                  </div>
                </div>
                {selectedDetails.description && (
                  <div>
                    <Label className="text-slate-400 text-sm">Description</Label>
                    <p className="text-white mt-1 whitespace-pre-wrap">{selectedDetails.description}</p>
                  </div>
                )}
                {selectedDetails.requirements && (
                  <div>
                    <Label className="text-slate-400 text-sm">Requirements</Label>
                    <p className="text-white mt-1 whitespace-pre-wrap">{selectedDetails.requirements}</p>
                  </div>
                )}
              </div>
            )}
            {selectedDetails?.type === "request" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-400 text-sm">Employer</Label>
                    <p className="text-white">{selectedDetails.employer_name}</p>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-sm">Candidate</Label>
                    <p className="text-white">{selectedDetails.candidate_name}</p>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-sm">Position</Label>
                    <p className="text-white">{selectedDetails.job_title}</p>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-sm">Requested</Label>
                    <p className="text-white">{formatDate(selectedDetails.requested_at)}</p>
                  </div>
                </div>
                {selectedDetails.message && (
                  <div>
                    <Label className="text-slate-400 text-sm">Message from Employer</Label>
                    <p className="text-white mt-1">{selectedDetails.message}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailsDialogOpen(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setDetailsDialogOpen(false);
                if (selectedDetails) {
                  handleApprove(
                    selectedDetails.type,
                    selectedDetails.id,
                    selectedDetails.type === "employer" ? selectedDetails.company_name :
                    selectedDetails.type === "job" ? selectedDetails.title :
                    `${selectedDetails.candidate_name} for ${selectedDetails.employer_name}`
                  );
                }
              }}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-details-approve"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button
              onClick={() => {
                setDetailsDialogOpen(false);
                if (selectedDetails) {
                  handleReject(
                    selectedDetails.type,
                    selectedDetails.id,
                    selectedDetails.type === "employer" ? selectedDetails.company_name :
                    selectedDetails.type === "job" ? selectedDetails.title :
                    `${selectedDetails.candidate_name} for ${selectedDetails.employer_name}`
                  );
                }
              }}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-details-reject"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
