import React from 'react';
import { Plus, Eye, Heart, Pause, Play, Trash2, ArrowUpRight, Package, Store } from 'lucide-react';
import { Listing, UserProfile } from '../../types';
import { formatPrice } from '../../data/countries';
import { CATEGORIES } from '../../data/categories';

interface SellerWorkspaceProps {
  currentUser: UserProfile | null;
  listings: Listing[];
  onOpenCreateListing: () => void;
  onToggleStatus: (id: string) => void;
  onDeleteListing: (id: string) => void;
  onSelectListing: (listing: Listing) => void;
  onOpenMessages: () => void;
  onOpenAuth: (mode?: 'signin' | 'register') => void;
}

export const SellerWorkspace: React.FC<SellerWorkspaceProps> = ({
  currentUser,
  listings,
  onOpenCreateListing,
  onToggleStatus,
  onDeleteListing,
  onSelectListing,
  onOpenMessages,
  onOpenAuth
}) => {
  if (!currentUser) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-[#E5E7EB] p-8 space-y-4 max-w-md mx-auto">
        <Store className="w-10 h-10 text-[#4057D6] mx-auto" />
        <h3 className="text-base font-semibold text-[#17191F]">Seller Studio Access</h3>
        <p className="text-xs text-[#646B76]">
          Please sign in or create an artisan seller account to manage your listings and buyer communications.
        </p>
        <button
          onClick={() => onOpenAuth('signin')}
          className="px-4 py-2 bg-[#17191F] text-white text-xs font-medium rounded-lg hover:bg-[#27272A] transition-colors cursor-pointer"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const sellerListings = listings.filter(l => l.sellerId === currentUser.id);
  const totalViews = sellerListings.reduce((acc, l) => acc + (l.viewsCount || 0), 0);
  const totalSaves = sellerListings.reduce((acc, l) => acc + (l.favoritesCount || 0), 0);

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-[#4057D6] uppercase tracking-wider block mb-1">
            Seller Studio & Inventory
          </span>
          <h2 className="text-2xl font-semibold text-[#17191F] tracking-tight">
            Welcome, {currentUser.name}
          </h2>
          <p className="text-xs text-[#646B76] mt-1 max-w-lg leading-relaxed">
            Manage your global listings, adjust item availability, and inspect direct buyer inquiries. No listing fees or sales commissions are deducted.
          </p>
        </div>

        <button
          onClick={onOpenCreateListing}
          className="px-5 py-2.5 rounded-lg bg-[#17191F] hover:bg-[#27272A] text-white text-xs font-medium flex items-center gap-2 shadow-xs transition-colors whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Listing</span>
        </button>
      </div>

      {/* Authentic Activity Indicators (No fake revenue or mock statistics) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-xl border border-[#E5E7EB]">
          <span className="text-[11px] font-medium text-[#646B76] uppercase tracking-wider block">
            Published Listings
          </span>
          <div className="text-2xl font-semibold font-mono text-[#17191F] mt-2 tabular-nums">
            {sellerListings.length}
          </div>
          <p className="text-[11px] text-[#646B76] mt-1">
            {sellerListings.filter(l => l.status === 'active').length} currently active in public catalog
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#E5E7EB]">
          <span className="text-[11px] font-medium text-[#646B76] uppercase tracking-wider block">
            Total Listing Views
          </span>
          <div className="text-2xl font-semibold font-mono text-[#17191F] mt-2 tabular-nums">
            {totalViews}
          </div>
          <p className="text-[11px] text-[#646B76] mt-1">
            Real visitor interactions
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#E5E7EB]">
          <span className="text-[11px] font-medium text-[#646B76] uppercase tracking-wider block">
            Community Saves
          </span>
          <div className="text-2xl font-semibold font-mono text-[#17191F] mt-2 tabular-nums">
            {totalSaves}
          </div>
          <p className="text-[11px] text-[#646B76] mt-1">
            Saved to buyer wishlists
          </p>
        </div>
      </div>

      {/* Listings Management Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-xs">
        <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#17191F]">
            Your Published Catalog ({sellerListings.length})
          </h3>
          <span className="text-xs text-[#646B76]">Real-time local inventory</span>
        </div>

        {sellerListings.length > 0 ? (
          <div className="divide-y divide-[#E5E7EB] overflow-x-auto">
            {sellerListings.map(listing => {
              const category = CATEGORIES.find(c => c.id === listing.categoryId);
              return (
                <div
                  key={listing.id}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#FAFAF8] transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] overflow-hidden shrink-0">
                      {listing.images && listing.images[0] ? (
                        <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#9CA3AF]">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[11px] text-[#646B76] mb-1">
                        <span>{category?.name || 'Classified'}</span>
                        <span>·</span>
                        <span className={listing.status === 'active' ? 'text-emerald-700 font-medium' : 'text-amber-700 font-medium'}>
                          {listing.status === 'active' ? '● Public Active' : '○ Paused'}
                        </span>
                      </div>
                      <h4
                        onClick={() => onSelectListing(listing)}
                        className="text-sm font-medium text-[#17191F] hover:text-[#4057D6] cursor-pointer truncate"
                      >
                        {listing.title}
                      </h4>
                      <p className="text-xs text-[#646B76] font-mono font-medium mt-0.5 tabular-nums">
                        {formatPrice(listing.price, listing.currency)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onToggleStatus(listing.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#E5E7EB] hover:bg-[#F3F4F6] text-[#374151] flex items-center gap-1.5 transition-colors cursor-pointer"
                      title={listing.status === 'active' ? 'Pause listing' : 'Activate listing'}
                    >
                      {listing.status === 'active' ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="hidden sm:inline">Activate</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this listing?')) {
                          onDeleteListing(listing.id);
                        }
                      }}
                      className="p-1.5 text-[#646B76] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <p className="text-xs text-[#646B76]">You have not published any listings yet.</p>
            <button
              onClick={onOpenCreateListing}
              className="px-4 py-2 bg-[#17191F] text-white text-xs font-medium rounded-lg hover:bg-[#27272A] transition-colors cursor-pointer"
            >
              Create Your First Listing
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
