import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search,
  Plus,
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Heart,
  Share2,
  Globe,
  Zap,
  CheckCircle2,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Recruiting() {
  const [activeTab, setActiveTab] = useState("job-search");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

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

  return (
    <Shell>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Recruiting Hub</h1>
          <p className="text-muted-foreground">Search jobs, gauge interest, and post to job boards.</p>
        </div>
        
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          <Plus className="w-4 h-4 mr-2" /> Create Job Posting
        </Button>
      </div>

      <Tabs defaultValue="job-search" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="bg-card border border-border/50">
          <TabsTrigger value="job-search">Indeed Job Search</TabsTrigger>
          <TabsTrigger value="interest-gauge">Interest Gauge</TabsTrigger>
          <TabsTrigger value="posting-strategy">Posting Strategy</TabsTrigger>
        </TabsList>

        {/* Job Search Tab */}
        <TabsContent value="job-search" className="space-y-6">
          <div className="bg-card/50 border border-border/50 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-1">
                <h2 className="text-lg font-bold font-heading mb-2">Search Indeed for Relevant Jobs</h2>
                <p className="text-sm text-muted-foreground">Find active job postings that match your skill categories. Gauge interest before spending on paid postings.</p>
              </div>
              <Badge className="bg-blue-500/20 text-blue-600">Demo Mode</Badge>
            </div>

            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search: electrician, plumber, carpenter, HVAC..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background/50 border-border/50"
                />
              </div>
              <Button variant="outline" className="border-border/50">Filters</Button>
            </div>

            <div className="grid gap-3">
              {filteredJobs.map(job => (
                <div key={job.id} className="bg-background/50 border border-border/50 rounded-lg p-4 hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold mb-1">{job.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" /> {job.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> {job.salary}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground mb-1">{job.posted}</div>
                      <Badge variant="outline" className="text-xs">Active on Indeed</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-t border-border/50 pt-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Matching Candidates</div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="font-bold">{job.matches}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Interest Level</div>
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
                      onClick={() => handleGaugeInterest(job.id)}
                    >
                      <TrendingUp className="w-3 h-3 mr-1" /> Gauge Interest
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handlePostJob(job.id)}
                    >
                      <Globe className="w-3 h-3 mr-1" /> Post Job
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Interest Gauge Tab */}
        <TabsContent value="interest-gauge" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* How It Works */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  How Interest Gauging Works
                </CardTitle>
                <CardDescription>Reduce spending before committing to paid postings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                    <div>
                      <div className="font-semibold text-sm">Search Indeed</div>
                      <p className="text-xs text-muted-foreground">Find the jobs you want to fill</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                    <div>
                      <div className="font-semibold text-sm">Gauge Interest</div>
                      <p className="text-xs text-muted-foreground">We scan your candidate pool for matches</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                    <div>
                      <div className="font-semibold text-sm">See Interest Level</div>
                      <p className="text-xs text-muted-foreground">Know if candidates exist before posting</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                    <div>
                      <div className="font-semibold text-sm">Post or Skip</div>
                      <p className="text-xs text-muted-foreground">Only pay for jobs with candidate demand</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm">
                  <p className="text-xs font-semibold text-blue-600 mb-1">✓ Smart Recruiting</p>
                  <p className="text-xs text-blue-600/80">Avoid wasted ad spend. Post only when you know candidates are ready.</p>
                </div>
              </CardContent>
            </Card>

            {/* Example Results */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Example: Licensed Electrician
                </CardTitle>
                <CardDescription>Showing data from candidate pool analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold">Matching Candidates</span>
                      <span className="text-xs text-muted-foreground">12 candidates</span>
                    </div>
                    <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: "80%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold">Expressed Interest</span>
                      <span className="text-xs text-muted-foreground">8/12 (67%)</span>
                    </div>
                    <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden">
                      <div className="bg-pink-500 h-full" style={{ width: "67%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold">Available for Work</span>
                      <span className="text-xs text-muted-foreground">6/8 (75%)</span>
                    </div>
                    <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden">
                      <div className="bg-green-500 h-full" style={{ width: "75%" }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-sm">
                  <p className="text-xs font-semibold text-green-600 mb-1">✓ Good to Post</p>
                  <p className="text-xs text-green-600/80">High interest + availability. Recommend posting this job now.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Posting Strategy Tab */}
        <TabsContent value="posting-strategy" className="space-y-6">
          <div className="bg-card/50 border border-border/50 rounded-lg p-6 backdrop-blur-sm">
            <h2 className="text-lg font-bold font-heading mb-4">Job Board Strategy</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card className="bg-background/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-sm">Indeed</h3>
                      <p className="text-xs text-muted-foreground">Largest job board for trades</p>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-600">Active</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1 mb-3">
                    <p>✓ Post after gauging interest</p>
                    <p>✓ ~$30-100 per posting</p>
                    <p>✓ Avg 2-3 days to fill</p>
                  </div>
                  <Button size="sm" variant="outline" className="w-full">Setup Indeed Integration</Button>
                </CardContent>
              </Card>

              <Card className="bg-background/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-sm">LinkedIn Jobs</h3>
                      <p className="text-xs text-muted-foreground">For professional roles</p>
                    </div>
                    <Badge className="bg-slate-500/20 text-slate-600">Coming</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1 mb-3">
                    <p>✓ Professional network</p>
                    <p>✓ Higher candidate quality</p>
                    <p>✓ Integration in progress</p>
                  </div>
                  <Button size="sm" variant="outline" className="w-full" disabled>Coming Soon</Button>
                </CardContent>
              </Card>

              <Card className="bg-background/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-sm">ZipRecruiter</h3>
                      <p className="text-xs text-muted-foreground">Multi-board aggregator</p>
                    </div>
                    <Badge className="bg-slate-500/20 text-slate-600">Coming</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1 mb-3">
                    <p>✓ Posts to 100+ sites</p>
                    <p>✓ Broader reach</p>
                    <p>✓ Integration planned</p>
                  </div>
                  <Button size="sm" variant="outline" className="w-full" disabled>Coming Soon</Button>
                </CardContent>
              </Card>

              <Card className="bg-background/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-sm">Internal Portal</h3>
                      <p className="text-xs text-muted-foreground">Your own job listings</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-600">Ready</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1 mb-3">
                    <p>✓ Always free</p>
                    <p>✓ Shared with candidates</p>
                    <p>✓ Available now</p>
                  </div>
                  <Button size="sm" className="w-full">View All Postings</Button>
                </CardContent>
              </Card>
            </div>

            {/* ROI Calculator */}
            <Card className="bg-background/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Recruiting ROI Tracker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-card rounded-lg p-3">
                    <div className="text-muted-foreground text-xs mb-1">Total Spent This Month</div>
                    <div className="font-bold text-lg">$340</div>
                    <div className="text-xs text-muted-foreground">8 job posts</div>
                  </div>
                  <div className="bg-card rounded-lg p-3">
                    <div className="text-muted-foreground text-xs mb-1">Placements Made</div>
                    <div className="font-bold text-lg text-green-500">12</div>
                    <div className="text-xs text-muted-foreground">5 from Indeed</div>
                  </div>
                  <div className="bg-card rounded-lg p-3">
                    <div className="text-muted-foreground text-xs mb-1">Cost per Placement</div>
                    <div className="font-bold text-lg">$28.33</div>
                    <div className="text-xs text-muted-foreground">vs $35 avg</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </Shell>
  );
}
