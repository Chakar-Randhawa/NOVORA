import React from 'react';
import { Globe, ArrowRight, ShieldCheck, Plus, Sparkles, Store } from 'lucide-react';
import { UserProfile, Listing } from '../../types';
import { getCountryByCode } from '../../data/countries';

interface SellerSpotlightProps {
  sellers: UserProfile[];
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
  onFilterBySellerCountry: (countryCode: string) => void;
  onOpenCreateListing: () => void;
}

export const SellerSpotlight: React.FC<SellerSpotlightProps> = ({
  sellers,
  listings,
  onSelectListing,
  onFilterBySellerCountry,
  onOpenCreateListing
}) => {
  // Only sellers with active listings
  const activeSellersWithListings = sellers.filter(s =>
    listings.some(l => l.sellerId === s.id && l.status === 'active')
  );

  return (
    <section id="local-finds" className="py-16 bg-[#FAFAF8] border-b border-[#E5E7EB]">
      <div className="max-w-[1440px] mx-auto px-6">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-semibold text-[#4057D6] uppercase tracking-wider mb-1">
              Independent Trade
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#17191F] tracking-tight">
              Seller & Creator Community
            </h2>
          </div>
          <p className="text-xs text-[#646B76] max-w-md leading-relaxed">
            Connect directly with verified independent creators, studios, and small business owners worldwide.
          </p>
        </div>

        {activeSellersWithListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeSellersWithListings.slice(0, 3).map((seller) => {
              const country = getCountryByCode(seller.country);
              const sellerListings = listings.filter(l => l.sellerId === seller.id && l.status === 'active');

              return (
                <div
                  key={seller.id}
                  className="bg-white rounded-xl border border-[#E5E7EB] p-5 flex flex-col justify-between space-y-4 hover:shadow-xs transition-all"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-[#17191F] text-white font-medium flex items-center justify-center text-sm">
                        {seller.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[#17191F]">{seller.name}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-[#646B76]">
                          <span>{country?.flag}</span>
                          <span>{seller.city || country?.name || seller.country}</span>
                        </div>
                      </div>
                    </div>

                    {seller.sellerTagline && (
                      <p className="text-xs font-medium text-[#4057D6] mb-2">
                        {seller.sellerTagline}
                      </p>
                    )}

                    {seller.bio && (
                      <p className="text-xs text-[#646B76] leading-relaxed line-clamp-3">
                        {seller.bio}
                      </p>
                    )}
                  </div>

                  {sellerListings.length > 0 && (
                    <div className="pt-3 border-t border-[#F3F4F6] space-y-2">
                      <span className="text-[11px] font-medium text-[#646B76] uppercase tracking-wider block">
                        Offerings ({sellerListings.length})
                      </span>
                      <div className="flex gap-2">
                        {sellerListings.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            onClick={() => onSelectListing(item)}
                            className="w-14 h-14 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] overflow-hidden cursor-pointer hover:opacity-85 transition-opacity"
                            title={item.title}
                          >
                            {item.images && item.images[0] ? (
                              <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-[#E5E7EB]" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={() => onFilterBySellerCountry(seller.country)}
                      className="text-xs font-medium text-[#17191F] hover:text-[#4057D6] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Browse listings from {country?.name || seller.country}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 sm:p-10 rounded-2xl bg-white border border-[#E5E7EB] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4057D6]">
                <Store className="w-4 h-4" />
                <span>Zero Listing Fees · Direct Customer Relationships</span>
              </div>
              <h3 className="text-xl font-semibold text-[#17191F]">
                Start Selling on NOVORA
              </h3>
              <p className="text-xs text-[#646B76] leading-relaxed">
                Whether you produce handcrafted woodwork, design digital architecture tools, offer translation services, or curate vintage items, reach global customers with 100% free listing and zero commissions.
              </p>
            </div>

            <button
              onClick={onOpenCreateListing}
              className="px-5 py-2.5 bg-[#17191F] hover:bg-[#27272A] text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Seller Listing</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
