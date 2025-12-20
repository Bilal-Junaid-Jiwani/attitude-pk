'use client';

import Link from 'next/link';
import Image from 'next/image';
import Marquee from '@/components/ui/Marquee';
import FeaturedPicks from '@/components/home/FeaturedPicks';
import PromotionalSlider from '@/components/home/PromotionalSlider';
import CategorySlider from '@/components/home/CategorySlider';
import SelfCareBanner from '@/components/home/SelfCareBanner';
import CustomerReviews from '@/components/home/CustomerReviews';
import FeaturesBanner from '@/components/home/FeaturesBanner';
import ProductCatalog from '@/components/home/ProductCatalog';

const HeroSection = () => (
  <section className="w-full">
    <div className="relative w-full h-[85vh] overflow-hidden shadow-xl">
      <video
        src="/slider-images/hero.mp4"
        className="w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-black/5" />
    </div>
  </section>
);

export default function Home() {
  return (
    <div className="bg-[#FAF9F6] pb-20">
      {/* Hero Section */}
      <HeroSection />

      {/* Scrolling Ticker */}
      <Marquee />

      {/* Featured Picks with Tabs */}
      <FeaturedPicks />

      {/* Promotional Slider (New) */}
      <PromotionalSlider />

      {/* Categories Section */}
      <section className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-heading font-bold text-gray-900">Browse by Category</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          {/* Baby Category */}
          <Link href="/baby" className="group relative h-[35rem] w-full rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border-4 border-white">
            <div className="absolute inset-0 bg-gray-200">
              <Image
                src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=1200&auto=format&fit=crop"
                alt="Baby Collection"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />
            </div>

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-10 text-white z-10 transition-transform duration-500 group-hover:-translate-y-2">
              <h3 className="text-6xl font-heading font-bold mb-2">Baby</h3>
              <p className="text-xl opacity-90 font-medium mb-6">Gentle care for delicate skin.</p>

              <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-6 py-3 w-fit text-sm font-bold tracking-wider uppercase group-hover:bg-white group-hover:text-primary transition-all">
                Shop Baby
                <ArrowRightIcon size={18} />
              </span>
            </div>
          </Link>

          {/* Kids Category */}
          <Link href="/kids" className="group relative h-[35rem] w-full rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border-4 border-white">
            <div className="absolute inset-0 bg-gray-200">
              <Image
                src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1200&auto=format&fit=crop"
                alt="Kids Collection"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />
            </div>

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-10 text-white z-10 transition-transform duration-500 group-hover:-translate-y-2">
              <h3 className="text-6xl font-heading font-bold mb-2">Kids</h3>
              <p className="text-xl opacity-90 font-medium mb-6">Fun & safe for growing explorers.</p>

              <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-6 py-3 w-fit text-sm font-bold tracking-wider uppercase group-hover:bg-white group-hover:text-primary transition-all">
                Shop Kids
                <ArrowRightIcon size={18} />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* One-Stop Shop Slider */}
      <CategorySlider />

      {/* Self-Care Banner */}
      <SelfCareBanner />

      {/* Full Product Catalog - Dynamic */}
      <ProductCatalog />

      {/* Customer Reviews Section */}
      <CustomerReviews />

      {/* Features Banner */}
      <FeaturesBanner />
    </div>
  );
}

// Arrow Icon Helper
const ArrowRightIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);