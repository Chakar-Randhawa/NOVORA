import React, { useState, useEffect } from 'react';
import {
  Listing,
  BuyerRequest,
  RequestOffer,
  UserProfile,
  Conversation,
  ReportItem
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
  subscribeToFavorites,
  toggleFavorite,
  subscribeToConversations,
  getOrCreateConversation,
  subscribeToReports,
  submitReport,
  resolveReport
} from './services/firebase';

import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { ReportModal } from './components/common/ReportModal';

import { Hero } from './components/home/Hero';
import { CategoriesGrid } from './components/home/CategoriesGrid';
import { FeaturedListings } from './components/home/FeaturedListings';
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
import { AuthModal } from './components/auth/AuthModal';

export const App: React.FC = () => {
  // 1. Core State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  const [listings, setListings] = useState<Listing[]>([]);
  const [requests, setRequests] = useState<BuyerRequest[]>([]);
  const [offers, setOffers] = useState<RequestOffer[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);

  // Country & Currency preferences
  const [currentCountry, setCurrentCountry] = useState<string>('US');
  const [currentCurrency, setCurrentCurrency] = useState<string>('USD');

  // Navigation & View state
  const [activeView, setActiveView] = useState<'home' | 'seller' | 'buyer' | 'admin' | 'request-orbit'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals
  const [activeListingForDetail, setActiveListingForDetail] = useState<Listing | null>(null);
  const [showCreateListingModal, setShowCreateListingModal] = useState(false);
  const [showCreateRequestModal, setShowCreateRequestModal] = useState(false);
  const [requestForOffer, setRequestForOffer] = useState<BuyerRequest | null>(null);
  const [showFindMatchModal, setShowFindMatchModal] = useState(false);
  const [findMatchInitialQuery, setFindMatchInitialQuery] = useState('');
  const [showMessagingModal, setShowMessagingModal] = useState(false);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'register'>('signin');
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
        addToast('error', 'Connection Notice', 'Connecting to real-time marketplace database...');
      }
    });

    // Real-time public listings
    const unsubListings = subscribeToListings((liveListings) => {
      setListings(liveListings);
    });

    // Real-time public requests
    const unsubRequests = subscribeToRequests((liveRequests) => {
      setRequests(liveRequests);
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

    return () => {
      unsubListings();
      unsubRequests();
      unsubAuth();
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

    const unsubOffers = subscribeToUserOffers(currentUser.id, Boolean(currentUser.isAdmin), (userOffers) => {
      setOffers(userOffers);
    });

    let unsubReports: (() => void) | undefined;
    if (currentUser.isAdmin) {
      unsubReports = subscribeToReports((repItems) => {
        setReports(repItems);
      });
    }

    return () => {
      unsubFavs();
      unsubConvos();
      unsubOffers();
      if (unsubReports) unsubReports();
    };
  }, [currentUser]);

  // Auth state update from modal
  const handleUserChanged = (newUser: UserProfile) => {
    setCurrentUser(newUser);
    setCurrentCountry(newUser.country);
    setCurrentCurrency(newUser.preferredCurrency || 'USD');
    addToast('success', 'Signed In Successfully', `Welcome to NOVORA, ${newUser.name}.`);
  };

  // Sign out
  const handleLogout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      setConversations([]);
      setFavorites([]);
      setActiveView('home');
      addToast('info', 'Signed Out', 'You are now browsing NOVORA as a guest.');
    } catch (err: any) {
      addToast('error', 'Sign out failed', err.message);
    }
  };

  // Open Auth modal with specific mode
  const handleOpenAuth = (mode: 'signin' | 'register' = 'signin') => {
    setAuthInitialMode(mode);
    setShowAuthModal(true);
  };

  // Favorite toggle (Real Firestore user subcollection)
  const handleToggleFavorite = async (listingId: string) => {
    if (!currentUser) {
      handleOpenAuth('signin');
      return;
    }
    try {
      const isSaved = await toggleFavorite(listingId);
      addToast(
        'info',
        isSaved ? 'Saved to Favorites' : 'Removed from Favorites',
        isSaved ? 'Item saved to your Buyer Sanctuary wishlist.' : undefined
      );
    } catch (err: any) {
      addToast('error', 'Favorite action failed', err.message);
    }
  };

  // Open listing details & record real view in Firestore
  const handleSelectListing = (listing: Listing) => {
    incrementListingView(listing.id);
    setActiveListingForDetail(listing);
  };

  // Publish Listing
  const handleCreateListing = async (newListing: Listing) => {
    if (!currentUser) {
      handleOpenAuth('signin');
      return;
    }
    try {
      await createListing({
        title: newListing.title,
        description: newListing.description,
        categoryId: newListing.categoryId,
        listingType: newListing.listingType,
        price: newListing.price,
        currency: newListing.currency,
        condition: newListing.condition,
        sellerId: currentUser.id,
        sellerName: currentUser.name,
        sellerCountry: currentUser.country,
        sellerCity: currentUser.city,
        images: newListing.images,
        customAttributes: newListing.customAttributes,
        shipsInternationally: newListing.shipsInternationally,
        shippingDestinations: newListing.shippingDestinations,
        shippingCostDescription: newListing.shippingCostDescription,
        allowsCustomization: newListing.allowsCustomization,
        status: 'active',
        tags: newListing.tags
      });
      setShowCreateListingModal(false);
      addToast('success', 'Listing Published to Global Marketplace', 'Your offering is now live across all regions with $0 fees.');
      setActiveView('seller');
    } catch (err: any) {
      addToast('error', 'Error Publishing Listing', err.message);
    }
  };

  // Toggle Listing active/paused
  const handleToggleListingStatus = async (id: string) => {
    if (!currentUser) return;
    const target = listings.find(l => l.id === id);
    if (!target) return;
    const nextStatus = target.status === 'active' ? 'paused' : 'active';
    try {
      await updateListing(id, { status: nextStatus });
      addToast(
        'info',
        nextStatus === 'active' ? 'Listing Activated' : 'Listing Paused',
        `Listing is now ${nextStatus}.`
      );
    } catch (err: any) {
      addToast('error', 'Failed to update listing', err.message);
    }
  };

  // Delete Listing
  const handleDeleteListing = async (id: string) => {
    if (!currentUser) return;
    try {
      await deleteListing(id);
      addToast('info', 'Listing Deleted', 'Listing permanently removed from global discovery.');
      if (activeListingForDetail?.id === id) {
        setActiveListingForDetail(null);
      }
    } catch (err: any) {
      addToast('error', 'Could not delete listing', err.message);
    }
  };

  // Create Buyer Request
  const handleCreateRequest = async (newRequest: BuyerRequest) => {
    if (!currentUser) {
      handleOpenAuth('signin');
      return;
    }
    try {
      await createBuyerRequest({
        title: newRequest.title,
        description: newRequest.description,
        categoryId: newRequest.categoryId,
        buyerId: currentUser.id,
        buyerName: currentUser.name,
        buyerCountry: currentUser.country,
        budgetMin: newRequest.budgetMin,
        budgetMax: newRequest.budgetMax,
        currency: newRequest.currency,
        quantity: newRequest.quantity,
        destinationCountry: newRequest.destinationCountry,
        deadline: newRequest.deadline,
        customizationDetails: newRequest.customizationDetails,
        fulfillmentPreference: newRequest.fulfillmentPreference,
        status: 'open',
        visibility: newRequest.visibility
      });
      setShowCreateRequestModal(false);
      addToast('success', 'Request Published to Request Orbit', 'Global sellers can now discover your request and submit proposals.');
      setActiveView('request-orbit');
    } catch (err: any) {
      addToast('error', 'Error Publishing Request', err.message);
    }
  };

  // Submit Offer to Request
  const handleSubmitOffer = async (offer: RequestOffer) => {
    if (!currentUser) {
      handleOpenAuth('signin');
      return;
    }
    try {
      await createOffer({
        requestId: offer.requestId,
        buyerId: offer.buyerId,
        sellerId: currentUser.id,
        sellerName: currentUser.name,
        sellerCountry: currentUser.country,
        sellerAvatar: currentUser.avatarUrl,
        proposedPrice: offer.proposedPrice,
        currency: offer.currency,
        description: offer.description,
        deliverables: offer.deliverables,
        estimatedDays: offer.estimatedDays,
        shippingOrFulfillmentDetails: offer.shippingOrFulfillmentDetails,
        customizationIncluded: offer.customizationIncluded,
        status: 'pending',
        validUntil: offer.validUntil
      });
      setRequestForOffer(null);
      addToast('success', 'Proposal Submitted', 'Your seller proposal has been sent directly to the buyer.');
    } catch (err: any) {
      addToast('error', 'Error Submitting Proposal', err.message);
    }
  };

  // Close / Fulfill Request
  const handleCloseRequest = async (id: string, status: 'fulfilled' | 'closed') => {
    if (!currentUser) return;
    try {
      await updateBuyerRequest(id, { status });
      addToast('success', status === 'fulfilled' ? 'Request Marked as Fulfilled' : 'Request Closed');
    } catch (err: any) {
      addToast('error', 'Failed to update request', err.message);
    }
  };

  // Start direct message on listing
  const handleStartMessageOnListing = async (listing: Listing) => {
    if (!currentUser) {
      handleOpenAuth('signin');
      return;
    }
    try {
      const conv = await getOrCreateConversation(
        listing.sellerId,
        listing.sellerName,
        {
          listingId: listing.id,
          listingTitle: listing.title
        }
      );
      setActiveConversation(conv);
      setActiveListingForDetail(null);
      setShowMessagingModal(true);
    } catch (err: any) {
      addToast('error', 'Could not open conversation', err.message);
    }
  };

  // Start message with seller from request
  const handleStartMessageWithSeller = async (
    sellerId: string,
    sellerName: string,
    requestId: string,
    requestTitle: string
  ) => {
    if (!currentUser) {
      handleOpenAuth('signin');
      return;
    }
    try {
      const conv = await getOrCreateConversation(
        sellerId,
        sellerName,
        {
          requestId,
          requestTitle
        }
      );
      setActiveConversation(conv);
      setShowMessagingModal(true);
    } catch (err: any) {
      addToast('error', 'Could not open conversation', err.message);
    }
  };

  // Report submission
  const handleSubmitReport = async (reportData: Omit<ReportItem, 'id' | 'createdAt' | 'status'>) => {
    try {
      await submitReport(reportData);
      addToast('success', 'Report Submitted for Review', 'Our trust and safety team will inspect the item promptly.');
    } catch (err: any) {
      addToast('error', 'Failed to submit report', err.message);
    }
  };

  // Admin moderation actions
  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    if (!currentUser?.isAdmin) return;
    try {
      await resolveReport(reportId, status);
      addToast('info', 'Report Updated', `Report marked as ${status}.`);
    } catch (err: any) {
      addToast('error', 'Failed to resolve report', err.message);
    }
  };

  const handleDeactivateListingFromAdmin = async (listingId: string) => {
    if (!currentUser?.isAdmin) return;
    try {
      await updateListing(listingId, { status: 'archived' });
      addToast('info', 'Listing Deactivated', 'Prohibited listing removed from public discovery.');
    } catch (err: any) {
      addToast('error', 'Failed to deactivate listing', err.message);
    }
  };

  // Profile update
  const handleUpdateProfile = async (updated: UserProfile) => {
    if (!currentUser) return;
    try {
      await syncUserProfile(
        { uid: currentUser.id, email: currentUser.email } as any,
        updated
      );
      setCurrentUser(prev => prev ? { ...prev, ...updated } : null);
      addToast('success', 'Profile Updated Successfully');
    } catch (err: any) {
      addToast('error', 'Failed to update profile', err.message);
    }
  };

  // Navigation helper
  const handleNavigateSection = (sectionId: string) => {
    if (sectionId === 'home') {
      setActiveView('home');
      return;
    }
    if (sectionId === 'request-orbit') {
      setActiveView('request-orbit');
      return;
    }
    setActiveView('home');
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const unreadMessagesCount = currentUser
    ? conversations.reduce((acc, c) => acc + (c.unreadCount?.[currentUser.id] || 0), 0)
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#17191F] selection:bg-[#4057D6] selection:text-white">
      
      {/* Universal Header (Top Bar Contract: 3 zones, single-line controls) */}
      <Header
        currentUser={currentUser}
        favoritesCount={favorites.length}
        unreadMessagesCount={unreadMessagesCount}
        currentCountry={currentCountry}
        currentCurrency={currentCurrency}
        onSelectCountry={setCurrentCountry}
        onSelectCurrency={setCurrentCurrency}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onOpenCreateListing={() => {
          if (!currentUser) {
            handleOpenAuth('signin');
          } else {
            setShowCreateListingModal(true);
          }
        }}
        onOpenCreateRequest={() => {
          if (!currentUser) {
            handleOpenAuth('signin');
          } else {
            setShowCreateRequestModal(true);
          }
        }}
        onOpenFindMatch={() => {
          setFindMatchInitialQuery('');
          setShowFindMatchModal(true);
        }}
        onOpenWorkspace={(tab) => {
          if (!currentUser) {
            handleOpenAuth('signin');
          } else {
            setActiveView(tab);
          }
        }}
        onOpenMessages={() => {
          if (!currentUser) {
            handleOpenAuth('signin');
          } else {
            if (conversations.length > 0 && !activeConversation) {
              setActiveConversation(conversations[0]);
            }
            setShowMessagingModal(true);
          }
        }}
        onOpenFavorites={() => {
          if (!currentUser) {
            handleOpenAuth('signin');
          } else {
            setActiveView('buyer');
          }
        }}
        onNavigateSection={handleNavigateSection}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeView === 'home' && (
          <>
            {/* Signature Hero Section */}
            <Hero
              listings={listings}
              onSearchNeed={(query) => {
                setFindMatchInitialQuery(query);
                setShowFindMatchModal(true);
              }}
              onExploreMarketplace={() => handleNavigateSection('discover')}
              onPostRequest={() => {
                if (!currentUser) {
                  handleOpenAuth('signin');
                } else {
                  setShowCreateRequestModal(true);
                }
              }}
              onSelectListing={handleSelectListing}
              onSelectCategory={(catId) => {
                setSelectedCategory(catId);
                handleNavigateSection('discover');
              }}
            />

            {/* Categories Exploration */}
            <CategoriesGrid
              listings={listings}
              onSelectCategory={(catId) => {
                setSelectedCategory(catId);
                handleNavigateSection('discover');
              }}
            />

            {/* Featured Listings & Filter Experience */}
            <FeaturedListings
              listings={listings}
              favorites={favorites}
              displayCurrency={currentCurrency}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onSelectListing={handleSelectListing}
              onToggleFavorite={handleToggleFavorite}
              onOpenCreateListing={() => {
                if (!currentUser) {
                  handleOpenAuth('signin');
                } else {
                  setShowCreateListingModal(true);
                }
              }}
            />

            {/* Request Orbit Section Preview */}
            <RequestOrbitPreview
              requests={requests}
              offers={offers}
              onOpenOrbit={() => setActiveView('request-orbit')}
              onOpenCreateRequest={() => {
                if (!currentUser) {
                  handleOpenAuth('signin');
                } else {
                  setShowCreateRequestModal(true);
                }
              }}
            />

            {/* Seller & Creator Spotlight */}
            <SellerSpotlight
              sellers={[]}
              listings={listings}
              onSelectListing={handleSelectListing}
              onFilterBySellerCountry={(countryCode) => {
                setCurrentCountry(countryCode);
                handleNavigateSection('discover');
              }}
              onOpenCreateListing={() => {
                if (!currentUser) {
                  handleOpenAuth('signin');
                } else {
                  setShowCreateListingModal(true);
                }
              }}
            />

            {/* Trust, Safety & Zero-Cost Architecture */}
            <TrustSafetyBanner />
          </>
        )}

        {/* View: Request Orbit */}
        {activeView === 'request-orbit' && (
          <div className="max-w-[1440px] mx-auto px-6 py-10">
            <div className="mb-6 flex items-center gap-2">
              <button
                onClick={() => setActiveView('home')}
                className="text-xs text-[#646B76] hover:text-[#17191F] font-medium cursor-pointer"
              >
                ← Return to Marketplace Home
              </button>
            </div>
            <RequestOrbitView
              requests={requests}
              offers={offers}
              currentUser={currentUser}
              onOpenCreateRequest={() => {
                if (!currentUser) {
                  handleOpenAuth('signin');
                } else {
                  setShowCreateRequestModal(true);
                }
              }}
              onOpenSubmitOffer={(req) => {
                if (!currentUser) {
                  handleOpenAuth('signin');
                } else {
                  setRequestForOffer(req);
                }
              }}
              onStartMessageWithSeller={handleStartMessageWithSeller}
              onCloseRequest={handleCloseRequest}
              onOpenAuth={handleOpenAuth}
            />
          </div>
        )}

        {/* View: Seller Workspace */}
        {activeView === 'seller' && (
          <div className="max-w-[1440px] mx-auto px-6 py-10">
            <div className="mb-6 flex items-center gap-2">
              <button
                onClick={() => setActiveView('home')}
                className="text-xs text-[#646B76] hover:text-[#17191F] font-medium cursor-pointer"
              >
                ← Return to Marketplace Home
              </button>
            </div>
            <SellerWorkspace
              currentUser={currentUser}
              listings={listings}
              onOpenCreateListing={() => {
                if (!currentUser) {
                  handleOpenAuth('signin');
                } else {
                  setShowCreateListingModal(true);
                }
              }}
              onToggleStatus={handleToggleListingStatus}
              onDeleteListing={handleDeleteListing}
              onSelectListing={handleSelectListing}
              onOpenMessages={() => {
                if (conversations.length > 0 && !activeConversation) {
                  setActiveConversation(conversations[0]);
                }
                setShowMessagingModal(true);
              }}
              onOpenAuth={handleOpenAuth}
            />
          </div>
        )}

        {/* View: Buyer Workspace */}
        {activeView === 'buyer' && (
          <div className="max-w-[1440px] mx-auto px-6 py-10">
            <div className="mb-6 flex items-center gap-2">
              <button
                onClick={() => setActiveView('home')}
                className="text-xs text-[#646B76] hover:text-[#17191F] font-medium cursor-pointer"
              >
                ← Return to Marketplace Home
              </button>
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
                if (!currentUser) {
                  handleOpenAuth('signin');
                } else {
                  setShowCreateRequestModal(true);
                }
              }}
              onOpenMessages={() => {
                if (conversations.length > 0 && !activeConversation) {
                  setActiveConversation(conversations[0]);
                }
                setShowMessagingModal(true);
              }}
              onUpdateProfile={handleUpdateProfile}
              onDeleteAccount={() => handleLogout()}
              onOpenAuth={handleOpenAuth}
            />
          </div>
        )}

        {/* View: Admin Workspace */}
        {activeView === 'admin' && (
          <div className="max-w-[1440px] mx-auto px-6 py-10">
            <div className="mb-6 flex items-center gap-2">
              <button
                onClick={() => setActiveView('home')}
                className="text-xs text-[#646B76] hover:text-[#17191F] font-medium cursor-pointer"
              >
                ← Return to Marketplace Home
              </button>
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
      </main>

      {/* Footer */}
      <Footer
        onNavigateSection={handleNavigateSection}
        onOpenFindMatch={() => {
          setFindMatchInitialQuery('');
          setShowFindMatchModal(true);
        }}
        onOpenCreateRequest={() => {
          if (!currentUser) {
            handleOpenAuth('signin');
          } else {
            setShowCreateRequestModal(true);
          }
        }}
        onClearData={() => {
          localStorage.clear();
          addToast('info', 'Local Cache Cleared', 'Harmless client preferences reset.');
        }}
      />

      {/* MODALS */}

      {/* 1. Listing Detail Modal */}
      {activeListingForDetail && (
        <ListingDetailModal
          listing={activeListingForDetail}
          currentUser={currentUser}
          isFavorite={favorites.includes(activeListingForDetail.id)}
          onClose={() => setActiveListingForDetail(null)}
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
          onOpenAuth={handleOpenAuth}
        />
      )}

      {/* 2. Create Listing Modal */}
      {showCreateListingModal && (
        <CreateListingModal
          currentUser={currentUser}
          onClose={() => setShowCreateListingModal(false)}
          onSubmit={handleCreateListing}
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
            if (!currentUser) {
              handleOpenAuth('signin');
            } else {
              setShowCreateRequestModal(true);
            }
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

      {/* 7. Auth Modal */}
      {showAuthModal && (
        <AuthModal
          initialMode={authInitialMode}
          onClose={() => setShowAuthModal(false)}
          onUserChanged={handleUserChanged}
        />
      )}

      {/* 8. Report Content Modal */}
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
