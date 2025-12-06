import { useState, useEffect, useCallback } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  ChevronLeft, ChevronRight, Maximize2, Minimize2, 
  Calendar, Clock, Users, FileText, Briefcase, Shield,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Presentation {
  id: string;
  title: string;
  templateType: string;
  meetingDate: string | null;
  meetingTime: string | null;
  notes: string | null;
  attendeeEmails: string[] | null;
  attendeeNames: string[] | null;
  shareableLink: string | null;
}

const TEMPLATE_THEMES: Record<string, { bg: string; accent: string; icon: any }> = {
  client_proposal: {
    bg: "from-blue-950 via-indigo-950 to-slate-950",
    accent: "text-blue-400",
    icon: Briefcase,
  },
  compliance_report: {
    bg: "from-emerald-950 via-teal-950 to-slate-950",
    accent: "text-emerald-400",
    icon: Shield,
  },
  worker_brief: {
    bg: "from-amber-950 via-orange-950 to-slate-950",
    accent: "text-amber-400",
    icon: Users,
  },
};

export default function PresentationViewer() {
  const [, params] = useRoute("/presentation/:link");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data: presentation, isLoading, error } = useQuery<Presentation>({
    queryKey: ["presentation-view", params?.link],
    queryFn: async () => {
      const res = await fetch(`/api/presentation/view/${params?.link}`);
      if (!res.ok) throw new Error("Failed to fetch presentation");
      return res.json();
    },
    enabled: !!params?.link,
  });

  const theme = presentation 
    ? TEMPLATE_THEMES[presentation.templateType] || TEMPLATE_THEMES.client_proposal
    : TEMPLATE_THEMES.client_proposal;

  const slides = presentation ? [
    { type: 'title', content: presentation },
    { type: 'details', content: presentation },
    ...(presentation.notes ? [{ type: 'notes', content: presentation }] : []),
    ...(presentation.attendeeEmails?.length ? [{ type: 'attendees', content: presentation }] : []),
  ] : [];

  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "Escape") {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, toggleFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading presentation...</p>
        </div>
      </div>
    );
  }

  if (error || !presentation) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <FileText className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Presentation Not Found</h1>
          <p className="text-slate-400 mb-6">
            This presentation may have been deleted or the link is invalid.
          </p>
          <a href="https://orbitstaffing.io" className="text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1">
            Visit ORBIT Staffing
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  const Icon = theme.icon;
  const currentSlideData = slides[currentSlide];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} flex flex-col`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img 
            src="/mascot/clean/orbit_mascot_cyan_saturn_style_transparent_clean.png" 
            alt="ORBIT" 
            className="w-8 h-8"
          />
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Presentation</p>
            <h1 className="text-sm font-semibold text-white line-clamp-1">{presentation.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${theme.accent} font-mono`}>
            {currentSlide + 1} / {totalSlides}
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleFullscreen}
            className="text-slate-400 hover:text-white"
            data-testid="button-fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl">
          {currentSlideData?.type === 'title' && (
            <div className="text-center animate-fadeIn">
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${
                presentation.templateType === 'client_proposal' ? 'from-blue-600 to-indigo-700' :
                presentation.templateType === 'compliance_report' ? 'from-emerald-600 to-teal-700' :
                'from-amber-600 to-orange-700'
              } mb-6`}>
                <Icon className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 leading-tight">
                {presentation.title}
              </h1>
              <div className={`flex items-center justify-center gap-4 ${theme.accent} text-sm sm:text-base`}>
                {presentation.meetingDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {presentation.meetingDate}
                  </span>
                )}
                {presentation.meetingTime && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {presentation.meetingTime}
                  </span>
                )}
              </div>
              <div className="mt-8">
                <img 
                  src="/mascot/clean/orbit_mascot_cyan_saturn_style_transparent_clean.png" 
                  alt="ORBIT" 
                  className="w-20 h-20 mx-auto opacity-50"
                />
              </div>
            </div>
          )}

          {currentSlideData?.type === 'details' && (
            <div className="animate-fadeIn">
              <h2 className={`text-2xl sm:text-3xl font-bold text-white mb-8 ${theme.accent}`}>
                Meeting Details
              </h2>
              <div className="grid gap-4 sm:gap-6">
                <div className="p-4 sm:p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-white/10`}>
                      <Calendar className={`w-5 h-5 ${theme.accent}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Date & Time</h3>
                  </div>
                  <p className="text-slate-300 text-lg">
                    {presentation.meetingDate || "Date not specified"}
                    {presentation.meetingTime && ` at ${presentation.meetingTime}`}
                  </p>
                </div>
                <div className="p-4 sm:p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-white/10`}>
                      <Users className={`w-5 h-5 ${theme.accent}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Attendees</h3>
                  </div>
                  <p className="text-slate-300 text-lg">
                    {presentation.attendeeEmails?.length || 0} participant(s) invited
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentSlideData?.type === 'notes' && (
            <div className="animate-fadeIn">
              <h2 className={`text-2xl sm:text-3xl font-bold text-white mb-8`}>
                <span className={theme.accent}>Agenda</span> & Notes
              </h2>
              <div className="p-6 sm:p-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <p className="text-slate-200 text-lg sm:text-xl leading-relaxed whitespace-pre-wrap">
                  {presentation.notes}
                </p>
              </div>
            </div>
          )}

          {currentSlideData?.type === 'attendees' && (
            <div className="animate-fadeIn">
              <h2 className={`text-2xl sm:text-3xl font-bold text-white mb-8`}>
                <span className={theme.accent}>Meeting</span> Participants
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {presentation.attendeeEmails?.map((email, i) => (
                  <div 
                    key={i}
                    className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
                  >
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                      presentation.templateType === 'client_proposal' ? 'from-blue-500 to-indigo-600' :
                      presentation.templateType === 'compliance_report' ? 'from-emerald-500 to-teal-600' :
                      'from-amber-500 to-orange-600'
                    } flex items-center justify-center text-white font-bold`}>
                      {(presentation.attendeeNames?.[i] || email)[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {presentation.attendeeNames?.[i] || "Guest"}
                      </p>
                      <p className="text-slate-400 text-sm">{email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-10 flex items-center justify-between p-4 border-t border-white/10">
        <Button
          variant="ghost"
          size="lg"
          onClick={prevSlide}
          className="text-slate-400 hover:text-white hover:bg-white/10"
          data-testid="button-prev"
        >
          <ChevronLeft className="w-6 h-6 mr-1" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentSlide 
                  ? `${theme.accent.replace('text-', 'bg-')} scale-125` 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
              data-testid={`button-slide-${i}`}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          size="lg"
          onClick={nextSlide}
          className="text-slate-400 hover:text-white hover:bg-white/10"
          data-testid="button-next"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-6 h-6 ml-1" />
        </Button>
      </footer>

      <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
        <p className="text-[10px] text-slate-600">
          Powered by ORBIT Staffing OS v2.7.0
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
