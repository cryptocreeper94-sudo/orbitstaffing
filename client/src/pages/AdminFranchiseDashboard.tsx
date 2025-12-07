import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, Crown, Building2, MapPin, Users, DollarSign,
  CheckCircle2, Clock, XCircle, Search, Filter, ChevronRight,
  FileText, TrendingUp, AlertCircle, Eye, ThumbsUp, ThumbsDown,
  Globe, Shield, Mail, Phone, Calendar, ExternalLink
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { BentoGrid, BentoTile } from '@/components/ui/bento-grid';
import { CarouselRail } from '@/components/ui/carousel-rail';
import { PageHeader } from '@/components/ui/section-header';
import { OrbitCard, OrbitCardContent, OrbitCardHeader, OrbitCardTitle, StatCard } from '@/components/ui/orbit-card';

interface FranchiseApplication {
  id: number;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  website: string | null;
  businessType: string | null;
  currentLocations: number;
  estimatedWorkersPerMonth: number | null;
  currentSoftware: string | null;
  requestedTierId: number | null;
  requestedTerritoryRegion: string | null;
  requestedTerritoryState: string | null;
  status: string;
  source: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

interface CustomerHallmark {
  id: number;
  stripeCustomerId: string;
  hallmarkName: string;
  ownershipMode: string;
  franchiseTierId: number | null;
  territoryRegion: string | null;
  isActive: boolean;
  createdAt: string;
}

interface FranchiseTier {
  id: number;
  tierCode: string;
  tierName: string;
  franchiseFee: number;
  royaltyPercent: string;
  supportMonthlyFee: number;
}

export default function AdminFranchiseDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('applications');
  const [selectedApplication, setSelectedApplication] = useState<FranchiseApplication | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: applications = [], isLoading: applicationsLoading } = useQuery<FranchiseApplication[]>({
    queryKey: ['franchise-applications'],
    queryFn: async () => {
      const response = await fetch('/api/admin/franchise-applications');
      if (!response.ok) throw new Error('Failed to fetch applications');
      return response.json();
    }
  });

  const { data: hallmarks = [], isLoading: hallmarksLoading } = useQuery<CustomerHallmark[]>({
    queryKey: ['customer-hallmarks'],
    queryFn: async () => {
      const response = await fetch('/api/admin/customer-hallmarks');
      if (!response.ok) throw new Error('Failed to fetch hallmarks');
      return response.json();
    }
  });

  const { data: tiers = [] } = useQuery<FranchiseTier[]>({
    queryKey: ['franchise-tiers'],
    queryFn: async () => {
      const response = await fetch('/api/franchise-tiers');
      if (!response.ok) throw new Error('Failed to fetch tiers');
      return response.json();
    }
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      const response = await fetch(`/api/admin/franchise-applications/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      if (!response.ok) throw new Error('Failed to approve application');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Application Approved", description: "The franchise application has been approved." });
      queryClient.invalidateQueries({ queryKey: ['franchise-applications'] });
      setShowApproveDialog(false);
      setSelectedApplication(null);
      setApprovalNotes('');
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to approve application.", variant: "destructive" });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      const response = await fetch(`/api/admin/franchise-applications/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (!response.ok) throw new Error('Failed to reject application');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Application Rejected", description: "The franchise application has been rejected." });
      queryClient.invalidateQueries({ queryKey: ['franchise-applications'] });
      setShowRejectDialog(false);
      setSelectedApplication(null);
      setRejectReason('');
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to reject application.", variant: "destructive" });
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTierName = (tierId: number | null) => {
    if (!tierId) return 'Not specified';
    const tier = tiers.find(t => t.id === tierId);
    return tier?.tierName || 'Unknown';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'completed':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30"><Crown className="h-3 w-3 mr-1" />Completed</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">{status}</Badge>;
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchQuery === '' || 
      app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.contactName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const approvedCount = applications.filter(a => a.status === 'approved').length;
  const franchiseHallmarks = hallmarks.filter(h => h.ownershipMode === 'franchise_owned');

  const statCards = [
    { label: "Pending Applications", value: pendingCount, icon: <Clock className="h-6 w-6" />, className: "border-yellow-500/30" },
    { label: "Approved", value: approvedCount, icon: <CheckCircle2 className="h-6 w-6" />, className: "border-green-500/30" },
    { label: "Active Franchises", value: franchiseHallmarks.length, icon: <Crown className="h-6 w-6" />, className: "border-purple-500/30" },
    { label: "Total Hallmarks", value: hallmarks.length, icon: <Shield className="h-6 w-6" />, className: "border-cyan-500/30" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Franchise Management"
          subtitle="Manage franchise applications, hallmarks, and territories"
          breadcrumb={
            <Link href="/admin">
              <Button variant="ghost" className="text-gray-400 hover:text-white -ml-2" data-testid="button-back">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
          }
        />

        <div className="hidden md:block mb-8">
          <BentoGrid cols={4} gap="md">
            {statCards.map((stat) => (
              <BentoTile key={stat.label} className={stat.className}>
                <StatCard
                  label={stat.label}
                  value={stat.value}
                  icon={stat.icon}
                  className="border-0 bg-transparent"
                />
              </BentoTile>
            ))}
          </BentoGrid>
        </div>

        <div className="md:hidden mb-8">
          <CarouselRail gap="md" itemWidth="md" showArrows={false}>
            {statCards.map((stat) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                className={stat.className}
              />
            ))}
          </CarouselRail>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-800 border border-gray-700 p-1">
            <TabsTrigger 
              value="applications" 
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
              data-testid="tab-applications"
            >
              <FileText className="h-4 w-4 mr-2" />
              Applications
              {pendingCount > 0 && (
                <Badge className="ml-2 bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="hallmarks" 
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
              data-testid="tab-hallmarks"
            >
              <Shield className="h-4 w-4 mr-2" />
              Hallmarks
            </TabsTrigger>
            <TabsTrigger 
              value="tiers" 
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
              data-testid="tab-tiers"
            >
              <Crown className="h-4 w-4 mr-2" />
              Tiers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by company, contact, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                  data-testid="input-search"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {['all', 'pending', 'approved', 'rejected', 'completed'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className={statusFilter === status 
                      ? 'bg-cyan-500 text-white' 
                      : 'border-gray-600 text-gray-400 hover:text-white'}
                    data-testid={`filter-${status}`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {applicationsLoading ? (
              <div className="text-center py-12 text-gray-400">Loading applications...</div>
            ) : filteredApplications.length === 0 ? (
              <OrbitCard>
                <OrbitCardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                  <p className="text-gray-400">No applications found</p>
                </OrbitCardContent>
              </OrbitCard>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app) => (
                  <OrbitCard key={app.id}>
                    <OrbitCardContent>
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{app.companyName}</h3>
                            {getStatusBadge(app.status)}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Contact:</span>
                              <div className="text-gray-300">{app.contactName}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Email:</span>
                              <div className="text-gray-300">{app.contactEmail}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Tier:</span>
                              <div className="text-gray-300">{getTierName(app.requestedTierId)}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Territory:</span>
                              <div className="text-gray-300">{app.requestedTerritoryState || 'Not specified'}</div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            Applied: {formatDate(app.createdAt)}
                            {app.source && <span className="ml-4">Source: {app.source}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-gray-600 text-gray-300"
                                onClick={() => setSelectedApplication(app)}
                                data-testid={`button-view-${app.id}`}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-white">{app.companyName}</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                  Franchise Application Details
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm text-gray-500">Contact Name</label>
                                    <div className="text-white">{app.contactName}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm text-gray-500">Email</label>
                                    <div className="text-white">{app.contactEmail}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm text-gray-500">Phone</label>
                                    <div className="text-white">{app.contactPhone || 'Not provided'}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm text-gray-500">Website</label>
                                    <div className="text-white">{app.website || 'Not provided'}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm text-gray-500">Business Type</label>
                                    <div className="text-white">{app.businessType || 'Not specified'}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm text-gray-500">Current Locations</label>
                                    <div className="text-white">{app.currentLocations}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm text-gray-500">Est. Workers/Month</label>
                                    <div className="text-white">{app.estimatedWorkersPerMonth || 'Not specified'}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm text-gray-500">Current Software</label>
                                    <div className="text-white">{app.currentSoftware || 'Not specified'}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm text-gray-500">Requested Tier</label>
                                    <div className="text-white">{getTierName(app.requestedTierId)}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm text-gray-500">Requested Territory</label>
                                    <div className="text-white">
                                      {app.requestedTerritoryRegion ? `${app.requestedTerritoryRegion}, ` : ''}
                                      {app.requestedTerritoryState || 'Not specified'}
                                    </div>
                                  </div>
                                </div>
                                {app.reviewNotes && (
                                  <div>
                                    <label className="text-sm text-gray-500">Review Notes</label>
                                    <div className="text-white bg-gray-700/50 p-3 rounded mt-1">{app.reviewNotes}</div>
                                  </div>
                                )}
                                {app.rejectionReason && (
                                  <div>
                                    <label className="text-sm text-gray-500">Rejection Reason</label>
                                    <div className="text-red-400 bg-red-500/10 p-3 rounded mt-1">{app.rejectionReason}</div>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          {app.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                  setSelectedApplication(app);
                                  setShowApproveDialog(true);
                                }}
                                data-testid={`button-approve-${app.id}`}
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => {
                                  setSelectedApplication(app);
                                  setShowRejectDialog(true);
                                }}
                                data-testid={`button-reject-${app.id}`}
                              >
                                <ThumbsDown className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </OrbitCardContent>
                  </OrbitCard>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="hallmarks" className="space-y-6">
            {hallmarksLoading ? (
              <div className="text-center py-12 text-gray-400">Loading hallmarks...</div>
            ) : hallmarks.length === 0 ? (
              <OrbitCard>
                <OrbitCardContent className="py-12 text-center">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                  <p className="text-gray-400">No hallmarks found</p>
                </OrbitCardContent>
              </OrbitCard>
            ) : (
              <div className="grid gap-4">
                {hallmarks.map((hallmark) => (
                  <OrbitCard 
                    key={hallmark.id} 
                    className={hallmark.ownershipMode === 'franchise_owned' 
                      ? 'border-purple-500/30' 
                      : ''
                    }
                  >
                    <OrbitCardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            hallmark.ownershipMode === 'franchise_owned'
                              ? 'bg-purple-500/20'
                              : 'bg-cyan-500/20'
                          }`}>
                            {hallmark.ownershipMode === 'franchise_owned' ? (
                              <Crown className="h-6 w-6 text-purple-400" />
                            ) : (
                              <Shield className="h-6 w-6 text-cyan-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{hallmark.hallmarkName}</h3>
                            <div className="flex items-center gap-3 text-sm flex-wrap">
                              <Badge className={`${
                                hallmark.ownershipMode === 'franchise_owned'
                                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                              }`}>
                                {hallmark.ownershipMode === 'franchise_owned' ? 'Franchise' : 'Subscriber'}
                              </Badge>
                              {hallmark.franchiseTierId && (
                                <span className="text-gray-400">
                                  Tier: {getTierName(hallmark.franchiseTierId)}
                                </span>
                              )}
                              {hallmark.territoryRegion && (
                                <span className="text-gray-400">
                                  <MapPin className="h-3 w-3 inline mr-1" />
                                  {hallmark.territoryRegion}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={hallmark.isActive 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                          }>
                            {hallmark.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button variant="outline" size="sm" className="border-gray-600 text-gray-300" data-testid={`button-manage-${hallmark.id}`}>
                            Manage
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </OrbitCardContent>
                  </OrbitCard>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tiers" className="space-y-6">
            <BentoGrid cols={3} gap="md">
              {tiers.map((tier) => (
                <BentoTile key={tier.id}>
                  <OrbitCard className="h-full border-0 bg-transparent" hover={false}>
                    <OrbitCardHeader 
                      icon={<Crown className="h-5 w-5 text-purple-400" />}
                    >
                      <OrbitCardTitle>{tier.tierName}</OrbitCardTitle>
                      <p className="text-sm text-gray-400">{tier.tierCode}</p>
                    </OrbitCardHeader>
                    <OrbitCardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Franchise Fee</div>
                          <div className="text-xl font-bold text-white">{formatCurrency(tier.franchiseFee)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Royalty</div>
                          <div className="text-xl font-bold text-white">{tier.royaltyPercent}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Monthly Support</div>
                          <div className="text-lg font-semibold text-white">{formatCurrency(tier.supportMonthlyFee)}</div>
                        </div>
                      </div>
                    </OrbitCardContent>
                  </OrbitCard>
                </BentoTile>
              ))}
            </BentoGrid>
          </TabsContent>
        </Tabs>

        <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Approve Application</DialogTitle>
              <DialogDescription className="text-gray-400">
                Approve {selectedApplication?.companyName}'s franchise application
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Approval Notes (Optional)</label>
                <Textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Add any notes about this approval..."
                  className="bg-gray-700 border-gray-600 text-white"
                  data-testid="textarea-approval-notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApproveDialog(false)} className="border-gray-600 text-gray-300">
                Cancel
              </Button>
              <Button 
                onClick={() => selectedApplication && approveMutation.mutate({ id: selectedApplication.id, notes: approvalNotes })}
                disabled={approveMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-confirm-approve"
              >
                {approveMutation.isPending ? 'Approving...' : 'Confirm Approval'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Reject Application</DialogTitle>
              <DialogDescription className="text-gray-400">
                Reject {selectedApplication?.companyName}'s franchise application
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Rejection Reason (Required)</label>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this application is being rejected..."
                  className="bg-gray-700 border-gray-600 text-white"
                  data-testid="textarea-rejection-reason"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)} className="border-gray-600 text-gray-300">
                Cancel
              </Button>
              <Button 
                onClick={() => selectedApplication && rejectMutation.mutate({ id: selectedApplication.id, reason: rejectReason })}
                disabled={rejectMutation.isPending || !rejectReason.trim()}
                variant="destructive"
                data-testid="button-confirm-reject"
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
