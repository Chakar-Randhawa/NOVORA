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

interface PublicStorefrontProps {
  store: Storefront;
  listings: Listing[];
  currentUser: UserProfile | null;
  favorites: string[];
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
    <div className="min-h-screen bg-[#FDFDFD] pb-24">
      {/* Top Breadcrumb Navigation */}
      <div className="bg-white border-b border-[#E5E7EB] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between text-xs">
          <button
            onClick={onBackToMarketplace}
            className="flex items-center gap-1.5 text-[#646B76] hover:text-[#17191F] font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Marketplace</span>
          </button>

          <div className="flex items-center gap-2">
            {isOwner && onEditStore && (
              <button
                onClick={onEditStore}
                className="px-3 py-1 bg-[#EEF2FF] text-[#4057D6] hover:bg-[#E0E7FF] rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Settings className="w-3 h-3" />
                <span>Manage Store</span>
              </button>
            )}
            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1 text-[#646B76] hover:text-[#17191F] hover:bg-[#F3F4F6] rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              title="Copy store link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Link Copied' : 'Copy Link'}</span>
            </button>
            <button
              onClick={handleShare}
              className="p-1.5 text-[#646B76] hover:text-[#17191F] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
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
        <div className="w-full h-44 sm:h-64 rounded-2xl overflow-hidden relative border border-[#E5E7EB] bg-linear-to-r from-[#17191F] via-[#2A303C] to-[#1E2530]">
          {store.bannerUrl ? (
            <img src={store.bannerUrl} alt={store.storeName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col justify-end p-6 sm:p-8 bg-radial from-white/10 to-transparent">
              <span className="text-[11px] font-mono tracking-widest text-white/60 uppercase">
                Independent Verified Storefront
              </span>
              <p className="text-xl sm:text-2xl font-semibold text-white/90">
                {store.storeName}
              </p>
            </div>
          )}
        </div>

        {/* Identity & Profile Bar */}
        <div className="relative px-4 sm:px-6 pb-6 pt-0 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-14 sm:-mt-16">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            {/* Logo */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-1.5 shadow-lg border border-[#E5E7EB] shrink-0">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.storeName} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="w-full h-full rounded-xl bg-[#EEF2FF] text-[#4057D6] flex items-center justify-center font-bold text-2xl">
                  {store.storeName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Titles */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#17191F] tracking-tight">
                  {store.storeName}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Verified Maker</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#4B5563]">
                {store.tagline || store.description?.slice(0, 100) || 'Authentic independent goods and custom craftsmanship.'}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-[#646B76] pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  <span>{store.city ? `${store.city}, ` : ''}{store.country}</span>
                </span>
                <span>·</span>
                <span>{sellerListings.length} {sellerListings.length === 1 ? 'Listing' : 'Listings'}</span>
                <span>·</span>
                <span className="font-mono text-[11px] text-[#4057D6]">@{store.storeSlug}</span>
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
                className="px-4 py-2 bg-[#17191F] hover:bg-[#27272A] text-white rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Contact Seller</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onReportStore(store)}
              className="p-2 text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#F3F4F6] rounded-xl transition-colors cursor-pointer"
              title="Report Store"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Announcement Banner (if configured) */}
        {store.announcement && (
          <div className="mb-6 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center gap-3 text-xs text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="flex-1 font-medium">{store.announcement}</p>
          </div>
        )}

        {/* Store Tabs */}
        <div className="border-b border-[#E5E7EB] flex items-center gap-1 sm:gap-2 overflow-x-auto">
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
                  ? 'border-[#17191F] text-[#17191F]'
                  : 'border-transparent text-[#646B76] hover:text-[#17191F] hover:border-[#D1D5DB]'
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
                    <Sparkles className="w-4 h-4 text-[#4057D6]" />
                    <h2 className="text-base font-semibold text-[#17191F]">Featured Collection</h2>
                  </div>
                  <button
                    onClick={() => setActiveTab('listings')}
                    className="text-xs text-[#4057D6] hover:underline font-medium cursor-pointer"
                  >
                    View All ({sellerListings.length}) →
                  </button>
                </div>

                <div className="novora-card-grid">
                  {featuredListings.map((listing) => (
                    <div
                      key={listing.id}
                      onClick={() => onSelectListing(listing)}
                      className="group bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:border-[#17191F] transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="aspect-4/3 w-full bg-[#F3F4F6] relative overflow-hidden">
                        {listing.images && listing.images[0] ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#E5E7EB] flex items-center justify-center text-[#9CA3AF]">
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
                              : 'bg-white/80 hover:bg-white text-[#646B76]'
                          }`}
                        >
                          <Heart className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>

                      <div className="p-4 space-y-2">
                        <h3 className="text-xs sm:text-sm font-semibold text-[#17191F] truncate group-hover:text-[#4057D6] transition-colors">
                          {listing.title}
                        </h3>
                        <p className="text-xs text-[#646B76] line-clamp-2 leading-relaxed">
                          {listing.description}
                        </p>
                        <div className="pt-2 border-t border-[#F3F4F6] flex items-center justify-between">
                          <span className="text-xs font-mono font-semibold text-[#17191F]">
                            {formatPrice(listing.price, listing.currency)}
                          </span>
                          <span className="text-[11px] text-[#646B76] capitalize">
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
            <section className="p-6 sm:p-8 bg-[#FAFAF8] rounded-2xl border border-[#E5E7EB] space-y-4">
              <span className="text-[11px] font-mono tracking-wider text-[#646B76] uppercase">
                About the Workshop & Craft
              </span>
              <h3 className="text-lg font-semibold text-[#17191F]">
                {store.storeName}
              </h3>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed max-w-3xl">
                {store.story || store.description || 'Independent creator dedicated to verified quality and honest craftsmanship.'}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('about')}
                  className="text-xs font-medium text-[#4057D6] hover:underline cursor-pointer"
                >
                  Read full store story & policies →
                </button>
              </div>
            </section>

            {/* New Arrivals Grid */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-[#17191F]">Catalog Highlights</h2>
                <span className="text-xs text-[#646B76]">{sellerListings.length} total items</span>
              </div>

              {sellerListings.length > 0 ? (
                <div className="novora-card-grid">
                  {sellerListings.slice(0, 6).map((listing) => (
                    <div
                      key={listing.id}
                      onClick={() => onSelectListing(listing)}
                      className="group bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:border-[#17191F] transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="aspect-4/3 w-full bg-[#F3F4F6] relative overflow-hidden">
                        {listing.images && listing.images[0] ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#E5E7EB]" />
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
                              : 'bg-white/80 hover:bg-white text-[#646B76]'
                          }`}
                        >
                          <Heart className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>

                      <div className="p-4 space-y-2">
                        <h3 className="text-xs sm:text-sm font-semibold text-[#17191F] truncate group-hover:text-[#4057D6] transition-colors">
                          {listing.title}
                        </h3>
                        <div className="pt-2 border-t border-[#F3F4F6] flex items-center justify-between">
                          <span className="text-xs font-mono font-semibold text-[#17191F]">
                            {formatPrice(listing.price, listing.currency)}
                          </span>
                          <span className="text-[11px] text-[#646B76]">
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
            <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col sm:flex-row gap-3 items-center justify-between shadow-2xs">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={storeSearchQuery}
                  onChange={(e) => setStoreSearchQuery(e.target.value)}
                  placeholder="Search this store..."
                  className="w-full text-xs pl-8 pr-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-hidden focus:border-[#4057D6]"
                />
              </div>

              {/* Custom categories filter */}
              {store.categories && store.categories.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-[#17191F] text-white'
                        : 'bg-[#F3F4F6] text-[#646B76] hover:bg-[#E5E7EB]'
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
                          ? 'bg-[#17191F] text-white'
                          : 'bg-[#F3F4F6] text-[#646B76] hover:bg-[#E5E7EB]'
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
                    className="group bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:border-[#17191F] transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="aspect-4/3 w-full bg-[#F3F4F6] relative overflow-hidden">
                      {listing.images && listing.images[0] ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#E5E7EB]" />
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
                            : 'bg-white/80 hover:bg-white text-[#646B76]'
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="text-xs sm:text-sm font-semibold text-[#17191F] truncate group-hover:text-[#4057D6] transition-colors">
                        {listing.title}
                      </h3>
                      <p className="text-xs text-[#646B76] line-clamp-2 leading-relaxed">
                        {listing.description}
                      </p>
                      <div className="pt-2 border-t border-[#F3F4F6] flex items-center justify-between">
                        <span className="text-xs font-mono font-semibold text-[#17191F]">
                          {formatPrice(listing.price, listing.currency)}
                        </span>
                        <span className="text-[11px] text-[#646B76]">
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
              <h2 className="text-base font-semibold text-[#17191F]">Store Collections & Categories</h2>
              <span className="text-xs text-[#646B76]">{store.categories?.length || 0} collections</span>
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
                    className="p-6 bg-white rounded-2xl border border-[#E5E7EB] hover:border-[#17191F] transition-all cursor-pointer shadow-2xs hover:shadow-md space-y-2"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4057D6] flex items-center justify-center font-semibold text-sm">
                      <Layers className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-[#17191F] pt-2">{cat.name}</h3>
                    <p className="text-xs text-[#646B76] leading-relaxed">
                      {cat.description || 'Curated collection by the store maker.'}
                    </p>
                    <span className="inline-block text-xs text-[#4057D6] font-medium pt-2">
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
            <div className="p-6 sm:p-8 bg-white rounded-2xl border border-[#E5E7EB] space-y-4 shadow-2xs">
              <h2 className="text-base font-semibold text-[#17191F]">The Maker's Story</h2>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed whitespace-pre-line">
                {store.story || store.description || 'Welcome to our workshop. We take pride in craftsmanship, verified origin, and personal customer communication.'}
              </p>
            </div>

            <div className="p-6 sm:p-8 bg-white rounded-2xl border border-[#E5E7EB] space-y-4 shadow-2xs">
              <h2 className="text-base font-semibold text-[#17191F]">Workshop Details & Identity</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <dt className="text-[#9CA3AF] font-medium uppercase tracking-wider text-[10px]">Location</dt>
                  <dd className="font-semibold text-[#17191F] mt-1">{store.city ? `${store.city}, ` : ''}{store.country}</dd>
                </div>
                <div>
                  <dt className="text-[#9CA3AF] font-medium uppercase tracking-wider text-[10px]">Business Type</dt>
                  <dd className="font-semibold text-[#17191F] mt-1 capitalize">{store.businessType?.replace('_', ' ') || 'Independent Maker'}</dd>
                </div>
                <div>
                  <dt className="text-[#9CA3AF] font-medium uppercase tracking-wider text-[10px]">Languages</dt>
                  <dd className="font-semibold text-[#17191F] mt-1">{store.languages?.join(', ') || 'English'}</dd>
                </div>
                <div>
                  <dt className="text-[#9CA3AF] font-medium uppercase tracking-wider text-[10px]">Member Since</dt>
                  <dd className="font-semibold text-[#17191F] mt-1">{new Date(store.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* TAB 5: POLICIES */}
        {activeTab === 'policies' && (
          <div className="max-w-3xl space-y-6">
            <div className="p-4 bg-[#FAFAF8] rounded-xl border border-[#E5E7EB] text-xs text-[#646B76]">
              <p>
                <strong>Independent Store Policies:</strong> Sellers set their own transparent fulfillment and return guidelines. Novora ensures all communication occurs on-platform for dispute protection.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] space-y-2 shadow-2xs">
                <h3 className="text-xs sm:text-sm font-semibold text-[#17191F] flex items-center gap-2">
                  <span>Shipping & Fulfillment</span>
                </h3>
                <p className="text-xs text-[#4B5563] leading-relaxed">
                  {store.policies?.shippingPolicy || 'Standard international shipping with tracking provided.'}
                </p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] space-y-2 shadow-2xs">
                <h3 className="text-xs sm:text-sm font-semibold text-[#17191F] flex items-center gap-2">
                  <span>Returns & Exchanges</span>
                </h3>
                <p className="text-xs text-[#4B5563] leading-relaxed">
                  {store.policies?.returnsPolicy || '14-day return window for items in original received condition.'}
                </p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] space-y-2 shadow-2xs">
                <h3 className="text-xs sm:text-sm font-semibold text-[#17191F] flex items-center gap-2">
                  <span>Refunds Policy</span>
                </h3>
                <p className="text-xs text-[#4B5563] leading-relaxed">
                  {store.policies?.refundsPolicy || 'Full refunds issued upon inspection of returned goods or cancellation before dispatch.'}
                </p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] space-y-2 shadow-2xs">
                <h3 className="text-xs sm:text-sm font-semibold text-[#17191F] flex items-center gap-2">
                  <span>Custom Orders & Turnaround</span>
                </h3>
                <p className="text-xs text-[#4B5563] leading-relaxed">
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
