import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  FileText,
  Plus,
  Download,
  Search,
  Building2,
  Mail,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Edit,
  Eye,
  Sparkles,
  TrendingUp,
  Globe,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { downloadLicensePDF, type SoftwareLicenseData } from '@/lib/licensePDF';
import { format } from 'date-fns';
import { PageHeader } from '@/components/ui/section-header';
import { OrbitCard, OrbitCardContent } from '@/components/ui/orbit-card';
import { CarouselRail, CarouselRailItem } from '@/components/ui/carousel-rail';

interface SoftwareLicense {
  id: string;
  licenseNumber: string;
  licenseeCompanyName: string;
  licenseeContactName: string;
  licenseeEmail: string;
  licenseePhone: string | null;
  licenseeAddress: string | null;
  licenseeDomain: string | null;
  productName: string;
  licenseFee: string;
  monthlySupportFee: string;
  effectiveDate: string;
  termYears: number;
  signedByLicensee: string | null;
  signedByLicensor: string | null;
  signedDate: string | null;
  status: string;
  createdAt: string;
}

const PRODUCTS = [
  'Paint Pros',
  'ORBIT Staffing OS',
  'Lot Ops Pro',
  'GarageBot',
  'Brew & Board Coffee',
  'DarkWave Pulse',
  'Orby',
];

const STATUS_OPTIONS = ['draft', 'sent', 'signed', 'active', 'expired', 'cancelled'];

const GlassStatCard = ({ 
  label, 
  value, 
  icon, 
  gradient 
}: { 
  label: string; 
  value: string | number; 
  icon: React.ReactNode; 
  gradient: string;
}) => (
  <div className={`
    relative overflow-hidden rounded-2xl p-5 min-w-[200px]
    bg-gradient-to-br ${gradient}
    border border-white/10
    backdrop-blur-xl
    shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]
    hover:shadow-[0_12px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]
    hover:scale-[1.02] hover:-translate-y-1
    transition-all duration-300 ease-out
    group cursor-default
  `}>
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 shadow-lg">
          {icon}
        </div>
        <Sparkles className="h-4 w-4 text-white/30 group-hover:text-white/60 transition-colors" />
      </div>
      <p className="text-xs text-white/60 uppercase tracking-wider font-medium">{label}</p>
      <p className="text-2xl md:text-3xl font-bold text-white mt-1 drop-shadow-lg">{value}</p>
    </div>
    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-500" />
  </div>
);

