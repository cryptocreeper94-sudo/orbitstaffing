import { useState } from 'react';
import { useLocation } from 'wouter';
import { MainHeader } from '@/components/MainHeader';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Users,
  DollarSign,
  Shield,
  Settings,
  BarChart3,
  Briefcase,
  UserCheck,
  UserPlus,
  Clock,
  MapPin,
  Star,
  CreditCard,
  FileText,
  Receipt,
  Calculator,
  Wallet,
  Scale,
  FileCheck,
  Fingerprint,
  BadgeCheck,
  AlertTriangle,
  ClipboardList,
  Building2,
  Wrench,
  CalendarDays,
  MessageSquare,
  Globe,
  Palette,
  Lock,
  Database,
  Bell,
  TrendingUp,
  PieChart,
  Activity,
  LineChart,
  Target,
  Award,
} from 'lucide-react';

import imgAdminWorkers from '@/assets/images/cmd/admin-workers.png';
import imgAdminPayroll from '@/assets/images/cmd/admin-payroll.png';
import imgAdminCompliance from '@/assets/images/cmd/admin-compliance.png';
import imgAdminOperations from '@/assets/images/cmd/admin-operations.png';
import imgAdminSettings from '@/assets/images/cmd/admin-settings.png';
import imgAdminReports from '@/assets/images/cmd/admin-reports.png';
import imgAdminOnboarding from '@/assets/images/cmd/admin-onboarding.png';
import imgAdminAssignments from '@/assets/images/cmd/admin-assignments.png';
import imgAdminGarnishment from '@/assets/images/cmd/admin-garnishment.png';
import imgAdminBgcheck from '@/assets/images/cmd/admin-bgcheck.png';
import imgTalentExchange from '@/assets/images/cmd/talent-exchange.png';
import imgAvailability from '@/assets/images/cmd/availability.png';
import imgGpsClockIn from '@/assets/images/cmd/gps-clockin.png';
import imgMyShifts from '@/assets/images/cmd/my-shifts.png';
import imgPayrollPortal from '@/assets/images/cmd/payroll-portal.png';
import imgPayrollSetup from '@/assets/images/cmd/payroll-setup.png';
import imgBilling from '@/assets/images/cmd/billing.png';
import imgFinancialHub from '@/assets/images/cmd/financial-hub.png';
import imgComplianceWorker from '@/assets/images/cmd/compliance-worker.png';
import imgDocuments from '@/assets/images/cmd/documents.png';
import imgTimesheets from '@/assets/images/cmd/timesheets.png';
import imgServiceAgreement from '@/assets/images/cmd/service-agreement.png';
import imgEmployerPortal from '@/assets/images/cmd/employer-portal.png';
import imgRequestWorkers from '@/assets/images/cmd/request-workers.png';
import imgAnalytics from '@/assets/images/cmd/analytics.png';
import imgCrm from '@/assets/images/cmd/crm.png';
import imgFeatures from '@/assets/images/cmd/features.png';
import imgChangelog from '@/assets/images/cmd/changelog.png';
import imgFeatureRequests from '@/assets/images/cmd/feature-requests.png';
import imgRoadmap from '@/assets/images/cmd/roadmap.png';
import imgComplianceLegal from '@/assets/images/cmd/compliance-legal.png';
import imgMarketing from '@/assets/images/cmd/marketing.png';

interface AdminCard {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: typeof Users;
  image: string;
  badge?: string;
  badgeColor?: string;
  featured?: boolean;
}

interface AdminCategory {
  title: string;
  gradient: string;
  iconBg: string;
  accentColor: string;
  filter: string[];
  cards: AdminCard[];
}

