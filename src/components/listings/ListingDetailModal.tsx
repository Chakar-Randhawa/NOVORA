import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  MessageSquare,
  Globe,
  Truck,
  Shield,
  Clock,
  CheckCircle,
  Flag,
  Share2,
  Tag,
  Package,
  Edit3,
  Trash2,
  Pause,
  Play,
  Check
} from 'lucide-react';
import { Listing, UserProfile } from '../../types';
import { formatPrice, getCountryByCode } from '../../data/countries';
import { CATEGORIES, LISTING_TYPE_LABELS, CONDITION_LABELS } from '../../data/categories';

interface ListingDetailModalProps {
  listing: Listing;
  currentUser: UserProfile | null;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onStartMessage: (listing: Listing) => void;
  onReport: (listing: Listing) => void;
  onToggleStatus?: (id: string) => void;
  onDeleteListing?: (id: string) => void;
  onOpenAuth: (mode?: 'signin' | 'register') => void;
  onViewSeller?: (sellerId: string, sellerName: string) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  currentUser,
  isFavorite,
  onClose,
  onToggleFavorite,
  onStartMessage,
  onReport,
  onToggleStatus,
  onDeleteListing,
  onOpenAuth,
  onViewSeller
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const countryObj = getCountryByCode(listing.sellerCountry);
  const categoryObj = CATEGORIES.find((c) => c.id === listing.categoryId);
  const formattedAmount = formatPrice(listing.price, listing.currency);

