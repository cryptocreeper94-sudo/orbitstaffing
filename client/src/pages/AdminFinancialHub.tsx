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
  BarChart3
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

export default function AdminFinancialHub() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [events, setEvents] = useState<FinancialEvent[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, partnersRes, eventsRes, ledgerRes] = await Promise.all([
        fetch("/api/admin/financial-hub/summary"),
        fetch("/api/admin/financial-hub/partners"),
        fetch("/api/admin/financial-hub/events?limit=20"),
        fetch("/api/admin/financial-hub/ledger?limit=20"),
      ]);

      if (summaryRes.ok) setSummary(await summaryRes.json());
      if (partnersRes.ok) setPartners(await partnersRes.json());
      if (eventsRes.ok) setEvents(await eventsRes.json());
      if (ledgerRes.ok) setLedger(await ledgerRes.json());
    } catch (error) {
      console.error("Failed to fetch financial hub data:", error);
    } finally {
      setLoading(false);
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
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700">
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
