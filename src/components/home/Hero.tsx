import React, { useState } from 'react';
import {
  Compass,
  Search,
  ArrowRight,
  ShieldCheck,
  Globe,
  Sparkles,
  X,
  Package,
  Plus
} from 'lucide-react';
import { Listing } from '../../types';
import { formatPrice, getCountryByCode } from '../../data/countries';
import { CATEGORIES } from '../../data/categories';

interface HeroProps {
  listings: Listing[];
  onSearchNeed: (query: string) => void;
  onExploreMarketplace: () => void;
  onPostRequest: () => void;
  onSelectListing: (listing: Listing) => void;
  onSelectCategory: (categoryId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  listings,
  onSearchNeed,
  onExploreMarketplace,
  onPostRequest,
  onSelectListing,
  onSelectCategory
}) => {
  const [needQuery, setNeedQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  const handleNeedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!needQuery.trim()) {
      onExploreMarketplace();
      return;
    }
    onSearchNeed(needQuery.trim());
  };

  const featuredRealListing = listings.find(l => l.status === 'active');

  return (
    <section className="relative pt-12 pb-16 overflow-hidden bg-gradient-to-b from-[#FAFAF8] via-[#FFFFFF] to-[#FAFAF8] border-b border-[#E5E7EB]">
      <div className="max-w-[1440px] mx-auto px-6 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Restrained Editorial Headline & Search (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF2FF] text-[#4057D6] text-xs font-medium border border-[#E0E7FF]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4057D6]" />
              <span>Global Multi-Category Discovery Marketplace</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#17191F] leading-[1.12] text-balance">
              Find What You Need. Discover What You Didn't Know Existed.
            </h1>

            <p className="text-base sm:text-lg text-[#646B76] max-w-xl leading-relaxed font-normal">
              Explore products, services, independent sellers, and opportunities from around the world without platform commission markups.
            </p>

            {/* Need-Based Search Form */}
            <div className="pt-2 max-w-xl">
              <form
                onSubmit={handleNeedSubmit}
                className="bg-white border border-[#E5E7EB] focus-within:border-[#4057D6] focus-within:ring-2 focus-within:ring-[#4057D6]/10 rounded-xl p-2 shadow-xs transition-all flex flex-col sm:flex-row items-stretch gap-2"
              >
                <div className="flex-1 flex items-center gap-2 px-3 py-1.5">
                  <Search className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                  <input
                    type="text"
                    value={needQuery}
                    onChange={(e) => setNeedQuery(e.target.value)}
                    placeholder="Search by keywords, materials, category, or natural need..."
                    className="w-full text-xs sm:text-sm bg-transparent border-none text-[#17191F] placeholder:text-[#9CA3AF] focus:outline-hidden"
                  />
                  {needQuery && (
                    <button
                      type="button"
                      onClick={() => setNeedQuery('')}
                      className="text-[#9CA3AF] hover:text-[#17191F] p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#17191F] hover:bg-[#27272A] text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors shrink-0 shadow-xs cursor-pointer"
                >
                  <span>Search Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Category jump links */}
              <div className="mt-3 flex items-center gap-1.5 overflow-x-auto text-xs text-[#646B76] pb-1 scrollbar-none">
                <span className="shrink-0 text-[11px] font-medium text-[#646B76]">Jump to:</span>
                {CATEGORIES.slice(0, 4).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onSelectCategory(cat.id)}
                    className="shrink-0 px-2 py-0.5 rounded-md hover:bg-[#F3F4F6] hover:text-[#17191F] text-[11px] transition-colors cursor-pointer"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onExploreMarketplace}
                className="px-5 py-2.5 rounded-lg bg-[#17191F] hover:bg-[#27272A] text-white text-xs font-medium transition-colors cursor-pointer shadow-xs"
              >
                Explore Marketplace
              </button>
              <button
                onClick={onPostRequest}
                className="px-5 py-2.5 rounded-lg bg-white border border-[#E5E7EB] hover:border-[#17191F] text-[#17191F] text-xs font-medium transition-colors cursor-pointer"
              >
                Post a Request
              </button>
            </div>

          </div>

          {/* Right Column: Genuine Data-Driven Spotlight Card (5 cols) */}
          <div className="lg:col-span-5">
            {featuredRealListing ? (
              <div
                onClick={() => onSelectListing(featuredRealListing)}
                className="group bg-white rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all cursor-pointer p-4 space-y-3"
              >
                <div className="aspect-4/3 rounded-xl overflow-hidden bg-[#F3F4F6] relative">
                  {featuredRealListing.images && featuredRealListing.images[0] ? (
                    <img
                      src={featuredRealListing.images[0]}
                      alt={featuredRealListing.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                      <Package className="w-10 h-10 text-[#9CA3AF] mb-2" />
                      <span className="text-xs text-[#646B76] font-medium">{featuredRealListing.title}</span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-medium text-[#17191F] shadow-xs">
                    Recently Published
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-[#646B76]">
                    <span>
                      {getCountryByCode(featuredRealListing.sellerCountry)?.flag} {featuredRealListing.sellerCity || featuredRealListing.sellerCountry}
                    </span>
                    <span className="font-mono font-semibold text-[#17191F] text-sm tabular-nums">
                      {formatPrice(featuredRealListing.price, featuredRealListing.currency)}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#17191F] group-hover:text-[#4057D6] transition-colors line-clamp-1">
                    {featuredRealListing.title}
                  </h3>
                  <p className="text-xs text-[#646B76] line-clamp-2 leading-relaxed">
                    {featuredRealListing.description}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 space-y-6 shadow-xs">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4057D6] flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-[#17191F]">
                    Your Next Discovery Starts Here
                  </h3>
                  <p className="text-xs text-[#646B76] leading-relaxed">
                    NOVORA is an open, multi-category global marketplace built for direct trade. Discover new artisan creations, vintage rarities, digital products, and independent services without platform commissions.
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E5E7EB] space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-[#374151]">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>$0 Listing Fees · 100% Free Initial Platform</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#374151]">
                    <Sparkles className="w-4 h-4 text-[#4057D6] shrink-0" />
                    <span>16+ Distinct Category Specializations</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#374151]">
                    <Compass className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Need-Based Discovery & Buyer Request Orbit</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onPostRequest}
                    className="w-full py-2.5 text-xs font-medium text-[#17191F] bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#4057D6]" />
                    <span>Post the First Buyer Request</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
