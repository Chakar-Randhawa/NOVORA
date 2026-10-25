import React, { useState, useMemo } from 'react';
import {
  Store as StoreIcon,
  MapPin,
  MessageSquare,
  Share2,
  Copy,
  Check,
  Flag,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Globe,
  SlidersHorizontal,
  Search,
  ArrowLeft,
  Settings,
  Heart,
  Calendar,
  Layers
} from 'lucide-react';
import { Storefront, Listing, UserProfile } from '../../types';
import { formatPrice } from '../../data/countries';
import { EmptyState } from '../common/DesignTokens';
import { Breadcrumbs } from '../common/Breadcrumbs';

interface PublicStorefrontProps {
  store: Storefront;
  listings: Listing[];
  currentUser: UserProfile | null;
  favorites: string[];
  displayCurrency?: string;
  onSelectListing: (listing: Listing) => void;
  onToggleFavorite: (id: string) => void;
  onStartMessage: (sellerId: string, sellerName: string, context?: any) => void;
  onReportStore: (store: Storefront) => void;
  onBackToMarketplace: () => void;
  onEditStore?: () => void;
  onOpenAuth?: (mode: 'signin' | 'register') => void;
}

export const PublicStorefront: React.FC<PublicStorefrontProps> = ({
  store,
  listings,
  currentUser,
  favorites,
  displayCurrency,
  onSelectListing,
  onToggleFavorite,
  onStartMessage,
  onReportStore,
  onBackToMarketplace,
  onEditStore,
  onOpenAuth
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'listings' | 'categories' | 'about' | 'policies'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const isOwner = currentUser?.id === store.sellerId;

  // Filter listings belonging to this seller
  const sellerListings = useMemo(() => {
    return listings.filter(l => l.sellerId === store.sellerId && l.status === 'active');
  }, [listings, store.sellerId]);

  // Featured listings
  const featuredListings = useMemo(() => {
    if (store.featuredListingIds && store.featuredListingIds.length > 0) {
      return sellerListings.filter(l => store.featuredListingIds.includes(l.id));
    }
    return sellerListings.slice(0, 3);
  }, [sellerListings, store.featuredListingIds]);

  // Filtered listings for the "All Listings" tab
  const filteredListings = useMemo(() => {
    return sellerListings.filter(l => {
      const matchesSearch = !storeSearchQuery.trim() ||
        l.title.toLowerCase().includes(storeSearchQuery.toLowerCase()) ||
        l.description.toLowerCase().includes(storeSearchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || l.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [sellerListings, storeSearchQuery, selectedCategory]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?store=${store.storeSlug || store.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}?store=${store.storeSlug || store.id}`;
    if (navigator.share) {
      navigator.share({
        title: store.storeName,
        text: store.tagline || `Discover ${store.storeName} on NOVORA`,
        url
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] pb-24">
      {/* Top Breadcrumb Navigation */}
      <div className="bg-white border-b border-[#E2DFD8] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onBackToMarketplace}
              className="p-1.5 -ml-1.5 text-[#5A6578] hover:text-[#14243A] rounded-lg transition-colors cursor-pointer shrink-0"
              title="Return to Marketplace"
              aria-label="Return to Marketplace"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <Breadcrumbs
              items={[
                { label: 'Marketplace', onClick: onBackToMarketplace },
                { label: 'Verified Storefronts', onClick: onBackToMarketplace },
                { label: store.storeName, current: true }
              ]}
              className="py-0 px-0"
            />
          </div>

          <div className="flex items-center gap-2">
            {isOwner && onEditStore && (
              <button
                onClick={onEditStore}
                className="px-3 py-1 bg-[#F7F3EB] text-[#8E6D38] border border-[#E8DAC2] hover:bg-[#EFE9DC] rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Settings className="w-3 h-3 text-[#C5A572]" />
                <span>Manage Store</span>
              </button>
            )}
            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1 text-[#5A6578] hover:text-[#14243A] hover:bg-[#F7F5F0] rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              title="Copy store link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Link Copied' : 'Copy Link'}</span>
            </button>
            <button
              onClick={handleShare}
              className="p-1.5 text-[#5A6578] hover:text-[#14243A] hover:bg-[#F7F5F0] rounded-lg transition-colors cursor-pointer"
              title="Share store"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Store Header & Banner */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
        {/* Banner */}
        <div className="w-full h-44 sm:h-64 rounded-2xl overflow-hidden relative border border-[#E2DFD8] bg-linear-to-r from-[#14243A] via-[#1E2F4A] to-[#283548]">
          {store.bannerUrl ? (
            <img src={store.bannerUrl} alt={store.storeName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col justify-end p-6 sm:p-8 bg-radial from-white/10 to-transparent">
              <span className="text-[11px] font-mono tracking-widest text-[#C5A572] uppercase font-semibold">
                Independent Verified Storefront
              </span>
              <p className="text-xl sm:text-2xl font-semibold text-white/95">
                {store.storeName}
              </p>
            </div>
          )}
        </div>

        {/* Identity & Profile Bar */}
        <div className="relative px-4 sm:px-6 pb-6 pt-0 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-14 sm:-mt-16">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            {/* Logo */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-1.5 shadow-lg border border-[#E2DFD8] shrink-0">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.storeName} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="w-full h-full rounded-xl bg-[#F7F3EB] text-[#8E6D38] border border-[#E8DAC2] flex items-center justify-center font-bold text-2xl font-mono">
                  {store.storeName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Titles */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#14243A] tracking-tight">
                  {store.storeName}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Verified Maker</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#5A6578]">
                {store.tagline || store.description?.slice(0, 100) || 'Authentic independent goods and custom craftsmanship.'}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-[#5A6578] pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#C5A572]" />
                  <span>{store.city ? `${store.city}, ` : ''}{store.country}</span>
                </span>
                <span>·</span>
                <span>{sellerListings.length} {sellerListings.length === 1 ? 'Listing' : 'Listings'}</span>
                <span>·</span>
                <span className="font-mono text-[11px] text-[#8E6D38]">@{store.storeSlug}</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 shrink-0 pt-2 sm:pt-0">
            {!isOwner && (
              <button
                type="button"
                onClick={() => {
                  if (!currentUser && onOpenAuth) {
                    onOpenAuth('signin');
                  } else {
                    onStartMessage(store.sellerId, store.sellerName, {
                      requestTitle: `Inquiry for ${store.storeName}`
                    });
                  }
                }}
                className="px-4 py-2 bg-[#14243A] hover:bg-[#0E1B2D] text-white rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
              >
                <MessageSquare className="w-4 h-4 text-[#C5A572]" />
                <span>Contact Seller</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onReportStore(store)}
              className="p-2 text-[#8A94A6] hover:text-[#EF4444] hover:bg-[#F7F5F0] rounded-xl transition-colors cursor-pointer"
              title="Report Store"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Announcement Banner (if configured) */}
        {store.announcement && (
          <div className="mb-6 p-3.5 bg-[#F7F3EB] border border-[#E8DAC2] rounded-xl flex items-center gap-3 text-xs text-[#14243A]">
            <Sparkles className="w-4 h-4 text-[#C5A572] shrink-0" />
            <p className="flex-1 font-medium">{store.announcement}</p>
          </div>
        )}

        {/* Store Tabs */}
        <div className="border-b border-[#E2DFD8] flex items-center gap-1 sm:gap-2 overflow-x-auto">
          {[
            { id: 'home', label: 'Store Home' },
            { id: 'listings', label: `All Listings (${sellerListings.length})` },
            { id: 'categories', label: 'Categories' },
            { id: 'about', label: 'About & Maker Story' },
            { id: 'policies', label: 'Store Policies' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#14243A] text-[#14243A]'
                  : 'border-transparent text-[#5A6578] hover:text-[#14243A] hover:border-[#E2DFD8]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        
        {/* TAB 1: STORE HOME */}
        {activeTab === 'home' && (
          <div className="space-y-10">
            {/* Featured Listings Carousel / Grid */}
            {featuredListings.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C5A572]" />
                    <h2 className="text-base font-semibold text-[#14243A]">Featured Collection</h2>
                  </div>
                  <button
                    onClick={() => setActiveTab('listings')}
                    className="text-xs text-[#8E6D38] hover:text-[#14243A] font-medium cursor-pointer"
                  >
                    View All ({sellerListings.length}) →
                  </button>
                </div>

                <div className="novora-card-grid">
                  {featuredListings.map((listing) => (
                    <div
                      key={listing.id}
                      onClick={() => onSelectListing(listing)}
                      className="group bg-white rounded-2xl border border-[#E2DFD8] overflow-hidden hover:border-[#14243A] transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="aspect-4/3 w-full bg-[#EFECE5] relative overflow-hidden">
                        {listing.images && listing.images[0] ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#EFECE5] flex items-center justify-center text-[#8A94A6]">
                            No photo
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(listing.id);
                          }}
                          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs transition-colors shadow-xs ${
                            favorites.includes(listing.id)
                              ? 'bg-rose-50 text-rose-500'
                              : 'bg-white/80 hover:bg-white text-[#5A6578]'
                          }`}
                        >
                          <Heart className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>

                      <div className="p-4 space-y-2">
                        <h3 className="text-xs sm:text-sm font-semibold text-[#14243A] truncate group-hover:text-[#283548] transition-colors">
                          {listing.title}
                        </h3>
                        <p className="text-xs text-[#5A6578] line-clamp-2 leading-relaxed">
                          {listing.description}
                        </p>
                        <div className="pt-2 border-t border-[#EFECE5] flex items-center justify-between">
                          <span className="text-xs font-mono font-semibold text-[#14243A]">
                            {formatPrice(listing.price, listing.currency, displayCurrency)}
                          </span>
                          <span className="text-[11px] text-[#5A6578] capitalize">
                            {listing.condition?.replace('_', ' ') || 'Authentic'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Maker Story Brief */}
            <section className="p-6 sm:p-8 bg-[#F7F5F0] rounded-2xl border border-[#E2DFD8] space-y-4">
              <span className="text-[11px] font-mono tracking-wider text-[#8E6D38] uppercase font-semibold">
                About the Workshop & Craft
              </span>
              <h3 className="text-lg font-semibold text-[#14243A]">
                {store.storeName}
              </h3>
              <p className="text-xs sm:text-sm text-[#283548] leading-relaxed max-w-3xl">
                {store.story || store.description || 'Independent creator dedicated to verified quality and honest craftsmanship.'}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('about')}
                  className="text-xs font-medium text-[#8E6D38] hover:text-[#14243A] hover:underline cursor-pointer"
                >
                  Read full store story & policies →
                </button>
              </div>
            </section>

            {/* New Arrivals Grid */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-[#14243A]">Catalog Highlights</h2>
                <span className="text-xs text-[#5A6578]">{sellerListings.length} total items</span>
              </div>

              {sellerListings.length > 0 ? (
                <div className="novora-card-grid">
                  {sellerListings.slice(0, 6).map((listing) => (
                    <div
                      key={listing.id}
                      onClick={() => onSelectListing(listing)}
                      className="group bg-white rounded-2xl border border-[#E2DFD8] overflow-hidden hover:border-[#14243A] transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="aspect-4/3 w-full bg-[#EFECE5] relative overflow-hidden">
                        {listing.images && listing.images[0] ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#EFECE5]" />
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(listing.id);
                          }}
                          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs transition-colors shadow-xs ${
                            favorites.includes(listing.id)
                              ? 'bg-rose-50 text-rose-500'
                              : 'bg-white/80 hover:bg-white text-[#5A6578]'
                          }`}
                        >
                          <Heart className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>

                      <div className="p-4 space-y-2">
                        <h3 className="text-xs sm:text-sm font-semibold text-[#14243A] truncate group-hover:text-[#283548] transition-colors">
                          {listing.title}
                        </h3>
                        <div className="pt-2 border-t border-[#EFECE5] flex items-center justify-between">
                          <span className="text-xs font-mono font-semibold text-[#14243A]">
                            {formatPrice(listing.price, listing.currency, displayCurrency)}
                          </span>
                          <span className="text-[11px] text-[#5A6578]">
                            Ships worldwide
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={StoreIcon}
                  title="No active listings yet"
                  description="This seller hasn't published any items in their storefront yet. Check back soon!"
                />
              )}
            </section>
          </div>
        )}

        {/* TAB 2: ALL LISTINGS */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="p-4 bg-white rounded-2xl border border-[#E2DFD8] flex flex-col sm:flex-row gap-3 items-center justify-between shadow-2xs">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#8A94A6]" />
                <input
                  type="text"
                  value={storeSearchQuery}
                  onChange={(e) => setStoreSearchQuery(e.target.value)}
                  placeholder="Search this store..."
                  className="w-full text-xs pl-8 pr-3 py-2 bg-[#F7F5F0] border border-[#E2DFD8] rounded-xl focus:outline-hidden focus:border-[#14243A] text-[#14243A]"
                />
              </div>

              {/* Custom categories filter */}
              {store.categories && store.categories.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-[#14243A] text-white shadow-xs'
                        : 'bg-[#F7F5F0] text-[#5A6578] hover:bg-[#EFECE4] hover:text-[#14243A]'
                    }`}
                  >
                    All
                  </button>
                  {store.categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-[#14243A] text-white shadow-xs'
                          : 'bg-[#F7F5F0] text-[#5A6578] hover:bg-[#EFECE4] hover:text-[#14243A]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Grid */}
            {filteredListings.length > 0 ? (
              <div className="novora-card-grid">
                {filteredListings.map((listing) => (
                  <div
                    key={listing.id}
                    onClick={() => onSelectListing(listing)}
                    className="group bg-white rounded-2xl border border-[#E2DFD8] overflow-hidden hover:border-[#14243A] transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="aspect-4/3 w-full bg-[#EFECE5] relative overflow-hidden">
                      {listing.images && listing.images[0] ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#EFECE5]" />
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(listing.id);
                        }}
                        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs transition-colors shadow-xs ${
                          favorites.includes(listing.id)
                            ? 'bg-rose-50 text-rose-500'
                            : 'bg-white/80 hover:bg-white text-[#5A6578]'
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="text-xs sm:text-sm font-semibold text-[#14243A] truncate group-hover:text-[#283548] transition-colors">
                        {listing.title}
                      </h3>
                      <p className="text-xs text-[#5A6578] line-clamp-2 leading-relaxed">
                        {listing.description}
                      </p>
                      <div className="pt-2 border-t border-[#EFECE5] flex items-center justify-between">
                        <span className="text-xs font-mono font-semibold text-[#14243A]">
                          {formatPrice(listing.price, listing.currency, displayCurrency)}
                        </span>
                        <span className="text-[11px] text-[#5A6578]">
                          {listing.sellerCity || listing.sellerCountry}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Search}
                title="No matching listings found"
                description="Try clearing your search query or choosing another category filter."
                actionText="Clear Filter"
                onAction={() => {
                  setStoreSearchQuery('');
                  setSelectedCategory('all');
                }}
              />
            )}
          </div>
        )}

        {/* TAB 3: CUSTOM CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#14243A]">Store Collections & Categories</h2>
              <span className="text-xs text-[#5A6578]">{store.categories?.length || 0} collections</span>
            </div>

            {store.categories && store.categories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {store.categories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setActiveTab('listings');
                    }}
                    className="p-6 bg-white rounded-2xl border border-[#E2DFD8] hover:border-[#14243A] transition-all cursor-pointer shadow-2xs hover:shadow-md space-y-2"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#F7F3EB] text-[#C5A572] border border-[#E8DAC2] flex items-center justify-center font-semibold text-sm">
                      <Layers className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-[#14243A] pt-2">{cat.name}</h3>
                    <p className="text-xs text-[#5A6578] leading-relaxed">
                      {cat.description || 'Curated collection by the store maker.'}
                    </p>
                    <span className="inline-block text-xs text-[#8E6D38] hover:text-[#14243A] font-medium pt-2">
                      Browse Collection →
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Layers}
                title="No custom collections defined"
                description="This seller organizes their catalog by default marketplace categories."
                actionText="View All Items"
                onAction={() => setActiveTab('listings')}
              />
            )}
          </div>
        )}

        {/* TAB 4: ABOUT & STORY */}
        {activeTab === 'about' && (
          <div className="max-w-3xl space-y-8">
            <div className="p-6 sm:p-8 bg-white rounded-2xl border border-[#E2DFD8] space-y-4 shadow-2xs">
              <h2 className="text-base font-semibold text-[#14243A]">The Maker's Story</h2>
              <p className="text-xs sm:text-sm text-[#283548] leading-relaxed whitespace-pre-line">
                {store.story || store.description || 'Welcome to our workshop. We take pride in craftsmanship, verified origin, and personal customer communication.'}
              </p>
            </div>

            <div className="p-6 sm:p-8 bg-white rounded-2xl border border-[#E2DFD8] space-y-4 shadow-2xs">
              <h2 className="text-base font-semibold text-[#14243A]">Workshop Details & Identity</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <dt className="text-[#8A94A6] font-medium uppercase tracking-wider text-[10px]">Location</dt>
                  <dd className="font-semibold text-[#14243A] mt-1">{store.city ? `${store.city}, ` : ''}{store.country}</dd>
                </div>
                <div>
                  <dt className="text-[#8A94A6] font-medium uppercase tracking-wider text-[10px]">Business Type</dt>
                  <dd className="font-semibold text-[#14243A] mt-1 capitalize">{store.businessType?.replace('_', ' ') || 'Independent Maker'}</dd>
                </div>
                <div>
                  <dt className="text-[#8A94A6] font-medium uppercase tracking-wider text-[10px]">Languages</dt>
                  <dd className="font-semibold text-[#14243A] mt-1">{store.languages?.join(', ') || 'English'}</dd>
                </div>
                <div>
                  <dt className="text-[#8A94A6] font-medium uppercase tracking-wider text-[10px]">Member Since</dt>
                  <dd className="font-semibold text-[#14243A] mt-1">{new Date(store.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* TAB 5: POLICIES */}
        {activeTab === 'policies' && (
          <div className="max-w-3xl space-y-6">
            <div className="p-4 bg-[#F7F5F0] rounded-xl border border-[#E2DFD8] text-xs text-[#5A6578]">
              <p>
                <strong className="text-[#14243A]">Independent Store Policies:</strong> Sellers set their own transparent fulfillment and return guidelines. Novora ensures all communication occurs on-platform for dispute protection.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-white rounded-2xl border border-[#E2DFD8] space-y-2 shadow-2xs">
                <h3 className="text-xs sm:text-sm font-semibold text-[#14243A] flex items-center gap-2">
                  <span>Shipping & Fulfillment</span>
                </h3>
                <p className="text-xs text-[#5A6578] leading-relaxed">
                  {store.policies?.shippingPolicy || 'Standard international shipping with tracking provided.'}
                </p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-[#E2DFD8] space-y-2 shadow-2xs">
                <h3 className="text-xs sm:text-sm font-semibold text-[#14243A] flex items-center gap-2">
                  <span>Returns & Exchanges</span>
                </h3>
                <p className="text-xs text-[#5A6578] leading-relaxed">
                  {store.policies?.returnsPolicy || '14-day return window for items in original received condition.'}
                </p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-[#E2DFD8] space-y-2 shadow-2xs">
                <h3 className="text-xs sm:text-sm font-semibold text-[#14243A] flex items-center gap-2">
                  <span>Refunds Policy</span>
                </h3>
                <p className="text-xs text-[#5A6578] leading-relaxed">
                  {store.policies?.refundsPolicy || 'Full refunds issued upon inspection of returned goods or cancellation before dispatch.'}
                </p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-[#E2DFD8] space-y-2 shadow-2xs">
                <h3 className="text-xs sm:text-sm font-semibold text-[#14243A] flex items-center gap-2">
                  <span>Custom Orders & Turnaround</span>
                </h3>
                <p className="text-xs text-[#5A6578] leading-relaxed">
                  {store.policies?.customOrdersPolicy || 'Custom and personalized requests are welcome. Contact seller for turnaround estimates.'}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
