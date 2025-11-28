import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Search,
  MapPin,
  Star,
  Filter,
  X,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Award,
  Users,
  Briefcase,
  TrendingUp,
  UserCheck,
  Calendar,
  Phone,
  Mail,
  Send,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

interface Worker {
  id: number;
  firstName: string;
  lastName: string;
  city: string;
  state: string;
  skills: string[];
  yearsExperience: number;
  performanceScore: number;
  customerRating: number;
  ratingCount: number;
  availabilityStatus: "available" | "busy" | "not_available";
  assignmentsCompleted: number;
  onTimeRate: number;
  onboardingComplete: boolean;
  bio?: string;
  phone?: string;
  email?: string;
  certifications?: string[];
  preferredJobTypes?: string[];
  hourlyRate?: number;
  joinedDate?: string;
}

interface TalentPoolResponse {
  workers: Worker[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const SKILLS_LIST = [
  "Lot Attendant",
  "Car Wash",
  "Detailing",
  "Vehicle Transport",
  "Customer Service",
  "Inventory Management",
  "Quality Control",
  "Fleet Management",
  "Shuttle Driver",
  "Porter Services",
];

const AVAILABILITY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "busy", label: "Busy" },
  { value: "not_available", label: "Not Available" },
];

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

function getPerformanceScoreColor(score: number): string {
  if (score >= 80) return "bg-green-600/20 text-green-300 border-green-500/30";
  if (score >= 60) return "bg-amber-600/20 text-amber-300 border-amber-500/30";
  return "bg-red-600/20 text-red-300 border-red-500/30";
}

function getAvailabilityBadge(status: string): { color: string; label: string } {
  switch (status) {
    case "available":
      return { color: "bg-green-600/20 text-green-300 border-green-500/30", label: "Available" };
    case "busy":
      return { color: "bg-amber-600/20 text-amber-300 border-amber-500/30", label: "Busy" };
    case "not_available":
      return { color: "bg-red-600/20 text-red-300 border-red-500/30", label: "Not Available" };
    default:
      return { color: "bg-slate-600/20 text-slate-300 border-slate-500/30", label: "Unknown" };
  }
}

function renderStars(rating: number, count: number) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 text-amber-400 fill-amber-400" />
        ))}
        {hasHalf && (
          <Star className="w-4 h-4 text-amber-400 fill-amber-400/50" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-slate-600" />
        ))}
      </div>
      <span className="text-sm text-slate-400">
        {rating.toFixed(1)} ({count})
      </span>
    </div>
  );
}