const GlassLicenseCard = ({ 
  license, 
  onView, 
  onDownload, 
  onStatusChange,
  getStatusBadge,
  formatCurrency,
  formatDate,
}: { 
  license: SoftwareLicense;
  onView: () => void;
  onDownload: () => void;
  onStatusChange: (status: string) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  formatCurrency: (value: string | number) => string;
  formatDate: (date: string) => string;
}) => (
  <div className={`
    relative overflow-hidden rounded-2xl
    bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-slate-950/80
    border border-slate-700/50
    backdrop-blur-xl
    shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]
    hover:shadow-[0_16px_48px_rgba(6,182,212,0.15),inset_0_1px_0_rgba(255,255,255,0.1)]
    hover:border-cyan-500/40
    hover:scale-[1.01]
    transition-all duration-300 ease-out
    group
    min-w-[340px] md:min-w-0 md:w-full
  `} data-testid={`card-license-${license.id}`}>
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
    <div className="relative z-10 p-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <Building2 className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors">
                {license.licenseeCompanyName}
              </h3>
              <p className="text-xs text-slate-400">{license.licenseNumber}</p>
            </div>
            {getStatusBadge(license.status)}
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <FileText className="h-3.5 w-3.5 text-cyan-400" />
              <span>{license.productName}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <Mail className="h-3.5 w-3.5 text-cyan-400" />
              <span>{license.licenseeEmail}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <Calendar className="h-3.5 w-3.5 text-cyan-400" />
              <span>{formatDate(license.effectiveDate)}</span>
            </div>
          </div>
          
          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-400 font-bold text-lg">
                {formatCurrency(license.licenseFee)}
              </span>
            </div>
            <span className="text-slate-500">+</span>
            <span className="text-slate-400 text-sm">
              {formatCurrency(license.monthlySupportFee)}/mo
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500 text-sm">
              {license.termYears}yr term
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
          <Select
            value={license.status}
            onValueChange={onStatusChange}
          >
            <SelectTrigger 
              className="w-32 bg-slate-800/80 border-slate-600/50 backdrop-blur-sm hover:border-cyan-500/50 transition-colors" 
              data-testid={`select-status-${license.id}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={onView}
            className="bg-slate-800/80 border-slate-600/50 backdrop-blur-sm hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:text-cyan-300 transition-all"
            data-testid={`button-view-${license.id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            className="bg-slate-800/80 border-slate-600/50 backdrop-blur-sm hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:text-emerald-300 transition-all"
            data-testid={`button-download-${license.id}`}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
);

export default function AdminLicenseManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<SoftwareLicense | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    licenseeCompanyName: '',
    licenseeContactName: '',
    licenseeEmail: '',
    licenseePhone: '',
    licenseeAddress: '',
    licenseeDomain: '',
    productName: '',
    licenseFee: '2000',
    monthlySupportFee: '199.99',
    effectiveDate: format(new Date(), 'yyyy-MM-dd'),
    termYears: '1',
  });

  const { data: licenses = [], isLoading } = useQuery<SoftwareLicense[]>({
    queryKey: ['software-licenses'],
    queryFn: async () => {
      const response = await fetch('/api/admin/software-licenses');
      if (!response.ok) throw new Error('Failed to fetch licenses');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/admin/software-licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          licenseFee: parseFloat(data.licenseFee),
          monthlySupportFee: parseFloat(data.monthlySupportFee),
          termYears: parseInt(data.termYears),
        }),
      });
      if (!response.ok) throw new Error('Failed to create license');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'License Created', description: 'The software license has been created successfully.' });
      queryClient.invalidateQueries({ queryKey: ['software-licenses'] });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create license.', variant: 'destructive' });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/admin/software-licenses/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Status Updated', description: 'License status has been updated.' });
      queryClient.invalidateQueries({ queryKey: ['software-licenses'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      licenseeCompanyName: '',
      licenseeContactName: '',
      licenseeEmail: '',
      licenseePhone: '',
      licenseeAddress: '',
      licenseeDomain: '',
      productName: '',
      licenseFee: '2000',
      monthlySupportFee: '199.99',
      effectiveDate: format(new Date(), 'yyyy-MM-dd'),
      termYears: '1',
    });
  };

  const handleDownloadPDF = (license: SoftwareLicense) => {
    const pdfData: SoftwareLicenseData = {
      licenseNumber: license.licenseNumber,
      licenseeCompanyName: license.licenseeCompanyName,
      licenseeContactName: license.licenseeContactName,
      licenseeEmail: license.licenseeEmail,
      licenseePhone: license.licenseePhone || undefined,
      licenseeAddress: license.licenseeAddress || undefined,
      licenseeDomain: license.licenseeDomain || undefined,
      productName: license.productName,
      licenseFee: parseFloat(license.licenseFee),
      monthlySupportFee: parseFloat(license.monthlySupportFee),
      effectiveDate: license.effectiveDate,
      termYears: license.termYears,
      signedByLicensee: license.signedByLicensee || undefined,
      signedByLicensor: license.signedByLicensor || undefined,
      signedDate: license.signedDate || undefined,
    };
    downloadLicensePDF(pdfData);
    toast({ title: 'PDF Downloaded', description: `License ${license.licenseNumber} downloaded.` });
  };

  const getStatusBadge = (status: string) => {
    const badgeStyles = {
      draft: 'bg-slate-500/20 text-slate-300 border-slate-500/30 shadow-slate-500/20',
      sent: 'bg-blue-500/20 text-blue-300 border-blue-500/30 shadow-blue-500/20',
      signed: 'bg-purple-500/20 text-purple-300 border-purple-500/30 shadow-purple-500/20',
      active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-emerald-500/20',
      expired: 'bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-amber-500/20',
      cancelled: 'bg-red-500/20 text-red-300 border-red-500/30 shadow-red-500/20',
    };
    const icons = {
      draft: <Edit className="h-3 w-3" />,
      sent: <Send className="h-3 w-3" />,
      signed: <FileText className="h-3 w-3" />,
      active: <CheckCircle2 className="h-3 w-3" />,
      expired: <Clock className="h-3 w-3" />,
      cancelled: <XCircle className="h-3 w-3" />,
    };
    return (
      <Badge className={`${badgeStyles[status as keyof typeof badgeStyles] || ''} flex items-center gap-1 shadow-lg backdrop-blur-sm`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(typeof value === 'string' ? parseFloat(value) : value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const filteredLicenses = licenses.filter((license) => {
    const matchesSearch =
      license.licenseeCompanyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      license.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      license.licenseeEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      license.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || license.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: licenses.length,
    active: licenses.filter((l) => l.status === 'active').length,
    pending: licenses.filter((l) => ['draft', 'sent'].includes(l.status)).length,
    revenue: licenses
      .filter((l) => l.status === 'active')
      .reduce((sum, l) => sum + parseFloat(l.licenseFee), 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.05),transparent_50%)]" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href="/admin">
            <Button 
              variant="ghost" 
              className="text-slate-400 hover:text-white hover:bg-slate-800/50 backdrop-blur-sm transition-all" 
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 backdrop-blur-sm">
              <FileText className="h-8 w-8 text-cyan-400" />
            </div>
            Software License Manager
          </h1>
          <p className="text-slate-400 ml-16">Manage software licenses for DarkWave Studios products</p>
        </div>

        <CarouselRail 
          title="License Overview" 
          showArrows={true}
          gap="md"
          className="mb-8"
        >
          <CarouselRailItem>
            <GlassStatCard
              label="Total Licenses"
              value={stats.total}
              icon={<FileText className="h-5 w-5 text-cyan-400" />}
              gradient="from-cyan-900/40 to-slate-900/80"
            />
          </CarouselRailItem>
          <CarouselRailItem>
            <GlassStatCard
              label="Active Licenses"
              value={stats.active}
              icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
              gradient="from-emerald-900/40 to-slate-900/80"
            />
          </CarouselRailItem>
          <CarouselRailItem>
            <GlassStatCard
              label="Pending Review"
              value={stats.pending}
              icon={<Clock className="h-5 w-5 text-amber-400" />}
              gradient="from-amber-900/40 to-slate-900/80"
            />
          </CarouselRailItem>
          <CarouselRailItem>
            <GlassStatCard
              label="License Revenue"
              value={formatCurrency(stats.revenue)}
              icon={<TrendingUp className="h-5 w-5 text-purple-400" />}
              gradient="from-purple-900/40 to-slate-900/80"
            />
          </CarouselRailItem>
        </CarouselRail>

        <div className={`
          relative overflow-hidden rounded-2xl mb-6 p-5
          bg-gradient-to-br from-slate-800/60 via-slate-900/60 to-slate-950/60
          border border-slate-700/50
          backdrop-blur-xl
          shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]
        `}>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search licenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800/80 border-slate-600/50 backdrop-blur-sm focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all"
                  data-testid="input-search"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger 
                  className="w-full md:w-40 bg-slate-800/80 border-slate-600/50 backdrop-blur-sm hover:border-cyan-500/50 transition-colors" 
                  data-testid="select-status-filter"
                >
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="all">All Status</SelectItem>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={() => setShowCreateDialog(true)} 
              className="w-full md:w-auto bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all hover:scale-[1.02]" 
              data-testid="button-create-license"
            >
              <Plus className="h-4 w-4 mr-2" />
              New License
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
              <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-400">Loading licenses...</span>
            </div>
          </div>
        ) : filteredLicenses.length === 0 ? (
          <div className={`
            relative overflow-hidden rounded-2xl p-12 text-center
            bg-gradient-to-br from-slate-800/40 via-slate-900/40 to-slate-950/40
            border border-slate-700/30
            backdrop-blur-xl
          `}>
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 inline-block mb-4">
              <FileText className="h-12 w-12 text-slate-500" />
            </div>
            <p className="text-slate-400 text-lg">
              {searchQuery || statusFilter !== 'all' ? 'No licenses match your filters' : 'No licenses yet. Create your first license.'}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden md:grid gap-4">
              {filteredLicenses.map((license) => (
                <GlassLicenseCard
                  key={license.id}
                  license={license}
                  onView={() => {
                    setSelectedLicense(license);
                    setShowViewDialog(true);
                  }}
                  onDownload={() => handleDownloadPDF(license)}
                  onStatusChange={(status) => updateStatusMutation.mutate({ id: license.id, status })}
                  getStatusBadge={getStatusBadge}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              ))}
            </div>
            
            <div className="md:hidden">
              <CarouselRail showArrows={false} gap="md">
                {filteredLicenses.map((license) => (
                  <CarouselRailItem key={license.id}>
                    <GlassLicenseCard
                      license={license}
                      onView={() => {
                        setSelectedLicense(license);
                        setShowViewDialog(true);
                      }}
                      onDownload={() => handleDownloadPDF(license)}
                      onStatusChange={(status) => updateStatusMutation.mutate({ id: license.id, status })}
                      getStatusBadge={getStatusBadge}
                      formatCurrency={formatCurrency}
                      formatDate={formatDate}
                    />
                  </CarouselRailItem>
                ))}
              </CarouselRail>
            </div>
          </>
        )}

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-700/50 backdrop-blur-xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-white text-xl flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30">
                  <Plus className="h-5 w-5 text-cyan-400" />
                </div>
                Create New Software License
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Fill out the form below to create a new software license agreement.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(formData);
              }}
            >
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseeCompanyName" className="text-slate-300">Company Name *</Label>
                    <Input
                      id="licenseeCompanyName"
                      value={formData.licenseeCompanyName}
                      onChange={(e) => setFormData({ ...formData, licenseeCompanyName: e.target.value })}
                      className="bg-slate-800/80 border-slate-600/50 focus:border-cyan-500/50"
                      required
                      data-testid="input-company-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseeContactName" className="text-slate-300">Contact Name *</Label>
                    <Input
                      id="licenseeContactName"
                      value={formData.licenseeContactName}
                      onChange={(e) => setFormData({ ...formData, licenseeContactName: e.target.value })}
                      className="bg-slate-800/80 border-slate-600/50 focus:border-cyan-500/50"
                      required
                      data-testid="input-contact-name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseeEmail" className="text-slate-300">Email *</Label>
                    <Input
                      id="licenseeEmail"
                      type="email"
                      value={formData.licenseeEmail}
                      onChange={(e) => setFormData({ ...formData, licenseeEmail: e.target.value })}
                      className="bg-slate-800/80 border-slate-600/50 focus:border-cyan-500/50"
                      required
                      data-testid="input-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseePhone" className="text-slate-300">Phone</Label>
                    <Input
                      id="licenseePhone"
                      value={formData.licenseePhone}
                      onChange={(e) => setFormData({ ...formData, licenseePhone: e.target.value })}
                      className="bg-slate-800/80 border-slate-600/50 focus:border-cyan-500/50"
                      data-testid="input-phone"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseeAddress" className="text-slate-300">Address</Label>
                    <Input
                      id="licenseeAddress"
                      value={formData.licenseeAddress}
                      onChange={(e) => setFormData({ ...formData, licenseeAddress: e.target.value })}
                      className="bg-slate-800/80 border-slate-600/50 focus:border-cyan-500/50"
                      data-testid="input-address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseeDomain" className="text-slate-300">
                      <span className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-cyan-400" />
                        Customer Domain
                      </span>
                    </Label>
                    <Input
                      id="licenseeDomain"
                      value={formData.licenseeDomain}
                      onChange={(e) => setFormData({ ...formData, licenseeDomain: e.target.value })}
                      className="bg-slate-800/80 border-slate-600/50 focus:border-cyan-500/50"
                      placeholder="example.com"
                      data-testid="input-domain"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productName" className="text-slate-300">Product *</Label>
                  <Select
                    value={formData.productName}
                    onValueChange={(value) => setFormData({ ...formData, productName: value })}
                  >
                    <SelectTrigger className="bg-slate-800/80 border-slate-600/50" data-testid="select-product">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {PRODUCTS.map((product) => (
                        <SelectItem key={product} value={product}>
                          {product}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseFee" className="text-slate-300">License Fee ($) *</Label>
                    <Input
                      id="licenseFee"
                      type="number"
                      step="0.01"
                      value={formData.licenseFee}
                      onChange={(e) => setFormData({ ...formData, licenseFee: e.target.value })}
                      className="bg-slate-800/80 border-slate-600/50 focus:border-cyan-500/50"
                      required
                      data-testid="input-license-fee"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlySupportFee" className="text-slate-300">Monthly ($) *</Label>
                    <Input
                      id="monthlySupportFee"
                      type="number"
                      step="0.01"
                      value={formData.monthlySupportFee}
                      onChange={(e) => setFormData({ ...formData, monthlySupportFee: e.target.value })}
                      className="bg-slate-800/80 border-slate-600/50 focus:border-cyan-500/50"
                      required
                      data-testid="input-support-fee"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="termYears" className="text-slate-300">Term (Yrs) *</Label>
                    <Input
                      id="termYears"
                      type="number"
                      min="1"
                      value={formData.termYears}
                      onChange={(e) => setFormData({ ...formData, termYears: e.target.value })}
                      className="bg-slate-800/80 border-slate-600/50 focus:border-cyan-500/50"
                      required
                      data-testid="input-term-years"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="effectiveDate" className="text-slate-300">Effective Date *</Label>
                  <Input
                    id="effectiveDate"
                    type="date"
                    value={formData.effectiveDate}
                    onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                    className="bg-slate-800/80 border-slate-600/50 focus:border-cyan-500/50"
                    required
                    data-testid="input-effective-date"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)} 
                  className="border-slate-600 hover:bg-slate-800"
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/25" 
                  disabled={createMutation.isPending} 
                  data-testid="button-submit"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create License'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-700/50 backdrop-blur-xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-white text-xl flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30">
                  <Eye className="h-5 w-5 text-purple-400" />
                </div>
                License Details
              </DialogTitle>
              <DialogDescription className="text-cyan-400 font-mono">
                {selectedLicense?.licenseNumber}
              </DialogDescription>
            </DialogHeader>
            {selectedLicense && (
              <div className="py-4">
                <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30">
                      <Building2 className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{selectedLicense.licenseeCompanyName}</h3>
                      <p className="text-sm text-slate-400">{selectedLicense.licenseeContactName}</p>
                    </div>
                  </div>
                  {getStatusBadge(selectedLicense.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Email</p>
                    <p className="text-white">{selectedLicense.licenseeEmail}</p>
                  </div>
                  {selectedLicense.licenseePhone && (
                    <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Phone</p>
                      <p className="text-white">{selectedLicense.licenseePhone}</p>
                    </div>
                  )}
                  {selectedLicense.licenseeAddress && (
                    <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Address</p>
                      <p className="text-white">{selectedLicense.licenseeAddress}</p>
                    </div>
                  )}
                  {selectedLicense.licenseeDomain && (
                    <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Domain</p>
                      <p className="text-cyan-400">{selectedLicense.licenseeDomain}</p>
                    </div>
                  )}
                  <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Product</p>
                    <p className="text-white">{selectedLicense.productName}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">License Fee</p>
                    <p className="text-emerald-400 font-bold text-lg">{formatCurrency(selectedLicense.licenseFee)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Monthly Support</p>
                    <p className="text-white">{formatCurrency(selectedLicense.monthlySupportFee)}/mo</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Effective Date</p>
                    <p className="text-white">{formatDate(selectedLicense.effectiveDate)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Term</p>
                    <p className="text-white">{selectedLicense.termYears} year(s)</p>
                  </div>
                  {selectedLicense.signedByLicensee && (
                    <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Signed By</p>
                      <p className="text-white">{selectedLicense.signedByLicensee}</p>
                    </div>
                  )}
                  {selectedLicense.signedDate && (
                    <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Signed Date</p>
                      <p className="text-white">{formatDate(selectedLicense.signedDate)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowViewDialog(false)} 
                className="border-slate-600 hover:bg-slate-800"
                data-testid="button-close-view"
              >
                Close
              </Button>
              <Button
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/25"
                onClick={() => selectedLicense && handleDownloadPDF(selectedLicense)}
                data-testid="button-download-pdf"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
