import { useState } from "react";
import { useLocation } from "wouter";
import { PageWrapper, ContentSection } from "@/components/ui/page-wrapper";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { CarouselRail, CarouselRailItem } from "@/components/ui/carousel-rail";
import { SectionHeader, PageHeader } from "@/components/ui/section-header";
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardDescription, OrbitCardContent, StatCard } from "@/components/ui/orbit-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Circle, Clock, Zap, Shield, Users, CreditCard, Calendar, MessageSquare, Building, DollarSign, Bot, LayoutDashboard, Sparkles, Link2, ExternalLink, Rocket } from "lucide-react";

interface FeatureItem {
  id: string;
  name: string;
  description: string;
  status: "complete" | "partial" | "planned";
  route?: string;
}

interface FeatureCategory {
  name: string;
  icon: React.ReactNode;
  color: string;
  features: FeatureItem[];
}

const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    name: "Authentication & Access",
    icon: <Shield className="h-5 w-5" />,
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
    icon: <Users className="h-5 w-5" />,
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
    icon: <CreditCard className="h-5 w-5" />,
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
    name: "Time & Attendance",
    icon: <Clock className="h-5 w-5" />,
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
    name: "Compliance & Documents",
    icon: <CheckCircle2 className="h-5 w-5" />,
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
    name: "CRM & Communications",
    icon: <MessageSquare className="h-5 w-5" />,
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
    icon: <Building className="h-5 w-5" />,
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
    icon: <DollarSign className="h-5 w-5" />,
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
    icon: <Bot className="h-5 w-5" />,
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
    icon: <LayoutDashboard className="h-5 w-5" />,
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
    icon: <Sparkles className="h-5 w-5" />,
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
    icon: <Link2 className="h-5 w-5" />,
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

const highlightedFeatures = [
  { id: "gps", name: "GPS Clock-In", description: "Geofenced time tracking with photo verification", icon: <Clock className="h-6 w-6" />, route: "/gps-clock" },
  { id: "payroll", name: "Payroll Processing", description: "Automated calculations with state-specific rules", icon: <CreditCard className="h-6 w-6" />, route: "/payroll" },
  { id: "compliance", name: "Compliance Dashboard", description: "Track I-9, certifications, and background checks", icon: <Shield className="h-6 w-6" />, route: "/compliance" },
  { id: "ai", name: "Orby AI Assistant", description: "OpenAI-powered intelligent helper", icon: <Bot className="h-6 w-6" />, route: "/ai-assistant" },
  { id: "talent", name: "Talent Exchange", description: "Job board and smart worker matching", icon: <Users className="h-6 w-6" />, route: "/talent-pool" },
];

