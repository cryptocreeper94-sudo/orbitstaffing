import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Phone,
  Globe,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Edit,
  Eye,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { downloadLicensePDF, type SoftwareLicenseData } from '@/lib/licensePDF';
import { format } from 'date-fns';
import { PageHeader } from '@/components/ui/section-header';
import { OrbitCard, OrbitCardContent, OrbitCardHeader, OrbitCardTitle, StatCard } from '@/components/ui/orbit-card';

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
];

const STATUS_OPTIONS = ['draft', 'sent', 'signed', 'active', 'expired', 'cancelled'];

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
    switch (status) {
      case 'draft':
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30"><Edit className="h-3 w-3 mr-1" />Draft</Badge>;
      case 'sent':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><Send className="h-3 w-3 mr-1" />Sent</Badge>;
      case 'signed':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30"><FileText className="h-3 w-3 mr-1" />Signed</Badge>;
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle2 className="h-3 w-3 mr-1" />Active</Badge>;
      case 'expired':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" />Expired</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="ghost" className="text-slate-400 hover:text-white" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
        </div>

        <PageHeader
          title="Software License Manager"
          subtitle="Manage software licenses for DarkWave Studios products"
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mb-8">
          <StatCard
            label="Total Licenses"
            value={stats.total}
            icon={<FileText className="h-6 w-6" />}
          />
          <StatCard
            label="Active Licenses"
            value={stats.active}
            icon={<CheckCircle2 className="h-6 w-6" />}
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={<Clock className="h-6 w-6" />}
          />
          <StatCard
            label="Active License Revenue"
            value={formatCurrency(stats.revenue)}
            icon={<DollarSign className="h-6 w-6" />}
          />
        </div>

        <OrbitCard className="mb-6">
          <OrbitCardContent>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search licenses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-600"
                    data-testid="input-search"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 bg-slate-800 border-slate-600" data-testid="select-status-filter">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setShowCreateDialog(true)} className="bg-cyan-600 hover:bg-cyan-700" data-testid="button-create-license">
                <Plus className="h-4 w-4 mr-2" />
                New License
              </Button>
            </div>
          </OrbitCardContent>
        </OrbitCard>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400">Loading licenses...</div>
        ) : filteredLicenses.length === 0 ? (
          <OrbitCard>
            <OrbitCardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">
                {searchQuery || statusFilter !== 'all' ? 'No licenses match your filters' : 'No licenses yet. Create your first license.'}
              </p>
            </OrbitCardContent>
          </OrbitCard>
        ) : (
          <div className="grid gap-4">
            {filteredLicenses.map((license) => (
              <OrbitCard key={license.id} data-testid={`card-license-${license.id}`}>
                <OrbitCardContent>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{license.licenseeCompanyName}</h3>
                        {getStatusBadge(license.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span data-testid={`text-license-number-${license.id}`}>{license.licenseNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{license.productName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{license.licenseeEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Effective: {formatDate(license.effectiveDate)}</span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <span className="text-cyan-400 font-semibold">
                          License: {formatCurrency(license.licenseFee)}
                        </span>
                        <span className="text-slate-400">
                          + {formatCurrency(license.monthlySupportFee)}/mo support
                        </span>
                        <span className="text-slate-500">
                          {license.termYears} year term
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={license.status}
                        onValueChange={(status) => updateStatusMutation.mutate({ id: license.id, status })}
                      >
                        <SelectTrigger className="w-32 bg-slate-800 border-slate-600" data-testid={`select-status-${license.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
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
                        onClick={() => {
                          setSelectedLicense(license);
                          setShowViewDialog(true);
                        }}
                        data-testid={`button-view-${license.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPDF(license)}
                        data-testid={`button-download-${license.id}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </OrbitCardContent>
              </OrbitCard>
            ))}
          </div>
        )}

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Software License</DialogTitle>
              <DialogDescription>
                Fill out the form below to create a new software license agreement.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(formData);
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseeCompanyName">Company Name *</Label>
                    <Input
                      id="licenseeCompanyName"
                      value={formData.licenseeCompanyName}
                      onChange={(e) => setFormData({ ...formData, licenseeCompanyName: e.target.value })}
                      className="bg-slate-800 border-slate-600"
                      required
                      data-testid="input-company-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseeContactName">Contact Name *</Label>
                    <Input
                      id="licenseeContactName"
                      value={formData.licenseeContactName}
                      onChange={(e) => setFormData({ ...formData, licenseeContactName: e.target.value })}
                      className="bg-slate-800 border-slate-600"
                      required
                      data-testid="input-contact-name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseeEmail">Email *</Label>
                    <Input
                      id="licenseeEmail"
                      type="email"
                      value={formData.licenseeEmail}
                      onChange={(e) => setFormData({ ...formData, licenseeEmail: e.target.value })}
                      className="bg-slate-800 border-slate-600"
                      required
                      data-testid="input-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseePhone">Phone</Label>
                    <Input
                      id="licenseePhone"
                      value={formData.licenseePhone}
                      onChange={(e) => setFormData({ ...formData, licenseePhone: e.target.value })}
                      className="bg-slate-800 border-slate-600"
                      data-testid="input-phone"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseeAddress">Address</Label>
                    <Input
                      id="licenseeAddress"
                      value={formData.licenseeAddress}
                      onChange={(e) => setFormData({ ...formData, licenseeAddress: e.target.value })}
                      className="bg-slate-800 border-slate-600"
                      data-testid="input-address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseeDomain">Domain (Customer URL)</Label>
                    <Input
                      id="licenseeDomain"
                      value={formData.licenseeDomain}
                      onChange={(e) => setFormData({ ...formData, licenseeDomain: e.target.value })}
                      className="bg-slate-800 border-slate-600"
                      placeholder="example.com"
                      data-testid="input-domain"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productName">Product *</Label>
                  <Select
                    value={formData.productName}
                    onValueChange={(value) => setFormData({ ...formData, productName: value })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600" data-testid="select-product">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
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
                    <Label htmlFor="licenseFee">License Fee ($) *</Label>
                    <Input
                      id="licenseFee"
                      type="number"
                      step="0.01"
                      value={formData.licenseFee}
                      onChange={(e) => setFormData({ ...formData, licenseFee: e.target.value })}
                      className="bg-slate-800 border-slate-600"
                      required
                      data-testid="input-license-fee"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlySupportFee">Monthly Support ($) *</Label>
                    <Input
                      id="monthlySupportFee"
                      type="number"
                      step="0.01"
                      value={formData.monthlySupportFee}
                      onChange={(e) => setFormData({ ...formData, monthlySupportFee: e.target.value })}
                      className="bg-slate-800 border-slate-600"
                      required
                      data-testid="input-support-fee"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="termYears">Term (Years) *</Label>
                    <Input
                      id="termYears"
                      type="number"
                      min="1"
                      value={formData.termYears}
                      onChange={(e) => setFormData({ ...formData, termYears: e.target.value })}
                      className="bg-slate-800 border-slate-600"
                      required
                      data-testid="input-term-years"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="effectiveDate">Effective Date *</Label>
                  <Input
                    id="effectiveDate"
                    type="date"
                    value={formData.effectiveDate}
                    onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                    className="bg-slate-800 border-slate-600"
                    required
                    data-testid="input-effective-date"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700" disabled={createMutation.isPending} data-testid="button-submit">
                  {createMutation.isPending ? 'Creating...' : 'Create License'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">License Details</DialogTitle>
              <DialogDescription>
                {selectedLicense?.licenseNumber}
              </DialogDescription>
            </DialogHeader>
            {selectedLicense && (
              <div className="grid gap-4 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">{selectedLicense.licenseeCompanyName}</h3>
                  {getStatusBadge(selectedLicense.status)}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Contact Name</p>
                    <p className="text-white">{selectedLicense.licenseeContactName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Email</p>
                    <p className="text-white">{selectedLicense.licenseeEmail}</p>
                  </div>
                  {selectedLicense.licenseePhone && (
                    <div>
                      <p className="text-slate-400">Phone</p>
                      <p className="text-white">{selectedLicense.licenseePhone}</p>
                    </div>
                  )}
                  {selectedLicense.licenseeAddress && (
                    <div>
                      <p className="text-slate-400">Address</p>
                      <p className="text-white">{selectedLicense.licenseeAddress}</p>
                    </div>
                  )}
                  {selectedLicense.licenseeDomain && (
                    <div>
                      <p className="text-slate-400">Domain</p>
                      <p className="text-cyan-400">{selectedLicense.licenseeDomain}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-slate-400">Product</p>
                    <p className="text-white">{selectedLicense.productName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">License Fee</p>
                    <p className="text-white">{formatCurrency(selectedLicense.licenseFee)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Monthly Support</p>
                    <p className="text-white">{formatCurrency(selectedLicense.monthlySupportFee)}/mo</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Effective Date</p>
                    <p className="text-white">{formatDate(selectedLicense.effectiveDate)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Term</p>
                    <p className="text-white">{selectedLicense.termYears} year(s)</p>
                  </div>
                  {selectedLicense.signedByLicensee && (
                    <div>
                      <p className="text-slate-400">Signed By (Licensee)</p>
                      <p className="text-white">{selectedLicense.signedByLicensee}</p>
                    </div>
                  )}
                  {selectedLicense.signedDate && (
                    <div>
                      <p className="text-slate-400">Signed Date</p>
                      <p className="text-white">{formatDate(selectedLicense.signedDate)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewDialog(false)} data-testid="button-close-view">
                Close
              </Button>
              <Button
                className="bg-cyan-600 hover:bg-cyan-700"
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
