import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Shield, Crown, Building2, MapPin, Calendar,
  DollarSign, FileText, Settings, Users, TrendingUp, 
  CheckCircle2, Clock, AlertCircle, CreditCard, Globe,
  Zap, Award, Lock, Unlock, ChevronRight, ExternalLink
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface CustomerHallmark {
  id: number;
  stripeCustomerId: string;
  hallmarkName: string;
  ownershipMode: 'subscriber_managed' | 'franchise_owned';
  franchiseTierId: number | null;
  territoryRegion: string | null;
  brandLogo: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  customDomain: string | null;
  franchiseAgreementUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FranchiseTier {
  id: number;
  tierCode: string;
  tierName: string;
  description: string;
  franchiseFee: number;
  royaltyPercent: string;
  supportMonthlyFee: number;
  territoryLevel: string;
  nftRevenueSharePercent: number;
  whitelabelApp: boolean;
  dedicatedAccountManager: boolean;
}

interface FranchisePayment {
  id: number;
  hallmarkId: number;
  paymentType: string;
  amount: number;
  status: string;
  periodStart: string | null;
  periodEnd: string | null;
  createdAt: string;
  paidAt: string | null;
}

interface FranchiseTerritory {
  id: number;
  hallmarkId: number;
  territoryName: string;
  territoryType: string;
  state: string;
  cities: string[] | null;
  zipCodes: string[] | null;
  isActive: boolean;
}

export default function CustomerHallmarkManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: hallmark, isLoading: hallmarkLoading } = useQuery<CustomerHallmark>({
    queryKey: ['my-hallmark'],
    queryFn: async () => {
      const response = await fetch('/api/my-hallmark');
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch hallmark');
      }
      return response.json();
    }
  });

  const { data: tier } = useQuery<FranchiseTier>({
    queryKey: ['franchise-tier', hallmark?.franchiseTierId],
    queryFn: async () => {
      if (!hallmark?.franchiseTierId) return null;
      const response = await fetch(`/api/franchise-tiers/${hallmark.franchiseTierId}`);
      if (!response.ok) throw new Error('Failed to fetch tier');
      return response.json();
    },
    enabled: !!hallmark?.franchiseTierId
  });

  const { data: payments = [] } = useQuery<FranchisePayment[]>({
    queryKey: ['franchise-payments', hallmark?.id],
    queryFn: async () => {
      if (!hallmark?.id) return [];
      const response = await fetch(`/api/my-hallmark/payments`);
      if (!response.ok) throw new Error('Failed to fetch payments');
      return response.json();
    },
    enabled: !!hallmark?.id
  });

  const { data: territories = [] } = useQuery<FranchiseTerritory[]>({
    queryKey: ['franchise-territories', hallmark?.id],
    queryFn: async () => {
      if (!hallmark?.id) return [];
      const response = await fetch(`/api/my-hallmark/territories`);
      if (!response.ok) throw new Error('Failed to fetch territories');
      return response.json();
    },
    enabled: !!hallmark?.id
  });

  const startSupportSubscription = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/franchise/support-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hallmarkId: hallmark?.id })
      });
      if (!response.ok) throw new Error('Failed to create subscription');
      return response.json();
    },
    onSuccess: (data) => {
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start subscription. Please try again.",
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (hallmarkLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-cyan-400">Loading your hallmark...</div>
      </div>
    );
  }

  if (!hallmark) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <Link href="/owner-hub">
            <Button variant="ghost" className="mb-6 text-gray-400 hover:text-white" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Owner Hub
            </Button>
          </Link>
          
          <Card className="max-w-2xl mx-auto bg-gray-800/50 border-gray-700">
            <CardContent className="pt-12 pb-8 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-700/50 flex items-center justify-center mx-auto mb-6">
                <Shield className="h-10 w-10 text-gray-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">No Hallmark Found</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                You don't have an ORBIT hallmark yet. Subscribe to a plan or apply for a franchise to get started.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/pricing">
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-500" data-testid="button-view-pricing">
                    View Pricing Plans
                  </Button>
                </Link>
                <Link href="/franchise">
                  <Button variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10" data-testid="button-franchise-info">
                    <Crown className="h-4 w-4 mr-2" />
                    Franchise Information
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isFranchise = hallmark.ownershipMode === 'franchise_owned';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <Link href="/owner-hub">
          <Button variant="ghost" className="mb-6 text-gray-400 hover:text-white" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Owner Hub
          </Button>
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/3">
            <Card className={`bg-gradient-to-br ${isFranchise ? 'from-purple-900/50 to-pink-900/30 border-purple-500/30' : 'from-cyan-900/50 to-blue-900/30 border-cyan-500/30'}`}>
              <CardHeader className="text-center pb-4">
                <div className={`w-20 h-20 rounded-2xl ${isFranchise ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-cyan-500 to-blue-500'} flex items-center justify-center mx-auto mb-4`}>
                  {isFranchise ? (
                    <Crown className="h-10 w-10 text-white" />
                  ) : (
                    <Shield className="h-10 w-10 text-white" />
                  )}
                </div>
                <CardTitle className="text-2xl text-white">{hallmark.hallmarkName}</CardTitle>
                <Badge className={`${isFranchise ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'}`}>
                  {isFranchise ? 'Franchise Owner' : 'Subscriber Managed'}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {tier && (
                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <div className="text-sm text-gray-400 mb-1">Franchise Tier</div>
                    <div className="text-white font-semibold">{tier.tierName}</div>
                    <div className="text-xs text-gray-500 mt-1">{tier.description}</div>
                  </div>
                )}
                
                {hallmark.territoryRegion && (
                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Territory</span>
                    </div>
                    <div className="text-white font-semibold">{hallmark.territoryRegion}</div>
                  </div>
                )}
                
                <div className="p-4 rounded-lg bg-gray-800/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Member Since</span>
                  </div>
                  <div className="text-white font-semibold">{formatDate(hallmark.createdAt)}</div>
                </div>
                
                <div className="p-4 rounded-lg bg-gray-800/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">Status</span>
                    {hallmark.isActive ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
                
                {isFranchise && !hallmark.franchiseAgreementUrl && (
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                    onClick={() => startSupportSubscription.mutate()}
                    disabled={startSupportSubscription.isPending}
                    data-testid="button-start-subscription"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {startSupportSubscription.isPending ? 'Processing...' : 'Start Support Subscription'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:w-2/3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-gray-800 border border-gray-700 p-1">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
                  data-testid="tab-overview"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="payments" 
                  className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
                  data-testid="tab-payments"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Payments
                </TabsTrigger>
                {isFranchise && (
                  <TabsTrigger 
                    value="territory" 
                    className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
                    data-testid="tab-territory"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Territory
                  </TabsTrigger>
                )}
                <TabsTrigger 
                  value="branding" 
                  className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
                  data-testid="tab-branding"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Branding
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {isFranchise && tier && (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Award className="h-5 w-5 text-purple-400" />
                        Franchise Benefits
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <BenefitCard 
                          icon={DollarSign}
                          label="NFT Revenue Share"
                          value={`${tier.nftRevenueSharePercent}%`}
                          active={true}
                        />
                        <BenefitCard 
                          icon={MapPin}
                          label="Territory Level"
                          value={tier.territoryLevel}
                          active={true}
                        />
                        <BenefitCard 
                          icon={Zap}
                          label="Royalty Rate"
                          value={tier.royaltyPercent}
                          active={true}
                        />
                        <BenefitCard 
                          icon={Globe}
                          label="White-Label App"
                          value={tier.whitelabelApp ? 'Included' : 'Not Included'}
                          active={tier.whitelabelApp}
                        />
                        <BenefitCard 
                          icon={Users}
                          label="Account Manager"
                          value={tier.dedicatedAccountManager ? 'Dedicated' : 'Shared'}
                          active={tier.dedicatedAccountManager}
                        />
                        <BenefitCard 
                          icon={CreditCard}
                          label="Monthly Support"
                          value={formatCurrency(tier.supportMonthlyFee)}
                          active={true}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <StatCard label="Total Payments" value={payments.length.toString()} />
                      <StatCard label="Active Territories" value={territories.filter(t => t.isActive).length.toString()} />
                      <StatCard 
                        label="Total Paid" 
                        value={formatCurrency(payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0))} 
                      />
                      <StatCard 
                        label="Days Active" 
                        value={Math.floor((Date.now() - new Date(hallmark.createdAt).getTime()) / (1000 * 60 * 60 * 24)).toString()} 
                      />
                    </div>
                  </CardContent>
                </Card>

                {!isFranchise && (
                  <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/30">
                    <CardContent className="py-6">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">Upgrade to Franchise</h3>
                          <p className="text-gray-400">
                            Take full ownership of your hallmark with exclusive territory rights and NFT revenue sharing.
                          </p>
                        </div>
                        <Link href="/franchise">
                          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 whitespace-nowrap" data-testid="button-upgrade-franchise">
                            View Franchise Options
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="payments" className="space-y-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Payment History</CardTitle>
                    <CardDescription className="text-gray-400">
                      All franchise fees, royalties, and support payments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {payments.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No payment history yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {payments.map((payment) => (
                          <div 
                            key={payment.id}
                            className="flex items-center justify-between p-4 rounded-lg bg-gray-700/50"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                payment.paymentType === 'franchise_fee' 
                                  ? 'bg-purple-500/20' 
                                  : payment.paymentType === 'royalty'
                                  ? 'bg-amber-500/20'
                                  : 'bg-cyan-500/20'
                              }`}>
                                {payment.paymentType === 'franchise_fee' ? (
                                  <Crown className="h-5 w-5 text-purple-400" />
                                ) : payment.paymentType === 'royalty' ? (
                                  <TrendingUp className="h-5 w-5 text-amber-400" />
                                ) : (
                                  <Zap className="h-5 w-5 text-cyan-400" />
                                )}
                              </div>
                              <div>
                                <div className="text-white font-medium capitalize">
                                  {payment.paymentType.replace('_', ' ')}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {formatDate(payment.createdAt)}
                                  {payment.periodStart && payment.periodEnd && (
                                    <span className="ml-2">
                                      ({formatDate(payment.periodStart)} - {formatDate(payment.periodEnd)})
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-semibold">{formatCurrency(payment.amount)}</div>
                              <Badge className={`text-xs ${
                                payment.status === 'paid' 
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                  : payment.status === 'pending'
                                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                  : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                              }`}>
                                {payment.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {isFranchise && (
                <TabsContent value="territory" className="space-y-6">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Your Territories</CardTitle>
                      <CardDescription className="text-gray-400">
                        Exclusive territories assigned to your franchise
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {territories.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No territories assigned yet</p>
                          <p className="text-sm mt-2">Contact support to claim your territory</p>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {territories.map((territory) => (
                            <div 
                              key={territory.id}
                              className="p-4 rounded-lg bg-gray-700/50 border border-gray-600"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-white font-semibold">{territory.territoryName}</h4>
                                    <Badge className={`text-xs ${
                                      territory.isActive 
                                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                        : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                    }`}>
                                      {territory.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    {territory.territoryType.charAt(0).toUpperCase() + territory.territoryType.slice(1)} • {territory.state}
                                  </div>
                                </div>
                                {territory.isActive && (
                                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <Shield className="h-5 w-5 text-green-400" />
                                  </div>
                                )}
                              </div>
                              {territory.cities && territory.cities.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-600">
                                  <div className="text-xs text-gray-500 mb-1">Cities Included:</div>
                                  <div className="flex flex-wrap gap-2">
                                    {(territory.cities as string[]).map((city, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs border-gray-600 text-gray-300">
                                        {city}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              <TabsContent value="branding" className="space-y-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Brand Settings</CardTitle>
                    <CardDescription className="text-gray-400">
                      Customize how your hallmark appears to workers and clients
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 rounded-lg bg-gray-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400">Custom Domain</span>
                          {isFranchise && tier?.whitelabelApp ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              <Unlock className="h-3 w-3 mr-1" />
                              Available
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                              <Lock className="h-3 w-3 mr-1" />
                              Upgrade Required
                            </Badge>
                          )}
                        </div>
                        {hallmark.customDomain ? (
                          <div className="text-white font-medium">{hallmark.customDomain}</div>
                        ) : (
                          <div className="text-gray-500 text-sm">Not configured</div>
                        )}
                      </div>
                      
                      <div className="p-4 rounded-lg bg-gray-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400">Brand Colors</span>
                          {isFranchise ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              <Unlock className="h-3 w-3 mr-1" />
                              Customizable
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                              <Lock className="h-3 w-3 mr-1" />
                              Default
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded-lg border border-gray-600"
                            style={{ backgroundColor: hallmark.primaryColor || '#06b6d4' }}
                          />
                          <div 
                            className="w-8 h-8 rounded-lg border border-gray-600"
                            style={{ backgroundColor: hallmark.secondaryColor || '#8b5cf6' }}
                          />
                          <span className="text-gray-500 text-sm ml-2">
                            {hallmark.primaryColor && hallmark.secondaryColor ? 'Custom' : 'Default ORBIT theme'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">Brand Logo</span>
                        {isFranchise ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <Unlock className="h-3 w-3 mr-1" />
                            Customizable
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                            <Lock className="h-3 w-3 mr-1" />
                            ORBIT Branding
                          </Badge>
                        )}
                      </div>
                      {hallmark.brandLogo ? (
                        <img src={hallmark.brandLogo} alt="Brand Logo" className="h-16 object-contain" />
                      ) : (
                        <div className="text-gray-500 text-sm">Using default ORBIT branding</div>
                      )}
                    </div>

                    {isFranchise && (
                      <Button className="w-full bg-gray-700 hover:bg-gray-600" data-testid="button-edit-branding">
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Brand Settings
                      </Button>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="py-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                        <Shield className="h-6 w-6 text-cyan-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">Powered by ORBIT</h4>
                        <p className="text-gray-400 text-sm">
                          All outputs include a non-removable "Powered by ORBIT" hallmark for verification and quality assurance. 
                          This protects both you and your clients.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

function BenefitCard({ icon: Icon, label, value, active }: { icon: any; label: string; value: string; active: boolean }) {
  return (
    <div className={`p-4 rounded-lg ${active ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-gray-700/50 border border-gray-600'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${active ? 'text-purple-400' : 'text-gray-500'}`} />
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className={`font-semibold ${active ? 'text-white' : 'text-gray-500'}`}>{value}</div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-lg bg-gray-700/50 text-center">
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
}
