'use client';

import Link from 'next/link';
import Image from 'next/image';
import Marquee from '@/components/ui/Marquee';
import FeaturedPicks from '@/components/home/FeaturedPicks';
import PromotionalSlider from '@/components/home/PromotionalSlider';
import CategorySection from '@/components/home/CategorySection';
import CategorySlider from '@/components/home/CategorySlider';
import SelfCareBanner from '@/components/home/SelfCareBanner';
import CustomerReviews from '@/components/home/CustomerReviews';
import FeaturesBanner from '@/components/home/FeaturesBanner';
// import ProductCatalog from '@/components/home/ProductCatalog';

const HeroSection = () => (
  <section className="w-full overflow-hidden">
    <div className="relative w-full h-[85vh] overflow-hidden shadow-xl">
      <video
        src="https://res.cloudinary.com/dg89ktcrg/video/upload/q_auto:good/v1767589109/hero_xd7ymu.mp4"
        poster="https://res.cloudinary.com/dg89ktcrg/video/upload/so_0,f_jpg,q_80/v1767589109/hero_xd7ymu.jpg"
        className="w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />
      <div className="absolute inset-0 bg-black/5" />
    </div>
  </section>
);

export default function Home() {
  return (
    <div className="bg-[#FAF9F6] pb-20 overflow-x-hidden">
      {/* Hero Section */}
      <HeroSection />

      {/* Scrolling Ticker */}
      <Marquee />

      {/* Featured Picks with Tabs */}
      <FeaturedPicks />

      {/* Promotional Slider (New) */}
      <PromotionalSlider />

      {/* Categories Section */}
      <CategorySection />

      {/* One-Stop Shop Slider */}
      <CategorySlider />

      {/* Self-Care Banner */}
      <SelfCareBanner />

      {/* Full Product Catalog - Removed per user request */}
      {/* <ProductCatalog /> */}

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