import React, { useMemo } from 'react';
import {
  Sparkles,
  Globe,
  Clock,
  Store as StoreIcon,
  ArrowRight,
  ShieldCheck,
  Heart,
  ExternalLink,
  MapPin,
  Layers
} from 'lucide-react';
import { Listing, Storefront, UserProfile } from '../../types';
import { formatPrice } from '../../data/countries';
import { SkeletonListingCard } from '../common/DesignTokens';

interface DiscoveryShowcaseProps {
  listings: Listing[];
  stores: Storefront[];
  favorites: string[];
  currentUser: UserProfile | null;
  displayCurrency: string;
  onSelectListing: (listing: Listing) => void;
  onToggleFavorite: (id: string) => void;
  onViewStore: (store: Storefront) => void;
  onExploreCategory: (categoryId: string) => void;
  onOpenStoreWizard?: () => void;
}

export const DiscoveryShowcase: React.FC<DiscoveryShowcaseProps> = ({
  listings,
  stores,
  favorites,
  currentUser,
  displayCurrency,
  onSelectListing,
  onToggleFavorite,
  onViewStore,
  onExploreCategory,
  onOpenStoreWizard
}) => {
  const activeListings = useMemo(() => {
    return listings.filter((l) => l.status === 'active');
  }, [listings]);

  // 1. Global Finds (items with distinct country origins)
  const globalFinds = useMemo(() => {
    const seenCountries = new Set<string>();
    const diverse: Listing[] = [];
    for (const item of activeListings) {
      if (item.sellerCountry && !seenCountries.has(item.sellerCountry)) {
        seenCountries.add(item.sellerCountry);
        diverse.push(item);
      }
      if (diverse.length >= 4) break;
    }
    return diverse.length > 0 ? diverse : activeListings.slice(0, 4);
  }, [activeListings]);

  // 2. Smart Personalized Discovery (based on real saved items)
  const personalizedListings = useMemo(() => {
    if (favorites.length === 0) return [];
    const favoritedCategories = new Set(
      activeListings.filter((l) => favorites.includes(l.id)).map((l) => l.categoryId)
    );
    if (favoritedCategories.size === 0) return [];
    return activeListings
      .filter((l) => favoritedCategories.has(l.categoryId) && !favorites.includes(l.id))
      .slice(0, 4);
  }, [activeListings, favorites]);

  // 3. Verified Stores to Discover
  const activeStores = useMemo(() => {
    return stores.filter((s) => s.status === 'active').slice(0, 3);
  }, [stores]);

  return (
    <div className="space-y-12 sm:space-y-16">
      
      {/* SECTION 1: SMART PERSONALIZED DISCOVERY (Only when genuine user favorites exist) */}
      {personalizedListings.length > 0 && (
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#4057D6]" />
                <span className="text-[11px] font-mono text-[#4057D6] font-semibold uppercase tracking-wider">
                  Personalized For You
                </span>
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#17191F] tracking-tight">
                Recommended Based On Your Wishlist
              </h2>
            </div>
          </div>

          <div className="novora-card-grid">
            {personalizedListings.map((listing) => (
              <div
                key={listing.id}
                onClick={() => onSelectListing(listing)}
                className="group bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:border-[#17191F] transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-xs"
              >
                <div className="aspect-4/3 w-full bg-[#F3F4F6] relative overflow-hidden">
                  {listing.images && listing.images[0] ? (
                    <img src={listing.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full bg-[#E5E7EB]" />
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(listing.id);
                    }}
                    className="absolute top-2.5 right-2.5 p-2 bg-white/80 hover:bg-white text-[#646B76] rounded-full shadow-xs backdrop-blur-xs transition-colors cursor-pointer"
                    aria-label="Save to favorites"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-[#17191F] truncate group-hover:text-[#4057D6] transition-colors">
                    {listing.title}
                  </h3>
                  <div className="pt-2 border-t border-[#F3F4F6] flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#17191F] tabular-nums">
                      {formatPrice(listing.price, listing.currency)}
                    </span>
                    <span className="text-[11px] text-[#646B76]">{listing.sellerCountry}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2: INDEPENDENT VERIFIED STOREFRONTS */}
      {activeStores.length > 0 && (
        <section className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <StoreIcon className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] font-mono text-emerald-700 font-semibold uppercase tracking-wider">
                  Featured Independent Workshops
                </span>
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#17191F] tracking-tight">
                Curated Artisan Storefronts
              </h2>
            </div>
            {onOpenStoreWizard && (
              <button
                type="button"
                onClick={onOpenStoreWizard}
                className="text-xs text-[#4057D6] hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Launch Your Storefront</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="novora-store-grid">
            {activeStores.map((s) => (
              <div
                key={s.id}
                onClick={() => onViewStore(s)}
                className="group bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden hover:border-[#17191F] transition-all cursor-pointer shadow-2xs hover:shadow-xs flex flex-col justify-between"
              >
                {/* Store Mini Banner */}
                <div className="h-28 w-full bg-linear-to-r from-[#17191F] to-[#2A303C] relative overflow-hidden">
                  {s.bannerUrl ? (
                    <img src={s.bannerUrl} alt="" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 text-xs font-mono">
                      Independent Workshop
                    </div>
                  )}
                  {/* Logo overlay */}
                  <div className="absolute -bottom-5 left-4 w-12 h-12 rounded-xl bg-white p-1 border border-[#E5E7EB] shadow-xs">
                    {s.logoUrl ? (
                      <img src={s.logoUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="w-full h-full bg-[#EEF2FF] text-[#4057D6] flex items-center justify-center font-bold text-sm rounded-lg">
                        {s.storeName.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 sm:p-5 pt-8 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-[#17191F] group-hover:text-[#4057D6] transition-colors truncate">
                      {s.storeName}
                    </h3>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-[#646B76] line-clamp-2 leading-relaxed">
                    {s.tagline || s.description || 'Independent creator on NOVORA.'}
                  </p>
                  <div className="pt-2 border-t border-[#F3F4F6] flex items-center justify-between text-xs text-[#9CA3AF]">
                    <span className="flex items-center gap-1 truncate max-w-[150px]">
                      <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                      <span className="truncate">{s.city ? `${s.city}, ` : ''}{s.country}</span>
                    </span>
                    <span className="text-[#4057D6] font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform shrink-0">
                      <span>Visit Store</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 3: GLOBAL FINDS (Diverse international items) */}
      {globalFinds.length > 0 && (
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#4057D6]" />
                <span className="text-[11px] font-mono text-[#4057D6] font-semibold uppercase tracking-wider">
                  Origin Diversity
                </span>
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#17191F] tracking-tight">
                Global Finds & Cross-Border Craft
              </h2>
            </div>
          </div>

          <div className="novora-card-grid">
            {globalFinds.map((listing) => (
              <div
                key={listing.id}
                onClick={() => onSelectListing(listing)}
                className="group bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:border-[#17191F] transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-xs"
              >
                <div className="aspect-4/3 w-full bg-[#F3F4F6] relative overflow-hidden">
                  {listing.images && listing.images[0] ? (
                    <img src={listing.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full bg-[#E5E7EB]" />
                  )}
                  <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-medium rounded-md flex items-center gap-1 shadow-xs">
                    <MapPin className="w-2.5 h-2.5 text-rose-400" />
                    <span>{listing.sellerCountry}</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(listing.id);
                    }}
                    className="absolute top-2.5 right-2.5 p-2 rounded-full shadow-xs backdrop-blur-xs transition-colors cursor-pointer bg-white/80 hover:bg-white text-[#646B76]"
                    aria-label="Save to favorites"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-[#17191F] truncate group-hover:text-[#4057D6] transition-colors">
                    {listing.title}
                  </h3>
                  <div className="pt-2 border-t border-[#F3F4F6] flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#17191F] tabular-nums">
                      {formatPrice(listing.price, listing.currency)}
                    </span>
                    <span className="text-[11px] text-[#646B76]">{listing.sellerName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
