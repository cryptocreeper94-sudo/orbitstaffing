import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { ProductSlideshow } from '@/components/ProductSlideshow';
import { slideContent } from '@/data/slideContent';

export default function ProductsGallery() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const products = [
    {
      id: 'ORBIT',
      name: 'ORBIT Staffing OS',
      tagline: '100% Automated Flexible Labor Marketplace',
      description: 'Zero manual intervention staffing platform. GPS-verified check-ins, automated matching, comprehensive payroll with 2025 tax calculations.',
      color: 'from-cyan-500 to-blue-600',
      slides: slideContent.ORBIT,
    },
    {
      id: 'Darkwave Bolt',
      name: 'Darkwave Bolt',
      tagline: 'Lightning-Fast Compliance & Safety Platform',
      description: 'Enterprise-grade safety management. Real-time incident detection, OSHA compliance automation, safety culture analytics.',
      color: 'from-purple-500 to-pink-600',
      slides: slideContent['Darkwave Bolt'],
    },
    {
      id: 'Lot Ops Pro',
      name: 'Lot Ops Pro',
      tagline: 'Smart Inventory & Fleet Operations',
      description: 'Complete inventory and fleet operations. Real-time tracking, maintenance scheduling, utilization analytics.',
      color: 'from-amber-500 to-orange-600',
      slides: slideContent['Lot Ops Pro'],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Darkwave Studios
            </span>
          </h1>
          <p className="text-2xl text-gray-300 mb-4">
            Complete Enterprise Solutions Ecosystem
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Three powerful platforms for staffing, safety, and operations. Built for scale, designed for excellence.
          </p>
        </div>

        {/* Product Cards */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative overflow-hidden rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
              onClick={() => setSelectedProduct(product.id)}
              data-testid={`card-product-${product.id}`}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${product.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

              <div className="relative p-6 h-full flex flex-col">
                {/* Header */}
                <div className="mb-4">
                  <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                  <p className={`text-sm font-semibold bg-gradient-to-r ${product.color} bg-clip-text text-transparent`}>
                    {product.tagline}
                  </p>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm mb-6 flex-grow">
                  {product.description}
                </p>

                {/* Slide count and CTA */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {product.slides.length} slides
                  </span>
                  <button
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${product.color} rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-cyan-500/50 transition transform hover:translate-x-1`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(product.id);
                    }}
                    data-testid={`button-view-${product.id}`}
                  >
                    View Presentation
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Ecosystem Benefits
            </span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Enterprise Grade',
                description: 'Production-ready with 100+ API endpoints, multi-tenant architecture, and enterprise security.',
              },
              {
                title: 'Fully Automated',
                description: 'Zero manual intervention. Background jobs, automated workflows, and intelligent routing.',
              },
              {
                title: 'Completely Customizable',
                description: 'White-label branding, custom workflows, configurable integrations, and scalable licensing.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-cyan-500/50 transition"
              >
                <h4 className="text-lg font-semibold mb-2 text-cyan-300">
                  {feature.title}
                </h4>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slideshow Modal */}
      {selectedProduct && (
        <ProductSlideshow
          productName={selectedProduct}
          slides={slideContent[selectedProduct] || []}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
