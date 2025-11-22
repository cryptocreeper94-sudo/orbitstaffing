import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart,
  Calendar,
  Download,
  AlertCircle
} from "lucide-react";

export default function BusinessFinance() {
  const currentMonth = "November 2025";

  return (
    <Shell>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Business Finance</h1>
          <p className="text-muted-foreground">P&L, costs, cash flow, and financial metrics</p>
        </div>
        <Button className="bg-primary text-primary-foreground">
          <Download className="w-4 h-4 mr-2" /> Export Report
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-card border border-border/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="taxes">Taxes & Compliance</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold">$47,580</p>
                    <p className="text-xs text-muted-foreground mt-2">{currentMonth}</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Costs</p>
                    <p className="text-3xl font-bold">$31,840</p>
                    <p className="text-xs text-muted-foreground mt-2">Payroll + taxes + ops</p>
                  </div>
                  <TrendingDown className="w-5 h-5 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Gross Profit</p>
                    <p className="text-3xl font-bold text-green-600">$15,740</p>
                    <p className="text-xs text-green-600 mt-2">33.1% margin</p>
                  </div>
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Placements</p>
                    <p className="text-3xl font-bold">87</p>
                    <p className="text-xs text-muted-foreground mt-2">This month</p>
                  </div>
                  <PieChart className="w-5 h-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* P&L Statement */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Profit & Loss Statement</CardTitle>
              <CardDescription>{currentMonth}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-border/50">
                  <span className="font-semibold">REVENUE</span>
                  <span className="text-lg font-bold">$47,580</span>
                </div>

                <div className="space-y-2 ml-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Client Invoicing (87 placements)</span>
                    <span>$47,580</span>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-3 my-3"></div>

                <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-border/50">
                  <span className="font-semibold">COSTS</span>
                  <span className="text-lg font-bold">$31,840</span>
                </div>

                <div className="space-y-2 ml-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Direct Payroll (Worker wages + taxes)</span>
                    <span>$24,920</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payroll Taxes (FICA, FUTA, SUTA)</span>
                    <span>$1,912</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Workers' Compensation Insurance</span>
                    <span>$2,840</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Background Checks & I-9 Processing</span>
                    <span>$654</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Software/Platform Subscription</span>
                    <span>$299</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Credit Card Processing (2.2% + $0.30)</span>
                    <span>$1,215</span>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-3 my-3"></div>

                <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                  <span className="font-bold text-green-600">NET PROFIT (Gross Margin)</span>
                  <span className="text-lg font-bold text-green-600">$15,740 (33.1%)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cash Flow */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Cash Flow Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Expected Income (Next 30 days)</p>
                <p className="text-2xl font-bold text-green-600">$51,200</p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Expected Expenses (Next 30 days)</p>
                <p className="text-2xl font-bold text-orange-600">$34,100</p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                <p className="text-xs text-primary mb-2">Projected Cash Available</p>
                <p className="text-2xl font-bold text-primary">$17,100</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Income Tab */}
        <TabsContent value="income" className="space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Client Invoicing</span>
                  <span className="font-bold">$47,580</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mb-3">
                  <span>87 placements × avg $546 bill-rate</span>
                  <span>100%</span>
                </div>
                <div className="w-full bg-background/50 rounded-full h-2">
                  <div className="bg-primary h-full rounded-full" style={{ width: "100%" }}></div>
                </div>
              </div>

              <div className="border-t border-border/50 pt-4 mt-4">
                <p className="text-sm text-muted-foreground mb-3">Markup Applied: 1.35x (Industry average: 1.6x - saving clients 35%)</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-background/50 rounded border border-border/50">
                    <p className="text-muted-foreground text-xs">Avg Worker Wage</p>
                    <p className="font-bold">$40/hr</p>
                  </div>
                  <div className="p-2 bg-background/50 rounded border border-border/50">
                    <p className="text-muted-foreground text-xs">Avg Bill Rate</p>
                    <p className="font-bold">$54/hr</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Operating Expenses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Payroll & Wages", amount: 24920, percent: 78 },
                { label: "Payroll Taxes", amount: 1912, percent: 6 },
                { label: "Workers' Comp", amount: 2840, percent: 9 },
                { label: "Compliance", amount: 654, percent: 2 },
                { label: "Software", amount: 299, percent: 1 },
                { label: "Processing Fees", amount: 1215, percent: 4 }
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">{item.label}</span>
                    <span className="font-bold">${item.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-background/50 rounded-full h-2">
                    <div className="bg-orange-500 h-full rounded-full" style={{ width: `${item.percent}%` }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground text-right mt-1">{item.percent}% of costs</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll Tab */}
        <TabsContent value="payroll" className="space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Payroll Summary</CardTitle>
              <CardDescription>November 2025</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Total Hours Worked</p>
                  <p className="text-2xl font-bold">2,140</p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Active Workers</p>
                  <p className="text-2xl font-bold">87</p>
                </div>
              </div>

              <div className="p-4 bg-background/50 rounded-lg border border-border/50 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gross Payroll</span>
                  <span className="font-bold">$24,920</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">FICA (7.65%)</span>
                  <span>$1,906</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">FUTA (0.6%)</span>
                  <span>$150</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SUTA (TN 2.7%)</span>
                  <span>$673</span>
                </div>
                <div className="border-t border-border/50 pt-2 flex justify-between font-bold">
                  <span>Total Payroll Cost</span>
                  <span>$27,649</span>
                </div>
              </div>

              <Button variant="outline" className="w-full border-border/50">View Detailed Payroll Report</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Taxes & Compliance */}
        <TabsContent value="taxes" className="space-y-6">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-600">Quarterly Tax Filing Due</p>
                <p className="text-xs text-blue-600/80">941 (Federal) due Dec 15 | SUTA (TN) due Jan 15</p>
              </div>
            </div>
          </div>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Tax Filings & Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold">Federal 941 (Quarterly)</p>
                      <p className="text-xs text-muted-foreground">Employee income tax, FICA</p>
                    </div>
                    <Badge className="bg-orange-500/20 text-orange-600">Due 12/15</Badge>
                  </div>
                  <p className="text-sm">Amount Due: $2,056</p>
                  <Button size="sm" variant="outline" className="mt-2">Prepare Filing</Button>
                </div>

                <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold">SUTA (Tennessee State)</p>
                      <p className="text-xs text-muted-foreground">State unemployment tax</p>
                    </div>
                    <Badge className="bg-orange-500/20 text-orange-600">Due 1/15</Badge>
                  </div>
                  <p className="text-sm">Amount Due: $673</p>
                  <Button size="sm" variant="outline" className="mt-2">Prepare Filing</Button>
                </div>

                <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold">Annual W-2 Filings</p>
                      <p className="text-xs text-muted-foreground">Employee year-end tax forms</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-600">Due 1/31</Badge>
                  </div>
                  <p className="text-sm">87 W-2s to generate</p>
                  <Button size="sm" variant="outline" className="mt-2">Generate W-2s</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 p-2">
                <Badge className="bg-green-500/20 text-green-600">✓</Badge>
                <span className="text-sm">I-9 Verification: 87/87 (100%)</span>
              </div>
              <div className="flex items-center gap-2 p-2">
                <Badge className="bg-green-500/20 text-green-600">✓</Badge>
                <span className="text-sm">Background Checks: 87/87 (100%)</span>
              </div>
              <div className="flex items-center gap-2 p-2">
                <Badge className="bg-green-500/20 text-green-600">✓</Badge>
                <span className="text-sm">Workers' Comp Coverage: Active</span>
              </div>
              <div className="flex items-center gap-2 p-2">
                <Badge className="bg-blue-500/20 text-blue-600">→</Badge>
                <span className="text-sm">E-Verify: In Progress (80/87)</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Shell>
  );
}
