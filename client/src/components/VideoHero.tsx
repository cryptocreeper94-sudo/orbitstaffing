import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { ExternalLink, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

import orbitVideo from "@assets/generated_videos/orbit_staffing_hero.mp4";
import brewBoardVideo from "@assets/generated_videos/brew_board_hero.mp4";
import garageBotVideo from "@assets/generated_videos/garagebot_hero.mp4";
import paintProsVideo from "@assets/generated_videos/paintpros_hero.mp4";
import trustHomeVideo from "@assets/generated_videos/trusthome_hero.mp4";
import trustVaultVideo from "@assets/generated_videos/trustvault_hero.mp4";
import theVoidVideo from "@assets/generated_videos/the_void_hero.mp4";
import verdaraVideo from "@assets/generated_videos/verdara_hero.mp4";
import tlDriverVideo from "@assets/generated_videos/tl_driver_connect_hero.mp4";
import happyEatsVideo from "@assets/generated_videos/happyeats_hero.mp4";

interface VideoHeroProps {
  onDemoClick: () => void;
}

interface AppSlide {
  title: string;
  subtitle: string;
  accent: "cyan" | "emerald" | "amber" | "orange" | "rose" | "blue" | "purple" | "teal" | "lime" | "pink";
  link: string;
  external: boolean;
  video: string;
  gradient: string;
  split: string;
  fee: string;
}

const slides: AppSlide[] = [
  {
    title: "ORBIT Staffing OS",
    subtitle: "100% automated flexible labor marketplace — GPS check-ins, smart matching, payroll, CRM, and blockchain-verified compliance",
    accent: "cyan",
    link: "/products",
    external: false,
    video: orbitVideo,
    gradient: "from-cyan-900/80 via-slate-900/60 to-slate-950/90",
    split: "50/50 Jason & Sidonie",
    fee: "Bundles $99-249/mo",
  },
  {
    title: "TrustHome",
    subtitle: "Real estate agent platform — AI-powered video walkthroughs, full business suite, listing management, client CRM, and smart tools built for agents",
    accent: "emerald",
    link: "https://trusthome.io",
    external: true,
    video: trustHomeVideo,
    gradient: "from-emerald-900/80 via-slate-900/60 to-slate-950/90",
    split: "51% Jennifer / 49% Jason",
    fee: "Real estate tech platform",
  },
  {
    title: "Trust Vault",
    subtitle: "Enterprise-grade digital asset protection — biometric security, encrypted storage, and blockchain-verified custody",
    accent: "blue",
    link: "https://trustvault.io",
    external: true,
    video: trustVaultVideo,
    gradient: "from-blue-900/80 via-slate-900/60 to-slate-950/90",
    split: "100% Jason",
    fee: "Enterprise security platform",
  },
  {
    title: "THE VOID",
    subtitle: "Voice-first mental wellness platform — AI-powered venting with 5 personality modes, guided breathing, mood analytics, rage room, journaling, and 20+ wellness tools",
    accent: "purple",
    link: "https://enterthevoid.io",
    external: true,
    video: theVoidVideo,
    gradient: "from-purple-900/80 via-slate-900/60 to-slate-950/90",
    split: "100% Jason",
    fee: "Founders $9.99/mo, Standard $14.99/mo",
  },
  {
    title: "Verdara",
    subtitle: "Outdoor lifestyle super-app — trail discovery, gear tracking, adventure planning, and community for outdoor enthusiasts",
    accent: "lime",
    link: "https://verdara.replit.app",
    external: true,
    video: verdaraVideo,
    gradient: "from-lime-900/80 via-slate-900/60 to-slate-950/90",
    split: "100% Jason",
    fee: "Outdoor lifestyle platform",
  },
  {
    title: "TL Driver Connect",
    subtitle: "All-in-one driver app — GPS navigation, receipt scanning, food truck locator, gas services, vendor signup, Signal chat, games, and tools for commercial and everyday drivers",
    accent: "teal",
    link: "https://tldriverconnect.com",
    external: true,
    video: tlDriverVideo,
    gradient: "from-teal-900/80 via-slate-900/60 to-slate-950/90",
    split: "100% Jason",
    fee: "Fleet management platform",
  },
  {
    title: "HappyEats",
    subtitle: "Nashville food delivery platform — zone-based batch ordering, vendor self-service portal, food truck locator, rewards & referrals, AI content tools, and 11 delivery zones across Middle TN",
    accent: "pink",
    link: "https://happyeats.app",
    external: true,
    video: happyEatsVideo,
    gradient: "from-pink-900/80 via-slate-900/60 to-slate-950/90",
    split: "60% Kathy / 40% Jason",
    fee: "Food delivery platform",
  },
  {
    title: "Brew & Board Coffee",
    subtitle: "B2B coffee delivery for Nashville — 20+ vendors, calendar scheduling, and blockchain-verified receipts",
    accent: "amber",
    link: "https://brewandboard.coffee",
    external: true,
    video: brewBoardVideo,
    gradient: "from-amber-900/80 via-slate-900/60 to-slate-950/90",
    split: "50/50 Jason & Sidonie",
    fee: "Franchise $299-999/mo + 4-6% royalty",
  },
  {
    title: "GarageBot",
    subtitle: "Smart garage and workshop management — IoT integration, tool inventory, work orders, and automated maintenance tracking",
    accent: "amber",
    link: "https://garagebot.io",
    external: true,
    video: garageBotVideo,
    gradient: "from-amber-900/80 via-slate-900/60 to-slate-950/90",
    split: "100% Jason",
    fee: "SaaS - GarageBot Pro $2.99/mo",
  },
  {
    title: "PaintPros.io",
    subtitle: "Professional painting contractor management — job scheduling, crew management, and automated invoicing powered by ORBIT",
    accent: "rose",
    link: "https://paintpros.io",
    external: true,
    video: paintProsVideo,
    gradient: "from-rose-900/80 via-slate-900/60 to-slate-950/90",
    split: "50/50 Jason & Sidonie",
    fee: "Project-based - 50/50 net profit",
  },
];

const accentClasses: Record<string, { text: string; border: string; bg: string; dot: string; glow: string; buttonBg: string; badge: string }> = {
  cyan: {
    text: "text-cyan-400",
    border: "border-cyan-500/40",
    bg: "bg-cyan-500/20",
    dot: "bg-cyan-400",
    glow: "shadow-cyan-500/20",
    buttonBg: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  },
  emerald: {
    text: "text-emerald-400",
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/20",
    dot: "bg-emerald-400",
    glow: "shadow-emerald-500/20",
    buttonBg: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  amber: {
    text: "text-amber-400",
    border: "border-amber-500/40",
    bg: "bg-amber-500/20",
    dot: "bg-amber-400",
    glow: "shadow-amber-500/20",
    buttonBg: "bg-amber-500/20 border-amber-500/40 text-amber-300",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  orange: {
    text: "text-orange-400",
    border: "border-orange-500/40",
    bg: "bg-orange-500/20",
    dot: "bg-orange-400",
    glow: "shadow-orange-500/20",
    buttonBg: "bg-orange-500/20 border-orange-500/40 text-orange-300",
    badge: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  },
  rose: {
    text: "text-rose-400",
    border: "border-rose-500/40",
    bg: "bg-rose-500/20",
    dot: "bg-rose-400",
    glow: "shadow-rose-500/20",
    buttonBg: "bg-rose-500/20 border-rose-500/40 text-rose-300",
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  },
  blue: {
    text: "text-blue-400",
    border: "border-blue-500/40",
    bg: "bg-blue-500/20",
    dot: "bg-blue-400",
    glow: "shadow-blue-500/20",
    buttonBg: "bg-blue-500/20 border-blue-500/40 text-blue-300",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  purple: {
    text: "text-purple-400",
    border: "border-purple-500/40",
    bg: "bg-purple-500/20",
    dot: "bg-purple-400",
    glow: "shadow-purple-500/20",
    buttonBg: "bg-purple-500/20 border-purple-500/40 text-purple-300",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
  teal: {
    text: "text-teal-400",
    border: "border-teal-500/40",
    bg: "bg-teal-500/20",
    dot: "bg-teal-400",
    glow: "shadow-teal-500/20",
    buttonBg: "bg-teal-500/20 border-teal-500/40 text-teal-300",
    badge: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  },
  lime: {
    text: "text-lime-400",
    border: "border-lime-500/40",
    bg: "bg-lime-500/20",
    dot: "bg-lime-400",
    glow: "shadow-lime-500/20",
    buttonBg: "bg-lime-500/20 border-lime-500/40 text-lime-300",
    badge: "bg-lime-500/20 text-lime-300 border-lime-500/30",
  },
  pink: {
    text: "text-pink-400",
    border: "border-pink-500/40",
    bg: "bg-pink-500/20",
    dot: "bg-pink-400",
    glow: "shadow-pink-500/20",
    buttonBg: "bg-pink-500/20 border-pink-500/40 text-pink-300",
    badge: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  },
};

const stats = [
  { label: "Cost Savings", value: 35, suffix: "%" },
  { label: "Onboarding", value: 2, suffix: "hr" },
  { label: "Connected Apps", value: 10, suffix: "" },
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

function SlideVideo({ slide, isActive, onReady }: { slide: AppSlide; isActive: boolean; onReady: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setLoaded(true);
      onReady();
    };
    video.addEventListener("canplay", handleCanPlay);

    if (isActive) {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
    }

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, [isActive]);

  return (
    <>
      <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} transition-opacity duration-500 ${loaded ? 'opacity-0' : 'opacity-100'}`} />
      <video
        ref={videoRef}
        src={slide.video}
        muted
        loop
        playsInline
        preload={isActive ? "auto" : "metadata"}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
      <div className="absolute inset-0 bg-slate-950/15" />
    </>
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

  const nextIndex = (activeIndex + 1) % slides.length;
  const visibleIndices = new Set([activeIndex, prevIndex, nextIndex]);

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
        const shouldMount = visibleIndices.has(i);

        return (
          <div
            key={i}
            className="absolute inset-0 transition-opacity"
            style={{
              opacity: isActive ? 1 : isPrev ? 1 : 0,
              transitionDuration: "1200ms",
              transitionTimingFunction: "ease-in-out",
              zIndex: isActive ? 2 : isPrev ? 1 : 0,
              transform: `translateY(${scrollY * 0.3}px) scale(${1 + scrollY * 0.0003})`,
              visibility: shouldMount ? "visible" : "hidden",
            }}
          >
            {shouldMount ? (
              <SlideVideo slide={slide} isActive={isActive} onReady={() => {}} />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`} />
            )}
          </div>
        );
      })}

      <div
        className="absolute inset-0 z-10"
        style={{
          background: "linear-gradient(to bottom, rgba(2,6,23,0.15) 0%, rgba(2,6,23,0.05) 30%, rgba(2,6,23,0.25) 60%, rgba(2,6,23,0.85) 100%)",
        }}
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/30 via-transparent to-slate-950/30" />
      <div className="absolute bottom-0 left-0 right-0 z-10 h-20 bg-gradient-to-t from-[#070b16] to-transparent" />

      <div className="relative z-20 h-full flex flex-col justify-end pb-20 sm:pb-24 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${accent.dot} animate-pulse`} />
            <span className={`text-xs font-semibold uppercase tracking-widest ${accent.text}`}>
              DarkWave Studios Ecosystem
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

      <div className="absolute bottom-28 sm:bottom-32 left-1/2 -translate-x-1/2 z-30 flex items-center gap-[6px]">
        {slides.map((slide, i) => (
          <span
            key={i}
            role="button"
            onClick={() => goToSlide(i)}
            className={`block rounded-full cursor-pointer transition-all duration-300 ${
              i === activeIndex
                ? accentClasses[slide.accent].dot
                : 'bg-white/30'
            }`}
            style={{
              width: i === activeIndex ? 14 : 4,
              height: 4,
              minWidth: 0,
              minHeight: 0,
              padding: 0,
              margin: 0,
              lineHeight: 0,
              fontSize: 0,
            }}
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
            Ecosystem Stats
          </h3>
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} inView={statsInView} />
              <p className="text-[10px] text-white/40 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