  const isOwner = currentUser && currentUser.id === listing.sellerId;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-[#E5E7EB] shadow-2xl relative overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Header bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-[#E5E7EB] flex items-center justify-between shrink-0 bg-[#FAFAF8] gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-[#646B76] truncate">
            <span className="truncate">{categoryObj?.name || 'Classified'}</span>
            <span aria-hidden="true">·</span>
            <span className="shrink-0">{countryObj?.flag} {countryObj?.name || listing.sellerCountry}</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="hidden sm:inline truncate">{LISTING_TYPE_LABELS[listing.listingType] || 'Listing'}</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-1.5 text-[#646B76] hover:text-[#17191F] hover:bg-[#F3F4F6] rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer"
              title="Copy share link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
            </button>

            <button
              type="button"
              onClick={() => onReport(listing)}
              className="p-1.5 text-[#646B76] hover:text-rose-600 hover:bg-[#F3F4F6] rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer"
              title="Report content"
            >
              <Flag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Report</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#646B76] hover:text-[#17191F] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Left Column on Desktop / Main Flow on Mobile */}
          <div className="md:col-span-7 space-y-5 sm:space-y-6">
            
            {/* Main Image Gallery */}
            <div className="space-y-3">
              <div className="aspect-4/3 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] overflow-hidden relative shadow-2xs">
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[activeImageIdx] || listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-[#F9FAFB]">
                    <Package className="w-12 h-12 text-[#9CA3AF] mb-2" />
                    <span className="text-xs text-[#646B76]">Listing published without photo</span>
                  </div>
                )}
              </div>

              {/* Thumbnails if multiple */}
              {listing.images && listing.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {listing.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                        activeImageIdx === idx ? 'border-[#17191F]' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* MOBILE ONLY: Price, Key Details & Primary Actions Right After Image */}
            <div className="md:hidden space-y-4 pt-2 border-t border-[#E5E7EB]">
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-[#17191F] leading-snug">
                  {listing.title}
                </h1>
                <div className="mt-1.5 text-2xl font-bold font-mono text-[#17191F] tabular-nums">
                  {formattedAmount}
                </div>
                <div className="text-xs text-[#646B76] mt-0.5">
                  Condition: {CONDITION_LABELS[listing.condition] || listing.condition}
                </div>
              </div>

              {/* Mobile Actions */}
              {isOwner ? (
                <div className="p-3 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] space-y-2">
                  <span className="text-xs font-semibold text-[#17191F] block">Listing Owner Actions</span>
                  <div className="flex gap-2">
                    {onToggleStatus && (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(listing.id)}
                        className="flex-1 py-2 text-xs font-medium border border-[#E5E7EB] bg-white text-[#374151] rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {listing.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
                        <span>{listing.status === 'active' ? 'Pause' : 'Activate'}</span>
                      </button>
                    )}
                    {onDeleteListing && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Delete this listing?')) {
                            onDeleteListing(listing.id);
                            onClose();
                          }
                        }}
                        className="px-3 py-2 text-xs font-medium text-rose-600 border border-rose-200 bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUser) onOpenAuth('signin');
                      else onStartMessage(listing);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#17191F] hover:bg-[#27272A] text-white text-xs font-medium flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-[#818CF8]" />
                    <span>{currentUser ? 'Contact Seller' : 'Sign in to Contact'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleFavorite(listing.id)}
                    className={`w-full py-2.5 px-4 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      isFavorite ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-[#E5E7EB] bg-white text-[#374151]'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current text-rose-600' : ''}`} />
                    <span>{isFavorite ? 'Saved' : 'Save Item'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[#17191F] uppercase tracking-wider">
                Description & Specifications
              </h4>
              <p className="text-xs sm:text-sm text-[#374151] leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* Dynamic Category Attributes */}
            {listing.customAttributes && Object.keys(listing.customAttributes).length > 0 && (
              <div className="bg-[#FAFAF8] rounded-2xl p-4 border border-[#E5E7EB] space-y-3">
                <h4 className="text-xs font-semibold text-[#17191F] uppercase tracking-wider">
                  Category Attributes
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {Object.entries(listing.customAttributes).map(([key, val]) => (
                    <div key={key} className="space-y-0.5">
                      <span className="text-[#646B76] capitalize font-medium">
                        {key.replace(/([A-Z])/g, ' $1')}:
                      </span>
                      <p className="text-[#17191F] font-medium">{String(val)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping & Delivery Terms */}
            <div className="border-t border-[#E5E7EB] pt-4 space-y-2 text-xs text-[#646B76]">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#4057D6] shrink-0" />
                <span className="font-semibold text-[#17191F]">Fulfillment:</span>
                <span>
                  {listing.shipsInternationally
                    ? `Ships internationally (${listing.shippingDestinations?.join(', ') || 'Worldwide'})`
                    : 'Domestic / Local handoff only'}
                </span>
              </div>
              {listing.shippingCostDescription && (
                <p className="pl-6 text-[#646B76] leading-relaxed">
                  {listing.shippingCostDescription}
                </p>
              )}
              {listing.allowsCustomization && (
                <div className="flex items-center gap-2 pl-6 text-[#059669]">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Seller accommodates bespoke customization & personalized orders</span>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Desktop Inquiry / Purchase Module (5 cols on md+) */}
          <div className="hidden md:flex md:col-span-5 flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-semibold text-[#17191F] leading-snug">
                  {listing.title}
                </h1>
                <div className="mt-2 text-2xl font-bold font-mono text-[#17191F] tabular-nums">
                  {formattedAmount}
                </div>
                <div className="text-xs text-[#646B76] mt-1">
                  Condition: {CONDITION_LABELS[listing.condition] || listing.condition}
                </div>
              </div>

              {/* Seller Identity Card */}
              <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#FAFAF8] space-y-3 shadow-2xs">
                <span className="text-[11px] font-semibold text-[#646B76] uppercase tracking-wider block">
                  Seller
                </span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#17191F] text-white font-medium flex items-center justify-center text-xs shrink-0">
                      {listing.sellerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-[#17191F] truncate">{listing.sellerName}</h4>
                      <p className="text-[11px] text-[#646B76] truncate">
                        {countryObj?.flag} {listing.sellerCity || countryObj?.name || listing.sellerCountry}
                      </p>
                    </div>
                  </div>

                  {onViewSeller && (
                    <button
                      type="button"
                      onClick={() => onViewSeller(listing.sellerId, listing.sellerName)}
                      className="text-xs text-[#4057D6] hover:underline font-medium cursor-pointer shrink-0 ml-2"
                    >
                      View Store →
                    </button>
                  )}
                </div>
              </div>

              {/* Owner Controls or Inquiry Actions */}
              {isOwner ? (
                <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-2.5">
                  <span className="text-xs font-semibold text-[#17191F] block">
                    Listing Management (Owner)
                  </span>
                  <div className="flex gap-2">
                    {onToggleStatus && (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(listing.id)}
                        className="flex-1 py-2 text-xs font-medium border border-[#E5E7EB] bg-white hover:bg-[#F3F4F6] text-[#374151] rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        {listing.status === 'active' ? (
                          <>
                            <Pause className="w-3.5 h-3.5" />
                            <span>Pause Listing</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Activate Listing</span>
                          </>
                        )}
                      </button>
                    )}
                    {onDeleteListing && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Are you sure you want to permanently delete this listing?')) {
                            onDeleteListing(listing.id);
                            onClose();
                          }
                        }}
                        className="px-3 py-2 text-xs font-medium text-rose-600 border border-rose-200 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer shadow-2xs"
                        title="Delete listing"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUser) onOpenAuth('signin');
                      else onStartMessage(listing);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#17191F] hover:bg-[#27272A] text-white text-xs font-medium flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-[#818CF8]" />
                    <span>{currentUser ? 'Contact Seller Directly' : 'Sign in to Contact Seller'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleFavorite(listing.id)}
                    className={`w-full py-2 px-4 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      isFavorite
                        ? 'border-rose-200 bg-rose-50 text-rose-700'
                        : 'border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current text-rose-600' : ''}`} />
                    <span>{isFavorite ? 'Saved to Favorites' : 'Save to Favorites'}</span>
                  </button>
                </div>
              )}

              {/* Direct Transaction Disclaimer */}
              <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A]">
                  <Shield className="w-3.5 h-3.5 text-[#4057D6]" />
                  <span>Direct Transaction Model</span>
                </div>
                <p className="text-[11px] text-[#475569] leading-relaxed">
                  NOVORA operates as a free classified discovery service. Direct payment and delivery terms are independently agreed upon between buyer and seller.
                </p>
              </div>

            </div>

            {/* Listing stats */}
            <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between text-[11px] text-[#646B76]">
              <span>Published {new Date(listing.createdAt).toLocaleDateString()}</span>
              <span>{listing.viewsCount} views · {listing.favoritesCount} saves</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
