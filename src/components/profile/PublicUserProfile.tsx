import React, { useState, useMemo } from 'react';
import {
  User as UserIcon,
  MapPin,
  Calendar,
  MessageSquare,
  Share2,
  Store as StoreIcon,
  Flag,
  ShieldCheck,
  Globe,
  Tag,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Layers,
  Heart
} from 'lucide-react';
import { UserProfile, Listing, Storefront } from '../../types';
import { formatPrice } from '../../data/countries';
import { EmptyState } from '../common/DesignTokens';
import { Breadcrumbs } from '../common/Breadcrumbs';

interface PublicUserProfileProps {
  user: UserProfile;
  listings: Listing[];
  store: Storefront | null;
  currentUser: UserProfile | null;
  favorites: string[];
  displayCurrency?: string;
  onSelectListing: (listing: Listing) => void;
  onToggleFavorite: (id: string) => void;
  onStartMessage: (sellerId: string, sellerName: string) => void;
  onViewStore: (store: Storefront) => void;
  onReportUser: (user: UserProfile) => void;
  onBackToMarketplace: () => void;
  onOpenAuth?: (mode: 'signin' | 'register') => void;
}

export const PublicUserProfile: React.FC<PublicUserProfileProps> = ({
  user,
  listings,
  store,
  currentUser,
  favorites,
  displayCurrency,
  onSelectListing,
  onToggleFavorite,
  onStartMessage,
  onViewStore,
  onReportUser,
  onBackToMarketplace,
  onOpenAuth
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'services' | 'about'>('overview');
  const [copiedLink, setCopiedLink] = useState(false);

  const isCurrentUser = currentUser?.id === user.id;

  // Active listings by this user
  const userListings = useMemo(() => {
    return listings.filter(l => l.sellerId === user.id && l.status === 'active');
  }, [listings, user.id]);

  // Separate services from goods
  const serviceListings = useMemo(() => {
    return userListings.filter(l => 
      l.listingType === 'professional_service' || 
      l.listingType === 'creative_service' || 
      l.categoryId === 'services'
    );
  }, [userListings]);

  // Unique categories sold
  const activeCategories = useMemo(() => {
    const cats = new Set(userListings.map(l => l.categoryId));
    return Array.from(cats);
  }, [userListings]);

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}?profile=${user.username || user.id}`;
    if (navigator.share) {
      navigator.share({
        title: user.name,
        text: `Discover ${user.name}'s profile on NOVORA`,
        url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
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
                { label: 'Community Members', onClick: onBackToMarketplace },
                { label: user.name, current: true }
              ]}
              className="py-0 px-0"
            />
          </div>

          <div className="flex items-center gap-2">
            {store && (
              <button
                onClick={() => onViewStore(store)}
                className="px-3 py-1 bg-[#F7F5F0] text-[#14243A] hover:bg-[#EFECE5] border border-[#E2DFD8] rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <StoreIcon className="w-3.5 h-3.5 text-[#C5A572]" />
                <span>Visit Storefront</span>
              </button>
            )}
            <button
              onClick={handleShare}
              className="px-2.5 py-1 text-[#5A6578] hover:text-[#14243A] hover:bg-[#F7F5F0] rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Link Copied' : 'Share Profile'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <div className="bg-white rounded-3xl border border-[#E2DFD8] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-left">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#14243A] text-white flex items-center justify-center font-bold text-3xl overflow-hidden border border-[#E2DFD8] shadow-xs shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>

            {/* Profile Info */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#14243A] tracking-tight">
                  {user.name}
                </h1>
                {user.isSeller && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F7F5F0] text-[#8E6D38] border border-[#E8DAC2] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A572]" />
                    <span>Verified Seller</span>
                  </span>
                )}
                {user.isAdmin && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#14243A] text-white">
                    Staff
                  </span>
                )}
              </div>

              <p className="text-xs text-[#5A6578] font-mono">
                @{user.username || 'user'}
              </p>

              {user.sellerTagline && (
                <p className="text-xs sm:text-sm font-medium text-[#283548]">
                  "{user.sellerTagline}"
                </p>
              )}

              {user.bio && (
                <p className="text-xs text-[#5A6578] max-w-xl leading-relaxed pt-1">
                  {user.bio}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#5A6578] pt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C5A572]" />
                  <span>{user.city ? `${user.city}, ` : ''}{user.country || 'Global'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#8A94A6]" />
                  <span>Member since {new Date(user.joinedDate || Date.now()).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 shrink-0 pt-2 sm:pt-0">
            {!isCurrentUser && (
              <button
                type="button"
                onClick={() => {
                  if (!currentUser && onOpenAuth) {
                    onOpenAuth('signin');
                  } else {
                    onStartMessage(user.id, user.name);
                  }
                }}
                className="px-4 py-2 bg-[#14243A] hover:bg-[#0E1B2D] text-white rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
              >
                <MessageSquare className="w-4 h-4 text-[#C5A572]" />
                <span>Contact</span>
              </button>
            )}

            {store && (
              <button
                type="button"
                onClick={() => onViewStore(store)}
                className="px-4 py-2 bg-white border border-[#E2DFD8] hover:border-[#14243A] text-[#14243A] rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
              >
                <StoreIcon className="w-4 h-4 text-[#C5A572]" />
                <span>Storefront</span>
              </button>
            )}

            {!isCurrentUser && (
              <button
                type="button"
                onClick={() => onReportUser(user)}
                className="p-2 text-[#8A94A6] hover:text-[#EF4444] hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Report User"
              >
                <Flag className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 border-b border-[#E2DFD8] flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'listings', label: `Listings (${userListings.length})` },
            { id: 'services', label: `Services (${serviceListings.length})` },
            { id: 'about', label: 'About & Languages' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#14243A] text-[#14243A] font-semibold'
                  : 'border-transparent text-[#5A6578] hover:text-[#14243A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="pt-8">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Storefront Highlight Banner if seller has store */}
              {store && (
                <div
                  onClick={() => onViewStore(store)}
                  className="p-6 bg-linear-to-r from-white via-[#F7F5F0] to-white rounded-2xl border border-[#E2DFD8] flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all shadow-2xs group"
                >
                  <div className="flex items-center gap-4 text-center sm:text-left">
                    <div className="w-14 h-14 rounded-2xl bg-[#F7F5F0] p-1 border border-[#E2DFD8] shadow-xs shrink-0 flex items-center justify-center">
                      {store.logoUrl ? (
                        <img src={store.logoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <div className="w-full h-full rounded-xl bg-white text-[#C5A572] flex items-center justify-center font-bold text-lg">
                          {store.storeName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-[#8E6D38] uppercase tracking-wider font-semibold">
                        Official Storefront
                      </span>
                      <h3 className="text-base font-bold text-[#14243A] group-hover:text-[#283548] transition-colors">{store.storeName}</h3>
                      <p className="text-xs text-[#5A6578] line-clamp-1">{store.tagline || 'Explore curated catalog and artisan story'}</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-[#14243A] group-hover:bg-[#0E1B2D] text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shrink-0 shadow-xs transition-colors active:scale-[0.98]">
                    <span>Visit Store</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#C5A572]" />
                  </div>
                </div>
              )}

              {/* Active Listings Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-[#14243A]">Active Listings</h2>
                  <span className="text-xs text-[#5A6578]">{userListings.length} published</span>
                </div>

                {userListings.length > 0 ? (
                  <div className="novora-card-grid">
                    {userListings.map((listing) => (
                      <div
                        key={listing.id}
                        onClick={() => onSelectListing(listing)}
                        className="group bg-white rounded-2xl border border-[#E2DFD8] overflow-hidden hover:border-[#14243A] transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="aspect-4/3 w-full bg-[#F7F5F0] relative overflow-hidden">
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
                              {listing.condition?.replace('_', ' ') || 'Authentic'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Tag}
                    title="No active public listings"
                    description="This user does not currently have any active items listed for sale."
                  />
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ALL LISTINGS */}
          {activeTab === 'listings' && (
            <div className="space-y-6">
              {userListings.length > 0 ? (
                <div className="novora-card-grid">
                  {userListings.map((listing) => (
                    <div
                      key={listing.id}
                      onClick={() => onSelectListing(listing)}
                      className="group bg-white rounded-2xl border border-[#E2DFD8] overflow-hidden hover:border-[#14243A] transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="aspect-4/3 w-full bg-[#F7F5F0] relative overflow-hidden">
                        {listing.images && listing.images[0] ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#EFECE5]" />
                        )}
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Tag}
                  title="No listings published"
                  description="All listings from this seller will appear here."
                />
              )}
            </div>
          )}

          {/* TAB 3: SERVICES */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              {serviceListings.length > 0 ? (
                <div className="novora-card-grid">
                  {serviceListings.map((listing) => (
                    <div
                      key={listing.id}
                      onClick={() => onSelectListing(listing)}
                      className="p-5 bg-white rounded-2xl border border-[#E2DFD8] hover:border-[#14243A] transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-md group"
                    >
                      <div className="space-y-2">
                        <span className="px-2.5 py-0.5 bg-[#F7F5F0] text-[#8E6D38] border border-[#E8DAC2] rounded-md text-[10px] font-semibold">
                          Service
                        </span>
                        <h3 className="text-sm font-semibold text-[#14243A] group-hover:text-[#283548] transition-colors">{listing.title}</h3>
                        <p className="text-xs text-[#5A6578] line-clamp-3 leading-relaxed">{listing.description}</p>
                      </div>
                      <div className="pt-3 border-t border-[#EFECE5] flex items-center justify-between text-xs">
                        <span className="font-mono font-semibold text-[#14243A]">
                          {formatPrice(listing.price, listing.currency, displayCurrency)}
                        </span>
                        <span className="text-[#14243A] group-hover:text-[#8E6D38] font-medium transition-colors">Inquire →</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Layers}
                  title="No standalone services"
                  description="This seller currently focuses on physical and digital products."
                />
              )}
            </div>
          )}

          {/* TAB 4: ABOUT */}
          {activeTab === 'about' && (
            <div className="max-w-2xl space-y-6">
              <div className="p-6 bg-white rounded-2xl border border-[#E2DFD8] space-y-4 shadow-2xs">
                <h3 className="text-sm font-semibold text-[#14243A]">Account & Community Details</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <dt className="text-[#8A94A6] uppercase text-[10px] font-medium">Location</dt>
                    <dd className="font-semibold text-[#14243A] mt-1">{user.city ? `${user.city}, ` : ''}{user.country || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="text-[#8A94A6] uppercase text-[10px] font-medium">Languages</dt>
                    <dd className="font-semibold text-[#14243A] mt-1">{user.languages?.join(', ') || 'English'}</dd>
                  </div>
                  <div>
                    <dt className="text-[#8A94A6] uppercase text-[10px] font-medium">Preferred Currency</dt>
                    <dd className="font-semibold text-[#14243A] mt-1 font-mono">{user.preferredCurrency || 'USD'}</dd>
                  </div>
                  <div>
                    <dt className="text-[#8A94A6] uppercase text-[10px] font-medium">Member Since</dt>
                    <dd className="font-semibold text-[#14243A] mt-1">{new Date(user.joinedDate || Date.now()).toLocaleDateString()}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
