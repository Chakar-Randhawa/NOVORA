import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  Bell,
  Store,
  ExternalLink,
  Menu,
  X,
  Search,
  ArrowRight,
  SlidersHorizontal,
  Check
} from 'lucide-react';
import { UserProfile, Storefront } from '../../types';
import { COUNTRIES, CURRENCIES } from '../../data/countries';

interface HeaderProps {
  currentUser: UserProfile | null;
  userStore?: Storefront | null;
  favoritesCount: number;
  unreadMessagesCount: number;
  unreadNotificationsCount?: number;
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
  onOpenNotifications?: () => void;
  onOpenStore?: (store: Storefront) => void;
  onOpenStoreWizard?: () => void;
  onOpenUserProfile?: (user: UserProfile) => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  userStore,
  favoritesCount,
  unreadMessagesCount,
  unreadNotificationsCount = 0,
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
  onOpenNotifications,
  onOpenStore,
  onOpenStoreWizard,
  onOpenUserProfile,
  onNavigateSection
}) => {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMoreNavDropdown, setShowMoreNavDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountryObj = COUNTRIES.find((c) => c.code === currentCountry) || COUNTRIES[0];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(target)) {
        setShowLocationDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(target)) {
        setShowUserDropdown(false);
      }
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(target)) {
        setShowMoreNavDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setShowLocationDropdown(false);
        setShowUserDropdown(false);
        setShowMoreNavDropdown(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E5E7EB] transition-colors">
      <div className="novora-container h-16 sm:h-17 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* ================================================================= */}
        {/* Zone 1: Branding & Mobile Menu Trigger                            */}
        {/* ================================================================= */}
        <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
          {/* Mobile Hamburger Button (< 1024px) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 -ml-1 text-[#4B5563] hover:text-[#17191F] hover:bg-[#F3F4F6] rounded-xl transition-colors cursor-pointer"
            aria-label="Open navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigateSection('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-baseline gap-2.5 group"
          >
            <span className="text-lg sm:text-xl font-bold tracking-tight text-[#17191F] group-hover:opacity-90 transition-opacity whitespace-nowrap">
              NOVORA
            </span>
            <span className="hidden xl:inline-block text-[11px] text-[#646B76] font-medium tracking-wide uppercase pl-2.5 border-l border-[#E5E7EB]">
              Marketplace
            </span>
          </a>
        </div>

        {/* ================================================================= */}
        {/* Zone 2: Priority-Based Adaptive Desktop Navigation (>= 1024px)    */}
        {/* ================================================================= */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs xl:text-sm font-medium text-[#646B76] shrink-0">
          {/* Highest Priority Items (Always visible on lg+) */}
          <button
            type="button"
            onClick={() => onNavigateSection('discover')}
            className="hover:text-[#17191F] transition-colors py-1.5 cursor-pointer whitespace-nowrap"
          >
            Discover
          </button>

          <button
            type="button"
            onClick={() => onNavigateSection('categories')}
            className="hover:text-[#17191F] transition-colors py-1.5 cursor-pointer whitespace-nowrap"
          >
            Categories
          </button>

          <button
            type="button"
            onClick={() => onNavigateSection('request-orbit')}
            className="hover:text-[#17191F] transition-colors py-1.5 cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>Buyer Requests</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#4057D6]" />
          </button>

          {/* Medium Priority Item (Visible on 2xl+, or folded into More on medium) */}
          <div className="hidden 2xl:flex items-center gap-6">
            {userStore ? (
              <button
                type="button"
                onClick={() => onOpenStore && onOpenStore(userStore)}
                className="hover:text-[#17191F] transition-colors py-1.5 cursor-pointer flex items-center gap-1 text-[#4057D6] whitespace-nowrap"
              >
                <Store className="w-3.5 h-3.5" />
                <span>My Store</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!currentUser) onOpenAuth('signin');
                  else if (onOpenStoreWizard) onOpenStoreWizard();
                }}
                className="hover:text-[#17191F] transition-colors py-1.5 cursor-pointer flex items-center gap-1 whitespace-nowrap"
              >
                <Store className="w-3.5 h-3.5 text-[#646B76]" />
                <span>Set Up Store</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigateSection('safety')}
              className="hover:text-[#17191F] transition-colors py-1.5 cursor-pointer flex items-center gap-1 whitespace-nowrap"
            >
              <Shield className="w-3.5 h-3.5 text-[#646B76]" />
              <span>Trust & Safety</span>
            </button>
          </div>

          {/* Adaptive 'More ▾' Overflow Menu (Visible between 1024px and 1535px) */}
          <div className="relative 2xl:hidden" ref={moreDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setShowMoreNavDropdown(!showMoreNavDropdown);
                setShowLocationDropdown(false);
                setShowUserDropdown(false);
              }}
              className="hover:text-[#17191F] transition-colors py-1.5 flex items-center gap-1 cursor-pointer whitespace-nowrap text-xs font-semibold"
              aria-expanded={showMoreNavDropdown}
            >
              <span>More</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${showMoreNavDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showMoreNavDropdown && (
              <div className="absolute left-0 mt-2 w-56 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                {userStore ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreNavDropdown(false);
                      if (onOpenStore) onOpenStore(userStore);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-[#4057D6] hover:bg-[#EEF2FF] flex items-center justify-between font-medium cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Store className="w-3.5 h-3.5" />
                      <span>My Storefront</span>
                    </span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreNavDropdown(false);
                      if (!currentUser) onOpenAuth('signin');
                      else if (onOpenStoreWizard) onOpenStoreWizard();
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-[#17191F] hover:bg-[#F3F4F6] flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <Store className="w-3.5 h-3.5 text-[#4057D6]" />
                    <span>Set Up Independent Store</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowMoreNavDropdown(false);
                    onNavigateSection('safety');
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-[#374151] hover:bg-[#F3F4F6] flex items-center gap-2 font-medium cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-[#646B76]" />
                  <span>Trust & Safety Guidelines</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMoreNavDropdown(false);
                    onOpenFindMatch();
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-[#374151] hover:bg-[#F3F4F6] flex items-center gap-2 font-medium cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-[#4057D6]" />
                  <span>Find My Match</span>
                </button>

                <div className="border-t border-[#E5E7EB] my-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreNavDropdown(false);
                      onNavigateSection('about');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-[#646B76] hover:text-[#17191F] hover:bg-[#F3F4F6] cursor-pointer"
                  >
                    About NOVORA
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreNavDropdown(false);
                      onNavigateSection('how-it-works');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-[#646B76] hover:text-[#17191F] hover:bg-[#F3F4F6] cursor-pointer"
                  >
                    How It Works
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* ================================================================= */}
        {/* Zone 3: Utility Controls & User Authentication                    */}
        {/* ================================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Find My Match Action Button (Adaptive: text on sm+, icon on mobile) */}
          <button
            type="button"
            onClick={onOpenFindMatch}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 sm:px-3 py-1.5 text-[#4057D6] bg-[#EEF2FF] hover:bg-[#E0E7FF] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            title="Need-Based Discovery Match Engine"
            aria-label="Find My Match"
          >
            <Compass className="w-3.5 h-3.5 text-[#4057D6] shrink-0" />
            <span className="hidden sm:inline">Find My Match</span>
          </button>

          {/* Country & Currency Selector (Responsive popover with boundary protection) */}
          <div className="relative" ref={locationDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setShowLocationDropdown(!showLocationDropdown);
                setShowUserDropdown(false);
                setShowMoreNavDropdown(false);
              }}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-[#4B5563] hover:text-[#17191F] hover:bg-[#F3F4F6] rounded-lg transition-colors border border-[#E5E7EB] cursor-pointer"
              aria-label={`Region ${selectedCountryObj.name}, Currency ${currentCurrency}`}
              aria-expanded={showLocationDropdown}
            >
              <span className="text-sm leading-none" aria-hidden="true">{selectedCountryObj.flag}</span>
              <span className="font-mono text-[11px] font-semibold">{currentCurrency}</span>
            </button>

            {showLocationDropdown && (
              <div className="absolute right-0 mt-2 w-[min(calc(100vw-2rem),18rem)] bg-white border border-[#E5E7EB] rounded-2xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-xs font-semibold text-[#17191F] mb-2">Location & Currency</div>
                
                <label className="block text-[11px] text-[#646B76] mb-1 font-medium">Your Region</label>
                <select
                  value={currentCountry}
                  onChange={(e) => onSelectCountry(e.target.value)}
                  className="w-full text-xs p-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg mb-3 text-[#17191F]"
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
                      type="button"
                      onClick={() => {
                        onSelectCurrency(cur.code);
                        setShowLocationDropdown(false);
                      }}
                      className={`text-xs py-1.5 px-2 rounded-lg font-mono cursor-pointer transition-colors ${
                        currentCurrency === cur.code
                          ? 'bg-[#17191F] text-white font-medium shadow-2xs'
                          : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]'
                      }`}
                    >
                      {cur.code}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          {currentUser && onOpenNotifications && (
            <button
              type="button"
              onClick={onOpenNotifications}
              className="relative p-2 text-[#646B76] hover:text-[#17191F] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
              title="Notifications"
              aria-label="Notification Center"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#4057D6] text-white text-[10px] font-semibold rounded-full flex items-center justify-center tabular-nums">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>
          )}

          {/* Saved Favorites */}
          <button
            type="button"
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

          {/* Direct Messages */}
          <button
            type="button"
            onClick={() => {
              if (!currentUser) onOpenAuth('signin');
              else onOpenMessages();
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
            <div className="relative" ref={userDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowLocationDropdown(false);
                  setShowMoreNavDropdown(false);
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 text-xs font-medium text-[#17191F] hover:bg-[#F3F4F6] rounded-lg transition-colors border border-[#E5E7EB] cursor-pointer"
                aria-expanded={showUserDropdown}
              >
                <div className="w-5 h-5 rounded-full bg-[#17191F] text-white text-[10px] font-semibold flex items-center justify-center shrink-0">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[90px] md:max-w-[120px] truncate">{currentUser.name}</span>
                <ChevronDown className="w-3 h-3 text-[#646B76] shrink-0" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-[min(calc(100vw-2rem),16rem)] bg-white border border-[#E5E7EB] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-[#E5E7EB]">
                    <p className="text-xs font-semibold text-[#17191F] truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-[#646B76] truncate">{currentUser.email}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-[#646B76]">
                      <span>{currentUser.isSeller ? 'Seller Account' : 'Buyer Account'}</span>
                      {currentUser.isAdmin && (
                        <span className="text-[#4057D6] font-semibold">· Platform Admin</span>
                      )}
                    </div>
                  </div>

                  <div className="py-1">
                    {userStore ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenStore) onOpenStore(userStore);
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#4057D6] hover:bg-[#EEF2FF] flex items-center justify-between font-medium cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5" />
                          <span>My Storefront</span>
                        </span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenStoreWizard) onOpenStoreWizard();
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#4057D6] hover:bg-[#EEF2FF] flex items-center justify-between font-medium cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5" />
                          <span>Set Up Storefront</span>
                        </span>
                        <span className="text-[10px] font-bold text-[#4057D6]">New</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        onOpenWorkspace('seller');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#374151] hover:bg-[#F9FAFB] flex items-center justify-between cursor-pointer"
                    >
                      <span>Seller Control Center</span>
                      <span className="text-[10px] text-[#646B76]">Listings & Offers</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onOpenWorkspace('buyer');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#374151] hover:bg-[#F9FAFB] flex items-center justify-between cursor-pointer"
                    >
                      <span>Buyer Sanctuary</span>
                      <span className="text-[10px] text-[#646B76]">Wishlist & Requests</span>
                    </button>

                    {onOpenUserProfile && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenUserProfile(currentUser);
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#374151] hover:bg-[#F9FAFB] flex items-center justify-between cursor-pointer"
                      >
                        <span>Public Profile</span>
                        <User className="w-3.5 h-3.5 text-[#646B76]" />
                      </button>
                    )}

                    {currentUser.isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenWorkspace('admin');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#4057D6] hover:bg-[#EFF6FF] flex items-center justify-between font-medium cursor-pointer"
                      >
                        <span>Admin Governance</span>
                        <Shield className="w-3.5 h-3.5 text-[#4057D6]" />
                      </button>
                    )}
                  </div>

                  <div className="border-t border-[#E5E7EB] pt-1">
                    <button
                      type="button"
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
                      type="button"
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
                      type="button"
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
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => onOpenAuth('signin')}
                className="px-2.5 sm:px-3 py-1.5 text-xs font-medium text-[#374151] hover:text-[#17191F] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="px-3 sm:px-3.5 py-1.5 text-xs font-medium text-white bg-[#17191F] hover:bg-[#27272A] rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
              >
                Register
              </button>
            </div>
          )}

        </div>

      </div>

      {/* ================================================================= */}
      {/* Mobile Navigation Drawer Slide-Out (< 1024px)                     */}
      {/* ================================================================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            aria-hidden="true"
          />

          {/* Drawer Body */}
          <div className="relative w-[min(calc(100vw-3rem),22rem)] max-w-full bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200 border-r border-[#E5E7EB]">
            
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-[#FAFAF8]">
              <div className="flex items-center gap-2.5">
                <span className="text-lg font-bold tracking-tight text-[#17191F]">
                  NOVORA
                </span>
                <span className="text-[10px] text-[#646B76] font-medium tracking-wide uppercase px-2 py-0.5 bg-white rounded-md border border-[#E5E7EB]">
                  Navigation
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-[#646B76] hover:text-[#17191F] hover:bg-[#E5E7EB] rounded-lg transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
              
              {/* Quick Actions */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenFindMatch();
                  }}
                  className="w-full p-3 bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4057D6] rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Compass className="w-4 h-4" />
                    <span>Find My Match</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenCreateListing();
                    }}
                    className="p-2.5 bg-white border border-[#E5E7EB] hover:border-[#17191F] text-[#17191F] rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#4057D6]" />
                    <span>Post Listing</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenCreateRequest();
                    }}
                    className="p-2.5 bg-white border border-[#E5E7EB] hover:border-[#17191F] text-[#17191F] rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Buyer Request</span>
                  </button>
                </div>
              </div>

              {/* Marketplace Taxonomy & Discovery */}
              <div>
                <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider block mb-2 px-1">
                  Marketplace
                </span>
                <nav className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onNavigateSection('discover');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[#374151] hover:bg-[#F3F4F6] hover:text-[#17191F] flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>Discover Public Catalog</span>
                    <ArrowRight className="w-3 h-3 text-[#9CA3AF]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onNavigateSection('categories');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[#374151] hover:bg-[#F3F4F6] hover:text-[#17191F] flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>All Categories</span>
                    <Layers className="w-3 h-3 text-[#9CA3AF]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onNavigateSection('request-orbit');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[#374151] hover:bg-[#F3F4F6] hover:text-[#17191F] flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <span>Buyer Requests</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4057D6]" />
                    </span>
                    <Compass className="w-3 h-3 text-[#9CA3AF]" />
                  </button>

                  {userStore ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (onOpenStore) onOpenStore(userStore);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[#4057D6] hover:bg-[#EEF2FF] flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Store className="w-3.5 h-3.5" />
                        <span>My Storefront</span>
                      </span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (!currentUser) onOpenAuth('signin');
                        else if (onOpenStoreWizard) onOpenStoreWizard();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[#374151] hover:bg-[#F3F4F6] hover:text-[#17191F] flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Store className="w-3.5 h-3.5 text-[#4057D6]" />
                        <span>Set Up Storefront</span>
                      </span>
                      <span className="text-[10px] font-bold text-[#4057D6]">New</span>
                    </button>
                  )}
                </nav>
              </div>

              {/* User Account / Workspaces (if signed in) */}
              {currentUser && (
                <div>
                  <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider block mb-2 px-1">
                    Your Workspace
                  </span>
                  <nav className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenWorkspace('seller');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[#374151] hover:bg-[#F3F4F6] flex items-center justify-between cursor-pointer"
                    >
                      <span>Seller Control Center</span>
                      <span className="text-[10px] text-[#646B76]">Manage</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenWorkspace('buyer');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[#374151] hover:bg-[#F3F4F6] flex items-center justify-between cursor-pointer"
                    >
                      <span>Buyer Sanctuary</span>
                      <span className="text-[10px] text-[#646B76]">Wishlist</span>
                    </button>

                    {onOpenUserProfile && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onOpenUserProfile(currentUser);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[#374151] hover:bg-[#F3F4F6] flex items-center justify-between cursor-pointer"
                      >
                        <span>Public Profile</span>
                        <User className="w-3.5 h-3.5 text-[#646B76]" />
                      </button>
                    )}

                    {currentUser.isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onOpenWorkspace('admin');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[#4057D6] hover:bg-[#EFF6FF] flex items-center justify-between cursor-pointer"
                      >
                        <span>Admin Governance</span>
                        <Shield className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </nav>
                </div>
              )}

              {/* Trust, Security & Information */}
              <div>
                <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider block mb-2 px-1">
                  Community & Integrity
                </span>
                <nav className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onNavigateSection('safety');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#646B76] hover:text-[#17191F] hover:bg-[#F3F4F6] flex items-center gap-2 cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#4057D6]" />
                    <span>Trust & Safety Policy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onNavigateSection('about');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#646B76] hover:text-[#17191F] hover:bg-[#F3F4F6] cursor-pointer"
                  >
                    About NOVORA
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onNavigateSection('how-it-works');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#646B76] hover:text-[#17191F] hover:bg-[#F3F4F6] cursor-pointer"
                  >
                    How It Works
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onNavigateSection('terms');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#646B76] hover:text-[#17191F] hover:bg-[#F3F4F6] cursor-pointer"
                  >
                    Terms of Service
                  </button>
                </nav>
              </div>

            </div>

            {/* Drawer Footer: Auth or Sign Out */}
            <div className="p-4 border-t border-[#E5E7EB] bg-[#FAFAF8]">
              {currentUser ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#17191F] text-white text-xs font-semibold flex items-center justify-center shrink-0">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#17191F] truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-[#646B76] truncate">{currentUser.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAuth('signin');
                    }}
                    className="py-2.5 px-3 text-xs font-medium text-[#374151] hover:text-[#17191F] bg-white border border-[#E5E7EB] rounded-xl transition-colors text-center cursor-pointer shadow-2xs"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAuth('register');
                    }}
                    className="py-2.5 px-3 text-xs font-medium text-white bg-[#17191F] hover:bg-[#27272A] rounded-xl transition-colors text-center cursor-pointer shadow-xs"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </header>
  );
};
