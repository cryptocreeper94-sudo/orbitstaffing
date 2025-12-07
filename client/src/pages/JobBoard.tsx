import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Clock, 
  Star,
  Filter,
  X,
  ChevronLeft,
  Building2,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
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
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { CarouselRail, CarouselRailItem } from "@/components/ui/carousel-rail";
import { SectionHeader, PageHeader } from "@/components/ui/section-header";
import { 
  OrbitCard, 
  OrbitCardHeader, 
  OrbitCardTitle, 
  OrbitCardDescription, 
  OrbitCardContent, 
  OrbitCardFooter 
} from "@/components/ui/orbit-card";

interface Job {
  id: number;
  title: string;
  companyName: string;
  city: string;
  state: string;
  payMin: number | null;
  payMax: number | null;
  payType: string;
  jobType: string;
  category: string;
  description: string;
  featured: boolean;
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  jobCount: number;
}

interface JobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Temporary", "Seasonal"];

function formatPayRange(min: number | null, max: number | null, payType: string): string {
  if (!min && !max) return "Competitive";
  const formatNum = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
  const suffix = payType === "hourly" ? "/hr" : payType === "yearly" ? "/yr" : "";
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
  switch (jobType.toLowerCase()) {
    case "full-time": return "bg-cyan-600/20 text-cyan-300 border-cyan-500/30";
    case "part-time": return "bg-blue-600/20 text-blue-300 border-blue-500/30";
    case "contract": return "bg-purple-600/20 text-purple-300 border-purple-500/30";
    case "temporary": return "bg-amber-600/20 text-amber-300 border-amber-500/30";
    case "seasonal": return "bg-green-600/20 text-green-300 border-green-500/30";
    default: return "bg-slate-600/20 text-slate-300 border-slate-500/30";
  }
}

function JobCardSkeleton() {
  return (
    <OrbitCard>
      <OrbitCardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="flex flex-wrap gap-4 mb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-16 w-full" />
      </OrbitCardContent>
    </OrbitCard>
  );
}

function FeaturedJobCard({ job }: { job: Job }) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <OrbitCard 
        variant="action"
        className="h-full"
        data-testid={`card-featured-job-${job.id}`}
      >
        <OrbitCardHeader
          icon={<Star className="w-5 h-5 text-cyan-400 fill-cyan-400" />}
          action={
            <Badge className={getJobTypeBadgeColor(job.jobType)} data-testid={`badge-job-type-${job.id}`}>
              {job.jobType}
            </Badge>
          }
        >
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Featured</span>
        </OrbitCardHeader>
        <OrbitCardContent>
          <OrbitCardTitle data-testid={`text-job-title-${job.id}`}>
            {job.title}
          </OrbitCardTitle>
          <div className="flex items-center gap-2 text-slate-400 mt-2">
            <Building2 className="w-4 h-4" />
            <span data-testid={`text-company-name-${job.id}`}>{job.companyName}</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-400 mt-3">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span data-testid={`text-location-${job.id}`}>{job.city}, {job.state}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-medium" data-testid={`text-pay-range-${job.id}`}>
                {formatPayRange(job.payMin, job.payMax, job.payType)}
              </span>
            </div>
          </div>
          <p className="text-slate-300 text-sm line-clamp-2 mt-3" data-testid={`text-description-${job.id}`}>
            {job.description}
          </p>
        </OrbitCardContent>
        <OrbitCardFooter>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(job.createdAt)}
          </span>
          <Button 
            variant="default" 
            size="sm" 
            className="bg-cyan-600 hover:bg-cyan-500"
            data-testid={`button-view-job-${job.id}`}
          >
            View Details
          </Button>
        </OrbitCardFooter>
      </OrbitCard>
    </Link>
  );
}