export default function Features() {
  const [, setLocation] = useLocation();
  const [checkedFeatures, setCheckedFeatures] = useState<string[]>(() => {
    const saved = localStorage.getItem('orbit_feature_checklist');
    return saved ? JSON.parse(saved) : [];
  });

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
  const plannedFeatures = FEATURE_CATEGORIES.reduce((sum, cat) => sum + cat.features.filter(f => f.status === "planned").length, 0);

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; border: string; icon: string }> = {
      purple: { bg: "from-purple-900/40 to-slate-900", border: "border-purple-500/30 hover:border-purple-500/60", icon: "text-purple-400" },
      cyan: { bg: "from-cyan-900/40 to-slate-900", border: "border-cyan-500/30 hover:border-cyan-500/60", icon: "text-cyan-400" },
      green: { bg: "from-green-900/40 to-slate-900", border: "border-green-500/30 hover:border-green-500/60", icon: "text-green-400" },
      blue: { bg: "from-blue-900/40 to-slate-900", border: "border-blue-500/30 hover:border-blue-500/60", icon: "text-blue-400" },
      amber: { bg: "from-amber-900/40 to-slate-900", border: "border-amber-500/30 hover:border-amber-500/60", icon: "text-amber-400" },
      pink: { bg: "from-pink-900/40 to-slate-900", border: "border-pink-500/30 hover:border-pink-500/60", icon: "text-pink-400" },
      indigo: { bg: "from-indigo-900/40 to-slate-900", border: "border-indigo-500/30 hover:border-indigo-500/60", icon: "text-indigo-400" },
      emerald: { bg: "from-emerald-900/40 to-slate-900", border: "border-emerald-500/30 hover:border-emerald-500/60", icon: "text-emerald-400" },
      violet: { bg: "from-violet-900/40 to-slate-900", border: "border-violet-500/30 hover:border-violet-500/60", icon: "text-violet-400" },
      teal: { bg: "from-teal-900/40 to-slate-900", border: "border-teal-500/30 hover:border-teal-500/60", icon: "text-teal-400" },
      orange: { bg: "from-orange-900/40 to-slate-900", border: "border-orange-500/30 hover:border-orange-500/60", icon: "text-orange-400" },
      red: { bg: "from-red-900/40 to-slate-900", border: "border-red-500/30 hover:border-red-500/60", icon: "text-red-400" },
    };
    return colorMap[color] || colorMap.cyan;
  };

  return (
    <PageWrapper className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <ContentSection>
          <PageHeader 
            title="Platform Features"
            subtitle="Explore all the capabilities that make ORBIT the complete staffing solution"
            breadcrumb={
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLocation("/")}
                className="text-slate-400 hover:text-white -ml-2"
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            }
            actions={
              <div className="flex items-center gap-3">
                <img 
                  src="/mascot/orbit_mascot_cyan_saturn_style_transparent.png" 
                  alt="Orby" 
                  className="w-12 h-12 animate-float drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                />
              </div>
            }
          />
        </ContentSection>

        <ContentSection delay={0.1}>
          <BentoGrid cols={4} gap="md" className="mb-8">
            <BentoTile className="p-4">
              <StatCard 
                label="Total Features" 
                value={totalFeatures} 
                icon={<Rocket className="h-6 w-6" />}
              />
            </BentoTile>
            <BentoTile className="p-4">
              <StatCard 
                label="Completed" 
                value={completedFeatures} 
                icon={<CheckCircle2 className="h-6 w-6" />}
                trend={{ value: Math.round((completedFeatures / totalFeatures) * 100), positive: true }}
              />
            </BentoTile>
            <BentoTile className="p-4">
              <StatCard 
                label="In Progress" 
                value={partialFeatures} 
                icon={<Zap className="h-6 w-6" />}
              />
            </BentoTile>
            <BentoTile className="p-4">
              <StatCard 
                label="Planned" 
                value={plannedFeatures} 
                icon={<Calendar className="h-6 w-6" />}
              />
            </BentoTile>
          </BentoGrid>
        </ContentSection>

        <ContentSection delay={0.2}>
          <CarouselRail 
            title="Highlighted Features" 
            subtitle="Quick access to our most popular capabilities"
            gap="md"
            itemWidth="lg"
          >
            {highlightedFeatures.map((feature) => (
              <CarouselRailItem key={feature.id}>
                <OrbitCard 
                  variant="action" 
                  className="h-full min-h-[140px] cursor-pointer"
                  onClick={() => setLocation(feature.route)}
                  data-testid={`highlight-${feature.id}`}
                >
                  <OrbitCardHeader icon={<div className="text-cyan-400">{feature.icon}</div>}>
                    <OrbitCardTitle>{feature.name}</OrbitCardTitle>
                    <OrbitCardDescription>{feature.description}</OrbitCardDescription>
                  </OrbitCardHeader>
                </OrbitCard>
              </CarouselRailItem>
            ))}
          </CarouselRail>
        </ContentSection>

        <ContentSection delay={0.3}>
          <SectionHeader 
            eyebrow="Feature Categories"
            title="Complete Feature Inventory"
            subtitle="Browse all features organized by category"
            size="lg"
            action={
              <Button 
                variant="outline" 
                size="sm" 
                className="text-slate-400 border-slate-600 hover:bg-slate-800" 
                onClick={() => { setCheckedFeatures([]); localStorage.removeItem('orbit_feature_checklist'); }}
                data-testid="button-reset-checklist"
              >
                Reset Checklist
              </Button>
            }
          />

          <BentoGrid cols={2} gap="lg">
            {FEATURE_CATEGORIES.map((category) => {
              const colors = getColorClasses(category.color);
              const categoryChecked = category.features.filter(f => checkedFeatures.includes(f.id)).length;
              
              return (
                <BentoTile 
                  key={category.name} 
                  className={`bg-gradient-to-br ${colors.bg} ${colors.border} p-5`}
                >
                  <OrbitCardHeader 
                    icon={<div className={colors.icon}>{category.icon}</div>}
                    action={
                      <Badge variant="outline" className="text-slate-300 border-slate-500">
                        {categoryChecked}/{category.features.length}
                      </Badge>
                    }
                  >
                    <OrbitCardTitle>{category.name}</OrbitCardTitle>
                  </OrbitCardHeader>
                  
                  <OrbitCardContent className="space-y-2 mt-4">
                    {category.features.map((feature) => (
                      <div
                        key={feature.id}
                        className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                          checkedFeatures.includes(feature.id) 
                            ? 'bg-green-900/30 border border-green-500/40' 
                            : 'bg-slate-800/40 hover:bg-slate-700/40 border border-transparent'
                        }`}
                        onClick={() => toggleFeature(feature.id)}
                        data-testid={`feature-${feature.id}`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {checkedFeatures.includes(feature.id) 
                            ? <CheckCircle2 className="h-4 w-4 text-green-400" /> 
                            : <Circle className="h-4 w-4 text-slate-500" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-sm font-medium ${
                              checkedFeatures.includes(feature.id) ? 'text-green-200' : 'text-white'
                            }`}>
                              {feature.name}
                            </span>
                            {feature.status === "complete" && (
                              <Badge className="bg-green-600/80 text-[10px] px-1.5 py-0">BUILT</Badge>
                            )}
                            {feature.status === "partial" && (
                              <Badge className="bg-yellow-600/80 text-[10px] px-1.5 py-0">WIP</Badge>
                            )}
                            {feature.status === "planned" && (
                              <Badge className="bg-blue-600/80 text-[10px] px-1.5 py-0">PLANNED</Badge>
                            )}
                          </div>
                          <p className="text-slate-400 text-xs mt-1">{feature.description}</p>
                        </div>
                        {feature.route && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-slate-500 hover:text-cyan-400 hover:bg-cyan-400/10 flex-shrink-0"
                            onClick={(e) => { e.stopPropagation(); setLocation(feature.route!); }}
                            data-testid={`button-goto-${feature.id}`}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </OrbitCardContent>
                </BentoTile>
              );
            })}
          </BentoGrid>
        </ContentSection>

        <ContentSection delay={0.4}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-slate-700/50">
            <p className="text-slate-500 text-sm">
              Powered by ORBIT Staffing OS v2.7.0
            </p>
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-sm">
                {checkedFeatures.length} of {totalFeatures} verified
              </span>
              <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${(checkedFeatures.length / totalFeatures) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </ContentSection>
      </div>
    </PageWrapper>
  );
}
