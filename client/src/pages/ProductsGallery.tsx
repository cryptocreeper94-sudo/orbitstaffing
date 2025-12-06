import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ExternalLink, Sparkles, Play, Menu, Settings, Home, Mail, Info } from 'lucide-react';
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
  const [menuOpen, setMenuOpen] = useState(false);

  const products = [
    {
      id: 'ORBIT',
      name: 'ORBIT Staffing OS',
      tagline: '100% Automated Flexible Labor Marketplace',
      description: 'Zero manual intervention staffing platform with GPS-verified check-ins, automated matching, and comprehensive payroll. Complete workforce management from recruitment to payment with blockchain-verified credentials and real-time compliance tracking.',
      color: 'from-cyan-500 to-blue-600',
      glowColor: 'cyan',
      slides: slideContent.ORBIT,
      slideshowData: orbitSlides,
      url: 'https://orbitstaffing.io',
      emblem: '/attached_assets/generated_images/orby_mascot_presenting_pose.png',
      hallmark: null,
    },
    {
      id: 'Orby',
      name: 'Orby',
      tagline: 'Operations Command Software',
      description: 'Complete command and control platform with full communication suite, emergency management, and advanced geofencing. Real-time location tracking, automated dispatch, and comprehensive incident response for enterprise operations.',
      color: 'from-emerald-500 to-teal-600',
      glowColor: 'emerald',
      slides: slideContent['ORBY'],
      slideshowData: orbySlides,
      url: 'https://getorby.io',
      emblem: '/attached_assets/Screenshot_20251205_100035_Replit_1764952065470.jpg',
      hallmark: '/attached_assets/Screenshot_20251205_154312_Replit_1764971077009.jpg',
    },
    {
      id: 'DarkWave Pulse',
      name: 'DarkWave Pulse',
      tagline: 'Lightning-Fast Compliance & Safety Platform',
      description: 'Enterprise-grade safety management with real-time incident detection and OSHA compliance automation. Automated safety audits, incident tracking, and regulatory reporting with predictive analytics for workplace safety.',
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
      description: 'Complete inventory and fleet operations with real-time tracking and maintenance scheduling. Automated lot management, vehicle tracking, condition reporting, and predictive maintenance for automotive dealerships.',
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
      description: 'Connect businesses with Nashville coffee shops. 20+ vendors, calendar scheduling, blockchain-verified receipts. Streamline your office coffee program with automated ordering and delivery coordination.',
      color: 'from-stone-700 to-amber-900',
      glowColor: 'amber',
      slides: slideContent['BREW_AND_BOARD'],
      slideshowData: brewAndBoardSlides,
      url: 'https://brewandboard.coffee',
      emblem: '/attached_assets/brew_board_emblem.png',
      hallmark: '/attached_assets/Screenshot_20251205_135345_Replit_1764964534831.jpg',
    },
    {
      id: 'GarageBot',
      name: 'GarageBot',
      tagline: 'Smart Garage & Workshop Management',
      description: 'Intelligent automation for garage and workshop operations with IoT integration and smart scheduling. Tool inventory, work order management, and automated maintenance tracking for professional workshops.',
      color: 'from-sky-500 to-blue-700',
      glowColor: 'sky',
      slides: slideContent['ORBIT'] || [],
      slideshowData: null,
      url: 'https://garagebot.io',
      emblem: '/attached_assets/garagebot_emblem.png',
      hallmark: '/attached_assets/Screenshot_20251205_150630_Chrome_1764968855422.jpg',
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Animated Background - Fixed behind everything */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
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
        
        {/* Gradient Orbs */}
        <div className="absolute inset-0 opacity-40">
          <motion.div 
            className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/30 rounded-full blur-3xl"
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-3xl"
            animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* ===== SECTION 1: HEADER (Fixed height) ===== */}
      <header className="relative z-20 py-3 px-4 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Title + Solana Badge */}
          <div className="flex items-center gap-3">
            <span className="text-sm sm:text-base font-medium text-slate-300">darkwavestudios.io</span>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">v2.6.1</span>
            {/* Solana Verification Badge with QR */}
            <div className="flex items-center gap-2 px-2 py-1 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg border border-purple-500/30">
              <div className="w-6 h-6 bg-white rounded p-0.5">
                <QRCodeSVG 
                  value="https://darkwavestudios.io" 
                  size={20}
                  level="L"
                  bgColor="white"
                  fgColor="#0f172a"
                />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-[9px] text-cyan-400 font-semibold leading-tight">SOLANA</span>
                <span className="text-[8px] text-slate-400 leading-tight">VERIFIED</span>
              </div>
            </div>
          </div>
          
          {/* Right: Hamburger Menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-slate-400 hover:text-cyan-400 transition rounded-lg hover:bg-slate-800/50"
            data-testid="button-menu-toggle"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        {/* Dropdown Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full right-4 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-xl shadow-black/50 overflow-hidden z-50"
            >
              <div className="py-2">
                <a href="/" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-cyan-400 transition">
                  <Home className="w-4 h-4" />
                  ORBIT Staffing Home
                </a>
                <a href="/studio" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-cyan-400 transition">
                  <Sparkles className="w-4 h-4" />
                  Product Gallery
                </a>
                <a href="/developer" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-cyan-400 transition">
                  <Settings className="w-4 h-4" />
                  Developer Portal
                </a>
                <div className="border-t border-slate-700 my-2"></div>
                <a href="/contact" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-cyan-400 transition">
                  <Mail className="w-4 h-4" />
                  Contact
                </a>
                <a href="/about" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-cyan-400 transition">
                  <Info className="w-4 h-4" />
                  About
                </a>
                <div className="border-t border-slate-700 my-2"></div>
                <div className="px-4 py-2 text-xs text-slate-500">
                  Version v2.6.1 • Solana Verified
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Page Title - Centered */}
      <div className="relative z-10 pt-4 pb-2 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-2"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-cyan-300 uppercase tracking-widest font-semibold">Enterprise Solutions</span>
          <Sparkles className="w-4 h-4 text-cyan-400" />
        </motion.div>
        <h1 className="text-2xl sm:text-4xl md:text-5xl mb-1">
          <span 
            className="font-extralight tracking-[0.1em] sm:tracking-[0.3em] uppercase"
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
            className="font-thin tracking-[0.05em] sm:tracking-[0.2em] uppercase ml-2 sm:ml-4"
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
      </div>

      {/* ===== SECTION 2: FULL-SCREEN PRODUCT CARD ===== */}
      <section className="relative z-10 flex-1 flex items-center justify-center px-2 sm:px-4 py-2 overflow-hidden">
        {/* Left Arrow */}
        <motion.button
          onClick={prevProduct}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="absolute left-1 sm:left-6 z-20 p-2 sm:p-4 bg-slate-800/90 hover:bg-cyan-500/30 border border-slate-700 hover:border-cyan-500 rounded-full transition-all group shadow-xl"
          data-testid="button-prev-product"
        >
          <ChevronLeft className="w-5 h-5 sm:w-8 sm:h-8 text-cyan-400 group-hover:text-white transition" />
        </motion.button>

        {/* Product Card - Constrained to fit viewport */}
        <div className="w-full max-w-6xl xl:max-w-7xl flex items-center justify-center mx-10 sm:mx-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentProduct.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full relative"
            >
              {/* Glow Effect */}
              <div className={`absolute -inset-2 bg-gradient-to-r ${currentProduct.color} rounded-3xl blur-xl opacity-30`} />
              
              {/* Card Container - max height constrained */}
              <div
                className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900/98 via-slate-800/98 to-slate-900/98 backdrop-blur-xl border border-white/10 shadow-2xl"
                data-testid={`card-product-${currentProduct.id}`}
              >
                {/* Background Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${currentProduct.color} opacity-5 rounded-2xl`} />
                
                {/* Card Content - Compact layout */}
                <div className="relative flex flex-col p-4 sm:p-8">
                  
                  {/* Top Section: Emblem + Product Info - Horizontal on mobile */}
                  <div className="flex items-center gap-3 sm:gap-8 mb-3 sm:mb-6">
                    {/* Emblem - Smaller on mobile */}
                    <div className="shrink-0">
                      {currentProduct.emblem ? (
                        <div className={`w-16 h-16 sm:w-28 sm:h-28 rounded-xl sm:rounded-2xl bg-gradient-to-br ${currentProduct.color} p-0.5 sm:p-1 shadow-2xl overflow-hidden`}>
                          <img 
                            src={currentProduct.emblem} 
                            alt={`${currentProduct.name} emblem`}
                            className="w-full h-full rounded-lg sm:rounded-xl object-cover bg-slate-800"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full rounded-lg bg-slate-900/90 flex items-center justify-center"><span class="text-2xl font-black text-cyan-400">${currentProduct.name.charAt(0)}</span></div>`;
                            }}
                          />
                        </div>
                      ) : (
                        <div className={`w-16 h-16 sm:w-28 sm:h-28 rounded-xl sm:rounded-2xl bg-gradient-to-br ${currentProduct.color} p-0.5 sm:p-1 shadow-2xl`}>
                          <div className="w-full h-full rounded-lg sm:rounded-xl bg-slate-900/90 flex items-center justify-center">
                            <span className="text-2xl sm:text-5xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                              {currentProduct.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Product Name & Tagline */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg sm:text-4xl font-bold text-white mb-1 sm:mb-2 truncate">
                        {currentProduct.name}
                      </h2>
                      <p className={`text-xs sm:text-xl font-medium bg-gradient-to-r ${currentProduct.color} bg-clip-text text-transparent line-clamp-2`}>
                        {currentProduct.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Middle Section: Description - Shorter on mobile */}
                  <div className="mb-3 sm:mb-6">
                    <p className="text-gray-300 text-xs sm:text-lg leading-relaxed text-center line-clamp-4 sm:line-clamp-none">
                      {currentProduct.description}
                    </p>
                  </div>

                  {/* Bottom Section: Hallmark QR + Buttons */}
                  <div className="flex flex-col items-center gap-2 sm:gap-4">
                    {/* Hallmark QR Code - Compact on mobile */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[9px] sm:text-xs text-gray-500 uppercase tracking-wider">Blockchain Verified</span>
                      {currentProduct.hallmark ? (
                        <div className="w-auto h-14 sm:h-24 max-w-[120px] sm:max-w-[180px] rounded-lg bg-gradient-to-br from-teal-900/50 to-slate-900/50 p-0.5 shadow-lg overflow-hidden border border-cyan-500/20">
                          <img 
                            src={currentProduct.hallmark} 
                            alt={`${currentProduct.name} hallmark`}
                            className="h-full w-auto rounded-md object-contain"
                          />
                        </div>
                      ) : currentProduct.url ? (
                        <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-lg bg-white p-1 shadow-lg">
                          <QRCodeSVG 
                            value={currentProduct.url} 
                            size={56}
                            className="w-full h-full"
                            bgColor="#ffffff"
                            fgColor="#0f172a"
                          />
                        </div>
                      ) : (
                        <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-lg bg-gradient-to-br ${currentProduct.color} p-0.5 opacity-30`}>
                          <div className="w-full h-full rounded-md bg-slate-900/90 flex items-center justify-center">
                            <span className="text-[10px] text-gray-500">Pending</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons - Compact on mobile */}
                    <div className="flex gap-2 sm:gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3 sm:px-8 py-2 sm:py-3 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r ${currentProduct.color} rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-base shadow-lg`}
                        onClick={() => setSelectedProduct(currentProduct.id)}
                        data-testid={`button-slideshow-${currentProduct.id}`}
                      >
                        <Play className="w-3 h-3 sm:w-5 sm:h-5" />
                        Slideshow
                      </motion.button>
                      
                      {currentProduct.url ? (
                        <motion.a
                          href={currentProduct.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 sm:px-8 py-2 sm:py-3 inline-flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-base transition-colors"
                          data-testid={`button-visit-${currentProduct.id}`}
                        >
                          Visit
                          <ExternalLink className="w-3 h-3 sm:w-5 sm:h-5" />
                        </motion.a>
                      ) : (
                        <div className="px-3 sm:px-8 py-2 sm:py-3 inline-flex items-center justify-center gap-1.5 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-base text-gray-500">
                          Soon
                        </div>
                      )}
                    </div>

                    {/* Product Counter */}
                    <p className="text-gray-500 text-[10px] sm:text-sm">
                      {currentIndex + 1} of {products.length}
                    </p>
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
          className="absolute right-1 sm:right-6 z-20 p-2 sm:p-4 bg-slate-800/90 hover:bg-cyan-500/30 border border-slate-700 hover:border-cyan-500 rounded-full transition-all group shadow-xl"
          data-testid="button-next-product"
        >
          <ChevronRight className="w-5 h-5 sm:w-8 sm:h-8 text-cyan-400 group-hover:text-white transition" />
        </motion.button>
      </section>

      {/* Dot Navigation - Between cards and footer */}
      <div className="relative z-10 flex justify-center gap-2 py-6">
        {products.map((product, index) => (
          <motion.button
            key={product.id}
            onClick={() => setCurrentIndex(index)}
            whileTap={{ scale: 0.9 }}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? `bg-gradient-to-r ${product.color} w-8`
                : 'bg-slate-600 hover:bg-slate-500 w-2.5'
            }`}
            data-testid={`dot-${product.id}`}
            aria-label={`Go to ${product.name}`}
          />
        ))}
      </div>

      {/* ===== SECTION 3: MINIMAL FOOTER ===== */}
      <DarkwaveFooter minimal={true} />

      {/* ===== MODALS ===== */}
      
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

      {/* DarkWave AI Assistant */}
      <DarkWaveAssistant />
    </div>
  );
}
