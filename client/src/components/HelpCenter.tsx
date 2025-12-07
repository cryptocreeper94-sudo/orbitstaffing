import React, { useState, useMemo } from 'react';
import { Search, X, ExternalLink, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

function ScenarioImage({ emoji }: { emoji: string }) {
  const imagePath = SCENARIO_MAP[emoji];
  
  if (imagePath) {
    return (
      <div className="w-full h-32 overflow-hidden rounded-t-lg">
        <img 
          src={`${imagePath}?v=1`} 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
    );
  }
  return null;
}

function Icon3D({ emoji, size = "md" }: { emoji: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = { sm: "w-4 h-4 text-sm", md: "w-6 h-6 text-base", lg: "w-10 h-10 text-2xl" };
  return <span className={sizeClasses[size]}>{emoji}</span>;
}

interface HelpTopic {
  keywords: string[];
  title: string;
  description: string;
  route: string;
  icon: string;
}

const HELP_TOPICS: HelpTopic[] = [
  {
    keywords: ["w-2", "tax form", "1099", "tax document", "paystub"],
    title: "Tax Documents & Paystubs",
    description: "Access your W-2s, 1099s, paystubs, and tax forms",
    route: "/worker/payroll-portal",
    icon: "📄"
  },
  {
    keywords: ["prevailing wage", "wage rate", "hourly rate", "compensation"],
    title: "Prevailing Wage & Rates",
    description: "View prevailing wage requirements and job rates",
    route: "/admin/compliance",
    icon: "💰"
  },
  {
    keywords: ["gps", "clock in", "clock out", "check-in", "timesheet"],
    title: "GPS Check-In & Time Tracking",
    description: "Clock in/out with GPS verification and track your hours",
    route: "/gps-clock-in",
    icon: "📍"
  },
  {
    keywords: ["bonus", "earnings", "loyalty", "rewards", "payment"],
    title: "Bonuses & Earnings",
    description: "Track bonuses, loyalty rewards, and earnings history",
    route: "/worker-bonuses",
    icon: "🏆"
  },
  {
    keywords: ["shift", "assignment", "job", "work", "available"],
    title: "Shifts & Assignments",
    description: "View, accept, or decline available job shifts",
    route: "/worker-shifts",
    icon: "🛠️"
  },
  {
    keywords: ["availability", "calendar", "schedule", "when i work"],
    title: "Availability Calendar",
    description: "Set your work availability and schedule preferences",
    route: "/worker-availability",
    icon: "📅"
  },
  {
    keywords: ["referral", "refer friend", "share", "bonus referral"],
    title: "Referral Program",
    description: "Refer friends and earn referral bonuses ($100 per worker, $50 public)",
    route: "/worker-referrals",
    icon: "🤝"
  },
  {
    keywords: ["payroll", "pay", "payment", "deposit", "direct deposit"],
    title: "Payroll & Payments",
    description: "Manage payment methods and view payroll processing",
    route: "/admin/payroll-dashboard",
    icon: "💳"
  },
  {
    keywords: ["compliance", "background check", "drug test", "i-9", "verification"],
    title: "Compliance & Verification",
    description: "Track background checks, drug tests, and I-9 verification",
    route: "/worker/compliance",
    icon: "✅"
  },
  {
    keywords: ["worker match", "matching", "assign worker", "find worker"],
    title: "Worker Matching & Assignment",
    description: "Smart matching system for assigning workers to jobs",
    route: "/admin/worker-matching",
    icon: "🎯"
  },
  {
    keywords: ["invoice", "billing", "bill customer", "csa", "contract"],
    title: "Invoicing & CSA",
    description: "Create invoices, manage CSAs, and track customer agreements",
    route: "/clients",
    icon: "📋"
  },
  {
    keywords: ["incident", "safety", "emergency", "report issue", "problem"],
    title: "Incident Reporting",
    description: "Report workplace incidents, safety issues, or emergencies",
    route: "/incident-reporting",
    icon: "⚠️"
  },
  {
    keywords: ["hallmark", "asset", "verify", "authenticity", "certification"],
    title: "Hallmark Registry",
    description: "Verify hallmark numbers and asset authenticity",
    route: "/hallmark-registry",
    icon: "🔐"
  },
  {
    keywords: ["oauth", "integration", "connect", "quickbooks", "stripe", "paypal"],
    title: "Business System Integrations",
    description: "Connect external systems like QuickBooks, Stripe, ADP, and more",
    route: "/oauth/wizard",
    icon: "🔗"
  },
  {
    keywords: ["profile", "account", "settings", "update info", "password"],
    title: "Profile & Settings",
    description: "Update your profile, account settings, and preferences",
    route: "/worker",
    icon: "👤"
  },
  {
    keywords: ["dashboard", "home", "overview", "analytics", "stats"],
    title: "Dashboard & Analytics",
    description: "View dashboards, analytics, and business overview",
    route: "/dashboard",
    icon: "📊"
  },
  {
    keywords: ["workers", "candidates", "employees", "talent pool", "roster"],
    title: "Worker Management",
    description: "Manage workers, candidates, and talent pool",
    route: "/candidates",
    icon: "👥"
  },
  {
    keywords: ["clients", "customer", "business", "accounts"],
    title: "Client Management",
    description: "Manage client relationships and accounts",
    route: "/clients",
    icon: "🏢"
  }
];

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

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
      "1. Sign up with your phone number",
      "2. Complete ID verification",
      "3. Set your availability in the calendar",
      "4. Accept a shift when available",
      "5. Clock in with GPS on job day",
      "6. Clock out when finished",
      "7. Get paid same day via ORBIT Card"
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
      "Bonuses paid with your regular paycheck",
      "Referral Bonus: $100 per worker (40+ hrs worked)",
      "Public Referral: $50 per worker (80+ hrs worked)"
    ]
  },
  {
    title: "How GPS Check-In Works",
    description: "Understanding GPS verification and geofencing",
    icon: "📍",
    steps: [
      "Job location has 300ft geofence radius",
      "Tap 'Clock In' when you arrive at location",
      "GPS verifies you're within the geofence",
      "If too far away, you'll see the distance",
      "Work your shift normally",
      "Tap 'Clock Out' when done",
      "Timesheet auto-approves if both verified"
    ]
  },
  {
    title: "Using Your Availability Calendar",
    description: "Set when you're available to work",
    icon: "📅",
    steps: [
      "Go to Availability → 2-Week Calendar",
      "Green = Available, Gray = Not available",
      "Click day to toggle availability",
      "Set recurring patterns (e.g., M-F always available)",
      "Update anytime your schedule changes",
      "More availability = More shift offers",
      "System learns your patterns over time"
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
      "Paystubs show: Hours, Rate, Bonuses, Deductions",
      "Direct deposit status shown on each paystub",
      "Tax forms sent by January 31st each year"
    ]
  }
];

