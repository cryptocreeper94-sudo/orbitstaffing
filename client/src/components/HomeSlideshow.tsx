import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface HomeSlide {
  id: number;
  title: string;
  headline: string;
  description?: string;
  bullets?: string[];
  icon?: string;
}

interface HomeSlideshowProps {
  slides: HomeSlide[];
  title: string;
  product: "Lot Ops Pro" | "ORBIT Staffing OS" | "DarkWave Pulse" | "Brew & Board Coffee" | "Orby";
}

export function HomeSlideshow({ slides, title, product }: HomeSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slide = slides[currentIndex];
  const progress = ((currentIndex + 1) / slides.length) * 100;

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg sm:rounded-xl border border-slate-700/50 overflow-hidden max-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="px-3 sm:px-6 py-2 sm:py-4 border-b border-slate-700/50 flex items-center justify-between flex-shrink-0">
        <h3 className="text-sm sm:text-lg font-bold text-white truncate">{product}</h3>
        <div className="text-xs sm:text-sm text-slate-400 flex-shrink-0">
          <span className="text-cyan-400 font-semibold">{currentIndex + 1}</span>
          <span> / {slides.length}</span>
        </div>
      </div>

      {/* Slide Content - scrollable */}
      <div className="p-3 sm:p-6 md:p-8 min-h-[200px] sm:min-h-[300px] flex-1 overflow-y-auto flex flex-col justify-between">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Icon/Title Section */}
            {slide.icon && (
              <div className="text-2xl sm:text-4xl mb-2 sm:mb-3 opacity-80">{slide.icon}</div>
            )}
            
            <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
              {slide.headline}
            </h2>

            {slide.description && (
              <p className="text-slate-300 mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">
                {slide.description}
              </p>
            )}

            {slide.bullets && slide.bullets.length > 0 && (
              <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
                {slide.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2 sm:gap-3 text-slate-300">
                    <span className="text-cyan-400 font-bold mt-0.5 flex-shrink-0">→</span>
                    <span className="text-xs sm:text-sm leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden mt-3 sm:mt-6 flex-shrink-0">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="px-3 sm:px-6 py-2 sm:py-4 border-t border-slate-700/50 flex items-center justify-between flex-shrink-0">
        <Button
          onClick={prev}
          variant="ghost"
          size="sm"
          className="text-slate-300 hover:text-white hover:bg-slate-700/50 h-8 w-8 sm:h-auto sm:w-auto p-1 sm:p-2"
          data-testid={`button-prev-slide-${product.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Slide Indicators */}
        <div className="flex gap-1 flex-wrap justify-center max-w-[150px] sm:max-w-none">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`h-1.5 sm:h-2 rounded-full transition-all ${
                idx === currentIndex
                  ? "bg-cyan-500 w-4 sm:w-6"
                  : "bg-slate-600 w-1.5 sm:w-2 hover:bg-slate-500"
              }`}
              data-testid={`indicator-slide-${idx}-${product.toLowerCase().replace(/\s+/g, '-')}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <Button
          onClick={next}
          variant="ghost"
          size="sm"
          className="text-slate-300 hover:text-white hover:bg-slate-700/50 h-8 w-8 sm:h-auto sm:w-auto p-1 sm:p-2"
          data-testid={`button-next-slide-${product.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
