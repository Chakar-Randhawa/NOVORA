import React from 'react';
import { Compass, ArrowRight, Plus, Send, Clock, MapPin, DollarSign } from 'lucide-react';
import { BuyerRequest, RequestOffer } from '../../types';
import { getCountryByCode } from '../../data/countries';

interface RequestOrbitPreviewProps {
  requests: BuyerRequest[];
  offers: RequestOffer[];
  onOpenOrbit: () => void;
  onOpenCreateRequest: () => void;
}

export const RequestOrbitPreview: React.FC<RequestOrbitPreviewProps> = ({
  requests,
  offers,
  onOpenOrbit,
  onOpenCreateRequest
}) => {
  const openRequests = requests.filter(r => r.status === 'open').slice(0, 3);

  return (
    <section id="request-orbit" className="py-16 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-[1440px] mx-auto px-6">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#4057D6] uppercase tracking-wider mb-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Buyer Sourcing Board</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#17191F] tracking-tight">
              Request Orbit
            </h2>
            <p className="text-xs text-[#646B76] mt-1 max-w-xl leading-relaxed">
              When you can't find what you need in the catalog, post an open request. Independent makers, suppliers, and service providers quote directly.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenCreateRequest}
              className="px-4 py-2 text-xs font-medium bg-[#17191F] hover:bg-[#27272A] text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post a Request</span>
            </button>
            {requests.length > 0 && (
              <button
                onClick={onOpenOrbit}
                className="px-4 py-2 text-xs font-medium bg-[#F9FAFB] hover:bg-[#F3F4F6] text-[#17191F] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-[#E5E7EB]"
              >
                <span>View All ({requests.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Requests Grid or Empty State */}
        {openRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {openRequests.map((req) => {
              const destCountry = getCountryByCode(req.destinationCountry);
              const realOffersCount = typeof req.offersCount === 'number' ? req.offersCount : offers.filter(o => o.requestId === req.id).length;

              return (
                <div
                  key={req.id}
                  onClick={onOpenOrbit}
                  className="group p-5 rounded-xl border border-[#E5E7EB] bg-[#FAFAF8] hover:bg-white hover:border-[#17191F] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-[#646B76]">
                      <span className="flex items-center gap-1 font-medium">
                        <span>{destCountry?.flag}</span>
                        <span>To {destCountry?.name || req.destinationCountry}</span>
                      </span>
                      <span className="font-mono font-semibold text-[#17191F]">
                        {req.currency} {req.budgetMin}–{req.budgetMax}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-[#17191F] group-hover:text-[#4057D6] transition-colors line-clamp-2 leading-snug">
                      {req.title}
                    </h3>

                    <p className="text-xs text-[#646B76] line-clamp-3 leading-relaxed">
                      {req.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E5E7EB]/70 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#646B76]">
                      by {req.buyerName}
                    </span>
                    <span className="font-medium text-[#4057D6] flex items-center gap-1 text-[11px]">
                      <Send className="w-3 h-3" />
                      <span>{realOffersCount} {realOffersCount === 1 ? 'Proposal' : 'Proposals'}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 px-6 bg-[#FAFAF8] rounded-2xl border border-dashed border-[#E5E7EB] space-y-3 max-w-lg mx-auto">
            <Compass className="w-8 h-8 text-[#9CA3AF] mx-auto" />
            <h3 className="text-sm font-semibold text-[#17191F]">There are no open requests yet</h3>
            <p className="text-xs text-[#646B76] leading-relaxed">
              Looking for a custom item, specialized translation, architectural model, or bulk order? Broadcast your requirements to sellers worldwide.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenCreateRequest}
                className="px-4 py-2 bg-[#17191F] text-white text-xs font-medium rounded-lg hover:bg-[#27272A] transition-colors cursor-pointer"
              >
                Post What You Need
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
