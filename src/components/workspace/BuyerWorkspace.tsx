import React, { useState, useMemo, useEffect } from 'react';
import {
  Heart,
  Compass,
  MessageSquare,
  User,
  Settings,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  Trash2,
  Tag,
  DollarSign,
  Clock,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Eye,
  Store,
  Loader2
} from 'lucide-react';
import { Listing, BuyerRequest, RequestOffer, UserProfile, Conversation } from '../../types';
import { formatPrice, COUNTRIES } from '../../data/countries';
import { EmptyState } from '../common/DesignTokens';

interface BuyerWorkspaceProps {
  currentUser: UserProfile | null;
  favorites: string[];
  allListings: Listing[];
  requests: BuyerRequest[];
  offers: RequestOffer[];
  conversations: Conversation[];
  onSelectListing: (listing: Listing) => void;
  onOpenCreateRequest: () => void;
  onOpenMessages: (conv?: Conversation) => void;
  onUpdateOfferStatus?: (offerId: string, status: 'accepted' | 'declined') => void;
  onStartMessageWithSeller?: (sellerId: string, sellerName: string, context?: any) => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onDeleteAccount: (userId: string) => void;
  onOpenAuth: (mode?: 'signin' | 'register') => void;
  onToggleFavorite?: (listingId: string) => void;
}

