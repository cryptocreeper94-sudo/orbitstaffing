import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Facebook, Linkedin, Mail, Megaphone, Target, Zap } from "lucide-react";

export default function Marketing() {
  return (
    <Shell>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Recruiting Automation</h1>
          <p className="text-muted-foreground">Automated job postings and candidate outreach.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          <Zap className="w-4 h-4 mr-2" /> Run Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Active Campaigns
              </CardTitle>
              <CardDescription>Currently running automated recruiting sequences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CampaignRow 
                name="Warehouse Surge - Q4" 
                platform="Multi-Channel" 
                status="Active" 
                reach="12.4k" 
                candidates="142"
              />
              <CampaignRow 
                name="Senior Developer Hunt" 
                platform="LinkedIn + Dice" 
                status="Active" 
                reach="1.2k" 
                candidates="8"
              />
              <CampaignRow 
                name="Event Staff - Local" 
                platform="Facebook/Instagram" 
                status="Paused" 
                reach="4.5k" 
                candidates="56"
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <IntegrationCard 
               icon={Facebook}
               title="Facebook Jobs"
               desc="Auto-post to Marketplace and Groups"
               connected={true}
             />
             <IntegrationCard 
               icon={Linkedin}
               title="LinkedIn Talent"
               desc="Direct sourcing and InMail automation"
               connected={true}
             />
             <IntegrationCard 
               icon={Mail}
               title="Email Blast"
               desc="Re-engage dormant candidates"
               connected={false}
             />
             <IntegrationCard 
               icon={Megaphone}
               title="Indeed / Zip"
               desc="Sponsored job slot management"
               connected={true}
             />
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm h-full">
            <CardHeader>
              <CardTitle className="font-heading">Automation Rules</CardTitle>
              <CardDescription>Configure "If This Then That" for recruiting.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium text-foreground">Auto-Reply to Applicants</div>
                  <div className="text-xs text-muted-foreground">Send "Received" email immediately</div>
                </div>
                <Switch checked={true} />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium text-foreground">Keyword Filter</div>
                  <div className="text-xs text-muted-foreground">Auto-reject if missing skills</div>
                </div>
                <Switch checked={true} />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium text-foreground">Re-engagement</div>
                  <div className="text-xs text-muted-foreground">Email after 6 months dormancy</div>
                </div>
                <Switch checked={false} />
              </div>
              
              <div className="pt-4 border-t border-border/50">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="text-xs font-mono text-primary mb-2">PREDICTIVE ANALYTICS</div>
                  <div className="text-sm text-muted-foreground">
                    Based on current trends, you will need <span className="text-foreground font-bold">14</span> more forklift drivers by next Friday to meet projected demand.
                  </div>
                  <Button variant="link" className="text-primary px-0 text-xs h-auto mt-2">
                    Launch "Forklift" Campaign &rarr;
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}

function CampaignRow({ name, platform, status, reach, candidates }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-colors">
      <div>
        <div className="font-medium text-sm">{name}</div>
        <div className="text-xs text-muted-foreground">{platform}</div>
      </div>
      <div className="flex items-center gap-4 text-right">
        <div className="hidden md:block">
          <div className="text-xs text-muted-foreground">Reach</div>
          <div className="font-mono text-sm">{reach}</div>
        </div>
        <div className="hidden md:block">
          <div className="text-xs text-muted-foreground">Applicants</div>
          <div className="font-mono text-sm">{candidates}</div>
        </div>
        <Badge variant="outline" className={cn(
          "ml-2",
          status === "Active" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-gray-500/10 text-gray-500"
        )}>
          {status}
        </Badge>
      </div>
    </div>
  );
}

function IntegrationCard({ icon: Icon, title, desc, connected }: any) {
  return (
    <div className="p-4 rounded-lg bg-card/30 border border-border/50 flex items-start justify-between group hover:bg-card/50 transition-colors">
      <div className="flex gap-3">
        <div className="p-2 rounded bg-background/50 text-primary">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="font-medium text-sm">{title}</div>
          <div className="text-xs text-muted-foreground leading-tight max-w-[120px] mt-1">{desc}</div>
        </div>
      </div>
      <div className={cn(
        "w-2 h-2 rounded-full mt-2",
        connected ? "bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" : "bg-red-500"
      )} />
    </div>
  );
}

import { cn } from "@/lib/utils";