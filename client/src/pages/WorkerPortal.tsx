import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation } from 'wouter';
import { 
  MessageSquare, 
  Clock, 
  HardHat, 
  AlertTriangle, 
  CalendarX, 
  CheckCircle2,
  Send,
  Camera,
  Calendar,
  Zap,
  Share2,
  Gift
} from "lucide-react";
import { useState } from "react";
import WeatherNewsWidget from '@/components/WeatherNewsWidget';
import HourCounter from '@/components/HourCounter';

export default function WorkerPortal() {
  const [, setLocation] = useLocation();
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <Shell>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Worker Hub</h1>
          <p className="text-muted-foreground">Manage your shifts, report issues, and request gear.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 px-4 py-1">
            Status: Active • On Site
          </Badge>
          <Button onClick={() => setLocation('/incident-reporting')} className="bg-red-600 hover:bg-red-700 text-xs" data-testid="button-worker-incident-report">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Report Incident
          </Button>
          <Button onClick={() => setLocation('/pre-apply')} variant="outline" className="text-xs" data-testid="button-worker-pre-apply">
            <Camera className="w-3 h-3 mr-1" />
            ID Verification
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ActionCard 
              icon={Clock} 
              title="Report Late / Absence" 
              desc="Let us know if you can't make it."
              color="text-amber-500"
            />
            <ActionCard 
              icon={HardHat} 
              title="Request Equipment" 
              desc="Need PPE, boots, or tools?"
              color="text-blue-500"
            />
            <ActionCard 
              icon={AlertTriangle} 
              title="Report Safety Issue" 
              desc="Flag hazards immediately."
              color="text-red-500"
            />
            <ActionCard 
              icon={CalendarX} 
              title="Time Off Request" 
              desc="Schedule future vacation."
              color="text-purple-500"
            />
          </div>

          <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-lg p-4">
            <h3 className="font-bold text-white mb-4">Your Earnings & Opportunities</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button 
                onClick={() => setLocation('/worker-bonuses')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                data-testid="button-worker-bonuses"
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Bonuses</span>
              </Button>
              <Button 
                onClick={() => setLocation('/worker-shifts')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                data-testid="button-worker-shifts"
              >
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>Shifts</span>
              </Button>
              <Button 
                onClick={() => setLocation('/worker-availability')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                data-testid="button-worker-availability"
              >
                <Calendar className="w-4 h-4 text-purple-500" />
                <span>Availability</span>
              </Button>
              <Button 
                onClick={() => setLocation('/worker-referrals')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                data-testid="button-worker-referrals"
              >
                <Share2 className="w-4 h-4 text-green-500" />
                <span>Referrals</span>
              </Button>
            </div>
          </div>

          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-heading">Current Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between p-4 rounded-lg bg-background/50 border border-border/50">
                <div>
                  <h3 className="font-bold text-lg">TechCorp Warehouse A</h3>
                  <p className="text-muted-foreground">123 Industrial Pkwy, Nashville, TN</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">Forklift Operator</Badge>
                    <Badge variant="outline">07:00 AM - 03:30 PM</Badge>
                  </div>
                </div>
                <Button variant="outline">View Map</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Support Chat */}
        <Card className="h-[600px] flex flex-col bg-card/50 border-border/50 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none mix-blend-overlay"></div>
          <CardHeader className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-10">
            <CardTitle className="font-heading flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              DarkWave Ops AI
            </CardTitle>
            <CardDescription>24/7 Support & Reporting</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0 flex flex-col">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <ChatMessage 
                  role="ai" 
                  content="Hello, Jason. I see you're scheduled for TechCorp tomorrow. Do you need to report an issue or request equipment?" 
                  time="10:00 AM"
                />
                 <ChatMessage 
                  role="user" 
                  content="Yeah, I'm gonna need new safety glasses." 
                  time="10:02 AM"
                />
                <ChatMessage 
                  role="ai" 
                  content="I've logged a request for Safety Glasses (Standard). Do you need these delivered to the site tomorrow morning?" 
                  time="10:02 AM"
                />
                <ChatMessage 
                  role="user" 
                  content="Yes please." 
                  time="10:03 AM"
                />
                <ChatMessage 
                  role="ai" 
                  content="Confirmed. A runner has been notified. Anything else?" 
                  time="10:03 AM"
                />
              </div>
            </ScrollArea>
            <div className="p-4 border-t border-border/50 bg-card/80 backdrop-blur-md">
              <div className="relative">
                <Input placeholder="Type a message..." className="pr-10" />
                <Button size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-primary hover:bg-primary/10">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}

function ActionCard({ icon: Icon, title, desc, color }: any) {
  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:bg-card/80 hover:border-primary/30 transition-all cursor-pointer group">
      <CardContent className="p-6 flex items-start gap-4">
        <div className={`p-3 rounded-lg bg-background/50 ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold font-heading group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ChatMessage({ role, content, time }: any) {
  const isAi = role === 'ai';
  return (
    <div className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}>
      <div className={`max-w-[85%] rounded-2xl p-3 ${
        isAi 
          ? 'bg-secondary text-secondary-foreground rounded-tl-none' 
          : 'bg-primary/10 text-primary rounded-tr-none border border-primary/20'
      }`}>
        <p className="text-sm">{content}</p>
      </div>
      <span className="text-[10px] text-muted-foreground mt-1 px-1">{time}</span>
    </div>
  );
}