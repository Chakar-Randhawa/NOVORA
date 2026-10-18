import React, { useState, useEffect, useMemo } from 'react';
import {
  Listing,
  BuyerRequest,
  RequestOffer,
  UserProfile,
  Conversation,
  ReportItem,
  Storefront,
  MainViewMode
} from './types';
import {
  testConnection,
  subscribeToAuth,
  logoutUser,
  syncUserProfile,
  subscribeToListings,
  createListing,
  updateListing,
  deleteListing,
  incrementListingView,
  subscribeToRequests,
  createBuyerRequest,
  updateBuyerRequest,
  subscribeToUserOffers,
  createOffer,
  updateOfferStatus,
  subscribeToFavorites,
  toggleFavorite,
  subscribeToConversations,
  getOrCreateConversation,
  subscribeToReports,
  submitReport,
  resolveReport,
  subscribeToStores,
  saveStore,
  fetchStoreBySlug,
  fetchStoreBySellerId,
  fetchUserProfileById
} from './services/firebase';

import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { ReportModal } from './components/common/ReportModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';

import { Hero } from './components/home/Hero';
import { CategoriesGrid } from './components/home/CategoriesGrid';
import { FeaturedListings } from './components/home/FeaturedListings';
import { DiscoveryShowcase } from './components/home/DiscoveryShowcase';
import { RequestOrbitPreview } from './components/home/RequestOrbitPreview';
import { SellerSpotlight } from './components/home/SellerSpotlight';
import { TrustSafetyBanner } from './components/home/TrustSafetyBanner';

import { ListingDetailModal } from './components/listings/ListingDetailModal';
import { CreateListingModal } from './components/listings/CreateListingModal';
import { FindMyMatchModal } from './components/discovery/FindMyMatchModal';
import { RequestOrbitView } from './components/requests/RequestOrbitView';
import { CreateRequestModal } from './components/requests/CreateRequestModal';
import { SubmitOfferModal } from './components/requests/SubmitOfferModal';
import { MessagingModal } from './components/messaging/MessagingModal';
import { SellerWorkspace } from './components/workspace/SellerWorkspace';
import { BuyerWorkspace } from './components/workspace/BuyerWorkspace';
import { AdminWorkspace } from './components/workspace/AdminWorkspace';
import { PublicStorefront } from './components/store/PublicStorefront';
import { StoreSetupWizard } from './components/store/StoreSetupWizard';
import { PublicUserProfile } from './components/profile/PublicUserProfile';
import { InfoPages } from './components/legal/InfoPages';
import { AuthModal } from './components/auth/AuthModal';
import { Breadcrumbs } from './components/common/Breadcrumbs';

