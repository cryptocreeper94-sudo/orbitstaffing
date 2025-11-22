import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Save
} from "lucide-react";
import QRCode from "react-qr-code";
import { useState } from "react";

export default function Sales() {
  const [activeTab, setActiveTab] = useState("leads");

  return (
    <Shell>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Sales Force CRM</h1>
          <p className="text-muted-foreground">Lead management, outreach tools, and digital identity.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="border-primary/20 hover:bg-primary/10 text-primary">
            <Scan className="w-4 h-4 mr-2" /> Scan Business Card
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Plus className="w-4 h-4 mr-2" /> New Lead
          </Button>
        </div>
      </div>

      <Tabs defaultValue="leads" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="bg-card border border-border/50">
          <TabsTrigger value="leads">Active Leads</TabsTrigger>
          <TabsTrigger value="digital-card">My Digital Card</TabsTrigger>
          <TabsTrigger value="tools">Sales Tools</TabsTrigger>
        </TabsList>

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

        <TabsContent value="digital-card" className="flex flex-col items-center justify-center py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl">
             {/* The Card */}
             <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative h-[240px] w-full bg-card border border-border/50 rounded-xl p-8 flex flex-col justify-between overflow-hidden">
                   {/* Background Noise */}
                   <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay"></div>
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                   
                   <div className="relative z-10">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-2xl font-bold font-heading tracking-wide text-foreground">JASON</h2>
                          <p className="text-primary font-medium">DarkWave Studios</p>
                        </div>
                        <QrCode className="w-8 h-8 text-foreground/80" />
                      </div>
                   </div>

                   <div className="relative z-10 space-y-2">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4 text-primary" />
                        cryptocreeper94@gmail.com
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                         <Phone className="w-4 h-4 text-primary" />
                         +1 (615) 555-0123
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                         <MapPin className="w-4 h-4 text-primary" />
                         Nashville, TN
                      </div>
                   </div>
                </div>
             </div>

             {/* QR Code & Sharing */}
             <div className="flex flex-col items-center justify-center space-y-6 bg-card/30 p-8 rounded-xl border border-border/30">
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <QRCode 
                    value="BEGIN:VCARD\nVERSION:3.0\nFN:Jason\nORG:DarkWave Studios\nEMAIL:cryptocreeper94@gmail.com\nTEL:+16155550123\nADR:;;Nashville;TN;;;USA\nEND:VCARD" 
                    size={180}
                    level="M"
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground max-w-xs">
                  Scan to add Jason to contacts directly.
                </p>
                <div className="flex gap-4 w-full">
                  <Button className="flex-1 bg-background border border-border hover:bg-accent hover:text-accent-foreground">
                    <Share2 className="w-4 h-4 mr-2" /> Share Link
                  </Button>
                  <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                    Download PNG
                  </Button>
                </div>
             </div>
          </div>
        </TabsContent>

        <TabsContent value="tools">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
               <CardHeader>
                 <CardTitle className="font-heading">Availability Checker</CardTitle>
                 <CardDescription>Instant answers for client questions.</CardDescription>
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
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-green-500 mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-bold">Available</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      We have <span className="text-foreground font-bold">14</span> General Laborers available for tomorrow.
                    </p>
                  </div>
               </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
               <CardHeader>
                 <CardTitle className="font-heading">Rate Calculator</CardTitle>
                 <CardDescription>Generate quick estimates on the spot.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hourly Wage</label>
                      <Input type="number" placeholder="$20.00" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Markup %</label>
                      <Input type="number" placeholder="45%" />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border/30 flex justify-between items-end">
                    <div>
                      <div className="text-xs text-muted-foreground">Bill Rate</div>
                      <div className="text-2xl font-bold font-heading text-primary">$29.00<span className="text-sm text-muted-foreground font-normal">/hr</span></div>
                    </div>
                    <Button size="sm">Create Quote</Button>
                  </div>
               </CardContent>
            </Card>
          </div>
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