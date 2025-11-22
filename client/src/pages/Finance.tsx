import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CreditCard, Download, Send } from "lucide-react";

const invoices = [
  { id: "INV-2024-001", client: "TechCorp Industries", amount: "$12,450.00", date: "Oct 15, 2024", due: "Oct 30, 2024", status: "Paid" },
  { id: "INV-2024-002", client: "Global Logistics", amount: "$8,200.00", date: "Oct 18, 2024", due: "Nov 02, 2024", status: "Pending" },
  { id: "INV-2024-003", client: "Stark Enterprises", amount: "$45,100.00", date: "Oct 20, 2024", due: "Nov 04, 2024", status: "Pending" },
  { id: "INV-2024-004", client: "TechCorp Industries", amount: "$11,200.00", date: "Oct 01, 2024", due: "Oct 16, 2024", status: "Overdue" },
];

export default function Finance() {
  return (
    <Shell>
       <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Financials</h1>
          <p className="text-muted-foreground">Invoicing, payroll, and payment processing.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/10">
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Send className="w-4 h-4 mr-2" /> Create Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Total Receivables</span>
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold font-heading">$64,300.00</div>
            <div className="text-xs text-muted-foreground mt-2">
              <span className="text-green-500">+15%</span> vs last month
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Pending Payroll</span>
              <UsersIcon className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-bold font-heading">$32,150.00</div>
            <div className="text-xs text-muted-foreground mt-2">Due in 3 days</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Cash Flow</span>
              <CreditCard className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold font-heading">$12,450.00</div>
            <div className="text-xs text-muted-foreground mt-2">Available Balance</div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 font-heading font-semibold">
          Recent Invoices
        </div>
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
      </div>
    </Shell>
  );
}

function UsersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

import { cn } from "@/lib/utils";