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
    <section className="relative pt-8 sm:pt-12 pb-12 sm:pb-16 overflow-hidden bg-gradient-to-b from-[#FAFAF8] via-[#FFFFFF] to-[#FAFAF8] border-b border-[#E5E7EB]">
      <div className="novora-container relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Restrained Editorial Headline & Search (7 cols on lg+) */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF2FF] text-[#4057D6] text-xs font-medium border border-[#E0E7FF] max-w-full truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4057D6] shrink-0" />
              <span className="truncate">Global Multi-Category Discovery Marketplace</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-[#17191F] leading-[1.14] text-balance">
              Find What You Need. Discover What You Didn't Know Existed.
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-[#646B76] max-w-xl leading-relaxed font-normal">
              Explore products, services, independent makers, and custom sourcing opportunities worldwide with zero platform commission markups.
            </p>

            {/* Need-Based Search Form */}
            <div className="pt-1 max-w-xl">
              <form
                onSubmit={handleNeedSubmit}
                className="bg-white border border-[#E5E7EB] focus-within:border-[#4057D6] focus-within:ring-2 focus-within:ring-[#4057D6]/10 rounded-2xl p-1.5 sm:p-2 shadow-xs transition-all flex flex-col sm:flex-row items-stretch gap-2"
              >
                <div className="flex-1 flex items-center gap-2 px-3 py-1.5 min-w-0">
                  <Search className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                  <input
                    type="text"
                    value={needQuery}
                    onChange={(e) => setNeedQuery(e.target.value)}
                    placeholder="Search by materials, category, or natural need..."
                    className="w-full text-xs sm:text-sm bg-transparent border-none text-[#17191F] placeholder:text-[#9CA3AF] focus:outline-hidden"
                  />
                  {needQuery && (
                    <button
                      type="button"
                      onClick={() => setNeedQuery('')}
                      className="text-[#9CA3AF] hover:text-[#17191F] p-1"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#17191F] hover:bg-[#27272A] text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors shrink-0 shadow-xs cursor-pointer active:scale-[0.98]"
                >
                  <span>Search Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Category jump links */}
              <div className="mt-3 flex items-center gap-1.5 overflow-x-auto text-xs text-[#646B76] pb-1 scrollbar-none">
                <span className="shrink-0 text-[11px] font-medium text-[#646B76]">Jump to:</span>
                {CATEGORIES.slice(0, 5).map((cat) => (
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
                type="button"
                onClick={onExploreMarketplace}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#17191F] hover:bg-[#27272A] text-white text-xs font-medium transition-colors cursor-pointer shadow-xs text-center"
              >
                Explore Marketplace
              </button>
              <button
                type="button"
                onClick={onPostRequest}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#17191F] text-[#17191F] text-xs font-medium transition-colors cursor-pointer text-center"
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
                className="group bg-white rounded-2xl border border-[#E5E7EB] shadow-xs hover:shadow-md transition-all cursor-pointer p-4 sm:p-5 space-y-3.5"
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

                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-medium text-[#17191F] shadow-xs">
                    Spotlight Listing
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#4057D6]">
                      {CATEGORIES.find((c) => c.id === featuredRealListing.categoryId)?.name || 'Featured'}
                    </span>
                    <span className="text-sm font-bold font-mono text-[#17191F] tabular-nums">
                      {formatPrice(featuredRealListing.price, featuredRealListing.currency)}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-[#17191F] group-hover:text-[#4057D6] transition-colors line-clamp-1">
                    {featuredRealListing.title}
                  </h3>

                  <p className="text-xs text-[#646B76] line-clamp-2 leading-relaxed">
                    {featuredRealListing.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#F3F4F6] flex items-center justify-between text-xs text-[#646B76]">
                  <span>by {featuredRealListing.sellerName}</span>
                  <span className="text-[#4057D6] font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-8 text-center space-y-4 shadow-2xs">
                <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] text-[#4057D6] flex items-center justify-center mx-auto">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#17191F]">Independent Community</h3>
                  <p className="text-xs text-[#646B76] mt-1 leading-relaxed">
                    A direct marketplace for physical craftspeople, digital studios, and service providers.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onPostRequest}
                  className="px-4 py-2 bg-[#17191F] text-white text-xs font-medium rounded-xl hover:bg-[#27272A] transition-colors cursor-pointer"
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
