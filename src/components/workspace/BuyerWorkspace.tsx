import React, { useState } from 'react';
import { Heart, Compass, MessageSquare, User, Settings, ArrowUpRight, CheckCircle, Trash2 } from 'lucide-react';
import { Listing, BuyerRequest, RequestOffer, UserProfile, Conversation } from '../../types';
import { formatPrice, COUNTRIES } from '../../data/countries';

interface BuyerWorkspaceProps {
  currentUser: UserProfile | null;
  favorites: string[];
  allListings: Listing[];
  requests: BuyerRequest[];
  offers: RequestOffer[];
  conversations: Conversation[];
  onSelectListing: (listing: Listing) => void;
  onOpenCreateRequest: () => void;
  onOpenMessages: () => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onDeleteAccount: (userId: string) => void;
  onOpenAuth: (mode?: 'signin' | 'register') => void;
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
  onUpdateProfile,
  onDeleteAccount,
  onOpenAuth
}) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'requests' | 'settings'>('favorites');
  const [name, setName] = useState(currentUser?.name || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [country, setCountry] = useState(currentUser?.country || 'US');
  const [isSaved, setIsSaved] = useState(false);

  if (!currentUser) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-[#E5E7EB] p-8 space-y-4 max-w-md mx-auto">
        <User className="w-10 h-10 text-[#4057D6] mx-auto" />
        <h3 className="text-base font-semibold text-[#17191F]">Buyer Sanctuary</h3>
        <p className="text-xs text-[#646B76]">
          Please sign in to view your saved wishlist items, active requests, and direct conversations.
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

  const favoriteListings = allListings.filter(l => favorites.includes(l.id));
  const myRequests = requests.filter(r => r.buyerId === currentUser.id);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...currentUser,
      name,
      bio,
      country
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-[#4057D6] uppercase tracking-wider block mb-1">
            Buyer Sanctuary
          </span>
          <h2 className="text-2xl font-semibold text-[#17191F] tracking-tight">
            {currentUser.name}
          </h2>
          <p className="text-xs text-[#646B76] mt-1 max-w-lg leading-relaxed">
            Review your saved artisan objects, active Request Orbit posts, and direct seller communications.
          </p>
        </div>

        <button
          onClick={onOpenCreateRequest}
          className="px-5 py-2.5 rounded-lg bg-[#17191F] hover:bg-[#27272A] text-white text-xs font-medium flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Compass className="w-4 h-4" />
          <span>Post New Request</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-px">
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'favorites'
              ? 'border-[#17191F] text-[#17191F] font-semibold'
              : 'border-transparent text-[#646B76] hover:text-[#17191F]'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Saved Favorites ({favoriteListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'border-[#17191F] text-[#17191F] font-semibold'
              : 'border-transparent text-[#646B76] hover:text-[#17191F]'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>My Requests ({myRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'border-[#17191F] text-[#17191F] font-semibold'
              : 'border-transparent text-[#646B76] hover:text-[#17191F]'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Profile & Settings</span>
        </button>
      </div>

      {/* Tab 1: Favorites */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          {favoriteListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {favoriteListings.map(item => (
                <div
                  key={item.id}
                  onClick={() => onSelectListing(item)}
                  className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden hover:border-[#17191F] transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="aspect-4/3 bg-[#F9FAFB] overflow-hidden">
                    {item.images && item.images[0] ? (
                      <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#E5E7EB]" />
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="text-sm font-medium text-[#17191F] line-clamp-1 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[#646B76] mb-2">{item.sellerName} · {item.sellerCountry}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-[#F3F4F6]">
                      <span className="text-sm font-semibold font-mono text-[#17191F]">
                        {formatPrice(item.price, item.currency)}
                      </span>
                      <span className="text-xs text-[#4057D6] font-medium flex items-center gap-0.5">
                        <span>View</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center bg-white rounded-xl border border-dashed border-[#E5E7EB]">
              <Heart className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-[#17191F]">No saved listings yet</h4>
              <p className="text-xs text-[#646B76] mt-1">Explore the catalog and tap the heart icon on any listing to save it here.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {myRequests.length > 0 ? (
            <div className="space-y-3">
              {myRequests.map(req => {
                const reqOffers = offers.filter(o => o.requestId === req.id);
                return (
                  <div
                    key={req.id}
                    className="p-5 bg-white rounded-xl border border-[#E5E7EB] space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] text-[#646B76] mb-1">
                          <span>Status: {req.status === 'open' ? '● Open for Proposals' : '✓ Fulfilled'}</span>
                          <span>·</span>
                          <span>Posted {new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-[#17191F]">{req.title}</h4>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-semibold text-[#17191F]">
                          Budget: {req.currency} {req.budgetMin}–{req.budgetMax}
                        </span>
                        <span className="block text-[11px] text-[#4057D6] font-medium">
                          {reqOffers.length} {reqOffers.length === 1 ? 'Proposal' : 'Proposals'}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#646B76] leading-relaxed">
                      {req.description}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-16 text-center bg-white rounded-xl border border-dashed border-[#E5E7EB]">
              <Compass className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-[#17191F]">You haven't posted any buyer requests yet</h4>
              <p className="text-xs text-[#646B76] mt-1">Broadcast your requirements to receive direct quotes from international sellers.</p>
              <div className="pt-3">
                <button
                  onClick={onOpenCreateRequest}
                  className="px-4 py-2 bg-[#17191F] text-white text-xs font-medium rounded-lg hover:bg-[#27272A] transition-colors cursor-pointer"
                >
                  Post Your First Request
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Profile Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 max-w-xl space-y-6 shadow-xs">
          <div>
            <h3 className="text-base font-semibold text-[#17191F]">Profile & Region Preferences</h3>
            <p className="text-xs text-[#646B76] mt-0.5">Control your public display details and country formatting</p>
          </div>

          {isSaved && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Profile preferences successfully updated!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#17191F] mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#17191F] focus:border-[#4057D6] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#17191F] mb-1">Bio / Profile Description</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#17191F] focus:border-[#4057D6] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#17191F] mb-1">Country / Region</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#17191F] focus:outline-hidden cursor-pointer"
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-medium text-white bg-[#17191F] hover:bg-[#27272A] rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Save Preferences
              </button>
            </div>
          </form>

          {/* Account Deletion */}
          <div className="pt-6 border-t border-[#E5E7EB] space-y-2">
            <h4 className="text-xs font-semibold text-rose-700">Delete Account</h4>
            <p className="text-xs text-[#646B76]">
              Permanently delete your profile and sign out. This action cannot be undone.
            </p>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to permanently delete your account? All your local session data will be removed.')) {
                  onDeleteAccount(currentUser.id);
                }
              }}
              className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium rounded-lg hover:bg-rose-100 transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete My Account</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