const categories: AdminCategory[] = [
  {
    title: 'Worker Management',
    gradient: 'from-cyan-500 to-blue-600',
    iconBg: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    accentColor: 'bg-cyan-400',
    filter: ['All', 'Operations'],
    cards: [
      { id: 'worker-matching', label: 'Worker Matching', description: 'Match workers to open positions with AI', href: '/admin/worker-matching', icon: UserCheck, image: imgAdminWorkers, badge: 'AI' },
      { id: 'talent-exchange', label: 'Talent Exchange', description: 'Manage talent pool and exchanges', href: '/admin/talent-exchange', icon: Users, image: imgTalentExchange },
      { id: 'worker-availability', label: 'Worker Availability', description: 'View and manage worker schedules', href: '/worker-availability', icon: CalendarDays, image: imgAvailability },
      { id: 'assignments', label: 'Assignments', description: 'Track and manage worker assignments', href: '/admin/assignment-dashboard', icon: ClipboardList, image: imgAdminAssignments, badge: 'Live' },
      { id: 'onboarding', label: 'Onboarding', description: 'New employee onboarding workflows', href: '/send-welcome-letters', icon: UserPlus, image: imgAdminOnboarding },
      { id: 'talent-pool', label: 'Talent Pool', description: 'Browse available workers and candidates', href: '/talent-pool', icon: Star, image: imgAdminWorkers },
      { id: 'shift-scheduling', label: 'Shift Scheduling', description: 'Create and manage shift schedules', href: '/shift-scheduling', icon: Clock, image: imgMyShifts },
      { id: 'gps-tracking', label: 'GPS Clock-In', description: 'Location-verified time tracking', href: '/gps-clock-in', icon: MapPin, image: imgGpsClockIn, badge: 'Live' },
    ],
  },
  {
    title: 'Payroll & Finance',
    gradient: 'from-amber-500 to-orange-600',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    accentColor: 'bg-amber-400',
    filter: ['All', 'Finance'],
    cards: [
      { id: 'payroll-dashboard', label: 'Payroll Dashboard', description: 'Process payroll and view summaries', href: '/admin/payroll-dashboard', icon: DollarSign, image: imgPayrollPortal, badge: 'Live' },
      { id: 'payroll-setup', label: 'Payroll Setup', description: 'Configure payroll settings and rules', href: '/admin/payroll-setup', icon: Settings, image: imgPayrollSetup },
      { id: 'garnishments', label: 'Garnishments', description: 'Manage wage garnishments and deductions', href: '/admin/garnishment-dashboard', icon: Scale, image: imgAdminGarnishment },
      { id: 'invoicing', label: 'Invoicing', description: 'Create and manage client invoices', href: '/invoicing', icon: Receipt, image: imgBilling },
      { id: 'financial-hub', label: 'Financial Hub', description: 'Comprehensive financial overview', href: '/admin/financial-hub', icon: CreditCard, image: imgFinancialHub, badge: 'New' },
      { id: 'collections', label: 'Collections', description: 'Track outstanding payments and collections', href: '/collections-dashboard', icon: Wallet, image: imgAdminPayroll },
    ],
  },
  {
    title: 'Compliance & Legal',
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    accentColor: 'bg-emerald-400',
    filter: ['All', 'Compliance'],
    cards: [
      { id: 'compliance-monitor', label: 'Compliance Monitor', description: 'Real-time compliance tracking', href: '/admin/compliance-monitor', icon: Shield, image: imgAdminCompliance, badge: 'Live' },
      { id: 'compliance-dashboard', label: 'Compliance Dashboard', description: 'Overview of all compliance metrics', href: '/admin/compliance', icon: FileCheck, image: imgComplianceWorker },
      { id: 'background-checks', label: 'Background Checks', description: 'Manage background verification', href: '/background-checks', icon: Fingerprint, image: imgAdminBgcheck },
      { id: 'drug-testing', label: 'Drug Test Scheduling', description: 'Schedule and track drug testing', href: '/drug-test-scheduling', icon: BadgeCheck, image: imgComplianceLegal },
      { id: 'i9-verify', label: 'I-9 Verification', description: 'Employment eligibility verification', href: '/i9-verification', icon: FileText, image: imgDocuments },
      { id: 'incident-reporting', label: 'Incident Reporting', description: 'Report and track workplace incidents', href: '/incident-reporting', icon: AlertTriangle, image: imgAdminCompliance },
      { id: 'workers-comp', label: "Workers' Comp", description: 'Workers compensation administration', href: '/workers-comp-admin', icon: Scale, image: imgServiceAgreement },
      { id: 'csa-signing', label: 'CSA Signing', description: 'Client service agreement management', href: '/csa-signing', icon: FileText, image: imgServiceAgreement },
    ],
  },
  {
    title: 'Operations',
    gradient: 'from-violet-500 to-purple-600',
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    accentColor: 'bg-violet-400',
    filter: ['All', 'Operations'],
    cards: [
      { id: 'timesheet-approval', label: 'Timesheet Approval', description: 'Review and approve worker timesheets', href: '/admin/timesheet-approval', icon: Clock, image: imgTimesheets, badge: 'Live' },
      { id: 'equipment-tracking', label: 'Equipment Tracking', description: 'Track and manage company equipment', href: '/equipment-tracking', icon: Wrench, image: imgAdminOperations },
      { id: 'client-requests', label: 'Client Requests', description: 'Manage incoming client work orders', href: '/client/request-workers', icon: Briefcase, image: imgRequestWorkers },
      { id: 'employer-portal', label: 'Employer Portal', description: 'Client-facing portal management', href: '/employer-portal', icon: Building2, image: imgEmployerPortal },
      { id: 'work-orders', label: 'Work Orders', description: 'Create and track work orders', href: '/work-orders', icon: ClipboardList, image: imgAdminAssignments },
      { id: 'sms-dashboard', label: 'SMS Dashboard', description: 'Manage SMS communications', href: '/admin-sms', icon: MessageSquare, image: imgMarketing, badge: 'New' },
    ],
  },
  {
    title: 'Settings & Config',
    gradient: 'from-sky-500 to-indigo-600',
    iconBg: 'bg-gradient-to-br from-sky-500 to-indigo-600',
    accentColor: 'bg-sky-400',
    filter: ['All', 'Settings'],
    cards: [
      { id: 'settings', label: 'Platform Settings', description: 'Configure platform preferences', href: '/settings', icon: Settings, image: imgAdminSettings },
      { id: 'franchise', label: 'Franchise Dashboard', description: 'Manage franchise operations', href: '/admin/franchise', icon: Globe, image: imgAdminSettings },
      { id: 'licenses', label: 'License Manager', description: 'Manage software licenses and keys', href: '/admin/licenses', icon: Lock, image: imgAdminSettings },
      { id: 'hallmark', label: 'Hallmark Registry', description: 'Digital hallmark and verification badges', href: '/hallmark-registry', icon: Award, image: imgAdminBgcheck },
      { id: 'oauth', label: 'OAuth Settings', description: 'Configure authentication integrations', href: '/oauth/settings', icon: Lock, image: imgAdminSettings },
      { id: 'crm', label: 'CRM Dashboard', description: 'Customer relationship management', href: '/admin/crm', icon: Database, image: imgCrm },
      { id: 'ecosystem', label: 'Ecosystem Hub', description: 'Connected apps and integrations', href: '/ecosystem-hub', icon: Globe, image: imgAdminOperations, badge: 'New' },
      { id: 'branding', label: 'Hallmark Manager', description: 'Customize branding and hallmarks', href: '/my-hallmark', icon: Palette, image: imgAdminBgcheck },
    ],
  },
  {
    title: 'Reports & Analytics',
    gradient: 'from-rose-500 to-pink-600',
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600',
    accentColor: 'bg-rose-400',
    filter: ['All', 'Reports'],
    cards: [
      { id: 'analytics', label: 'Analytics Dashboard', description: 'Platform-wide analytics and insights', href: '/admin/analytics', icon: BarChart3, image: imgAnalytics, badge: 'Live' },
      { id: 'financial-reports', label: 'Financial Reports', description: 'Revenue, expenses, and profit reports', href: '/financial-reports', icon: TrendingUp, image: imgFinancialHub },
      { id: 'workforce-forecast', label: 'Workforce Forecasting', description: 'AI-powered workforce predictions', href: '/workforce-forecasting', icon: LineChart, image: imgAdminReports, badge: 'AI' },
      { id: 'worker-performance', label: 'Worker Performance', description: 'Performance metrics and reviews', href: '/worker-performance', icon: Target, image: imgAdminReports },
      { id: 'feature-inventory', label: 'Feature Inventory', description: 'Track platform features and usage', href: '/feature-inventory', icon: PieChart, image: imgFeatures },
      { id: 'activity-feed', label: 'Activity Feed', description: 'Real-time platform activity log', href: '/dev-dashboard', icon: Activity, image: imgAdminReports },
      { id: 'feature-requests', label: 'Feature Requests', description: 'User-submitted feature requests', href: '/feature-requests', icon: Bell, image: imgFeatureRequests },
      { id: 'changelog', label: 'Changelog', description: 'Platform version history and updates', href: '/changelog', icon: FileText, image: imgChangelog },
    ],
  },
];

