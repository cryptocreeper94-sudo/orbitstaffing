import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ExternalLink, Sparkles, Play, Menu, Settings, Home, Mail, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductSlideshow } from '@/components/ProductSlideshow';
import { HomeSlideshow } from '@/components/HomeSlideshow';
import { DarkwaveFooter } from '@/components/DarkwaveFooter';
import { slideContent } from '@/data/slideContent';
import { slidesData, orbitSlides, brewAndBoardSlides, orbySlides } from '@/data/slidesData';
import { QRCodeSVG } from 'qrcode.react';
import { BentoGrid, BentoTile } from '@/components/ui/bento-grid';
import { CarouselRail } from '@/components/ui/carousel-rail';
import { SectionHeader, PageHeader } from '@/components/ui/section-header';
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardDescription, OrbitCardContent, OrbitCardFooter } from '@/components/ui/orbit-card';
import orbyMascot from '@assets/generated_images/orby_mascot_presenting_pose.png';
import orbyEmblem from '@assets/Screenshot_20251205_100035_Replit_1764952065470.jpg';
import orbyHallmark from '@assets/Screenshot_20251205_154312_Replit_1764971077009.jpg';
import lotOpsEmblem from '@assets/Screenshot_20251205_080335_Replit_1764943504222.jpg';
import lotOpsHallmark from '@assets/Screenshot_20251205_092457_Replit_1764949322382.jpg';
import brewBoardEmblem from '@assets/brew_board_emblem.png';
import brewBoardHallmark from '@assets/Screenshot_20251205_135345_Replit_1764964534831.jpg';
import garageBotEmblem from '@assets/garagebot_emblem.png';
import garageBotHallmark from '@assets/Screenshot_20251205_150630_Chrome_1764968855422.jpg';
import darkwaveStudiosBrand from '@assets/darkwave_studios_hallmark.png';

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
      description: 'Zero manual intervention staffing platform with GPS-verified check-ins, automated matching, comprehensive payroll, and CRM with Meeting Presentation Builder. Complete workforce management from recruitment to payment with blockchain-verified credentials and real-time compliance tracking.',
      color: 'from-cyan-500 to-blue-600',
      glowColor: 'cyan',
      slides: slideContent.ORBIT,
      slideshowData: orbitSlides,
      url: 'https://orbitstaffing.io',
      emblem: orbyMascot,
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
      emblem: orbyEmblem,
      hallmark: orbyHallmark,
    },
    {
      id: 'Pulse',
      name: 'Pulse',
      tagline: 'Predictive AI Market Intelligence',
      hasPulseAnimation: true,
      description: 'AI-powered crypto market analysis using wave pattern recognition and predictive coding. Analyzes market trends to help traders understand what they\'re dealing with. Not financial advice - for informational purposes only.',
      color: 'from-purple-500 to-pink-600',
      glowColor: 'purple',
      slides: slideContent['DarkWave Pulse'],
      slideshowData: null,
      url: 'https://darkwavepulse.com',
      emblem: darkwaveStudiosBrand,
      hallmark: darkwaveStudiosBrand,
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
      url: 'https://lotopspro.com',
      emblem: lotOpsEmblem,
      hallmark: lotOpsHallmark,
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
      emblem: brewBoardEmblem,
      hallmark: brewBoardHallmark,
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
      emblem: garageBotEmblem,
      hallmark: garageBotHallmark,
    },
  ];

  const nextProduct = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const prevProduct = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const currentProduct = products[currentIndex];

  const ProductCard = ({ product, isActive = false }: { product: typeof products[0], isActive?: boolean }) => (
    <OrbitCard 
      variant="glass" 
      hover={true}
      className={`relative ${isActive ? 'ring-2 ring-cyan-500/50' : ''}`}
      data-testid={`card-product-${product.id}`}
    >
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${product.color} rounded-xl blur opacity-20`} />
      <div className="relative">
        <OrbitCardHeader
          icon={
            <div className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl bg-gradient-to-br ${product.color} p-0.5`}>
              {product.emblem ? (
                <img 
                  src={product.emblem} 
                  alt={product.name}
                  className="w-full h-full rounded-lg object-contain bg-slate-800 p-1"
                />
              ) : (
                <div className="w-full h-full rounded-lg bg-slate-800 flex items-center justify-center text-xl font-bold text-white">
                  {product.name.charAt(0)}
                </div>
              )}
            </div>
          }
        >
          <OrbitCardTitle>
            {product.hasPulseAnimation ? (
              <span className="relative inline-block">
                <span>{product.name}</span>
                <span 
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"
                  style={{
                    animation: 'pulseLineMove 1.5s ease-in-out infinite',
                    willChange: 'transform',
                  }}
                />
              </span>
            ) : product.name}
          </OrbitCardTitle>
          <OrbitCardDescription className={`font-medium bg-gradient-to-r ${product.color} bg-clip-text text-transparent`}>
            {product.tagline}
          </OrbitCardDescription>
        </OrbitCardHeader>

        <OrbitCardContent>
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed line-clamp-3">
            {product.description}
          </p>
        </OrbitCardContent>

        <OrbitCardFooter className="flex-col sm:flex-row gap-3">
          <div className="flex flex-col items-center shrink-0">
            <span className="text-[8px] sm:text-[10px] text-gray-500 uppercase mb-1">Verified</span>
            {product.hallmark ? (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border border-cyan-500/30 overflow-hidden bg-slate-800">
                <img src={product.hallmark} alt="Hallmark" className="w-full h-full object-contain" />
              </div>
            ) : product.url ? (
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-lg p-1">
                <QRCodeSVG value={product.url} size={40} className="w-full h-full" bgColor="#fff" fgColor="#0f172a" />
              </div>
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-slate-800 flex items-center justify-center text-[8px] text-gray-500">Soon</div>
            )}
          </div>

          <div className="flex flex-col gap-2 flex-1">
            <button
              onClick={() => setSelectedProduct(product.id)}
              className={`px-4 py-2 bg-gradient-to-r ${product.color} rounded-lg font-semibold text-xs sm:text-sm flex items-center gap-1.5 justify-center shadow-lg`}
              data-testid={`button-slideshow-${product.id}`}
            >
              <Play className="w-3 h-3 sm:w-4 sm:h-4" /> Slideshow
            </button>
            {product.url ? (
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg font-semibold text-xs sm:text-sm flex items-center gap-1.5 justify-center"
                data-testid={`button-visit-${product.id}`}
              >
                Visit <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
              </a>
            ) : (
              <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs sm:text-sm text-gray-500 text-center">Coming Soon</span>
            )}
          </div>
        </OrbitCardFooter>
      </div>
    </OrbitCard>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
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

      <header className="relative z-20 py-3 px-4 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm sm:text-base font-medium text-slate-300">darkwavestudios.io</span>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">v2.7.0</span>
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
          
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-slate-400 hover:text-cyan-400 transition rounded-lg hover:bg-slate-800/50"
            data-testid="button-menu-toggle"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
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
                <a href="/developer-hq" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-cyan-400 transition">
                  <Settings className="w-4 h-4" />
                  Developer HQ
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
                  Version v2.7.0 • Solana Verified
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="relative z-10 pt-6 pb-4 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-4"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-cyan-300 uppercase tracking-widest font-semibold">Enterprise Solutions</span>
          <Sparkles className="w-4 h-4 text-cyan-400" />
        </motion.div>
        <h1 className="text-2xl sm:text-4xl md:text-5xl">
          <span 
            className="font-extralight tracking-[0.1em] sm:tracking-[0.3em] uppercase"
            style={{
              background: 'linear-gradient(135deg, #4a5568 0%, #667eea 25%, #7c3aed 50%, #667eea 75%, #4a5568 100%)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 0 60px rgba(6, 182, 212, 0.8), 0 0 100px rgba(139, 92, 246, 0.6)',
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

      <section className="relative z-10 flex-1 md:hidden px-4 py-4">
        <CarouselRail
          showArrows={true}
          arrowsOnMobile={true}
          gap="md"
          itemWidth="lg"
        >
          {products.map((product) => (
            <div key={product.id} className="min-w-[300px] max-w-[320px]">
              <ProductCard product={product} isActive={product.id === currentProduct.id} />
            </div>
          ))}
        </CarouselRail>
      </section>

      <section className="relative z-10 flex-1 hidden md:flex items-center justify-center py-6">
        <button
          onClick={prevProduct}
          className="absolute left-2 sm:left-8 z-30 p-2 sm:p-3 bg-black/60 hover:bg-cyan-500/40 border border-cyan-500/50 rounded-full transition-all shadow-lg"
          data-testid="button-prev-product"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
        </button>

        <div className="w-[calc(100%-5rem)] max-w-xs sm:max-w-lg lg:max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentProduct.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <ProductCard product={currentProduct} isActive={true} />
              <p className="text-center text-gray-500 text-[10px] sm:text-xs mt-3">{currentIndex + 1} / {products.length}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          onClick={nextProduct}
          className="absolute right-2 sm:right-8 z-30 p-2 sm:p-3 bg-black/60 hover:bg-cyan-500/40 border border-cyan-500/50 rounded-full transition-all shadow-lg"
          data-testid="button-next-product"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
        </button>
      </section>

      <div className="relative z-10 hidden md:flex justify-center gap-2 py-3">
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

      <DarkwaveFooter minimal={true} />

      {selectedProduct && (
        <ProductSlideshow
          productName={selectedProduct}
          slides={slideContent[selectedProduct] || []}
          onClose={() => setSelectedProduct(null)}
        />
      )}

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

    </div>
  );
}
