import React, { useState } from 'react';
import {
  Compass,
  Plus,
  Send,
  CheckCircle,
  Clock,
  MapPin,
  Tag,
  DollarSign,
  MessageSquare,
  Shield,
  ChevronRight,
  Filter
} from 'lucide-react';
import { BuyerRequest, RequestOffer, UserProfile } from '../../types';
import { formatPrice, getCountryByCode } from '../../data/countries';
import { CATEGORIES } from '../../data/categories';

interface RequestOrbitViewProps {
  requests: BuyerRequest[];
  offers: RequestOffer[];
  currentUser: UserProfile | null;
  onOpenCreateRequest: () => void;
  onOpenSubmitOffer: (request: BuyerRequest) => void;
  onStartMessageWithSeller: (sellerId: string, sellerName: string, requestId: string, requestTitle: string) => void;
  onCloseRequest: (id: string, status: 'fulfilled' | 'closed') => void;
  onOpenAuth: (mode?: 'signin' | 'register') => void;
}

export const RequestOrbitView: React.FC<RequestOrbitViewProps> = ({
  requests,
  offers,
  currentUser,
  onOpenCreateRequest,
  onOpenSubmitOffer,
  onStartMessageWithSeller,
  onCloseRequest,
  onOpenAuth
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    requests.length > 0 ? requests[0].id : null
  );
  const [mobileTab, setMobileTab] = useState<'list' | 'detail'>('list');

  const filteredRequests = requests.filter(r => {
    if (selectedCategoryId !== 'all' && r.categoryId !== selectedCategoryId) return false;
    return true;
  });

  const activeRequest = requests.find(r => r.id === selectedRequestId) || (filteredRequests.length > 0 ? filteredRequests[0] : null);
  const activeOffers = activeRequest ? offers.filter(o => o.requestId === activeRequest.id) : [];

  const isOwner = currentUser && activeRequest && activeRequest.buyerId === currentUser.id;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Action */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#4057D6] mb-1">
            <Compass className="w-4 h-4" />
            <span>Buyer-Driven Sourcing Board</span>
          </div>
          <h2 className="text-2xl font-semibold text-[#17191F] tracking-tight">
            Request Orbit
          </h2>
          <p className="text-xs text-[#646B76] mt-1 max-w-xl leading-relaxed">
            Can't find what you need in the catalog? Broadcast your exact custom requirements. Independent artisans, suppliers, and specialists worldwide respond with competitive quotes.
          </p>
        </div>

        <button
          onClick={onOpenCreateRequest}
          className="px-5 py-2.5 rounded-lg bg-[#17191F] hover:bg-[#27272A] text-white text-xs font-medium flex items-center gap-2 shadow-xs transition-colors whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Post a Custom Request</span>
        </button>
      </div>

      {/* Category filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategoryId('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            selectedCategoryId === 'all'
              ? 'bg-[#17191F] text-white shadow-xs'
              : 'bg-white border border-[#E5E7EB] text-[#646B76] hover:text-[#17191F]'
          }`}
        >
          All Requests ({requests.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = requests.filter(r => r.categoryId === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategoryId === cat.id
                  ? 'bg-[#17191F] text-white shadow-xs'
                  : 'bg-white border border-[#E5E7EB] text-[#646B76] hover:text-[#17191F]'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Main Layout or Empty State */}
      {requests.length === 0 ? (
        <div className="text-center py-20 px-6 bg-white rounded-2xl border border-dashed border-[#E5E7EB] space-y-4 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#4057D6] flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#17191F]">
              There are no requests to display yet
            </h3>
            <p className="text-xs text-[#646B76] max-w-md mx-auto mt-1 leading-relaxed">
              Looking for a custom manufactured part, specialized translation, bespoke furniture piece, or wholesale order? Post the first open request to receive direct quotes from international sellers.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={onOpenCreateRequest}
              className="px-5 py-2.5 bg-[#17191F] hover:bg-[#27272A] text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Post What You Need</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Request Cards (5 cols on lg, toggled on mobile) */}
          <div className={`${mobileTab === 'detail' ? 'hidden lg:block' : 'block'} lg:col-span-5 space-y-3`}>
            {filteredRequests.length > 0 ? (
              filteredRequests.map(req => {
                const isSelected = activeRequest?.id === req.id;
                const destCountry = getCountryByCode(req.destinationCountry);
                const offersForReq = offers.filter(o => o.requestId === req.id);
                const proposalCount = typeof req.offersCount === 'number' ? req.offersCount : offersForReq.length;

                return (
                  <div
                    key={req.id}
                    onClick={() => {
                      setSelectedRequestId(req.id);
                      setMobileTab('detail');
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#17191F] shadow-xs'
                        : 'bg-white border-[#E5E7EB] hover:border-[#D1D5DB]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#646B76] mb-1.5">
                      <span className="flex items-center gap-1 font-medium">
                        <span>{destCountry?.flag}</span>
                        <span>To {destCountry?.name || req.destinationCountry}</span>
                      </span>
                      <span className="font-mono font-semibold text-[#17191F]">
                        {req.currency} {req.budgetMin}–{req.budgetMax}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-[#17191F] line-clamp-1 mb-1">
                      {req.title}
                    </h3>

                    <p className="text-xs text-[#646B76] line-clamp-2 leading-relaxed mb-3">
                      {req.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-[#F3F4F6] text-[11px]">
                      <span className="text-[#646B76]">
                        by {req.buyerName}
                      </span>
                      <span className="font-medium text-[#4057D6]">
                        {proposalCount} {proposalCount === 1 ? 'Proposal' : 'Proposals'}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-white rounded-xl border border-dashed border-[#E5E7EB]">
                <p className="text-xs text-[#646B76]">No requests found in this category.</p>
              </div>
            )}
          </div>

          {/* Right Column: Detailed Request View and Offers (7 cols on lg, toggled on mobile) */}
          <div className={`${mobileTab === 'list' ? 'hidden lg:block' : 'block'} lg:col-span-7 bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-6 space-y-6 shadow-xs`}>
            {/* Mobile Back Button */}
            <div className="lg:hidden pb-3 border-b border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setMobileTab('list')}
                className="text-xs font-semibold text-[#4057D6] flex items-center gap-1.5 py-1 px-2.5 bg-[#EEF2FF] rounded-lg cursor-pointer"
              >
                <span>← Back to All Requests</span>
              </button>
            </div>

            {activeRequest ? (
              <>
                {/* Header */}
                <div className="border-b border-[#E5E7EB] pb-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-[#646B76]">
                      <span>Posted {new Date(activeRequest.createdAt).toLocaleDateString()}</span>
                      <span>·</span>
                      <span className={activeRequest.status === 'open' ? 'text-emerald-700 font-medium' : 'text-[#646B76]'}>
                        {activeRequest.status === 'open' ? '● Open for Quotes' : '✓ Fulfilled'}
                      </span>
                    </div>
                    
                    {isOwner && activeRequest.status === 'open' && (
                      <button
                        onClick={() => onCloseRequest(activeRequest.id, 'fulfilled')}
                        className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        Mark as Fulfilled
                      </button>
                    )}
                  </div>

                  <h1 className="text-lg font-semibold text-[#17191F] leading-snug">
                    {activeRequest.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-[#17191F]">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold font-mono">
                        {activeRequest.currency} {activeRequest.budgetMin} – {activeRequest.budgetMax}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#646B76]">
                      <MapPin className="w-4 h-4 text-[#4057D6]" />
                      <span>Destination: {getCountryByCode(activeRequest.destinationCountry)?.name || activeRequest.destinationCountry}</span>
                    </div>
                    {activeRequest.deadline && (
                      <div className="flex items-center gap-1.5 text-[#646B76]">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Deadline: {activeRequest.deadline}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-[#374151] leading-relaxed whitespace-pre-line pt-2">
                    {activeRequest.description}
                  </p>

                  {activeRequest.customizationDetails && (
                    <div className="p-3 bg-[#FAFAF8] rounded-lg border border-[#E5E7EB] text-xs">
                      <span className="font-semibold text-[#17191F]">Customization Specs: </span>
                      <span className="text-[#646B76]">{activeRequest.customizationDetails}</span>
                    </div>
                  )}

                  {/* Seller response action */}
                  {!isOwner && (
                    <div className="pt-2 flex items-center justify-between">
                      <p className="text-[11px] text-[#646B76]">
                        Can you fulfill this request? Submit a quote directly to the buyer.
                      </p>
                      <button
                        onClick={() => {
                          if (!currentUser) {
                            onOpenAuth('signin');
                          } else {
                            onOpenSubmitOffer(activeRequest);
                          }
                        }}
                        className="px-4 py-2 rounded-lg bg-[#17191F] hover:bg-[#27272A] text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 text-[#818CF8]" />
                        <span>Submit Proposal</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Submitted Offers Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-[#17191F] uppercase tracking-wider">
                      Seller Proposals ({activeRequest.offersCount || activeOffers.length})
                    </h3>
                    <span className="text-[11px] text-[#646B76]">
                      Direct quotes · $0 platform fees
                    </span>
                  </div>

                  {activeOffers.length > 0 ? (
                    <div className="space-y-3">
                      {activeOffers.map(offer => {
                        const sellerCountry = getCountryByCode(offer.sellerCountry);
                        const isMyOffer = currentUser && offer.sellerId === currentUser.id;

                        return (
                          <div
                            key={offer.id}
                            className={`p-4 rounded-xl border bg-[#FAFAF8] space-y-3 transition-colors ${
                              isMyOffer ? 'border-[#4057D6] bg-indigo-50/20' : 'border-[#E5E7EB] hover:border-[#17191F]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-[#17191F]">
                                    {offer.sellerName}
                                  </span>
                                  {isMyOffer && (
                                    <span className="px-1.5 py-0.5 text-[10px] font-medium bg-[#EEF2FF] text-[#4057D6] rounded-md">
                                      Your Submission
                                    </span>
                                  )}
                                  <span className="text-xs text-[#646B76]">
                                    {sellerCountry?.flag} {sellerCountry?.name || offer.sellerCountry}
                                  </span>
                                </div>
                                <span className="text-[11px] text-[#646B76]">
                                  Lead time: {offer.estimatedDays} business days · Status: {offer.status}
                                </span>
                              </div>

                              <div className="text-right">
                                <span className="text-base font-semibold font-mono text-[#17191F] tabular-nums">
                                  {formatPrice(offer.proposedPrice, offer.currency)}
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-[#374151] leading-relaxed">
                              {offer.description}
                            </p>

                            {offer.deliverables && (
                              <div className="text-[11px] text-[#646B76]">
                                <span className="font-medium text-[#17191F]">Deliverables: </span>
                                <span>{offer.deliverables}</span>
                              </div>
                            )}

                            <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                              <span className="text-[11px] text-[#646B76]">
                                Shipping: {offer.shippingOrFulfillmentDetails}
                              </span>

                              {isOwner && (
                                <button
                                  onClick={() => {
                                    if (!currentUser) {
                                      onOpenAuth('signin');
                                    } else {
                                      onStartMessageWithSeller(
                                        offer.sellerId,
                                        offer.sellerName,
                                        activeRequest.id,
                                        activeRequest.title
                                      );
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-white border border-[#E5E7EB] hover:border-[#17191F] text-[#17191F] rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-[#4057D6]" />
                                  <span>Discuss Proposal</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : isOwner ? (
                    <div className="p-8 text-center border border-dashed border-[#E5E7EB] rounded-xl space-y-1">
                      <p className="text-xs font-medium text-[#17191F]">No seller proposals received yet.</p>
                      <p className="text-[11px] text-[#646B76]">Independent makers and suppliers can review this request and submit bids.</p>
                    </div>
                  ) : (
                    <div className="p-6 text-center border border-[#E5E7EB] bg-[#FAFAF8] rounded-xl space-y-2">
                      <Shield className="w-5 h-5 text-[#4057D6] mx-auto" />
                      <h4 className="text-xs font-semibold text-[#17191F]">
                        {activeRequest.offersCount ? `${activeRequest.offersCount} Proposal${activeRequest.offersCount === 1 ? '' : 's'} Received` : 'Confidential Direct Procurement'}
                      </h4>
                      <p className="text-[11px] text-[#646B76] max-w-sm mx-auto leading-relaxed">
                        Negotiated quotes, custom pricing, and proprietary deliverables remain strictly confidential between the buyer and bidding makers.
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-xs text-[#646B76]">
                Select a buyer request to view its specifications and seller quotes.
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
