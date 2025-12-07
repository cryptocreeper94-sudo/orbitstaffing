import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { CarouselRail, CarouselRailItem } from "@/components/ui/carousel-rail";
import { PageHeader, SectionHeader } from "@/components/ui/section-header";
import { 
  OrbitCard, 
  OrbitCardHeader, 
  OrbitCardTitle, 
  OrbitCardDescription, 
  OrbitCardContent,
  StatCard, 
  ActionCard 
} from "@/components/ui/orbit-card";
import { 
  Scan, 
  Plus, 
  Phone, 
  Mail, 
  Calendar,
  CheckCircle2,
  User,
  Save,
  FileSignature,
  ExternalLink,
  Calculator,
  ArrowRight,
  Zap,
  TrendingUp,
  Users,
  DollarSign,
  Target
} from "lucide-react";
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

  const leads = [
    { name: "Mike Stevens", company: "Stevenson Construction", status: "Hot", lastContact: "2 hours ago", needs: "Electricians (4)", nextAction: "Send Quote" },
    { name: "Sarah Jenkins", company: "Metro Hospitality", status: "Warm", lastContact: "Yesterday", needs: "Event Staff (10)", nextAction: "Follow Up Call" },
    { name: "David Chen", company: "TechFlow Systems", status: "New", lastContact: "Just now", needs: "IT Support (2)", nextAction: "Initial Meeting" },
  ];

  return (
    <Shell>
      <PageHeader
        title="Sales Force CRM"
        subtitle="Lead management, digital CSAs, and cost analysis."
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="border-cyan-500/20 hover:bg-cyan-500/10 text-cyan-400"
              onClick={() => alert('Business card scanner feature coming soon')}
              data-testid="button-scan-card"
            >
              <Scan className="w-4 h-4 mr-2" /> Scan Business Card
            </Button>
            <Button 
              className="bg-cyan-500 text-slate-900 hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              onClick={() => alert('New lead form coming soon')}
              data-testid="button-new-lead"
            >
              <Plus className="w-4 h-4 mr-2" /> New Lead
            </Button>
          </div>
        }
      />

      <BentoGrid cols={4} gap="md" className="mb-8">
        <StatCard 
          label="Active Leads" 
          value="24" 
          icon={<Target className="w-6 h-6" />}
          trend={{ value: 12, positive: true }}
        />
        <StatCard 
          label="Closed This Month" 
          value="8" 
          icon={<CheckCircle2 className="w-6 h-6" />}
          trend={{ value: 25, positive: true }}
        />
        <StatCard 
          label="Pipeline Value" 
          value="$145K" 
          icon={<DollarSign className="w-6 h-6" />}
          trend={{ value: 8, positive: true }}
        />
        <StatCard 
          label="Conversion Rate" 
          value="33%" 
          icon={<TrendingUp className="w-6 h-6" />}
          trend={{ value: 5, positive: true }}
        />
      </BentoGrid>

      <div className="mb-12 pb-8 border-b border-slate-700/30">
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
        <TabsList className="bg-slate-800 border border-slate-700/50">
          <TabsTrigger value="leads">Active Leads</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="tools">Sales Tools & Calculator</TabsTrigger>
          <TabsTrigger value="csa">Digital CSA</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-6">
          <BentoGrid cols={3} gap="md">
            <BentoTile className="p-5">
              <OrbitCardHeader icon={<Scan className="w-5 h-5 text-cyan-400" />}>
                <OrbitCardTitle>Quick Capture</OrbitCardTitle>
                <OrbitCardDescription>Scan a card or type notes quickly.</OrbitCardDescription>
              </OrbitCardHeader>
              <OrbitCardContent className="space-y-4">
                <div className="p-8 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center text-center hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-colors cursor-pointer group">
                  <Scan className="w-8 h-8 text-slate-500 mb-2 group-hover:text-cyan-400 transition-colors" />
                  <span className="text-sm font-medium text-slate-500 group-hover:text-white">Tap to Scan Business Card</span>
                </div>
                <div className="relative">
                  <div className="absolute -top-2.5 left-2 bg-slate-800 px-1 text-xs text-slate-400">Quick Notes</div>
                  <Textarea 
                    placeholder="Met with John at construction site. Needs 4 electricians next Tuesday..." 
                    className="min-h-[150px] resize-none bg-slate-900/50 border-slate-700"
                  />
                </div>
                <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white">
                  <Save className="w-4 h-4 mr-2" /> Save to Inbox
                </Button>
              </OrbitCardContent>
            </BentoTile>

            <BentoTile span={2} className="p-5">
              <SectionHeader 
                title="Lead Pipeline" 
                subtitle="Your active leads and opportunities"
                size="sm"
              />
              <div className="space-y-4">
                {leads.map((lead, index) => (
                  <LeadCard key={index} {...lead} />
                ))}
              </div>
            </BentoTile>
          </BentoGrid>

          <div className="md:hidden">
            <CarouselRail title="Quick Actions" gap="md" itemWidth="lg">
              <CarouselRailItem>
                <ActionCard 
                  title="New Lead" 
                  description="Add a prospect"
                  icon={<Plus className="w-5 h-5" />}
                  onClick={() => alert('New lead form coming soon')}
                />
              </CarouselRailItem>
              <CarouselRailItem>
                <ActionCard 
                  title="Scan Card" 
                  description="Capture business card"
                  icon={<Scan className="w-5 h-5" />}
                  onClick={() => alert('Business card scanner feature coming soon')}
                />
              </CarouselRailItem>
              <CarouselRailItem>
                <ActionCard 
                  title="Send Quote" 
                  description="Generate proposal"
                  icon={<FileSignature className="w-5 h-5" />}
                  onClick={() => alert('Quote generator coming soon')}
                />
              </CarouselRailItem>
            </CarouselRail>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <SectionHeader 
            title="Connect Your Tools" 
            subtitle="Sync with your favorite apps for seamless workflow"
          />
          <BentoGrid cols={2} gap="md">
            <BentoTile className="p-5">
              <OrbitCardHeader icon={<Calendar className="w-5 h-5 text-blue-400" />}>
                <OrbitCardTitle>Google Calendar Integration</OrbitCardTitle>
                <OrbitCardDescription>Auto-sync meetings and follow-ups</OrbitCardDescription>
              </OrbitCardHeader>
              <OrbitCardContent className="space-y-4">
                <p className="text-sm text-slate-300">Automatically create calendar events for:</p>
                <ul className="text-sm space-y-2 text-slate-400">
                  <li>✓ Client meetings and calls</li>
                  <li>✓ Follow-up reminders</li>
                  <li>✓ Quote deadlines</li>
                  <li>✓ Assignment start dates</li>
                </ul>
                <Button className="w-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30">
                  <ExternalLink className="w-4 h-4 mr-2" /> Connect to Google
                </Button>
              </OrbitCardContent>
            </BentoTile>

            <BentoTile className="p-5">
              <OrbitCardHeader icon={<Calendar className="w-5 h-5 text-blue-500" />}>
                <OrbitCardTitle>Outlook/Microsoft 365</OrbitCardTitle>
                <OrbitCardDescription>For corporate calendar sync</OrbitCardDescription>
              </OrbitCardHeader>
              <OrbitCardContent className="space-y-4">
                <p className="text-sm text-slate-300">Integrate with Microsoft ecosystem:</p>
                <ul className="text-sm space-y-2 text-slate-400">
                  <li>✓ Outlook calendar sync</li>
                  <li>✓ Teams notifications</li>
                  <li>✓ Email integration</li>
                  <li>✓ Shared calendar support</li>
                </ul>
                <Button variant="outline" className="w-full border-slate-600 hover:border-cyan-500">
                  <ExternalLink className="w-4 h-4 mr-2" /> Connect to Outlook
                </Button>
              </OrbitCardContent>
            </BentoTile>

            <BentoTile className="p-5">
              <OrbitCardHeader icon={<Zap className="w-5 h-5 text-purple-400" />}>
                <OrbitCardTitle>Slack Notifications</OrbitCardTitle>
                <OrbitCardDescription>Get reminders in Slack</OrbitCardDescription>
              </OrbitCardHeader>
              <OrbitCardContent className="space-y-4">
                <p className="text-sm text-slate-300">Receive automated alerts:</p>
                <ul className="text-sm space-y-2 text-slate-400">
                  <li>✓ Lead follow-up reminders</li>
                  <li>✓ Quote approvals needed</li>
                  <li>✓ Team mentions/tags</li>
                  <li>✓ Daily summary reports</li>
                </ul>
                <Button className="w-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30">
                  <ExternalLink className="w-4 h-4 mr-2" /> Connect Slack
                </Button>
              </OrbitCardContent>
            </BentoTile>

            <BentoTile className="p-5">
              <OrbitCardHeader icon={<Mail className="w-5 h-5 text-red-400" />}>
                <OrbitCardTitle>Email Reminders</OrbitCardTitle>
                <OrbitCardDescription>Built-in reminder system</OrbitCardDescription>
              </OrbitCardHeader>
              <OrbitCardContent className="space-y-4">
                <p className="text-sm text-slate-300">Daily digest emails:</p>
                <ul className="text-sm space-y-2 text-slate-400">
                  <li>✓ Follow-up tasks due today</li>
                  <li>✓ Leads needing attention</li>
                  <li>✓ Custom reminder times</li>
                  <li>✓ Weekly summary reports</li>
                </ul>
                <Button className="w-full bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30">
                  <Mail className="w-4 h-4 mr-2" /> Configure Email
                </Button>
              </OrbitCardContent>
            </BentoTile>
          </BentoGrid>

          <OrbitCard variant="glass" className="bg-blue-500/10 border-blue-500/30">
            <p className="text-blue-400 font-semibold mb-2">✓ All integrations are secure</p>
            <p className="text-xs text-blue-400/80">OAuth authentication. No password sharing. You control what data is shared.</p>
          </OrbitCard>

          <div className="md:hidden">
            <CarouselRail title="Quick Connect" gap="md" itemWidth="md">
              <CarouselRailItem>
                <ActionCard 
                  title="Google Calendar" 
                  description="Sync meetings"
                  icon={<Calendar className="w-5 h-5" />}
                />
              </CarouselRailItem>
              <CarouselRailItem>
                <ActionCard 
                  title="Slack" 
                  description="Get alerts"
                  icon={<Zap className="w-5 h-5" />}
                />
              </CarouselRailItem>
              <CarouselRailItem>
                <ActionCard 
                  title="Email" 
                  description="Configure reminders"
                  icon={<Mail className="w-5 h-5" />}
                />
              </CarouselRailItem>
            </CarouselRail>
          </div>
        </TabsContent>

        <TabsContent value="tools">
          <SectionHeader 
            title="Sales Tools" 
            subtitle="Resources to help close deals faster"
          />
          <BentoGrid cols={2} gap="lg">
            <BentoTile className="p-6">
              <OrbitCardHeader icon={<Calculator className="w-5 h-5 text-cyan-400" />}>
                <OrbitCardTitle>Competitive Savings Calculator</OrbitCardTitle>
                <OrbitCardDescription>Show clients exactly how much they save with DarkWave.</OrbitCardDescription>
              </OrbitCardHeader>
              <OrbitCardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Worker Hourly Wage ($)</label>
                  <Input 
                    type="number" 
                    value={hourlyWage} 
                    onChange={(e) => setHourlyWage(parseFloat(e.target.value))}
                    className="text-lg font-mono bg-slate-900 border-slate-700"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                    <div className="text-sm text-slate-400 mb-2">Standard Agency (1.6x)</div>
                    <div className="text-2xl font-bold font-mono text-slate-400">${competitorBill.toFixed(2)}<span className="text-sm font-normal">/hr</span></div>
                  </div>
                  <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-cyan-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-bl">DARKWAVE</div>
                    <div className="text-sm text-cyan-400 mb-2 font-bold">DarkWave (1.35x)</div>
                    <div className="text-2xl font-bold font-mono text-white">${darkwaveBill.toFixed(2)}<span className="text-sm font-normal text-slate-400">/hr</span></div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-emerald-400">Client Savings Per Hour</div>
                    <div className="text-xs text-emerald-400/70">Per worker</div>
                  </div>
                  <div className="text-3xl font-bold font-mono text-emerald-400">${savings.toFixed(2)}</div>
                </div>
                
                <div className="text-xs text-center text-slate-400">
                  *Annual savings for 10 workers: <span className="text-white font-bold">${(savings * 40 * 52 * 10).toLocaleString()}</span>
                </div>
              </OrbitCardContent>
            </BentoTile>

            <BentoTile className="p-6">
              <OrbitCardHeader>
                <OrbitCardTitle>Availability Checker</OrbitCardTitle>
                <OrbitCardDescription>Real-time database query.</OrbitCardDescription>
              </OrbitCardHeader>
              <OrbitCardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Trade / Skill</label>
                  <Input placeholder="e.g. General Labor, Electrician" className="bg-slate-900 border-slate-700" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Date Needed</label>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 border-slate-600 hover:border-cyan-500">Tomorrow</Button>
                    <Button variant="outline" className="flex-1 border-slate-600 hover:border-cyan-500">Next Week</Button>
                  </div>
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-400 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-bold">Ready to Deploy</span>
                  </div>
                  <p className="text-sm text-slate-400">
                    We have <span className="text-white font-bold">14</span> General Laborers available for tomorrow.
                  </p>
                </div>
              </OrbitCardContent>
            </BentoTile>
          </BentoGrid>
        </TabsContent>

        <TabsContent value="csa">
          <BentoTile className="max-w-2xl mx-auto p-0 overflow-hidden">
            <div className="text-center border-b border-slate-700/50 p-8">
              <div className="mx-auto w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center mb-4 text-cyan-400">
                <FileSignature className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">Client Service Agreement</h2>
              <p className="text-slate-400 mt-2">Generate a digital agreement for immediate approval.</p>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Client Company Name</label>
                  <Input placeholder="e.g. TechCorp Industries" className="bg-slate-900 border-slate-700" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Authorized Rep</label>
                  <Input placeholder="e.g. John Smith" className="bg-slate-900 border-slate-700" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Rep Email</label>
                <Input type="email" placeholder="john@techcorp.com" className="bg-slate-900 border-slate-700" />
              </div>
              
              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 text-sm text-slate-400">
                <p className="mb-2 font-bold text-white">Terms Summary:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Net 30 Payment Terms</li>
                  <li>4-hour minimum per worker</li>
                  <li>DarkWave handles all insurance & payroll</li>
                  <li>Client provides site safety equipment (unless requested)</li>
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <Button className="w-full bg-cyan-500 text-slate-900 hover:bg-cyan-400 h-12 text-lg font-semibold">
                  Generate & Send for Signature <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button variant="outline" className="w-full border-slate-600 hover:border-cyan-500">
                  <ExternalLink className="w-4 h-4 mr-2" /> Preview Agreement
                </Button>
              </div>
            </div>
          </BentoTile>
        </TabsContent>
      </Tabs>
    </Shell>
  );
}

function LeadCard({ name, company, status, lastContact, needs, nextAction }: any) {
  const statusColors: Record<string, string> = {
    Hot: "text-red-400 bg-red-500/10 border-red-500/20",
    Warm: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    New: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  };

  return (
    <OrbitCard hover className="!p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center">
            <User className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
          </div>
          <div>
            <div className="font-bold text-white">{name}</div>
            <div className="text-sm text-slate-400">{company}</div>
          </div>
        </div>
        <Badge variant="outline" className={statusColors[status] || ""}>
          {status}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50">
          <div className="text-xs text-slate-500 mb-1">Looking For</div>
          <div className="font-medium text-white truncate">{needs}</div>
        </div>
        <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50">
          <div className="text-xs text-slate-500 mb-1">Next Action</div>
          <div className="font-medium text-white truncate">{nextAction}</div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-slate-700/30">
        <div className="text-xs text-slate-500 flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {lastContact}
        </div>
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-cyan-500/10 hover:text-cyan-400">
            <Phone className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-cyan-500/10 hover:text-cyan-400">
            <Mail className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </OrbitCard>
  );
}
