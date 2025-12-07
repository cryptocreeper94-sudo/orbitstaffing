import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { CarouselRail, CarouselRailItem } from "@/components/ui/carousel-rail";
import { PageHeader, SectionHeader } from "@/components/ui/section-header";
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardDescription, OrbitCardContent, StatCard } from "@/components/ui/orbit-card";
import { 
  Search,
  Plus,
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  TrendingUp,
  Heart,
  Globe,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Recruiting() {
  const [activeTab, setActiveTab] = useState("job-search");
  const [searchQuery, setSearchQuery] = useState("");

  const mockIndeedJobs = [
    {
      id: "1",
      title: "Licensed Electrician",
      company: "Metro Construction",
      location: "Nashville, TN",
      salary: "$45-55/hr",
      posted: "2 hours ago",
      matches: 12,
      interest: 8
    },
    {
      id: "2",
      title: "Plumber (Commercial)",
      company: "Prime Plumbing Services",
      location: "Nashville, TN",
      salary: "$40-50/hr",
      posted: "4 hours ago",
      matches: 5,
      interest: 3
    },
    {
      id: "3",
      title: "Carpenter (Framing)",
      company: "BuildRight Contractors",
      location: "Franklin, TN",
      salary: "$35-45/hr",
      posted: "1 day ago",
      matches: 18,
      interest: 14
    },
    {
      id: "4",
      title: "HVAC Technician",
      company: "Climate Control Services",
      location: "Nashville, TN",
      salary: "$42-52/hr",
      posted: "1 day ago",
      matches: 9,
      interest: 6
    },
  ];

  const filteredJobs = mockIndeedJobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePostJob = (jobId: string) => {
    toast.info("Job posting feature coming soon - backend integration needed");
  };

  const handleGaugeInterest = (jobId: string) => {
    toast.success("Interest gauge activated - checking candidate pool for matches");
  };

  const JobCard = ({ job }: { job: typeof mockIndeedJobs[0] }) => (
    <OrbitCard className="h-full">
      <OrbitCardHeader>
        <div>
          <OrbitCardTitle>{job.title}</OrbitCardTitle>
          <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" /> {job.company}
            </span>
          </div>
        </div>
      </OrbitCardHeader>
      <OrbitCardContent>
        <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {job.location}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> {job.salary}
          </span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-slate-500">{job.posted}</div>
          <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">Active on Indeed</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-t border-slate-700/50 pt-4">
          <div>
            <div className="text-xs text-slate-500 mb-1">Matching Candidates</div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white">{job.matches}</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Interest Level</div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-500" />
              <span className="font-bold text-pink-500">{job.interest}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            className="border-slate-600 hover:border-cyan-500"
            onClick={() => handleGaugeInterest(job.id)}
          >
            <TrendingUp className="w-3 h-3 mr-1" /> Gauge Interest
          </Button>
          <Button 
            size="sm"
            className="bg-cyan-600 hover:bg-cyan-500"
            onClick={() => handlePostJob(job.id)}
          >
            <Globe className="w-3 h-3 mr-1" /> Post Job
          </Button>
        </div>
      </OrbitCardContent>
    </OrbitCard>
  );

  return (
    <Shell>
      <PageHeader
        title="Recruiting Hub"
        subtitle="Search jobs, gauge interest, and post to job boards."
        actions={
          <Button className="bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Plus className="w-4 h-4 mr-2" /> Create Job Posting
          </Button>
        }
      />

      <Tabs defaultValue="job-search" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700/50">
          <TabsTrigger value="job-search">Indeed Job Search</TabsTrigger>
          <TabsTrigger value="interest-gauge">Interest Gauge</TabsTrigger>
          <TabsTrigger value="posting-strategy">Posting Strategy</TabsTrigger>
        </TabsList>

        <TabsContent value="job-search" className="space-y-6">
          <BentoTile className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white mb-2">Search Indeed for Relevant Jobs</h2>
                <p className="text-sm text-slate-400">Find active job postings that match your skill categories. Gauge interest before spending on paid postings.</p>
              </div>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Demo Mode</Badge>
            </div>

            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input 
                  placeholder="Search: electrician, plumber, carpenter, HVAC..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-slate-900/50 border-slate-700"
                />
              </div>
              <Button variant="outline" className="border-slate-700 hover:border-cyan-500">Filters</Button>
            </div>

            <div className="hidden md:block">
              <BentoGrid cols={2} gap="md">
                {filteredJobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </BentoGrid>
            </div>

            <div className="md:hidden">
              <CarouselRail gap="md" itemWidth="lg">
                {filteredJobs.map(job => (
                  <CarouselRailItem key={job.id}>
                    <JobCard job={job} />
                  </CarouselRailItem>
                ))}
              </CarouselRail>
            </div>
          </BentoTile>
        </TabsContent>

        <TabsContent value="interest-gauge" className="space-y-6">
          <BentoGrid cols={2} gap="md">
            <BentoTile className="p-6">
              <OrbitCardHeader icon={<Zap className="w-5 h-5 text-cyan-400" />}>
                <OrbitCardTitle>How Interest Gauging Works</OrbitCardTitle>
                <OrbitCardDescription>Reduce spending before committing to paid postings</OrbitCardDescription>
              </OrbitCardHeader>
              <OrbitCardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                    <div>
                      <div className="font-semibold text-sm text-white">Search Indeed</div>
                      <p className="text-xs text-slate-400">Find the jobs you want to fill</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                    <div>
                      <div className="font-semibold text-sm text-white">Gauge Interest</div>
                      <p className="text-xs text-slate-400">We scan your candidate pool for matches</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                    <div>
                      <div className="font-semibold text-sm text-white">See Interest Level</div>
                      <p className="text-xs text-slate-400">Know if candidates exist before posting</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                    <div>
                      <div className="font-semibold text-sm text-white">Post or Skip</div>
                      <p className="text-xs text-slate-400">Only pay for jobs with candidate demand</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm">
                  <p className="text-xs font-semibold text-blue-400 mb-1">✓ Smart Recruiting</p>
                  <p className="text-xs text-blue-400/80">Avoid wasted ad spend. Post only when you know candidates are ready.</p>
                </div>
              </OrbitCardContent>
            </BentoTile>

            <BentoTile className="p-6">
              <OrbitCardHeader icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}>
                <OrbitCardTitle>Example: Licensed Electrician</OrbitCardTitle>
                <OrbitCardDescription>Showing data from candidate pool analysis</OrbitCardDescription>
              </OrbitCardHeader>
              <OrbitCardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-white">Matching Candidates</span>
                      <span className="text-xs text-slate-400">12 candidates</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-cyan-500 h-full" style={{ width: "80%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-white">Expressed Interest</span>
                      <span className="text-xs text-slate-400">8/12 (67%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-pink-500 h-full" style={{ width: "67%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-white">Available for Work</span>
                      <span className="text-xs text-slate-400">6/8 (75%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: "75%" }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-sm">
                  <p className="text-xs font-semibold text-emerald-400 mb-1">✓ Good to Post</p>
                  <p className="text-xs text-emerald-400/80">High interest + availability. Recommend posting this job now.</p>
                </div>
              </OrbitCardContent>
            </BentoTile>
          </BentoGrid>
        </TabsContent>

        <TabsContent value="posting-strategy" className="space-y-6">
          <BentoTile className="p-6">
            <SectionHeader
              title="Job Board Strategy"
              subtitle="Connect to job boards and track your recruiting ROI"
              size="sm"
            />
            
            <BentoGrid cols={4} gap="md" className="mb-6">
              <OrbitCard>
                <OrbitCardContent>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-sm text-white">Indeed</h3>
                      <p className="text-xs text-slate-400">Largest job board for trades</p>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Active</Badge>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1 mb-3">
                    <p>✓ Post after gauging interest</p>
                    <p>✓ ~$30-100 per posting</p>
                    <p>✓ Avg 2-3 days to fill</p>
                  </div>
                  <Button size="sm" variant="outline" className="w-full border-slate-600 hover:border-cyan-500">Setup Indeed Integration</Button>
                </OrbitCardContent>
              </OrbitCard>

              <OrbitCard>
                <OrbitCardContent>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-sm text-white">LinkedIn Jobs</h3>
                      <p className="text-xs text-slate-400">For professional roles</p>
                    </div>
                    <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Coming</Badge>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1 mb-3">
                    <p>✓ Professional network</p>
                    <p>✓ Higher candidate quality</p>
                    <p>✓ Integration in progress</p>
                  </div>
                  <Button size="sm" variant="outline" className="w-full border-slate-600" disabled>Coming Soon</Button>
                </OrbitCardContent>
              </OrbitCard>

              <OrbitCard>
                <OrbitCardContent>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-sm text-white">ZipRecruiter</h3>
                      <p className="text-xs text-slate-400">Multi-board aggregator</p>
                    </div>
                    <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Coming</Badge>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1 mb-3">
                    <p>✓ Posts to 100+ sites</p>
                    <p>✓ Broader reach</p>
                    <p>✓ Integration planned</p>
                  </div>
                  <Button size="sm" variant="outline" className="w-full border-slate-600" disabled>Coming Soon</Button>
                </OrbitCardContent>
              </OrbitCard>

              <OrbitCard>
                <OrbitCardContent>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-sm text-white">Internal Portal</h3>
                      <p className="text-xs text-slate-400">Your own job listings</p>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Ready</Badge>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1 mb-3">
                    <p>✓ Always free</p>
                    <p>✓ Shared with candidates</p>
                    <p>✓ Available now</p>
                  </div>
                  <Button size="sm" className="w-full bg-cyan-600 hover:bg-cyan-500">View All Postings</Button>
                </OrbitCardContent>
              </OrbitCard>
            </BentoGrid>

            <SectionHeader
              title="Recruiting ROI Tracker"
              size="sm"
              eyebrow="Analytics"
            />

            <BentoGrid cols={3} gap="md">
              <StatCard
                label="Total Spent This Month"
                value="$340"
                icon={<DollarSign className="w-5 h-5" />}
              />
              <StatCard
                label="Placements Made"
                value="12"
                icon={<Users className="w-5 h-5" />}
                trend={{ value: 20, positive: true }}
              />
              <StatCard
                label="Cost per Placement"
                value="$28.33"
                icon={<TrendingUp className="w-5 h-5" />}
                trend={{ value: 19, positive: true }}
              />
            </BentoGrid>
          </BentoTile>
        </TabsContent>
      </Tabs>
    </Shell>
  );
}
