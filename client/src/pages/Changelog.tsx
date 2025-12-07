import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Zap, Bug, Sparkles, Shield } from "lucide-react";
import { PageHeader } from "@/components/ui/section-header";
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardContent } from "@/components/ui/orbit-card";
import { BentoGrid } from "@/components/ui/bento-grid";

const changelogEntries = [
  {
    version: "v2.7.0",
    date: "December 6, 2025",
    type: "major",
    changes: [
      { type: "new", text: "Meeting Presentation Builder - Create professional slideshows for client meetings" },
      { type: "new", text: "Three staffing-specific templates: Client Proposal, Compliance Report, Worker Brief" },
      { type: "new", text: "Shareable presentation links with view tracking" },
      { type: "new", text: "Email presentations directly to attendees via Resend integration" },
      { type: "new", text: "Fullscreen slideshow viewer with keyboard navigation" },
      { type: "new", text: "CRM integration with quick-access Presentations button" },
      { type: "security", text: "New Solana blockchain stamp for v2.7.0" },
    ]
  },
  {
    version: "v2.6.5",
    date: "December 6, 2025",
    type: "patch",
    changes: [
      { type: "fix", text: "Version number moved to footer with proper baseline alignment" },
      { type: "fix", text: "Header cleaned up - just ORBIT title and hamburger menu" },
      { type: "fix", text: "Footer simplified to minimal strip: DarkWave Studios, LLC | © 2025 | version" },
      { type: "security", text: "New Solana blockchain stamp generated" },
    ]
  },
  {
    version: "v2.6.4",
    date: "December 6, 2025",
    type: "patch",
    changes: [
      { type: "fix", text: "Wave assistant button now correctly positioned in bottom-right corner" },
      { type: "fix", text: "Removed conflicting home button from DarkWave Studios page" },
      { type: "fix", text: "Benefit cards carousel no longer overlaps on mobile" },
      { type: "fix", text: "Pricing cards now have consistent height on mobile" },
      { type: "new", text: "Added hamburger menu to landing page header" },
      { type: "new", text: "Added About Us page" },
      { type: "new", text: "Added Solana Verification page showing all blockchain stamps" },
      { type: "new", text: "Version number in header links to changelog" },
    ]
  },
  {
    version: "v2.6.3",
    date: "December 6, 2025",
    type: "patch",
    changes: [
      { type: "fix", text: "Fixed all product card emblems and hallmarks by importing images properly" },
      { type: "fix", text: "Standardized card width to ensure navigation arrows remain on-screen" },
      { type: "fix", text: "Wave AI button made larger with enhanced glow effects" },
      { type: "security", text: "New Solana blockchain stamps generated" },
    ]
  },
  {
    version: "v2.6.2",
    date: "December 5, 2025",
    type: "minor",
    changes: [
      { type: "new", text: "DarkWave Studios landing page complete with full-screen product cards" },
      { type: "new", text: "Horizontal carousel navigation with left/right arrows" },
      { type: "new", text: "Wave AI floating assistant button" },
      { type: "fix", text: "Mobile viewport height issues resolved" },
    ]
  },
  {
    version: "v2.6.1",
    date: "December 5, 2025",
    type: "minor",
    changes: [
      { type: "new", text: "PWA support with full-color Orby mascot as home screen icon" },
      { type: "new", text: "Splash screen with Orby presenting pose" },
      { type: "new", text: "Automatic install prompt with 7-day cooldown" },
      { type: "new", text: "Service worker for offline caching" },
      { type: "security", text: "Solana blockchain stamps for ORBIT v2.6.1" },
    ]
  },
  {
    version: "v2.6.0",
    date: "December 4, 2025",
    type: "major",
    changes: [
      { type: "new", text: "Franchise system with two-tier ownership model" },
      { type: "new", text: "Territory checking and exclusivity validation" },
      { type: "new", text: "Email notifications for franchise applications" },
      { type: "new", text: "Stripe integration for franchise payments" },
      { type: "security", text: "Enhanced multi-tenant data isolation" },
    ]
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "new": return <Sparkles className="w-3 h-3 text-green-400" />;
    case "fix": return <Bug className="w-3 h-3 text-amber-400" />;
    case "security": return <Shield className="w-3 h-3 text-purple-400" />;
    default: return <Zap className="w-3 h-3 text-cyan-400" />;
  }
};

const getTypeBadge = (type: string) => {
  switch (type) {
    case "major": return <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">Major</Badge>;
    case "minor": return <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">Minor</Badge>;
    case "patch": return <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30 text-xs">Patch</Badge>;
    default: return null;
  }
};

export default function Changelog() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="border-b border-slate-800/50 backdrop-blur-sm sticky top-0 z-50 bg-slate-950/80">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-lg font-bold">What's New</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <PageHeader
          title="Changelog"
          subtitle="Track all updates and improvements to ORBIT Staffing OS"
        />

        <BentoGrid cols={1} gap="md">
          {changelogEntries.map((entry, i) => (
            <OrbitCard key={i} variant="default">
              <OrbitCardHeader
                action={
                  i === 0 ? (
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                      Latest
                    </Badge>
                  ) : undefined
                }
              >
                <div className="flex items-center gap-3">
                  <OrbitCardTitle>
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-mono">
                      {entry.version}
                    </Badge>
                  </OrbitCardTitle>
                  {getTypeBadge(entry.type)}
                  <span className="text-xs text-slate-500">{entry.date}</span>
                </div>
              </OrbitCardHeader>

              <OrbitCardContent>
                <ul className="space-y-2">
                  {entry.changes.map((change, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      {getTypeIcon(change.type)}
                      <span className="text-slate-300">{change.text}</span>
                    </li>
                  ))}
                </ul>
              </OrbitCardContent>
            </OrbitCard>
          ))}
        </BentoGrid>

        <section className="text-center py-8 border-t border-slate-800/50">
          <p className="text-xs text-slate-500">
            All versions are blockchain-verified on Solana.{" "}
            <Link href="/solana-verification" className="text-cyan-400 hover:text-cyan-300">
              View verification stamps
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