export const App: React.FC = () => {
  // 1. Core State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  const [listings, setListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [requests, setRequests] = useState<BuyerRequest[]>([]);
  const [offers, setOffers] = useState<RequestOffer[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [stores, setStores] = useState<Storefront[]>([]);

  // Country & Currency preferences
  const [currentCountry, setCurrentCountry] = useState<string>('US');
  const [currentCurrency, setCurrentCurrency] = useState<string>('USD');

  // Navigation & View state
  const [activeView, setActiveView] = useState<'home' | 'seller' | 'buyer' | 'admin' | 'request-orbit' | 'store' | 'user-profile' | 'info'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeStoreForView, setActiveStoreForView] = useState<Storefront | null>(null);
  const [activeProfileForView, setActiveProfileForView] = useState<UserProfile | null>(null);
  const [activeInfoPage, setActiveInfoPage] = useState<'about' | 'how-it-works' | 'safety' | 'terms' | 'seller-guide' | 'help'>('about');

  // Modals & Drawers
  const [activeListingForDetail, setActiveListingForDetail] = useState<Listing | null>(null);
  const [showCreateListingModal, setShowCreateListingModal] = useState(false);
  const [listingToEdit, setListingToEdit] = useState<Listing | null>(null);
  const [showCreateRequestModal, setShowCreateRequestModal] = useState(false);
  const [requestForOffer, setRequestForOffer] = useState<BuyerRequest | null>(null);
  const [showFindMatchModal, setShowFindMatchModal] = useState(false);
  const [findMatchInitialQuery, setFindMatchInitialQuery] = useState('');
  const [showMessagingModal, setShowMessagingModal] = useState(false);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'register'>('signin');
  const [showStoreWizard, setShowStoreWizard] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    type: 'listing' | 'request' | 'user' | 'message';
    id: string;
    title: string;
  } | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // 2. Initial Setup: Test connection and subscribe to real Firestore collections
  useEffect(() => {
    testConnection().then(connected => {
      if (!connected) {
        console.info('[NOVORA] Database connecting or operating in offline cache mode.');
      }
    });

    // Real-time public listings
    const unsubListings = subscribeToListings((liveListings) => {
      setListings(liveListings);
      setListingsLoading(false);

      // Deep link to listing if provided in URL parameter (?listing=...)
      const currentParams = new URLSearchParams(window.location.search);
      const targetListingId = currentParams.get('listing');
      if (targetListingId) {
        const found = liveListings.find(l => l.id === targetListingId);
        if (found) {
          setActiveListingForDetail(found);
        }
      }
    });

    // Real-time public requests
    const unsubRequests = subscribeToRequests((liveRequests) => {
      setRequests(liveRequests);
    });

    // Real-time public stores
    const unsubStores = subscribeToStores((liveStores) => {
      setStores(liveStores);
    });

    // Listen to Firebase Auth state
    const unsubAuth = subscribeToAuth((profile) => {
      setCurrentUser(profile);
      setAuthInitialized(true);
      if (profile) {
        setCurrentCountry(profile.country || 'US');
        setCurrentCurrency(profile.preferredCurrency || 'USD');
      }
    });

    // Check URL parameters for direct deep link access (e.g. ?store=... or ?profile=...)
    const params = new URLSearchParams(window.location.search);
    const storeSlug = params.get('store');
    const profileId = params.get('profile');
    const viewParam = params.get('view');
    const pageParam = params.get('page');

    if (storeSlug) {
      fetchStoreBySlug(storeSlug).then(st => {
        if (st) {
          setActiveStoreForView(st);
          setActiveView('store');
        }
      });
    } else if (profileId) {
      fetchUserProfileById(profileId).then(p => {
        if (p) {
          setActiveProfileForView(p);
          setActiveView('user-profile');
        }
      });
    } else if (viewParam === 'seller') {
      setActiveView('seller');
    } else if (viewParam === 'buyer') {
      setActiveView('buyer');
    } else if (viewParam === 'request-orbit') {
      setActiveView('request-orbit');
    } else if (pageParam) {
      setActiveInfoPage(pageParam as any);
      setActiveView('info');
    }

    const handlePopState = () => {
      const currentParams = new URLSearchParams(window.location.search);
      const targetListingId = currentParams.get('listing');
      if (targetListingId) {
        setListings(prev => {
          const found = prev.find(l => l.id === targetListingId);
          if (found) {
            setActiveListingForDetail(found);
          }
          return prev;
        });
      } else {
        setActiveListingForDetail(null);
      }
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      unsubListings();
      unsubRequests();
      unsubStores();
      unsubAuth();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // 3. User-specific real-time subscriptions
  useEffect(() => {
    if (!currentUser) {
      setFavorites([]);
      setConversations([]);
      setReports([]);
      setOffers([]);
      return;
    }

    const unsubFavs = subscribeToFavorites(currentUser.id, (favIds) => {
      setFavorites(favIds);
    });

    const unsubConvos = subscribeToConversations(currentUser.id, (convs) => {
      setConversations(convs);
    });

    const unsubOffers = subscribeToUserOffers(
      currentUser.id,
      Boolean(currentUser.isAdmin),
      (liveOffers) => {
        setOffers(liveOffers);
      }
    );

    let unsubReports: (() => void) | null = null;
    if (currentUser.isAdmin) {
      unsubReports = subscribeToReports((liveReports) => {
        setReports(liveReports);
      });
    }

    return () => {
      unsubFavs();
      unsubConvos();
      unsubOffers();
      if (unsubReports) unsubReports();
    };
  }, [currentUser]);

  // Current user's store
  const userStore = useMemo(() => {
    return stores.find(s => s.sellerId === currentUser?.id) || null;
  }, [stores, currentUser]);

  // Unread notification count
  const unreadNotificationsCount = useMemo(() => {
    if (!currentUser) return 0;
    const unreadMsgs = conversations.reduce((acc, c) => acc + (c.unreadCount?.[currentUser.id] || 0), 0);
    const myRequestIds = new Set(requests.filter(r => r.buyerId === currentUser.id).map(r => r.id));
    const pendingOffers = offers.filter(o => myRequestIds.has(o.requestId) && o.status === 'pending').length;
    return unreadMsgs + pendingOffers;
  }, [currentUser, conversations, requests, offers]);

  // Handlers
  const handleOpenAuth = (mode: 'signin' | 'register' = 'signin') => {
    setAuthInitialMode(mode);
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setActiveView('home');
    addToast('info', 'Signed Out', 'You have been safely signed out.');
  };

  const handleUserChanged = (user: UserProfile | null) => {
    setCurrentUser(user);
    if (user) {
      addToast('success', `Welcome, ${user.name}!`, 'You are signed in to NOVORA.');
    }
  };

  const handleToggleFavorite = async (listingId: string) => {
    if (!currentUser) {
      handleOpenAuth('signin');
      return;
    }
    try {
      const added = await toggleFavorite(listingId);
      if (added) {
        addToast('success', 'Saved to Wishlist', 'Listing added to your buyer collection.');
      } else {
        addToast('info', 'Removed from Wishlist', 'Listing removed from your collection.');
      }
    } catch {
      addToast('error', 'Action Failed', 'Could not update favorites.');
    }
  };

  const handleSelectListing = (listing: Listing) => {
    setActiveListingForDetail(listing);
    incrementListingView(listing.id);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('listing', listing.id);
      window.history.pushState({}, '', url.toString());
    } catch {
      // ignore
    }
    // Add to recently viewed in localStorage
    try {
      const raw = localStorage.getItem('novora_recent_viewed');
      const prev: string[] = raw ? JSON.parse(raw) : [];
      const updated = [listing.id, ...prev.filter(id => id !== listing.id)].slice(0, 10);
      localStorage.setItem('novora_recent_viewed', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleCreateListing = async (newListingData: any) => {
    try {
      const created = await createListing(newListingData);
      addToast('success', 'Listing Published', `"${created.title}" is live in the global directory.`);
      setShowCreateListingModal(false);
      setListingToEdit(null);
    } catch {
      addToast('error', 'Error', 'Failed to publish listing.');
    }
  };

  const handleOpenEditListing = (listing: Listing) => {
    setListingToEdit(listing);
    setShowCreateListingModal(true);
  };

  const handleUpdateListing = async (id: string, updates: Partial<Listing>) => {
    try {
      await updateListing(id, updates);
      addToast('success', 'Offering Updated', 'Listing changes have been saved to the marketplace.');
      if (activeListingForDetail?.id === id) {
        setActiveListingForDetail(prev => prev ? { ...prev, ...updates } : null);
      }
      setListingToEdit(null);
    } catch {
      addToast('error', 'Error', 'Failed to update listing.');
    }
  };

  const handleUpdateOfferStatus = async (offerId: string, status: 'accepted' | 'declined') => {
    try {
      await updateOfferStatus(offerId, status);
      if (status === 'accepted') {
        addToast('success', 'Commercial Offer Accepted', 'Direct terms accepted. You can message the seller to proceed with fulfillment.');
      } else {
        addToast('info', 'Offer Declined', 'Seller offer has been declined.');
      }
    } catch {
      addToast('error', 'Error', 'Failed to update offer status.');
    }
  };

  const handleToggleListingStatus = async (listingId: string) => {
    const item = listings.find(l => l.id === listingId);
    if (!item) return;
    const newStatus = item.status === 'active' ? 'paused' : 'active';
    try {
      await updateListing(listingId, { status: newStatus });
      addToast('info', 'Status Updated', `Listing marked as ${newStatus}.`);
      if (activeListingForDetail?.id === listingId) {
        setActiveListingForDetail({ ...activeListingForDetail, status: newStatus });
      }
    } catch {
      addToast('error', 'Error', 'Could not update listing status.');
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    try {
      await deleteListing(listingId);
      addToast('info', 'Listing Deleted', 'Item removed from marketplace.');
      if (activeListingForDetail?.id === listingId) {
        setActiveListingForDetail(null);
      }
    } catch {
      addToast('error', 'Error', 'Could not delete listing.');
    }
  };

  const handleDuplicateListing = async (listing: Listing) => {
    if (!currentUser) return;
    try {
      const copyPayload = {
        title: `${listing.title} (Draft Copy)`,
        description: listing.description,
        categoryId: listing.categoryId,
        listingType: listing.listingType,
        price: listing.price,
        currency: listing.currency,
        condition: listing.condition,
        sellerId: currentUser.id,
        sellerName: currentUser.name,
        sellerCountry: currentUser.country,
        sellerCity: currentUser.city || '',
        images: listing.images || [],
        customAttributes: listing.customAttributes || {},
        shipsInternationally: listing.shipsInternationally,
        shippingDestinations: listing.shippingDestinations || ['Worldwide'],
        shippingEstimateDays: listing.shippingEstimateDays || 5,
        shippingCostDescription: listing.shippingCostDescription || '',
        allowsCustomization: listing.allowsCustomization,
        tags: listing.tags || [],
        status: 'active' as const
      };
      await createListing(copyPayload);
      addToast('success', 'Listing Duplicated', 'A duplicate draft copy has been created.');
    } catch {
      addToast('error', 'Error', 'Failed to duplicate listing.');
    }
  };

  const handleCreateRequest = async (data: any) => {
    try {
      const created = await createBuyerRequest(data);
      addToast('success', 'Request Posted to Request Orbit', `"${created.title}" is published for seller proposals.`);
      setShowCreateRequestModal(false);
      setActiveView('request-orbit');
    } catch {
      addToast('error', 'Error', 'Failed to post buyer request.');
    }
  };

  const handleSubmitOffer = async (offerData: any) => {
    try {
      await createOffer(offerData);
      addToast('success', 'Quote Proposal Submitted', 'Buyer has been notified with your commercial terms.');
      setRequestForOffer(null);
    } catch {
      addToast('error', 'Error', 'Failed to submit quote.');
    }
  };

  const handleCloseRequest = async (requestId: string) => {
    try {
      await updateBuyerRequest(requestId, { status: 'closed' });
      addToast('info', 'Request Closed', 'This request is no longer accepting new seller offers.');
    } catch {
      addToast('error', 'Error', 'Could not close request.');
    }
  };

  const handleStartMessageOnListing = async (listing: Listing) => {
    if (!currentUser) {
      handleOpenAuth('signin');
      return;
    }
    if (currentUser.id === listing.sellerId) {
      addToast('info', 'Own Listing', 'You are the seller of this listing.');
      return;
    }
    try {
      const conv = await getOrCreateConversation(listing.sellerId, listing.sellerName, {
        listingId: listing.id,
        listingTitle: listing.title
      });
      setActiveConversation(conv);
      setShowMessagingModal(true);
      if (activeListingForDetail) setActiveListingForDetail(null);
    } catch {
      addToast('error', 'Error', 'Could not open conversation.');
    }
  };

  const handleStartMessageWithSeller = async (sellerId: string, sellerName: string, context?: any) => {
    if (!currentUser) {
      handleOpenAuth('signin');
      return;
    }
    try {
      const conv = await getOrCreateConversation(sellerId, sellerName, context);
      setActiveConversation(conv);
      setShowMessagingModal(true);
    } catch {
      addToast('error', 'Error', 'Could not open conversation.');
    }
  };

  const handleSaveStore = async (storeData: any): Promise<Storefront> => {
    const saved = await saveStore(storeData);
    addToast('success', 'Storefront Saved', `"${saved.storeName}" is live on NOVORA.`);
    return saved;
  };

  const handleOpenStore = (store: Storefront) => {
    setActiveStoreForView(store);
    setActiveView('store');
    window.history.pushState({}, '', `?store=${store.storeSlug || store.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenUserProfile = (user: UserProfile) => {
    setActiveProfileForView(user);
    setActiveView('user-profile');
    window.history.pushState({}, '', `?profile=${user.username || user.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSeller = async (sellerId: string, sellerName: string) => {
    // Check if seller has a public store
    const existing = stores.find(s => s.sellerId === sellerId);
    if (existing) {
      handleOpenStore(existing);
      return;
    }
    // Otherwise open their public profile
    const prof = await fetchUserProfileById(sellerId);
    if (prof) {
      handleOpenUserProfile(prof);
    } else {
      handleOpenUserProfile({
        id: sellerId,
        name: sellerName,
        username: sellerName.toLowerCase().replace(/\s+/g, ''),
        email: '',
        country: 'Global',
        preferredCurrency: 'USD',
        joinedDate: new Date().toISOString(),
        isSeller: true,
        languages: ['English']
      });
    }
  };

  const handleSubmitReport = async (data: any) => {
    try {
      await submitReport(data);
      addToast('success', 'Report Submitted', 'Our moderation team will review this notice promptly.');
      setReportTarget(null);
    } catch {
      addToast('error', 'Error', 'Failed to submit report.');
    }
  };

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    try {
      await resolveReport(reportId, status);
      addToast('info', 'Report Updated', `Report status changed to ${status}.`);
    } catch {
      addToast('error', 'Error', 'Could not resolve report.');
    }
  };

  const handleDeactivateListingFromAdmin = async (listingId: string) => {
    try {
      await updateListing(listingId, { status: 'archived' });
      addToast('info', 'Listing Archived', 'Item removed from active marketplace visibility.');
    } catch {
      addToast('error', 'Error', 'Could not archive listing.');
    }
  };

  const handleUpdateProfile = async (updated: Partial<UserProfile>) => {
    if (!currentUser) return;
    try {
      const merged = await syncUserProfile({ uid: currentUser.id, email: currentUser.email } as any, updated);
      setCurrentUser(merged);
      addToast('success', 'Profile Updated', 'Your settings were saved successfully.');
    } catch {
      addToast('error', 'Error', 'Could not update profile.');
    }
  };

  const handleNavigateSection = (sectionId: string) => {
    if (sectionId === 'home') {
      setActiveView('home');
      window.history.pushState({}, '', window.location.pathname);
    } else if (sectionId === 'request-orbit') {
      setActiveView('request-orbit');
    } else if (sectionId === 'seller') {
      setActiveView('seller');
    } else if (sectionId === 'buyer') {
      setActiveView('buyer');
    } else if (['about', 'how-it-works', 'safety', 'terms', 'seller-guide', 'help'].includes(sectionId)) {
      setActiveInfoPage(sectionId as any);
      setActiveView('info');
    } else {
      setActiveView('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#14243A] flex flex-col font-sans selection:bg-[#14243A] selection:text-white">
      
      {/* Global Header */}
      <Header
        currentUser={currentUser}
        userStore={userStore}
        favoritesCount={favorites.length}
        unreadMessagesCount={conversations.filter(c => (c.unreadCount?.[currentUser?.id || ''] || 0) > 0).length}
        unreadNotificationsCount={unreadNotificationsCount}
        currentCountry={currentCountry}
        currentCurrency={currentCurrency}
        onSelectCountry={setCurrentCountry}
        onSelectCurrency={setCurrentCurrency}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onOpenCreateListing={() => {
          setListingToEdit(null);
          if (!currentUser) handleOpenAuth('signin');
          else setShowCreateListingModal(true);
        }}
        onOpenCreateRequest={() => {
          if (!currentUser) handleOpenAuth('signin');
          else setShowCreateRequestModal(true);
        }}
        onOpenFindMatch={() => {
          setFindMatchInitialQuery('');
          setShowFindMatchModal(true);
        }}
        onOpenWorkspace={(tab) => {
          if (!currentUser) handleOpenAuth('signin');
          else setActiveView(tab);
        }}
        onOpenMessages={() => {
          if (!currentUser) handleOpenAuth('signin');
          else {
            if (conversations.length > 0 && !activeConversation) {
              setActiveConversation(conversations[0]);
            }
            setShowMessagingModal(true);
          }
        }}
        onOpenFavorites={() => {
          if (!currentUser) handleOpenAuth('signin');
          else setActiveView('buyer');
        }}
        onOpenNotifications={() => setShowNotificationDrawer(true)}
        onOpenStore={handleOpenStore}
        onOpenStoreWizard={() => {
          if (!currentUser) handleOpenAuth('signin');
          else setShowStoreWizard(true);
        }}
        onOpenUserProfile={(u) => handleOpenUserProfile(u)}
        onNavigateSection={handleNavigateSection}
      />

      {/* Main View Router */}
      <main className="flex-1">
        
        {/* View 1: Marketplace Home */}
        {activeView === 'home' && (
          <div className="space-y-16">
            <Hero
              listings={listings}
              onSearchNeed={(q) => {
                setFindMatchInitialQuery(q);
                setShowFindMatchModal(true);
              }}
              onExploreMarketplace={() => {
                const el = document.getElementById('catalog-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onPostRequest={() => {
                if (!currentUser) handleOpenAuth('signin');
                else setShowCreateRequestModal(true);
              }}
              onSelectListing={handleSelectListing}
              onSelectCategory={(catId) => {
                setSelectedCategory(catId);
                const el = document.getElementById('catalog-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <div className="novora-container space-y-16">
              {/* Category Grid */}
              <CategoriesGrid
                listings={listings}
                onSelectCategory={(catId) => {
                  setSelectedCategory(catId);
                  const el = document.getElementById('catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />

              {/* Discovery Showcase (Personalized, Verified Stores, Global Finds) */}
              <DiscoveryShowcase
                listings={listings}
                stores={stores}
                favorites={favorites}
                currentUser={currentUser}
                displayCurrency={currentCurrency}
                onSelectListing={handleSelectListing}
                onToggleFavorite={handleToggleFavorite}
                onViewStore={handleOpenStore}
                onExploreCategory={(catId) => {
                  setSelectedCategory(catId);
                  const el = document.getElementById('catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onOpenStoreWizard={() => {
                  if (!currentUser) handleOpenAuth('signin');
                  else setShowStoreWizard(true);
                }}
              />

              {/* Full Marketplace Catalog with Search & Filters */}
              <div id="catalog-section" className="pt-6">
                <FeaturedListings
                  listings={listings}
                  favorites={favorites}
                  displayCurrency={currentCurrency}
                  selectedCategory={selectedCategory}
                  isLoadingListings={listingsLoading}
                  onSelectCategory={setSelectedCategory}
                  onSelectListing={handleSelectListing}
                  onToggleFavorite={handleToggleFavorite}
                  onOpenCreateListing={() => {
                    if (!currentUser) handleOpenAuth('signin');
                    else setShowCreateListingModal(true);
                  }}
                />
              </div>

              {/* Request Orbit Sourcing Board Preview */}
              <RequestOrbitPreview
                requests={requests}
                offers={offers}
                onOpenOrbit={() => setActiveView('request-orbit')}
                onOpenCreateRequest={() => {
                  if (!currentUser) handleOpenAuth('signin');
                  else setShowCreateRequestModal(true);
                }}
              />

              {/* Trust & Safety Banner */}
              <TrustSafetyBanner />
            </div>
          </div>
        )}

        {/* View 2: Public Storefront */}
        {activeView === 'store' && activeStoreForView && (
          <PublicStorefront
            store={activeStoreForView}
            listings={listings}
            currentUser={currentUser}
            favorites={favorites}
            onSelectListing={handleSelectListing}
            onToggleFavorite={handleToggleFavorite}
            onStartMessage={handleStartMessageWithSeller}
            onReportStore={(st) => {
              setReportTarget({
                type: 'user',
                id: st.sellerId,
                title: `Storefront: ${st.storeName}`
              });
            }}
            onBackToMarketplace={() => {
              setActiveView('home');
              window.history.pushState({}, '', window.location.pathname);
            }}
            onEditStore={() => {
              setShowStoreWizard(true);
            }}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {/* View 3: Public User Profile */}
        {activeView === 'user-profile' && activeProfileForView && (
          <PublicUserProfile
            user={activeProfileForView}
            listings={listings}
            store={stores.find(s => s.sellerId === activeProfileForView.id) || null}
            currentUser={currentUser}
            favorites={favorites}
            onSelectListing={handleSelectListing}
            onToggleFavorite={handleToggleFavorite}
            onStartMessage={(sid, sname) => handleStartMessageWithSeller(sid, sname)}
            onViewStore={handleOpenStore}
            onReportUser={(u) => {
              setReportTarget({
                type: 'user',
                id: u.id,
                title: `User Profile: ${u.name}`
              });
            }}
            onBackToMarketplace={() => {
              setActiveView('home');
              window.history.pushState({}, '', window.location.pathname);
            }}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {/* View 4: Request Orbit (Buyer Sourcing Board) */}
        {activeView === 'request-orbit' && (
          <div className="novora-container py-8 sm:py-10">
            <div className="mb-6 flex items-center justify-between gap-2">
              <Breadcrumbs
                items={[
                  { label: 'Marketplace', onClick: () => setActiveView('home') },
                  { label: 'Sourcing & Procurement', onClick: () => setActiveView('home') },
                  { label: 'Request Orbit', current: true }
                ]}
                className="py-0 px-0"
              />
            </div>
            <RequestOrbitView
              requests={requests}
              offers={offers}
              currentUser={currentUser}
              onOpenCreateRequest={() => {
                if (!currentUser) handleOpenAuth('signin');
                else setShowCreateRequestModal(true);
              }}
              onOpenSubmitOffer={(req) => {
                if (!currentUser) handleOpenAuth('signin');
                else setRequestForOffer(req);
              }}
              onStartMessageWithSeller={handleStartMessageWithSeller}
              onCloseRequest={handleCloseRequest}
              onOpenAuth={handleOpenAuth}
            />
          </div>
        )}

        {/* View 5: Seller Control Center */}
        {activeView === 'seller' && (
          <div className="novora-container py-8 sm:py-10">
            <div className="mb-6 flex items-center justify-between gap-2">
              <Breadcrumbs
                items={[
                  { label: 'Marketplace', onClick: () => setActiveView('home') },
                  { label: 'Workspaces', onClick: () => setActiveView('home') },
                  { label: 'Seller Control Center', current: true }
                ]}
                className="py-0 px-0"
              />
            </div>
            <SellerWorkspace
              currentUser={currentUser}
              listings={listings}
              store={userStore}
              requests={requests}
              offers={offers}
              conversations={conversations}
              onOpenCreateListing={() => {
                setListingToEdit(null);
                if (!currentUser) handleOpenAuth('signin');
                else setShowCreateListingModal(true);
              }}
              onEditListing={handleOpenEditListing}
              onToggleStatus={handleToggleListingStatus}
              onDeleteListing={handleDeleteListing}
              onDuplicateListing={handleDuplicateListing}
              onSelectListing={handleSelectListing}
              onOpenStoreWizard={() => setShowStoreWizard(true)}
              onViewStore={handleOpenStore}
              onOpenSubmitOffer={(req) => setRequestForOffer(req)}
              onOpenMessages={(conv) => {
                if (conv) setActiveConversation(conv);
                setShowMessagingModal(true);
              }}
              onUpdateProfile={handleUpdateProfile}
              onOpenAuth={handleOpenAuth}
            />
          </div>
        )}

        {/* View 6: Buyer Sanctuary */}
        {activeView === 'buyer' && (
          <div className="novora-container py-8 sm:py-10">
            <div className="mb-6 flex items-center justify-between gap-2">
              <Breadcrumbs
                items={[
                  { label: 'Marketplace', onClick: () => setActiveView('home') },
                  { label: 'Workspaces', onClick: () => setActiveView('home') },
                  { label: 'Buyer Sanctuary', current: true }
                ]}
                className="py-0 px-0"
              />
            </div>
            <BuyerWorkspace
              currentUser={currentUser}
              favorites={favorites}
              allListings={listings}
              requests={requests}
              offers={offers}
              conversations={conversations}
              onSelectListing={handleSelectListing}
              onOpenCreateRequest={() => {
                if (!currentUser) handleOpenAuth('signin');
                else setShowCreateRequestModal(true);
              }}
              onOpenMessages={(conv) => {
                if (conv) setActiveConversation(conv);
                setShowMessagingModal(true);
              }}
              onUpdateOfferStatus={handleUpdateOfferStatus}
              onStartMessageWithSeller={handleStartMessageWithSeller}
              onUpdateProfile={handleUpdateProfile}
              onDeleteAccount={() => handleLogout()}
              onOpenAuth={handleOpenAuth}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        )}

        {/* View 7: Admin Workspace */}
        {activeView === 'admin' && (
          <div className="novora-container py-8 sm:py-10">
            <div className="mb-6 flex items-center justify-between gap-2">
              <Breadcrumbs
                items={[
                  { label: 'Marketplace', onClick: () => setActiveView('home') },
                  { label: 'Administration', onClick: () => setActiveView('home') },
                  { label: 'Platform Moderation & Security', current: true }
                ]}
                className="py-0 px-0"
              />
            </div>
            <AdminWorkspace
              currentUser={currentUser}
              reports={reports}
              listings={listings}
              onResolveReport={handleResolveReport}
              onDeactivateListing={handleDeactivateListingFromAdmin}
              onSelectListing={handleSelectListing}
            />
          </div>
        )}

        {/* View 8: Informational & Policy Pages */}
        {activeView === 'info' && (
          <InfoPages
            page={activeInfoPage}
            onBack={() => {
              setActiveView('home');
              window.history.pushState({}, '', window.location.pathname);
            }}
            onOpenStoreWizard={() => {
              if (!currentUser) handleOpenAuth('signin');
              else setShowStoreWizard(true);
            }}
            onOpenCreateListing={() => {
              if (!currentUser) handleOpenAuth('signin');
              else setShowCreateListingModal(true);
            }}
            onOpenCreateRequest={() => {
              if (!currentUser) handleOpenAuth('signin');
              else setShowCreateRequestModal(true);
            }}
          />
        )}

      </main>

      {/* Global Footer */}
      <Footer
        onNavigateSection={handleNavigateSection}
        onOpenFindMatch={() => {
          setFindMatchInitialQuery('');
          setShowFindMatchModal(true);
        }}
        onOpenCreateRequest={() => {
          if (!currentUser) handleOpenAuth('signin');
          else setShowCreateRequestModal(true);
        }}
        onOpenCreateListing={() => {
          if (!currentUser) handleOpenAuth('signin');
          else setShowCreateListingModal(true);
        }}
        onOpenStoreWizard={() => {
          if (!currentUser) handleOpenAuth('signin');
          else setShowStoreWizard(true);
        }}
        onClearData={() => {
          localStorage.clear();
          addToast('info', 'Local Cache Cleared', 'Harmless client preferences and search history reset.');
        }}
      />

      {/* MODALS & DRAWERS */}

      {/* 1. Listing Detail Modal */}
      {activeListingForDetail && (
        <ListingDetailModal
          listing={activeListingForDetail}
          currentUser={currentUser}
          onClose={() => {
            setActiveListingForDetail(null);
            try {
              const url = new URL(window.location.href);
              url.searchParams.delete('listing');
              window.history.pushState({}, '', url.pathname + (url.search ? url.search : ''));
            } catch {
              // ignore
            }
          }}
          isFavorite={favorites.includes(activeListingForDetail.id)}
          onToggleFavorite={handleToggleFavorite}
          onStartMessage={handleStartMessageOnListing}
          onReport={(l) => {
            setReportTarget({
              type: 'listing',
              id: l.id,
              title: l.title
            });
          }}
          onToggleStatus={handleToggleListingStatus}
          onDeleteListing={handleDeleteListing}
          onEditListing={handleOpenEditListing}
          onOpenAuth={handleOpenAuth}
          onViewSeller={(sid, sname) => {
            setActiveListingForDetail(null);
            handleSelectSeller(sid, sname);
          }}
          onSelectCategory={(categoryId) => {
            setActiveListingForDetail(null);
            setSelectedCategory(categoryId);
            setActiveView('home');
            try {
              const url = new URL(window.location.href);
              url.searchParams.delete('listing');
              window.history.pushState({}, '', url.pathname + (url.search ? url.search : ''));
            } catch {
              // ignore
            }
            setTimeout(() => {
              const el = document.getElementById('catalog-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 50);
          }}
        />
      )}

      {/* 2. Create / Edit Listing Modal */}
      {showCreateListingModal && (
        <CreateListingModal
          currentUser={currentUser}
          initialListing={listingToEdit}
          onClose={() => {
            setShowCreateListingModal(false);
            setListingToEdit(null);
          }}
          onSubmit={handleCreateListing}
          onUpdateListing={handleUpdateListing}
          onOpenAuth={handleOpenAuth}
        />
      )}

      {/* 3. Create Buyer Request Modal */}
      {showCreateRequestModal && (
        <CreateRequestModal
          currentUser={currentUser}
          onClose={() => setShowCreateRequestModal(false)}
          onSubmit={handleCreateRequest}
          onOpenAuth={handleOpenAuth}
        />
      )}

      {/* 4. Submit Seller Offer Modal */}
      {requestForOffer && (
        <SubmitOfferModal
          request={requestForOffer}
          currentUser={currentUser}
          onClose={() => setRequestForOffer(null)}
          onSubmit={handleSubmitOffer}
          onOpenAuth={handleOpenAuth}
        />
      )}

      {/* 5. Find My Match (Need-Based Discovery) Modal */}
      {showFindMatchModal && (
        <FindMyMatchModal
          listings={listings}
          favorites={favorites}
          displayCurrency={currentCurrency}
          initialQuery={findMatchInitialQuery}
          onClose={() => setShowFindMatchModal(false)}
          onSelectListing={(l) => {
            setShowFindMatchModal(false);
            handleSelectListing(l);
          }}
          onToggleFavorite={handleToggleFavorite}
          onOpenCreateRequest={() => {
            setShowFindMatchModal(false);
            if (!currentUser) handleOpenAuth('signin');
            else setShowCreateRequestModal(true);
          }}
        />
      )}

      {/* 6. Messaging Modal */}
      {showMessagingModal && (
        <MessagingModal
          currentUser={currentUser}
          activeConversation={activeConversation}
          conversations={conversations}
          onSelectConversation={(conv) => setActiveConversation(conv)}
          onClose={() => setShowMessagingModal(false)}
          onReportMessage={(msgId) => {
            setReportTarget({
              type: 'message',
              id: msgId,
              title: 'Direct Chat Message'
            });
          }}
          onOpenAuth={handleOpenAuth}
        />
      )}

      {/* 7. Store Setup Wizard */}
      {showStoreWizard && currentUser && (
        <StoreSetupWizard
          currentUser={currentUser}
          existingStore={userStore}
          sellerListings={listings.filter(l => l.sellerId === currentUser.id)}
          onClose={() => setShowStoreWizard(false)}
          onSave={handleSaveStore}
          onViewStore={(st) => {
            setShowStoreWizard(false);
            handleOpenStore(st);
          }}
        />
      )}

      {/* 8. Notification Center Drawer */}
      <NotificationDrawer
        isOpen={showNotificationDrawer}
        onClose={() => setShowNotificationDrawer(false)}
        conversations={conversations}
        offers={offers}
        requests={requests}
        userId={currentUser?.id || ''}
        onNavigate={(view, targetId) => {
          setShowNotificationDrawer(false);
          if (view === 'messages') {
            const found = conversations.find(c => c.id === targetId);
            if (found) setActiveConversation(found);
            setShowMessagingModal(true);
          } else if (view === 'seller') {
            setActiveView('seller');
          } else if (view === 'buyer') {
            setActiveView('buyer');
          } else if (view === 'request-orbit') {
            setActiveView('request-orbit');
          } else if (view === 'home') {
            setActiveView('home');
          }
        }}
      />

      {/* 9. Auth Modal */}
      {showAuthModal && (
        <AuthModal
          initialMode={authInitialMode}
          onClose={() => setShowAuthModal(false)}
          onUserChanged={handleUserChanged}
        />
      )}

      {/* 10. Report Content Modal */}
      {reportTarget && (
        <ReportModal
          targetType={reportTarget.type}
          targetId={reportTarget.id}
          targetTitle={reportTarget.title}
          reporterId={currentUser?.id || 'guest'}
          onClose={() => setReportTarget(null)}
          onSubmit={handleSubmitReport}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
};

export default App;
