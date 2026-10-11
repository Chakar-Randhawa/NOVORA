import React, { useState, useMemo } from 'react';
import {
  Plus,
  Eye,
  Heart,
  Pause,
  Play,
  Trash2,
  Copy,
  Check,
  Store,
  ExternalLink,
  MessageSquare,
  Search,
  Filter,
  Layers,
  Sparkles,
  BarChart3,
  Settings as SettingsIcon,
  HelpCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Tag,
  DollarSign,
  Edit3
} from 'lucide-react';
import { Listing, UserProfile, Storefront, BuyerRequest, RequestOffer, Conversation } from '../../types';
import { formatPrice } from '../../data/countries';
import { CATEGORIES } from '../../data/categories';
import { EmptyState } from '../common/DesignTokens';

interface SellerWorkspaceProps {
  currentUser: UserProfile | null;
  listings: Listing[];
  store: Storefront | null;
  requests: BuyerRequest[];
  offers: RequestOffer[];
  conversations: Conversation[];
  onOpenCreateListing: () => void;
  onEditListing?: (listing: Listing) => void;
  onToggleStatus: (id: string) => void;
  onDeleteListing: (id: string) => void;
  onDuplicateListing?: (listing: Listing) => void;
  onSelectListing: (listing: Listing) => void;
  onOpenStoreWizard: () => void;
  onViewStore: (store: Storefront) => void;
  onOpenSubmitOffer: (request: BuyerRequest) => void;
  onOpenMessages: (conv?: Conversation) => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  onOpenAuth: (mode?: 'signin' | 'register') => void;
}

