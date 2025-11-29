import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Scan, 
  QrCode, 
  Share2, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  CheckCircle2,
  Briefcase,
  User,
  Save,
  FileSignature,
  ExternalLink,
  Calculator,
  ArrowRight,
  Zap
} from "lucide-react";
import QRCode from "react-qr-code";
import { useState } from "react";
import { AdminBusinessCard } from "@/components/AdminBusinessCard";

export default function Sales() {
  const [activeTab, setActiveTab] = useState("leads");
  const [hourlyWage, setHourlyWage] = useState(20);
  const [competitorMarkup, setCompetitorMarkup] = useState(1.6);
  const [darkwaveMarkup, setDarkwaveMarkup] = useState(1.35);

  const competitorBill = hourlyWage * competitorMarkup;
  const darkwaveBill = hourlyWage * darkwaveMarkup;
  const savings = competitorBill - darkwaveBill;

  return (
    <Shell>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Sales Force CRM</h1>
          <p className="text-muted-foreground">Lead management, digital CSAs, and cost analysis.</p>
        </div>
        <div className="flex gap-2">
           <Button 
            variant="outline" 
            className="border-primary/20 hover:bg-primary/10 text-primary"
            onClick={() => alert('Business card scanner feature coming soon')}
            data-testid="button-scan-card"
          >
            <Scan className="w-4 h-4 mr-2" /> Scan Business Card
          </Button>
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            onClick={() => alert('New lead form coming soon')}
            data-testid="button-new-lead"
          >
            <Plus className="w-4 h-4 mr-2" /> New Lead
          </Button>
        </div>
      </div>

      {/* Business Card - Top of Page */}
      <div className="mb-12 pb-8 border-b border-border/30">
        <AdminBusinessCard
          adminId="current-admin"
          fullName="Your Name"
          title="Sales Director"
          companyName="ORBIT Staffing OS"
          email="you@orbitstaffing.io"
          phone="+1 (615) 555-0123"
          location="Nashville, TN"
          website="orbitstaffing.io"
          brandColor="#06B6D4"
          onSave={(card) => {
            console.log('Business card saved:', card);
          }}
        />
      </div>

      <Tabs defaultValue="leads" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="bg-card border border-border/50">
          <TabsTrigger value="leads">Active Leads</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="tools">Sales Tools & Calculator</TabsTrigger>
          <TabsTrigger value="csa">Digital CSA</TabsTrigger>
        </TabsList>

        {/* ... Leads Content ... */}
        <TabsContent value="leads" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Add / Scratchpad */}
            <Card className="lg:col-span-1 bg-card/50 border-border/50 backdrop-blur-sm h-fit">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <Scan className="w-4 h-4 text-primary" /> Quick Capture
                </CardTitle>
                <CardDescription>Scan a card or type notes quickly.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-8 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer group">
                  <Scan className="w-8 h-8 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">Tap to Scan Business Card</span>
                </div>
                <div className="relative">
                  <div className="absolute -top-2.5 left-2 bg-card px-1 text-xs text-muted-foreground">Quick Notes</div>
                  <Textarea 
                    placeholder="Met with John at construction site. Needs 4 electricians next Tuesday..." 
                    className="min-h-[150px] resize-none bg-background/50 border-border/50"
                  />
                </div>
                <Button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground">
                  <Save className="w-4 h-4 mr-2" /> Save to Inbox
                </Button>
              </CardContent>
            </Card>

            {/* Kanban / List View */}
            <div className="lg:col-span-2 space-y-4">
              <LeadCard 
                name="Mike Stevens" 
                company="Stevenson Construction" 
                status="Hot" 
                lastContact="2 hours ago"
                needs="Electricians (4)"
                nextAction="Send Quote"
              />
              <LeadCard 
                name="Sarah Jenkins" 
                company="Metro Hospitality" 
                status="Warm" 
                lastContact="Yesterday"
                needs="Event Staff (10)"
                nextAction="Follow Up Call"
              />
              <LeadCard 
                name="David Chen" 
                company="TechFlow Systems" 
                status="New" 
                lastContact="Just now"
                needs="IT Support (2)"
                nextAction="Initial Meeting"
              />
            </div>
          </div>
        </TabsContent>

        {/* Integration Config Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Google Calendar */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Google Calendar Integration
                </CardTitle>
                <CardDescription>Auto-sync meetings and follow-ups</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">Automatically create calendar events for:</p>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>✓ Client meetings and calls</li>
                  <li>✓ Follow-up reminders</li>
                  <li>✓ Quote deadlines</li>
                  <li>✓ Assignment start dates</li>
                </ul>
                <Button className="w-full bg-blue-500/20 text-blue-600 hover:bg-blue-500/30 border border-blue-500/30">
                  <ExternalLink className="w-4 h-4 mr-2" /> Connect to Google
                </Button>
              </CardContent>
            </Card>

            {/* Outlook Calendar */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Outlook/Microsoft 365
                </CardTitle>
                <CardDescription>For corporate calendar sync</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">Integrate with Microsoft ecosystem:</p>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>✓ Outlook calendar sync</li>
                  <li>✓ Teams notifications</li>
                  <li>✓ Email integration</li>
                  <li>✓ Shared calendar support</li>
                </ul>
                <Button variant="outline" className="w-full border-border/50">
                  <ExternalLink className="w-4 h-4 mr-2" /> Connect to Outlook
                </Button>
              </CardContent>
            </Card>

            {/* Slack Reminders */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-500" />
                  Slack Notifications
                </CardTitle>
                <CardDescription>Get reminders in Slack</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">Receive automated alerts:</p>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>✓ Lead follow-up reminders</li>
                  <li>✓ Quote approvals needed</li>
                  <li>✓ Team mentions/tags</li>
                  <li>✓ Daily summary reports</li>
                </ul>
                <Button className="w-full bg-purple-500/20 text-purple-600 hover:bg-purple-500/30 border border-purple-500/30">
                  <ExternalLink className="w-4 h-4 mr-2" /> Connect Slack
                </Button>
              </CardContent>
            </Card>

            {/* Email Reminders */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="w-5 h-5 text-red-500" />
                  Email Reminders
                </CardTitle>
                <CardDescription>Built-in reminder system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">Daily digest emails:</p>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>✓ Follow-up tasks due today</li>
                  <li>✓ Leads needing attention</li>
                  <li>✓ Custom reminder times</li>
                  <li>✓ Weekly summary reports</li>
                </ul>
                <Button className="w-full bg-red-500/20 text-red-600 hover:bg-red-500/30 border border-red-500/30">
                  <Mail className="w-4 h-4 mr-2" /> Configure Email
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm">
            <p className="text-blue-600 font-semibold mb-2">✓ All integrations are secure</p>
            <p className="text-xs text-blue-600/80">OAuth authentication. No password sharing. You control what data is shared.</p>
          </div>
        </TabsContent>

        <TabsContent value="tools">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
               <CardHeader>
                 <CardTitle className="font-heading flex items-center gap-2">
                   <Calculator className="w-5 h-5 text-primary" />
                   Competitive Savings Calculator
                 </CardTitle>
                 <CardDescription>Show clients exactly how much they save with DarkWave.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Worker Hourly Wage ($)</label>
                    <Input 
                      type="number" 
                      value={hourlyWage} 
                      onChange={(e) => setHourlyWage(parseFloat(e.target.value))}
                      className="text-lg font-mono"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                      <div className="text-sm text-muted-foreground mb-2">Standard Agency (1.6x)</div>
                      <div className="text-2xl font-bold font-mono text-muted-foreground">${competitorBill.toFixed(2)}<span className="text-sm font-normal">/hr</span></div>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 relative overflow-hidden">
                       <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-bl">DARKWAVE</div>
                      <div className="text-sm text-primary mb-2 font-bold">DarkWave (1.35x)</div>
                      <div className="text-2xl font-bold font-mono text-foreground">${darkwaveBill.toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/hr</span></div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-green-500">Client Savings Per Hour</div>
                      <div className="text-xs text-green-500/70">Per worker</div>
                    </div>
                    <div className="text-3xl font-bold font-mono text-green-500">${savings.toFixed(2)}</div>
                  </div>
                  
                  <div className="text-xs text-center text-muted-foreground">
                    *Annual savings for 10 workers: <span className="text-foreground font-bold">${(savings * 40 * 52 * 10).toLocaleString()}</span>
                  </div>
               </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                 <CardHeader>
                   <CardTitle className="font-heading">Availability Checker</CardTitle>
                   <CardDescription>Real-time database query.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Trade / Skill</label>
                      <Input placeholder="e.g. General Labor, Electrician" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date Needed</label>
                      <div className="flex gap-2">
                         <Button variant="outline" className="flex-1">Tomorrow</Button>
                         <Button variant="outline" className="flex-1">Next Week</Button>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-500 mb-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="font-bold">Ready to Deploy</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        We have <span className="text-foreground font-bold">14</span> General Laborers available for tomorrow.
                      </p>
                    </div>
                 </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="csa">
           <Card className="max-w-2xl mx-auto bg-card border-border">
              <CardHeader className="text-center border-b border-border/50 pb-8">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                  <FileSignature className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl font-heading">Client Service Agreement</CardTitle>
                <CardDescription>Generate a digital agreement for immediate approval.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Client Company Name</label>
                    <Input placeholder="e.g. TechCorp Industries" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Authorized Rep</label>
                    <Input placeholder="e.g. John Smith" />
                  </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Rep Email</label>
                    <Input type="email" placeholder="john@techcorp.com" />
                </div>
                
                <div className="p-4 bg-background/50 rounded-lg border border-border/50 text-sm text-muted-foreground">
                  <p className="mb-2 font-bold text-foreground">Terms Summary:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Net 30 Payment Terms</li>
                    <li>4-hour minimum per worker</li>
                    <li>DarkWave handles all insurance & payroll</li>
                    <li>Client provides site safety equipment (unless requested)</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-3">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-lg">
                    Generate & Send for Signature <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" /> Preview Agreement
                  </Button>
                </div>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </Shell>
  );
}

function LeadCard({ name, company, status, lastContact, needs, nextAction }: any) {
  const statusColors: Record<string, string> = {
    Hot: "text-red-500 bg-red-500/10 border-red-500/20",
    Warm: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    New: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  };

  return (
    <div className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
           <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
             <User className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
           </div>
           <div>
             <div className="font-bold text-foreground">{name}</div>
             <div className="text-sm text-muted-foreground">{company}</div>
           </div>
        </div>
        <Badge variant="outline" className={statusColors[status] || ""}>
          {status}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
         <div className="bg-background/50 p-2 rounded border border-border/50">
            <div className="text-xs text-muted-foreground mb-1">Looking For</div>
            <div className="font-medium truncate">{needs}</div>
         </div>
         <div className="bg-background/50 p-2 rounded border border-border/50">
            <div className="text-xs text-muted-foreground mb-1">Next Action</div>
            <div className="font-medium truncate">{nextAction}</div>
         </div>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-border/30">
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {lastContact}
        </div>
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <Phone className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <Mail className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}