import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Users, Shield, Zap, Globe, Award, Building2 } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="border-b border-slate-800/50 backdrop-blur-sm sticky top-0 z-50 bg-slate-950/80">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-lg font-bold">About Us</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        <section className="text-center space-y-4">
          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">DarkWave Studios, LLC</Badge>
          <h1 className="text-3xl sm:text-5xl font-bold">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              ORBIT Staffing OS
            </span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            100% automated, white-label staffing platform designed to revolutionize temporary workforce management 
            across skilled trades, hospitality, and general labor sectors.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Building2 className="w-6 h-6 text-cyan-400" />
                </div>
                <h2 className="text-xl font-bold">Our Mission</h2>
              </div>
              <p className="text-slate-400 text-sm">
                To eliminate manual intervention in staffing operations through intelligent automation, 
                GPS-verified check-ins, and comprehensive payroll integration. We're building the future 
                of workforce management where agencies can scale from 10 to 10,000 workers without 
                proportionally increasing overhead.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Shield className="w-6 h-6 text-purple-400" />
                </div>
                <h2 className="text-xl font-bold">Security & Compliance</h2>
              </div>
              <p className="text-slate-400 text-sm">
                Enterprise-grade security with encrypted SSN storage, session-based authentication, 
                comprehensive audit trails, and RBAC. Built-in compliance for state-specific rules 
                (TN/KY), prevailing wage calculations, and I-9 tracking.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Key Features</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Zap, title: "Zero Manual Entry", desc: "Automated matching, scheduling, and payroll processing" },
              { icon: Globe, title: "GPS Verification", desc: "Real-time location tracking for clock-in/out verification" },
              { icon: Users, title: "Talent Exchange", desc: "Two-way marketplace connecting workers and employers" },
              { icon: Shield, title: "Blockchain Stamps", desc: "Solana-verified credentials and audit trails" },
              { icon: Award, title: "White Label Ready", desc: "Full customization for franchise and enterprise clients" },
              { icon: Building2, title: "Multi-Tenant", desc: "Complete data isolation with scalable architecture" },
            ].map((feature, i) => (
              <Card key={i} className="bg-slate-800/30 border-slate-700/30">
                <CardContent className="p-4 flex items-start gap-3">
                  <feature.icon className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <p className="text-xs text-slate-400">{feature.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="text-center space-y-4 py-8 border-t border-slate-800/50">
          <p className="text-slate-500 text-xs">
            DarkWave Studios, LLC &copy; 2025 | Nashville, TN
          </p>
          <p className="text-slate-600 text-xs">
            Version 2.6.4 | Powered by ORBIT Technology
          </p>
        </section>
      </main>
    </div>
  );
}
