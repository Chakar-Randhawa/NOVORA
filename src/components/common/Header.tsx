import React, { useState } from 'react';
import {
  Globe,
  Heart,
  MessageSquare,
  Plus,
  User,
  Shield,
  Compass,
  LogIn,
  LogOut,
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../../types';
import { COUNTRIES, CURRENCIES } from '../../data/countries';

interface HeaderProps {
  currentUser: UserProfile | null;
  favoritesCount: number;
  unreadMessagesCount: number;
  currentCountry: string;
  currentCurrency: string;
  onSelectCountry: (code: string) => void;
  onSelectCurrency: (code: string) => void;
  onOpenAuth: (initialMode?: 'signin' | 'register') => void;
  onLogout: () => void;
  onOpenCreateListing: () => void;
  onOpenCreateRequest: () => void;
  onOpenFindMatch: () => void;
  onOpenWorkspace: (tab: 'seller' | 'buyer' | 'admin') => void;
  onOpenMessages: () => void;
  onOpenFavorites: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  favoritesCount,
  unreadMessagesCount,
  currentCountry,
  currentCurrency,
  onSelectCountry,
  onSelectCurrency,
  onOpenAuth,
  onLogout,
  onOpenCreateListing,
  onOpenCreateRequest,
  onOpenFindMatch,
  onOpenWorkspace,
  onOpenMessages,
  onOpenFavorites,
  onNavigateSection
}) => {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const selectedCountryObj = COUNTRIES.find(c => c.code === currentCountry) || COUNTRIES[0];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E5E7EB]">
      <div className="max-w-[1440px] mx-auto px-6 h-17 flex items-center justify-between">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigateSection('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-xl font-bold tracking-tight text-[#17191F] hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            NOVORA
          </a>
          <span className="hidden sm:inline-block text-[11px] text-[#646B76] font-medium tracking-wide uppercase pl-3 border-l border-[#E5E7EB]">
            Marketplace
          </span>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#646B76]">
          <button
            onClick={() => onNavigateSection('discover')}
            className="hover:text-[#17191F] transition-colors py-1 cursor-pointer"
          >
            Discover
          </button>
          <button
            onClick={() => onNavigateSection('categories')}
            className="hover:text-[#17191F] transition-colors py-1 cursor-pointer"
          >
            Categories
          </button>
          <button
            onClick={() => onNavigateSection('request-orbit')}
            className="hover:text-[#17191F] transition-colors py-1 cursor-pointer flex items-center gap-1.5"
          >
            <span>Buyer Requests</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#4057D6]" />
          </button>
          <button
            onClick={() => onNavigateSection('local-finds')}
            className="hover:text-[#17191F] transition-colors py-1 cursor-pointer"
          >
            Local Discovery
          </button>
          <button
            onClick={() => onNavigateSection('safety')}
            className="hover:text-[#17191F] transition-colors py-1 cursor-pointer flex items-center gap-1"
          >
            <Shield className="w-3.5 h-3.5 text-[#646B76]" />
            <span>Trust & Safety</span>
          </button>
        </nav>

        {/* Zone 3: Actions and Controls */}
        <div className="flex items-center gap-2.5">
          
          {/* Need-Based Match Action */}
          <button
            onClick={onOpenFindMatch}
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 text-[#4057D6] bg-[#EEF2FF] hover:bg-[#E0E7FF] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            title="Need-Based Discovery Search"
          >
            <Compass className="w-3.5 h-3.5 text-[#4057D6]" />
            <span>Find My Match</span>
          </button>

          {/* Country & Currency Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLocationDropdown(!showLocationDropdown);
                setShowUserDropdown(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#4B5563] hover:text-[#17191F] hover:bg-[#F3F4F6] rounded-lg transition-colors border border-[#E5E7EB] cursor-pointer"
              aria-label="Change country and currency"
            >
              <span className="text-sm leading-none">{selectedCountryObj.flag}</span>
              <span className="font-mono text-[11px] font-semibold">{currentCurrency}</span>
            </button>

            {showLocationDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-[#E5E7EB] rounded-xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-xs font-semibold text-[#17191F] mb-2">Location & Currency</div>
                
                <label className="block text-[11px] text-[#646B76] mb-1 font-medium">Your Region</label>
                <select
                  value={currentCountry}
                  onChange={(e) => {
                    onSelectCountry(e.target.value);
                  }}
                  className="w-full text-xs p-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-md mb-3 text-[#17191F]"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name} ({c.code})
                    </option>
                  ))}
                </select>

                <label className="block text-[11px] text-[#646B76] mb-1 font-medium">Display Currency</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {CURRENCIES.map((cur) => (
                    <button
                      key={cur.code}
                      onClick={() => {
                        onSelectCurrency(cur.code);
                        setShowLocationDropdown(false);
                      }}
                      className={`text-xs py-1 px-2 rounded font-mono cursor-pointer transition-colors ${
                        currentCurrency === cur.code
                          ? 'bg-[#17191F] text-white font-medium'
                          : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]'
                      }`}
                    >
                      {cur.code} ({cur.symbol})
                    </button>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-[#E5E7EB] text-[11px] text-[#646B76] leading-relaxed">
                  Currency preferences are saved locally with zero external API calls.
                </div>
              </div>
            )}
          </div>

          {/* Favorites Button (Real authenticated or session count) */}
          <button
            onClick={onOpenFavorites}
            className="relative p-2 text-[#646B76] hover:text-[#17191F] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
            title="Saved Favorites"
            aria-label="Saved Favorites"
          >
            <Heart className="w-4 h-4" />
            {favoritesCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#17191F] text-white text-[10px] font-semibold rounded-full flex items-center justify-center tabular-nums">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Messages Button (Real count only) */}
          <button
            onClick={() => {
              if (!currentUser) {
                onOpenAuth('signin');
              } else {
                onOpenMessages();
              }
            }}
            className="relative p-2 text-[#646B76] hover:text-[#17191F] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
            title="Messages"
            aria-label="Direct Messages"
          >
            <MessageSquare className="w-4 h-4" />
            {unreadMessagesCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#4057D6] rounded-full" />
            )}
          </button>

          {/* User Account / Auth Section */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowLocationDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#17191F] hover:bg-[#F3F4F6] rounded-lg transition-colors border border-[#E5E7EB] cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-[#17191F] text-white text-[10px] font-semibold flex items-center justify-center">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate">{currentUser.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#646B76]" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E5E7EB] rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-[#E5E7EB]">
                    <p className="text-xs font-semibold text-[#17191F]">{currentUser.name}</p>
                    <p className="text-[11px] text-[#646B76] truncate">{currentUser.email}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-[#646B76]">
                      <span>{currentUser.isSeller ? 'Seller Account' : 'Buyer Account'}</span>
                      {currentUser.isAdmin && (
                        <span className="text-[#4057D6] font-semibold">· Platform Admin</span>
                      )}
                    </div>
                  </div>

                  <div className="py-1">
                    {currentUser.isSeller && (
                      <button
                        onClick={() => {
                          onOpenWorkspace('seller');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#374151] hover:bg-[#F9FAFB] flex items-center justify-between cursor-pointer"
                      >
                        <span>Seller Studio</span>
                        <span className="text-[10px] text-[#646B76]">Listings & Inquiries</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onOpenWorkspace('buyer');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#374151] hover:bg-[#F9FAFB] flex items-center justify-between cursor-pointer"
                    >
                      <span>Buyer Sanctuary</span>
                      <span className="text-[10px] text-[#646B76]">Requests & Saved</span>
                    </button>

                    {currentUser.isAdmin && (
                      <button
                        onClick={() => {
                          onOpenWorkspace('admin');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#4057D6] hover:bg-[#EFF6FF] flex items-center justify-between font-medium cursor-pointer"
                      >
                        <span>Admin Moderation</span>
                        <Shield className="w-3.5 h-3.5 text-[#4057D6]" />
                      </button>
                    )}
                  </div>

                  <div className="border-t border-[#E5E7EB] pt-1">
                    <button
                      onClick={() => {
                        onOpenCreateListing();
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#17191F] hover:bg-[#F9FAFB] font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#4057D6]" />
                      <span>Publish New Listing</span>
                    </button>
                    <button
                      onClick={() => {
                        onOpenCreateRequest();
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#17191F] hover:bg-[#F9FAFB] font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Post Buyer Request</span>
                    </button>
                  </div>

                  <div className="border-t border-[#E5E7EB] pt-1 mt-1">
                    <button
                      onClick={() => {
                        onLogout();
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('signin')}
                className="px-3 py-1.5 text-xs font-medium text-[#374151] hover:text-[#17191F] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#17191F] hover:bg-[#27272A] rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Register
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
