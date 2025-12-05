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
      hallmark: null,
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
      emblem: '/attached_assets/Screenshot_20251205_100035_Replit_1764952065470.jpg',
      hallmark: null,
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
      hallmark: null,
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
      emblem: '/attached_assets/Screenshot_20251205_080335_Replit_1764943504222.jpg',
      hallmark: '/attached_assets/Screenshot_20251205_092457_Replit_1764949322382.jpg',
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
      hallmark: null,
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
      <div className="relative z-10 pt-8 sm:pt-10 pb-2 sm:pb-4 text-center px-6 sm:px-8 overflow-visible">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-2"
        >
          <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-cyan-400" />
          <span className="text-[10px] sm:text-sm text-cyan-300 uppercase tracking-wider sm:tracking-widest font-semibold">Enterprise Solutions</span>
          <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-cyan-400" />
        </motion.div>
        <h1 className="text-2xl sm:text-5xl md:text-7xl mb-2 sm:mb-3 relative overflow-visible">
          <span 
            className="font-extralight tracking-[0.08em] sm:tracking-[0.3em] uppercase"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #1a1a2e 75%, #16213e 100%)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 0 80px rgba(6, 182, 212, 0.5), 0 0 120px rgba(139, 92, 246, 0.3)',
              animation: 'holographic 4s ease-in-out infinite',
            }}
          >
            DarkWave
          </span>
          <span 
            className="font-thin tracking-[0.05em] sm:tracking-[0.2em] uppercase ml-1 sm:ml-4"
            style={{
              background: 'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(6,182,212,0.8) 50%, rgba(255,255,255,0.9) 100%)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              animation: 'shimmer 3s linear infinite',
            }}
          >
            Studios
          </span>
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm">
          {currentIndex + 1} / {products.length} Products
        </p>
      </div>

      {/* Compact Carousel - Horizontal Cards */}
      <div className="relative z-10 flex items-center justify-center px-12 sm:px-16 py-4">
        {/* Left Arrow */}
        <motion.button
          onClick={prevProduct}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="absolute left-2 sm:left-4 z-20 p-2 sm:p-3 bg-slate-800/90 hover:bg-cyan-500/30 border border-slate-700 hover:border-cyan-500 rounded-full transition-all group shadow-lg"
          data-testid="button-prev-product"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 group-hover:text-white transition" />
        </motion.button>

        {/* Compact Product Card */}
        <div className="w-full max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentProduct.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              {/* Glow Effect */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${currentProduct.color} rounded-xl blur-lg opacity-40`} />
              
              {/* Compact Horizontal Card */}
              <div
                className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl"
                data-testid={`card-product-${currentProduct.id}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${currentProduct.color} opacity-5`} />
                
                <div className="relative p-4 sm:p-5">
                  {/* Row 1: Emblem + Name/Tagline + Hallmark/QR */}
                  <div className="flex items-center gap-3 mb-3">
                    {/* Emblem - Square */}
                    {currentProduct.emblem ? (
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-lg bg-gradient-to-br ${currentProduct.color} p-0.5 shadow-lg overflow-hidden`}>
                        <img 
                          src={currentProduct.emblem} 
                          alt={`${currentProduct.name} emblem`}
                          className="w-full h-full rounded-lg object-cover"
                        />
                      </div>
                    ) : (
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-lg bg-gradient-to-br ${currentProduct.color} p-0.5 shadow-lg`}>
                        <div className="w-full h-full rounded-lg bg-slate-900/90 flex items-center justify-center">
                          <span className="text-lg sm:text-xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            {currentProduct.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Name & Tagline - Center */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base sm:text-lg font-bold text-white truncate">
                        {currentProduct.name}
                      </h2>
                      <p className={`text-[10px] sm:text-xs font-medium bg-gradient-to-r ${currentProduct.color} bg-clip-text text-transparent truncate`}>
                        {currentProduct.tagline}
                      </p>
                    </div>

                    {/* Hallmark/QR - Right */}
                    {currentProduct.hallmark ? (
                      <div className="w-16 h-12 sm:w-20 sm:h-14 shrink-0 rounded-lg bg-gradient-to-br from-teal-900 to-slate-900 p-0.5 shadow-lg overflow-hidden">
                        <img 
                          src={currentProduct.hallmark} 
                          alt={`${currentProduct.name} hallmark`}
                          className="w-full h-full rounded-lg object-cover"
                        />
                      </div>
                    ) : currentProduct.url ? (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-lg bg-white p-1 shadow-lg">
                        <QRCodeSVG 
                          value={currentProduct.url} 
                          size={48}
                          className="w-full h-full"
                          bgColor="#ffffff"
                          fgColor="#0f172a"
                        />
                      </div>
                    ) : (
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-lg bg-gradient-to-br ${currentProduct.color} p-0.5 opacity-30`}>
                        <div className="w-full h-full rounded-lg bg-slate-900/90 flex items-center justify-center">
                          <span className="text-[8px] text-gray-500">Soon</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Row 2: Description (2 lines max) */}
                  <p className="text-gray-300 text-xs sm:text-sm mb-3 line-clamp-2 leading-snug">
                    {currentProduct.description}
                  </p>

                  {/* Row 3: Compact Action Buttons */}
                  <div className="flex gap-2 justify-center">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className={`flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r ${currentProduct.color} rounded-lg font-bold text-[10px] sm:text-xs shadow-lg`}
                      onClick={() => setSelectedProduct(currentProduct.id)}
                      data-testid={`button-view-presentation-${currentProduct.id}`}
                    >
                      <Sparkles className="w-3 h-3" />
                      Details
                    </motion.button>
                    
                    {currentProduct.url && (
                      <motion.a
                        href={currentProduct.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg font-bold text-[10px] sm:text-xs"
                        data-testid={`button-visit-${currentProduct.id}`}
                      >
                        Visit
                        <ExternalLink className="w-3 h-3" />
                      </motion.a>
                    )}
                  </div>
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
          className="absolute right-2 sm:right-4 z-20 p-2 sm:p-3 bg-slate-800/90 hover:bg-cyan-500/30 border border-slate-700 hover:border-cyan-500 rounded-full transition-all group shadow-lg"
          data-testid="button-next-product"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 group-hover:text-white transition" />
        </motion.button>
      </div>

      {/* Dot Navigation */}
      <div className="relative z-10 flex justify-center gap-2 pb-4">
        {products.map((product, index) => (
          <motion.button
            key={product.id}
            onClick={() => setCurrentIndex(index)}
            whileTap={{ scale: 0.9 }}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? `bg-gradient-to-r ${product.color} w-6`
                : 'bg-slate-600 hover:bg-slate-500 w-2'
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
