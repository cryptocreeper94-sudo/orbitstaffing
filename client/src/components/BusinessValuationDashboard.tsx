/**
 * Business Intelligence & Valuation Dashboard
 * Comprehensive tracking of company valuation, growth metrics, and milestone progress
 * For Developer (0424) and Partner (4444) access
 */
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, DollarSign, Target, Users, Building2, Rocket, 
  CheckCircle2, Circle, ArrowRight, Trophy, Star, Zap,
  BarChart3, PieChart, Activity, Globe, Shield, Sparkles,
  ChevronRight, ChevronDown, Info, Award, Crown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ValuationTier {
  name: string;
  range: string;
  minValue: number;
  maxValue: number;
  requirements: {
    franchises: number;
    arr: number;
    workers: number;
  };
  description: string;
  color: string;
  icon: React.ReactNode;
}

interface BusinessMetrics {
  franchisesSold: number;
  franchisesPending: number;
  monthlyRevenue: number;
  arr: number;
  activeWorkers: number;
  activeClients: number;
  platformUptime: number;
  blocksAnchored: number;
}

const VALUATION_TIERS: ValuationTier[] = [
  {
    name: 'Pre-Revenue',
    range: '$2M - $4M',
    minValue: 2000000,
    maxValue: 4000000,
    requirements: { franchises: 0, arr: 0, workers: 0 },
    description: 'Tech stack complete, awaiting first revenue',
    color: 'from-slate-500 to-gray-600',
    icon: <Rocket className="w-5 h-5" />
  },
  {
    name: 'Early Traction',
    range: '$4M - $8M',
    minValue: 4000000,
    maxValue: 8000000,
    requirements: { franchises: 5, arr: 100000, workers: 50 },
    description: '5+ franchises, $100K ARR, product-market fit proven',
    color: 'from-blue-500 to-cyan-500',
    icon: <TrendingUp className="w-5 h-5" />
  },
  {
    name: 'Growth Stage',
    range: '$8M - $15M',
    minValue: 8000000,
    maxValue: 15000000,
    requirements: { franchises: 15, arr: 500000, workers: 200 },
    description: '15+ franchises, $500K ARR, regional expansion',
    color: 'from-purple-500 to-pink-500',
    icon: <Target className="w-5 h-5" />
  },
  {
    name: 'Scale-Up',
    range: '$15M - $30M',
    minValue: 15000000,
    maxValue: 30000000,
    requirements: { franchises: 50, arr: 2000000, workers: 1000 },
    description: '50+ franchises, $2M ARR, multi-state operations',
    color: 'from-amber-500 to-orange-500',
    icon: <Trophy className="w-5 h-5" />
  },
  {
    name: 'Market Leader',
    range: '$50M+',
    minValue: 50000000,
    maxValue: 100000000,
    requirements: { franchises: 100, arr: 5000000, workers: 5000 },
    description: '100+ franchises, $5M+ ARR, acquisition target',
    color: 'from-emerald-500 to-green-500',
    icon: <Crown className="w-5 h-5" />
  }
];

const MARKET_COMPARABLES = [
  { name: 'Bullhorn', valuation: '$2.26B+', context: 'Market leader, 10K+ customers' },
  { name: 'Avionté', valuation: '$100M+', context: 'PE-backed mid-market' },
  { name: 'JobDiva', valuation: '$50M+', context: 'Enterprise staffing' },
  { name: 'TempWorks', valuation: '$30M+', context: 'Regional player' },
];

const REVENUE_MULTIPLIERS = {
  hrTech: { min: 11, max: 13, label: 'HR Tech SaaS' },
  verticalSaas: { min: 4, max: 5, label: 'Vertical SaaS' },
  staffingAgency: { min: 3.5, max: 5.5, label: 'Staffing Agency' },
};

