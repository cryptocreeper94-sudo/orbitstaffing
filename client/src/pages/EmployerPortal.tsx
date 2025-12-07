import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import {
  Briefcase,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  Star,
  ChevronLeft,
  Plus,
  Eye,
  Edit,
  Trash2,
  Settings,
  Building2,
  Crown,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  Award,
  LogOut,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { CarouselRail } from "@/components/ui/carousel-rail";
import { PageHeader, SectionHeader } from "@/components/ui/section-header";
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardContent, OrbitCardFooter, StatCard as OrbitStatCard, ActionCard } from "@/components/ui/orbit-card";

interface Employer {
  id: number;
  company_name: string;
  industry: string;
  company_size: string;
  website: string;
  logo_url: string;
  description: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  contact_title: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip_code: string;
  verification_status: string;
  subscription_tier: number;
  subscription_status: string;
  job_post_credits: number;
  talent_search_credits: number;
  featured_post_credits: number;
  active_job_posts_limit: number;
  talent_searches_per_month: number;
  total_jobs_posted: number;
  total_applications_received: number;
  total_hires: number;
  created_at: string;
}

interface Job {
  id: number;
  title: string;
  description: string;
  category: string;
  city: string;
  state: string;
  pay_range_min: number;
  pay_range_max: number;
  pay_type: string;
  job_type: string;
  status: string;
  application_count: number;
  view_count: number;
  is_featured: boolean;
  created_at: string;
  expires_at: string;
}

interface Application {
  id: number;
  job_post_id: number;
  candidate_id: number;
  status: string;
  cover_letter: string;
  created_at: string;
  full_name: string;
  candidate_email: string;
  candidate_phone: string;
  headline: string;
  skills: string[];
  certifications: string[];
  years_experience: number;
  candidate_resume_url: string;
  candidate_city: string;
  candidate_state: string;
  job_title: string;
}

const SUBSCRIPTION_TIERS: Record<number, { name: string; color: string; icon: string }> = {
  1: { name: "Starter", color: "bg-slate-600", icon: "🌱" },
  2: { name: "Professional", color: "bg-blue-600", icon: "⚡" },
  3: { name: "Enterprise", color: "bg-purple-600", icon: "🚀" },
  4: { name: "Premium", color: "bg-amber-600", icon: "👑" },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
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

function getStatusBadgeColor(status: string): string {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-600/20 text-green-300 border-green-500/30";
    case "pending":
    case "pending_review":
      return "bg-amber-600/20 text-amber-300 border-amber-500/30";
    case "paused":
    case "draft":
      return "bg-slate-600/20 text-slate-300 border-slate-500/30";
    case "closed":
    case "expired":
    case "rejected":
      return "bg-red-600/20 text-red-300 border-red-500/30";
    case "hired":
    case "accepted":
      return "bg-cyan-600/20 text-cyan-300 border-cyan-500/30";
    case "interview":
      return "bg-purple-600/20 text-purple-300 border-purple-500/30";
    default:
      return "bg-slate-600/20 text-slate-300 border-slate-500/30";
  }
}

