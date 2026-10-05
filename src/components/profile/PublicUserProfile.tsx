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

interface PublicUserProfileProps {
  user: UserProfile;
  listings: Listing[];
  store: Storefront | null;
  currentUser: UserProfile | null;
  favorites: string[];
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
            {store && (
              <button
                onClick={() => onViewStore(store)}
                className="px-3 py-1 bg-[#EEF2FF] text-[#4057D6] hover:bg-[#E0E7FF] rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <StoreIcon className="w-3.5 h-3.5" />
                <span>Visit Storefront</span>
              </button>
            )}
            <button
              onClick={handleShare}
              className="px-2.5 py-1 text-[#646B76] hover:text-[#17191F] hover:bg-[#F3F4F6] rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Link Copied' : 'Share Profile'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-left">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#EEF2FF] text-[#4057D6] flex items-center justify-center font-bold text-3xl overflow-hidden border border-[#E5E7EB] shadow-xs shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>

            {/* Profile Info */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#17191F] tracking-tight">
                  {user.name}
                </h1>
                {user.isSeller && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EEF2FF] text-[#4057D6] border border-[#C7D2FE]">
                    Verified Seller
                  </span>
                )}
                {user.isAdmin && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                    Staff
                  </span>
                )}
              </div>

              <p className="text-xs text-[#646B76] font-mono">
                @{user.username || 'user'}
              </p>

              {user.sellerTagline && (
                <p className="text-xs sm:text-sm font-medium text-[#374151]">
                  "{user.sellerTagline}"
                </p>
              )}

              {user.bio && (
                <p className="text-xs text-[#4B5563] max-w-xl leading-relaxed pt-1">
                  {user.bio}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#646B76] pt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{user.city ? `${user.city}, ` : ''}{user.country || 'Global'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#9CA3AF]" />
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
                className="px-4 py-2 bg-[#17191F] hover:bg-[#27272A] text-white rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Contact</span>
              </button>
            )}

            {store && (
              <button
                type="button"
                onClick={() => onViewStore(store)}
                className="px-4 py-2 bg-white border border-[#E5E7EB] hover:bg-[#F3F4F6] text-[#17191F] rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
              >
                <StoreIcon className="w-4 h-4 text-[#4057D6]" />
                <span>Storefront</span>
              </button>
            )}

            {!isCurrentUser && (
              <button
                type="button"
                onClick={() => onReportUser(user)}
                className="p-2 text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#F3F4F6] rounded-xl transition-colors cursor-pointer"
                title="Report User"
              >
                <Flag className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 border-b border-[#E5E7EB] flex items-center gap-2">
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
                  ? 'border-[#17191F] text-[#17191F]'
                  : 'border-transparent text-[#646B76] hover:text-[#17191F] hover:border-[#D1D5DB]'
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
                  className="p-6 bg-linear-to-r from-[#FAFAF8] via-white to-[#EEF2FF] rounded-2xl border border-[#C7D2FE] flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4 text-center sm:text-left">
                    <div className="w-14 h-14 rounded-2xl bg-white p-1 border border-[#E5E7EB] shadow-xs shrink-0">
                      {store.logoUrl ? (
                        <img src={store.logoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <div className="w-full h-full rounded-xl bg-[#EEF2FF] text-[#4057D6] flex items-center justify-center font-bold">
                          {store.storeName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-[#4057D6] uppercase tracking-wider font-semibold">
                        Official Storefront
                      </span>
                      <h3 className="text-base font-bold text-[#17191F]">{store.storeName}</h3>
                      <p className="text-xs text-[#646B76] line-clamp-1">{store.tagline || 'Explore curated catalog and artisan story'}</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-[#4057D6] text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shrink-0 shadow-xs">
                    <span>Visit Store</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}

              {/* Active Listings Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-[#17191F]">Active Listings</h2>
                  <span className="text-xs text-[#646B76]">{userListings.length} published</span>
                </div>

                {userListings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userListings.map((listing) => (
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userListings.map((listing) => (
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {serviceListings.map((listing) => (
                    <div
                      key={listing.id}
                      onClick={() => onSelectListing(listing)}
                      className="p-5 bg-white rounded-2xl border border-[#E5E7EB] hover:border-[#17191F] transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-md"
                    >
                      <div className="space-y-2">
                        <span className="px-2 py-0.5 bg-[#EEF2FF] text-[#4057D6] rounded-md text-[10px] font-semibold">
                          Service
                        </span>
                        <h3 className="text-sm font-semibold text-[#17191F]">{listing.title}</h3>
                        <p className="text-xs text-[#646B76] line-clamp-3 leading-relaxed">{listing.description}</p>
                      </div>
                      <div className="pt-3 border-t border-[#F3F4F6] flex items-center justify-between text-xs">
                        <span className="font-mono font-semibold text-[#17191F]">
                          {formatPrice(listing.price, listing.currency)}
                        </span>
                        <span className="text-[#4057D6] font-medium">Inquire →</span>
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
              <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] space-y-4 shadow-2xs">
                <h3 className="text-sm font-semibold text-[#17191F]">Account & Community Details</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <dt className="text-[#9CA3AF] uppercase text-[10px] font-medium">Location</dt>
                    <dd className="font-semibold text-[#17191F] mt-1">{user.city ? `${user.city}, ` : ''}{user.country || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="text-[#9CA3AF] uppercase text-[10px] font-medium">Languages</dt>
                    <dd className="font-semibold text-[#17191F] mt-1">{user.languages?.join(', ') || 'English'}</dd>
                  </div>
                  <div>
                    <dt className="text-[#9CA3AF] uppercase text-[10px] font-medium">Preferred Currency</dt>
                    <dd className="font-semibold text-[#17191F] mt-1 font-mono">{user.preferredCurrency || 'USD'}</dd>
                  </div>
                  <div>
                    <dt className="text-[#9CA3AF] uppercase text-[10px] font-medium">Member Since</dt>
                    <dd className="font-semibold text-[#17191F] mt-1">{new Date(user.joinedDate || Date.now()).toLocaleDateString()}</dd>
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
