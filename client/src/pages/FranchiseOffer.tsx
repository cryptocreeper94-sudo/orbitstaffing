import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Check, ArrowLeft, Star, Building2, MapPin, Crown, Shield,
  TrendingUp, Users, DollarSign, Rocket, Zap, Lock, Globe,
  ChevronRight, ChevronLeft, Award, Briefcase, CheckCircle2, Phone, Mail,
  AlertCircle, Loader2, CheckCircle
} from 'lucide-react';
import { useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

interface FranchiseTier {
  id: number;
  tierCode: string;
  tierName: string;
  description: string;
  franchiseFee: number;
  royaltyPercent: string;
  supportMonthlyFee: number;
  transferFee: number;
  maxLocations: number;
  territoryExclusive: boolean;
  territoryLevel: string;
  supportResponseHours: number;
  nftRevenueSharePercent: number;
  whitelabelApp: boolean;
  dedicatedAccountManager: boolean;
  subFranchiseRights: boolean;
  customApiAccess: boolean;
  priorityFeatureRequests: boolean;
  brandingControl: string;
  dataOwnership: string;
  allModulesIncluded: boolean;
}

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
];

const BUSINESS_TYPES = [
  'General Staffing Agency',
  'Skilled Trades Staffing',
  'Healthcare Staffing',
  'Hospitality Staffing',
  'Industrial Staffing',
  'IT/Tech Staffing',
  'Construction Staffing',
  'Warehouse/Logistics',
  'Event Staffing',
  'Other'
];