function WorkerCardSkeleton() {
  return (
    <Card className="bg-slate-800/50 border-slate-700/50">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="flex flex-wrap gap-4 mb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

function WorkerCard({
  worker,
  onViewProfile,
  onRequestWorker,
}: {
  worker: Worker;
  onViewProfile: (worker: Worker) => void;
  onRequestWorker: (worker: Worker) => void;
}) {
  const availabilityBadge = getAvailabilityBadge(worker.availabilityStatus);
  const displaySkills = worker.skills?.slice(0, 5) || [];

  return (
    <Card
      className="bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5 cursor-pointer"
      data-testid={`card-worker-${worker.id}`}
      onClick={() => onViewProfile(worker)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className="text-lg font-semibold text-white hover:text-cyan-400 transition-colors"
                data-testid={`text-worker-name-${worker.id}`}
              >
                {worker.firstName} {worker.lastName}
              </h3>
              {worker.onboardingComplete && (
                <CheckCircle2
                  className="w-5 h-5 text-cyan-400"
                  data-testid={`badge-verified-${worker.id}`}
                />
              )}
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <MapPin className="w-4 h-4" />
              <span data-testid={`text-location-${worker.id}`}>
                {worker.city}, {worker.state}
              </span>
            </div>
          </div>
          <Badge
            className={availabilityBadge.color}
            data-testid={`badge-availability-${worker.id}`}
          >
            {availabilityBadge.label}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {displaySkills.map((skill, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-xs text-cyan-300 border-cyan-500/30 bg-cyan-500/10"
              data-testid={`badge-skill-${worker.id}-${index}`}
            >
              {skill}
            </Badge>
          ))}
          {worker.skills?.length > 5 && (
            <Badge variant="outline" className="text-xs text-slate-400 border-slate-600">
              +{worker.skills.length - 5} more
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-4">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-cyan-400" />
            <Badge
              className={getPerformanceScoreColor(worker.performanceScore)}
              data-testid={`badge-performance-${worker.id}`}
            >
              Score: {worker.performanceScore}
            </Badge>
          </div>
          <div
            className="flex items-center gap-1.5"
            data-testid={`text-rating-${worker.id}`}
          >
            {renderStars(worker.customerRating, worker.ratingCount)}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-4">
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-slate-500" />
            <span data-testid={`text-experience-${worker.id}`}>
              {worker.yearsExperience} yrs exp
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span data-testid={`text-completed-${worker.id}`}>
              {worker.assignmentsCompleted} completed
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            <span data-testid={`text-ontime-${worker.id}`}>
              {worker.onTimeRate}% on-time
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700/50">
          <Button
            variant="outline"
            size="sm"
            className="text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-500/50"
            onClick={(e) => {
              e.stopPropagation();
              onViewProfile(worker);
            }}
            data-testid={`button-view-profile-${worker.id}`}
          >
            View Profile
          </Button>
          <Button
            size="sm"
            className="bg-cyan-600 hover:bg-cyan-500"
            onClick={(e) => {
              e.stopPropagation();
              onRequestWorker(worker);
            }}
            data-testid={`button-request-worker-${worker.id}`}
          >
            <Send className="w-4 h-4 mr-1" />
            Request
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function WorkerProfileSheet({
  worker,
  open,
  onOpenChange,
  onRequestWorker,
}: {
  worker: Worker | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestWorker: (worker: Worker) => void;
}) {
  if (!worker) return null;

  const availabilityBadge = getAvailabilityBadge(worker.availabilityStatus);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="bg-slate-900 border-slate-700 w-full sm:max-w-lg"
        data-testid="sheet-worker-profile"
      >
        <SheetHeader>
          <SheetTitle className="text-white flex items-center gap-2">
            <span data-testid="text-profile-name">
              {worker.firstName} {worker.lastName}
            </span>
            {worker.onboardingComplete && (
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
            )}
          </SheetTitle>
          <SheetDescription className="flex items-center gap-2 text-slate-400">
            <MapPin className="w-4 h-4" />
            {worker.city}, {worker.state}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-200px)] mt-6 pr-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Badge className={availabilityBadge.color}>
                {availabilityBadge.label}
              </Badge>
              <Badge className={getPerformanceScoreColor(worker.performanceScore)}>
                Performance: {worker.performanceScore}
              </Badge>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Rating</h4>
              {renderStars(worker.customerRating, worker.ratingCount)}
            </div>

            {worker.bio && (
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-2">About</h4>
                <p className="text-slate-400 text-sm" data-testid="text-profile-bio">
                  {worker.bio}
                </p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {worker.skills?.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs text-cyan-300 border-cyan-500/30 bg-cyan-500/10"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {worker.certifications && worker.certifications.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-2">
                  Certifications
                </h4>
                <div className="flex flex-wrap gap-2">
                  {worker.certifications.map((cert, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs text-amber-300 border-amber-500/30 bg-amber-500/10"
                    >
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-xs">Experience</span>
                </div>
                <p className="text-lg font-semibold text-white">
                  {worker.yearsExperience} years
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs">Completed</span>
                </div>
                <p className="text-lg font-semibold text-white">
                  {worker.assignmentsCompleted}
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">On-Time Rate</span>
                </div>
                <p className="text-lg font-semibold text-white">
                  {worker.onTimeRate}%
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs">Performance</span>
                </div>
                <p className="text-lg font-semibold text-white">
                  {worker.performanceScore}/100
                </p>
              </div>
            </div>

            {worker.hourlyRate && (
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Hourly Rate</span>
                  <span className="text-xl font-bold text-green-400">
                    ${worker.hourlyRate}/hr
                  </span>
                </div>
              </div>
            )}

            {worker.joinedDate && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>Member since {new Date(worker.joinedDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-slate-900 border-t border-slate-700">
          <Button
            className="w-full bg-cyan-600 hover:bg-cyan-500"
            onClick={() => onRequestWorker(worker)}
            data-testid="button-request-from-profile"
          >
            <Send className="w-4 h-4 mr-2" />
            Request This Worker
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function RequestWorkerDialog({
  worker,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: {
  worker: Worker | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { message: string; startDate: string; duration: string }) => void;
  isSubmitting: boolean;
}) {
  const [message, setMessage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState("");

  if (!worker) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ message, startDate, duration });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-slate-900 border-slate-700 sm:max-w-md"
        data-testid="dialog-request-worker"
      >
        <DialogHeader>
          <DialogTitle className="text-white">Request Worker</DialogTitle>
          <DialogDescription className="text-slate-400">
            Send a hire request to{" "}
            <span className="text-cyan-400">
              {worker.firstName} {worker.lastName}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-slate-300">
              Preferred Start Date
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white"
              required
              data-testid="input-start-date"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="text-slate-300">
              Expected Duration
            </Label>
            <Select value={duration} onValueChange={setDuration} required>
              <SelectTrigger
                className="bg-slate-800 border-slate-600 text-white"
                data-testid="select-duration"
              >
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="1day">1 Day</SelectItem>
                <SelectItem value="1week">1 Week</SelectItem>
                <SelectItem value="2weeks">2 Weeks</SelectItem>
                <SelectItem value="1month">1 Month</SelectItem>
                <SelectItem value="3months">3 Months</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-slate-300">
              Message (Optional)
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the job requirements, location details, etc."
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 min-h-[100px]"
              data-testid="input-message"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
              data-testid="button-cancel-request"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-500"
              disabled={isSubmitting || !startDate || !duration}
              data-testid="button-submit-request"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function TalentPool() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [availability, setAvailability] = useState("all");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [workerToRequest, setWorkerToRequest] = useState<Worker | null>(null);
  const limit = 12;

  const getEmployerId = () => {
    try {
      const stored = localStorage.getItem("talentExchangeEmployer");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.id || null;
      }
    } catch {
      return null;
    }
    return null;
  };

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (city) params.set("city", city);
    if (state && state !== "all") params.set("state", state);
    if (availability && availability !== "all") params.set("available", availability);
    if (selectedSkills.length > 0) params.set("skills", selectedSkills.join(","));
    params.set("page", page.toString());
    params.set("limit", limit.toString());
    return params.toString();
  }, [search, city, state, availability, selectedSkills, page]);

  const { data: talentData, isLoading } = useQuery<TalentPoolResponse>({
    queryKey: ["/api/talent-exchange/talent-pool", queryParams],
    queryFn: async () => {
      const res = await fetch(`/api/talent-exchange/talent-pool?${queryParams}`);
      if (!res.ok) throw new Error("Failed to fetch talent pool");
      return res.json();
    },
  });

  const requestWorkerMutation = useMutation({
    mutationFn: async (data: {
      workerId: number;
      message: string;
      startDate: string;
      duration: string;
    }) => {
      const employerId = getEmployerId();
      if (!employerId) {
        throw new Error("Please login as an employer to request workers");
      }
      const res = await fetch("/api/talent-exchange/worker-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          employerId,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to send request");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Request Sent",
        description: "Your worker request has been submitted successfully.",
      });
      setRequestDialogOpen(false);
      setWorkerToRequest(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const workers = talentData?.workers || [];
  const totalPages = talentData?.totalPages || 1;
  const total = talentData?.total || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setCity("");
    setState("");
    setAvailability("all");
    setSelectedSkills([]);
    setPage(1);
  };

  const hasActiveFilters =
    search || city || state !== "" || availability !== "all" || selectedSkills.length > 0;

  const handleViewProfile = (worker: Worker) => {
    setSelectedWorker(worker);
    setProfileOpen(true);
  };

  const handleRequestWorker = (worker: Worker) => {
    setWorkerToRequest(worker);
    setRequestDialogOpen(true);
  };

  const handleSubmitRequest = (data: {
    message: string;
    startDate: string;
    duration: string;
  }) => {
    if (!workerToRequest) return;
    requestWorkerMutation.mutate({
      workerId: workerToRequest.id,
      ...data,
    });
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => setPage(1)}
            isActive={page === 1}
            className="cursor-pointer"
            data-testid="pagination-page-1"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (start > 2) {
        items.push(
          <PaginationItem key="start-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    for (let i = start; i <= end; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setPage(i)}
            isActive={page === i}
            className="cursor-pointer"
            data-testid={`pagination-page-${i}`}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        items.push(
          <PaginationItem key="end-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => setPage(totalPages)}
            isActive={page === totalPages}
            className="cursor-pointer"
            data-testid={`pagination-page-${totalPages}`}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  const FiltersSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Location
        </h3>
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
            data-testid="input-filter-city"
          />
          <Select
            value={state}
            onValueChange={(val) => {
              setState(val);
              setPage(1);
            }}
          >
            <SelectTrigger
              className="bg-slate-900/50 border-slate-600 text-white"
              data-testid="select-filter-state"
            >
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 max-h-[200px]">
              <SelectItem value="all">All States</SelectItem>
              {US_STATES.map((st) => (
                <SelectItem key={st} value={st}>
                  {st}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <UserCheck className="w-4 h-4" />
          Availability
        </h3>
        <Select
          value={availability}
          onValueChange={(val) => {
            setAvailability(val);
            setPage(1);
          }}
        >
          <SelectTrigger
            className="bg-slate-900/50 border-slate-600 text-white"
            data-testid="select-filter-availability"
          >
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {AVAILABILITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          Skills
        </h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
          {SKILLS_LIST.map((skill) => (
            <div key={skill} className="flex items-center space-x-2">
              <Checkbox
                id={`skill-${skill}`}
                checked={selectedSkills.includes(skill)}
                onCheckedChange={() => toggleSkill(skill)}
                className="border-slate-600 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600"
                data-testid={`checkbox-skill-${skill.toLowerCase().replace(/\s+/g, "-")}`}
              />
              <label
                htmlFor={`skill-${skill}`}
                className="text-sm text-slate-400 cursor-pointer hover:text-white transition-colors"
              >
                {skill}
              </label>
            </div>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="w-full text-slate-400 hover:text-white hover:bg-slate-800"
          data-testid="button-clear-filters"
        >
          <X className="w-4 h-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center mb-10">
            <Link href="/" className="inline-block mb-6">
              <span className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back to ORBIT
              </span>
            </Link>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                ORBIT Talent Pool
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Browse pre-vetted, qualified workers ready to join your team.
            </p>
          </div>

          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700/50 shadow-xl">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search by name or skills..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-slate-900/50 border-slate-600 focus:border-cyan-500 text-white placeholder:text-slate-500"
                    data-testid="input-search"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-500"
                  data-testid="button-search"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">
              {isLoading ? (
                "Loading..."
              ) : (
                <>
                  <span data-testid="text-total-workers">{total}</span> Workers Found
                </>
              )}
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden border-slate-600 text-slate-300"
            data-testid="button-toggle-filters"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showMobileFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside
            className={`lg:w-64 shrink-0 ${showMobileFilters ? "block" : "hidden lg:block"}`}
          >
            <Card className="bg-slate-800/50 border-slate-700/50 sticky top-4">
              <CardContent className="p-6">
                <FiltersSidebar />
              </CardContent>
            </Card>
          </aside>

          <main className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <WorkerCardSkeleton key={i} />
                ))}
              </div>
            ) : workers.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-12 text-center">
                  <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Workers Found
                  </h3>
                  <p className="text-slate-400 mb-4">
                    Try adjusting your search criteria or filters.
                  </p>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                      data-testid="button-clear-filters-empty"
                    >
                      Clear All Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {workers.map((worker) => (
                    <WorkerCard
                      key={worker.id}
                      worker={worker}
                      onViewProfile={handleViewProfile}
                      onRequestWorker={handleRequestWorker}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className={`cursor-pointer ${
                              page === 1 ? "pointer-events-none opacity-50" : ""
                            }`}
                            data-testid="pagination-previous"
                          />
                        </PaginationItem>
                        {renderPaginationItems()}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            className={`cursor-pointer ${
                              page === totalPages ? "pointer-events-none opacity-50" : ""
                            }`}
                            data-testid="pagination-next"
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <WorkerProfileSheet
        worker={selectedWorker}
        open={profileOpen}
        onOpenChange={setProfileOpen}
        onRequestWorker={handleRequestWorker}
      />

      <RequestWorkerDialog
        worker={workerToRequest}
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
        onSubmit={handleSubmitRequest}
        isSubmitting={requestWorkerMutation.isPending}
      />
    </div>
  );
}
