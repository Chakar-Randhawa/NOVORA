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
  Check,
  Copy,
  QrCode,
  Download,
  Smartphone
} from 'lucide-react';
import QRCode from 'qrcode';
import { Listing, UserProfile } from '../../types';
import { formatPrice, getCountryByCode } from '../../data/countries';
import { CATEGORIES, LISTING_TYPE_LABELS, CONDITION_LABELS } from '../../data/categories';
import { Breadcrumbs } from '../common/Breadcrumbs';

interface ListingDetailModalProps {
  listing: Listing;
  currentUser: UserProfile | null;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onStartMessage: (listing: Listing) => void;
  onReport: (listing: Listing) => void;
  onEditListing?: (listing: Listing) => void;
  onToggleStatus?: (id: string) => void;
  onDeleteListing?: (id: string) => void;
  onOpenAuth: (mode?: 'signin' | 'register') => void;
  onViewSeller?: (sellerId: string, sellerName: string) => void;
  onSelectCategory?: (categoryId: string) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  currentUser,
  isFavorite,
  onClose,
  onToggleFavorite,
  onStartMessage,
  onReport,
  onEditListing,
  onToggleStatus,
  onDeleteListing,
  onOpenAuth,
  onViewSeller,
  onSelectCategory
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showQrModal) {
          setShowQrModal(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showQrModal]);

  const countryObj = getCountryByCode(listing.sellerCountry);
  const categoryObj = CATEGORIES.find((c) => c.id === listing.categoryId);
  const formattedAmount = formatPrice(listing.price, listing.currency);

  const isOwner = currentUser && currentUser.id === listing.sellerId;

  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const getShareUrl = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('listing', listing.id);
      return url.toString();
    } catch {
      return window.location.href;
    }
  };

  // Generate QR code for mobile scanning
  useEffect(() => {
    let isMounted = true;
    const generateQr = async () => {
      try {
        setIsGeneratingQr(true);
        const url = getShareUrl();
        const dataUrl = await QRCode.toDataURL(url, {
          width: 320,
          margin: 1.5,
          color: {
            dark: '#14243A',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        });
        if (isMounted) {
          setQrDataUrl(dataUrl);
        }
      } catch (err) {
        console.error('Failed to generate QR code:', err);
      } finally {
        if (isMounted) {
          setIsGeneratingQr(false);
        }
      }
    };
    generateQr();
    return () => {
      isMounted = false;
    };
  }, [listing.id]);

  // Dynamically update OpenGraph, Twitter, and Schema.org metadata for social unfurling
  useEffect(() => {
    if (!listing) return;

    const setMeta = (attrName: string, attrVal: string, content: string) => {
      let el = document.querySelector(`meta[${attrName}="${attrVal}"]`) as HTMLMetaElement | null;
      const prev = el ? el.getAttribute('content') : null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
      return prev;
    };

    const prevTitle = document.title;
    const listingTitle = `${listing.title} — ${formattedAmount} | NOVORA`;
    const listingDesc = listing.description.length > 160 
      ? `${listing.description.slice(0, 157)}...` 
      : listing.description;
    const listingImage = listing.images && listing.images.length > 0 
      ? listing.images[0] 
      : 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80';
    const canonicalUrl = getShareUrl();

    // 1. Update Document Title
    document.title = listingTitle;

    // 2. Update Standard & OpenGraph Tags
    const prevDesc = setMeta('name', 'description', listingDesc);
    const prevOgTitle = setMeta('property', 'og:title', listingTitle);
    const prevOgDesc = setMeta('property', 'og:description', listingDesc);
    const prevOgImage = setMeta('property', 'og:image', listingImage);
    const prevOgUrl = setMeta('property', 'og:url', canonicalUrl);
    const prevOgType = setMeta('property', 'og:type', 'product');

    // 3. Update Twitter Card Tags
    const prevTwTitle = setMeta('name', 'twitter:title', listingTitle);
    const prevTwDesc = setMeta('name', 'twitter:description', listingDesc);
    const prevTwImage = setMeta('name', 'twitter:image', listingImage);

    // 4. Inject Dynamic Schema.org Product Structured Data
    let jsonLdEl = document.getElementById('novora-listing-jsonld') as HTMLScriptElement | null;
    if (!jsonLdEl) {
      jsonLdEl = document.createElement('script');
      jsonLdEl.type = 'application/ld+json';
      jsonLdEl.id = 'novora-listing-jsonld';
      document.head.appendChild(jsonLdEl);
    }
    jsonLdEl.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: listing.title,
      description: listingDesc,
      image: listing.images || [],
      category: categoryObj?.name || 'Classified',
      offers: {
        '@type': 'Offer',
        price: String(listing.price),
        priceCurrency: listing.currency,
        availability: listing.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Person',
          name: listing.sellerName
        }
      }
    });

    // Cleanup & restore defaults upon closing or unmounting
    return () => {
      document.title = prevTitle;
      if (prevDesc !== null) setMeta('name', 'description', prevDesc);
      if (prevOgTitle !== null) setMeta('property', 'og:title', prevOgTitle);
      if (prevOgDesc !== null) setMeta('property', 'og:description', prevOgDesc);
      if (prevOgImage !== null) setMeta('property', 'og:image', prevOgImage);
      if (prevOgUrl !== null) setMeta('property', 'og:url', prevOgUrl);
      if (prevOgType !== null) setMeta('property', 'og:type', prevOgType);
      if (prevTwTitle !== null) setMeta('name', 'twitter:title', prevTwTitle);
      if (prevTwDesc !== null) setMeta('name', 'twitter:description', prevTwDesc);
      if (prevTwImage !== null) setMeta('name', 'twitter:image', prevTwImage);

      const scriptToClean = document.getElementById('novora-listing-jsonld');
      if (scriptToClean) {
        scriptToClean.remove();
      }
    };
  }, [listing, formattedAmount, categoryObj]);

  const handleNativeShare = async () => {
    const shareUrl = getShareUrl();
    const shareData = {
      title: `${listing.title} — NOVORA`,
      text: `Discover "${listing.title}" by ${listing.sellerName} (${formattedAmount}) on NOVORA Global Discovery Marketplace.`,
      url: shareUrl
    };

    if (canNativeShare) {
      try {
        if (navigator.canShare && !navigator.canShare(shareData)) {
          await handleCopyLink();
          return;
        }
        await navigator.share(shareData);
        setShareFeedback('Shared!');
        setTimeout(() => setShareFeedback(null), 2500);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return;
        }
      }
    }
    await handleCopyLink();
  };

  const handleCopyLink = async () => {
    const shareUrl = getShareUrl();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedLink(true);
      setShareFeedback('Link copied!');
      setTimeout(() => {
        setCopiedLink(false);
        setShareFeedback(null);
      }, 2500);
    } catch {
      setShareFeedback('Failed to copy');
      setTimeout(() => setShareFeedback(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-[#E2DFD8] shadow-2xl relative overflow-hidden my-auto max-h-[94vh] flex flex-col novora-animate-modal">
        
        {/* Header bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-[#E2DFD8] flex items-center justify-between shrink-0 bg-[#F7F5F0] gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-[#5A6578] truncate">
            <span className="truncate">{categoryObj?.name || 'Classified'}</span>
            <span aria-hidden="true">·</span>
            <span className="shrink-0">{countryObj?.flag} {countryObj?.name || listing.sellerCountry}</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="hidden sm:inline truncate">{LISTING_TYPE_LABELS[listing.listingType] || 'Listing'}</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {canNativeShare && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="p-1.5 text-[#5A6578] hover:text-[#14243A] hover:bg-[#EFECE5] rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer"
                title="Share listing via Web Share"
                aria-label="Share listing"
              >
                <Share2 className="w-3.5 h-3.5 text-[#C5A572]" />
                <span className="hidden sm:inline">Share</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              className={`p-1.5 rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer ${
                copiedLink
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-[#5A6578] hover:text-[#14243A] hover:bg-[#EFECE5]'
              }`}
              title="Copy direct listing link"
              aria-label="Copy direct listing link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="p-1.5 text-[#5A6578] hover:text-[#14243A] hover:bg-[#EFECE5] rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer"
              title="Display mobile scan QR Code"
              aria-label="Display mobile scan QR Code"
            >
              <QrCode className="w-3.5 h-3.5 text-[#C5A572]" />
              <span className="hidden sm:inline">QR Code</span>
            </button>

            <button
              type="button"
              onClick={() => onReport(listing)}
              className="p-1.5 text-[#5A6578] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer"
              title="Report content"
            >
              <Flag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Report</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#5A6578] hover:text-[#14243A] hover:bg-[#EFECE5] rounded-lg transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Breadcrumb Navigation Trail */}
          <div className="md:col-span-12 -mb-2 sm:-mb-3 pb-2 border-b border-[#E2DFD8]">
            <Breadcrumbs
              items={[
                {
                  label: 'Marketplace',
                  onClick: onClose
                },
                {
                  label: categoryObj?.name || 'Classified',
                  onClick: onSelectCategory
                    ? () => {
                        onSelectCategory(listing.categoryId);
                        onClose();
                      }
                    : undefined
                },
                {
                  label: listing.title,
                  current: true
                }
              ]}
              className="py-0 px-0"
            />
          </div>

          {/* Left Column on Desktop / Main Flow on Mobile */}
          <div className="md:col-span-7 space-y-5 sm:space-y-6">
            
            {/* Main Image Gallery */}
            <div className="space-y-3">
              <div className="aspect-4/3 rounded-2xl bg-[#F7F5F0] border border-[#E2DFD8] overflow-hidden relative shadow-2xs">
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[activeImageIdx] || listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-[#F7F5F0]">
                    <Package className="w-12 h-12 text-[#8A94A6] mb-2" />
                    <span className="text-xs text-[#5A6578]">Listing published without photo</span>
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
                        activeImageIdx === idx ? 'border-[#14243A]' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* MOBILE ONLY: Price, Key Details & Primary Actions Right After Image */}
            <div className="md:hidden space-y-4 pt-2 border-t border-[#E2DFD8]">
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-[#14243A] leading-snug">
                  {listing.title}
                </h1>
                <div className="mt-1.5 text-2xl font-bold font-mono text-[#14243A] tabular-nums">
                  {formattedAmount}
                </div>
                <div className="text-xs text-[#5A6578] mt-0.5">
                  Condition: {CONDITION_LABELS[listing.condition] || listing.condition}
                </div>
              </div>

              {/* Mobile Actions */}
              {isOwner ? (
                <div className="p-3 bg-[#F7F5F0] rounded-xl border border-[#E2DFD8] space-y-2">
                  <span className="text-xs font-semibold text-[#14243A] block">Listing Owner Actions</span>
                  <div className="flex gap-2">
                    {onEditListing && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onEditListing(listing);
                        }}
                        className="flex-1 py-2 text-xs font-medium border border-[#E2DFD8] bg-white text-[#14243A] hover:bg-[#F7F5F0] rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#C5A572]" />
                        <span>Edit</span>
                      </button>
                    )}
                    {onToggleStatus && (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(listing.id)}
                        className="flex-1 py-2 text-xs font-medium border border-[#E2DFD8] bg-white text-[#283548] rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {listing.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
                        <span>{listing.status === 'active' ? 'Pause' : 'Activate'}</span>
                      </button>
                    )}
                    {onDeleteListing && (
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteListing(listing.id);
                          onClose();
                        }}
                        className="px-3 py-2 text-xs font-medium text-rose-600 border border-rose-200 bg-rose-50 rounded-lg cursor-pointer"
                        title="Delete listing"
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
                    className="w-full py-2.5 px-4 rounded-xl bg-[#14243A] hover:bg-[#0E1B2D] text-white text-xs font-medium flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.98]"
                  >
                    <MessageSquare className="w-4 h-4 text-[#C5A572]" />
                    <span>{currentUser ? 'Contact Seller' : 'Sign in to Contact'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleFavorite(listing.id)}
                    className={`w-full py-2.5 px-4 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-[0.98] ${
                      isFavorite ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-[#E2DFD8] bg-white text-[#283548] hover:border-[#14243A]'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current text-rose-600' : ''}`} />
                    <span>{isFavorite ? 'Saved' : 'Save Item'}</span>
                  </button>
                </div>
              )}

              {/* Mobile Share Module */}
              <div className="mt-2 p-2.5 bg-[#F7F5F0] rounded-xl border border-[#E2DFD8] flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium text-[#5A6578] truncate">
                  {shareFeedback || 'Share this listing with others'}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {canNativeShare && (
                    <button
                      type="button"
                      onClick={handleNativeShare}
                      className="px-2 py-1 bg-[#14243A] hover:bg-[#0E1B2D] text-white text-[11px] font-medium rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Share2 className="w-3 h-3 text-[#C5A572]" />
                      <span>Share</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowQrModal(true)}
                    className="px-2 py-1 text-[11px] font-medium rounded-lg border border-[#E2DFD8] bg-white hover:bg-[#F7F5F0] text-[#14243A] transition-colors flex items-center gap-1 cursor-pointer"
                    title="View QR Code"
                  >
                    <QrCode className="w-3 h-3 text-[#C5A572]" />
                    <span>QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`px-2 py-1 text-[11px] font-medium rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
                      copiedLink
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-white hover:bg-[#F7F5F0] text-[#14243A] border-[#E2DFD8]'
                    }`}
                  >
                    {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-[#5A6578]" />}
                    <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[#14243A] uppercase tracking-wider">
                Description & Specifications
              </h4>
              <p className="text-xs sm:text-sm text-[#283548] leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* Dynamic Category Attributes */}
            {listing.customAttributes && Object.keys(listing.customAttributes).length > 0 && (
              <div className="bg-[#F7F5F0] rounded-2xl p-4 border border-[#E2DFD8] space-y-3">
                <h4 className="text-xs font-semibold text-[#14243A] uppercase tracking-wider">
                  Category Attributes
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {Object.entries(listing.customAttributes).map(([key, val]) => (
                    <div key={key} className="space-y-0.5">
                      <span className="text-[#5A6578] capitalize font-medium">
                        {key.replace(/([A-Z])/g, ' $1')}:
                      </span>
                      <p className="text-[#14243A] font-medium">{String(val)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping & Delivery Terms */}
            <div className="border-t border-[#E2DFD8] pt-4 space-y-2 text-xs text-[#5A6578]">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#C5A572] shrink-0" />
                <span className="font-semibold text-[#14243A]">Fulfillment:</span>
                <span>
                  {listing.shipsInternationally
                    ? `Ships internationally (${listing.shippingDestinations?.join(', ') || 'Worldwide'})`
                    : 'Domestic / Local handoff only'}
                </span>
              </div>
              {listing.shippingCostDescription && (
                <p className="pl-6 text-[#5A6578] leading-relaxed">
                  {listing.shippingCostDescription}
                </p>
              )}
              {listing.allowsCustomization && (
                <div className="flex items-center gap-2 pl-6 text-[#14243A]">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0 text-[#C5A572]" />
                  <span>Seller accommodates bespoke customization & personalized orders</span>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Desktop Inquiry / Purchase Module (5 cols on md+) */}
          <div className="hidden md:flex md:col-span-5 flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-semibold text-[#14243A] leading-snug">
                  {listing.title}
                </h1>
                <div className="mt-2 text-2xl font-bold font-mono text-[#14243A] tabular-nums">
                  {formattedAmount}
                </div>
                <div className="text-xs text-[#5A6578] mt-1">
                  Condition: {CONDITION_LABELS[listing.condition] || listing.condition}
                </div>
              </div>

              {/* Seller Identity Card */}
              <div className="p-4 rounded-2xl border border-[#E2DFD8] bg-[#F7F5F0] space-y-3 shadow-2xs">
                <span className="text-[11px] font-semibold text-[#5A6578] uppercase tracking-wider block">
                  Seller
                </span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#14243A] text-white font-medium flex items-center justify-center text-xs shrink-0">
                      {listing.sellerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-[#14243A] truncate">{listing.sellerName}</h4>
                      <p className="text-[11px] text-[#5A6578] truncate">
                        {countryObj?.flag} {listing.sellerCity || countryObj?.name || listing.sellerCountry}
                      </p>
                    </div>
                  </div>

                  {onViewSeller && (
                    <button
                      type="button"
                      onClick={() => onViewSeller(listing.sellerId, listing.sellerName)}
                      className="text-xs text-[#14243A] hover:text-[#8E6D38] font-medium cursor-pointer shrink-0 ml-2"
                    >
                      View Store →
                    </button>
                  )}
                </div>
              </div>

              {/* Owner Controls or Inquiry Actions */}
              {isOwner ? (
                <div className="p-4 rounded-2xl bg-[#F7F5F0] border border-[#E2DFD8] space-y-2.5">
                  <span className="text-xs font-semibold text-[#14243A] block">
                    Listing Management (Owner)
                  </span>
                  <div className="flex gap-2">
                    {onEditListing && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onEditListing(listing);
                        }}
                        className="flex-1 py-2 text-xs font-medium border border-[#E2DFD8] bg-white hover:bg-[#F7F5F0] text-[#14243A] rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#C5A572]" />
                        <span>Edit Listing</span>
                      </button>
                    )}
                    {onToggleStatus && (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(listing.id)}
                        className="flex-1 py-2 text-xs font-medium border border-[#E2DFD8] bg-white hover:bg-[#F7F5F0] text-[#283548] rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
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
                          onDeleteListing(listing.id);
                          onClose();
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
                    className="w-full py-2.5 px-4 rounded-xl bg-[#14243A] hover:bg-[#0E1B2D] text-white text-xs font-medium flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer active:scale-[0.98]"
                  >
                    <MessageSquare className="w-4 h-4 text-[#C5A572]" />
                    <span>{currentUser ? 'Contact Seller Directly' : 'Sign in to Contact Seller'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleFavorite(listing.id)}
                    className={`w-full py-2 px-4 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      isFavorite
                        ? 'border-rose-200 bg-rose-50 text-rose-700'
                        : 'border-[#E2DFD8] bg-white text-[#283548] hover:bg-[#F7F5F0]'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current text-rose-600' : ''}`} />
                    <span>{isFavorite ? 'Saved to Favorites' : 'Save to Favorites'}</span>
                  </button>
                </div>
              )}

              {/* Share & Discovery Card */}
              <div className="p-3 bg-[#F7F5F0] rounded-2xl border border-[#E2DFD8] flex items-center justify-between gap-2.5">
                <div className="min-w-0 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white border border-[#E2DFD8] flex items-center justify-center shrink-0 shadow-2xs">
                    <Share2 className="w-3.5 h-3.5 text-[#C5A572]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#14243A] truncate">
                      {shareFeedback ? shareFeedback : 'Share this Offering'}
                    </p>
                    <p className="text-[10px] text-[#5A6578] truncate">
                      {canNativeShare ? 'Native share sheet & direct URL' : 'Copy direct link to share with buyers'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {canNativeShare && (
                    <button
                      type="button"
                      onClick={handleNativeShare}
                      className="px-2.5 py-1.5 bg-[#14243A] hover:bg-[#0E1B2D] text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
                      title="Share listing via Web Share"
                      aria-label="Share listing via native sheet"
                    >
                      <Share2 className="w-3 h-3 text-[#C5A572]" />
                      <span>Share</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowQrModal(true)}
                    className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-[#E2DFD8] bg-white hover:bg-[#F7F5F0] text-[#14243A] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="View mobile scan QR code"
                    aria-label="View mobile scan QR code"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#C5A572]" />
                    <span>QR Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                      copiedLink
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-white hover:bg-[#F7F5F0] text-[#14243A] border-[#E2DFD8]'
                    }`}
                    title="Copy direct share link"
                    aria-label="Copy direct share link"
                  >
                    {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-[#5A6578]" />}
                    <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              {/* Direct Transaction Disclaimer */}
              <div className="p-3.5 rounded-2xl bg-[#F7F5F0] border border-[#E2DFD8] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#14243A]">
                  <Shield className="w-3.5 h-3.5 text-[#C5A572]" />
                  <span>Direct Transaction Model</span>
                </div>
                <p className="text-[11px] text-[#5A6578] leading-relaxed">
                  NOVORA operates as a free classified discovery service. Direct payment and delivery terms are independently agreed upon between buyer and seller.
                </p>
              </div>

            </div>

            {/* Listing stats */}
            <div className="pt-4 border-t border-[#E2DFD8] flex items-center justify-between text-[11px] text-[#5A6578]">
              <span>Published {new Date(listing.createdAt).toLocaleDateString()}</span>
              <span>{listing.viewsCount} views · {listing.favoritesCount} saves</span>
            </div>

          </div>

        </div>

      </div>

      {/* QR Code Scan Modal */}
      {showQrModal && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs novora-animate-backdrop"
          onClick={() => setShowQrModal(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-sm w-full border border-[#E2DFD8] shadow-2xl p-6 text-center space-y-4 relative novora-animate-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-3.5 right-3.5 p-1.5 text-[#5A6578] hover:text-[#14243A] hover:bg-[#F7F5F0] rounded-lg transition-colors cursor-pointer"
              aria-label="Close QR Code Modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center space-y-1">
              <div className="w-10 h-10 rounded-xl bg-[#F7F3EB] border border-[#E8DAC2] flex items-center justify-center text-[#C5A572] mb-1">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#14243A]">
                Scan to Open on Mobile
              </h3>
              <p className="text-xs text-[#5A6578] max-w-xs leading-relaxed">
                Point your smartphone camera at this QR code to view and share this listing directly on mobile.
              </p>
            </div>

            {/* QR Code Graphic Container */}
            <div className="p-3 bg-white rounded-2xl border-2 border-[#14243A]/10 inline-block shadow-inner mx-auto">
              {qrDataUrl ? (
                <img 
                  src={qrDataUrl} 
                  alt={`QR Code for ${listing.title}`}
                  className="w-52 h-52 mx-auto rounded-lg"
                />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-xs text-[#5A6578] bg-[#F7F5F0] rounded-lg">
                  Generating QR Code...
                </div>
              )}
            </div>

            {/* Listing Summary Preview */}
            <div className="p-2.5 bg-[#F7F5F0] rounded-xl border border-[#E2DFD8] text-left flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#14243A] truncate">{listing.title}</p>
                <p className="text-[11px] text-[#5A6578] truncate">{listing.sellerName} · {countryObj?.flag} {countryObj?.name || listing.sellerCountry}</p>
              </div>
              <span className="font-mono font-bold text-xs text-[#14243A] shrink-0">
                {formattedAmount}
              </span>
            </div>

            {/* Actions: Download QR Code & Copy Link */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {qrDataUrl && (
                <a
                  href={qrDataUrl}
                  download={`novora-${listing.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-qr.png`}
                  className="py-2 px-3 text-xs font-medium text-[#14243A] bg-[#F7F5F0] hover:bg-[#EFECE5] border border-[#E2DFD8] rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98]"
                  title="Download printable QR Code PNG"
                >
                  <Download className="w-3.5 h-3.5 text-[#C5A572]" />
                  <span>Save QR Image</span>
                </a>
              )}
              <button
                type="button"
                onClick={handleCopyLink}
                className={`py-2 px-3 text-xs font-medium rounded-xl border transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98] ${
                  copiedLink
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-[#14243A] hover:bg-[#0E1B2D] text-white border-transparent'
                }`}
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