export function BusinessValuationDashboard({ isPartnerView = false }: { isPartnerView?: boolean }) {
  const [expandedSection, setExpandedSection] = useState<string | null>('valuation');

  // Fetch real metrics from combined API endpoint
  const { data: stats } = useQuery({
    queryKey: ['business-stats'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/admin/business-stats');
        if (!response.ok) return null;
        return response.json();
      } catch {
        return null;
      }
    }
  });

  const { data: blockchainStats } = useQuery({
    queryKey: ['blockchain-stats'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/blockchain/status');
        if (!response.ok) return null;
        return response.json();
      } catch {
        return null;
      }
    }
  });

  // Calculate current metrics from combined stats endpoint
  const metrics: BusinessMetrics = {
    franchisesSold: stats?.franchisesApproved || 0,
    franchisesPending: stats?.franchisesPending || 0,
    monthlyRevenue: (stats?.franchisesApproved || 0) * 500, // $500/mo royalty estimate
    arr: (stats?.franchisesApproved || 0) * 6000, // $500 x 12 months
    activeWorkers: stats?.workers || 0,
    activeClients: stats?.clients || 0,
    platformUptime: 99.9,
    blocksAnchored: blockchainStats?.stats?.totalAnchored || 0
  };

  // Determine current valuation tier
  const getCurrentTier = (): number => {
    for (let i = VALUATION_TIERS.length - 1; i >= 0; i--) {
      const tier = VALUATION_TIERS[i];
      if (
        metrics.franchisesSold >= tier.requirements.franchises &&
        metrics.arr >= tier.requirements.arr
      ) {
        return i;
      }
    }
    return 0;
  };

  const currentTierIndex = getCurrentTier();
  const currentTier = VALUATION_TIERS[currentTierIndex];
  const nextTier = VALUATION_TIERS[Math.min(currentTierIndex + 1, VALUATION_TIERS.length - 1)];

  // Calculate progress to next tier
  const calculateProgress = () => {
    if (currentTierIndex >= VALUATION_TIERS.length - 1) return 100;
    
    const franchiseProgress = Math.min(100, (metrics.franchisesSold / nextTier.requirements.franchises) * 100);
    const arrProgress = Math.min(100, (metrics.arr / nextTier.requirements.arr) * 100);
    
    return Math.round((franchiseProgress + arrProgress) / 2);
  };

  // Calculate dynamic valuation estimate
  const calculateValuation = () => {
    const baseValue = currentTier.minValue;
    const progress = calculateProgress();
    const tierRange = currentTier.maxValue - currentTier.minValue;
    
    return baseValue + (tierRange * (progress / 100));
  };

  const estimatedValuation = calculateValuation();
  const progressToNext = calculateProgress();

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const SectionHeader = ({ title, icon, section }: { title: string; icon: React.ReactNode; section: string }) => (
    <button
      onClick={() => setExpandedSection(expandedSection === section ? null : section)}
      className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
      data-testid={`section-${section}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-cyan-400">
          {icon}
        </div>
        <span className="text-lg font-semibold text-white">{title}</span>
      </div>
      {expandedSection === section ? (
        <ChevronDown className="w-5 h-5 text-gray-400" />
      ) : (
        <ChevronRight className="w-5 h-5 text-gray-400" />
      )}
    </button>
  );

  return (
    <div className="space-y-6" data-testid="business-valuation-dashboard">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-900/20 to-slate-900 rounded-2xl p-6 border border-purple-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-cyan-400" />
              Business Intelligence & Valuation
            </h2>
            <p className="text-gray-400 mt-1">
              {isPartnerView ? 'Partner view - Full transparency on company growth' : 'Real-time tracking of business metrics and company value'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Estimated Valuation</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              {formatCurrency(estimatedValuation)}
            </div>
            <Badge className={`mt-1 bg-gradient-to-r ${currentTier.color} text-white border-0`}>
              {currentTier.name}
            </Badge>
          </div>
        </div>
      </div>

      {/* Current Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Franchises Sold</p>
                <p className="text-2xl font-bold text-white">{metrics.franchisesSold}</p>
                {metrics.franchisesPending > 0 && (
                  <p className="text-xs text-amber-400">+{metrics.franchisesPending} pending</p>
                )}
              </div>
              <Building2 className="w-8 h-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Annual Revenue</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(metrics.arr)}</p>
                <p className="text-xs text-green-400">ARR</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Workers</p>
                <p className="text-2xl font-bold text-white">{metrics.activeWorkers}</p>
                <p className="text-xs text-gray-500">on platform</p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Blockchain Records</p>
                <p className="text-2xl font-bold text-white">{metrics.blocksAnchored}</p>
                <p className="text-xs text-cyan-400">Solana anchored</p>
              </div>
              <Shield className="w-8 h-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Valuation Tiers Section */}
      <div className="space-y-3">
        <SectionHeader title="Valuation Roadmap" icon={<TrendingUp className="w-5 h-5" />} section="valuation" />
        
        {expandedSection === 'valuation' && (
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-6">
            {/* Progress to Next Tier */}
            {currentTierIndex < VALUATION_TIERS.length - 1 && (
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-white">Progress to {nextTier.name}</h4>
                    <p className="text-sm text-gray-400">{nextTier.range} valuation</p>
                  </div>
                  <span className="text-2xl font-bold text-cyan-400">{progressToNext}%</span>
                </div>
                <Progress value={progressToNext} className="h-3 bg-slate-700" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-3 bg-slate-800 rounded-lg">
                    <div className="text-sm text-gray-400">Franchises Needed</div>
                    <div className="text-lg font-bold text-white">
                      {metrics.franchisesSold} / {nextTier.requirements.franchises}
                    </div>
                    <Progress 
                      value={Math.min(100, (metrics.franchisesSold / nextTier.requirements.franchises) * 100)} 
                      className="h-1.5 mt-2 bg-slate-700" 
                    />
                  </div>
                  <div className="text-center p-3 bg-slate-800 rounded-lg">
                    <div className="text-sm text-gray-400">ARR Target</div>
                    <div className="text-lg font-bold text-white">
                      {formatCurrency(metrics.arr)} / {formatCurrency(nextTier.requirements.arr)}
                    </div>
                    <Progress 
                      value={Math.min(100, (metrics.arr / nextTier.requirements.arr) * 100)} 
                      className="h-1.5 mt-2 bg-slate-700" 
                    />
                  </div>
                  <div className="text-center p-3 bg-slate-800 rounded-lg">
                    <div className="text-sm text-gray-400">Workers Goal</div>
                    <div className="text-lg font-bold text-white">
                      {metrics.activeWorkers} / {nextTier.requirements.workers}
                    </div>
                    <Progress 
                      value={Math.min(100, (metrics.activeWorkers / nextTier.requirements.workers) * 100)} 
                      className="h-1.5 mt-2 bg-slate-700" 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* All Tiers Visual */}
            <div className="space-y-3">
              <h4 className="font-semibold text-white">Valuation Milestones</h4>
              {VALUATION_TIERS.map((tier, index) => {
                const isCurrentTier = index === currentTierIndex;
                const isCompleted = index < currentTierIndex;
                const isFuture = index > currentTierIndex;
                
                return (
                  <div 
                    key={tier.name}
                    className={`relative p-4 rounded-lg border transition-all ${
                      isCurrentTier 
                        ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10' 
                        : isCompleted 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-slate-800/30 border-slate-700/50'
                    }`}
                    data-testid={`tier-${tier.name.toLowerCase().replace(' ', '-')}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-green-500/20 text-green-400' 
                          : isCurrentTier 
                            ? `bg-gradient-to-br ${tier.color} text-white` 
                            : 'bg-slate-700 text-gray-500'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : tier.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className={`font-semibold ${isCurrentTier ? 'text-white' : isCompleted ? 'text-green-400' : 'text-gray-400'}`}>
                            {tier.name}
                          </h5>
                          {isCurrentTier && (
                            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
                              YOU ARE HERE
                            </Badge>
                          )}
                        </div>
                        <p className="text-xl font-bold text-white mt-1">{tier.range}</p>
                        <p className="text-sm text-gray-400 mt-1">{tier.description}</p>
                        
                        {!isCompleted && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-xs px-2 py-1 rounded bg-slate-700 text-gray-300">
                              {tier.requirements.franchises}+ franchises
                            </span>
                            <span className="text-xs px-2 py-1 rounded bg-slate-700 text-gray-300">
                              {formatCurrency(tier.requirements.arr)} ARR
                            </span>
                            <span className="text-xs px-2 py-1 rounded bg-slate-700 text-gray-300">
                              {tier.requirements.workers}+ workers
                            </span>
                          </div>
                        )}
                      </div>

                      {isCurrentTier && (
                        <div className="text-right">
                          <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Market Intelligence Section */}
      <div className="space-y-3">
        <SectionHeader title="Market Intelligence" icon={<Globe className="w-5 h-5" />} section="market" />
        
        {expandedSection === 'market' && (
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-6">
            {/* Market Comparables */}
            <div>
              <h4 className="font-semibold text-white mb-3">Industry Comparables</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MARKET_COMPARABLES.map((comp) => (
                  <div key={comp.name} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">{comp.name}</span>
                      <span className="text-cyan-400 font-bold">{comp.valuation}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{comp.context}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Multipliers */}
            <div>
              <h4 className="font-semibold text-white mb-3">Revenue Multipliers (Industry Standard)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(REVENUE_MULTIPLIERS).map(([key, mult]) => (
                  <div key={key} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 text-center">
                    <div className="text-2xl font-bold text-cyan-400">{mult.min}x - {mult.max}x</div>
                    <p className="text-sm text-gray-400">{mult.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * ORBIT qualifies for HR Tech SaaS multiples due to blockchain verification, AI features, and mission-critical staffing operations.
              </p>
            </div>

            {/* Market Size */}
            <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-lg p-4 border border-purple-500/30">
              <h4 className="font-semibold text-white mb-2">Total Addressable Market</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">$578M</div>
                  <p className="text-xs text-gray-400">Staffing Software (2024)</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">$1.24B</div>
                  <p className="text-xs text-gray-400">Projected (2032)</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">10.1%</div>
                  <p className="text-xs text-gray-400">CAGR</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">43%</div>
                  <p className="text-xs text-gray-400">North America Share</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Growth Drivers Section */}
      <div className="space-y-3">
        <SectionHeader title="Value Drivers & Next Steps" icon={<Rocket className="w-5 h-5" />} section="growth" />
        
        {expandedSection === 'growth' && (
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-4">
            {/* What Adds Value */}
            <div>
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                What Increases Valuation
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { factor: 'Complete Platform', impact: '+1x', desc: 'Full staffing OS, not just ATS', done: true },
                  { factor: 'Franchise Model', impact: '+1x', desc: 'Recurring revenue + expansion rights', done: true },
                  { factor: 'Blockchain Verification', impact: '+0.5x', desc: 'Unique differentiator, NFT certifications', done: true },
                  { factor: 'Multi-tenant Architecture', impact: '+0.5x', desc: 'Scalable, enterprise-ready', done: true },
                  { factor: 'White-label Capability', impact: '+0.5x', desc: 'B2B2B model potential', done: true },
                  { factor: 'Mobile App (Stores)', impact: '+0.25x', desc: 'React Native built, needs deployment', done: false },
                  { factor: 'First 10 Paying Franchises', impact: '+2x', desc: 'Proves product-market fit', done: false },
                  { factor: 'SMS/Twilio Integration', impact: '+0.25x', desc: 'Real-time notifications', done: false },
                ].map((item) => (
                  <div 
                    key={item.factor}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      item.done ? 'bg-green-500/10 border border-green-500/30' : 'bg-slate-800/50 border border-slate-700'
                    }`}
                  >
                    {item.done ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={item.done ? 'text-green-300' : 'text-gray-300'}>{item.factor}</span>
                        <Badge className={item.done ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-gray-400'}>
                          {item.impact}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Actions */}
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg p-4 border border-amber-500/30">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                Priority Actions to Hit $8M+ Valuation
              </h4>
              <div className="space-y-2">
                {[
                  { action: 'Close first franchise deal', impact: 'Proves business model' },
                  { action: 'Get Twilio credentials', impact: 'Enables SMS notifications' },
                  { action: 'Deploy mobile app to TestFlight', impact: 'Expands platform reach' },
                  { action: 'Secure 5 more franchises', impact: 'Reaches Early Traction tier' },
                  { action: 'Hit $100K ARR', impact: 'Qualifies for 5x+ multiples' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-white flex-1">{item.action}</span>
                    <span className="text-gray-400 text-xs">{item.impact}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats Footer */}
      <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-gray-400">Platform Uptime:</span>
            <span className="text-white font-medium">{metrics.platformUptime}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-400">Blockchain:</span>
            <span className="text-white font-medium">Solana Mainnet</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-purple-400" />
            <span className="text-gray-400">Version:</span>
            <span className="text-white font-medium">v2.5.5</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessValuationDashboard;
