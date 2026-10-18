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
  const openRequests = requests.filter((r) => r.status === 'open').slice(0, 3);

  return (
    <section id="request-orbit" className="py-12 sm:py-16 bg-white border-b border-[#E2DFD8]">
      <div className="novora-container">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8E6D38] uppercase tracking-wider mb-1">
              <Compass className="w-3.5 h-3.5 text-[#C5A572]" />
              <span>Buyer Sourcing Board</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#14243A] tracking-tight">
              Request Orbit Live Feed
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenCreateRequest}
              className="px-3.5 sm:px-4 py-2 bg-white border border-[#E2DFD8] hover:border-[#14243A] text-[#14243A] hover:bg-[#F7F5F0] text-xs font-medium rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Post Request</span>
            </button>
            <button
              type="button"
              onClick={onOpenOrbit}
              className="px-3.5 sm:px-4 py-2 bg-[#14243A] hover:bg-[#0E1B2D] text-white text-xs font-medium rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-[0.98]"
            >
              <span>View All ({requests.length})</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C5A572]" />
            </button>
          </div>
        </div>

        {openRequests.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-2xl border border-dashed border-[#E2DFD8] bg-[#F7F5F0] space-y-3">
            <Compass className="w-8 h-8 text-[#C5A572] mx-auto" />
            <h3 className="text-sm font-semibold text-[#14243A]">No Open Buyer Requests</h3>
            <p className="text-xs text-[#5A6578] max-w-sm mx-auto leading-relaxed">
              Buyers broadcast custom product or service specifications here for international artisans to submit quotes.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenCreateRequest}
                className="px-4 py-2 bg-[#14243A] text-white text-xs font-medium rounded-xl hover:bg-[#0E1B2D] transition-colors cursor-pointer active:scale-[0.98]"
              >
                Post What You Need
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {openRequests.map((req) => {
              const destCountry = getCountryByCode(req.destinationCountry);
              const proposalCount = offers.filter((o) => o.requestId === req.id).length;

              return (
                <div
                  key={req.id}
                  onClick={onOpenOrbit}
                  className="group bg-[#F7F5F0] hover:bg-white p-5 rounded-2xl border border-[#E2DFD8] hover:border-[#14243A] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-[#5A6578]">
                      <span className="flex items-center gap-1">
                        <span>{destCountry?.flag}</span>
                        <span className="truncate max-w-[130px]">{destCountry?.name || req.destinationCountry}</span>
                      </span>
                      <span className="font-mono font-semibold text-[#14243A]">
                        {req.currency} {req.budgetMin}–{req.budgetMax}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-[#14243A] group-hover:text-[#283548] transition-colors line-clamp-1">
                      {req.title}
                    </h3>

                    <p className="text-xs text-[#5A6578] line-clamp-2 leading-relaxed">
                      {req.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E2DFD8]/70 flex items-center justify-between text-xs">
                    <span className="text-[#5A6578] truncate max-w-[130px]">by {req.buyerName}</span>
                    <span className="text-[#14243A] group-hover:text-[#8E6D38] font-medium flex items-center gap-1 shrink-0 transition-colors">
                      <span>{proposalCount} {proposalCount === 1 ? 'Proposal' : 'Proposals'}</span>
                      <ArrowRight className="w-3 h-3 text-[#C5A572] group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
