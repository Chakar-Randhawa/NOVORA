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
    <section id="local-finds" className="py-16 bg-[#F7F5F0] border-b border-[#E2DFD8]">
      <div className="max-w-[1440px] mx-auto px-6">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-semibold text-[#8E6D38] uppercase tracking-wider mb-1">
              Independent Trade
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#14243A] tracking-tight">
              Seller & Creator Community
            </h2>
          </div>
          <p className="text-xs text-[#5A6578] max-w-md leading-relaxed">
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
                  className="bg-white rounded-xl border border-[#E2DFD8] hover:border-[#14243A] p-5 flex flex-col justify-between space-y-4 hover:shadow-xs transition-all"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-[#14243A] text-[#C5A572] font-semibold flex items-center justify-center text-sm border border-[#C5A572]/30">
                        {seller.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[#14243A]">{seller.name}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-[#5A6578]">
                          <span>{country?.flag}</span>
                          <span>{seller.city || country?.name || seller.country}</span>
                        </div>
                      </div>
                    </div>

                    {seller.sellerTagline && (
                      <p className="text-xs font-medium text-[#8E6D38] mb-2">
                        {seller.sellerTagline}
                      </p>
                    )}

                    {seller.bio && (
                      <p className="text-xs text-[#5A6578] leading-relaxed line-clamp-3">
                        {seller.bio}
                      </p>
                    )}
                  </div>

                  {sellerListings.length > 0 && (
                    <div className="pt-3 border-t border-[#EFECE5] space-y-2">
                      <span className="text-[11px] font-medium text-[#5A6578] uppercase tracking-wider block">
                        Offerings ({sellerListings.length})
                      </span>
                      <div className="flex gap-2">
                        {sellerListings.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            onClick={() => onSelectListing(item)}
                            className="w-14 h-14 rounded-lg bg-[#F7F5F0] border border-[#E2DFD8] overflow-hidden cursor-pointer hover:opacity-85 transition-opacity"
                            title={item.title}
                          >
                            {item.images && item.images[0] ? (
                              <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-[#EFECE5]" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={() => onFilterBySellerCountry(seller.country)}
                      className="text-xs font-medium text-[#14243A] hover:text-[#8E6D38] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Browse listings from {country?.name || seller.country}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C5A572]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 sm:p-10 rounded-2xl bg-white border border-[#E2DFD8] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8E6D38]">
                <Store className="w-4 h-4 text-[#C5A572]" />
                <span>Zero Listing Fees · Direct Customer Relationships</span>
              </div>
              <h3 className="text-xl font-semibold text-[#14243A]">
                Start Selling on NOVORA
              </h3>
              <p className="text-xs text-[#5A6578] leading-relaxed">
                Whether you produce handcrafted woodwork, design digital architecture tools, offer translation services, or curate vintage items, reach global customers with 100% free listing and zero commissions.
              </p>
            </div>

            <button
              onClick={onOpenCreateListing}
              className="px-5 py-2.5 bg-[#14243A] hover:bg-[#0E1B2D] text-white text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5 text-[#C5A572]" />
              <span>Create Seller Listing</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
