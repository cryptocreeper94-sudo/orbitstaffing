import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ExternalLink, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductSlideshow } from '@/components/ProductSlideshow';
import { HomeSlideshow } from '@/components/HomeSlideshow';
import { DarkwaveFooter } from '@/components/DarkwaveFooter';
import { DarkWaveAssistant } from '@/components/DarkWaveAssistant';
import { slideContent } from '@/data/slideContent';
import { slidesData, orbitSlides, brewAndBoardSlides, orbySlides } from '@/data/slidesData';
import { QRCodeSVG } from 'qrcode.react';

export default function ProductsGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [showSlideshow, setShowSlideshow] = useState<string | null>(null);

  const products = [
    {
      id: 'ORBIT',
      name: 'ORBIT Staffing OS',
      tagline: '100% Automated Flexible Labor Marketplace',
      description: 'Zero manual intervention staffing platform with GPS-verified check-ins, automated matching, and comprehensive payroll.',
      color: 'from-cyan-500 to-blue-600',
      glowColor: 'cyan',
      slides: slideContent.ORBIT,
      slideshowData: orbitSlides,
      url: 'https://orbitstaffing.io',
      emblem: null,
    },
    {
      id: 'Orby',
      name: 'Orby',
      tagline: 'Operations Command Software',
      description: 'Complete command and control platform with full communication suite, emergency management, and advanced geofencing.',
      color: 'from-emerald-500 to-teal-600',
      glowColor: 'emerald',
      slides: slideContent['ORBY'],
      slideshowData: orbySlides,
      url: 'https://getorby.io',
      emblem: null,
    },
    {
      id: 'DarkWave Pulse',
      name: 'DarkWave Pulse',
      tagline: 'Lightning-Fast Compliance & Safety Platform',
      description: 'Enterprise-grade safety management with real-time incident detection and OSHA compliance automation.',
      color: 'from-purple-500 to-pink-600',
      glowColor: 'purple',
      slides: slideContent['DarkWave Pulse'],
      slideshowData: null,
      url: null,
      emblem: null,
    },
    {
      id: 'Lot Ops Pro',
      name: 'Lot Ops Pro',
      tagline: 'Smart Inventory & Fleet Operations',
      description: 'Complete inventory and fleet operations with real-time tracking and maintenance scheduling.',
      color: 'from-amber-500 to-orange-600',
      glowColor: 'amber',
      slides: slideContent['Lot Ops Pro'],
      slideshowData: slidesData,
      url: null,
      emblem: null,
    },
    {
      id: 'BrewAndBoard',
      name: 'Brew & Board Coffee',
      tagline: 'B2B Coffee Delivery for Nashville',
      description: 'Connect businesses with Nashville coffee shops. 20+ vendors, calendar scheduling, blockchain-verified receipts.',
      color: 'from-stone-700 to-amber-900',
      glowColor: 'amber',
      slides: slideContent['BREW_AND_BOARD'],
      slideshowData: brewAndBoardSlides,
      url: 'https://brewandboard.coffee',
      emblem: null,
    },
  ];

  const nextProduct = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const prevProduct = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const currentProduct = products[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Twinkling Stars */}
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
        {/* Colored Stars */}
        {[...Array(25)].map((_, i) => (
          <div
            key={`cyan-${i}`}
            className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
        {[...Array(15)].map((_, i) => (
          <div
            key={`purple-${i}`}
            className="absolute w-1 h-1 bg-purple-400 rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient Orbs */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <motion.div 
          className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/30 rounded-full blur-3xl"
          animate={{ 
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-3xl"
          animate={{ 
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-pink-500/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-6 sm:pt-10 pb-2 sm:pb-4 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-2"
        >
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
          <span className="text-xs sm:text-sm text-cyan-300 uppercase tracking-widest font-semibold">Enterprise Solutions</span>
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
        </motion.div>
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black mb-2 sm:mb-3">
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
            DarkWave Studios
          </span>
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm">
          {currentIndex + 1} / {products.length} Products
        </p>
      </div>

      {/* Carousel Container */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-2 sm:px-4 py-2 sm:py-6">
        {/* Left Arrow */}
        <motion.button
          onClick={prevProduct}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="absolute left-1 sm:left-4 md:left-8 z-20 p-2 sm:p-3 md:p-4 bg-slate-800/90 hover:bg-gradient-to-r hover:from-cyan-500/30 hover:to-purple-500/30 border border-slate-700 hover:border-cyan-500 rounded-full transition-all duration-300 group shadow-lg shadow-black/50"
          data-testid="button-prev-product"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-cyan-400 group-hover:text-white transition" />
        </motion.button>

        {/* Product Card */}
        <div className="w-full max-w-3xl mx-auto px-10 sm:px-16 md:px-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentProduct.id}
              initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateY: 10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative"
            >
              {/* Glow Effect */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${currentProduct.color} rounded-2xl sm:rounded-3xl blur-xl opacity-50 animate-pulse`} />
              
              {/* Card */}
              <div
                className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl"
                data-testid={`card-product-${currentProduct.id}`}
              >
                {/* Inner Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${currentProduct.color} opacity-5`} />
                
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />

                <div className="relative p-5 sm:p-8 md:p-10">
                  {/* Top Row: Emblem placeholder + Name + QR placeholder */}
                  <div className="flex items-start justify-between gap-4 mb-4 sm:mb-6">
                    {/* Emblem Placeholder */}
                    <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br ${currentProduct.color} p-0.5 flex-shrink-0 shadow-lg`}>
                      <div className="w-full h-full rounded-xl bg-slate-900/90 flex items-center justify-center">
                        <span className="text-lg sm:text-2xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                          {currentProduct.name.charAt(0)}
                        </span>
                      </div>
                    </div>

                    {/* Center: Name & Tagline */}
                    <div className="flex-1 text-center">
                      <h2 className="text-xl sm:text-3xl md:text-4xl font-black mb-1 sm:mb-2 text-white">
                        {currentProduct.name}
                      </h2>
                      <p className={`text-xs sm:text-base font-semibold bg-gradient-to-r ${currentProduct.color} bg-clip-text text-transparent`}>
                        {currentProduct.tagline}
                      </p>
                    </div>

                    {/* QR Code */}
                    {currentProduct.url && (
                      <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl bg-white p-1 sm:p-1.5 flex-shrink-0 shadow-lg">
                        <QRCodeSVG 
                          value={currentProduct.url} 
                          size={100}
                          className="w-full h-full"
                          bgColor="#ffffff"
                          fgColor="#0f172a"
                        />
                      </div>
                    )}
                    {!currentProduct.url && (
                      <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br ${currentProduct.color} p-0.5 flex-shrink-0 opacity-30`}>
                        <div className="w-full h-full rounded-xl bg-slate-900/90 flex items-center justify-center">
                          <span className="text-[8px] sm:text-xs text-gray-500">Soon</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-center text-sm sm:text-base md:text-lg mb-4 sm:mb-6 leading-relaxed">
                    {currentProduct.description}
                  </p>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 justify-center items-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r ${currentProduct.color} rounded-xl font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-shadow`}
                      onClick={() => setSelectedProduct(currentProduct.id)}
                      data-testid={`button-view-presentation-${currentProduct.id}`}
                    >
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                      Presentation
                    </motion.button>
                    
                    {currentProduct.slideshowData && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-slate-700/80 hover:bg-slate-600 border border-white/10 rounded-xl font-bold text-xs sm:text-sm transition shadow-lg"
                        onClick={() => setShowSlideshow(currentProduct.id)}
                        data-testid={`button-view-slideshow-${currentProduct.id}`}
                      >
                        Full Slideshow
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </motion.button>
                    )}

                    {currentProduct.url && (
                      <motion.a
                        href={currentProduct.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-bold text-xs sm:text-sm transition shadow-lg"
                        data-testid={`button-visit-${currentProduct.id}`}
                      >
                        Visit Site
                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                      </motion.a>
                    )}
                  </div>

                  {/* Slide count */}
                  <p className="text-center text-gray-500 text-xs mt-4">
                    {currentProduct.slides.length} slides available
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Arrow */}
        <motion.button
          onClick={nextProduct}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="absolute right-1 sm:right-4 md:right-8 z-20 p-2 sm:p-3 md:p-4 bg-slate-800/90 hover:bg-gradient-to-r hover:from-purple-500/30 hover:to-cyan-500/30 border border-slate-700 hover:border-cyan-500 rounded-full transition-all duration-300 group shadow-lg shadow-black/50"
          data-testid="button-next-product"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-cyan-400 group-hover:text-white transition" />
        </motion.button>
      </div>

      {/* Dot Navigation */}
      <div className="relative z-10 flex justify-center gap-2 sm:gap-3 pb-4 sm:pb-6">
        {products.map((product, index) => (
          <motion.button
            key={product.id}
            onClick={() => setCurrentIndex(index)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? `bg-gradient-to-r ${product.color} w-6 sm:w-10`
                : 'bg-slate-600 hover:bg-slate-500 w-2 sm:w-3'
            }`}
            data-testid={`dot-${product.id}`}
            aria-label={`Go to ${product.name}`}
          />
        ))}
      </div>

      {/* Product Presentation Modal */}
      {selectedProduct && (
        <ProductSlideshow
          productName={selectedProduct}
          slides={slideContent[selectedProduct] || []}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Slideshow View */}
      {showSlideshow && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <button
              onClick={() => setShowSlideshow(null)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-lg transition"
              data-testid="button-close-slideshow"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <div className="w-full max-w-6xl mt-8">
              {showSlideshow === 'ORBIT' && (
                <HomeSlideshow 
                  slides={orbitSlides as any} 
                  product="ORBIT Staffing OS"
                  title="ORBIT Staffing OS Slideshow"
                />
              )}
              {showSlideshow === 'Orby' && (
                <HomeSlideshow 
                  slides={orbySlides as any} 
                  product="Orby"
                  title="Orby Slideshow"
                />
              )}
              {showSlideshow === 'Lot Ops Pro' && (
                <HomeSlideshow 
                  slides={slidesData as any} 
                  product="Lot Ops Pro"
                  title="Lot Ops Pro Slideshow"
                />
              )}
              {showSlideshow === 'BrewAndBoard' && (
                <HomeSlideshow 
                  slides={brewAndBoardSlides as any} 
                  product="Brew & Board Coffee"
                  title="Brew & Board Coffee Slideshow"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <DarkwaveFooter product="Darkwave Studios Ecosystem" hidePoweredBy={true} />

      {/* DarkWave AI Assistant */}
      <DarkWaveAssistant />
    </div>
  );
}
