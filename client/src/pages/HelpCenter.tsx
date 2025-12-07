import React, { useState, useMemo } from 'react';
import { Search, ExternalLink, HelpCircle, BookOpen, Compass, MessageCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { BentoGrid, BentoTile } from '@/components/ui/bento-grid';
import { CarouselRail, CarouselRailItem } from '@/components/ui/carousel-rail';
import { PageHeader, SectionHeader } from '@/components/ui/section-header';
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardDescription, OrbitCardContent, ActionCard } from '@/components/ui/orbit-card';
import { Input } from '@/components/ui/input';

const SCENARIO_MAP: Record<string, string> = {
  "📄": "/images/scenarios/employee_reviewing_tax_documents.png",
  "💰": "/images/scenarios/diverse_workers_checking_wages.png",
  "📍": "/images/scenarios/multi-industry_gps_clock-in.png",
  "🏆": "/images/scenarios/team_celebrating_bonuses.png",
  "🛠️": "/images/scenarios/diverse_workers_shift_prep.png",
  "📅": "/images/scenarios/employee_viewing_work_calendar.png",
  "🤝": "/images/scenarios/coworkers_referral_handshake.png",
  "💳": "/images/scenarios/payroll_processing_scene.png",
  "✅": "/images/scenarios/compliance_verification_interview.png",
  "🎯": "/images/scenarios/worker_matching_on_screen.png",
  "📋": "/images/scenarios/professional_creating_invoices.png",
  "⚠️": "/images/scenarios/safety_incident_meeting.png",
  "🔐": "/images/scenarios/security_verification_process.png",
  "🔗": "/images/scenarios/it_system_integration.png",
  "👤": "/images/scenarios/workers_updating_profiles.png",
  "📊": "/images/scenarios/worker_matching_on_screen.png",
  "👥": "/images/scenarios/diverse_workers_shift_prep.png",
  "🏢": "/images/scenarios/professional_creating_invoices.png",
  "📚": "/images/scenarios/employee_reviewing_tax_documents.png",
  "🔍": "/images/scenarios/worker_matching_on_screen.png",
  "💡": "/images/scenarios/it_system_integration.png",
};

interface HelpTopic {
  keywords: string[];
  title: string;
  description: string;
  route: string;
  icon: string;
  category: string;
}

const HELP_TOPICS: HelpTopic[] = [
  {
    keywords: ["w-2", "tax form", "1099", "tax document", "paystub"],
    title: "Tax Documents & Paystubs",
    description: "Access your W-2s, 1099s, paystubs, and tax forms",
    route: "/worker/payroll-portal",
    icon: "📄",
    category: "Documents"
  },
  {
    keywords: ["prevailing wage", "wage rate", "hourly rate", "compensation"],
    title: "Prevailing Wage & Rates",
    description: "View prevailing wage requirements and job rates",
    route: "/admin/compliance",
    icon: "💰",
    category: "Wages"
  },
  {
    keywords: ["gps", "clock in", "clock out", "check-in", "timesheet"],
    title: "GPS Check-In & Time Tracking",
    description: "Clock in/out with GPS verification and track your hours",
    route: "/gps-clock-in",
    icon: "📍",
    category: "Time"
  },
  {
    keywords: ["bonus", "earnings", "loyalty", "rewards", "payment"],
    title: "Bonuses & Earnings",
    description: "Track bonuses, loyalty rewards, and earnings history",
    route: "/worker-bonuses",
    icon: "🏆",
    category: "Wages"
  },
  {
    keywords: ["shift", "assignment", "job", "work", "available"],
    title: "Shifts & Assignments",
    description: "View, accept, or decline available job shifts",
    route: "/worker-shifts",
    icon: "🛠️",
    category: "Work"
  },
  {
    keywords: ["availability", "calendar", "schedule", "when i work"],
    title: "Availability Calendar",
    description: "Set your work availability and schedule preferences",
    route: "/worker-availability",
    icon: "📅",
    category: "Time"
  },
  {
    keywords: ["referral", "refer friend", "share", "bonus referral"],
    title: "Referral Program",
    description: "Refer friends and earn referral bonuses ($100 per worker, $50 public)",
    route: "/worker-referrals",
    icon: "🤝",
    category: "Benefits"
  },
  {
    keywords: ["payroll", "pay", "payment", "deposit", "direct deposit"],
    title: "Payroll & Payments",
    description: "Manage payment methods and view payroll processing",
    route: "/admin/payroll-dashboard",
    icon: "💳",
    category: "Wages"
  },
  {
    keywords: ["compliance", "background check", "drug test", "i-9", "verification"],
    title: "Compliance & Verification",
    description: "Track background checks, drug tests, and I-9 verification",
    route: "/worker/compliance",
    icon: "✅",
    category: "Documents"
  },
  {
    keywords: ["worker match", "matching", "assign worker", "find worker"],
    title: "Worker Matching & Assignment",
    description: "Smart matching system for assigning workers to jobs",
    route: "/admin/worker-matching",
    icon: "🎯",
    category: "Work"
  },
  {
    keywords: ["invoice", "billing", "bill customer", "csa", "contract"],
    title: "Invoicing & CSA",
    description: "Create invoices, manage CSAs, and track customer agreements",
    route: "/clients",
    icon: "📋",
    category: "Documents"
  },
  {
    keywords: ["incident", "safety", "emergency", "report issue", "problem"],
    title: "Incident Reporting",
    description: "Report workplace incidents, safety issues, or emergencies",
    route: "/incident-reporting",
    icon: "⚠️",
    category: "Safety"
  },
  {
    keywords: ["hallmark", "asset", "verify", "authenticity", "certification"],
    title: "Hallmark Registry",
    description: "Verify hallmark numbers and asset authenticity",
    route: "/hallmark-registry",
    icon: "🔐",
    category: "Security"
  },
  {
    keywords: ["oauth", "integration", "connect", "quickbooks", "stripe", "paypal"],
    title: "Business System Integrations",
    description: "Connect external systems like QuickBooks, Stripe, ADP, and more",
    route: "/oauth/wizard",
    icon: "🔗",
    category: "Settings"
  },
  {
    keywords: ["profile", "account", "settings", "update info", "password"],
    title: "Profile & Settings",
    description: "Update your profile, account settings, and preferences",
    route: "/worker",
    icon: "👤",
    category: "Settings"
  },
  {
    keywords: ["dashboard", "home", "overview", "analytics", "stats"],
    title: "Dashboard & Analytics",
    description: "View dashboards, analytics, and business overview",
    route: "/dashboard",
    icon: "📊",
    category: "Reports"
  },
  {
    keywords: ["workers", "candidates", "employees", "talent pool", "roster"],
    title: "Worker Management",
    description: "Manage workers, candidates, and talent pool",
    route: "/candidates",
    icon: "👥",
    category: "Work"
  },
  {
    keywords: ["clients", "customer", "business", "accounts"],
    title: "Client Management",
    description: "Manage client relationships and accounts",
    route: "/clients",
    icon: "🏢",
    category: "Business"
  }
];