function JobCard({
  job,
  onEdit,
  onDelete,
  onView,
}: {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (job: Job) => void;
  onView: (job: Job) => void;
}) {
  return (
    <OrbitCard
      data-testid={`card-job-${job.id}`}
    >
      <OrbitCardContent>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {job.is_featured && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
              <h3 className="text-lg font-semibold text-white" data-testid={`text-job-title-${job.id}`}>
                {job.title}
              </h3>
            </div>
            <p className="text-slate-400 text-sm line-clamp-1">{job.category}</p>
          </div>
          <Badge className={getStatusBadgeColor(job.status)} data-testid={`badge-status-${job.id}`}>
            {job.status}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-4">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span>
              {job.city}, {job.state}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-green-400">{formatPayRange(job.pay_range_min, job.pay_range_max, job.pay_type)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>{job.application_count || 0} applicants</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            <span>{job.view_count || 0} views</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
          <span className="text-xs text-slate-500">Posted {formatDate(job.created_at)}</span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(job)}
              className="text-slate-400 hover:text-cyan-400"
              data-testid={`button-view-job-${job.id}`}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(job)}
              className="text-slate-400 hover:text-cyan-400"
              data-testid={`button-edit-job-${job.id}`}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(job)}
              className="text-slate-400 hover:text-red-400"
              data-testid={`button-delete-job-${job.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </OrbitCardContent>
    </OrbitCard>
  );
}

function ApplicationCard({
  application,
  onUpdateStatus,
}: {
  application: Application;
  onUpdateStatus: (appId: number, status: string) => void;
}) {
  const skills = application.skills || [];

  return (
    <OrbitCard
      data-testid={`card-application-${application.id}`}
    >
      <OrbitCardContent>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-white" data-testid={`text-candidate-name-${application.id}`}>
              {application.full_name}
            </h3>
            <p className="text-cyan-400 text-sm">{application.headline || "Candidate"}</p>
          </div>
          <Badge className={getStatusBadgeColor(application.status)} data-testid={`badge-app-status-${application.id}`}>
            {application.status}
          </Badge>
        </div>

        <div className="mb-3">
          <p className="text-xs text-slate-500 mb-1">Applied for:</p>
          <p className="text-sm text-white font-medium">{application.job_title}</p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-3">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span>
              {application.candidate_city}, {application.candidate_state}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            <span>{application.years_experience || 0} years exp.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(application.created_at)}</span>
          </div>
        </div>

        {skills.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-2">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {skills.slice(0, 5).map((skill, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-xs bg-slate-700/50 text-slate-300 border-slate-600"
                  data-testid={`badge-skill-${application.id}-${idx}`}
                >
                  {skill}
                </Badge>
              ))}
              {skills.length > 5 && (
                <Badge variant="outline" className="text-xs bg-slate-700/50 text-slate-400 border-slate-600">
                  +{skills.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 text-sm text-slate-400 mb-4">
          <a href={`mailto:${application.candidate_email}`} className="flex items-center gap-1 hover:text-cyan-400">
            <Mail className="w-4 h-4" />
            <span className="truncate max-w-[150px]">{application.candidate_email}</span>
          </a>
          {application.candidate_phone && (
            <a href={`tel:${application.candidate_phone}`} className="flex items-center gap-1 hover:text-cyan-400">
              <Phone className="w-4 h-4" />
              <span>{application.candidate_phone}</span>
            </a>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-700/50">
          {application.status === "pending" && (
            <>
              <Button
                size="sm"
                onClick={() => onUpdateStatus(application.id, "interview")}
                className="bg-purple-600 hover:bg-purple-500 text-white"
                data-testid={`button-interview-${application.id}`}
              >
                Schedule Interview
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateStatus(application.id, "rejected")}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                data-testid={`button-reject-${application.id}`}
              >
                Reject
              </Button>
            </>
          )}
          {application.status === "interview" && (
            <>
              <Button
                size="sm"
                onClick={() => onUpdateStatus(application.id, "hired")}
                className="bg-cyan-600 hover:bg-cyan-500 text-white"
                data-testid={`button-hire-${application.id}`}
              >
                Hire Candidate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateStatus(application.id, "rejected")}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                data-testid={`button-reject-${application.id}`}
              >
                Reject
              </Button>
            </>
          )}
          {application.candidate_resume_url && (
            <Button
              size="sm"
              variant="ghost"
              asChild
              className="text-cyan-400 hover:bg-cyan-500/10"
              data-testid={`button-resume-${application.id}`}
            >
              <a href={application.candidate_resume_url} target="_blank" rel="noopener noreferrer">
                <FileText className="w-4 h-4 mr-1" />
                View Resume
              </a>
            </Button>
          )}
        </div>
      </OrbitCardContent>
    </OrbitCard>
  );
}

function SubscriptionCard({ tier, status }: { tier: number; status: string }) {
  const tierInfo = SUBSCRIPTION_TIERS[tier] || SUBSCRIPTION_TIERS[1];

  return (
    <BentoTile data-testid="card-subscription">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{tierInfo.icon}</span>
            <div>
              <h3 className="font-semibold text-white">{tierInfo.name} Plan</h3>
              <p className="text-sm text-slate-400">Your current subscription</p>
            </div>
          </div>
          <Badge className={status === "active" ? "bg-green-600/20 text-green-300" : "bg-amber-600/20 text-amber-300"}>
            {status}
          </Badge>
        </div>
        <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10" data-testid="button-upgrade-plan">
          <Crown className="w-4 h-4 mr-2" />
          Upgrade Plan
        </Button>
      </div>
    </BentoTile>
  );
}

function AccountSettingsCard({
  employer,
  onSave,
}: {
  employer: Employer;
  onSave: (updates: Partial<Employer>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    contact_name: employer.contact_name || "",
    contact_phone: employer.contact_phone || "",
    website: employer.website || "",
    description: employer.description || "",
  });

  const handleSave = () => {
    onSave(formData);
    setEditing(false);
  };

  return (
    <OrbitCard data-testid="card-account-settings">
      <OrbitCardHeader
        icon={<Settings className="w-5 h-5 text-cyan-400" />}
        action={
          !editing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(true)}
              className="text-cyan-400 hover:bg-cyan-500/10"
              data-testid="button-edit-settings"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )
        }
      >
        <OrbitCardTitle>Account Settings</OrbitCardTitle>
      </OrbitCardHeader>
      <OrbitCardContent className="space-y-4">
        {editing ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Name</Label>
                <Input
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="bg-slate-900/50 border-slate-600"
                  data-testid="input-contact-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="bg-slate-900/50 border-slate-600"
                  data-testid="input-contact-phone"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Website</Label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="bg-slate-900/50 border-slate-600"
                  data-testid="input-website"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Company Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-slate-900/50 border-slate-600 min-h-[100px]"
                  data-testid="input-description"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-500" data-testid="button-save-settings">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)} data-testid="button-cancel-settings">
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Company</p>
              <p className="text-white font-medium">{employer.company_name}</p>
            </div>
            <div>
              <p className="text-slate-500">Contact</p>
              <p className="text-white">{employer.contact_name || "—"}</p>
            </div>
            <div>
              <p className="text-slate-500">Email</p>
              <p className="text-cyan-400">{employer.contact_email}</p>
            </div>
            <div>
              <p className="text-slate-500">Phone</p>
              <p className="text-white">{employer.contact_phone || "—"}</p>
            </div>
            <div>
              <p className="text-slate-500">Location</p>
              <p className="text-white">
                {employer.city && employer.state ? `${employer.city}, ${employer.state}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Industry</p>
              <p className="text-white">{employer.industry || "—"}</p>
            </div>
          </div>
        )}
      </OrbitCardContent>
    </OrbitCard>
  );
}

