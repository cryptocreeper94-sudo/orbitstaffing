import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CreditCard, Download, Send, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { CarouselRail, CarouselRailItem } from "@/components/ui/carousel-rail";
import { PageHeader, SectionHeader } from "@/components/ui/section-header";
import { StatCard, OrbitCard, OrbitCardContent } from "@/components/ui/orbit-card";

const invoices = [
  { id: "INV-2024-001", client: "TechCorp Industries", amount: "$12,450.00", date: "Oct 15, 2024", due: "Oct 30, 2024", status: "Paid" },
  { id: "INV-2024-002", client: "Global Logistics", amount: "$8,200.00", date: "Oct 18, 2024", due: "Nov 02, 2024", status: "Pending" },
  { id: "INV-2024-003", client: "Stark Enterprises", amount: "$45,100.00", date: "Oct 20, 2024", due: "Nov 04, 2024", status: "Pending" },
  { id: "INV-2024-004", client: "TechCorp Industries", amount: "$11,200.00", date: "Oct 01, 2024", due: "Oct 16, 2024", status: "Overdue" },
];

const statCards = [
  {
    label: "Total Receivables",
    value: "$64,300.00",
    icon: <DollarSign className="w-5 h-5" />,
    trend: { value: 15, positive: true },
  },
  {
    label: "Pending Payroll",
    value: "$32,150.00",
    icon: <Users className="w-5 h-5 text-amber-500" />,
    subtitle: "Due in 3 days",
  },
  {
    label: "Cash Flow",
    value: "$12,450.00",
    icon: <CreditCard className="w-5 h-5 text-blue-500" />,
    subtitle: "Available Balance",
  },
];

export default function Finance() {
  return (
    <Shell>
      <PageHeader
        title="Financials"
        subtitle="Invoicing, payroll, and payment processing."
        actions={
          <>
            <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/10">
              <Download className="w-4 h-4 mr-2" /> Export Report
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Send className="w-4 h-4 mr-2" /> Create Invoice
            </Button>
          </>
        }
      />

      {/* Desktop: BentoGrid layout */}
      <div className="hidden md:block mb-8">
        <BentoGrid cols={3} gap="md">
          {statCards.map((stat, index) => (
            <BentoTile key={index}>
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wide">{stat.label}</p>
                    <p className="text-2xl md:text-3xl font-bold text-white mt-1">{stat.value}</p>
                    {stat.trend && (
                      <p className={cn("text-xs mt-1", stat.trend.positive ? "text-emerald-400" : "text-red-400")}>
                        {stat.trend.positive ? "+" : ""}{stat.trend.value}% vs last month
                      </p>
                    )}
                    {stat.subtitle && (
                      <p className="text-xs text-slate-400 mt-1">{stat.subtitle}</p>
                    )}
                  </div>
                  <div className="text-cyan-400">{stat.icon}</div>
                </div>
              </div>
            </BentoTile>
          ))}
        </BentoGrid>
      </div>

      {/* Mobile: CarouselRail layout */}
      <div className="md:hidden mb-8">
        <CarouselRail gap="md" itemWidth="lg" showArrows={false}>
          {statCards.map((stat, index) => (
            <CarouselRailItem key={index}>
              <StatCard
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                trend={stat.trend}
                className="h-full"
              />
            </CarouselRailItem>
          ))}
        </CarouselRail>
      </div>

      <OrbitCard variant="default" hover={false} className="overflow-hidden p-0">
        <OrbitCardContent>
          <SectionHeader
            title="Recent Invoices"
            size="sm"
            className="px-4 pt-4 pb-2 mb-0 border-b border-slate-700/50"
          />
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-white/5 border-border/50">
                <TableHead>Invoice ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id} className="hover:bg-white/5 border-border/50">
                  <TableCell className="font-mono text-xs">{inv.id}</TableCell>
                  <TableCell className="font-medium">{inv.client}</TableCell>
                  <TableCell>{inv.date}</TableCell>
                  <TableCell>{inv.due}</TableCell>
                  <TableCell>{inv.amount}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "font-normal border-opacity-20",
                      inv.status === "Paid" ? "bg-green-500/10 text-green-500 border-green-500" :
                      inv.status === "Pending" ? "bg-amber-500/10 text-amber-500 border-amber-500" :
                      "bg-red-500/10 text-red-500 border-red-500"
                    )}>
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 hover:text-primary">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </OrbitCardContent>
      </OrbitCard>
    </Shell>
  );
}