export const BuyerWorkspace: React.FC<BuyerWorkspaceProps> = ({
  currentUser,
  favorites,
  allListings,
  requests,
  offers,
  conversations,
  onSelectListing,
  onOpenCreateRequest,
  onOpenMessages,
  onUpdateOfferStatus,
  onStartMessageWithSeller,
  onUpdateProfile,
  onDeleteAccount,
  onOpenAuth,
  onToggleFavorite
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'favorites' | 'requests' | 'quotes' | 'recent' | 'settings'>('overview');
  const [name, setName] = useState(currentUser?.name || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [country, setCountry] = useState(currentUser?.country || 'US');
  const [currency, setCurrency] = useState(currentUser?.preferredCurrency || 'USD');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Recently viewed listings stored in localStorage
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('novora_recent_viewed');
      if (raw) {
        setRecentlyViewedIds(JSON.parse(raw));
      }
    } catch {
      // ignore
    }
  }, []);

  const recentlyViewedListings = useMemo(() => {
    return allListings.filter(l => recentlyViewedIds.includes(l.id));
  }, [allListings, recentlyViewedIds]);

  if (!currentUser) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-[#E2DFD8] p-8 space-y-4 max-w-md mx-auto shadow-xs">
        <User className="w-10 h-10 text-[#C5A572] mx-auto" />
        <h3 className="text-base font-semibold text-[#14243A]">Buyer Workspace Access</h3>
        <p className="text-xs text-[#5A6578] leading-relaxed">
          Please sign in to view your saved wishlist items, active procurement requests, and received seller quotes.
        </p>
        <button
          onClick={() => onOpenAuth('signin')}
          className="px-5 py-2.5 bg-[#14243A] text-white text-xs font-medium rounded-xl hover:bg-[#0E1B2D] transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const favoriteListings = allListings.filter(l => favorites.includes(l.id));
  const myRequests = requests.filter(r => r.buyerId === currentUser.id);

  // Offers received on my requests
  const myRequestIds = new Set(myRequests.map(r => r.id));
  const receivedOffers = offers.filter(o => myRequestIds.has(o.requestId));

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateProfile({
        ...currentUser,
        name: name.trim(),
        bio: bio.trim(),
        country,
        preferredCurrency: currency
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const BUYER_NAV_ITEMS = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'favorites', label: `Saved Items (${favoriteListings.length})`, icon: Heart },
    { id: 'requests', label: `My Requests (${myRequests.length})`, icon: Compass },
    { id: 'quotes', label: `Quotes Received (${receivedOffers.length})`, icon: DollarSign, highlight: receivedOffers.length > 0 },
    { id: 'recent', label: `Recently Viewed (${recentlyViewedListings.length})`, icon: Clock },
    { id: 'settings', label: 'Preferences & Account', icon: Settings }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
      
      {/* Mobile / Tablet Horizontal Navigation (< 1024px) */}
      <div className="lg:hidden w-full space-y-3">
        <div className="bg-white rounded-2xl border border-[#E2DFD8] p-3.5 flex items-center justify-between shadow-2xs gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#F7F3EB] text-[#8E6D38] border border-[#E8DAC2] flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-semibold text-[#14243A] truncate">{currentUser.name}</h3>
              <p className="text-[10px] text-[#5A6578] truncate">Buyer Dashboard</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenCreateRequest}
            className="px-3 py-1.5 bg-[#14243A] text-white rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer shadow-xs shrink-0 active:scale-[0.98]"
          >
            <Compass className="w-3.5 h-3.5 text-[#C5A572]" />
            <span>Request</span>
          </button>
        </div>

        {/* Mobile Horizontal Scrolling Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {BUYER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as any)}
                className={`px-3 py-2 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#14243A] text-white shadow-xs'
                    : 'bg-white border border-[#E2DFD8] text-[#5A6578] hover:text-[#14243A]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C5A572]' : item.highlight ? 'text-emerald-600' : 'text-[#5A6578]'}`} />
                <span>{item.label}</span>
                {item.highlight && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Sidebar Navigation (>= 1024px) */}
      <aside className="hidden lg:block w-64 bg-white rounded-3xl border border-[#E2DFD8] p-4 shadow-xs shrink-0 space-y-6">
        <div>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 rounded-xl bg-[#F7F3EB] text-[#8E6D38] border border-[#E8DAC2] flex items-center justify-center font-bold text-sm shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-semibold text-[#14243A] truncate">{currentUser.name}</h3>
              <p className="text-[11px] text-[#5A6578] truncate">Buyer Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1 text-xs">
          {BUYER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#14243A] text-white shadow-2xs'
                    : 'text-[#5A6578] hover:text-[#14243A] hover:bg-[#F7F5F0]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#C5A572]' : item.highlight ? 'text-emerald-600' : 'text-[#5A6578]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.highlight && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-[#E2DFD8] space-y-2">
          <button
            type="button"
            onClick={onOpenCreateRequest}
            className="w-full py-2.5 px-3 bg-[#14243A] hover:bg-[#0E1B2D] text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <Compass className="w-3.5 h-3.5 text-[#C5A572]" />
            <span>Post Buyer Request</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 w-full space-y-6 min-w-0">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-white rounded-3xl border border-[#E2DFD8] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
              <div>
                <span className="text-xs font-semibold text-[#8E6D38] uppercase tracking-wider block mb-1">
                  Buyer Sanctuary & Discoveries
                </span>
                <h2 className="text-2xl font-bold text-[#14243A] tracking-tight">
                  Welcome, {currentUser.name}
                </h2>
                <p className="text-xs text-[#5A6578] mt-1 max-w-lg leading-relaxed">
                  Track your saved wishlist items, active procurement sourcing posts, and quotes received from independent sellers worldwide.
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenCreateRequest}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#14243A] hover:bg-[#0E1B2D] text-white rounded-xl text-xs font-medium flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer active:scale-[0.98]"
              >
                <Compass className="w-4 h-4 text-[#C5A572]" />
                <span>Post Request</span>
              </button>
            </div>

            {/* Quick Metrics (Fluid 2-col on mobile, 4-col on lg) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div 
                onClick={() => setActiveTab('favorites')}
                className="p-5 bg-white rounded-2xl border border-[#E2DFD8] shadow-2xs cursor-pointer hover:border-[#14243A] transition-all"
              >
                <span className="text-[10px] font-semibold text-[#5A6578] uppercase tracking-wider block">Saved Items</span>
                <div className="text-2xl font-bold font-mono text-[#14243A] mt-1.5">{favoriteListings.length}</div>
                <p className="text-[11px] text-[#5A6578] mt-0.5">In your wishlist</p>
              </div>

              <div 
                onClick={() => setActiveTab('requests')}
                className="p-5 bg-white rounded-2xl border border-[#E2DFD8] shadow-2xs cursor-pointer hover:border-[#14243A] transition-all"
              >
                <span className="text-[10px] font-semibold text-[#5A6578] uppercase tracking-wider block">My Requests</span>
                <div className="text-2xl font-bold font-mono text-[#14243A] mt-1.5">{myRequests.length}</div>
                <p className="text-[11px] text-[#5A6578] mt-0.5">Active in Request Orbit</p>
              </div>

              <div 
                onClick={() => setActiveTab('quotes')}
                className="p-5 bg-white rounded-2xl border border-[#E2DFD8] shadow-2xs cursor-pointer hover:border-[#14243A] transition-all"
              >
                <span className="text-[10px] font-semibold text-[#5A6578] uppercase tracking-wider block">Seller Quotes</span>
                <div className="text-2xl font-bold font-mono text-[#14243A] mt-1.5">{receivedOffers.length}</div>
                <p className="text-[11px] text-[#5A6578] mt-0.5">Proposals received</p>
              </div>

              <div 
                onClick={() => onOpenMessages()}
                className="p-5 bg-white rounded-2xl border border-[#E2DFD8] shadow-2xs cursor-pointer hover:border-[#14243A] transition-all"
              >
                <span className="text-[10px] font-semibold text-[#5A6578] uppercase tracking-wider block">Active Chats</span>
                <div className="text-2xl font-bold font-mono text-[#14243A] mt-1.5">{conversations.length}</div>
                <p className="text-[11px] text-[#5A6578] mt-0.5">With makers & sellers</p>
              </div>
            </div>

            {/* Recent Saved Items Preview */}
            <div className="bg-white rounded-3xl border border-[#E2DFD8] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#14243A]">Wishlist Highlights</h3>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className="text-xs text-[#8E6D38] hover:underline font-medium cursor-pointer"
                >
                  View All ({favoriteListings.length}) →
                </button>
              </div>

              {favoriteListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {favoriteListings.slice(0, 3).map((l) => (
                    <div
                      key={l.id}
                      onClick={() => onSelectListing(l)}
                      className="p-3 bg-[#F7F5F0] rounded-2xl border border-[#E2DFD8] flex items-center gap-3 cursor-pointer hover:border-[#14243A] transition-all"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#E2DFD8] overflow-hidden shrink-0">
                        {l.images && l.images[0] && (
                          <img src={l.images[0]} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[#14243A] truncate">{l.title}</p>
                        <p className="text-[11px] font-mono text-[#8E6D38] font-medium">{formatPrice(l.price, l.currency)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Heart}
                  title="Your wishlist is empty"
                  description="Save items as you browse to keep track of artisan goods you love."
                />
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SAVED LISTINGS */}
        {activeTab === 'favorites' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#14243A]">Your Saved Wishlist</h3>
                <p className="text-xs text-[#5A6578]">Items you've bookmarked for later consideration.</p>
              </div>
              <span className="text-xs text-[#5A6578]">{favoriteListings.length} items</span>
            </div>

            {favoriteListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteListings.map((listing) => (
                  <div
                    key={listing.id}
                    onClick={() => onSelectListing(listing)}
                    className="group bg-white rounded-2xl border border-[#E2DFD8] overflow-hidden hover:border-[#14243A] transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="aspect-4/3 w-full bg-[#F7F5F0] relative overflow-hidden">
                      {listing.images && listing.images[0] ? (
                        <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#E2DFD8]" />
                      )}
                      {onToggleFavorite && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(listing.id);
                          }}
                          className="absolute top-3 right-3 p-2 bg-rose-50 text-rose-500 rounded-full shadow-xs hover:bg-rose-100 transition-colors"
                          title="Remove from favorites"
                        >
                          <Heart className="w-3.5 h-3.5 fill-current" />
                        </button>
                      )}
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 className="text-xs sm:text-sm font-semibold text-[#14243A] truncate group-hover:text-[#283548] transition-colors">
                        {listing.title}
                      </h4>
                      <p className="text-xs text-[#5A6578] line-clamp-2 leading-relaxed">
                        {listing.description}
                      </p>
                      <div className="pt-2 border-t border-[#EFECE5] flex items-center justify-between text-xs">
                        <span className="font-mono font-semibold text-[#14243A]">
                          {formatPrice(listing.price, listing.currency)}
                        </span>
                        <span className="text-[11px] text-[#5A6578]">
                          {listing.sellerName}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Heart}
                title="Save something worth coming back to"
                description="Explore the global marketplace catalog or search for custom commissions to save your favorites."
              />
            )}
          </div>
        )}

        {/* TAB 3: MY REQUESTS */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#14243A]">My Active Buyer Requests</h3>
                <p className="text-xs text-[#5A6578]">Requirements you've posted to Request Orbit for seller quotes.</p>
              </div>
              <button
                onClick={onOpenCreateRequest}
                className="px-4 py-2 bg-[#14243A] hover:bg-[#0E1B2D] text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <Compass className="w-3.5 h-3.5 text-[#C5A572]" />
                <span>Post New Request</span>
              </button>
            </div>

            {myRequests.length > 0 ? (
              <div className="space-y-4">
                {myRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 bg-white rounded-2xl border border-[#E2DFD8] hover:border-[#14243A] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          req.status === 'open' ? 'bg-emerald-50 text-emerald-700' : 'bg-[#F7F5F0] text-[#5A6578]'
                        }`}>
                          {req.status?.toUpperCase()}
                        </span>
                        <span className="text-[11px] text-[#5A6578]">{req.categoryId}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-[#14243A]">{req.title}</h4>
                      <p className="text-xs text-[#5A6578] line-clamp-2 leading-relaxed">{req.description}</p>
                      <div className="flex items-center gap-3 text-xs font-mono pt-1 text-[#14243A]">
                        <span>Budget: ${req.budgetMin} – ${req.budgetMax} {req.currency}</span>
                        <span>·</span>
                        <span>{req.offersCount || 0} quotes received</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('quotes')}
                      className="px-4 py-2 bg-[#F7F5F0] hover:bg-[#EFECE4] text-[#14243A] rounded-xl text-xs font-medium transition-colors cursor-pointer shrink-0 border border-[#E2DFD8]"
                    >
                      View Proposals ({req.offersCount || 0})
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Compass}
                title="No active buyer requests"
                description="Can't find an exact item? Post what you need to Request Orbit to receive direct seller quotes."
                actionText="Post What You Need"
                onAction={onOpenCreateRequest}
              />
            )}
          </div>
        )}

        {/* TAB 4: QUOTES RECEIVED */}
        {activeTab === 'quotes' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-[#14243A]">Seller Proposals & Quotes</h3>
              <p className="text-xs text-[#5A6578]">Confidential commercial quotes submitted by verified sellers.</p>
            </div>

            {receivedOffers.length > 0 ? (
              <div className="space-y-4">
                {receivedOffers.map((o) => {
                  const targetReq = requests.find(r => r.id === o.requestId);

                  return (
                    <div
                      key={o.id}
                      className="p-6 bg-white rounded-2xl border border-[#E2DFD8] space-y-4 shadow-2xs hover:border-[#14243A] transition-all"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#F7F3EB] text-[#8E6D38] border border-[#E8DAC2] flex items-center justify-center font-bold text-sm">
                            {o.sellerName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-semibold text-[#14243A]">{o.sellerName}</h4>
                              <span className="text-[11px] text-[#5A6578]">({o.sellerCountry})</span>
                            </div>
                            {targetReq && (
                              <p className="text-[11px] text-[#8E6D38] font-medium truncate max-w-sm">
                                For Request: "{targetReq.title}"
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-lg font-bold font-mono text-[#14243A] block">
                            ${o.proposedPrice} {o.currency}
                          </span>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                            o.status === 'accepted'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : o.status === 'declined'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {o.status}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 bg-[#F7F5F0] p-3.5 rounded-xl border border-[#E2DFD8] text-xs">
                        <p className="text-[#283548] leading-relaxed">
                          {o.description}
                        </p>
                        {o.deliverables && (
                          <p className="text-[#5A6578] text-[11px]">
                            <strong className="text-[#14243A]">Deliverables:</strong> {o.deliverables}
                          </p>
                        )}
                        {o.shippingOrFulfillmentDetails && (
                          <p className="text-[#5A6578] text-[11px]">
                            <strong className="text-[#14243A]">Fulfillment / Shipping:</strong> {o.shippingOrFulfillmentDetails}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-[11px] text-[#5A6578] pt-1 border-t border-[#E2DFD8]">
                          <span>Est. Completion: <strong>{o.estimatedDays} days</strong></span>
                          <span>·</span>
                          <span>Valid Until: {new Date(o.validUntil).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <span className="text-[11px] text-[#8A94A6]">
                          Submitted {new Date(o.createdAt).toLocaleDateString()}
                        </span>

                        <div className="flex items-center gap-2">
                          {o.status === 'pending' && onUpdateOfferStatus && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  onUpdateOfferStatus(o.id, 'accepted');
                                }}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
                              >
                                Accept Quote
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  onUpdateOfferStatus(o.id, 'declined');
                                }}
                                className="px-3 py-1.5 bg-white border border-[#E2DFD8] hover:bg-[#F7F5F0] text-[#5A6578] rounded-lg font-medium transition-colors cursor-pointer"
                              >
                                Decline
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              if (onStartMessageWithSeller) {
                                onStartMessageWithSeller(o.sellerId, o.sellerName, {
                                  requestId: o.requestId,
                                  requestTitle: targetReq?.title
                                });
                              } else {
                                onOpenMessages();
                              }
                            }}
                            className="px-3 py-1.5 bg-[#14243A] hover:bg-[#0E1B2D] text-white rounded-lg font-medium transition-colors cursor-pointer active:scale-[0.98]"
                          >
                            Message Seller
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={DollarSign}
                title="No seller quotes received yet"
                description="When sellers review your buyer requests, their commercial quotes will appear here."
              />
            )}
          </div>
        )}

        {/* TAB 5: RECENTLY VIEWED */}
        {activeTab === 'recent' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#14243A]">Recently Viewed Items</h3>
                <p className="text-xs text-[#5A6578]">Items you've recently inspected during your discovery sessions.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#5A6578]">{recentlyViewedListings.length} items</span>
                {recentlyViewedListings.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('novora_recent_viewed');
                      setRecentlyViewedIds([]);
                    }}
                    className="text-xs text-rose-600 hover:underline cursor-pointer"
                  >
                    Clear History
                  </button>
                )}
              </div>
            </div>

            {recentlyViewedListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentlyViewedListings.map((listing) => (
                  <div
                    key={listing.id}
                    onClick={() => onSelectListing(listing)}
                    className="group bg-white rounded-2xl border border-[#E2DFD8] overflow-hidden hover:border-[#14243A] transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="aspect-4/3 w-full bg-[#EFECE5] relative overflow-hidden">
                      {listing.images && listing.images[0] ? (
                        <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#EFECE5]" />
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <h4 className="text-xs sm:text-sm font-semibold text-[#14243A] truncate group-hover:text-[#283548] transition-colors">
                        {listing.title}
                      </h4>
                      <div className="pt-2 border-t border-[#EFECE5] flex items-center justify-between text-xs">
                        <span className="font-mono font-semibold text-[#14243A]">
                          {formatPrice(listing.price, listing.currency)}
                        </span>
                        <span className="text-[11px] text-[#5A6578]">{listing.sellerName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Clock}
                title="No viewing history"
                description="As you explore listings in the marketplace, your recently viewed items will appear here."
              />
            )}
          </div>
        )}

        {/* TAB 6: SETTINGS & ACCOUNT */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white rounded-3xl border border-[#E2DFD8] p-6 sm:p-8 space-y-6 shadow-xs">
            <div>
              <h3 className="text-base font-semibold text-[#14243A]">Buyer Account Preferences</h3>
              <p className="text-xs text-[#5A6578]">Manage your location, preferred currency, and public display name.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="font-medium text-[#14243A] block mb-1">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F5F0] border border-[#E2DFD8] rounded-xl focus:border-[#14243A] focus:bg-white focus:outline-hidden text-[#14243A]"
                />
              </div>

              <div>
                <label className="font-medium text-[#14243A] block mb-1">About / Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell sellers about your interests or project requirements..."
                  className="w-full p-2.5 bg-[#F7F5F0] border border-[#E2DFD8] rounded-xl focus:border-[#14243A] focus:bg-white focus:outline-hidden text-[#14243A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-[#14243A] block mb-1">Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F5F0] border border-[#E2DFD8] rounded-xl focus:border-[#14243A] focus:bg-white focus:outline-hidden cursor-pointer text-[#14243A]"
                  >
                    {COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-medium text-[#14243A] block mb-1">Preferred Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F5F0] border border-[#E2DFD8] rounded-xl focus:border-[#14243A] focus:bg-white focus:outline-hidden cursor-pointer text-[#14243A]"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                    <option value="CHF">CHF</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-[#14243A] hover:bg-[#0E1B2D] text-white rounded-xl font-medium transition-colors cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A572]" />}
                  <span>{isSaving ? 'Saving Changes...' : 'Save Changes'}</span>
                </button>
                {isSaved && (
                  <span className="text-emerald-700 font-medium flex items-center gap-1 text-xs">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </span>
                )}
              </div>
            </form>
          </div>
        )}

      </main>
    </div>
  );
};
