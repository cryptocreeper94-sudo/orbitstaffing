import { Link, useLocation } from 'wouter';
import { useState } from 'react';
import { Menu, X, Shield, Users, Code, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MainHeaderProps {
  showNav?: boolean;
}

export function MainHeader({ showNav = true }: MainHeaderProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/pricing', label: 'Pricing' },
    { href: '/products', label: 'Products' },
    { href: '/franchise', label: 'Franchise' },
    { href: '/about', label: 'About' },
  ];

  const isActive = (href: string) => location === href;

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/95 backdrop-blur-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer" data-testid="link-logo-home">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">O</span>
                </div>
                <span className="text-white font-bold hidden sm:inline">ORBIT</span>
              </div>
            </Link>

            {showNav && (
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`text-sm ${isActive(link.href) ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
                      data-testid={`nav-link-${link.label.toLowerCase()}`}
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/solana-verification">
              <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10" data-testid="link-solana-verified">
                <Shield className="w-3.5 h-3.5" />
                <span className="text-xs">Verified</span>
              </Button>
            </Link>

            <Link href="/investors">
              <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-1.5 text-slate-400 hover:text-white hover:bg-slate-800" data-testid="link-investors">
                <Users className="w-3.5 h-3.5" />
                <span className="text-xs">Investors</span>
              </Button>
            </Link>

            <Link href="/admin-landing">
              <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-1.5 text-slate-400 hover:text-white hover:bg-slate-800" data-testid="link-admin-login">
                <LogIn className="w-3.5 h-3.5" />
                <span className="text-xs">Admin</span>
              </Button>
            </Link>

            <Link href="/developer">
              <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-1.5 text-slate-400 hover:text-white hover:bg-slate-800" data-testid="link-dev-login">
                <Code className="w-3.5 h-3.5" />
                <span className="text-xs">Dev</span>
              </Button>
            </Link>

            <button
              className="md:hidden p-2 text-slate-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-800">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${isActive(link.href) ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-300'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
              <div className="border-t border-slate-800 my-2" />
              <Link href="/solana-verification">
                <Button variant="ghost" className="w-full justify-start text-emerald-400" onClick={() => setMobileMenuOpen(false)}>
                  <Shield className="w-4 h-4 mr-2" /> Solana Verified
                </Button>
              </Link>
              <Link href="/investors">
                <Button variant="ghost" className="w-full justify-start text-slate-400" onClick={() => setMobileMenuOpen(false)}>
                  <Users className="w-4 h-4 mr-2" /> Investors
                </Button>
              </Link>
              <Link href="/admin-landing">
                <Button variant="ghost" className="w-full justify-start text-slate-400" onClick={() => setMobileMenuOpen(false)}>
                  <LogIn className="w-4 h-4 mr-2" /> Admin Login
                </Button>
              </Link>
              <Link href="/developer">
                <Button variant="ghost" className="w-full justify-start text-slate-400" onClick={() => setMobileMenuOpen(false)}>
                  <Code className="w-4 h-4 mr-2" /> Developer
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
