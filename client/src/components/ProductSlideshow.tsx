import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Slide {
  title: string;
  subtitle?: string;
  content: string;
  icon?: string;
  category?: string;
}

interface ProductSlideshowProps {
  productName: string;
  slides: Slide[];
  onClose: () => void;
}

export const ProductSlideshow: React.FC<ProductSlideshowProps> = ({
  productName,
  slides,
  onClose,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const slide = slides[currentSlide];
  const progress = ((currentSlide + 1) / slides.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" data-testid="slideshow-modal">
      <div className="relative w-full max-w-4xl max-h-96 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-cyan-500/30">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-cyan-500/20 rounded-lg transition"
          data-testid="button-close-slideshow"
        >
          <X className="w-6 h-6 text-cyan-400" />
        </button>

        {/* Main content */}
        <div className="h-96 flex flex-col justify-center p-12">
          <div className="mb-6">
            {slide.category && (
              <div className="inline-block px-3 py-1 bg-cyan-500/20 rounded-full mb-3">
                <span className="text-xs font-semibold text-cyan-300">{slide.category}</span>
              </div>
            )}
            <h2 className="text-4xl font-bold text-white mb-2">{slide.title}</h2>
            {slide.subtitle && (
              <p className="text-cyan-300 text-lg">{slide.subtitle}</p>
            )}
          </div>

          <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
            {slide.content}
          </p>

          {/* Slide counter */}
          <div className="mt-8 text-sm text-gray-400">
            Slide {currentSlide + 1} of {slides.length}
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-cyan-500/50 transition-all duration-300" style={{ width: `${progress}%` }} />

        {/* Navigation */}
        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
          <button
            onClick={prevSlide}
            className="p-2 hover:bg-cyan-500/20 rounded-lg transition"
            data-testid="button-prev-slide"
          >
            <ChevronLeft className="w-6 h-6 text-cyan-400" />
          </button>

          {/* Dot navigation */}
          <div className="flex gap-2 flex-wrap justify-center max-w-xs">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition ${
                  index === currentSlide
                    ? 'bg-cyan-400 w-8'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
                data-testid={`button-dot-${index}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="p-2 hover:bg-cyan-500/20 rounded-lg transition"
            data-testid="button-next-slide"
          >
            <ChevronRight className="w-6 h-6 text-cyan-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
