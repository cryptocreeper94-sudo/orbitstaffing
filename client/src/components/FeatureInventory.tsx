import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ChevronDown, ChevronRight, ExternalLink, Rocket } from "lucide-react";

interface FeatureItem {
  id: string;
  name: string;
  description: string;
  status: "complete" | "partial" | "planned";
  route?: string;
}

interface FeatureCategory {
  name: string;
  icon: string;
  color: string;
  features: FeatureItem[];
}

const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    name: "Authentication & Access",
    icon: "🔐",
    color: "purple",
    features: [
      { id: "auth-1", name: "Multi-Tenant Login", description: "Secure login with tenant isolation", status: "complete", route: "/login" },
      { id: "auth-2", name: "Role-Based Access Control", description: "Admin, Manager, Worker permission levels", status: "complete" },
      { id: "auth-3", name: "PIN-Protected Dev Access", description: "Development dashboard with PIN gate", status: "complete", route: "/dev-dashboard" },
      { id: "auth-4", name: "Sandbox Mode System", description: "Test environment with simulated data", status: "complete" },
      { id: "auth-5", name: "Session Management", description: "Secure session handling with express-session", status: "complete" },
    ]
  },
  {
    name: "Talent Exchange Marketplace",
    icon: "💼",
    color: "cyan",
    features: [
      { id: "talent-1", name: "Job Board", description: "Post and browse job listings", status: "complete", route: "/job-board" },
      { id: "talent-2", name: "Worker Profiles", description: "Skill-based worker profiles with ratings", status: "complete", route: "/talent-pool" },
      { id: "talent-3", name: "Smart Matching", description: "AI-powered job-worker matching", status: "complete" },
      { id: "talent-4", name: "Application Tracking", description: "Track job applications and status", status: "complete" },
      { id: "talent-5", name: "Employer Dashboard", description: "Manage postings and view candidates", status: "complete", route: "/employer-dashboard" },
    ]
  },
  {
    name: "Payroll & Payments",
    icon: "💰",
    color: "green",
    features: [
      { id: "pay-1", name: "Payroll Processing", description: "Automated payroll calculations", status: "complete", route: "/payroll" },
      { id: "pay-2", name: "Timesheet Approval", description: "Review and approve worker hours", status: "complete", route: "/timesheet-approval" },
      { id: "pay-3", name: "Invoice Generation", description: "Generate client invoices automatically", status: "complete", route: "/invoices" },
      { id: "pay-4", name: "ORBIT Pay Card", description: "Branded Visa debit card for instant pay", status: "partial", route: "/pay-card" },
      { id: "pay-5", name: "Stripe Integration", description: "Credit card and ACH payments", status: "complete" },
      { id: "pay-6", name: "Crypto Wallet", description: "Solana-based cryptocurrency payments", status: "complete", route: "/crypto-wallet" },
      { id: "pay-7", name: "Creditor Routing", description: "Auto-split payments to creditors", status: "complete", route: "/creditor-routing" },
    ]
  },
  {
    name: "Compliance & Documents",
    icon: "📋",
    color: "amber",
    features: [
      { id: "comp-1", name: "Compliance Dashboard", description: "Track I-9, certifications, background checks", status: "complete", route: "/compliance" },
      { id: "comp-2", name: "Background Check Integration", description: "Checkr API for background screening", status: "partial" },
      { id: "comp-3", name: "Drug Testing", description: "Quest Diagnostics integration", status: "partial" },
      { id: "comp-4", name: "Document Verification", description: "Solana blockchain-verified documents", status: "complete" },
      { id: "comp-5", name: "State-Specific Rules", description: "TN/KY compliance configurations", status: "complete" },
      { id: "comp-6", name: "Prevailing Wage", description: "Davis-Bacon prevailing wage tracking", status: "complete" },
    ]
  },
  {
    name: "Time & Attendance",
    icon: "⏰",
    color: "blue",
    features: [
      { id: "time-1", name: "GPS Clock-In/Out", description: "Geofenced time tracking", status: "complete", route: "/gps-clock" },
      { id: "time-2", name: "Photo Verification", description: "Selfie verification at clock-in", status: "complete" },
      { id: "time-3", name: "Break Tracking", description: "Track meal and rest breaks", status: "complete" },
      { id: "time-4", name: "Overtime Calculations", description: "Automatic OT calculation by state", status: "complete" },
      { id: "time-5", name: "Timesheet Management", description: "View and edit worker timesheets", status: "complete" },
    ]
  },
  {
    name: "CRM & Communications",
    icon: "📞",
    color: "pink",
    features: [
      { id: "crm-1", name: "Client Management", description: "Track clients and contacts", status: "complete", route: "/clients" },
      { id: "crm-2", name: "Lead Pipeline", description: "Sales funnel tracking", status: "complete" },
      { id: "crm-3", name: "SMS Notifications", description: "Twilio-powered text messaging", status: "partial" },
      { id: "crm-4", name: "Email Campaigns", description: "Marketing email automation", status: "planned" },
      { id: "crm-5", name: "Activity Logging", description: "Track all client interactions", status: "complete" },
    ]
  },
  {
    name: "White-Label & Franchise",
    icon: "🏢",
    color: "indigo",
    features: [
      { id: "wl-1", name: "Custom Branding", description: "Logo, colors, domain customization", status: "complete", route: "/settings/branding" },
      { id: "wl-2", name: "Franchise Management", description: "Multi-location franchise support", status: "complete", route: "/franchise" },
      { id: "wl-3", name: "Hallmark System", description: "Orby-based verification hallmarks", status: "complete" },
      { id: "wl-4", name: "White-Label Mobile Apps", description: "Branded iOS/Android apps", status: "partial" },
      { id: "wl-5", name: "Territory Management", description: "Geographic franchise zones", status: "complete" },
    ]
  },
  {
    name: "Pricing & Billing",
    icon: "💳",
    color: "emerald",
    features: [
      { id: "price-1", name: "SaaS Pricing Tiers", description: "Starter, Growth, Professional, Enterprise", status: "complete", route: "/pricing" },
      { id: "price-2", name: "Standalone Tools", description: "Individual tool subscriptions", status: "complete" },
      { id: "price-3", name: "Usage-Based Billing", description: "Per-worker and per-transaction billing", status: "complete" },
      { id: "price-4", name: "Subscription Management", description: "Manage plan upgrades/downgrades", status: "complete" },
      { id: "price-5", name: "Affiliate Program", description: "MLM referral and commission system", status: "complete", route: "/affiliate" },
    ]
  },
  {
    name: "AI & Automation",
    icon: "🤖",
    color: "violet",
    features: [
      { id: "ai-1", name: "Orby AI Assistant", description: "OpenAI-powered chat assistant", status: "complete" },
      { id: "ai-2", name: "Smart Job Matching", description: "AI-based worker recommendations", status: "complete" },
      { id: "ai-3", name: "Automated Onboarding", description: "Deadline enforcement and reminders", status: "complete" },
      { id: "ai-4", name: "Payroll Automation", description: "Scheduled automatic payroll runs", status: "complete" },
      { id: "ai-5", name: "Compliance Alerts", description: "Proactive expiration warnings", status: "complete" },
    ]
  },
  {
    name: "Portals & Dashboards",
    icon: "📊",
    color: "teal",
    features: [
      { id: "portal-1", name: "Admin Dashboard", description: "Master admin control center", status: "complete", route: "/admin" },
      { id: "portal-2", name: "Employee Hub", description: "Worker self-service portal", status: "complete", route: "/employee-hub" },
      { id: "portal-3", name: "Owner Hub", description: "Franchise owner dashboard", status: "complete", route: "/owner-hub" },
      { id: "portal-4", name: "Client Portal", description: "Client self-service interface", status: "complete" },
      { id: "portal-5", name: "Analytics & Reports", description: "Business intelligence dashboards", status: "complete", route: "/analytics" },
    ]
  },
  {
    name: "Premium UI/UX",
    icon: "✨",
    color: "orange",
    features: [
      { id: "ui-1", name: "Dark Industrial Theme", description: "Professional dark mode with cyan accents", status: "complete" },
      { id: "ui-2", name: "Floating Orby Mascot", description: "Animated AI assistant character", status: "complete" },
      { id: "ui-3", name: "Premium Animations", description: "Card lift, button squish, page transitions", status: "complete" },
      { id: "ui-4", name: "Skeleton Loaders", description: "Shimmer loading states", status: "complete" },
      { id: "ui-5", name: "Mobile Optimization", description: "Touch-friendly responsive design", status: "complete" },
      { id: "ui-6", name: "HD Weather Radar", description: "Interactive weather visualization", status: "complete", route: "/weather" },
    ]
  },
  {
    name: "Integrations",
    icon: "🔗",
    color: "red",
    features: [
      { id: "int-1", name: "QuickBooks", description: "Accounting sync", status: "planned" },
      { id: "int-2", name: "Indeed/LinkedIn", description: "Job board posting", status: "planned" },
      { id: "int-3", name: "Stripe", description: "Payment processing", status: "complete" },
      { id: "int-4", name: "Solana Blockchain", description: "Document verification", status: "complete" },
      { id: "int-5", name: "Twilio", description: "SMS messaging", status: "partial" },
      { id: "int-6", name: "OpenAI", description: "AI assistant", status: "complete" },
    ]
  },
];

