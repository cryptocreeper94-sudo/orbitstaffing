import { useState } from 'react';
import { useLocation } from 'wouter';
import { MainHeader } from '@/components/MainHeader';
import { VideoHero } from '@/components/VideoHero';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Search, MapPin, FileText, Star, Smartphone, Clock,
  Shield, GraduationCap, Bell, UserCheck, Calculator, CreditCard,
  Receipt, Award, Users, ClipboardList, Handshake, BarChart3,
  Settings, Target, Megaphone, PieChart, Landmark, Scale,
  Lightbulb, HelpCircle, Rocket, Puzzle, Globe, Zap,
  Wallet, BadgeCheck, CalendarDays, HeartPulse, Gift,
  DollarSign, Building2, TrendingUp, BookOpen
} from 'lucide-react';

import imgJobBoard from '@/assets/images/cmd/job-board.png';
import imgQuickApply from '@/assets/images/cmd/quick-apply.png';
import imgTalentExchange from '@/assets/images/cmd/talent-exchange.png';
import imgMyShifts from '@/assets/images/cmd/my-shifts.png';
import imgNearbyJobs from '@/assets/images/cmd/nearby-jobs.png';
import imgReferrals from '@/assets/images/cmd/referrals.png';
import imgGpsClockIn from '@/assets/images/cmd/gps-clockin.png';
import imgDigitalId from '@/assets/images/cmd/digital-id.png';
import imgComplianceWorker from '@/assets/images/cmd/compliance-worker.png';
import imgTraining from '@/assets/images/cmd/training.png';
import imgAvailability from '@/assets/images/cmd/availability.png';
import imgNotifications from '@/assets/images/cmd/notifications.png';
import imgMobileApp from '@/assets/images/cmd/mobile-app.png';
import imgDocuments from '@/assets/images/cmd/documents.png';
import imgPayrollPortal from '@/assets/images/cmd/payroll-portal.png';
import imgPayCard from '@/assets/images/cmd/pay-card.png';
import imgBenefits from '@/assets/images/cmd/benefits.png';
import imgTaxDocs from '@/assets/images/cmd/tax-docs.png';
import imgPto from '@/assets/images/cmd/pto.png';
import imgBonuses from '@/assets/images/cmd/bonuses.png';
import imgRequestWorkers from '@/assets/images/cmd/request-workers.png';
import imgEmployerPortal from '@/assets/images/cmd/employer-portal.png';
import imgTimesheets from '@/assets/images/cmd/timesheets.png';
import imgServiceAgreement from '@/assets/images/cmd/service-agreement.png';
import imgWorkerMatching from '@/assets/images/cmd/worker-matching.png';
import imgBilling from '@/assets/images/cmd/billing.png';
import imgOwnerHub from '@/assets/images/cmd/owner-hub.png';
import imgFranchise from '@/assets/images/cmd/franchise.png';
import imgFinancialHub from '@/assets/images/cmd/financial-hub.png';
import imgPayrollSetup from '@/assets/images/cmd/payroll-setup.png';
import imgComplianceLegal from '@/assets/images/cmd/compliance-legal.png';
import imgCrm from '@/assets/images/cmd/crm.png';
import imgMarketing from '@/assets/images/cmd/marketing.png';
import imgAnalytics from '@/assets/images/cmd/analytics.png';
import imgProducts from '@/assets/images/cmd/products.png';
import imgIntegrations from '@/assets/images/cmd/integrations.png';
import imgFeatures from '@/assets/images/cmd/features.png';
import imgPricing from '@/assets/images/cmd/pricing.png';
import imgHelpCenter from '@/assets/images/cmd/help-center.png';
import imgRoadmap from '@/assets/images/cmd/roadmap.png';
import imgChangelog from '@/assets/images/cmd/changelog.png';
import imgFeatureRequests from '@/assets/images/cmd/feature-requests.png';

type BadgeType = 'Live' | 'New' | 'Hot' | 'Earn' | 'AI';

interface ExploreCard {
  id: string;
  label: string;
  description: string;
  icon: any;
  href: string;
  image: string;
  badge?: BadgeType;
  featured?: boolean;
}

interface CategorySection {
  title: string;
  gradient: string;
  iconGradient: string;
  cards: ExploreCard[];
  filterGroup: string[];
}

