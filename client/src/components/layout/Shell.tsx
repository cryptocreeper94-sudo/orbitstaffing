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
  MessageCircle
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { HallmarkPageWatermark } from "@/components/HallmarkWatermark";
import { ContactForm } from "@/components/ContactForm";

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

  return (
    <div className="flex h-screen bg-background overflow-hidden text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative">
        {/* Saturn Watermark Background */}
        <HallmarkPageWatermark />
        
        {/* Noise overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
        
        {/* Content */}
        <div className="p-8 relative z-10 max-w-7xl mx-auto">
          {children}
        </div>

        {/* Contact Developer Button - Fixed Bottom Right */}
        <Button
          onClick={() => setContactOpen(true)}
          className="fixed bottom-8 right-8 z-40 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all bg-primary text-primary-foreground hover:bg-primary/90"
          data-testid="button-contact-developer"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>

        {/* Contact Form Modal */}
        <ContactForm open={contactOpen} onOpenChange={setContactOpen} />
      </main>
    </div>
  );
}