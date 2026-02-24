import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { ExternalLink, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoHeroProps {
  onDemoClick: () => void;
}

interface AppSlide {
  title: string;
  subtitle: string;
  accent: "cyan" | "emerald" | "blue" | "purple" | "amber" | "orange";
  link: string;
  external: boolean;
  gradient: string;
  animatedGradient: string;
}

const slides: AppSlide[] = [
  {
    title: "ORBIT Staffing OS",
    subtitle: "GPS-verified workforce management with blockchain compliance",
    accent: "cyan",
    link: "/products",
    external: false,
    gradient: "from-cyan-900/80 via-slate-900/90 to-slate-950",
    animatedGradient: "from-cyan-600/30 via-blue-700/20 to-slate-950/90",
  },
  {
    title: "TrustHome",
    subtitle: "Smart home security and automation platform",
    accent: "emerald",
    link: "https://trusthome.io",
    external: true,
    gradient: "from-emerald-900/80 via-slate-900/90 to-slate-950",
    animatedGradient: "from-emerald-600/30 via-teal-700/20 to-slate-950/90",
  },
  {
    title: "Trust Vault",
    subtitle: "Enterprise-grade digital asset protection",
    accent: "blue",
    link: "https://trustvault.io",
    external: true,
    gradient: "from-blue-900/80 via-slate-900/90 to-slate-950",
    animatedGradient: "from-blue-600/30 via-indigo-700/20 to-slate-950/90",
  },
  {
    title: "THE VOID",
    subtitle: "Next-generation immersive entertainment",
    accent: "purple",
    link: "https://enterthevoid.io",
    external: true,
    gradient: "from-purple-900/80 via-slate-900/90 to-slate-950",
    animatedGradient: "from-purple-600/30 via-violet-700/20 to-slate-950/90",
  },
  {
    title: "GarageBot",
    subtitle: "AI-powered automotive diagnostics and fleet management",
    accent: "amber",
    link: "https://garagebot.io",
    external: true,
    gradient: "from-amber-900/80 via-slate-900/90 to-slate-950",
    animatedGradient: "from-amber-600/30 via-yellow-700/20 to-slate-950/90",
  },
  {
    title: "Brew & Board",
    subtitle: "Craft brewery and cafe operations suite",
    accent: "orange",
    link: "https://brewandboard.coffee",
    external: true,
    gradient: "from-orange-900/80 via-slate-900/90 to-slate-950",
    animatedGradient: "from-orange-600/30 via-red-700/20 to-slate-950/90",
  },
];

const accentClasses = {
  cyan: {
    text: "text-cyan-400",
    border: "border-cyan-500/40",
    bg: "bg-cyan-500/20",
    dot: "bg-cyan-400",
    glow: "shadow-cyan-500/20",
    buttonBg: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300",
  },
  emerald: {
    text: "text-emerald-400",
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/20",
    dot: "bg-emerald-400",
    glow: "shadow-emerald-500/20",
    buttonBg: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
  },
  blue: {
    text: "text-blue-400",
    border: "border-blue-500/40",
    bg: "bg-blue-500/20",
    dot: "bg-blue-400",
    glow: "shadow-blue-500/20",
    buttonBg: "bg-blue-500/20 border-blue-500/40 text-blue-300",
  },
  purple: {
    text: "text-purple-400",
    border: "border-purple-500/40",
    bg: "bg-purple-500/20",
    dot: "bg-purple-400",
    glow: "shadow-purple-500/20",
    buttonBg: "bg-purple-500/20 border-purple-500/40 text-purple-300",
  },
  amber: {
    text: "text-amber-400",
    border: "border-amber-500/40",
    bg: "bg-amber-500/20",
    dot: "bg-amber-400",
    glow: "shadow-amber-500/20",
    buttonBg: "bg-amber-500/20 border-amber-500/40 text-amber-300",
  },
  orange: {
    text: "text-orange-400",
    border: "border-orange-500/40",
    bg: "bg-orange-500/20",
    dot: "bg-orange-400",
    glow: "shadow-orange-500/20",
    buttonBg: "bg-orange-500/20 border-orange-500/40 text-orange-300",
  },
};

const stats = [
  { label: "Cost Savings", value: 35, suffix: "%" },
  { label: "Onboarding", value: 2, suffix: "hr" },
  { label: "Connected Apps", value: 6, suffix: "+" },
  { label: "Support", value: 24, suffix: "/7" },
];

function AnimatedCounter({ value, suffix, inView }: { value: number; suffix: string; inView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    setCount(0);
    const duration = 1500;
    const steps = 40;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * value));
      if (step >= steps) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, inView]);

  return (
    <span className="text-2xl font-bold text-white tabular-nums">
      {count}{suffix}
    </span>
  );
}