interface FeaturedGuide {
  title: string;
  description: string;
  steps: string[];
  icon: string;
}

const FEATURED_GUIDES: FeaturedGuide[] = [
  {
    title: "Get Your First Paycheck",
    description: "Complete guide from signup to getting paid",
    icon: "💰",
    steps: [
      "Sign up with your phone number",
      "Complete ID verification",
      "Set your availability in the calendar",
      "Accept a shift when available",
      "Clock in with GPS on job day",
      "Clock out when finished",
      "Get paid same day via ORBIT Card"
    ]
  },
  {
    title: "Maximize Your Bonuses",
    description: "How to earn weekly and loyalty bonuses",
    icon: "🏆",
    steps: [
      "Weekly Bonus: $35/week after 2 perfect weeks",
      "Loyalty Tiers: Earn up to $5,000/year",
      "Perfect Week = All shifts completed on time",
      "Check your bonus progress in the Bonuses tab",
      "Bonuses paid with your regular paycheck"
    ]
  },
  {
    title: "How GPS Check-In Works",
    description: "Understanding GPS verification and geofencing",
    icon: "📍",
    steps: [
      "Job location has 300ft geofence radius",
      "Tap 'Clock In' when you arrive",
      "GPS verifies you're within the geofence",
      "If too far away, you'll see the distance",
      "Tap 'Clock Out' when done"
    ]
  },
  {
    title: "Using Your Availability",
    description: "Set when you're available to work",
    icon: "📅",
    steps: [
      "Go to Availability → 2-Week Calendar",
      "Green = Available, Gray = Not available",
      "Click day to toggle availability",
      "Set recurring patterns",
      "More availability = More shift offers"
    ]
  },
  {
    title: "Finding Your Tax Documents",
    description: "Access W-2s, 1099s, and paystubs",
    icon: "📄",
    steps: [
      "Go to Worker Portal → Payroll",
      "Select the year for your tax documents",
      "View W-2 or 1099 (depends on worker type)",
      "Download as PDF for your records",
      "Tax forms sent by January 31st each year"
    ]
  }
];

const CATEGORIES = [
  { name: "All", icon: "🏠" },
  { name: "Documents", icon: "📄" },
  { name: "Wages", icon: "💰" },
  { name: "Time", icon: "⏰" },
  { name: "Work", icon: "🛠️" },
  { name: "Benefits", icon: "🎁" },
  { name: "Settings", icon: "⚙️" },
  { name: "Safety", icon: "🛡️" },
];

