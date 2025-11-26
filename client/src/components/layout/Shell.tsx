import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Briefcase, 
  CreditCard, 
  Megaphone, 
  Menu,
  ScanLine,
  HardHat,
  Activity,
  MessageCircle,
  Zap,
  Camera
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { HallmarkPageWatermark } from "@/components/HallmarkWatermark";
import { ContactForm } from "@/components/ContactForm";
import { OCRScannerModal } from "@/components/layout/OCRScannerModal";
import { CameraModal } from "@/components/layout/CameraModal";
import { FloatingHelpButton } from "@/components/HelpCenter";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: ScanLine, label: "Sales Force", href: "/sales" },
  { icon: Activity, label: "Operations", href: "/operations" },
  { icon: HardHat, label: "Worker Portal", href: "/worker" },
  { icon: Users, label: "Candidates", href: "/candidates" },
  { icon: Building2, label: "Clients", href: "/clients" },
  { icon: Briefcase, label: "Placements", href: "/placements" },
  { icon: CreditCard, label: "Finance", href: "/finance" },
  { icon: Megaphone, label: "Recruiting", href: "/marketing" },
];

export function Sidebar() {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border/50">
        {!collapsed && (
          <div className="flex flex-col">
            <div className="font-heading font-bold text-xl text-sidebar-primary tracking-wider">
              ORBIT
            </div>
            <div className="text-[10px] text-sidebar-foreground/50 tracking-widest">
              STAFFING OS
            </div>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 py-6 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center px-3 py-2.5 rounded-md cursor-pointer transition-colors group",
                isActive 
                  ? "bg-sidebar-primary/10 text-sidebar-primary" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}>
                <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-sidebar-primary" : "group-hover:text-sidebar-foreground")} />
                {!collapsed && (
                  <span className="ml-3 font-medium text-sm">{item.label}</span>
                )}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border/50">
        {!collapsed && (
          <div className="px-2">
            <div className="text-[10px] text-sidebar-foreground/40 uppercase tracking-widest mb-1">Powered By</div>
            <div className="text-xs font-bold text-sidebar-foreground/60">DARKWAVE STUDIOS</div>
          </div>
        )}
      </div>
    </aside>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const [contactOpen, setContactOpen] = useState(false);
  const [ocrScannerOpen, setOcrScannerOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative">
        {/* App Store Coming Soon Banner + OCR Scanner Button */}
        <div className="sticky top-0 z-50 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b-2 border-cyan-500/50 backdrop-blur-sm">
          <div className="px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="text-xl">📱</div>
              <div className="flex-1">
                <div className="text-sm font-bold text-cyan-300">Coming Soon</div>
                <div className="text-xs text-cyan-200/80">Google Play Store & Apple App Store Native Apps</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setOcrScannerOpen(true)}
                size="sm"
                className="gap-2 bg-cyan-600 hover:bg-cyan-700 text-white"
                data-testid="button-open-ocr-scanner"
              >
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Scan</span>
              </Button>
              <Button
                onClick={() => setCameraOpen(true)}
                size="sm"
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="button-open-camera"
              >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Camera</span>
              </Button>
              <div className="text-xs text-cyan-300/70 hidden md:block">Get native mobile experience</div>
            </div>
          </div>
        </div>

        {/* Saturn Watermark Background */}
        <HallmarkPageWatermark />
        
        {/* Noise overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
        
        {/* Content */}
        <div className="p-8 relative z-10 max-w-7xl mx-auto">
          {children}
        </div>

        {/* OCR Scanner Modal */}
        <OCRScannerModal 
          isOpen={ocrScannerOpen}
          onClose={() => setOcrScannerOpen(false)}
        />

        {/* Camera Modal */}
        <CameraModal
          isOpen={cameraOpen}
          onClose={() => setCameraOpen(false)}
        />

        {/* Floating Help Button */}
        <FloatingHelpButton />

        {/* Contact Developer Button - REMOVED - will be added back in proper location */}
        {/* Contact Form Modal - REMOVED */}
      </main>
    </div>
  );
}