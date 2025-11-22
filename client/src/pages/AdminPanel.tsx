import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Settings, 
  Database, 
  CreditCard, 
  Lock,
  Activity,
  DollarSign,
  FileText
} from "lucide-react";

export default function AdminPanel() {
  return (
    <Shell>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-5 h-5 text-red-500" />
          <span className="text-sm font-bold text-red-500">ADMIN ONLY - RESTRICTED ACCESS</span>
        </div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">Administrator Panel</h1>
        <p className="text-muted-foreground">System configuration, security, and financial controls.</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-card border border-border/50">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="security">Security & Billing</TabsTrigger>
          <TabsTrigger value="payroll">Payroll System</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AdminCard 
              icon={Activity}
              title="System Health"
              desc="All systems operational"
              status="good"
            />
            <AdminCard 
              icon={Database}
              title="Data Integrity"
              desc="Last backup: 2 hours ago"
              status="good"
            />
            <AdminCard 
              icon={CreditCard}
              title="Payment Processing"
              desc="Stripe & Coinbase active"
              status="good"
            />
            <AdminCard 
              icon={AlertTriangle}
              title="Compliance"
              desc="All documents verified"
              status="good"
            />
          </div>

          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-heading">System Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-background/50 rounded border border-border/50 text-center">
                  <div className="text-2xl font-bold font-mono mb-1">1,284</div>
                  <div className="text-xs text-muted-foreground">Active Workers</div>
                </div>
                <div className="p-4 bg-background/50 rounded border border-border/50 text-center">
                  <div className="text-2xl font-bold font-mono mb-1">42</div>
                  <div className="text-xs text-muted-foreground">Active Clients</div>
                </div>
                <div className="p-4 bg-background/50 rounded border border-border/50 text-center">
                  <div className="text-2xl font-bold font-mono mb-1">$284.2K</div>
                  <div className="text-xs text-muted-foreground">Monthly Revenue</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm border-red-500/30 bg-red-500/5">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-500" />
                Security Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-background/50 rounded border border-border/50">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h4 className="font-bold text-sm">Document Encryption</h4>
                      <p className="text-xs text-muted-foreground">I-9 & sensitive docs</p>
                    </div>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">AES-256</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">All worker documents are encrypted with military-grade AES-256 encryption. Decryption keys are stored separately.</p>
                </div>

                <div className="p-4 bg-background/50 rounded border border-border/50">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h4 className="font-bold text-sm">Admin Access Control</h4>
                      <p className="text-xs text-muted-foreground">This panel</p>
                    </div>
                    <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">2FA Enabled</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Two-factor authentication required for all admin logins. Current user verified at 14:32 today.</p>
                </div>

                <div className="p-4 bg-background/50 rounded border border-border/50">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h4 className="font-bold text-sm">API Keys & Integrations</h4>
                      <p className="text-xs text-muted-foreground">Stripe, Coinbase, Payroll</p>
                    </div>
                    <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Rotated Weekly</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">All API keys are rotated weekly and stored in encrypted vaults. Never exposed in code or logs.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-heading">Billing & Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-background/50 rounded border border-border/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm">Current Plan</span>
                  <Badge className="bg-primary/20 text-primary border-primary/30">Growth ($299/mo)</Badge>
                </div>
                <p className="text-xs text-muted-foreground">500 workers, Automated payroll, Gov job compliance</p>
              </div>

              <div className="p-4 bg-background/50 rounded border border-border/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm">Next Billing</span>
                  <span className="font-mono text-sm">Dec 5, 2024</span>
                </div>
                <p className="text-xs text-muted-foreground">Stripe card ending in 4242</p>
              </div>

              <Button variant="outline" className="w-full">
                Manage Subscription
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-6">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Payroll Processing
              </CardTitle>
              <CardDescription>Manage automated payroll cycles and payments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-sm mb-3">Current Cycle</h4>
                  <div className="p-4 bg-background/50 rounded border border-border/50">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Week of Nov 18-24</span>
                      <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">In Progress</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mb-3">
                      1,284 workers • 8,521 hours logged • $178,342 total payroll
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Review Timesheets</Button>
                      <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                        Process & Send to Bank
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm mb-3">Recent Cycles</h4>
                  <div className="space-y-2 text-sm">
                    <div className="p-3 bg-background/50 rounded flex justify-between">
                      <span>Nov 11-17</span>
                      <span className="text-green-500">✓ Paid (Nov 18)</span>
                    </div>
                    <div className="p-3 bg-background/50 rounded flex justify-between">
                      <span>Nov 04-10</span>
                      <span className="text-green-500">✓ Paid (Nov 11)</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Audit Log
              </CardTitle>
              <CardDescription>Comprehensive system activity record (last 30 days).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs font-mono">
                <AuditEntry time="14:32" action="Admin login" details="2FA verified" type="info" />
                <AuditEntry time="14:05" action="Payroll processed" details="1,284 workers, $178,342" type="success" />
                <AuditEntry time="13:22" action="Document uploaded" details="Worker ID: W-4521" type="info" />
                <AuditEntry time="13:15" action="Payment received" details="Client invoice INV-2024-042: $24,500" type="success" />
                <AuditEntry time="12:45" action="API key rotated" details="Stripe integration" type="info" />
                <AuditEntry time="11:30" action="Export data" details="Monthly report generated" type="info" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Shell>
  );
}

function AdminCard({ icon: Icon, title, desc, status }: any) {
  const statusColor = status === 'good' ? 'text-green-500' : 'text-red-500';
  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <Icon className={`w-6 h-6 ${statusColor}`} />
          <div className={`w-2 h-2 rounded-full ${statusColor === 'text-green-500' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
        </div>
        <h3 className="font-bold text-sm mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}

function AuditEntry({ time, action, details, type }: any) {
  const typeColor = type === 'success' ? 'text-green-500' : type === 'error' ? 'text-red-500' : 'text-muted-foreground';
  return (
    <div className={`p-3 rounded border border-border/50 ${typeColor}`}>
      <div className="flex justify-between">
        <span>{time}</span>
        <span>{action}</span>
      </div>
      <div className="text-[10px] opacity-70 mt-1">{details}</div>
    </div>
  );
}