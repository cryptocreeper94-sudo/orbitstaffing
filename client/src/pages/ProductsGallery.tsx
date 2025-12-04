import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductSlideshow } from '@/components/ProductSlideshow';
import { HomeSlideshow } from '@/components/HomeSlideshow';
import { DarkwaveFooter } from '@/components/DarkwaveFooter';
import { slideContent } from '@/data/slideContent';
import { slidesData, orbitSlides, brewAndBoardSlides } from '@/data/slidesData';

export default function ProductsGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [showSlideshow, setShowSlideshow] = useState<string | null>(null);

  const products = [
    {
      id: 'ORBIT',
      name: 'ORBIT Staffing OS',
      tagline: '100% Automated Flexible Labor Marketplace',
      description: 'Zero manual intervention staffing platform. GPS-verified check-ins, automated matching, comprehensive payroll with 2025 tax calculations.',
      color: 'from-cyan-500 to-blue-600',
      slides: slideContent.ORBIT,
      slideshowData: orbitSlides,
    },
    {
      id: 'DarkWave Pulse',
      name: 'DarkWave Pulse',
      tagline: 'Lightning-Fast Compliance & Safety Platform',
      description: 'Enterprise-grade safety management. Real-time incident detection, OSHA compliance automation, safety culture analytics.',
      color: 'from-purple-500 to-pink-600',
      slides: slideContent['DarkWave Pulse'],
      slideshowData: null,
    },
    {
      id: 'Lot Ops Pro',
      name: 'Lot Ops Pro',
      tagline: 'Smart Inventory & Fleet Operations',
      description: 'Complete inventory and fleet operations. Real-time tracking, maintenance scheduling, utilization analytics.',
      color: 'from-amber-500 to-orange-600',
      slides: slideContent['Lot Ops Pro'],
      slideshowData: slidesData,
    },
    {
      id: 'BrewAndBoard',
      name: 'Brew & Board Coffee',
      tagline: 'B2B Coffee Delivery for Nashville Businesses',
      description: 'Connect businesses with Nashville coffee shops for pre-meeting deliveries. Features 20+ vendors, calendar scheduling, distance-based pricing, and blockchain-verified receipts.',
      color: 'from-stone-800 to-amber-950',
      slides: slideContent['BREW_AND_BOARD'],
      slideshowData: brewAndBoardSlides,
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
      {/* Twinkling Stars Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
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
        {[...Array(20)].map((_, i) => (
          <div
            key={`big-${i}`}
            className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient Orbs */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-12 pb-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Darkwave Studios
          </span>
        </h1>
        <p className="text-xl text-gray-300 mb-2">
          Complete Enterprise Solutions Ecosystem
        </p>
        <p className="text-gray-500 text-sm">
          {currentIndex + 1} of {products.length} Products
        </p>
      </div>

      {/* Carousel Container */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 min-h-[60vh]">
        {/* Left Arrow */}
        <button
          onClick={prevProduct}
          className="absolute left-4 md:left-8 z-20 p-3 md:p-4 bg-slate-800/80 hover:bg-cyan-500/30 border border-slate-700 hover:border-cyan-500 rounded-full transition-all duration-300 group"
          data-testid="button-prev-product"
        >
          <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-cyan-400 group-hover:text-white transition" />
        </button>

        {/* Product Card */}
        <div className="w-full max-w-2xl mx-auto px-12 md:px-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentProduct.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div
                className={`relative overflow-hidden rounded-2xl bg-slate-800/70 backdrop-blur-sm border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer`}
                onClick={() => setSelectedProduct(currentProduct.id)}
                data-testid={`card-product-${currentProduct.id}`}
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${currentProduct.color} opacity-10`} />

                <div className="relative p-8 md:p-12">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">{currentProduct.name}</h2>
                    <p className={`text-lg md:text-xl font-semibold bg-gradient-to-r ${currentProduct.color} bg-clip-text text-transparent`}>
                      {currentProduct.tagline}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-center text-lg mb-8 max-w-xl mx-auto">
                    {currentProduct.description}
                  </p>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                      className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${currentProduct.color} rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-cyan-500/30 transition transform hover:scale-105`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(currentProduct.id);
                      }}
                      data-testid={`button-view-presentation-${currentProduct.id}`}
                    >
                      View Presentation
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    
                    {currentProduct.slideshowData && (
                      <button
                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700/80 hover:bg-slate-600 border border-slate-600 rounded-xl font-semibold text-sm transition transform hover:scale-105"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSlideshow(currentProduct.id);
                        }}
                        data-testid={`button-view-slideshow-${currentProduct.id}`}
                      >
                        Full Slideshow
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Slide count */}
                  <p className="text-center text-gray-500 text-sm mt-6">
                    {currentProduct.slides.length} slides available
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Arrow */}
        <button
          onClick={nextProduct}
          className="absolute right-4 md:right-8 z-20 p-3 md:p-4 bg-slate-800/80 hover:bg-cyan-500/30 border border-slate-700 hover:border-cyan-500 rounded-full transition-all duration-300 group"
          data-testid="button-next-product"
        >
          <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-cyan-400 group-hover:text-white transition" />
        </button>
      </div>

      {/* Dot Navigation */}
      <div className="relative z-10 flex justify-center gap-3 pb-8">
        {products.map((product, index) => (
          <button
            key={product.id}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-cyan-400 w-8'
                : 'bg-slate-600 hover:bg-slate-500'
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
      <DarkwaveFooter product="Darkwave Studios Ecosystem" />
    </div>
  );
}