const badgeColors: Record<BadgeType, string> = {
  Live: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  New: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Hot: 'bg-red-500/20 text-red-400 border-red-500/30',
  Earn: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  AI: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const categories: CategorySection[] = [
  {
    title: 'Find Work',
    gradient: 'from-cyan-500 to-blue-500',
    iconGradient: 'from-cyan-500/20 to-blue-500/20',
    filterGroup: ['All', 'Workers'],
    cards: [
      { id: 'fw-1', label: 'Job Board', description: 'Browse available positions near you', icon: Search, href: '/jobs', image: imgJobBoard, badge: 'Live' },
      { id: 'fw-2', label: 'Quick Apply', description: 'One-click applications for instant placement', icon: Zap, href: '/apply', image: imgQuickApply, badge: 'Hot' },
      { id: 'fw-3', label: 'Talent Exchange', description: 'Join the talent marketplace', icon: Globe, href: '/talent-exchange', image: imgTalentExchange, badge: 'New' },
      { id: 'fw-4', label: 'My Shifts', description: 'View and manage your upcoming shifts', icon: CalendarDays, href: '/worker-shifts', image: imgMyShifts, badge: 'Live' },
      { id: 'fw-5', label: 'Nearby Jobs', description: 'GPS-based job discovery', icon: MapPin, href: '/jobs', image: imgNearbyJobs },
      { id: 'fw-6', label: 'Referrals', description: 'Earn bonuses by referring workers', icon: Gift, href: '/worker-referrals', image: imgReferrals, badge: 'Earn' },
    ],
  },
  {
    title: 'Worker Tools',
    gradient: 'from-emerald-500 to-teal-500',
    iconGradient: 'from-emerald-500/20 to-teal-500/20',
    filterGroup: ['All', 'Workers'],
    cards: [
      { id: 'wt-1', label: 'GPS Clock-In', description: 'Verify attendance with location tracking', icon: MapPin, href: '/gps-clock-in', image: imgGpsClockIn, badge: 'Live' },
      { id: 'wt-2', label: 'Digital ID Card', description: 'Your digital employee identification', icon: BadgeCheck, href: '/employee-hub', image: imgDigitalId },
      { id: 'wt-3', label: 'Compliance', description: 'Track certifications and requirements', icon: Shield, href: '/worker/compliance', image: imgComplianceWorker, badge: 'Live' },
      { id: 'wt-4', label: 'Training', description: 'Access training and certification courses', icon: GraduationCap, href: '/worker/compliance', image: imgTraining },
      { id: 'wt-5', label: 'Availability', description: 'Set your work schedule preferences', icon: Clock, href: '/worker-availability', image: imgAvailability },
      { id: 'wt-6', label: 'Notifications', description: 'Real-time shift alerts and updates', icon: Bell, href: '/employee-hub', image: imgNotifications },
      { id: 'wt-7', label: 'Mobile App', description: 'Download ORBIT on your phone', icon: Smartphone, href: '/employee-app', image: imgMobileApp, badge: 'New' },
      { id: 'wt-8', label: 'Documents', description: 'Access tax forms and pay stubs', icon: FileText, href: '/tax-documents', image: imgDocuments },
    ],
  },
  {
    title: 'Pay & Benefits',
    gradient: 'from-amber-500 to-orange-500',
    iconGradient: 'from-amber-500/20 to-orange-500/20',
    filterGroup: ['All', 'Workers'],
    cards: [
      { id: 'pb-1', label: 'Payroll Portal', description: 'View earnings and payment history', icon: DollarSign, href: '/worker/payroll-portal', image: imgPayrollPortal, badge: 'Live' },
      { id: 'pb-2', label: 'ORBIT Pay Card', description: 'Instant pay on your branded debit card', icon: CreditCard, href: '/orbit-pay-card', image: imgPayCard, badge: 'Hot', featured: true },
      { id: 'pb-3', label: 'Benefits', description: 'Health, dental, and vision enrollment', icon: HeartPulse, href: '/benefits', image: imgBenefits },
      { id: 'pb-4', label: 'Tax Documents', description: 'W-2s, 1099s, and tax filing resources', icon: Receipt, href: '/tax-documents', image: imgTaxDocs },
      { id: 'pb-5', label: 'PTO Tracking', description: 'View and request time off', icon: CalendarDays, href: '/pto', image: imgPto },
      { id: 'pb-6', label: 'Bonuses', description: 'Track performance and referral bonuses', icon: Award, href: '/worker-bonuses', image: imgBonuses, badge: 'Earn' },
    ],
  },
  {
    title: 'For Employers',
    gradient: 'from-violet-500 to-purple-500',
    iconGradient: 'from-violet-500/20 to-purple-500/20',
    filterGroup: ['All', 'Employers'],
    cards: [
      { id: 'fe-1', label: 'Request Workers', description: 'Submit staffing requests instantly', icon: Users, href: '/client/request-workers', image: imgRequestWorkers, badge: 'Live' },
      { id: 'fe-2', label: 'Employer Portal', description: 'Manage your workforce dashboard', icon: Building2, href: '/employer-portal', image: imgEmployerPortal, badge: 'Live' },
      { id: 'fe-3', label: 'Timesheets', description: 'Review and approve worker hours', icon: ClipboardList, href: '/timesheet-approval', image: imgTimesheets },
      { id: 'fe-4', label: 'Service Agreement', description: 'Sign and manage your CSA', icon: Handshake, href: '/csa-signing', image: imgServiceAgreement },
      { id: 'fe-5', label: 'Worker Matching', description: 'AI-powered talent recommendations', icon: UserCheck, href: '/talent-pool', image: imgWorkerMatching, badge: 'AI' },
      { id: 'fe-6', label: 'Billing', description: 'View invoices and payment history', icon: Calculator, href: '/employer-portal', image: imgBilling },
    ],
  },
  {
    title: 'Business Owners',
    gradient: 'from-orange-500 to-red-500',
    iconGradient: 'from-orange-500/20 to-red-500/20',
    filterGroup: ['All', 'Owners'],
    cards: [
      { id: 'bo-1', label: 'Owner Hub', description: 'Complete business management dashboard', icon: TrendingUp, href: '/owner-hub', image: imgOwnerHub, badge: 'Live', featured: true },
      { id: 'bo-2', label: 'Franchise', description: 'Own your territory with ORBIT', icon: Landmark, href: '/franchise', image: imgFranchise, badge: 'Hot' },
      { id: 'bo-3', label: 'Financial Hub', description: 'Revenue, expenses, and profit analytics', icon: PieChart, href: '/admin/financial-hub', image: imgFinancialHub },
      { id: 'bo-4', label: 'Payroll Setup', description: 'Configure payroll processing', icon: Settings, href: '/payroll-setup', image: imgPayrollSetup },
      { id: 'bo-5', label: 'Compliance', description: 'Legal and regulatory management', icon: Scale, href: '/admin/compliance', image: imgComplianceLegal },
      { id: 'bo-6', label: 'CRM', description: 'Customer relationship management', icon: Target, href: '/crm', image: imgCrm, badge: 'Live' },
      { id: 'bo-7', label: 'Marketing', description: 'Campaign management and analytics', icon: Megaphone, href: '/marketing-hub', image: imgMarketing },
      { id: 'bo-8', label: 'Analytics', description: 'Business intelligence and forecasting', icon: BarChart3, href: '/analytics', image: imgAnalytics, badge: 'AI' },
    ],
  },
  {
    title: 'Platform & Resources',
    gradient: 'from-sky-500 to-indigo-500',
    iconGradient: 'from-sky-500/20 to-indigo-500/20',
    filterGroup: ['All', 'Resources'],
    cards: [
      { id: 'pr-1', label: 'Products', description: 'Explore the DarkWave ecosystem', icon: Puzzle, href: '/products', image: imgProducts, badge: 'Live' },
      { id: 'pr-2', label: 'Integrations', description: 'Connect QuickBooks, Xero, and more', icon: Zap, href: '/integrations', image: imgIntegrations, badge: 'Live' },
      { id: 'pr-3', label: 'Features', description: 'Full feature inventory', icon: Lightbulb, href: '/features', image: imgFeatures },
      { id: 'pr-4', label: 'Pricing', description: 'Plans and pricing options', icon: Wallet, href: '/pricing', image: imgPricing },
      { id: 'pr-5', label: 'Help Center', description: 'Documentation and support', icon: HelpCircle, href: '/help', image: imgHelpCenter },
      { id: 'pr-6', label: 'Roadmap', description: 'What we are building next', icon: Rocket, href: '/roadmap', image: imgRoadmap },
      { id: 'pr-7', label: 'Changelog', description: 'Recent updates and releases', icon: BookOpen, href: '/changelog', image: imgChangelog, badge: 'New' },
      { id: 'pr-8', label: 'Feature Requests', description: 'Vote on upcoming features', icon: Star, href: '/feature-requests', image: imgFeatureRequests },
    ],
  },
];

const filterOptions = ['All', 'Workers', 'Employers', 'Owners', 'Resources'];

function ExploreCard({ card, gradient }: { card: ExploreCard; gradient: string }) {
  const [, setLocation] = useLocation();
  const Icon = card.icon;

  return (
    <div
      onClick={() => setLocation(card.href)}
      className={`group relative overflow-hidden rounded-xl cursor-pointer border border-white/5 hover:border-white/10 transition-all duration-300 ${card.featured ? 'min-w-[310px]' : 'min-w-[270px]'}`}
      style={{ height: '220px' }}
      data-testid={`card-explore-${card.id}`}
    >
      <img
        src={card.image}
        alt={card.label}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.15] group-hover:opacity-[0.25] transition-opacity`} />

      <div className="relative h-full flex flex-col justify-between p-5">
        <div>
          <div className="flex items-start justify-between mb-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            {card.badge && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeColors[card.badge]}`} data-testid={`badge-${card.id}`}>
                {card.badge}
              </span>
            )}
          </div>
          <h3 className="text-white font-semibold text-sm mb-1 drop-shadow-md">{card.label}</h3>
          <p className="text-white/70 text-xs leading-relaxed drop-shadow-sm">{card.description}</p>
        </div>

        <div className="flex items-center text-white/50 text-xs group-hover:text-white/80 transition-colors">
          <span>Explore</span>
          <span className="ml-1 group-hover:translate-x-1 transition-transform">&rarr;</span>
        </div>
      </div>

      <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
    </div>
  );
}

