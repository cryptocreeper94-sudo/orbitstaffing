import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause, X, List } from "lucide-react";
import { slidesData, Slide } from "@/data/slidesData";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";

export default function Slideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTOC, setShowTOC] = useState(false);
  const [_, setLocation] = useLocation();

  const slide = slidesData[currentSlide];
  const progress = ((currentSlide + 1) / slidesData.length) * 100;

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentSlide < slidesData.length - 1) {
        setCurrentSlide(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, slide.duration * 1000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentSlide, slide.duration]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
          nextSlide();
          break;
        case "ArrowLeft":
          prevSlide();
          break;
        case "Escape":
          setLocation("/");
          break;
        case " ":
          e.preventDefault();
          setIsPlaying(!isPlaying);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, isPlaying]);

  const nextSlide = useCallback(() => {
    if (currentSlide < slidesData.length - 1) {
      setCurrentSlide(prev => prev + 1);
      setIsPlaying(false);
    }
  }, [currentSlide]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
      setIsPlaying(false);
    }
  }, [currentSlide]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsPlaying(false);
    setShowTOC(false);
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-950 flex flex-col">
      {/* Main Slide Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto relative">
        {/* Navigation Areas */}
        <div
          onClick={prevSlide}
          className="absolute left-0 top-0 bottom-0 w-20 cursor-pointer hover:bg-white/5 transition-colors"
          style={{ zIndex: 40 }}
        />
        <div
          onClick={nextSlide}
          className="absolute right-0 top-0 bottom-0 w-20 cursor-pointer hover:bg-white/5 transition-colors"
          style={{ zIndex: 40 }}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="w-full flex items-center justify-center"
          >
            <SlideRenderer slide={slide} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls Bar */}
      <div className="bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent p-3 sm:p-4 md:p-6" style={{ zIndex: 50 }}>
        <div className="max-w-7xl mx-auto">
          <Progress value={progress} className="mb-4 h-1" />

          <div className="flex items-center justify-between text-white flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                data-testid="button-prev-slide"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                data-testid="button-play-pause"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>

              <Button
                onClick={nextSlide}
                disabled={currentSlide === slidesData.length - 1}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                data-testid="button-next-slide"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            <div className="text-sm font-medium">
              <span className="text-cyan-500">{currentSlide + 1}</span>
              <span className="text-slate-400"> / {slidesData.length}</span>
              <span className="mx-2 text-slate-600">•</span>
              <span className="text-slate-400">{slide.section}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowTOC(!showTOC)}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                data-testid="button-toc"
              >
                <List className="h-6 w-6" />
              </Button>

              <Button
                onClick={() => setLocation("/")}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                data-testid="button-exit"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      <AnimatePresence>
        {showTOC && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm"
            style={{ zIndex: 60 }}
          >
            <div className="h-full overflow-y-auto p-4 sm:p-6 md:p-8">
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">Table of Contents</h2>
                  <Button
                    onClick={() => setShowTOC(false)}
                    variant="ghost"
                    size="icon"
                    className="text-white"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                <div className="grid gap-2">
                  {slidesData.map((s, index) => (
                    <motion.button
                      key={s.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => goToSlide(index)}
                      className={`text-left p-4 rounded-lg transition-colors ${
                        index === currentSlide
                          ? "bg-cyan-500/20 border border-cyan-500"
                          : "bg-slate-800/50 hover:bg-slate-800 border border-transparent"
                      }`}
                      data-testid={`toc-slide-${index}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`text-sm font-bold ${
                          index === currentSlide ? "text-cyan-500" : "text-slate-400"
                        }`}>
                          {String(s.id).padStart(2, '0')}
                        </div>
                        <div className="flex-1">
                          <div className={`font-semibold mb-1 ${
                            index === currentSlide ? "text-white" : "text-slate-200"
                          }`}>
                            {s.title}
                          </div>
                          {s.subtitle && (
                            <div className="text-sm text-slate-400">{s.subtitle}</div>
                          )}
                          <div className="text-xs text-slate-500 mt-1">{s.section}</div>
                        </div>
                        <div className="text-xs text-slate-500">{s.duration}s</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Hints */}
      <div className="absolute top-4 right-4 text-xs text-slate-500" style={{ zIndex: 30 }}>
        <div>← → Navigate</div>
        <div>Space = Play/Pause</div>
        <div>ESC = Exit</div>
      </div>
    </div>
  );
}

function SlideRenderer({ slide }: { slide: Slide }) {
  const { content } = slide;

  const getGradient = () => {
    const gradients: Record<string, string> = {
      hero: "from-slate-900 via-cyan-950 to-slate-900",
      problem: "from-red-950/30 via-slate-900 to-slate-900",
      solution: "from-emerald-950/30 via-slate-900 to-cyan-950/30",
      feature: "from-slate-900 via-slate-800 to-slate-900",
      comparison: "from-slate-900 via-purple-950/20 to-slate-900",
      cta: "from-cyan-950/40 via-slate-900 to-purple-950/40",
      closing: "from-slate-900 via-slate-800 to-slate-900"
    };
    return gradients[content.type] || gradients.feature;
  };

  return (
    <div className={`w-full max-w-6xl mx-auto bg-gradient-to-br ${getGradient()} rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 lg:p-12 border border-slate-800`}>
      {content.type === 'hero' && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="text-center space-y-8"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400"
          >
            {content.headline}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-lg sm:text-xl md:text-2xl text-slate-300"
          >
            Autonomous Lot Management System
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="text-base sm:text-lg text-slate-400"
          >
            {content.subheadline}
          </motion.p>
        </motion.div>
      )}

      {content.type === 'problem' && (
        <div className="space-y-6">
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6"
          >
            {content.headline}
          </motion.h2>
          <div className="grid gap-2 sm:gap-3 md:gap-4">
            {content.bullets?.map((bullet, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="flex items-start gap-3 text-slate-300"
              >
                <span className="text-xl sm:text-2xl">❌</span>
                <span className="text-base sm:text-lg pt-1">{bullet}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {content.type === 'solution' && (
        <div className="space-y-6">
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400"
          >
            {content.headline}
          </motion.h2>
          <div className="grid gap-2 sm:gap-3 md:gap-4">
            {content.bullets?.map((bullet, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="flex items-start gap-3 text-slate-300"
              >
                <span className="text-xl sm:text-2xl">✅</span>
                <span className="text-base sm:text-lg pt-1">{bullet}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {content.type === 'feature' && (
        <div className="space-y-6">
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2"
            >
              {content.headline}
            </motion.h2>
            {content.subtitle && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-cyan-300"
              >
                {content.subtitle}
              </motion.p>
            )}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-slate-300"
          >
            {content.description}
          </motion.p>
          {content.bullets && content.bullets.length > 0 && (
            <div className="grid gap-2 sm:gap-3 md:gap-4 mt-4">
              {content.bullets.map((bullet, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-3 text-slate-300"
                >
                  <span className="text-cyan-400 font-bold">→</span>
                  <span className="text-base sm:text-lg pt-1">{bullet}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {content.type === 'cta' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            {content.headline}
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
            {content.description}
          </p>
        </motion.div>
      )}

      {content.type === 'closing' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center space-y-8"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
            {content.headline}
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
            {content.description}
          </p>
          <div className="pt-4 text-sm text-slate-500">
            Thank you for exploring Lot Ops Pro
          </div>
        </motion.div>
      )}
    </div>
  );
}