export default function EmployerPortal() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [applicationFilter, setApplicationFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);

  const employer = JSON.parse(localStorage.getItem("talentExchangeEmployer") || "null");
  const employerId = employer?.id;

  useEffect(() => {
    if (!employerId) {
      setLocation("/jobs");
    }
  }, [employerId, setLocation]);

  const {
    data: employerProfile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useQuery<Employer>({
    queryKey: ["/api/talent-exchange/employers", employerId],
    queryFn: async () => {
      const res = await fetch(`/api/talent-exchange/employers/${employerId}`);
      if (!res.ok) throw new Error("Failed to fetch employer profile");
      return res.json();
    },
    enabled: !!employerId,
  });

  const {
    data: jobs,
    isLoading: jobsLoading,
    refetch: refetchJobs,
  } = useQuery<Job[]>({
    queryKey: ["/api/talent-exchange/employers", employerId, "jobs"],
    queryFn: async () => {
      const res = await fetch(`/api/talent-exchange/employers/${employerId}/jobs`);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return res.json();
    },
    enabled: !!employerId,
  });

  const {
    data: applications,
    isLoading: applicationsLoading,
    refetch: refetchApplications,
  } = useQuery<Application[]>({
    queryKey: ["/api/talent-exchange/employers", employerId, "applications"],
    queryFn: async () => {
      const res = await fetch(`/api/talent-exchange/employers/${employerId}/applications`);
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    },
    enabled: !!employerId,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<Employer>) => {
      const res = await fetch(`/api/talent-exchange/employers/${employerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      refetchProfile();
    },
  });

  const updateApplicationMutation = useMutation({
    mutationFn: async ({ appId, status }: { appId: number; status: string }) => {
      const res = await fetch(`/api/talent-exchange/applications/${appId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update application");
      return res.json();
    },
    onSuccess: () => {
      refetchApplications();
      refetchProfile();
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const res = await fetch(`/api/talent-exchange/jobs/${jobId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete job");
      return res.json();
    },
    onSuccess: () => {
      refetchJobs();
      setJobToDelete(null);
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("talentExchangeEmployer");
    setLocation("/jobs");
  };

  const handleSubscribe = async (planSlug: string) => {
    if (!employer) return;
    
    try {
      const endpoint = planSlug === 'pay-per-post' 
        ? '/api/talent-exchange/billing/pay-per-post'
        : '/api/talent-exchange/billing/checkout';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          employerId: employer.id, 
          planSlug,
          billingCycle: 'monthly'
        }),
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  const handleUpdateStatus = (appId: number, status: string) => {
    updateApplicationMutation.mutate({ appId, status });
  };

  const handleDeleteJob = () => {
    if (jobToDelete) {
      deleteJobMutation.mutate(jobToDelete.id);
    }
  };

  const handleUpdateProfile = (updates: Partial<Employer>) => {
    updateProfileMutation.mutate(updates);
  };

  const filteredJobs =
    jobs?.filter((job) => {
      if (jobFilter !== "all" && job.status !== jobFilter) return false;
      if (searchQuery && !job.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    }) || [];

  const filteredApplications =
    applications?.filter((app) => {
      if (applicationFilter !== "all" && app.status !== applicationFilter) return false;
      if (searchQuery && !app.full_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    }) || [];

  const activeJobs = jobs?.filter((j) => j.status === "active").length || 0;
  const pendingApplications = applications?.filter((a) => a.status === "pending").length || 0;
  const totalApplications = applications?.length || 0;
  const totalHires = applications?.filter((a) => a.status === "hired").length || 0;

  if (!employerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <OrbitCard className="p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Not Logged In</h2>
          <p className="text-slate-400 mb-4">Please log in to access the employer portal.</p>
          <Button onClick={() => setLocation("/jobs")} className="bg-cyan-600 hover:bg-cyan-500">
            Go to Job Board
          </Button>
        </OrbitCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader
          title={employerProfile?.company_name || "Employer Portal"}
          subtitle="Manage your jobs and applications"
          breadcrumb={
            <Link href="/jobs">
              <span className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1 transition-colors cursor-pointer">
                <ChevronLeft className="w-4 h-4" /> Back to Job Board
              </span>
            </Link>
          }
          actions={
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setShowJobModal(true)}
                className="bg-cyan-600 hover:bg-cyan-500"
                data-testid="button-post-job"
              >
                <Plus className="w-4 h-4 mr-2" />
                Post New Job
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/jobs")}
                className="border-slate-600 text-slate-300 hover:border-cyan-500"
                data-testid="button-talent-pool"
              >
                <Users className="w-4 h-4 mr-2" />
                View Talent Pool
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          }
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            <TabsList className="bg-slate-800/50 border border-slate-700/50 p-1 inline-flex w-auto min-w-full sm:w-full">
              <TabsTrigger
                value="dashboard"
                className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                data-testid="tab-dashboard"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="jobs"
                className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                data-testid="tab-jobs"
              >
                Jobs ({jobs?.length || 0})
              </TabsTrigger>
              <TabsTrigger
                value="applications"
                className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                data-testid="tab-applications"
              >
                Apps ({pendingApplications})
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                data-testid="tab-settings"
              >
                Settings
              </TabsTrigger>
              <TabsTrigger
                value="billing"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                data-testid="tab-billing"
              >
                <Crown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Plans & </span>Billing
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-6">
            <BentoGrid cols={4} gap="md">
              <OrbitStatCard
                label="Active Jobs"
                value={activeJobs}
                icon={<Briefcase className="w-6 h-6" />}
                className="data-testid-stat-active-jobs"
              />
              <OrbitStatCard
                label="Total Applications"
                value={totalApplications}
                icon={<Users className="w-6 h-6" />}
              />
              <OrbitStatCard
                label="Pending Reviews"
                value={pendingApplications}
                icon={<Clock className="w-6 h-6" />}
              />
              <OrbitStatCard
                label="Total Hires"
                value={totalHires}
                icon={<CheckCircle2 className="w-6 h-6" />}
              />
            </BentoGrid>

            <BentoGrid cols={3} gap="md">
              <BentoTile span={2}>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-cyan-400" />
                      Recent Applications
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab("applications")}
                      className="text-cyan-400"
                      data-testid="button-view-all-applications"
                    >
                      View All
                    </Button>
                  </div>
                  {applicationsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : applications && applications.length > 0 ? (
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3">
                        {applications.slice(0, 5).map((app) => (
                          <div
                            key={app.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700/50"
                            data-testid={`item-application-${app.id}`}
                          >
                            <div>
                              <p className="text-white font-medium">{app.full_name}</p>
                              <p className="text-slate-400 text-sm">{app.job_title}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={getStatusBadgeColor(app.status)}>{app.status}</Badge>
                              <span className="text-xs text-slate-500">{formatDate(app.created_at)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No applications yet</p>
                    </div>
                  )}
                </div>
              </BentoTile>

              <div className="space-y-4">
                <SubscriptionCard
                  tier={employerProfile?.subscription_tier || 1}
                  status={employerProfile?.subscription_status || "active"}
                />

                <BentoTile>
                  <div className="p-5">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                      <Briefcase className="w-4 h-4 text-cyan-400" />
                      Credits & Limits
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Job Post Credits</span>
                        <span className="text-white font-medium" data-testid="text-job-credits">
                          {employerProfile?.job_post_credits || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Talent Searches</span>
                        <span className="text-white font-medium" data-testid="text-search-credits">
                          {employerProfile?.talent_search_credits || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Featured Posts</span>
                        <span className="text-white font-medium" data-testid="text-featured-credits">
                          {employerProfile?.featured_post_credits || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Active Jobs Limit</span>
                        <span className="text-white font-medium">
                          {activeJobs} / {employerProfile?.active_job_posts_limit || 5}
                        </span>
                      </div>
                    </div>
                  </div>
                </BentoTile>
              </div>
            </BentoGrid>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-900/50 border-slate-600 w-64"
                    data-testid="input-search-jobs"
                  />
                </div>
                <Select value={jobFilter} onValueChange={setJobFilter}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 w-40" data-testid="select-job-filter">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">All Jobs</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => refetchJobs()}
                variant="ghost"
                size="sm"
                className="text-slate-400"
                data-testid="button-refresh-jobs"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            {jobsLoading ? (
              <BentoGrid cols={2} gap="md">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </BentoGrid>
            ) : filteredJobs.length > 0 ? (
              <BentoGrid cols={2} gap="md">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onView={(j) => setSelectedJob(j)}
                    onEdit={(j) => setSelectedJob(j)}
                    onDelete={(j) => setJobToDelete(j)}
                  />
                ))}
              </BentoGrid>
            ) : (
              <OrbitCard className="py-16 text-center">
                <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Jobs Found</h3>
                <p className="text-slate-400 mb-6">
                  {searchQuery || jobFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Post your first job to start receiving applications"}
                </p>
                <Button onClick={() => setShowJobModal(true)} className="bg-cyan-600 hover:bg-cyan-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Post a Job
                </Button>
              </OrbitCard>
            )}
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search applicants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-900/50 border-slate-600 w-64"
                    data-testid="input-search-applications"
                  />
                </div>
                <Select value={applicationFilter} onValueChange={setApplicationFilter}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 w-40" data-testid="select-application-filter">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">All Applications</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => refetchApplications()}
                variant="ghost"
                size="sm"
                className="text-slate-400"
                data-testid="button-refresh-applications"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            {applicationsLoading ? (
              <BentoGrid cols={2} gap="md">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </BentoGrid>
            ) : filteredApplications.length > 0 ? (
              <BentoGrid cols={2} gap="md">
                {filteredApplications.map((app) => (
                  <ApplicationCard key={app.id} application={app} onUpdateStatus={handleUpdateStatus} />
                ))}
              </BentoGrid>
            ) : (
              <OrbitCard className="py-16 text-center">
                <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Applications Found</h3>
                <p className="text-slate-400">
                  {searchQuery || applicationFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Applications will appear here when candidates apply to your jobs"}
                </p>
              </OrbitCard>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {profileLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              employerProfile && (
                <>
                  <SubscriptionCard
                    tier={employerProfile.subscription_tier}
                    status={employerProfile.subscription_status}
                  />
                  <AccountSettingsCard employer={employerProfile} onSave={handleUpdateProfile} />
                </>
              )
            )}
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <SectionHeader
              title="Choose Your Plan"
              subtitle="ORBIT beats Indeed & ZipRecruiter pricing with better candidates"
              align="center"
              size="md"
            />

            <BentoGrid cols={4} gap="md">
              <BentoTile data-testid="plan-payperpost">
                <div className="p-5 h-full flex flex-col">
                  <div className="text-center mb-4">
                    <Badge className="bg-slate-600/50 text-slate-300 mb-2">One-Time</Badge>
                    <h3 className="text-lg font-semibold text-white">Pay Per Post</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-white">$19</span>
                      <span className="text-slate-400">/job</span>
                    </div>
                    <p className="text-xs text-green-400 mt-1">vs Indeed's $15/day ($450/mo)</p>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300 mb-4 flex-1">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> Single job post (30 days)</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> 5 candidate contacts</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> GPS-verified candidates</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> Background check access</li>
                  </ul>
                  <Button 
                    className="w-full bg-slate-600 hover:bg-slate-500"
                    onClick={() => handleSubscribe('pay-per-post')}
                    data-testid="button-buy-post"
                  >
                    Buy Single Post
                  </Button>
                </div>
              </BentoTile>

              <BentoTile data-testid="plan-starter">
                <div className="p-5 h-full flex flex-col">
                  <div className="text-center mb-4">
                    <Badge className="bg-cyan-600/50 text-cyan-300 mb-2">Starter</Badge>
                    <h3 className="text-lg font-semibold text-white">Small Business</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-white">$39</span>
                      <span className="text-slate-400">/mo</span>
                    </div>
                    <p className="text-xs text-green-400 mt-1">68% less than Indeed</p>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300 mb-4 flex-1">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> 2 active job posts</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> 20 candidate contacts/mo</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> 30 talent searches</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> Performance scores visible</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> Email support</li>
                  </ul>
                  <Button 
                    className="w-full bg-cyan-600 hover:bg-cyan-500"
                    onClick={() => handleSubscribe('starter')}
                    data-testid="button-subscribe-starter"
                  >
                    Get Starter
                  </Button>
                </div>
              </BentoTile>

              <BentoTile className="border-2 border-emerald-500/50 relative" data-testid="plan-growth">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-emerald-500 text-white px-3">MOST POPULAR</Badge>
                </div>
                <div className="p-5 pt-6 h-full flex flex-col">
                  <div className="text-center mb-4">
                    <Badge className="bg-emerald-600/50 text-emerald-300 mb-2">Growth</Badge>
                    <h3 className="text-lg font-semibold text-white">Growing Teams</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-white">$99</span>
                      <span className="text-slate-400">/mo</span>
                    </div>
                    <p className="text-xs text-green-400 mt-1">67% less than ZipRecruiter</p>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300 mb-4 flex-1">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 8 active job posts</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100 candidate contacts/mo</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited talent search</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 2 featured listings/mo</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Interview scheduling</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Analytics dashboard</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Priority support</li>
                  </ul>
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-500"
                    onClick={() => handleSubscribe('growth')}
                    data-testid="button-subscribe-growth"
                  >
                    Get Growth
                  </Button>
                </div>
              </BentoTile>

              <BentoTile data-testid="plan-enterprise">
                <div className="p-5 h-full flex flex-col">
                  <div className="text-center mb-4">
                    <Badge className="bg-purple-600/50 text-purple-300 mb-2">Enterprise</Badge>
                    <h3 className="text-lg font-semibold text-white">High Volume</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-white">$249</span>
                      <span className="text-slate-400">/mo</span>
                    </div>
                    <p className="text-xs text-green-400 mt-1">Enterprise features at startup price</p>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300 mb-4 flex-1">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Unlimited job posts</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Unlimited contacts</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> 10 featured listings/mo</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> API/ATS integration</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Dedicated manager</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Co-branded hiring page</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Custom reporting</li>
                  </ul>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-500"
                    onClick={() => handleSubscribe('enterprise')}
                    data-testid="button-subscribe-enterprise"
                  >
                    Get Enterprise
                  </Button>
                </div>
              </BentoTile>
            </BentoGrid>

            <BentoTile className="border-cyan-500/30">
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-4 text-center">Why ORBIT Beats the Competition</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl mb-2">🎯</div>
                    <div className="text-cyan-400 font-semibold">Pre-Vetted Workers</div>
                    <div className="text-sm text-slate-400">Background checks included</div>
                  </div>
                  <div>
                    <div className="text-2xl mb-2">📍</div>
                    <div className="text-cyan-400 font-semibold">GPS Verified</div>
                    <div className="text-sm text-slate-400">Confirmed work history</div>
                  </div>
                  <div>
                    <div className="text-2xl mb-2">⭐</div>
                    <div className="text-cyan-400 font-semibold">Performance Scores</div>
                    <div className="text-sm text-slate-400">Real employer ratings</div>
                  </div>
                  <div>
                    <div className="text-2xl mb-2">💰</div>
                    <div className="text-cyan-400 font-semibold">68% Lower Cost</div>
                    <div className="text-sm text-slate-400">Better value guaranteed</div>
                  </div>
                </div>
              </div>
            </BentoTile>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={!!jobToDelete} onOpenChange={() => setJobToDelete(null)}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Job Posting?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete &quot;{jobToDelete?.title}&quot; and all associated applications. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteJob}
              className="bg-red-600 hover:bg-red-500"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showJobModal} onOpenChange={setShowJobModal}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Post New Job</DialogTitle>
            <DialogDescription className="text-slate-400">
              Create a new job posting to attract qualified candidates.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center text-slate-400">
            <Briefcase className="w-12 h-12 mx-auto mb-3 text-cyan-400" />
            <p>Job posting form coming soon.</p>
            <p className="text-sm mt-2">
              For now, please contact support to post jobs or use the admin panel.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJobModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