export const SellerWorkspace: React.FC<SellerWorkspaceProps> = ({
  currentUser,
  listings,
  store,
  requests,
  offers,
  conversations,
  onOpenCreateListing,
  onEditListing,
  onToggleStatus,
  onDeleteListing,
  onDuplicateListing,
  onSelectListing,
  onOpenStoreWizard,
  onViewStore,
  onOpenSubmitOffer,
  onOpenMessages,
  onUpdateProfile,
  onOpenAuth
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'store' | 'requests' | 'offers' | 'analytics' | 'settings'>('overview');
  const [listingSearch, setListingSearch] = useState('');
  const [listingStatusFilter, setListingStatusFilter] = useState<'all' | 'active' | 'paused' | 'archived'>('all');
  const [listingCategoryFilter, setListingCategoryFilter] = useState('all');
  const [copiedLink, setCopiedLink] = useState(false);

  // Settings form state
  const [sellerTagline, setSellerTagline] = useState(currentUser?.sellerTagline || '');
  const [sellerBio, setSellerBio] = useState(currentUser?.bio || '');
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  if (!currentUser) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-[#E5E7EB] p-8 space-y-4 max-w-md mx-auto shadow-xs">
        <Store className="w-10 h-10 text-[#4057D6] mx-auto" />
        <h3 className="text-base font-semibold text-[#17191F]">Seller Studio Access</h3>
        <p className="text-xs text-[#646B76] leading-relaxed">
          Please sign in or create an artisan seller account to manage your listings, storefront, and buyer proposals.
        </p>
        <button
          onClick={() => onOpenAuth('signin')}
          className="px-5 py-2.5 bg-[#17191F] text-white text-xs font-medium rounded-xl hover:bg-[#27272A] transition-colors cursor-pointer shadow-xs"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  // Filter listings belonging to this seller
  const sellerListings = useMemo(() => {
    return listings.filter(l => l.sellerId === currentUser.id);
  }, [listings, currentUser.id]);

  const activeCount = sellerListings.filter(l => l.status === 'active').length;
  const pausedCount = sellerListings.filter(l => l.status === 'paused').length;
  const totalViews = sellerListings.reduce((acc, l) => acc + (l.viewsCount || 0), 0);
  const totalFavorites = sellerListings.reduce((acc, l) => acc + (l.favoritesCount || 0), 0);

  // Seller's submitted offers
  const sellerOffers = useMemo(() => {
    return offers.filter(o => o.sellerId === currentUser.id);
  }, [offers, currentUser.id]);

  // Open buyer requests available for quoting
  const openBuyerRequests = useMemo(() => {
    return requests.filter(r => r.status === 'open' && r.buyerId !== currentUser.id);
  }, [requests, currentUser.id]);

  // Filtered listings for the Listings Manager tab
  const filteredListings = useMemo(() => {
    return sellerListings.filter(l => {
      const matchesSearch = !listingSearch.trim() || 
        l.title.toLowerCase().includes(listingSearch.toLowerCase()) ||
        l.description.toLowerCase().includes(listingSearch.toLowerCase());
      
      const matchesStatus = listingStatusFilter === 'all' || l.status === listingStatusFilter;
      const matchesCat = listingCategoryFilter === 'all' || l.categoryId === listingCategoryFilter;

      return matchesSearch && matchesStatus && matchesCat;
    });
  }, [sellerListings, listingSearch, listingStatusFilter, listingCategoryFilter]);

  const handleCopyStoreLink = () => {
    if (!store) return;
    const url = `${window.location.origin}${window.location.pathname}?store=${store.storeSlug || store.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingSettings(true);
    try {
      await onUpdateProfile({
        sellerTagline: sellerTagline.trim(),
        bio: sellerBio.trim(),
        isSeller: true
      });
      alert('Seller settings updated successfully!');
    } catch {
      alert('Failed to update settings.');
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const SELLER_NAV_ITEMS = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'listings', label: `Listings (${sellerListings.length})`, icon: Layers },
    { id: 'store', label: store ? 'Storefront Hub' : 'Set Up Storefront', icon: Store, highlight: !store },
    { id: 'requests', label: `Buyer Requests (${openBuyerRequests.length})`, icon: Tag },
    { id: 'offers', label: `My Proposals (${sellerOffers.length})`, icon: DollarSign },
    { id: 'analytics', label: 'Real Analytics', icon: Sparkles },
    { id: 'settings', label: 'Seller Settings', icon: SettingsIcon }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
      
      {/* Mobile / Tablet Horizontal Navigation (< 1024px) */}
      <div className="lg:hidden w-full space-y-3">
        {/* Mobile Header Bar */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-3.5 flex items-center justify-between shadow-2xs gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] text-[#4057D6] flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-semibold text-[#17191F] truncate">{currentUser.name}</h3>
              <p className="text-[10px] text-[#646B76] truncate">Seller Control Center</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenCreateListing}
              className="px-3 py-1.5 bg-[#4057D6] text-white rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Listing</span>
            </button>
            {store && (
              <button
                type="button"
                onClick={() => onViewStore(store)}
                className="px-2.5 py-1.5 bg-[#FAFAF8] border border-[#E5E7EB] text-[#17191F] rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
              >
                <Store className="w-3.5 h-3.5 text-[#4057D6]" />
                <span className="hidden sm:inline">Store</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Horizontal Scrolling Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {SELLER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as any)}
                className={`px-3 py-2 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#17191F] text-white shadow-xs'
                    : 'bg-white border border-[#E5E7EB] text-[#4B5563] hover:text-[#17191F]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : item.highlight ? 'text-[#4057D6]' : 'text-[#646B76]'}`} />
                <span>{item.label}</span>
                {item.highlight && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4057D6]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Sidebar Navigation (>= 1024px) */}
      <aside className="hidden lg:block w-64 bg-white rounded-3xl border border-[#E5E7EB] p-4 shadow-xs shrink-0 space-y-6">
        <div>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4057D6] flex items-center justify-center font-bold text-sm shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-semibold text-[#17191F] truncate">{currentUser.name}</h3>
              <p className="text-[11px] text-[#646B76] truncate">Seller Control Center</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1 text-xs">
          {SELLER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#17191F] text-white shadow-2xs'
                    : 'text-[#4B5563] hover:text-[#17191F] hover:bg-[#F3F4F6]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-[#4057D6]' : 'text-[#646B76]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.highlight && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#4057D6]" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-[#E5E7EB] space-y-2">
          <button
            type="button"
            onClick={onOpenCreateListing}
            className="w-full py-2.5 px-3 bg-[#4057D6] hover:bg-[#3446B8] text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Listing</span>
          </button>

          {store && (
            <button
              type="button"
              onClick={() => onViewStore(store)}
              className="w-full py-2 px-3 bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#17191F] rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#4057D6]" />
              <span>View Live Store</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full space-y-6 min-w-0">

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
              <div>
                <span className="text-xs font-semibold text-[#4057D6] uppercase tracking-wider block mb-1">
                  Artisan Workspace & Hub
                </span>
                <h2 className="text-2xl font-bold text-[#17191F] tracking-tight">
                  Welcome, {currentUser.name}
                </h2>
                <p className="text-xs text-[#646B76] mt-1 max-w-lg leading-relaxed">
                  Manage inventory, quote procurement leads, and customize your dedicated storefront without platform listing fees.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={onOpenCreateListing}
                  className="px-4 py-2.5 bg-[#17191F] hover:bg-[#27272A] text-white rounded-xl text-xs font-medium flex items-center gap-2 shadow-xs transition-colors cursor-pointer active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Listing</span>
                </button>
                {!store ? (
                  <button
                    onClick={onOpenStoreWizard}
                    className="px-4 py-2.5 bg-[#4057D6] hover:bg-[#3446B8] text-white rounded-xl text-xs font-medium flex items-center gap-2 shadow-xs transition-colors cursor-pointer active:scale-[0.98]"
                  >
                    <Store className="w-4 h-4" />
                    <span>Set Up Storefront</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onViewStore(store)}
                    className="px-4 py-2.5 bg-white border border-[#E5E7EB] hover:bg-[#F3F4F6] text-[#17191F] rounded-xl text-xs font-medium flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Store className="w-4 h-4 text-[#4057D6]" />
                    <span>Storefront</span>
                  </button>
                )}
              </div>
            </div>

            {/* Action Center (Real prompts only) */}
            <div className="p-6 bg-[#FAFAF8] rounded-3xl border border-[#E5E7EB] space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#646B76] font-semibold block">
                Seller Action Center
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {!store && (
                  <div
                    onClick={onOpenStoreWizard}
                    className="p-4 bg-white rounded-2xl border border-[#C7D2FE] flex items-center justify-between gap-3 cursor-pointer hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] text-[#4057D6] flex items-center justify-center shrink-0">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-[#17191F]">Launch Your Branded Store</h4>
                        <p className="text-[11px] text-[#646B76]">Get a unique web slug and workshop page.</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#4057D6] shrink-0" />
                  </div>
                )}

                {sellerListings.length === 0 && (
                  <div
                    onClick={onOpenCreateListing}
                    className="p-4 bg-white rounded-2xl border border-[#E5E7EB] flex items-center justify-between gap-3 cursor-pointer hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <Plus className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-[#17191F]">Publish First Listing</h4>
                        <p className="text-[11px] text-[#646B76]">Add a physical or digital product to catalog.</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                )}

                {openBuyerRequests.length > 0 && (
                  <div
                    onClick={() => setActiveTab('requests')}
                    className="p-4 bg-white rounded-2xl border border-[#E5E7EB] flex items-center justify-between gap-3 cursor-pointer hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-[#17191F]">
                          {openBuyerRequests.length} Buyer Requests Need Quotes
                        </h4>
                        <p className="text-[11px] text-[#646B76]">Quote on direct buyer procurement orders.</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-600 shrink-0" />
                  </div>
                )}

                <div
                  onClick={() => onOpenMessages()}
                  className="p-4 bg-white rounded-2xl border border-[#E5E7EB] flex items-center justify-between gap-3 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#F3F4F6] text-[#4B5563] flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#17191F]">Buyer Inquiries & Chat</h4>
                      <p className="text-[11px] text-[#646B76]">{conversations.length} active discussion threads.</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#646B76] shrink-0" />
                </div>
              </div>
            </div>

            {/* Authentic Activity Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-5 bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs">
                <span className="text-[10px] font-semibold text-[#646B76] uppercase tracking-wider block">
                  Active Listings
                </span>
                <div className="text-2xl font-bold font-mono text-[#17191F] mt-1.5">{activeCount}</div>
                <p className="text-[11px] text-[#646B76] mt-0.5">{pausedCount} paused</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs">
                <span className="text-[10px] font-semibold text-[#646B76] uppercase tracking-wider block">
                  Real Listing Views
                </span>
                <div className="text-2xl font-bold font-mono text-[#17191F] mt-1.5">{totalViews}</div>
                <p className="text-[11px] text-[#646B76] mt-0.5">Live visitor metrics</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs">
                <span className="text-[10px] font-semibold text-[#646B76] uppercase tracking-wider block">
                  Buyer Wishlists
                </span>
                <div className="text-2xl font-bold font-mono text-[#17191F] mt-1.5">{totalFavorites}</div>
                <p className="text-[11px] text-[#646B76] mt-0.5">Items saved by buyers</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs">
                <span className="text-[10px] font-semibold text-[#646B76] uppercase tracking-wider block">
                  Quotes Submitted
                </span>
                <div className="text-2xl font-bold font-mono text-[#17191F] mt-1.5">{sellerOffers.length}</div>
                <p className="text-[11px] text-[#646B76] mt-0.5">To buyer requests</p>
              </div>
            </div>

            {/* Recent Inventory Preview */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#17191F]">Recent Published Items</h3>
                <button
                  onClick={() => setActiveTab('listings')}
                  className="text-xs text-[#4057D6] hover:underline font-medium cursor-pointer"
                >
                  Manage All ({sellerListings.length}) →
                </button>
              </div>

              {sellerListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {sellerListings.slice(0, 3).map((l) => (
                    <div
                      key={l.id}
                      onClick={() => onSelectListing(l)}
                      className="p-3 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] flex items-center gap-3 cursor-pointer hover:border-[#17191F] transition-all"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#E5E7EB] overflow-hidden shrink-0">
                        {l.images && l.images[0] && (
                          <img src={l.images[0]} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[#17191F] truncate">{l.title}</p>
                        <p className="text-[11px] font-mono text-[#4057D6] font-medium">{formatPrice(l.price, l.currency)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Layers}
                  title="No items in inventory"
                  description="Publish your first listing to appear across the global marketplace catalog."
                  actionText="Publish Item"
                  onAction={onOpenCreateListing}
                />
              )}
            </div>
          </div>
        )}

        {/* TAB 2: LISTINGS MANAGER */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="p-4 bg-white rounded-3xl border border-[#E5E7EB] flex flex-col sm:flex-row gap-3 items-center justify-between shadow-2xs">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={listingSearch}
                  onChange={(e) => setListingSearch(e.target.value)}
                  placeholder="Search listings..."
                  className="w-full text-xs pl-8 pr-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-xs">
                {/* Status Filter */}
                <select
                  value={listingStatusFilter}
                  onChange={(e) => setListingStatusFilter(e.target.value as any)}
                  className="p-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs cursor-pointer focus:outline-hidden"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="paused">Paused</option>
                  <option value="archived">Archived</option>
                </select>

                {/* Category Filter */}
                <select
                  value={listingCategoryFilter}
                  onChange={(e) => setListingCategoryFilter(e.target.value)}
                  className="p-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs cursor-pointer focus:outline-hidden"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <button
                  onClick={onOpenCreateListing}
                  className="px-3.5 py-2 bg-[#17191F] text-white rounded-xl font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ml-auto sm:ml-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Listing</span>
                </button>
              </div>
            </div>

            {/* Listings Table */}
            {filteredListings.length > 0 ? (
              <div className="bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden shadow-xs">
                <div className="divide-y divide-[#E5E7EB]">
                  {filteredListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#F9FAFB] transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-16 h-16 rounded-xl bg-[#F3F4F6] overflow-hidden shrink-0 border border-[#E5E7EB]">
                          {listing.images && listing.images[0] ? (
                            <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-[#E5E7EB]" />
                          )}
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              listing.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {listing.status === 'active' ? 'Active' : 'Paused'}
                            </span>
                            <span className="text-[11px] text-[#646B76] capitalize">
                              {listing.categoryId}
                            </span>
                          </div>

                          <h4 
                            onClick={() => onSelectListing(listing)}
                            className="text-xs sm:text-sm font-semibold text-[#17191F] truncate hover:text-[#4057D6] cursor-pointer"
                          >
                            {listing.title}
                          </h4>

                          <div className="flex items-center gap-4 text-xs font-mono text-[#646B76]">
                            <span className="font-semibold text-[#17191F]">
                              {formatPrice(listing.price, listing.currency)}
                            </span>
                            <span className="flex items-center gap-1 text-[11px]">
                              <Eye className="w-3 h-3 text-[#9CA3AF]" />
                              <span>{listing.viewsCount || 0}</span>
                            </span>
                            <span className="flex items-center gap-1 text-[11px]">
                              <Heart className="w-3 h-3 text-rose-500" />
                              <span>{listing.favoritesCount || 0}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0">
                        {onEditListing && (
                          <button
                            type="button"
                            onClick={() => onEditListing(listing)}
                            className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F3F4F6] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer text-[#17191F]"
                            title="Edit Listing"
                          >
                            <Edit3 className="w-3 h-3 text-[#4057D6]" />
                            <span>Edit</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onToggleStatus(listing.id)}
                          className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F3F4F6] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {listing.status === 'active' ? (
                            <>
                              <Pause className="w-3 h-3 text-amber-600" />
                              <span>Pause</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 text-emerald-600" />
                              <span>Resume</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => onSelectListing(listing)}
                          className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F3F4F6] text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>Preview</span>
                          <ExternalLink className="w-3 h-3 text-[#646B76]" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteListing(listing.id)}
                          className="p-1.5 text-[#9CA3AF] hover:text-[#EF4444] hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={Layers}
                title="No matching listings"
                description="No items match your filter criteria. Try adjusting your filters or add a new listing."
                actionText="Add New Listing"
                onAction={onOpenCreateListing}
              />
            )}
          </div>
        )}

        {/* TAB 3: STOREFRONT MANAGEMENT */}
        {activeTab === 'store' && (
          <div className="space-y-6">
            {store ? (
              <div className="space-y-6">
                {/* Store Hub Banner */}
                <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] text-[#4057D6] flex items-center justify-center font-bold text-xl border border-[#E5E7EB] overflow-hidden shrink-0 shadow-2xs">
                      {store.logoUrl ? (
                        <img src={store.logoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        store.storeName.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-[#17191F]">{store.storeName}</h2>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active Store
                        </span>
                      </div>
                      <p className="text-xs text-[#646B76] font-mono mt-0.5">novora.com/?store={store.storeSlug}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => onViewStore(store)}
                      className="px-4 py-2 bg-[#17191F] hover:bg-[#27272A] text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Public Store</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyStoreLink}
                      className="px-3.5 py-2 bg-white border border-[#E5E7EB] hover:bg-[#F3F4F6] text-[#17191F] rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={onOpenStoreWizard}
                      className="px-3.5 py-2 bg-[#EEF2FF] text-[#4057D6] hover:bg-[#E0E7FF] rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <SettingsIcon className="w-3.5 h-3.5" />
                      <span>Edit Settings</span>
                    </button>
                  </div>
                </div>

                {/* Completeness Card */}
                <div className="p-6 bg-white rounded-3xl border border-[#E5E7EB] shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#17191F]">Storefront Quality & Completeness</span>
                    <span className="font-bold text-[#4057D6]">{store.completenessPercent || 80}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-linear-to-r from-[#4057D6] to-emerald-500 rounded-full transition-all"
                      style={{ width: `${store.completenessPercent || 80}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#646B76]">
                    Complete your custom categories, announcement banner, and workshop story to maximize buyer confidence.
                  </p>
                </div>

                {/* Storefront Sections Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] space-y-2 shadow-2xs">
                    <h4 className="text-xs font-semibold text-[#17191F]">Custom Collections</h4>
                    <p className="text-xs text-[#646B76]">{store.categories?.length || 0} active store categories</p>
                    <button
                      onClick={onOpenStoreWizard}
                      className="text-xs text-[#4057D6] hover:underline font-medium block pt-1 cursor-pointer"
                    >
                      Edit collections →
                    </button>
                  </div>

                  <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] space-y-2 shadow-2xs">
                    <h4 className="text-xs font-semibold text-[#17191F]">Fulfillment Policies</h4>
                    <p className="text-xs text-[#646B76]">Shipping, returns, and refund terms defined</p>
                    <button
                      onClick={onOpenStoreWizard}
                      className="text-xs text-[#4057D6] hover:underline font-medium block pt-1 cursor-pointer"
                    >
                      Update policies →
                    </button>
                  </div>

                  <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] space-y-2 shadow-2xs">
                    <h4 className="text-xs font-semibold text-[#17191F]">Store Announcement</h4>
                    <p className="text-xs text-[#646B76] truncate">{store.announcement || 'No announcement banner set'}</p>
                    <button
                      onClick={onOpenStoreWizard}
                      className="text-xs text-[#4057D6] hover:underline font-medium block pt-1 cursor-pointer"
                    >
                      Change banner →
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 px-6 bg-white rounded-3xl border border-[#E5E7EB] space-y-4 max-w-xl mx-auto shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] text-[#4057D6] flex items-center justify-center mx-auto shadow-2xs">
                  <Store className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-[#17191F]">You haven't set up your storefront yet</h3>
                <p className="text-xs text-[#646B76] leading-relaxed">
                  Turn your seller profile into a branded independent storefront with custom categories, store policies, workshop bio, and a unique shareable web link.
                </p>
                <div className="pt-2">
                  <button
                    onClick={onOpenStoreWizard}
                    className="px-6 py-2.5 bg-[#4057D6] hover:bg-[#3446B8] text-white rounded-xl text-xs font-medium transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
                  >
                    Launch Store Setup Wizard
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: BUYER REQUESTS & PROCUREMENT LEADS */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#17191F]">Open Buyer Requests (Leads)</h3>
                <p className="text-xs text-[#646B76]">Submit commercial proposals to buyers actively searching for products or services.</p>
              </div>
              <span className="text-xs text-[#646B76]">{openBuyerRequests.length} available</span>
            </div>

            {openBuyerRequests.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {openBuyerRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 bg-white rounded-2xl border border-[#E5E7EB] hover:border-[#17191F] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EEF2FF] text-[#4057D6]">
                          {req.categoryId}
                        </span>
                        <span className="text-[11px] text-[#646B76]">
                          Destination: {req.destinationCountry}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-[#17191F]">{req.title}</h4>
                      <p className="text-xs text-[#646B76] line-clamp-2 leading-relaxed">{req.description}</p>
                      <div className="flex items-center gap-3 text-xs font-mono pt-1 text-[#17191F]">
                        <span>Budget: ${req.budgetMin} – ${req.budgetMax} {req.currency}</span>
                        <span>·</span>
                        <span>{req.offersCount || 0} quotes submitted</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenSubmitOffer(req)}
                      className="px-4 py-2 bg-[#17191F] hover:bg-[#27272A] text-white rounded-xl text-xs font-medium transition-colors cursor-pointer shrink-0 shadow-xs active:scale-[0.98]"
                    >
                      Submit Quote
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Tag}
                title="No open procurement requests"
                description="When buyers post open sourcing requirements, they will appear here for you to submit quotes."
              />
            )}
          </div>
        )}

        {/* TAB 5: MY PROPOSALS */}
        {activeTab === 'offers' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-[#17191F]">Submitted Commercial Proposals</h3>
              <p className="text-xs text-[#646B76]">Track status of quotes you submitted to buyer procurement requests.</p>
            </div>

            {sellerOffers.length > 0 ? (
              <div className="space-y-3">
                {sellerOffers.map((o) => (
                  <div
                    key={o.id}
                    className="p-5 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                          o.status === 'accepted'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : o.status === 'declined'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {o.status}
                        </span>
                        <span className="text-[11px] text-[#646B76]">
                          Est. {o.estimatedDays} days delivery
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-[#17191F]">{o.description}</h4>
                      <p className="text-xs font-mono font-bold text-[#17191F] pt-1">
                        Proposed Price: ${o.proposedPrice} {o.currency}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenMessages()}
                      className="px-3.5 py-1.5 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#17191F] rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
                    >
                      Message Buyer
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={DollarSign}
                title="No proposals submitted yet"
                description="Browse active buyer requests in Request Orbit and submit tailored quotes to win sales."
                actionText="Explore Buyer Requests"
                onAction={() => setActiveTab('requests')}
              />
            )}
          </div>
        )}

        {/* TAB 6: REAL ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-[#17191F]">Real Catalog & Storefront Performance</h3>
              <p className="text-xs text-[#646B76]">100% genuine metrics derived from live buyer interactions. No simulated stats.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] space-y-1 shadow-2xs">
                <span className="text-[10px] font-semibold text-[#646B76] uppercase tracking-wider block">Total Catalog Views</span>
                <div className="text-3xl font-bold font-mono text-[#17191F]">{totalViews}</div>
                <p className="text-[11px] text-[#646B76]">Real visitor interactions</p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] space-y-1 shadow-2xs">
                <span className="text-[10px] font-semibold text-[#646B76] uppercase tracking-wider block">Total Community Saves</span>
                <div className="text-3xl font-bold font-mono text-[#17191F]">{totalFavorites}</div>
                <p className="text-[11px] text-[#646B76]">Added to buyer collections</p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] space-y-1 shadow-2xs">
                <span className="text-[10px] font-semibold text-[#646B76] uppercase tracking-wider block">Inquiries Received</span>
                <div className="text-3xl font-bold font-mono text-[#17191F]">{conversations.length}</div>
                <p className="text-[11px] text-[#646B76]">Direct buyer discussions</p>
              </div>
            </div>

            {totalViews === 0 && totalFavorites === 0 && (
              <div className="p-8 text-center bg-[#FAFAF8] rounded-3xl border border-dashed border-[#E5E7EB] space-y-2">
                <Clock className="w-8 h-8 text-[#9CA3AF] mx-auto" />
                <h4 className="text-sm font-semibold text-[#17191F]">Analytics will appear as visitors discover your store</h4>
                <p className="text-xs text-[#646B76] max-w-sm mx-auto">
                  Publish high-quality photos, clear item descriptions, and complete your storefront to attract international buyers.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-8 space-y-6 shadow-xs">
            <div>
              <h3 className="text-base font-semibold text-[#17191F]">Seller Profile Settings</h3>
              <p className="text-xs text-[#646B76]">Manage your public tagline and maker bio.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="font-medium text-[#374151] block mb-1">Seller Tagline</label>
                <input
                  type="text"
                  value={sellerTagline}
                  onChange={(e) => setSellerTagline(e.target.value)}
                  placeholder="e.g. Master watchmaker and horological artisan in Geneva"
                  className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-medium text-[#374151] block mb-1">Public Bio</label>
                <textarea
                  rows={4}
                  value={sellerBio}
                  onChange={(e) => setSellerBio(e.target.value)}
                  placeholder="Tell buyers about your background and craft..."
                  className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden leading-relaxed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingSettings}
                  className="px-5 py-2.5 bg-[#17191F] hover:bg-[#27272A] text-white rounded-xl font-medium transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isUpdatingSettings ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

      </main>
    </div>
  );
};
