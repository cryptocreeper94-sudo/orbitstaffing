import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/section-header";
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardContent, StatCard } from "@/components/ui/orbit-card";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { useLocation } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  DollarSign, 
  FileText, 
  RefreshCw, 
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Wallet,
  Receipt,
  BarChart3,
  PieChart,
  Building2,
  Calendar
} from "lucide-react";

interface PartnerEarnings {
  partnerId: string;
  fullName: string;
  totalGrossRevenue: number;
  totalExpenses: number;
  netProfit: number;
  partnerShare: number;
  splitPercentage: number;
  pendingPayouts: number;
  paidToDate: number;
  taxWithheld: number;
}

interface LedgerEntry {
  id: string;
  productCode: string;
  grossAmount: string;
  splitPercentage: string;
  netAmount: string;
  taxWithholding: string;
  status: string;
  createdAt: string;
}

interface PayoutRecord {
  id: string;
  amount: string;
  method: string;
  status: string;
  processedAt: string;
  reference: string;
}

interface ProductSummary {
  productCode: string;
  productName: string;
  totalRevenue: number;
  expenses: number;
  netProfit: number;
  partnerShare: number;
}

export default function PartnerDashboard() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState<PartnerEarnings | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [productSummary, setProductSummary] = useState<ProductSummary[]>([]);

  useEffect(() => {
    fetchPartnerData();
  }, []);

  const fetchPartnerData = async () => {
    setLoading(true);
    try {
      const [earningsRes, ledgerRes, payoutsRes] = await Promise.all([
        fetch("/api/partner/earnings"),
        fetch("/api/partner/ledger?limit=20"),
        fetch("/api/partner/payouts?limit=20"),
      ]);

      if (earningsRes.ok) {
        const data = await earningsRes.json();
        setEarnings(data.earnings);
        setProductSummary(data.productBreakdown || []);
      }
      if (ledgerRes.ok) setLedger(await ledgerRes.json());
      if (payoutsRes.ok) setPayouts(await payoutsRes.json());
    } catch (error) {
      console.error("Failed to fetch partner data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num || 0);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      processed: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      approved: 'bg-green-500/20 text-green-400 border-green-500/30',
      paid: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return (
      <Badge className={`${colors[status] || 'bg-slate-500/20 text-slate-400'} border`}>
        {status}
      </Badge>
    );
  };

  const partnerProducts = [
    { code: 'orbit_staffing', name: 'ORBIT Staffing OS', icon: '🚀' },
    { code: 'paintpros', name: 'PaintPros.io', icon: '🎨' },
    { code: 'brew_board', name: 'Brew & Board Coffee', icon: '☕' },
  ];

  return (
    <div className="space-y-6 p-6 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <PageHeader
        title="Partner Dashboard"
        subtitle="Your 50/50 profit share across ORBIT, PaintPros, and Brew & Board"
        actions={
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setLocation('/admin')}
              variant="outline" 
              size="sm"
              className="border-slate-600 hover:border-cyan-500 hover:bg-slate-800"
              data-testid="button-back-admin"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Admin Panel
            </Button>
            <Button 
              onClick={fetchPartnerData} 
              variant="outline" 
              size="sm"
              className="border-slate-600 hover:border-cyan-500 hover:bg-slate-800"
              data-testid="button-refresh-partner"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        }
      />

      <BentoGrid cols={4} gap="md">
        <BentoTile>
          <StatCard
            label="Your Share (50%)"
            value={formatCurrency(earnings?.partnerShare ?? 0)}
            icon={<DollarSign className="w-6 h-6 text-emerald-400" />}
            className="border-0 bg-transparent"
          />
        </BentoTile>

        <BentoTile>
          <StatCard
            label="Gross Revenue"
            value={formatCurrency(earnings?.totalGrossRevenue ?? 0)}
            icon={<TrendingUp className="w-6 h-6 text-cyan-400" />}
            className="border-0 bg-transparent"
          />
        </BentoTile>

        <BentoTile>
          <StatCard
            label="Paid to Date"
            value={formatCurrency(earnings?.paidToDate ?? 0)}
            icon={<CheckCircle2 className="w-6 h-6 text-green-400" />}
            className="border-0 bg-transparent"
          />
        </BentoTile>

        <BentoTile>
          <StatCard
            label="Pending Payouts"
            value={formatCurrency(earnings?.pendingPayouts ?? 0)}
            icon={<Wallet className="w-6 h-6 text-yellow-400" />}
            className="border-0 bg-transparent"
          />
        </BentoTile>
      </BentoGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <OrbitCard className="lg:col-span-1">
          <OrbitCardHeader>
            <OrbitCardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-cyan-400" />
              Your Products
            </OrbitCardTitle>
          </OrbitCardHeader>
          <OrbitCardContent>
            <div className="space-y-4">
              {partnerProducts.map((product) => {
                const summary = productSummary.find(p => p.productCode === product.code);
                return (
                  <div 
                    key={product.code}
                    className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-cyan-500/50 transition-colors"
                    data-testid={`product-${product.code}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{product.icon}</span>
                      <span className="text-white font-medium">{product.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-slate-400">Revenue:</span>
                        <span className="text-white ml-2">{formatCurrency(summary?.totalRevenue ?? 0)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Your Share:</span>
                        <span className="text-emerald-400 ml-2 font-medium">{formatCurrency(summary?.partnerShare ?? 0)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <AlertCircle className="w-4 h-4" />
                <span>50/50 split applies after expenses</span>
              </div>
            </div>
          </OrbitCardContent>
        </OrbitCard>

        <OrbitCard className="lg:col-span-2">
          <OrbitCardHeader>
            <OrbitCardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-400" />
              Profit Breakdown
            </OrbitCardTitle>
          </OrbitCardHeader>
          <OrbitCardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                <p className="text-xs text-slate-400 mb-1">Gross Revenue</p>
                <p className="text-lg font-bold text-white">{formatCurrency(earnings?.totalGrossRevenue ?? 0)}</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                <p className="text-xs text-slate-400 mb-1">Expenses</p>
                <p className="text-lg font-bold text-red-400">-{formatCurrency(earnings?.totalExpenses ?? 0)}</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                <p className="text-xs text-slate-400 mb-1">Net Profit</p>
                <p className="text-lg font-bold text-cyan-400">{formatCurrency(earnings?.netProfit ?? 0)}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-900/30 to-slate-800/50 rounded-lg text-center border border-emerald-500/30">
                <p className="text-xs text-emerald-400 mb-1">Your 50%</p>
                <p className="text-lg font-bold text-emerald-400">{formatCurrency(earnings?.partnerShare ?? 0)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3">
                <Receipt className="w-5 h-5 text-yellow-400" />
                <span className="text-slate-300">Tax Withheld (1099)</span>
              </div>
              <span className="text-yellow-400 font-mono">{formatCurrency(earnings?.taxWithheld ?? 0)}</span>
            </div>
          </OrbitCardContent>
        </OrbitCard>
      </div>

      <Tabs defaultValue="ledger" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="ledger" className="data-[state=active]:bg-cyan-500/20" data-testid="tab-ledger">
            <BarChart3 className="w-4 h-4 mr-2" />
            Royalty Ledger
          </TabsTrigger>
          <TabsTrigger value="payouts" className="data-[state=active]:bg-cyan-500/20" data-testid="tab-payouts">
            <Wallet className="w-4 h-4 mr-2" />
            Payout History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ledger" className="mt-4">
          <OrbitCard>
            <OrbitCardHeader>
              <OrbitCardTitle>Your Royalty Entries</OrbitCardTitle>
            </OrbitCardHeader>
            <OrbitCardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-400">Product</TableHead>
                    <TableHead className="text-slate-400">Gross</TableHead>
                    <TableHead className="text-slate-400">Split %</TableHead>
                    <TableHead className="text-slate-400">Your Amount</TableHead>
                    <TableHead className="text-slate-400">Tax Held</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledger.map((entry) => (
                    <TableRow key={entry.id} className="border-slate-700 hover:bg-slate-800/50" data-testid={`row-ledger-${entry.id}`}>
                      <TableCell className="font-medium text-white">{entry.productCode || '-'}</TableCell>
                      <TableCell className="text-white font-mono">{formatCurrency(entry.grossAmount)}</TableCell>
                      <TableCell className="text-cyan-400 font-mono">{entry.splitPercentage}%</TableCell>
                      <TableCell className="text-emerald-400 font-mono">{formatCurrency(entry.netAmount)}</TableCell>
                      <TableCell className="text-yellow-400 font-mono">{formatCurrency(entry.taxWithholding)}</TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      <TableCell className="text-slate-400">{formatDate(entry.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                  {ledger.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                        No royalty entries yet. Your earnings will appear here as revenue flows in.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </OrbitCardContent>
          </OrbitCard>
        </TabsContent>

        <TabsContent value="payouts" className="mt-4">
          <OrbitCard>
            <OrbitCardHeader>
              <OrbitCardTitle>Your Payout History</OrbitCardTitle>
            </OrbitCardHeader>
            <OrbitCardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-400">Amount</TableHead>
                    <TableHead className="text-slate-400">Method</TableHead>
                    <TableHead className="text-slate-400">Reference</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Processed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id} className="border-slate-700 hover:bg-slate-800/50" data-testid={`row-payout-${payout.id}`}>
                      <TableCell className="font-medium text-emerald-400 font-mono">{formatCurrency(payout.amount)}</TableCell>
                      <TableCell className="text-slate-300">{payout.method}</TableCell>
                      <TableCell className="text-slate-400 font-mono text-xs">{payout.reference || '-'}</TableCell>
                      <TableCell>{getStatusBadge(payout.status)}</TableCell>
                      <TableCell className="text-slate-400">{payout.processedAt ? formatDate(payout.processedAt) : 'Pending'}</TableCell>
                    </TableRow>
                  ))}
                  {payouts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                        <div className="flex flex-col items-center">
                          <Wallet className="w-12 h-12 mb-4 text-slate-600" />
                          <p className="text-lg">No payouts yet</p>
                          <p className="text-sm text-slate-600 mt-2">
                            Payouts are processed monthly after statement generation
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </OrbitCardContent>
          </OrbitCard>
        </TabsContent>
      </Tabs>

      <OrbitCard>
        <OrbitCardHeader>
          <OrbitCardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Partnership Agreement
          </OrbitCardTitle>
        </OrbitCardHeader>
        <OrbitCardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Split Percentage</p>
              <p className="text-2xl font-bold text-cyan-400">50%</p>
              <p className="text-xs text-slate-500">After costs & expenses</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Tax Classification</p>
              <p className="text-2xl font-bold text-white">1099 / W-2</p>
              <p className="text-xs text-slate-500">Dual classification</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Products Covered</p>
              <p className="text-2xl font-bold text-emerald-400">3</p>
              <p className="text-xs text-slate-500">ORBIT, PaintPros, Brew & Board</p>
            </div>
          </div>
        </OrbitCardContent>
      </OrbitCard>
    </div>
  );
}
