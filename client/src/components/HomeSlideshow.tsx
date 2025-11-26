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
  product: "Lot Ops Pro" | "ORBIT Staffing OS" | "DarkWave Pulse";
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
    <div className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">{product}</h3>
        <div className="text-sm text-slate-400">
          <span className="text-cyan-400 font-semibold">{currentIndex + 1}</span>
          <span> / {slides.length}</span>
        </div>
      </div>

      {/* Slide Content */}
      <div className="p-6 sm:p-8 min-h-[400px] flex flex-col justify-between">
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
              <div className="text-4xl mb-3 opacity-80">{slide.icon}</div>
            )}
            
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              {slide.headline}
            </h2>

            {slide.description && (
              <p className="text-slate-300 mb-4 text-base leading-relaxed">
                {slide.description}
              </p>
            )}

            {slide.bullets && slide.bullets.length > 0 && (
              <ul className="space-y-2 mb-6">
                {slide.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-300">
                    <span className="text-cyan-400 font-bold mt-0.5">→</span>
                    <span className="text-sm leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden mt-6">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 py-4 border-t border-slate-700/50 flex items-center justify-between">
        <Button
          onClick={prev}
          variant="ghost"
          size="sm"
          className="text-slate-300 hover:text-white hover:bg-slate-700/50"
          data-testid={`button-prev-slide-${product.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Slide Indicators */}
        <div className="flex gap-1">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex
                  ? "bg-cyan-500 w-6"
                  : "bg-slate-600 w-2 hover:bg-slate-500"
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
          className="text-slate-300 hover:text-white hover:bg-slate-700/50"
          data-testid={`button-next-slide-${product.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