function JobCard({ job }: { job: Job }) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <OrbitCard 
        className="h-full"
        data-testid={`card-job-${job.id}`}
      >
        <OrbitCardHeader
          action={
            <Badge className={getJobTypeBadgeColor(job.jobType)} data-testid={`badge-job-type-${job.id}`}>
              {job.jobType}
            </Badge>
          }
        >
          <div>
            <OrbitCardTitle className="hover:text-cyan-400 transition-colors" data-testid={`text-job-title-${job.id}`}>
              {job.title}
            </OrbitCardTitle>
            <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
              <Building2 className="w-4 h-4" />
              <span data-testid={`text-company-name-${job.id}`}>{job.companyName}</span>
            </div>
          </div>
        </OrbitCardHeader>
        <OrbitCardContent>
          <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-3">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span data-testid={`text-location-${job.id}`}>{job.city}, {job.state}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-green-400" data-testid={`text-pay-range-${job.id}`}>
                {formatPayRange(job.payMin, job.payMax, job.payType)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              <span data-testid={`text-posted-date-${job.id}`}>{formatDate(job.createdAt)}</span>
            </div>
          </div>
          <p className="text-slate-400 text-sm line-clamp-2" data-testid={`text-description-${job.id}`}>
            {job.description}
          </p>
        </OrbitCardContent>
        <OrbitCardFooter>
          <Badge variant="outline" className="text-xs text-slate-400" data-testid={`badge-category-${job.id}`}>
            {job.category}
          </Badge>
          <Button 
            variant="outline" 
            size="sm"
            className="text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-500/50"
            data-testid={`button-view-job-${job.id}`}
          >
            View Details
          </Button>
        </OrbitCardFooter>
      </OrbitCard>
    </Link>
  );
}

