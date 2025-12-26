import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { PageHeader } from "@/components/ui/section-header";
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardContent, StatCard } from "@/components/ui/orbit-card";
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
  Users, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  RefreshCw, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Wallet,
  Receipt,
  BarChart3,
  Landmark,
  Loader2,
  Link2
} from "lucide-react";

interface Partner {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  taxType: string;
  defaultSplitPercentage: string;
  status: string;
  w9OnFile: boolean;
  createdAt: string;
}

interface FinancialEvent {
  id: string;
  sourceSystem: string;
  eventType: string;
  productCode?: string;
  grossAmount: string;
  netAmount: string;
  status: string;
  createdAt: string;
  description?: string;
}

interface LedgerEntry {
  id: string;
  partnerId: string;
  productCode?: string;
  grossAmount: string;
  splitPercentage: string;
  netAmount: string;
  taxWithholding: string;
  status: string;
  createdAt: string;
}

interface Summary {
  totalPartners: number;
  totalEvents: number;
  totalPendingLedgerEntries: number;
  totalStatements: number;
  totalPayoutsPending: number;
  revenueThisMonth: number;
  expensesThisMonth: number;
}

interface TreasuryAllocation {
  id: string;
  category: string;
  label: string;
  percentage: string;
}

interface TreasurySummary {
  latestBalance: string | null;
  latestAsOf: string | null;
  allocations: TreasuryAllocation[];
  protocolFees: {
    dexSwapFee: string | null;
    nftMarketplaceFee: string | null;
    bridgeFee: string | null;
  };
}

interface TreasuryStatus {
  service: string;
  configured: boolean;
  lastSync: string | null;
  totalSnapshots: number;
  dwscUrl: string | null;
}