export function HelpCenter({ isOpen, onClose }: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'featured' | 'search'>('featured');
  const [currentSlide, setCurrentSlide] = useState(0);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return HELP_TOPICS.slice(0, 5);

    const query = searchQuery.toLowerCase();
    return HELP_TOPICS.filter(topic =>
      topic.keywords.some(kw => kw.includes(query) || query.includes(kw)) ||
      topic.title.toLowerCase().includes(query) ||
      topic.description.toLowerCase().includes(query)
    ).sort((a, b) => {
      const aMatch = a.keywords.some(kw => kw.startsWith(query));
      const bMatch = b.keywords.some(kw => kw.startsWith(query));
      return aMatch === bMatch ? 0 : aMatch ? -1 : 1;
    });
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        data-testid="help-center-overlay"
      />

      {/* Help Center Modal */}
      <div className="fixed right-4 top-4 bottom-4 w-96 bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-500 rounded-xl shadow-2xl flex flex-col z-50 glow-cyan" data-testid="help-center-modal">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            <h3 className="font-bold">Help Center</h3>
          </div>
          <button
            onClick={onClose}
            className="text-cyan-100 hover:text-white text-xl"
            data-testid="button-close-help-center"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-800/50">
          <button
            onClick={() => { setActiveTab('featured'); setCurrentSlide(0); }}
            className={`flex-1 px-4 py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'featured'
                ? 'text-cyan-300 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
            data-testid="tab-featured"
          >
            <Icon3D emoji="📚" size="sm" /> Guides
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 px-4 py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'search'
                ? 'text-cyan-300 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
            data-testid="tab-search"
          >
            <Icon3D emoji="🔍" size="sm" /> Search
          </button>
        </div>

        {/* Featured Guides Carousel */}
        {activeTab === 'featured' && (
          <div className="flex-1 overflow-hidden flex flex-col p-4">
            <div className="relative flex-1 bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-lg border border-slate-600 mb-4 overflow-hidden">
              <ScenarioImage emoji={FEATURED_GUIDES[currentSlide].icon} />
              <div className="p-4 text-center">
                <h4 className="font-bold text-white text-lg mb-1">{FEATURED_GUIDES[currentSlide].title}</h4>
                <p className="text-xs text-slate-300 mb-4">{FEATURED_GUIDES[currentSlide].description}</p>
                <div className="space-y-2 text-xs text-slate-300 text-left max-h-[140px] overflow-y-auto">
                  {FEATURED_GUIDES[currentSlide].steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-400 flex-shrink-0">•</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Carousel Controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + FEATURED_GUIDES.length) % FEATURED_GUIDES.length)}
                className="p-2 hover:bg-slate-700 rounded transition-colors"
                data-testid="button-prev-guide"
              >
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </button>
              <div className="flex gap-1">
                {FEATURED_GUIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentSlide ? 'bg-cyan-400 w-6' : 'bg-slate-600'
                    }`}
                    data-testid={`dot-${idx}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % FEATURED_GUIDES.length)}
                className="p-2 hover:bg-slate-700 rounded transition-colors"
                data-testid="button-next-guide"
              >
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <>
            {/* Search Input */}
            <div className="p-4 border-b border-slate-700">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search (W-2, prevailing wage, GPS...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                  data-testid="input-help-search"
                  autoFocus
                />
              </div>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {searchResults.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm">No results found. Try a different search.</p>
            </div>
          ) : (
            searchResults.map((topic, idx) => (
              <button
                key={idx}
                onClick={() => {
                  window.location.href = topic.route;
                  onClose();
                }}
                className="w-full text-left bg-slate-700/50 hover:bg-slate-600 border border-slate-600 hover:border-cyan-500 rounded-lg transition-all group overflow-hidden"
                data-testid={`help-link-${idx}`}
              >
                <ScenarioImage emoji={topic.icon} />
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {topic.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">{topic.description}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 flex-shrink-0 mt-1" />
                  </div>
                </div>
              </button>
            ))
          )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-700 p-3 bg-slate-900/50 rounded-b-lg text-xs text-slate-400 flex items-center gap-1">
              <Icon3D emoji="💡" size="sm" /> Tip: Search for keywords like "W-2", "GPS", "prevailing wage", or "bonus"
            </div>
          </>
        )}
      </div>
    </>
  );
}

export function FloatingHelpButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-40 flex items-center justify-center group"
        title="Help & Navigation"
        data-testid="button-floating-help"
      >
        <HelpCircle className="w-6 h-6" />
        <div className="absolute -top-10 right-0 bg-slate-900 text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-cyan-500/50">
          Need help?
        </div>
      </button>
      <HelpCenter isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