export default function FranchiseOffer() {
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<FranchiseTier | null>(null);
  const [showApplication, setShowApplication] = useState(false);
  const tierCarouselRef = useRef<HTMLDivElement>(null);
  const benefitsCarouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (!ref.current) return;
    const scrollAmount = 340;
    ref.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    businessType: '',
    currentLocations: 1,
    estimatedWorkersPerMonth: 0,
    currentSoftware: '',
    requestedTerritoryState: '',
    requestedTerritoryRegion: '',
  });
  const [territoryChecked, setTerritoryChecked] = useState(false);

  interface TerritoryAvailability {
    available: boolean;
    conflicts: Array<{ reason: string; holder: string; tier: string }>;
    territoryLevel: string;
    isExclusive: boolean;
    checkedState: string;
    checkedRegion: string | null;
  }

  const { data: territoryAvailability, isLoading: checkingTerritory, refetch: checkTerritory } = useQuery<TerritoryAvailability>({
    queryKey: ['territory-availability', formData.requestedTerritoryState, formData.requestedTerritoryRegion, selectedTier?.id],
    queryFn: async () => {
      if (!formData.requestedTerritoryState || !selectedTier?.id) {
        throw new Error('State and tier required');
      }
      const params = new URLSearchParams({
        state: formData.requestedTerritoryState,
        tierId: selectedTier.id.toString()
      });
      if (formData.requestedTerritoryRegion) {
        params.append('region', formData.requestedTerritoryRegion);
      }
      const response = await fetch(`/api/territory-availability?${params}`);
      if (!response.ok) throw new Error('Failed to check territory');
      setTerritoryChecked(true);
      return response.json();
    },
    enabled: false
  });

  const { data: tiers, isLoading } = useQuery<FranchiseTier[]>({
    queryKey: ['franchise-tiers'],
    queryFn: async () => {
      const response = await fetch('/api/franchise-tiers');
      if (!response.ok) throw new Error('Failed to fetch tiers');
      return response.json();
    }
  });

  const submitApplication = useMutation({
    mutationFn: async (data: typeof formData & { requestedTierId: number }) => {
      const response = await fetch('/api/franchise-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to submit application');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted!",
        description: "Our franchise team will review your application and contact you within 24-48 hours.",
      });
      setShowApplication(false);
      setFormData({
        companyName: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        website: '',
        businessType: '',
        currentLocations: 1,
        estimatedWorkersPerMonth: 0,
        currentSoftware: '',
        requestedTerritoryState: '',
        requestedTerritoryRegion: '',
      });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive"
      });
    }
  });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(cents / 100);
  };

  const getTierIcon = (tierCode: string) => {
    switch (tierCode) {
      case 'standard': return Building2;
      case 'premium': return Star;
      case 'enterprise': return Crown;
      default: return Building2;
    }
  };

  const getTierGradient = (tierCode: string) => {
    switch (tierCode) {
      case 'standard': return 'from-blue-500 to-cyan-500';
      case 'premium': return 'from-purple-500 to-pink-500';
      case 'enterprise': return 'from-amber-500 to-orange-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTierBorder = (tierCode: string) => {
    switch (tierCode) {
      case 'standard': return 'border-cyan-500/50 hover:border-cyan-400';
      case 'premium': return 'border-purple-500/50 hover:border-purple-400';
      case 'enterprise': return 'border-amber-500/50 hover:border-amber-400';
      default: return 'border-gray-500/50';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;
    submitApplication.mutate({
      ...formData,
      requestedTierId: selectedTier.id
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-cyan-400">Loading franchise opportunities...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <Link href="/pricing">
          <Button variant="ghost" className="mb-6 text-gray-400 hover:text-white" data-testid="button-back-pricing">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pricing
          </Button>
        </Link>

        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border-cyan-500/30">
            Franchise Opportunity
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
            Own Your Territory
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Take full ownership of your ORBIT deployment with exclusive territory rights, 
            complete white-label branding, and perpetual revenue from NFT certifications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
          <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                <Lock className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Subscriber Managed</h3>
                <p className="text-gray-400 text-sm">
                  ORBIT retains hallmark custody. You pay monthly SaaS fees with no upfront costs. 
                  Perfect for testing the platform.
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <Crown className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Franchise Owned</h3>
                <p className="text-gray-400 text-sm">
                  Full hallmark custody transfer to you. One-time franchise fee, reduced royalties, 
                  and permanent ownership of your territory.
                </p>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-8">Choose Your Franchise Tier</h2>

        <div className="relative">
          <button
            onClick={() => scrollCarousel(tierCarouselRef, 'left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 sm:hidden w-10 h-10 rounded-full bg-gray-800/90 border border-gray-600 flex items-center justify-center text-white hover:bg-gray-700 transition-colors shadow-lg"
            aria-label="Scroll left"
            data-testid="button-tier-scroll-left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scrollCarousel(tierCarouselRef, 'right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 sm:hidden w-10 h-10 rounded-full bg-gray-800/90 border border-gray-600 flex items-center justify-center text-white hover:bg-gray-700 transition-colors shadow-lg"
            aria-label="Scroll right"
            data-testid="button-tier-scroll-right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        <div ref={tierCarouselRef} className="flex flex-row flex-nowrap gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 px-8 sm:px-0 sm:grid sm:grid-cols-3 sm:overflow-visible">
          {tiers?.map((tier) => {
            const Icon = getTierIcon(tier.tierCode);
            const isSelected = selectedTier?.id === tier.id;
            
            return (
              <Card 
                key={tier.id}
                className={`relative flex-shrink-0 w-[320px] sm:w-auto snap-start transition-all duration-300 cursor-pointer bg-gray-800/80 backdrop-blur border-2 ${getTierBorder(tier.tierCode)} ${isSelected ? 'ring-2 ring-cyan-400 scale-[1.02]' : ''}`}
                onClick={() => setSelectedTier(tier)}
                data-testid={`card-tier-${tier.tierCode}`}
              >
                {tier.tierCode === 'premium' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getTierGradient(tier.tierCode)} flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-white">{tier.tierName}</CardTitle>
                  <CardDescription className="text-gray-400">{tier.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white">{formatCurrency(tier.franchiseFee)}</div>
                    <div className="text-gray-400 text-sm">one-time franchise fee</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-lg bg-gray-700/50">
                      <div className="text-gray-400">Royalty</div>
                      <div className="text-white font-semibold">{tier.royaltyPercent}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-700/50">
                      <div className="text-gray-400">Support Fee</div>
                      <div className="text-white font-semibold">{formatCurrency(tier.supportMonthlyFee)}/mo</div>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-700/50">
                      <div className="text-gray-400">NFT Revenue</div>
                      <div className="text-white font-semibold">{tier.nftRevenueSharePercent}%</div>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-700/50">
                      <div className="text-gray-400">Territory</div>
                      <div className="text-white font-semibold capitalize">{tier.territoryLevel}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <FeatureItem included={true}>All Platform Modules Included</FeatureItem>
                    <FeatureItem included={tier.territoryExclusive}>Exclusive Territory Rights</FeatureItem>
                    <FeatureItem included={tier.whitelabelApp}>White-Label Mobile App</FeatureItem>
                    <FeatureItem included={tier.dedicatedAccountManager}>Dedicated Account Manager</FeatureItem>
                    <FeatureItem included={tier.subFranchiseRights}>Sub-Franchise Rights</FeatureItem>
                    <FeatureItem included={tier.customApiAccess}>Custom API Access</FeatureItem>
                    <FeatureItem included={tier.priorityFeatureRequests}>Priority Feature Requests</FeatureItem>
                    <FeatureItem included={tier.maxLocations === -1}>
                      {tier.maxLocations === -1 ? 'Unlimited Locations' : `Up to ${tier.maxLocations} Location${tier.maxLocations > 1 ? 's' : ''}`}
                    </FeatureItem>
                    <FeatureItem included={tier.supportResponseHours <= 24}>
                      {tier.supportResponseHours}hr Support Response
                    </FeatureItem>
                  </div>
                  
                  <Button 
                    className={`w-full ${isSelected ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'bg-gray-700 hover:bg-gray-600'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTier(tier);
                      setShowApplication(true);
                    }}
                    data-testid={`button-select-${tier.tierCode}`}
                  >
                    {isSelected ? 'Selected' : 'Select Plan'}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        </div>

        <div className="sm:hidden flex justify-center mt-2 mb-4">
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <span>Scroll for more</span>
            <ChevronRight className="h-4 w-4 animate-pulse" />
          </div>
        </div>

        {showApplication && selectedTier && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <Card className="w-full max-w-2xl bg-gray-800 border-gray-700 my-8">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center gap-3">
                  <Award className="h-6 w-6 text-cyan-400" />
                  Franchise Application
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Apply for the {selectedTier.tierName} franchise tier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Company Name *</label>
                      <Input 
                        value={formData.companyName}
                        onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Your Company Name"
                        data-testid="input-company-name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Contact Name *</label>
                      <Input 
                        value={formData.contactName}
                        onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Your Full Name"
                        data-testid="input-contact-name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
                      <Input 
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="you@company.com"
                        data-testid="input-contact-email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                      <Input 
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="(555) 123-4567"
                        data-testid="input-contact-phone"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                      <Input 
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="https://yourcompany.com"
                        data-testid="input-website"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Business Type</label>
                      <Select 
                        value={formData.businessType} 
                        onValueChange={(v) => setFormData({...formData, businessType: v})}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white" data-testid="select-business-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          {BUSINESS_TYPES.map(type => (
                            <SelectItem key={type} value={type} className="text-white hover:bg-gray-600">
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Current Locations</label>
                      <Input 
                        type="number"
                        min="1"
                        value={formData.currentLocations}
                        onChange={(e) => setFormData({...formData, currentLocations: parseInt(e.target.value) || 1})}
                        className="bg-gray-700 border-gray-600 text-white"
                        data-testid="input-locations"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Est. Workers/Month</label>
                      <Input 
                        type="number"
                        min="0"
                        value={formData.estimatedWorkersPerMonth}
                        onChange={(e) => setFormData({...formData, estimatedWorkersPerMonth: parseInt(e.target.value) || 0})}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="100"
                        data-testid="input-workers-per-month"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Requested Territory (State)</label>
                      <Select 
                        value={formData.requestedTerritoryState} 
                        onValueChange={(v) => {
                          setFormData({...formData, requestedTerritoryState: v});
                          setTerritoryChecked(false);
                        }}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white" data-testid="select-territory-state">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600 max-h-[300px]">
                          {US_STATES.map(state => (
                            <SelectItem key={state.code} value={state.code} className="text-white hover:bg-gray-600">
                              {state.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Territory Region/City</label>
                      <Input 
                        value={formData.requestedTerritoryRegion}
                        onChange={(e) => {
                          setFormData({...formData, requestedTerritoryRegion: e.target.value});
                          setTerritoryChecked(false);
                        }}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="e.g., Nashville Metro"
                        data-testid="input-territory-region"
                      />
                    </div>
                  </div>

                  {formData.requestedTerritoryState && selectedTier && (
                    <div className="p-4 rounded-lg bg-gray-700/50 border border-gray-600">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-white flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-cyan-400" />
                          Territory Availability Check
                        </h4>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => checkTerritory()}
                          disabled={checkingTerritory}
                          className="bg-cyan-500 hover:bg-cyan-600 text-white"
                          data-testid="button-check-territory"
                        >
                          {checkingTerritory ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              Checking...
                            </>
                          ) : (
                            <>Check Availability</>
                          )}
                        </Button>
                      </div>
                      
                      {territoryChecked && territoryAvailability && (
                        <div className={`p-3 rounded-lg ${
                          territoryAvailability.available 
                            ? 'bg-green-500/10 border border-green-500/30' 
                            : 'bg-red-500/10 border border-red-500/30'
                        }`}>
                          <div className="flex items-center gap-2">
                            {territoryAvailability.available ? (
                              <>
                                <CheckCircle className="h-5 w-5 text-green-400" />
                                <div>
                                  <div className="font-medium text-green-400">Territory Available!</div>
                                  <div className="text-sm text-gray-400">
                                    {territoryAvailability.isExclusive ? 'Exclusive' : 'Standard'} {territoryAvailability.territoryLevel}-level territory in {US_STATES.find(s => s.code === formData.requestedTerritoryState)?.name}
                                    {formData.requestedTerritoryRegion && ` (${formData.requestedTerritoryRegion})`}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-5 w-5 text-red-400" />
                                <div>
                                  <div className="font-medium text-red-400">Territory Unavailable</div>
                                  {territoryAvailability.conflicts.map((conflict, i) => (
                                    <div key={i} className="text-sm text-gray-400">
                                      {conflict.reason}
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {!territoryChecked && (
                        <div className="text-sm text-gray-400">
                          Click "Check Availability" to verify your selected territory is open for franchise ownership.
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Current Software</label>
                    <Input 
                      value={formData.currentSoftware}
                      onChange={(e) => setFormData({...formData, currentSoftware: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="What staffing software do you currently use?"
                      data-testid="input-current-software"
                    />
                  </div>
                  
                  <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                    <h4 className="font-semibold text-cyan-300 mb-2">Selected Tier: {selectedTier.tierName}</h4>
                    <div className="text-sm text-gray-400 space-y-1">
                      <div>Franchise Fee: {formatCurrency(selectedTier.franchiseFee)}</div>
                      <div>Monthly Support: {formatCurrency(selectedTier.supportMonthlyFee)}/mo</div>
                      <div>Royalty: {selectedTier.royaltyPercent} of billable revenue</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button 
                      type="button"
                      variant="outline" 
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                      onClick={() => setShowApplication(false)}
                      data-testid="button-cancel-application"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                      disabled={submitApplication.isPending}
                      data-testid="button-submit-application"
                    >
                      {submitApplication.isPending ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-16 max-w-5xl mx-auto">
          <h3 className="text-xl font-bold text-white text-center mb-6">Why Choose ORBIT Franchise?</h3>
          <div className="relative">
            <button
              onClick={() => scrollCarousel(benefitsCarouselRef, 'left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 sm:hidden w-10 h-10 rounded-full bg-gray-800/90 border border-gray-600 flex items-center justify-center text-white hover:bg-gray-700 transition-colors shadow-lg"
              aria-label="Scroll left"
              data-testid="button-benefits-scroll-left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scrollCarousel(benefitsCarouselRef, 'right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 sm:hidden w-10 h-10 rounded-full bg-gray-800/90 border border-gray-600 flex items-center justify-center text-white hover:bg-gray-700 transition-colors shadow-lg"
              aria-label="Scroll right"
              data-testid="button-benefits-scroll-right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div ref={benefitsCarouselRef} className="flex flex-row flex-nowrap gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 px-8 sm:px-0 sm:grid sm:grid-cols-3 sm:overflow-visible">
              <Card className="flex-shrink-0 w-[280px] sm:w-auto snap-start bg-gray-800/50 border-gray-700 hover:border-green-500/50 transition-colors">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Perpetual Revenue</h3>
                  <p className="text-gray-400 text-sm">
                    Earn ongoing revenue from NFT worker certifications. Your franchise fee pays for itself.
                  </p>
                </CardContent>
              </Card>
              <Card className="flex-shrink-0 w-[280px] sm:w-auto snap-start bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-colors">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
                    <Globe className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Your Brand, Your Platform</h3>
                  <p className="text-gray-400 text-sm">
                    Complete white-label branding with your logo, colors, and domain. Clients see your brand.
                  </p>
                </CardContent>
              </Card>
              <Card className="flex-shrink-0 w-[280px] sm:w-auto snap-start bg-gray-800/50 border-gray-700 hover:border-cyan-500/50 transition-colors">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Protected Territory</h3>
                  <p className="text-gray-400 text-sm">
                    Exclusive territory rights ensure no competition from other ORBIT franchisees in your region.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">Have questions? Our franchise team is ready to help.</p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700" data-testid="button-call-franchise">
              <Phone className="h-4 w-4 mr-2" />
              Call Us
            </Button>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700" data-testid="button-email-franchise">
              <Mail className="h-4 w-4 mr-2" />
              Email Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ children, included }: { children: React.ReactNode; included: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-sm ${included ? 'text-gray-300' : 'text-gray-500'}`}>
      {included ? (
        <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
      ) : (
        <div className="h-4 w-4 rounded-full border border-gray-600 flex-shrink-0" />
      )}
      <span>{children}</span>
    </div>
  );
}
