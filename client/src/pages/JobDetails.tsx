import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Star,
  ChevronLeft,
  Building2,
  Calendar,
  Briefcase,
  Award,
  Heart,
  Share2,
  CheckCircle2,
  Users,
  Globe,
  GraduationCap,
  FileText,
  Send,
  Upload,
  X,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ScreeningQuestion {
  question: string;
  type: "text" | "yes_no" | "multiple_choice";
  required: boolean;
  options?: string[];
}

interface JobDetail {
  id: string;
  employer_id: string;
  title: string;
  slug: string;
  description: string;
  requirements: string | null;
  responsibilities: string | null;
  benefits: string | null;
  category: string;
  subcategory: string | null;
  job_type: string;
  experience_level: string | null;
  required_skills: string[] | null;
  preferred_skills: string[] | null;
  certifications: string[] | null;
  work_location: string;
  address_line1: string | null;
  city: string;
  state: string;
  zip_code: string | null;
  compensation_type: string;
  pay_range_min: string | null;
  pay_range_max: string | null;
  show_pay_range: boolean;
  schedule_type: string | null;
  hours_per_week: number | null;
  start_date: string | null;
  end_date: string | null;
  is_urgent: boolean;
  positions_available: number;
  positions_filled: number;
  screening_questions: ScreeningQuestion[] | null;
  status: string;
  is_featured: boolean;
  view_count: number;
  application_count: number;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  company_name: string;
  logo_url: string | null;
  employer_industry: string | null;
  company_size: string | null;
  website: string | null;
  company_description: string | null;
}

interface SimilarJob {
  id: string;
  title: string;
  company_name: string;
  city: string;
  state: string;
  pay_range_min: string | null;
  pay_range_max: string | null;
  compensation_type: string;
  job_type: string;
  created_at: string;
}

function formatPayRange(min: string | null, max: string | null, payType: string): string {
  if (!min && !max) return "Competitive";
  const formatNum = (n: string) => {
    const num = parseFloat(n);
    return num >= 1000 ? `$${(num / 1000).toFixed(0)}k` : `$${num}`;
  };
  const suffix = payType === "hourly" ? "/hr" : payType === "salary" ? "/yr" : "";
  if (min && max) return `${formatNum(min)} - ${formatNum(max)}${suffix}`;
  if (min) return `From ${formatNum(min)}${suffix}`;
  if (max) return `Up to ${formatNum(max)}${suffix}`;
  return "Competitive";
}

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

function getJobTypeBadgeColor(jobType: string): string {
  switch (jobType?.toLowerCase()) {
    case "full_time":
    case "full-time": return "bg-cyan-600/20 text-cyan-300 border-cyan-500/30";
    case "part_time":
    case "part-time": return "bg-blue-600/20 text-blue-300 border-blue-500/30";
    case "contract": return "bg-purple-600/20 text-purple-300 border-purple-500/30";
    case "temporary": return "bg-amber-600/20 text-amber-300 border-amber-500/30";
    case "per_diem":
    case "seasonal": return "bg-green-600/20 text-green-300 border-green-500/30";
    default: return "bg-slate-600/20 text-slate-300 border-slate-500/30";
  }
}

function formatJobType(jobType: string): string {
  return jobType?.replace(/_/g, '-').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A';
}

function formatWorkLocation(location: string): string {
  switch (location?.toLowerCase()) {
    case "on_site": return "On-site";
    case "remote": return "Remote";
    case "hybrid": return "Hybrid";
    default: return location || "On-site";
  }
}

function JobDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Skeleton className="h-6 w-32 mb-6" />
        <Card className="bg-slate-800/50 border-slate-700/50 mb-6">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <div className="flex gap-4">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

