import React, { useState } from 'react';
import { Heart, Globe, Sparkles, MapPin, Package, ArrowUpRight } from 'lucide-react';
import { Listing } from '../../types';
import { formatPrice, getCountryByCode } from '../../data/countries';
import { CATEGORIES, LISTING_TYPE_LABELS } from '../../data/categories';

interface ListingCardProps {
  listing: Listing;
  isFavorite: boolean;
  displayCurrency: string;
  onSelect: (listing: Listing) => void;
  onToggleFavorite: (id: string) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isFavorite,
  displayCurrency,
  onSelect,
  onToggleFavorite
}) => {
  const [imgError, setImgError] = useState(false);
  const countryObj = getCountryByCode(listing.sellerCountry);
  const categoryObj = CATEGORIES.find(c => c.id === listing.categoryId);

  const formattedAmount = formatPrice(listing.price, listing.currency);

  return (
    <article
      onClick={() => onSelect(listing)}
      className="group relative bg-white rounded-xl border border-[#E5E7EB] overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer flex flex-col h-full"
    >
      {/* Lead with imagery */}
      <div className="relative aspect-4/3 bg-[#F9FAFB] overflow-hidden">
        {listing.images && listing.images.length > 0 && !imgError ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-102"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#F9FAFB]">
            <Package className="w-8 h-8 text-[#9CA3AF] mb-2" />
            <span className="text-xs font-medium text-[#646B76] max-w-[180px] line-clamp-2">
              {listing.title}
            </span>
          </div>
        )}

        {/* Favorite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(listing.id);
          }}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
            isFavorite
              ? 'bg-white text-rose-600 shadow-xs'
              : 'bg-white/80 text-[#646B76] hover:text-[#17191F] hover:bg-white'
          }`}
          aria-label={isFavorite ? 'Remove from saved' : 'Save to favorites'}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Card Content with Zero-Pill Unboxed Metadata */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        
        <div>
          {/* Metadata line with typographic separators (NO PILLS) */}
          <div className="flex items-center gap-1.5 text-xs text-[#646B76] mb-1.5 flex-wrap">
            <span>{categoryObj?.name || 'Classified'}</span>
            <span aria-hidden="true">·</span>
            <span>{countryObj?.flag} {listing.sellerCity || countryObj?.name || listing.sellerCountry}</span>
            {listing.shipsInternationally && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[#4057D6]">Int'l Shipping</span>
              </>
            )}
          </div>

          {/* Listing Title */}
          <h3 className="text-sm font-semibold text-[#17191F] group-hover:text-[#4057D6] transition-colors line-clamp-2 leading-snug mb-1.5">
            {listing.title}
          </h3>

          {/* Short description */}
          <p className="text-xs text-[#646B76] line-clamp-2 leading-relaxed mb-3">
            {listing.description}
          </p>
        </div>

        {/* Footer: Price & Seller Action */}
        <div className="pt-3 border-t border-[#F3F4F6] flex items-baseline justify-between">
          <div className="flex flex-col">
            <span className="text-base font-semibold text-[#17191F] tabular-nums font-mono">
              {formattedAmount}
            </span>
            <span className="text-[11px] text-[#646B76]">
              by {listing.sellerName}
            </span>
          </div>

          <div className="text-xs font-medium text-[#4057D6] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
            <span>Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

      </div>
    </article>
  );
};