function CategoryCarousel({ section }: { section: CategorySection }) {
  return (
    <div className="mb-10" data-testid={`section-${section.title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center gap-3 mb-4 px-4 sm:px-6">
        <div className={`w-1 h-6 rounded-full bg-gradient-to-b ${section.gradient}`} />
        <h2 className="text-white font-bold text-lg">{section.title}</h2>
        <span className="text-white/30 text-xs">{section.cards.length} items</span>
      </div>

      <div className="px-4 sm:px-6">
        <Carousel
          opts={{
            align: 'start',
            dragFree: true,
            containScroll: 'trimSnaps',
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-3">
            {section.cards.map((card) => (
              <CarouselItem key={card.id} className="pl-3 basis-auto">
                <ExploreCard card={card} gradient={section.gradient} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4 bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-white" />
          <CarouselNext className="hidden md:flex -right-4 bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-white" />
        </Carousel>
      </div>
    </div>
  );
}

export default function ExploreHub() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredCategories = categories.filter((cat) =>
    cat.filterGroup.includes(activeFilter)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070b16] via-[#0c1222] to-[#070b16]">
      <MainHeader />
      <VideoHero onDemoClick={() => {}} />

      <div className="py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {filterOptions.map((filter) => {
              const isActive = activeFilter === filter;
              const gradients: Record<string, string> = {
                All: 'from-cyan-500 to-blue-500',
                Workers: 'from-emerald-500 to-teal-500',
                Employers: 'from-violet-500 to-purple-500',
                Owners: 'from-orange-500 to-red-500',
                Resources: 'from-sky-500 to-indigo-500',
              };
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap min-w-[80px] transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${gradients[filter]} text-white shadow-lg`
                      : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 border border-white/5'
                  }`}
                  data-testid={`filter-${filter.toLowerCase()}`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pb-20">
        {filteredCategories.map((section) => (
          <CategoryCarousel key={section.title} section={section} />
        ))}
      </div>
    </div>
  );
}