export default function AdminFinancialHub() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [events, setEvents] = useState<FinancialEvent[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [treasuryStatus, setTreasuryStatus] = useState<TreasuryStatus | null>(null);
  const [treasurySummary, setTreasurySummary] = useState<TreasurySummary | null>(null);
  const [syncingTreasury, setSyncingTreasury] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const autoSyncTreasury = async () => {
      if (!treasuryStatus?.configured) return;
      
      const lastSync = treasuryStatus.lastSync ? new Date(treasuryStatus.lastSync).getTime() : 0;
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      
      if (lastSync < oneHourAgo && !syncingTreasury) {
        console.log('[Treasury] Auto-syncing (last sync > 1 hour ago)');
        await triggerTreasurySync();
      }
    };
    
    if (treasuryStatus) {
      autoSyncTreasury();
    }
  }, [treasuryStatus?.configured]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, partnersRes, eventsRes, ledgerRes, treasuryStatusRes, treasurySummaryRes] = await Promise.all([
        fetch("/api/admin/financial-hub/summary"),
        fetch("/api/admin/financial-hub/partners"),
        fetch("/api/admin/financial-hub/events?limit=20"),
        fetch("/api/admin/financial-hub/ledger?limit=20"),
        fetch("/api/financial-hub/treasury/status"),
        fetch("/api/admin/financial-hub/treasury/summary"),
      ]);

      if (summaryRes.ok) setSummary(await summaryRes.json());
      if (partnersRes.ok) setPartners(await partnersRes.json());
      if (eventsRes.ok) setEvents(await eventsRes.json());
      if (ledgerRes.ok) setLedger(await ledgerRes.json());
      if (treasuryStatusRes.ok) setTreasuryStatus(await treasuryStatusRes.json());
      if (treasurySummaryRes.ok) setTreasurySummary(await treasurySummaryRes.json());
    } catch (error) {
      console.error("Failed to fetch financial hub data:", error);
    } finally {
      setLoading(false);
    }
  };

  const triggerTreasurySync = async () => {
    setSyncingTreasury(true);
    try {
      const res = await fetch("/api/admin/financial-hub/treasury/sync", { method: "POST" });
      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Failed to sync treasury:", error);
    } finally {
      setSyncingTreasury(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
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
      active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
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

  return (
    <div className="space-y-6 p-6 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <PageHeader
        title="Financial Hub"
        subtitle="DarkWave Studios partner revenue tracking and royalty management"
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
              Back
            </Button>
            <Button 
              onClick={fetchData} 
              variant="outline" 
              size="sm"
              className="border-slate-600 hover:border-cyan-500 hover:bg-slate-800"
              data-testid="button-refresh-financial-hub"
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
            label="Partners"
            value={summary?.totalPartners ?? 0}
            icon={<Users className="w-6 h-6 text-cyan-400" />}
            className="border-0 bg-transparent"
          />
        </BentoTile>

        <BentoTile>
          <StatCard
            label="Revenue (MTD)"
            value={formatCurrency(summary?.revenueThisMonth ?? 0)}
            icon={<TrendingUp className="w-6 h-6 text-emerald-400" />}
            className="border-0 bg-transparent"
          />
        </BentoTile>

        <BentoTile>
          <StatCard
            label="Pending Splits"
            value={summary?.totalPendingLedgerEntries ?? 0}
            icon={<Clock className="w-6 h-6 text-yellow-400" />}
            className="border-0 bg-transparent"
          />
        </BentoTile>

        <BentoTile>
          <StatCard
            label="Statements"
            value={summary?.totalStatements ?? 0}
            icon={<FileText className="w-6 h-6 text-blue-400" />}
            className="border-0 bg-transparent"
          />
        </BentoTile>
      </BentoGrid>

      <Tabs defaultValue="partners" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="partners" className="data-[state=active]:bg-cyan-500/20" data-testid="tab-partners">
            <Users className="w-4 h-4 mr-2" />
            Partners
          </TabsTrigger>
          <TabsTrigger value="events" className="data-[state=active]:bg-cyan-500/20" data-testid="tab-events">
            <Receipt className="w-4 h-4 mr-2" />
            Events
          </TabsTrigger>
          <TabsTrigger value="ledger" className="data-[state=active]:bg-cyan-500/20" data-testid="tab-ledger">
            <BarChart3 className="w-4 h-4 mr-2" />
            Ledger
          </TabsTrigger>
          <TabsTrigger value="payouts" className="data-[state=active]:bg-cyan-500/20" data-testid="tab-payouts">
            <Wallet className="w-4 h-4 mr-2" />
            Payouts
          </TabsTrigger>
          <TabsTrigger value="treasury" className="data-[state=active]:bg-purple-500/20" data-testid="tab-treasury">
            <Landmark className="w-4 h-4 mr-2" />
            Treasury
          </TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="mt-4">
          <OrbitCard>
            <OrbitCardHeader>
              <OrbitCardTitle>Partner Profiles</OrbitCardTitle>
            </OrbitCardHeader>
            <OrbitCardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-400">Name</TableHead>
                    <TableHead className="text-slate-400">Email</TableHead>
                    <TableHead className="text-slate-400">Tax Type</TableHead>
                    <TableHead className="text-slate-400">Split %</TableHead>
                    <TableHead className="text-slate-400">W-9</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((partner) => (
                    <TableRow key={partner.id} className="border-slate-700 hover:bg-slate-800/50" data-testid={`row-partner-${partner.id}`}>
                      <TableCell className="font-medium text-white">{partner.fullName}</TableCell>
                      <TableCell className="text-slate-300">{partner.email}</TableCell>
                      <TableCell>
                        <Badge className="bg-slate-700 text-slate-300">{partner.taxType.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell className="text-cyan-400 font-mono">{partner.defaultSplitPercentage}%</TableCell>
                      <TableCell>
                        {partner.w9OnFile ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-400" />
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(partner.status)}</TableCell>
                    </TableRow>
                  ))}
                  {partners.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                        No partners registered yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </OrbitCardContent>
          </OrbitCard>
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <OrbitCard>
            <OrbitCardHeader>
              <OrbitCardTitle>Recent Financial Events</OrbitCardTitle>
            </OrbitCardHeader>
            <OrbitCardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-400">Source</TableHead>
                    <TableHead className="text-slate-400">Type</TableHead>
                    <TableHead className="text-slate-400">Product</TableHead>
                    <TableHead className="text-slate-400">Gross</TableHead>
                    <TableHead className="text-slate-400">Net</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id} className="border-slate-700 hover:bg-slate-800/50" data-testid={`row-event-${event.id}`}>
                      <TableCell className="font-medium text-white">{event.sourceSystem}</TableCell>
                      <TableCell>
                        <Badge className={event.eventType === 'revenue' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}>
                          {event.eventType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">{event.productCode || '-'}</TableCell>
                      <TableCell className="text-white font-mono">{formatCurrency(event.grossAmount)}</TableCell>
                      <TableCell className="text-cyan-400 font-mono">{formatCurrency(event.netAmount)}</TableCell>
                      <TableCell>{getStatusBadge(event.status)}</TableCell>
                      <TableCell className="text-slate-400">{formatDate(event.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                  {events.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                        No financial events yet. Connect PaintPros.io to start tracking.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </OrbitCardContent>
          </OrbitCard>
        </TabsContent>

        <TabsContent value="ledger" className="mt-4">
          <OrbitCard>
            <OrbitCardHeader>
              <OrbitCardTitle>Royalty Ledger</OrbitCardTitle>
            </OrbitCardHeader>
            <OrbitCardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-400">Product</TableHead>
                    <TableHead className="text-slate-400">Gross</TableHead>
                    <TableHead className="text-slate-400">Split %</TableHead>
                    <TableHead className="text-slate-400">Net</TableHead>
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
                        No ledger entries yet. Royalty splits will appear here when revenue flows in.
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
              <OrbitCardTitle>Payouts</OrbitCardTitle>
            </OrbitCardHeader>
            <OrbitCardContent>
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Wallet className="w-12 h-12 mb-4 text-slate-600" />
                <p className="text-lg">No payouts scheduled yet</p>
                <p className="text-sm text-slate-500 mt-2">
                  Generate statements to initiate partner payouts
                </p>
              </div>
            </OrbitCardContent>
          </OrbitCard>
        </TabsContent>

        <TabsContent value="treasury" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <OrbitCard className="lg:col-span-2">
              <OrbitCardHeader className="flex flex-row items-center justify-between">
                <OrbitCardTitle>DarkWave Smart Chain Treasury</OrbitCardTitle>
                <Button
                  onClick={triggerTreasurySync}
                  disabled={syncingTreasury || !treasuryStatus?.configured}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                  data-testid="button-sync-treasury"
                >
                  {syncingTreasury ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Sync Now
                </Button>
              </OrbitCardHeader>
              <OrbitCardContent>
                <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${treasuryStatus?.configured ? 'bg-emerald-500 animate-pulse' : 'bg-yellow-500'}`} />
                      <span className="text-white font-medium">Connection Status</span>
                    </div>
                    <Badge className={treasuryStatus?.configured ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}>
                      {treasuryStatus?.configured ? 'Connected' : 'Not Configured'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Last Sync:</span>
                      <span className="text-white ml-2">
                        {treasuryStatus?.lastSync ? formatDate(treasuryStatus.lastSync) : 'Never'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Snapshots:</span>
                      <span className="text-cyan-400 ml-2 font-mono">{treasuryStatus?.totalSnapshots ?? 0}</span>
                    </div>
                  </div>
                </div>

                {treasurySummary?.latestBalance && (
                  <div className="p-6 bg-gradient-to-br from-purple-900/30 to-slate-800/50 rounded-lg border border-purple-500/30">
                    <div className="text-center mb-4">
                      <p className="text-slate-400 text-sm">Treasury Balance (DWC)</p>
                      <p className="text-3xl font-bold text-purple-400 font-mono">
                        {parseFloat(treasurySummary.latestBalance).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        As of {treasurySummary.latestAsOf ? formatDate(treasurySummary.latestAsOf) : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}

                {!treasuryStatus?.configured && (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <Link2 className="w-12 h-12 mb-4 text-slate-600" />
                    <p className="text-lg">Treasury Sync Not Configured</p>
                    <p className="text-sm text-slate-500 mt-2 text-center max-w-md">
                      Set DWSC_TREASURY_URL environment variable to connect to DarkWave Smart Chain treasury.
                    </p>
                  </div>
                )}
              </OrbitCardContent>
            </OrbitCard>

            <OrbitCard>
              <OrbitCardHeader>
                <OrbitCardTitle>Allocations</OrbitCardTitle>
              </OrbitCardHeader>
              <OrbitCardContent>
                {treasurySummary?.allocations && treasurySummary.allocations.length > 0 ? (
                  <div className="space-y-3">
                    {treasurySummary.allocations.map((alloc) => (
                      <div key={alloc.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg" data-testid={`allocation-${alloc.category}`}>
                        <span className="text-white">{alloc.label}</span>
                        <span className="text-purple-400 font-mono font-bold">{alloc.percentage}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <p>No allocation data yet</p>
                    <p className="text-xs mt-2">Sync treasury to fetch allocations</p>
                  </div>
                )}

                {treasurySummary?.protocolFees?.dexSwapFee && (
                  <div className="mt-6 pt-4 border-t border-slate-700">
                    <p className="text-sm text-slate-400 mb-3">Protocol Fees</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">DEX Swap</span>
                        <span className="text-cyan-400">{treasurySummary.protocolFees.dexSwapFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">NFT Marketplace</span>
                        <span className="text-cyan-400">{treasurySummary.protocolFees.nftMarketplaceFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Bridge</span>
                        <span className="text-cyan-400">{treasurySummary.protocolFees.bridgeFee}</span>
                      </div>
                    </div>
                  </div>
                )}
              </OrbitCardContent>
            </OrbitCard>
          </div>
        </TabsContent>
      </Tabs>

      <OrbitCard className="mt-6">
        <OrbitCardHeader>
          <OrbitCardTitle>Integration Status</OrbitCardTitle>
        </OrbitCardHeader>
        <OrbitCardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-white font-medium">ORBIT Staffing OS</span>
              </div>
              <p className="text-sm text-slate-400 mt-2">Hub Active</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-white font-medium">PaintPros.io</span>
              </div>
              <p className="text-sm text-slate-400 mt-2">Awaiting Connection</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-slate-500" />
                <span className="text-white font-medium">Brew & Board</span>
              </div>
              <p className="text-sm text-slate-400 mt-2">Coming Soon</p>
            </div>
          </div>
        </OrbitCardContent>
      </OrbitCard>
    </div>
  );
}
