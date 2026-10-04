import React, { useState } from 'react';
import {
  Search,
  Filter,
  X,
  ArrowUpDown,
  SlidersHorizontal,
  PackageOpen,
  Plus,
  RotateCcw
} from 'lucide-react';
import { Listing } from '../../types';
import { CATEGORIES } from '../../data/categories';
import { COUNTRIES } from '../../data/countries';
import { ListingCard } from '../listings/ListingCard';

interface FeaturedListingsProps {
  listings: Listing[];
  favorites: string[];
  displayCurrency: string;
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  onSelectListing: (listing: Listing) => void;
  onToggleFavorite: (id: string) => void;
  onOpenCreateListing: () => void;
}

export const FeaturedListings: React.FC<FeaturedListingsProps> = ({
  listings,
  favorites,
  displayCurrency,
  selectedCategory,
  onSelectCategory,
  onSelectListing,
  onToggleFavorite,
  onOpenCreateListing
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest');
  const [onlyIntlShipping, setOnlyIntlShipping] = useState(false);
  const [onlyCustomizable, setOnlyCustomizable] = useState(false);
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  // Active listings only
  const activeCatalog = listings.filter(item => item.status === 'active');

  // Filter listings
  const filtered = activeCatalog.filter((item) => {
    if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) {
      return false;
    }

    if (selectedCountry !== 'all' && item.sellerCountry !== selectedCountry) {
      return false;
    }

    if (selectedCondition !== 'all' && item.condition !== selectedCondition) {
      return false;
    }

    if (onlyIntlShipping && !item.shipsInternationally) {
      return false;
    }

    if (onlyCustomizable && !item.allowsCustomization) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchSeller = item.sellerName.toLowerCase().includes(q);
      const matchTag = item.tags?.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchSeller && !matchTag) {
        return false;
      }
    }

    return true;
  });

  // Sort listings
  filtered.sort((a, b) => {
    if (sortBy === 'price_low') return a.price - b.price;
    if (sortBy === 'price_high') return b.price - a.price;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const clearAllFilters = () => {
    setSearchQuery('');
    onSelectCategory('all');
    setSelectedCountry('all');
    setSelectedCondition('all');
    setOnlyIntlShipping(false);
    setOnlyCustomizable(false);
    setSortBy('newest');
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'all' ||
    selectedCountry !== 'all' ||
    selectedCondition !== 'all' ||
    onlyIntlShipping ||
    onlyCustomizable;

  return (
    <section id="discover" className="py-16 bg-[#FAFAF8] border-b border-[#E5E7EB]">
      <div className="max-w-[1440px] mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-semibold text-[#4057D6] uppercase tracking-wider mb-1">
              Marketplace Catalog
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#17191F] tracking-tight">
              Explore Discoveries
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
              className="px-3 py-2 text-xs font-medium bg-white border border-[#E5E7EB] hover:border-[#17191F] rounded-lg transition-colors flex items-center gap-2 text-[#374151] cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters {hasActiveFilters && '●'}</span>
            </button>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs font-medium bg-white border border-[#E5E7EB] rounded-lg text-[#374151] focus:outline-hidden cursor-pointer"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price_low">Sort: Price: Low to High</option>
              <option value="price_high">Sort: Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-3 mb-8 space-y-3">
          
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across titles, descriptions, materials, tags..."
                className="w-full text-xs pl-9 pr-8 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#17191F] focus:border-[#4057D6] focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-[#9CA3AF] hover:text-[#17191F]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Country Dropdown */}
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="text-xs p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#17191F] focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Seller Locations</option>
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Expanded Drawer Filters */}
          {showFiltersDrawer && (
            <div className="pt-3 border-t border-[#E5E7EB] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-[#646B76] mb-1">Item Condition</label>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="w-full text-xs p-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#17191F]"
                >
                  <option value="all">Any Condition</option>
                  <option value="new">Brand New</option>
                  <option value="like_new">Like New</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="not_applicable">Digital / Service</option>
                </select>
              </div>

              <div className="flex flex-col justify-end gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyIntlShipping}
                    onChange={(e) => setOnlyIntlShipping(e.target.checked)}
                    className="rounded border-[#E5E7EB] text-[#4057D6]"
                  />
                  <span className="text-xs text-[#374151]">Ships Internationally</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyCustomizable}
                    onChange={(e) => setOnlyCustomizable(e.target.checked)}
                    className="rounded border-[#E5E7EB] text-[#4057D6]"
                  />
                  <span className="text-xs text-[#374151]">Customizable / Bespoke</span>
                </label>
              </div>

              <div className="flex items-end justify-end">
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-rose-600 hover:underline font-medium cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear All Filters</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Category Tabs (Segmented controls) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 scrollbar-none text-xs">
            <button
              onClick={() => onSelectCategory('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#17191F] text-white shadow-xs'
                  : 'bg-[#F3F4F6] text-[#646B76] hover:text-[#17191F]'
              }`}
            >
              All Categories ({activeCatalog.length})
            </button>
            {CATEGORIES.map(cat => {
              const count = activeCatalog.filter(l => l.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#17191F] text-white shadow-xs'
                      : 'bg-[#F3F4F6] text-[#646B76] hover:text-[#17191F]'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

        </div>

        {/* Listings Grid or Intentional Empty States */}
        {activeCatalog.length === 0 ? (
          // Empty Catalog State: Zero genuine listings exist yet
          <div className="text-center py-20 px-6 bg-white rounded-2xl border border-dashed border-[#E5E7EB] space-y-4 max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#4057D6] flex items-center justify-center mx-auto">
              <PackageOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#17191F]">
                Your Next Discovery Starts Here
              </h3>
              <p className="text-xs text-[#646B76] max-w-md mx-auto mt-1 leading-relaxed">
                No listings have been published to the public marketplace yet. Be the first independent creator, artisan, or seller to publish an offer with $0 platform fees.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={onOpenCreateListing}
                className="px-5 py-2.5 bg-[#17191F] hover:bg-[#27272A] text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Publish the First Listing</span>
              </button>
            </div>
          </div>
        ) : filtered.length > 0 ? (
          // Genuine Listings Found
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isFavorite={favorites.includes(listing.id)}
                displayCurrency={displayCurrency}
                onSelect={onSelectListing}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        ) : (
          // Filtered Empty State
          <div className="text-center py-16 px-6 bg-white rounded-2xl border border-dashed border-[#E5E7EB] space-y-3 max-w-md mx-auto">
            <PackageOpen className="w-8 h-8 text-[#9CA3AF] mx-auto" />
            <h3 className="text-sm font-semibold text-[#17191F]">No matching results</h3>
            <p className="text-xs text-[#646B76] leading-relaxed">
              No active listings match your current filters. Try changing your search query, location, or clearing constraints.
            </p>
            <div className="pt-2">
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-[#17191F] text-white text-xs font-medium rounded-lg hover:bg-[#27272A] transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
