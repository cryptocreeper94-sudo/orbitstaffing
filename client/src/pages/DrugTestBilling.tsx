import { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, CreditCard, FileText, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface BillingRecord {
  id: string;
  testId: string;
  employee: string;
  testType: string;
  reason: string;
  estimatedCost: number;
  paidBy: string;
  status: string;
  date: Date;
}

export default function DrugTestBilling() {
  const [billingRecords] = useState<BillingRecord[]>([
    {
      id: '1',
      testId: 'TEST-001',
      employee: 'John Doe',
      testType: '5-Panel',
      reason: 'Pre-employment',
      estimatedCost: 75,
      paidBy: 'ABC Manufacturing',
      status: 'paid',
      date: new Date(Date.now() - 604800000)
    },
    {
      id: '2',
      testId: 'TEST-002',
      employee: 'Sarah Johnson',
      testType: '10-Panel',
      reason: 'Workman\'s Comp Incident',
      estimatedCost: 125,
      paidBy: 'ORBIT Staffing',
      status: 'paid',
      date: new Date(Date.now() - 259200000)
    },
    {
      id: '3',
      testId: 'TEST-003',
      employee: 'Mike Wilson',
      testType: '5-Panel',
      reason: 'Pre-employment',
      estimatedCost: 75,
      paidBy: 'XYZ Construction',
      status: 'processing',
      date: new Date(Date.now() - 86400000)
    }
  ]);

  return (
    <Shell>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading mb-2">Drug Test Billing & Payments</h1>
        <p className="text-muted-foreground">
          Track who pays for drug testing - employers, ORBIT, or combined responsibility
        </p>
      </div>

      <Tabs defaultValue="policy" className="space-y-6">
        <TabsList className="bg-card border border-border/50">
          <TabsTrigger value="policy">Payment Policy</TabsTrigger>
          <TabsTrigger value="records">Billing Records</TabsTrigger>
          <TabsTrigger value="invoice">Invoicing</TabsTrigger>
        </TabsList>

        {/* Payment Policy */}
        <TabsContent value="policy" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pre-Employment */}
            <Card className="border-blue-700/50 bg-blue-900/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  Pre-Employment Testing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-card/50 rounded-lg p-3">
                  <p className="text-sm font-bold text-blue-300 mb-1">Who Pays:</p>
                  <p className="text-foreground font-bold">The Employer/Customer</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  When a staffing customer requests a pre-employment drug test before hiring, they cover the cost.
                </p>
                <ul className="text-xs text-gray-400 space-y-1 ml-3">
                  <li>✓ Customer initiates hiring process</li>
                  <li>✓ Customer requires drug test</li>
                  <li>✓ Customer pays via invoice</li>
                  <li>✓ ORBIT invoices monthly</li>
                </ul>
                <div className="bg-slate-700/30 rounded-lg p-2 text-xs text-gray-400">
                  <strong>Typical Cost:</strong> $50-150 depending on panel
                </div>
              </CardContent>
            </Card>

            {/* Workman's Comp */}
            <Card className="border-orange-700/50 bg-orange-900/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-400" />
                  Workman's Comp Incidents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-card/50 rounded-lg p-3">
                  <p className="text-sm font-bold text-orange-300 mb-1">Who Pays:</p>
                  <p className="text-foreground font-bold">ORBIT Staffing</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  When an employee is injured on-site and a drug test is required for workman's comp, ORBIT covers it.
                </p>
                <ul className="text-xs text-gray-400 space-y-1 ml-3">
                  <li>✓ On-site injury reported</li>
                  <li>✓ Workman's comp claim filed</li>
                  <li>✓ ORBIT covers test cost</li>
                  <li>✓ Prevents liability disputes</li>
                </ul>
                <div className="bg-slate-700/30 rounded-lg p-2 text-xs text-gray-400">
                  <strong>Business Rule:</strong> ORBIT absorbs cost, treats as compliance expense
                </div>
              </CardContent>
            </Card>

            {/* Random Testing */}
            <Card className="border-green-700/50 bg-green-900/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-400" />
                  Random/Ongoing Testing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-card/50 rounded-lg p-3">
                  <p className="text-sm font-bold text-green-300 mb-1">Who Pays:</p>
                  <p className="text-foreground font-bold">Employer or ORBIT (Negotiated)</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  For ongoing compliance testing programs, payment is determined by contract or employer requirement.
                </p>
                <ul className="text-xs text-gray-400 space-y-1 ml-3">
                  <li>✓ Part of compliance program</li>
                  <li>✓ Employer-initiated</li>
                  <li>✓ Can be tiered or bundled</li>
                  <li>✓ Volume discounts available</li>
                </ul>
                <div className="bg-slate-700/30 rounded-lg p-2 text-xs text-gray-400">
                  <strong>Typical:</strong> 50/50 split or employer-paid
                </div>
              </CardContent>
            </Card>

            {/* Employee Protection */}
            <Card className="border-green-700/50 bg-green-900/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Employee Protection Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-card/50 rounded-lg p-3">
                  <p className="text-sm font-bold text-green-300 mb-1">Key Rule:</p>
                  <p className="text-foreground font-bold">Employees NEVER pay for tests</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  ORBIT's policy: Workers should never bear the cost of compliance testing.
                </p>
                <ul className="text-xs text-gray-400 space-y-1 ml-3">
                  <li>✓ Pre-employment: Employer pays</li>
                  <li>✓ Incidents: ORBIT covers</li>
                  <li>✓ Ongoing: Employer or shared</li>
                  <li>✓ Never employee burden</li>
                </ul>
                <div className="bg-slate-700/30 rounded-lg p-2 text-xs text-gray-400">
                  <strong>Competitive Advantage:</strong> Workers trust ORBIT system more
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Processing */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Processing Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-border/50 rounded-lg p-4">
                  <p className="font-bold text-foreground mb-2">Stripe (Real-time)</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Customers pay immediately via credit/debit card during pre-employment test scheduling.
                  </p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>✓ Instant payment</li>
                    <li>✓ Low friction</li>
                    <li>✓ 2.9% + $0.30 fee</li>
                  </ul>
                </div>

                <div className="border border-border/50 rounded-lg p-4">
                  <p className="font-bold text-foreground mb-2">Invoice (Monthly)</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Employers receive consolidated invoices with all drug tests for the month.
                  </p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>✓ Batch billing</li>
                    <li>✓ Net 30 terms</li>
                    <li>✓ Accountable</li>
                  </ul>
                </div>

                <div className="border border-border/50 rounded-lg p-4">
                  <p className="font-bold text-foreground mb-2">ORBIT Account (Internal)</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Workman's comp tests charged to ORBIT's internal operations account.
                  </p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>✓ Auto-charged</li>
                    <li>✓ No customer involvement</li>
                    <li>✓ Compliance expense</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Records */}
        <TabsContent value="records" className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Recent Billing Records</h2>

          <Card className="border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-card/50 border-b border-border/50">
                  <tr>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Test ID</th>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Employee</th>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Type</th>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Reason</th>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Cost</th>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Paid By</th>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {billingRecords.map(record => (
                    <tr key={record.id} className="border-b border-border/50 hover:bg-card/50" data-testid={`billing-row-${record.id}`}>
                      <td className="px-6 py-3 font-mono text-cyan-400">{record.testId}</td>
                      <td className="px-6 py-3 font-medium text-foreground">{record.employee}</td>
                      <td className="px-6 py-3 text-sm">{record.testType}</td>
                      <td className="px-6 py-3 text-sm text-muted-foreground">{record.reason}</td>
                      <td className="px-6 py-3 font-bold text-foreground">${record.estimatedCost}</td>
                      <td className="px-6 py-3 text-sm">{record.paidBy}</td>
                      <td className="px-6 py-3">
                        <Badge
                          variant="outline"
                          className={
                            record.status === 'paid'
                              ? 'bg-green-900/30 text-green-300'
                              : record.status === 'processing'
                              ? 'bg-blue-900/30 text-blue-300'
                              : 'bg-yellow-900/30 text-yellow-300'
                          }
                        >
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Invoicing */}
        <TabsContent value="invoice" className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Generate Invoices</h2>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Monthly Invoice Summary
              </CardTitle>
              <CardDescription>
                Automatically generated invoices sent to employers for pre-employment tests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-3">
                  <strong>Invoice Period:</strong> January 2024
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">ABC Manufacturing (2 tests)</span>
                    <span className="text-foreground font-bold">$150.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">XYZ Construction (1 test)</span>
                    <span className="text-foreground font-bold">$125.00</span>
                  </div>
                  <div className="flex justify-between border-t border-border/50 pt-2 mt-2">
                    <span className="font-bold text-foreground">Total Due:</span>
                    <span className="font-bold text-green-400">$275.00</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-900/10 border border-blue-700/50 rounded-lg p-4">
                <p className="text-sm text-blue-300 mb-2">
                  <strong>✓ Automated:</strong> Invoices are automatically generated and sent on the 1st of each month for all pre-employment tests conducted in the previous month.
                </p>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90" data-testid="button-generate-invoice">
                <FileText className="w-4 h-4 mr-2" />
                Generate Current Period Invoice
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Shell>
  );
}
