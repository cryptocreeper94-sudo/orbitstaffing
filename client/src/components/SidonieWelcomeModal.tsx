import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle2, Lock, Zap, Users, Shield, Sparkles, Rocket, Bot, MapPin, 
  DollarSign, Calendar, FileCheck, Globe, Smartphone, Briefcase, Building2, 
  Cloud, Wrench, BarChart3, Package, Gift, Target, Clock, CreditCard, 
  TrendingUp, Star, ChevronRight, ExternalLink
} from "lucide-react";
import { Link } from "wouter";

interface SidonieWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidonieWelcomeModal({ isOpen, onClose }: SidonieWelcomeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-slate-950 border border-cyan-500/30 p-0">
        <DialogHeader className="p-6 pb-4 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-900/30 to-blue-900/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                Welcome Back, Sidonie!
              </DialogTitle>
              <DialogDescription className="text-cyan-300">
                ORBIT Staffing OS - November 2025 Update
              </DialogDescription>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Rocket className="w-3 h-3 mr-1" />
              100% Automated
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              <BarChart3 className="w-3 h-3 mr-1" />
              CRM Added
            </Badge>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              <Package className="w-3 h-3 mr-1" />
              Standalone Tools
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-6">
            
            <Card className="bg-gradient-to-br from-green-950/60 to-emerald-950/60 border border-green-500/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-green-300 flex items-center gap-2 text-lg">
                  <Rocket className="w-5 h-5" />
                  NEW: Standalone Tool Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-green-100 text-sm">
                  Each tool now available separately - mix and match as needed!
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <BarChart3 className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-cyan-300">$19</p>
                    <p className="text-xs text-slate-400">ORBIT CRM</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <Users className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-purple-300">$29</p>
                    <p className="text-xs text-slate-400">Talent Exchange</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <DollarSign className="w-5 h-5 text-green-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-green-300">$39</p>
                    <p className="text-xs text-slate-400">Payroll</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <MapPin className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-amber-300">$15</p>
                    <p className="text-xs text-slate-400">Time & GPS</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <Shield className="w-5 h-5 text-red-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-red-300">$25</p>
                    <p className="text-xs text-slate-400">Compliance</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center border border-cyan-500/30">
                    <Package className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-cyan-300">$99-249</p>
                    <p className="text-xs text-slate-400">Full Bundle</p>
                  </div>
                </div>
                <p className="text-xs text-green-400 text-center">
                  60-95% less than competitors (Bullhorn, HubSpot, Indeed, ADP)
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-950/60 to-blue-950/60 border border-cyan-500/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-cyan-300 flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5" />
                  NEW: ORBIT CRM System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-cyan-100 text-sm mb-3">
                  HubSpot-competitive CRM built for staffing agencies!
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Deal pipeline (drag & drop)
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Activity timeline
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Meeting scheduler
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Email tracking
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Duplicate detection
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Workflow automation
                  </div>
                </div>
                <Link href="/crm">
                  <Button size="sm" className="mt-3 bg-cyan-600 hover:bg-cyan-700 text-xs">
                    Open CRM Dashboard
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-950/60 to-violet-950/60 border border-purple-500/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-purple-300 flex items-center gap-2 text-lg">
                  <Gift className="w-5 h-5" />
                  NEW: Affiliate/MLM Program
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-900/50 rounded-lg p-2">
                    <p className="text-xl font-bold text-green-400">20%</p>
                    <p className="text-xs text-slate-400">Referral</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-2">
                    <p className="text-xl font-bold text-cyan-400">30%</p>
                    <p className="text-xs text-slate-400">Agency</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-2">
                    <p className="text-xl font-bold text-purple-400">40%+</p>
                    <p className="text-xs text-slate-400">Franchise</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2 text-center">
                  Recurring commissions on all referrals!
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-purple-400" />
                    Self-Service Portals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Users className="w-3 h-3 text-cyan-400" />
                    Employee Hub - Full data access
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Building2 className="w-3 h-3 text-purple-400" />
                    Owner Hub - Admin dashboard
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2 text-sm">
                    <Bot className="w-4 h-4 text-cyan-400" />
                    100% Automation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    AI worker matching
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Auto payroll processing
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    GPS timesheet creation
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-br from-amber-950/40 to-orange-950/40 border border-amber-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-300 flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5" />
                  Platform Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-bold text-white">11</p>
                    <p className="text-xs text-slate-400">CRM Tables</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">5</p>
                    <p className="text-xs text-slate-400">Standalone Tools</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">75%</p>
                    <p className="text-xs text-slate-400">HubSpot Parity</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-400">Live</p>
                    <p className="text-xs text-slate-400">orbitstaffing.io</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Quick Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Link href="/crm">
                    <Button variant="outline" size="sm" className="w-full text-xs border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
                      <BarChart3 className="w-3 h-3 mr-1" />
                      CRM
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button variant="outline" size="sm" className="w-full text-xs border-green-500/30 text-green-400 hover:bg-green-500/10">
                      <CreditCard className="w-3 h-3 mr-1" />
                      Pricing
                    </Button>
                  </Link>
                  <Link href="/jobs">
                    <Button variant="outline" size="sm" className="w-full text-xs border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
                      <Briefcase className="w-3 h-3 mr-1" />
                      Jobs
                    </Button>
                  </Link>
                  <Link href="/talent-pool">
                    <Button variant="outline" size="sm" className="w-full text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
                      <Users className="w-3 h-3 mr-1" />
                      Talent
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

          </div>
        </ScrollArea>

        <div className="p-4 border-t border-cyan-500/20 bg-slate-900/50 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Powered by ORBIT - orbitstaffing.io
          </p>
          <Button onClick={onClose} className="bg-gradient-to-r from-cyan-500 to-blue-600">
            Let's Go!
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
