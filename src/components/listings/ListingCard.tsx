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
      className="group relative bg-white rounded-xl border border-[#E2DFD8] hover:border-[#14243A] overflow-hidden novora-interactive-card cursor-pointer flex flex-col h-full"
    >
      {/* Lead with imagery */}
      <div className="relative aspect-4/3 bg-[#EFECE5] overflow-hidden">
        {listing.images && listing.images.length > 0 && !imgError ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-102"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#EFECE5]">
            <Package className="w-8 h-8 text-[#8A94A6] mb-2" />
            <span className="text-xs font-medium text-[#5A6578] max-w-[180px] line-clamp-2">
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
              : 'bg-white/80 text-[#5A6578] hover:text-[#14243A] hover:bg-white'
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
          <div className="flex items-center gap-1.5 text-xs text-[#5A6578] mb-1.5 flex-wrap">
            <span>{categoryObj?.name || 'Classified'}</span>
            <span aria-hidden="true">·</span>
            <span>{countryObj?.flag} {listing.sellerCity || countryObj?.name || listing.sellerCountry}</span>
            {listing.shipsInternationally && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[#8E6D38] font-medium">Int'l Shipping</span>
              </>
            )}
          </div>

          {/* Listing Title */}
          <h3 className="text-sm font-semibold text-[#14243A] group-hover:text-[#283548] transition-colors line-clamp-2 leading-snug mb-1.5">
            {listing.title}
          </h3>

          {/* Short description */}
          <p className="text-xs text-[#5A6578] line-clamp-2 leading-relaxed mb-3">
            {listing.description}
          </p>
        </div>

        {/* Footer: Price & Seller Action */}
        <div className="pt-3 border-t border-[#EFECE5] flex items-baseline justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <span className="text-base font-semibold text-[#14243A] tabular-nums font-mono truncate">
              {formattedAmount}
            </span>
            <span className="text-[11px] text-[#5A6578] truncate" title={`by ${listing.sellerName}`}>
              by {listing.sellerName}
            </span>
          </div>

          <div className="text-xs font-medium text-[#14243A] group-hover:text-[#8E6D38] group-hover:translate-x-0.5 transition-all flex items-center gap-0.5 shrink-0">
            <span>Details</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#C5A572]" />
          </div>
        </div>

      </div>
    </article>
  );
};