export default function HelpCenterPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTopics = useMemo(() => {
    let results = HELP_TOPICS;
    
    if (selectedCategory !== 'All') {
      results = results.filter(topic => topic.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(topic =>
        topic.keywords.some(kw => kw.includes(query) || query.includes(kw)) ||
        topic.title.toLowerCase().includes(query) ||
        topic.description.toLowerCase().includes(query)
      );
    }
    
    return results;
  }, [searchQuery, selectedCategory]);

  const handleTopicClick = (route: string) => {
    setLocation(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Help Center"
          subtitle="Find answers, guides, and resources to help you navigate the platform"
          actions={
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-cyan-400" />
              <span className="text-sm text-slate-400">Need more help? Contact support</span>
            </div>
          }
        />

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search for help topics (W-2, GPS, payroll, bonuses...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-800/80 border-slate-700 rounded-xl text-white placeholder-slate-400 focus:border-cyan-500"
            data-testid="input-help-search"
          />
        </div>

        <div className="mb-8 md:hidden">
          <CarouselRail gap="sm" itemWidth="auto">
            {CATEGORIES.map((cat) => (
              <CarouselRailItem key={cat.name}>
                <button
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.name
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  data-testid={`category-${cat.name.toLowerCase()}`}
                >
                  <span className="mr-1">{cat.icon}</span>
                  {cat.name}
                </button>
              </CarouselRailItem>
            ))}
          </CarouselRail>
        </div>

        <div className="hidden md:flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat.name
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
              data-testid={`category-${cat.name.toLowerCase()}`}
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        <SectionHeader
          title="Quick Start Guides"
          subtitle="Step-by-step tutorials to help you get started"
          eyebrow="Featured"
          size="md"
        />

        <CarouselRail 
          gap="md" 
          itemWidth="lg"
          showArrows={true}
          className="mb-10"
        >
          {FEATURED_GUIDES.map((guide, idx) => (
            <CarouselRailItem key={idx}>
              <OrbitCard variant="default" className="w-80 h-full">
                {SCENARIO_MAP[guide.icon] && (
                  <div className="-mx-4 -mt-4 md:-mx-5 md:-mt-5 mb-4 overflow-hidden rounded-t-xl">
                    <img 
                      src={`${SCENARIO_MAP[guide.icon]}?v=2`} 
                      alt="" 
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}
                <OrbitCardHeader icon={<span className="text-2xl">{guide.icon}</span>}>
                  <OrbitCardTitle>{guide.title}</OrbitCardTitle>
                  <OrbitCardDescription>{guide.description}</OrbitCardDescription>
                </OrbitCardHeader>
                <OrbitCardContent>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {guide.steps.slice(0, 4).map((step, stepIdx) => (
                      <li key={stepIdx} className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-0.5">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                    {guide.steps.length > 4 && (
                      <li className="text-cyan-400 text-xs">+{guide.steps.length - 4} more steps</li>
                    )}
                  </ul>
                </OrbitCardContent>
              </OrbitCard>
            </CarouselRailItem>
          ))}
        </CarouselRail>

        <SectionHeader
          title="Help Topics"
          subtitle={filteredTopics.length === 0 
            ? "No topics found matching your search"
            : `${filteredTopics.length} topics available`}
          eyebrow="Browse"
          size="md"
        />

        {filteredTopics.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No help topics found. Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <BentoGrid cols={3} gap="md">
            {filteredTopics.map((topic, idx) => (
              <BentoTile key={idx}>
                <ActionCard
                  title={topic.title}
                  description={topic.description}
                  icon={<span className="text-xl">{topic.icon}</span>}
                  onClick={() => handleTopicClick(topic.route)}
                  className="h-full border-0 bg-transparent hover:bg-slate-800/50"
                  data-testid={`help-topic-${idx}`}
                />
              </BentoTile>
            ))}
          </BentoGrid>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <OrbitCard variant="glass" className="text-center">
            <div className="p-4">
              <BookOpen className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-1">Documentation</h3>
              <p className="text-sm text-slate-400">Read our comprehensive guides</p>
            </div>
          </OrbitCard>
          <OrbitCard variant="glass" className="text-center">
            <div className="p-4">
              <Compass className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-1">Tutorials</h3>
              <p className="text-sm text-slate-400">Step-by-step video guides</p>
            </div>
          </OrbitCard>
          <OrbitCard variant="glass" className="text-center">
            <div className="p-4">
              <MessageCircle className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-1">Contact Support</h3>
              <p className="text-sm text-slate-400">Get help from our team</p>
            </div>
          </OrbitCard>
        </div>
      </div>
    </div>
  );
}