function SimilarJobCard({ job }: { job: SimilarJob }) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <Card 
        className="bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/40 transition-all duration-300 cursor-pointer"
        data-testid={`card-similar-job-${job.id}`}
      >
        <CardContent className="p-4">
          <h4 className="text-white font-semibold mb-1 hover:text-cyan-400 transition-colors" data-testid={`text-similar-job-title-${job.id}`}>
            {job.title}
          </h4>
          <p className="text-slate-400 text-sm mb-2" data-testid={`text-similar-company-${job.id}`}>{job.company_name}</p>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {job.city}, {job.state}
            </span>
            <span className="text-green-400 font-medium">
              {formatPayRange(job.pay_range_min, job.pay_range_max, job.compensation_type)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function JobDetails() {
  const params = useParams<{ jobId: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const jobId = params.jobId;

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [screeningAnswers, setScreeningAnswers] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);

  const candidateId = typeof window !== 'undefined' ? localStorage.getItem('candidateId') : null;

  const { data: job, isLoading, error } = useQuery<JobDetail>({
    queryKey: ["/api/talent-exchange/public/jobs", jobId],
    queryFn: async () => {
      const res = await fetch(`/api/talent-exchange/public/jobs/${jobId}`);
      if (!res.ok) throw new Error("Failed to fetch job details");
      return res.json();
    },
    enabled: !!jobId,
  });

  const { data: similarJobsData } = useQuery<{ jobs: SimilarJob[] }>({
    queryKey: ["/api/talent-exchange/public/jobs", "similar", job?.category],
    queryFn: async () => {
      const res = await fetch(`/api/talent-exchange/public/jobs?category=${encodeURIComponent(job?.category || '')}&limit=4`);
      if (!res.ok) throw new Error("Failed to fetch similar jobs");
      return res.json();
    },
    enabled: !!job?.category,
  });

  const similarJobs = (similarJobsData?.jobs || []).filter(j => j.id !== jobId).slice(0, 3);

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!candidateId) {
        throw new Error("Please log in to apply");
      }
      const res = await fetch("/api/talent-exchange/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobPostId: jobId,
          candidateId,
          coverLetter,
          resumeUrl: resumeUrl || null,
          screeningAnswers,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit application");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted!",
        description: "Your application has been sent to the employer.",
      });
      setShowApplyModal(false);
      setCoverLetter("");
      setResumeUrl("");
      setScreeningAnswers({});
      queryClient.invalidateQueries({ queryKey: ["/api/talent-exchange/public/jobs", jobId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Application Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApply = () => {
    if (!candidateId) {
      toast({
        title: "Login Required",
        description: "Please create an account or log in to apply for jobs.",
        variant: "destructive",
      });
      return;
    }
    setShowApplyModal(true);
  };

  const handleSubmitApplication = () => {
    if (job?.screening_questions) {
      const requiredQuestions = job.screening_questions.filter(q => q.required);
      for (const q of requiredQuestions) {
        if (!screeningAnswers[q.question]) {
          toast({
            title: "Required Field",
            description: `Please answer: "${q.question}"`,
            variant: "destructive",
          });
          return;
        }
      }
    }
    applyMutation.mutate();
  };

  const handleSaveJob = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Job Removed" : "Job Saved",
      description: isSaved ? "Job removed from saved list" : "Job added to your saved list",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job?.title || "Job Opportunity",
          text: `Check out this job: ${job?.title} at ${job?.company_name}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Job link copied to clipboard",
      });
    }
  };

  if (isLoading) return <JobDetailSkeleton />;

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="bg-slate-800/50 border-slate-700/50 max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2" data-testid="text-error-title">Job Not Found</h2>
            <p className="text-slate-400 mb-6" data-testid="text-error-message">
              This job posting may have been removed or is no longer available.
            </p>
            <Link href="/jobs">
              <Button className="bg-cyan-600 hover:bg-cyan-500" data-testid="button-back-to-jobs">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Job Board
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const screeningQuestions = job.screening_questions || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <Link href="/jobs" className="inline-block mb-6">
            <span className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1 transition-colors" data-testid="link-back-to-jobs">
              <ChevronLeft className="w-4 h-4" /> Back to Jobs
            </span>
          </Link>

          <Card className="bg-slate-800/70 backdrop-blur-sm border-slate-700/50 mb-6" data-testid="card-job-header">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                <div className="flex gap-4 flex-1">
                  {job.logo_url ? (
                    <img 
                      src={job.logo_url} 
                      alt={job.company_name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover bg-slate-700 flex-shrink-0"
                      data-testid="img-company-logo"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-8 h-8 text-slate-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 flex-wrap mb-2">
                      <h1 className="text-2xl sm:text-3xl font-bold text-white" data-testid="text-job-title">
                        {job.title}
                      </h1>
                      {job.is_featured && (
                        <Badge className="bg-cyan-600/20 text-cyan-300 border-cyan-500/30 flex-shrink-0">
                          <Star className="w-3 h-3 mr-1 fill-current" /> Featured
                        </Badge>
                      )}
                      {job.is_urgent && (
                        <Badge className="bg-red-600/20 text-red-300 border-red-500/30 flex-shrink-0">
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-slate-300 mb-3">
                      <Building2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span className="font-medium" data-testid="text-company-name">{job.company_name}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <span data-testid="text-location">{job.city}, {job.state}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <span data-testid="text-work-location">{formatWorkLocation(job.work_location)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <span data-testid="text-posted-date">{formatDate(job.published_at || job.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 lg:items-end">
                  <Badge 
                    className={`${getJobTypeBadgeColor(job.job_type)} text-sm px-3 py-1 w-fit`}
                    data-testid="badge-job-type"
                  >
                    {formatJobType(job.job_type)}
                  </Badge>
                  
                  {job.show_pay_range && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-400" />
                      <span className="text-xl sm:text-2xl font-bold text-green-400" data-testid="text-pay-range">
                        {formatPayRange(job.pay_range_min, job.pay_range_max, job.compensation_type)}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-3 flex-wrap">
                    <Button 
                      onClick={handleApply}
                      className="bg-cyan-600 hover:bg-cyan-500 font-semibold"
                      data-testid="button-apply-now"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Apply Now
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleSaveJob}
                      className={`border-slate-600 ${isSaved ? 'text-red-400 border-red-500/50' : 'text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50'}`}
                      data-testid="button-save-job"
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                      {isSaved ? 'Saved' : 'Save'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleShare}
                      className="border-slate-600 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50"
                      data-testid="button-share-job"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <div className="flex flex-wrap gap-4 sm:gap-8 text-sm">
                  {job.positions_available > 1 && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Users className="w-4 h-4 text-cyan-400" />
                      <span data-testid="text-positions">{job.positions_available - job.positions_filled} of {job.positions_available} positions open</span>
                    </div>
                  )}
                  {job.hours_per_week && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span data-testid="text-hours">{job.hours_per_week} hours/week</span>
                    </div>
                  )}
                  {job.experience_level && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <GraduationCap className="w-4 h-4 text-cyan-400" />
                      <span className="capitalize" data-testid="text-experience">{job.experience_level} Level</span>
                    </div>
                  )}
                  {job.schedule_type && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Briefcase className="w-4 h-4 text-cyan-400" />
                      <span className="capitalize" data-testid="text-schedule">{job.schedule_type.replace(/_/g, ' ')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-400">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span data-testid="text-applications">{job.application_count} applications</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Tabs defaultValue="description" className="w-full" data-testid="tabs-job-details">
                <TabsList className="bg-slate-800/50 border border-slate-700/50 w-full justify-start gap-1 p-1 mb-6">
                  <TabsTrigger 
                    value="description" 
                    className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
                    data-testid="tab-description"
                  >
                    Description
                  </TabsTrigger>
                  <TabsTrigger 
                    value="requirements"
                    className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
                    data-testid="tab-requirements"
                  >
                    Requirements
                  </TabsTrigger>
                  <TabsTrigger 
                    value="benefits"
                    className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
                    data-testid="tab-benefits"
                  >
                    Benefits
                  </TabsTrigger>
                  <TabsTrigger 
                    value="company"
                    className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
                    data-testid="tab-company"
                  >
                    Company
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="description" data-testid="content-description">
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-cyan-400" />
                        Job Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-invert prose-sm max-w-none">
                        <p className="text-slate-300 whitespace-pre-wrap leading-relaxed" data-testid="text-description">
                          {job.description}
                        </p>
                        {job.responsibilities && (
                          <>
                            <h4 className="text-white font-semibold mt-6 mb-3">Responsibilities</h4>
                            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed" data-testid="text-responsibilities">
                              {job.responsibilities}
                            </p>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="requirements" data-testid="content-requirements">
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                        Requirements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {job.requirements && (
                        <div>
                          <p className="text-slate-300 whitespace-pre-wrap leading-relaxed" data-testid="text-requirements">
                            {job.requirements}
                          </p>
                        </div>
                      )}
                      
                      {job.required_skills && job.required_skills.length > 0 && (
                        <div>
                          <h4 className="text-white font-semibold mb-3">Required Skills</h4>
                          <div className="flex flex-wrap gap-2" data-testid="list-required-skills">
                            {job.required_skills.map((skill, idx) => (
                              <Badge 
                                key={idx} 
                                className="bg-cyan-600/20 text-cyan-300 border-cyan-500/30"
                                data-testid={`badge-skill-${idx}`}
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {job.preferred_skills && job.preferred_skills.length > 0 && (
                        <div>
                          <h4 className="text-white font-semibold mb-3">Preferred Skills</h4>
                          <div className="flex flex-wrap gap-2" data-testid="list-preferred-skills">
                            {job.preferred_skills.map((skill, idx) => (
                              <Badge 
                                key={idx} 
                                variant="outline"
                                className="text-slate-300 border-slate-600"
                                data-testid={`badge-preferred-skill-${idx}`}
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {job.certifications && job.certifications.length > 0 && (
                        <div>
                          <h4 className="text-white font-semibold mb-3">Required Certifications</h4>
                          <div className="flex flex-wrap gap-2" data-testid="list-certifications">
                            {job.certifications.map((cert, idx) => (
                              <Badge 
                                key={idx}
                                className="bg-amber-600/20 text-amber-300 border-amber-500/30"
                                data-testid={`badge-cert-${idx}`}
                              >
                                <Award className="w-3 h-3 mr-1" />
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {job.experience_level && (
                        <div>
                          <h4 className="text-white font-semibold mb-3">Experience Level</h4>
                          <p className="text-slate-300 capitalize" data-testid="text-experience-level">
                            {job.experience_level} level experience required
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="benefits" data-testid="content-benefits">
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Star className="w-5 h-5 text-cyan-400" />
                        Benefits & Perks
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {job.benefits ? (
                        <p className="text-slate-300 whitespace-pre-wrap leading-relaxed" data-testid="text-benefits">
                          {job.benefits}
                        </p>
                      ) : (
                        <p className="text-slate-500 italic" data-testid="text-no-benefits">
                          Contact the employer for information about benefits.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="company" data-testid="content-company">
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-cyan-400" />
                        About {job.company_name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        {job.logo_url ? (
                          <img 
                            src={job.logo_url} 
                            alt={job.company_name}
                            className="w-16 h-16 rounded-lg object-cover bg-slate-700"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-slate-700 flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-slate-500" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-white font-semibold text-lg" data-testid="text-company-name-info">{job.company_name}</h3>
                          {job.employer_industry && (
                            <p className="text-slate-400 text-sm" data-testid="text-industry">{job.employer_industry}</p>
                          )}
                        </div>
                      </div>

                      {job.company_description && (
                        <p className="text-slate-300 leading-relaxed" data-testid="text-company-description">
                          {job.company_description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-700/50">
                        {job.company_size && (
                          <div className="flex items-center gap-2 text-slate-400">
                            <Users className="w-4 h-4 text-cyan-400" />
                            <span data-testid="text-company-size">{job.company_size} employees</span>
                          </div>
                        )}
                        {job.website && (
                          <a 
                            href={job.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                            data-testid="link-company-website"
                          >
                            <Globe className="w-4 h-4" />
                            Visit Website
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700/50 sticky top-6">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Apply for this job</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-400 text-sm">
                    Ready to take the next step in your career? Submit your application today.
                  </p>
                  <Button 
                    onClick={handleApply}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 font-semibold"
                    data-testid="button-apply-sidebar"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Apply Now
                  </Button>
                  {!candidateId && (
                    <p className="text-xs text-slate-500 text-center">
                      Don't have an account?{" "}
                      <Link href="/jobs" className="text-cyan-400 hover:text-cyan-300">
                        Create one
                      </Link>
                    </p>
                  )}
                </CardContent>
              </Card>

              {similarJobs.length > 0 && (
                <Card className="bg-slate-800/50 border-slate-700/50" data-testid="card-similar-jobs">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Similar Jobs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {similarJobs.map((sj) => (
                      <SimilarJobCard key={sj.id} job={sj} />
                    ))}
                    <Link href={`/jobs?category=${encodeURIComponent(job.category)}`}>
                      <Button 
                        variant="ghost" 
                        className="w-full text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                        data-testid="button-view-more-similar"
                      >
                        View More in {job.category}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-lg max-h-[90vh] overflow-y-auto" data-testid="modal-apply">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-cyan-400" />
              Apply to {job.title}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              at {job.company_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="coverLetter" className="text-white">
                Cover Letter
              </Label>
              <Textarea
                id="coverLetter"
                placeholder="Tell the employer why you're a great fit for this role..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-32"
                data-testid="textarea-cover-letter"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resumeUrl" className="text-white">
                Resume URL (Optional)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="resumeUrl"
                  placeholder="https://example.com/my-resume.pdf"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  data-testid="input-resume-url"
                />
                <Button 
                  variant="outline" 
                  className="border-slate-700 text-slate-300 shrink-0"
                  type="button"
                  data-testid="button-upload-resume"
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Or paste a link to your resume hosted online
              </p>
            </div>

            {screeningQuestions.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-700">
                <h4 className="text-white font-semibold">Screening Questions</h4>
                {screeningQuestions.map((q, idx) => (
                  <div key={idx} className="space-y-2">
                    <Label className="text-white">
                      {q.question}
                      {q.required && <span className="text-red-400 ml-1">*</span>}
                    </Label>
                    {q.type === "yes_no" ? (
                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant={screeningAnswers[q.question] === "Yes" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setScreeningAnswers({...screeningAnswers, [q.question]: "Yes"})}
                          className={screeningAnswers[q.question] === "Yes" ? "bg-cyan-600" : "border-slate-700 text-slate-300"}
                          data-testid={`button-answer-yes-${idx}`}
                        >
                          Yes
                        </Button>
                        <Button
                          type="button"
                          variant={screeningAnswers[q.question] === "No" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setScreeningAnswers({...screeningAnswers, [q.question]: "No"})}
                          className={screeningAnswers[q.question] === "No" ? "bg-cyan-600" : "border-slate-700 text-slate-300"}
                          data-testid={`button-answer-no-${idx}`}
                        >
                          No
                        </Button>
                      </div>
                    ) : q.type === "multiple_choice" && q.options ? (
                      <div className="flex flex-wrap gap-2">
                        {q.options.map((opt, optIdx) => (
                          <Button
                            key={optIdx}
                            type="button"
                            variant={screeningAnswers[q.question] === opt ? "default" : "outline"}
                            size="sm"
                            onClick={() => setScreeningAnswers({...screeningAnswers, [q.question]: opt})}
                            className={screeningAnswers[q.question] === opt ? "bg-cyan-600" : "border-slate-700 text-slate-300"}
                            data-testid={`button-answer-${idx}-${optIdx}`}
                          >
                            {opt}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <Textarea
                        placeholder="Your answer..."
                        value={screeningAnswers[q.question] || ""}
                        onChange={(e) => setScreeningAnswers({...screeningAnswers, [q.question]: e.target.value})}
                        className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                        data-testid={`textarea-answer-${idx}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowApplyModal(false)}
              className="border-slate-700 text-slate-300"
              data-testid="button-cancel-apply"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitApplication}
              disabled={applyMutation.isPending}
              className="bg-cyan-600 hover:bg-cyan-500"
              data-testid="button-submit-application"
            >
              {applyMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