export default function JobBoard() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const limit = 10;

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (city) params.set("city", city);
    if (state) params.set("state", state);
    if (selectedJobTypes.length > 0) params.set("jobType", selectedJobTypes.join(","));
    if (selectedCategories.length > 0) params.set("category", selectedCategories.join(","));
    params.set("page", page.toString());
    params.set("limit", limit.toString());
    return params.toString();
  }, [search, city, state, selectedJobTypes, selectedCategories, page]);

  const { data: jobsData, isLoading: jobsLoading } = useQuery<JobsResponse>({
    queryKey: ["/api/talent-exchange/public/jobs", queryParams],
    queryFn: async () => {
      const res = await fetch(`/api/talent-exchange/public/jobs?${queryParams}`);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return res.json();
    },
  });

  const { data: categoriesData } = useQuery<Category[]>({
    queryKey: ["/api/talent-exchange/public/categories"],
    queryFn: async () => {
      const res = await fetch("/api/talent-exchange/public/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  const { data: featuredJobsData, isLoading: featuredLoading } = useQuery<Job[]>({
    queryKey: ["/api/talent-exchange/public/featured-jobs"],
    queryFn: async () => {
      const res = await fetch("/api/talent-exchange/public/featured-jobs");
      if (!res.ok) throw new Error("Failed to fetch featured jobs");
      return res.json();
    },
  });

  const jobs = jobsData?.jobs || [];
  const totalPages = jobsData?.totalPages || 1;
  const total = jobsData?.total || 0;
  const categories = categoriesData || [];
  const featuredJobs = featuredJobsData || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const toggleJobType = (type: string) => {
    setSelectedJobTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
    setPage(1);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setCity("");
    setState("");
    setSelectedJobTypes([]);
    setSelectedCategories([]);
    setPage(1);
  };

  const hasActiveFilters = search || city || state || selectedJobTypes.length > 0 || selectedCategories.length > 0;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="text-center mb-10">
            <Link href="/" className="inline-block mb-6">
              <span className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back to ORBIT
              </span>
            </Link>
            <PageHeader 
              title=""
              className="mb-0"
            />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                ORBIT Talent Exchange
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Discover opportunities from verified employers. Find your next career move.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <OrbitCard variant="glass" className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative lg:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Job title, keywords..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-slate-900/50 border-slate-600 focus:border-cyan-500 text-white placeholder:text-slate-500"
                    data-testid="input-search"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="pl-10 bg-slate-900/50 border-slate-600 focus:border-cyan-500 text-white placeholder:text-slate-500"
                    data-testid="input-city"
                  />
                </div>
                <div className="relative">
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger 
                      className="bg-slate-900/50 border-slate-600 text-white"
                      data-testid="select-state"
                    >
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="all">All States</SelectItem>
                      <SelectItem value="AL">Alabama</SelectItem>
                      <SelectItem value="AK">Alaska</SelectItem>
                      <SelectItem value="AZ">Arizona</SelectItem>
                      <SelectItem value="AR">Arkansas</SelectItem>
                      <SelectItem value="CA">California</SelectItem>
                      <SelectItem value="CO">Colorado</SelectItem>
                      <SelectItem value="CT">Connecticut</SelectItem>
                      <SelectItem value="DE">Delaware</SelectItem>
                      <SelectItem value="FL">Florida</SelectItem>
                      <SelectItem value="GA">Georgia</SelectItem>
                      <SelectItem value="HI">Hawaii</SelectItem>
                      <SelectItem value="ID">Idaho</SelectItem>
                      <SelectItem value="IL">Illinois</SelectItem>
                      <SelectItem value="IN">Indiana</SelectItem>
                      <SelectItem value="IA">Iowa</SelectItem>
                      <SelectItem value="KS">Kansas</SelectItem>
                      <SelectItem value="KY">Kentucky</SelectItem>
                      <SelectItem value="LA">Louisiana</SelectItem>
                      <SelectItem value="ME">Maine</SelectItem>
                      <SelectItem value="MD">Maryland</SelectItem>
                      <SelectItem value="MA">Massachusetts</SelectItem>
                      <SelectItem value="MI">Michigan</SelectItem>
                      <SelectItem value="MN">Minnesota</SelectItem>
                      <SelectItem value="MS">Mississippi</SelectItem>
                      <SelectItem value="MO">Missouri</SelectItem>
                      <SelectItem value="MT">Montana</SelectItem>
                      <SelectItem value="NE">Nebraska</SelectItem>
                      <SelectItem value="NV">Nevada</SelectItem>
                      <SelectItem value="NH">New Hampshire</SelectItem>
                      <SelectItem value="NJ">New Jersey</SelectItem>
                      <SelectItem value="NM">New Mexico</SelectItem>
                      <SelectItem value="NY">New York</SelectItem>
                      <SelectItem value="NC">North Carolina</SelectItem>
                      <SelectItem value="ND">North Dakota</SelectItem>
                      <SelectItem value="OH">Ohio</SelectItem>
                      <SelectItem value="OK">Oklahoma</SelectItem>
                      <SelectItem value="OR">Oregon</SelectItem>
                      <SelectItem value="PA">Pennsylvania</SelectItem>
                      <SelectItem value="RI">Rhode Island</SelectItem>
                      <SelectItem value="SC">South Carolina</SelectItem>
                      <SelectItem value="SD">South Dakota</SelectItem>
                      <SelectItem value="TN">Tennessee</SelectItem>
                      <SelectItem value="TX">Texas</SelectItem>
                      <SelectItem value="UT">Utah</SelectItem>
                      <SelectItem value="VT">Vermont</SelectItem>
                      <SelectItem value="VA">Virginia</SelectItem>
                      <SelectItem value="WA">Washington</SelectItem>
                      <SelectItem value="WV">West Virginia</SelectItem>
                      <SelectItem value="WI">Wisconsin</SelectItem>
                      <SelectItem value="WY">Wyoming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Job Type Filters - Desktop */}
              <div className="hidden md:flex flex-wrap items-center justify-between gap-4 mt-4">
                <div className="flex flex-wrap gap-2">
                  {JOB_TYPES.map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={selectedJobTypes.includes(type) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleJobType(type)}
                      className={selectedJobTypes.includes(type) 
                        ? "bg-cyan-600 hover:bg-cyan-500" 
                        : "border-slate-600 text-slate-300 hover:border-cyan-500 hover:text-cyan-400"
                      }
                      data-testid={`button-filter-${type.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  {hasActiveFilters && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-slate-400 hover:text-white"
                      data-testid="button-clear-filters"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="bg-cyan-600 hover:bg-cyan-500"
                    data-testid="button-search"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search Jobs
                  </Button>
                </div>
              </div>

              {/* Job Type Filters - Mobile Carousel */}
              <div className="md:hidden mt-4">
                <CarouselRail gap="sm" showArrows={false}>
                  {JOB_TYPES.map((type) => (
                    <CarouselRailItem key={type}>
                      <Button
                        type="button"
                        variant={selectedJobTypes.includes(type) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleJobType(type)}
                        className={selectedJobTypes.includes(type) 
                          ? "bg-cyan-600 hover:bg-cyan-500" 
                          : "border-slate-600 text-slate-300 hover:border-cyan-500 hover:text-cyan-400"
                        }
                        data-testid={`button-filter-mobile-${type.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {type}
                      </Button>
                    </CarouselRailItem>
                  ))}
                </CarouselRail>
                <div className="flex gap-2 mt-4 justify-end">
                  {hasActiveFilters && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-slate-400 hover:text-white"
                      data-testid="button-clear-filters-mobile"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="bg-cyan-600 hover:bg-cyan-500"
                    data-testid="button-search-mobile"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </OrbitCard>
          </form>
        </div>
      </div>

      {/* Featured Jobs Section */}
      {featuredJobs.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <SectionHeader
            eyebrow="Top Picks"
            title="Featured Opportunities"
            subtitle="Hand-picked positions from verified employers"
            size="md"
          />
          {featuredLoading ? (
            <BentoGrid cols={3} gap="md">
              {[1, 2, 3].map((i) => (
                <BentoTile key={i}>
                  <JobCardSkeleton />
                </BentoTile>
              ))}
            </BentoGrid>
          ) : (
            <BentoGrid cols={3} gap="md">
              {featuredJobs.slice(0, 3).map((job) => (
                <BentoTile key={job.id}>
                  <FeaturedJobCard job={job} />
                </BentoTile>
              ))}
            </BentoGrid>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            className="lg:hidden flex items-center gap-2 border-slate-600"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            data-testid="button-toggle-filters"
          >
            <Filter className="w-4 h-4" />
            {showMobileFilters ? "Hide Filters" : "Show Filters"}
          </Button>

          {/* Category Sidebar */}
          <aside className={`lg:w-64 flex-shrink-0 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <OrbitCard className="sticky top-4">
              <OrbitCardHeader icon={<Briefcase className="w-5 h-5 text-cyan-400" />}>
                <OrbitCardTitle>Categories</OrbitCardTitle>
              </OrbitCardHeader>
              <OrbitCardContent className="space-y-3">
                {categories.length === 0 ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-6 w-full" />
                    ))}
                  </div>
                ) : (
                  categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center gap-3 cursor-pointer group"
                      data-testid={`filter-category-${category.slug}`}
                    >
                      <Checkbox
                        checked={selectedCategories.includes(category.slug)}
                        onCheckedChange={() => toggleCategory(category.slug)}
                        className="border-slate-600 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600"
                        data-testid={`checkbox-category-${category.slug}`}
                      />
                      <span className="text-sm text-slate-300 group-hover:text-cyan-400 transition-colors flex-1">
                        {category.name}
                      </span>
                      <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded-full">
                        {category.jobCount}
                      </span>
                    </label>
                  ))
                )}
              </OrbitCardContent>
            </OrbitCard>
          </aside>

          {/* Job Listings */}
          <main className="flex-1">
            <SectionHeader
              title={`${total} Jobs Found`}
              subtitle={hasActiveFilters ? "Filtered results" : undefined}
              size="sm"
              action={
                hasActiveFilters ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear filters
                  </Button>
                ) : undefined
              }
            />

            {jobsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => <JobCardSkeleton key={i} />)}
              </div>
            ) : jobs.length === 0 ? (
              <OrbitCard>
                <OrbitCardContent className="py-16 text-center">
                  <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Jobs Found</h3>
                  <p className="text-slate-400 mb-6">
                    Try adjusting your search criteria or clearing filters
                  </p>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
                      data-testid="button-clear-filters-empty"
                    >
                      Clear All Filters
                    </Button>
                  )}
                </OrbitCardContent>
              </OrbitCard>
            ) : (
              <BentoGrid cols={1} gap="md">
                {jobs.map((job) => (
                  <BentoTile key={job.id}>
                    <JobCard job={job} />
                  </BentoTile>
                ))}
              </BentoGrid>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage(Math.max(1, page - 1))}
                        className={`cursor-pointer ${page === 1 ? 'opacity-50 pointer-events-none' : ''}`}
                        data-testid="pagination-previous"
                      />
                    </PaginationItem>
                    {renderPaginationItems()}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        className={`cursor-pointer ${page === totalPages ? 'opacity-50 pointer-events-none' : ''}`}
                        data-testid="pagination-next"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                <div className="text-center mt-4 text-sm text-slate-500">
                  Page {page} of {totalPages}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-slate-400 text-sm">
              Powered by <span className="text-cyan-400 font-semibold">ORBIT Talent Exchange</span>
            </div>
            <div className="flex gap-6 text-sm text-slate-400">
              <Link href="/apply" className="hover:text-cyan-400 transition-colors" data-testid="link-post-job">
                Post a Job
              </Link>
              <Link href="/" className="hover:text-cyan-400 transition-colors" data-testid="link-for-employers">
                For Employers
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
