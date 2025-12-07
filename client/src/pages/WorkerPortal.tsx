import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useLocation } from 'wouter';
import { 
  MessageSquare, 
  Clock, 
  HardHat, 
  AlertTriangle, 
  CalendarX, 
  Send,
  Camera,
  Calendar,
  Zap,
  Share2,
  DollarSign,
  MapPin,
  TrendingUp,
  Briefcase
} from "lucide-react";

import { BentoGrid, BentoTile } from '@/components/ui/bento-grid';
import { CarouselRail } from '@/components/ui/carousel-rail';
import { PageHeader } from '@/components/ui/section-header';
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardContent, StatCard, ActionCard } from '@/components/ui/orbit-card';

export default function WorkerPortal() {
  const [, setLocation] = useLocation();

  const quickActions = [
    { 
      icon: <Clock className="w-5 h-5" />, 
      title: "Report Late / Absence", 
      description: "Let us know if you can't make it.",
      onClick: () => {}
    },
    { 
      icon: <HardHat className="w-5 h-5" />, 
      title: "Request Equipment", 
      description: "Need PPE, boots, or tools?",
      onClick: () => {}
    },
    { 
      icon: <AlertTriangle className="w-5 h-5" />, 
      title: "Report Safety Issue", 
      description: "Flag hazards immediately.",
      onClick: () => setLocation('/incident-reporting')
    },
    { 
      icon: <CalendarX className="w-5 h-5" />, 
      title: "Time Off Request", 
      description: "Schedule future vacation.",
      onClick: () => {}
    },
  ];

  const earningsLinks = [
    { icon: <Zap className="w-4 h-4" />, label: "Bonuses", path: "/worker-bonuses", color: "text-amber-400" },
    { icon: <Calendar className="w-4 h-4" />, label: "Shifts", path: "/worker-shifts", color: "text-blue-400" },
    { icon: <Calendar className="w-4 h-4" />, label: "Availability", path: "/worker-availability", color: "text-purple-400" },
    { icon: <Share2 className="w-4 h-4" />, label: "Referrals", path: "/worker-referrals", color: "text-emerald-400" },
  ];

  return (
    <Shell>
      <div className="space-y-6 md:space-y-8">
        <PageHeader
          title="Worker Hub"
          subtitle="Manage your shifts, report issues, and request gear."
          actions={
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1.5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse" />
                Active • On Site
              </Badge>
              <Button 
                onClick={() => setLocation('/incident-reporting')} 
                className="bg-red-600 hover:bg-red-700 text-white"
                data-testid="button-worker-incident-report"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Report Incident
              </Button>
              <Button 
                onClick={() => setLocation('/pre-apply')} 
                variant="outline"
                data-testid="button-worker-pre-apply"
              >
                <Camera className="w-4 h-4 mr-2" />
                ID Verification
              </Button>
            </div>
          }
        />

        <BentoGrid cols={4} gap="md">
          <BentoTile>
            <StatCard
              label="This Week"
              value="32.5 hrs"
              icon={<Clock className="w-6 h-6" />}
              trend={{ value: 8, positive: true }}
            />
          </BentoTile>
          <BentoTile>
            <StatCard
              label="Pending Earnings"
              value="$847.50"
              icon={<DollarSign className="w-6 h-6" />}
              trend={{ value: 12, positive: true }}
            />
          </BentoTile>
          <BentoTile>
            <StatCard
              label="Completed Shifts"
              value="14"
              icon={<Briefcase className="w-6 h-6" />}
            />
          </BentoTile>
          <BentoTile>
            <StatCard
              label="Performance"
              value="4.8★"
              icon={<TrendingUp className="w-6 h-6" />}
              trend={{ value: 5, positive: true }}
            />
          </BentoTile>
        </BentoGrid>

        <CarouselRail
          title="Quick Actions"
          subtitle="Common tasks and requests"
          showArrows={true}
          gap="md"
          itemWidth="md"
        >
          {quickActions.map((action, idx) => (
            <ActionCard
              key={idx}
              title={action.title}
              description={action.description}
              icon={action.icon}
              onClick={action.onClick}
              className="min-w-[280px]"
            />
          ))}
        </CarouselRail>

        <BentoGrid cols={3} gap="md">
          <BentoTile span={2}>
            <OrbitCard variant="default" hover={false} className="h-full border-0 bg-transparent p-0">
              <OrbitCardHeader>
                <OrbitCardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  Current Assignment
                </OrbitCardTitle>
              </OrbitCardHeader>
              <OrbitCardContent>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg text-white">TechCorp Warehouse A</h3>
                      <p className="text-slate-400">123 Industrial Pkwy, Nashville, TN</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                          Forklift Operator
                        </Badge>
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          07:00 AM - 03:30 PM
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" className="border-cyan-500/30 hover:bg-cyan-500/10">
                      <MapPin className="w-4 h-4 mr-2" />
                      View Map
                    </Button>
                  </div>
                </div>
              </OrbitCardContent>
            </OrbitCard>
          </BentoTile>

          <BentoTile>
            <OrbitCard variant="glass" hover={false} className="h-full border-0 bg-transparent p-0">
              <OrbitCardHeader>
                <OrbitCardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  Earnings & Opportunities
                </OrbitCardTitle>
              </OrbitCardHeader>
              <OrbitCardContent>
                <div className="grid grid-cols-2 gap-2">
                  {earningsLinks.map((link, idx) => (
                    <Button
                      key={idx}
                      onClick={() => setLocation(link.path)}
                      variant="outline"
                      size="sm"
                      className="justify-start border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-500/10"
                      data-testid={`button-worker-${link.label.toLowerCase()}`}
                    >
                      <span className={link.color}>{link.icon}</span>
                      <span className="ml-2">{link.label}</span>
                    </Button>
                  ))}
                </div>
              </OrbitCardContent>
            </OrbitCard>
          </BentoTile>
        </BentoGrid>

        <BentoTile className="overflow-hidden">
          <div className="h-[500px] flex flex-col relative">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none mix-blend-overlay" />
            
            <div className="border-b border-slate-700/50 p-4 bg-slate-800/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <MessageSquare className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Orbit AI Assistant</h3>
                  <p className="text-xs text-slate-400">24/7 Support & Reporting</p>
                </div>
                <Badge className="ml-auto bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  Online
                </Badge>
              </div>
            </div>

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

            <div className="p-4 border-t border-slate-700/50 bg-slate-800/80 backdrop-blur-md">
              <div className="relative">
                <Input 
                  placeholder="Type a message..." 
                  className="pr-12 bg-slate-900/50 border-slate-600 focus:border-cyan-500" 
                />
                <Button 
                  size="icon" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-cyan-500 hover:bg-cyan-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </BentoTile>
      </div>
    </Shell>
  );
}

function ChatMessage({ role, content, time }: { role: 'ai' | 'user'; content: string; time: string }) {
  const isAi = role === 'ai';
  return (
    <div className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}>
      <div className={`max-w-[85%] rounded-2xl p-3 ${
        isAi 
          ? 'bg-slate-700/50 text-slate-100 rounded-tl-sm' 
          : 'bg-cyan-500/20 text-cyan-50 rounded-tr-sm border border-cyan-500/30'
      }`}>
        <p className="text-sm">{content}</p>
      </div>
      <span className="text-[10px] text-slate-500 mt-1 px-1">{time}</span>
    </div>
  );
}
