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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Calendar,
  CreditCard,
  Link2,
  ExternalLink,
  Loader2,
  Sparkles,
  Shield,
  Zap
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

interface StripeConnectStatus {
  connected: boolean;
  onboardingComplete: boolean;
  payoutsEnabled: boolean;
  accountId: string | null;
  status: string;
}

export default function PartnerDashboard() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState<PartnerEarnings | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [productSummary, setProductSummary] = useState<ProductSummary[]>([]);
  const [stripeStatus, setStripeStatus] = useState<StripeConnectStatus | null>(null);
  const [connectingStripe, setConnectingStripe] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    fetchPartnerData();
    fetchStripeStatus();
    
    // Check for Stripe return params
    const params = new URLSearchParams(window.location.search);
    if (params.get('stripe_success') === 'true') {
      refreshStripeStatus();
      window.history.replaceState({}, '', '/partner');
    }
    
    // Show welcome modal for first-time partner login (if Stripe not yet connected)
    const hasSeenWelcome = localStorage.getItem('partner_welcome_seen');
    if (!hasSeenWelcome) {
      setShowWelcomeModal(true);
    }
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

  const fetchStripeStatus = async () => {
    try {
      const res = await fetch("/api/partner/stripe/status");
      if (res.ok) {
        setStripeStatus(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch Stripe status:", error);
    }
  };

  const refreshStripeStatus = async () => {
    try {
      const res = await fetch("/api/partner/stripe/refresh-status", { method: 'POST' });
      if (res.ok) {
        setStripeStatus(await res.json());
      }
    } catch (error) {
      console.error("Failed to refresh Stripe status:", error);
    }
  };

  const connectStripe = async () => {
    setConnectingStripe(true);
    try {
      const res = await fetch("/api/partner/stripe/onboard", { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch (error) {
      console.error("Failed to connect Stripe:", error);
    } finally {
      setConnectingStripe(false);
    }
  };

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

      {/* Stripe Connect Card - Show if not fully set up */}
      {(!stripeStatus?.payoutsEnabled) && (
        <OrbitCard className="border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-900/20 to-slate-900">
          <OrbitCardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                  <CreditCard className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {stripeStatus?.connected ? 'Complete Your Stripe Setup' : 'Connect Your Bank Account'}
                  </h3>
                  <p className="text-slate-400 text-sm mb-3">
                    {stripeStatus?.connected 
                      ? 'Finish setting up your Stripe account to receive automatic payouts.'
                      : 'Connect your bank account through Stripe to receive automatic 50% profit share payouts.'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Secure • Instant transfers • No fees</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={connectStripe}
                disabled={connectingStripe}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
                data-testid="button-connect-stripe"
              >
                {connectingStripe ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 mr-2" />
                    {stripeStatus?.connected ? 'Complete Setup' : 'Connect Stripe'}
                  </>
                )}
              </Button>
            </div>
            {stripeStatus?.status === 'pending_verification' && (
              <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                <div className="flex items-center gap-2 text-yellow-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Your account is pending verification. This usually takes 1-2 business days.</span>
                </div>
              </div>
            )}
          </OrbitCardContent>
        </OrbitCard>
      )}

      {/* Stripe Connected Badge */}
      {stripeStatus?.payoutsEnabled && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-emerald-300 font-medium">Stripe Connected - Automatic payouts enabled</span>
        </div>
      )}

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

      {/* Welcome Modal for First-Time Partner Login */}
      <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
        <DialogContent className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-cyan-500/30 max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 rounded-xl">
                <Sparkles className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <DialogTitle className="text-2xl text-white">Welcome to Partner Hub!</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Hey Sid! Let's get you set up to receive payouts.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                Connect Your Bank Account
              </h4>
              <p className="text-slate-400 text-sm">
                To receive your 50% profit share automatically, you'll need to connect your bank account through Stripe. 
                This is a one-time setup that takes about 2 minutes.
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-800/30 rounded-lg text-center">
                <Shield className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Bank-level security</p>
              </div>
              <div className="p-3 bg-slate-800/30 rounded-lg text-center">
                <Zap className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Instant transfers</p>
              </div>
              <div className="p-3 bg-slate-800/30 rounded-lg text-center">
                <CheckCircle2 className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Zero fees</p>
              </div>
            </div>

            <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
              <p className="text-cyan-300 text-sm">
                <strong>Your 50/50 split covers:</strong> ORBIT Staffing OS, PaintPros.io, and Brew & Board Coffee (after expenses).
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                localStorage.setItem('partner_welcome_seen', 'true');
                setShowWelcomeModal(false);
              }}
              className="border-slate-600 hover:border-slate-500"
              data-testid="button-skip-welcome"
            >
              I'll do this later
            </Button>
            <Button
              onClick={() => {
                localStorage.setItem('partner_welcome_seen', 'true');
                setShowWelcomeModal(false);
                connectStripe();
              }}
              className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white"
              data-testid="button-connect-stripe-welcome"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Connect Stripe Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