const filterPills = ['All', 'Operations', 'Finance', 'Compliance', 'Settings', 'Reports'];

const badgeStyles: Record<string, string> = {
  Live: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  New: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Hot: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  AI: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Earn: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

function AdminCardItem({ card, accentColor, iconBg, gradient }: { card: AdminCard; accentColor: string; iconBg: string; gradient: string }) {
  const [, setLocation] = useLocation();
  const Icon = card.icon;

  return (
    <div
      className="group relative overflow-hidden rounded-xl cursor-pointer border border-white/5 hover:border-white/15 transition-all duration-300"
      style={{ height: '220px', minWidth: card.featured ? '310px' : '270px' }}
      onClick={() => setLocation(card.href)}
      data-testid={`card-admin-${card.id}`}
    >
      <img
        src={card.image}
        alt={card.label}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.12] group-hover:opacity-[0.22] transition-opacity`} />

      <div className="relative h-full flex flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-2">
          <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0 shadow-lg`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          {card.badge && (
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 h-5 ${badgeStyles[card.badge] || ''}`}
              data-testid={`badge-${card.id}-${card.badge.toLowerCase()}`}
            >
              {card.badge}
            </Badge>
          )}
        </div>

        <div className="mt-auto">
          <h3 className="text-white font-semibold text-sm mb-1 drop-shadow-md" data-testid={`text-card-label-${card.id}`}>
            {card.label}
          </h3>
          <p className="text-white/60 text-xs leading-relaxed line-clamp-2 drop-shadow-sm">
            {card.description}
          </p>
        </div>
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 h-0.5 ${accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />
    </div>
  );
}

export default function AdminExploreHub() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [, setLocation] = useLocation();

  const filteredCategories = categories.filter((cat) => {
    if (activeFilter === 'All') return true;
    return cat.filter.includes(activeFilter);
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070b16] via-[#0c1222] to-[#070b16]">
      <MainHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            className="text-cyan-400 hover:text-cyan-300"
            onClick={() => setLocation('/')}
            data-testid="button-back-explore"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Explore
          </Button>
          <div className="h-5 w-px bg-white/10 hidden sm:block" />
          <h1 className="text-xl font-bold text-white" data-testid="text-admin-title">
            Admin Command Center
          </h1>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {filterPills.map((pill) => (
            <button
              key={pill}
              onClick={() => setActiveFilter(pill)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 min-w-[80px] ${
                activeFilter === pill
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'
              }`}
              data-testid={`filter-pill-${pill.toLowerCase()}`}
            >
              {pill}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 space-y-10">
        {filteredCategories.map((category) => (
          <section key={category.title} data-testid={`section-${category.title.toLowerCase().replace(/\s+/g, '-')}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-1 h-6 rounded-full bg-gradient-to-b ${category.gradient}`} />
              <h2 className="text-lg font-semibold text-white">{category.title}</h2>
              <span className="text-xs text-white/30">{category.cards.length} tools</span>
            </div>

            <Carousel
              opts={{
                align: 'start',
                dragFree: true,
                containScroll: 'trimSnaps',
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-3">
                {category.cards.map((card) => (
                  <CarouselItem key={card.id} className="pl-3 basis-auto">
                    <AdminCardItem card={card} accentColor={category.accentColor} iconBg={category.iconBg} gradient={category.gradient} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-4 bg-white/10 border-white/10 text-white hover:bg-white/20" />
              <CarouselNext className="hidden md:flex -right-4 bg-white/10 border-white/10 text-white hover:bg-white/20" />
            </Carousel>
          </section>
        ))}
      </div>
    </div>
  );
}