const PUBLISH_LOG = [
  { version: "1.0.0", date: "2025-10-15", time: "09:00 CST", notes: "Initial ORBIT Staffing OS release" },
  { version: "1.5.0", date: "2025-11-01", time: "14:30 CST", notes: "Added Talent Exchange marketplace" },
  { version: "2.0.0", date: "2025-11-15", time: "10:00 CST", notes: "Franchise & white-label capabilities" },
  { version: "2.2.0", date: "2025-11-22", time: "16:00 CST", notes: "Solana blockchain integration, crypto wallet" },
  { version: "2.3.0", date: "2025-11-28", time: "11:00 CST", notes: "ORBIT Pay Card waitlist, Orby AI assistant" },
  { version: "2.4.0", date: "2025-11-30", time: "13:00 CST", notes: "Sandbox mode, hallmark system" },
  { version: "2.5.0", date: "2025-12-01", time: "18:00 CST", notes: "Premium UI/UX maxed out, animations system" },
  { version: "2.5.1", date: "2025-12-03", time: "08:00 CST", notes: "Mobile carousel polish, emergency runbook access, link fixes" },
];

function FeatureInventory() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(FEATURE_CATEGORIES.map(c => c.name));
  const [checkedFeatures, setCheckedFeatures] = useState<string[]>(() => {
    const saved = localStorage.getItem('orbit_feature_checklist');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleCategory = (name: string) => {
    setExpandedCategories(prev => prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]);
  };

  const toggleFeature = (id: string) => {
    setCheckedFeatures(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('orbit_feature_checklist', JSON.stringify(next));
      return next;
    });
  };

  const totalFeatures = FEATURE_CATEGORIES.reduce((sum, cat) => sum + cat.features.length, 0);
  const completedFeatures = FEATURE_CATEGORIES.reduce((sum, cat) => sum + cat.features.filter(f => f.status === "complete").length, 0);
  const partialFeatures = FEATURE_CATEGORIES.reduce((sum, cat) => sum + cat.features.filter(f => f.status === "partial").length, 0);

  const colorMap: Record<string, string> = {
    purple: "from-purple-600 to-purple-800 border-purple-500",
    blue: "from-blue-600 to-blue-800 border-blue-500",
    green: "from-green-600 to-green-800 border-green-500",
    red: "from-red-600 to-red-800 border-red-500",
    amber: "from-amber-600 to-amber-800 border-amber-500",
    cyan: "from-cyan-600 to-cyan-800 border-cyan-500",
    pink: "from-pink-600 to-pink-800 border-pink-500",
    teal: "from-teal-600 to-teal-800 border-teal-500",
    orange: "from-orange-600 to-orange-800 border-orange-500",
    emerald: "from-emerald-600 to-emerald-800 border-emerald-500",
    indigo: "from-indigo-600 to-indigo-800 border-indigo-500",
    violet: "from-violet-600 to-violet-800 border-violet-500",
  };

  return (
    <div className="space-y-4 overflow-x-hidden">
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
        <Card className="bg-gradient-to-br from-emerald-900 to-emerald-800 border-emerald-500 overflow-hidden">
          <CardContent className="p-2 sm:p-4 text-center">
            <div className="text-xl sm:text-3xl font-bold text-white">{totalFeatures}</div>
            <div className="text-emerald-200 text-[10px] sm:text-xs truncate">Total</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-500 overflow-hidden">
          <CardContent className="p-2 sm:p-4 text-center">
            <div className="text-xl sm:text-3xl font-bold text-white">{completedFeatures}</div>
            <div className="text-green-200 text-[10px] sm:text-xs truncate">Built</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-900 to-yellow-800 border-yellow-500 overflow-hidden">
          <CardContent className="p-2 sm:p-4 text-center">
            <div className="text-xl sm:text-3xl font-bold text-white">{partialFeatures}</div>
            <div className="text-yellow-200 text-[10px] sm:text-xs truncate">WIP</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-500 overflow-hidden">
          <CardContent className="p-2 sm:p-4 text-center">
            <div className="text-xl sm:text-3xl font-bold text-white">{checkedFeatures.length}</div>
            <div className="text-blue-200 text-[10px] sm:text-xs truncate">Verified</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-500 overflow-hidden">
          <CardContent className="p-2 sm:p-4 text-center">
            <div className="text-xl sm:text-3xl font-bold text-white">{PUBLISH_LOG.length}</div>
            <div className="text-purple-200 text-[10px] sm:text-xs truncate">Publishes</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-slate-100 flex items-center gap-2 text-base">
            <Rocket className="h-5 w-5 text-cyan-400" />
            ORBIT Publish History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {[...PUBLISH_LOG].reverse().map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 sm:gap-3 p-2 bg-slate-800/50 rounded-lg border border-slate-700/50 overflow-hidden">
                <div className="text-center min-w-[60px] sm:min-w-[80px] flex-shrink-0">
                  <div className="text-cyan-400 font-mono text-xs sm:text-sm font-bold">{log.version}</div>
                  <div className="text-slate-500 text-[9px] sm:text-[10px]">{log.date}</div>
                  <div className="text-slate-500 text-[9px] sm:text-[10px] hidden sm:block">{log.time}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 text-xs sm:text-sm break-words">{log.notes}</p>
                </div>
                {idx === 0 && <Badge className="bg-green-600 text-white text-[10px]">LATEST</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {FEATURE_CATEGORIES.map((category) => (
          <Card key={category.name} className={`bg-gradient-to-br ${colorMap[category.color]} border overflow-hidden`}>
            <CardHeader className="pb-2 px-3 sm:px-6 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => toggleCategory(category.name)}>
              <CardTitle className="text-white flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                  <span className="text-base sm:text-lg flex-shrink-0">{category.icon}</span>
                  <span className="truncate">{category.name}</span>
                  <Badge variant="outline" className="text-white/80 border-white/30 text-[9px] sm:text-[10px] ml-1 flex-shrink-0">
                    {category.features.filter(f => checkedFeatures.includes(f.id)).length}/{category.features.length}
                  </Badge>
                </div>
                {expandedCategories.includes(category.name) ? <ChevronDown className="h-4 w-4 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 flex-shrink-0" />}
              </CardTitle>
            </CardHeader>
            {expandedCategories.includes(category.name) && (
              <CardContent className="pt-0 px-2 sm:px-6 pb-3">
                <div className="space-y-1.5">
                  {category.features.map((feature) => (
                    <div 
                      key={feature.id} 
                      className={`flex items-start gap-2 p-2 rounded-lg transition-all cursor-pointer overflow-hidden ${checkedFeatures.includes(feature.id) ? 'bg-green-900/40 border border-green-500/50' : 'bg-black/20 hover:bg-black/30'}`} 
                      onClick={() => toggleFeature(feature.id)}
                      data-testid={`feature-${feature.id}`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {checkedFeatures.includes(feature.id) ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Circle className="h-4 w-4 text-white/40" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1">
                          <span className={`text-xs sm:text-sm font-medium truncate ${checkedFeatures.includes(feature.id) ? 'text-green-200' : 'text-white'}`}>{feature.name}</span>
                          {feature.status === "complete" && <Badge className="bg-green-600/80 text-[8px] sm:text-[9px] px-1 py-0">BUILT</Badge>}
                          {feature.status === "partial" && <Badge className="bg-yellow-600/80 text-[8px] sm:text-[9px] px-1 py-0">PARTIAL</Badge>}
                          {feature.status === "planned" && <Badge className="bg-blue-600/80 text-[8px] sm:text-[9px] px-1 py-0">PLANNED</Badge>}
                        </div>
                        <p className="text-white/60 text-[10px] sm:text-xs mt-0.5 line-clamp-2">{feature.description}</p>
                      </div>
                      {feature.route && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10 flex-shrink-0" 
                          onClick={(e) => { e.stopPropagation(); window.location.href = feature.route!; }}
                          data-testid={`button-goto-${feature.id}`}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="text-slate-400 text-[10px] sm:text-xs">
          Powered by ORBIT v2.5.0
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-slate-400 border-slate-600 hover:bg-slate-800" 
          onClick={() => { setCheckedFeatures([]); localStorage.removeItem('orbit_feature_checklist'); }}
          data-testid="button-reset-checklist"
        >
          Reset Checklist
        </Button>
      </div>
    </div>
  );
}

export { FeatureInventory };
