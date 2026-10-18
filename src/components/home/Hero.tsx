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

  const handleNeedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!needQuery.trim()) {
      onExploreMarketplace();
      return;
    }
    onSearchNeed(needQuery.trim());
  };

  const featuredRealListing = listings.find((l) => l.status === 'active');

  return (
    <section className="relative pt-8 sm:pt-12 pb-12 sm:pb-16 overflow-hidden bg-gradient-to-b from-[#F7F5F0] via-[#FFFFFF] to-[#F7F5F0] border-b border-[#E2DFD8]">
      <div className="novora-container relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Restrained Editorial Headline & Search (7 cols on lg+) */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7F3EB] text-[#8E6D38] text-xs font-medium border border-[#E8DAC2] max-w-full truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A572] shrink-0" />
              <span className="truncate">Global Multi-Category Discovery Marketplace</span>
            </div>

            <h1 className="text-fluid-hero font-semibold tracking-tight text-[#14243A] text-balance">
              Find What You Need. Discover What You Didn't Know Existed.
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-[#5A6578] max-w-xl leading-relaxed font-normal">
              Explore products, services, independent makers, and custom sourcing opportunities worldwide with zero platform commission markups.
            </p>

            {/* Need-Based Search Form */}
            <div className="pt-1 max-w-xl">
              <form
                onSubmit={handleNeedSubmit}
                className="bg-white border border-[#E2DFD8] focus-within:border-[#14243A] focus-within:ring-2 focus-within:ring-[#C5A572]/20 rounded-2xl p-1.5 sm:p-2 shadow-xs transition-all flex flex-col sm:flex-row items-stretch gap-2"
              >
                <div className="flex-1 flex items-center gap-2 px-3 py-1.5 min-w-0">
                  <Search className="w-4 h-4 text-[#8A94A6] shrink-0" />
                  <input
                    type="text"
                    value={needQuery}
                    onChange={(e) => setNeedQuery(e.target.value)}
                    placeholder="Search by materials, category, or natural need..."
                    className="w-full text-xs sm:text-sm bg-transparent border-none text-[#14243A] placeholder:text-[#8A94A6] focus:outline-hidden"
                  />
                  {needQuery && (
                    <button
                      type="button"
                      onClick={() => setNeedQuery('')}
                      className="text-[#8A94A6] hover:text-[#14243A] p-1"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#14243A] hover:bg-[#0E1B2D] text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors shrink-0 shadow-xs cursor-pointer active:scale-[0.98]"
                >
                  <span>Search Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C5A572]" />
                </button>
              </form>

              {/* Category jump links */}
              <div className="mt-3 flex items-center gap-1.5 overflow-x-auto text-xs text-[#5A6578] pb-1 scrollbar-none">
                <span className="shrink-0 text-[11px] font-medium text-[#8A94A6]">Jump to:</span>
                {CATEGORIES.slice(0, 5).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onSelectCategory(cat.id)}
                    className="shrink-0 px-2 py-0.5 rounded-md hover:bg-[#F7F5F0] hover:text-[#14243A] text-[11px] transition-colors cursor-pointer"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onExploreMarketplace}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#14243A] hover:bg-[#0E1B2D] text-white text-xs font-medium transition-colors cursor-pointer shadow-xs text-center active:scale-[0.98]"
              >
                Explore Marketplace
              </button>
              <button
                type="button"
                onClick={onPostRequest}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white border border-[#E2DFD8] hover:border-[#14243A] text-[#14243A] hover:bg-[#F7F5F0] text-xs font-medium transition-colors cursor-pointer text-center active:scale-[0.98]"
              >
                Post a Request
              </button>
            </div>

          </div>

          {/* Right Column: Genuine Data-Driven Spotlight Card (5 cols on lg+) */}
          <div className="lg:col-span-5 max-w-md mx-auto lg:max-w-none w-full">
            {featuredRealListing ? (
              <div
                onClick={() => onSelectListing(featuredRealListing)}
                className="group bg-white rounded-2xl border border-[#E2DFD8] shadow-xs hover:shadow-md transition-all cursor-pointer p-4 sm:p-5 space-y-3.5"
              >
                <div className="aspect-4/3 rounded-xl overflow-hidden bg-[#EFECE5] relative">
                  {featuredRealListing.images && featuredRealListing.images[0] ? (
                    <img
                      src={featuredRealListing.images[0]}
                      alt={featuredRealListing.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                      <Package className="w-10 h-10 text-[#8A94A6] mb-2" />
                      <span className="text-xs text-[#5A6578] font-medium">{featuredRealListing.title}</span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3 bg-[#14243A]/90 text-white backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-medium shadow-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A572]" />
                    <span>Spotlight Listing</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#8E6D38]">
                      {CATEGORIES.find((c) => c.id === featuredRealListing.categoryId)?.name || 'Featured'}
                    </span>
                    <span className="text-sm font-bold font-mono text-[#14243A] tabular-nums">
                      {formatPrice(featuredRealListing.price, featuredRealListing.currency)}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-[#14243A] group-hover:text-[#283548] transition-colors line-clamp-1">
                    {featuredRealListing.title}
                  </h3>

                  <p className="text-xs text-[#5A6578] line-clamp-2 leading-relaxed">
                    {featuredRealListing.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#EFECE5] flex items-center justify-between text-xs text-[#5A6578]">
                  <span>by {featuredRealListing.sellerName}</span>
                  <span className="text-[#14243A] group-hover:text-[#8E6D38] font-medium group-hover:translate-x-0.5 transition-all flex items-center gap-1">
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3 text-[#C5A572]" />
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-[#E2DFD8] p-8 text-center space-y-4 shadow-2xs">
                <div className="w-12 h-12 rounded-xl bg-[#F7F3EB] text-[#C5A572] flex items-center justify-center mx-auto border border-[#E8DAC2]">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#14243A]">Independent Community</h3>
                  <p className="text-xs text-[#5A6578] mt-1 leading-relaxed">
                    A direct marketplace for physical craftspeople, digital studios, and service providers.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onPostRequest}
                  className="px-4 py-2 bg-[#14243A] text-white text-xs font-medium rounded-xl hover:bg-[#0E1B2D] transition-colors cursor-pointer active:scale-[0.98]"
                >
                  Post First Request
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