export function VideoHero({ onDemoClick }: VideoHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [statsInView, setStatsInView] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  const goToSlide = useCallback((index: number) => {
    if (index === activeIndex || transitioning) return;
    setTransitioning(true);
    setPrevIndex(activeIndex);
    setActiveIndex(index);
    setTimeout(() => setTransitioning(false), 1200);
  }, [activeIndex, transitioning]);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = (activeIndex + 1) % slides.length;
      goToSlide(next);
    }, 8000);
    return () => clearInterval(interval);
  }, [activeIndex, goToSlide]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!statsRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsInView(true); },
      { threshold: 0.5 }
    );
    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const currentSlide = slides[activeIndex];
  const accent = accentClasses[currentSlide.accent];

  const handleVisitClick = () => {
    if (currentSlide.external) {
      window.open(currentSlide.link, "_blank", "noopener,noreferrer");
    } else {
      setLocation(currentSlide.link);
    }
  };

  return (
    <section
      className="relative h-[60vh] sm:h-[75vh] lg:h-[85vh] overflow-hidden"
      data-testid="section-video-hero"
    >
      {slides.map((slide, i) => {
        const isActive = i === activeIndex;
        const isPrev = i === prevIndex && transitioning;
        return (
          <div
            key={i}
            className="absolute inset-0 transition-opacity"
            style={{
              opacity: isActive ? 1 : isPrev ? 0 : 0,
              transitionDuration: "1200ms",
              transitionTimingFunction: "ease-in-out",
              zIndex: isActive ? 2 : isPrev ? 1 : 0,
              transform: `translateY(${scrollY * 0.3}px) scale(${1 + scrollY * 0.0003})`,
            }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`} />
            <div
              className={`absolute inset-0 bg-gradient-to-tr ${slide.animatedGradient}`}
              style={{
                animation: isActive ? "pulse 4s ease-in-out infinite" : "none",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.03) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(255,255,255,0.02) 0%, transparent 40%)`,
              }}
            />
          </div>
        );
      })}

      <div
        className="absolute inset-0 z-10"
        style={{
          background: "linear-gradient(to bottom, rgba(2,6,23,0.4) 0%, rgba(2,6,23,0.2) 30%, rgba(2,6,23,0.5) 70%, rgba(2,6,23,0.95) 100%)",
        }}
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/60 via-transparent to-slate-950/60" />
      <div className="absolute bottom-0 left-0 right-0 z-10 h-24 bg-gradient-to-t from-[#070b16] to-transparent" />

      <div className="relative z-20 h-full flex flex-col justify-end pb-20 sm:pb-24 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${accent.dot} animate-pulse`} />
            <span className={`text-xs font-semibold uppercase tracking-widest ${accent.text}`}>
              DarkWave Studios
            </span>
          </div>

          <h1
            className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white leading-tight max-w-2xl"
            style={{
              transition: "opacity 600ms ease-in-out",
            }}
            data-testid="text-hero-title"
          >
            {currentSlide.title}
          </h1>

          <p
            className="text-base sm:text-lg text-white/60 max-w-xl"
            data-testid="text-hero-subtitle"
          >
            {currentSlide.subtitle}
          </p>

          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <Button
              onClick={onDemoClick}
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white"
              data-testid="button-hero-demo"
            >
              <Play className="w-4 h-4 mr-2" />
              Request Demo
            </Button>

            <Button
              variant="outline"
              onClick={handleVisitClick}
              className={`backdrop-blur-sm border ${accent.buttonBg}`}
              data-testid="button-hero-visit"
            >
              {currentSlide.external ? (
                <>
                  Visit {currentSlide.title.split(" ")[0]}
                  <ExternalLink className="w-3.5 h-3.5 ml-2" />
                </>
              ) : (
                "Explore Platform"
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-28 sm:bottom-32 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {slides.map((slide, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`rounded-full transition-all duration-300 ${
              i === activeIndex
                ? `w-5 h-[5px] ${accentClasses[slide.accent].dot}`
                : `w-[3px] h-[3px] bg-white/30 hover:bg-white/50`
            }`}
            aria-label={`Go to slide ${i + 1}`}
            data-testid={`button-hero-dot-${i}`}
          />
        ))}
      </div>

      <div
        ref={statsRef}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 hidden lg:block"
      >
        <div
          className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-xl p-5 space-y-4"
          data-testid="card-platform-stats"
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">
            Platform Stats
          </h3>
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} inView={statsInView} />
              <p className="text-[10px] text-white/40 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </section>
  );
}
