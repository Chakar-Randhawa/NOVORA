import React from 'react';
import { ShieldCheck, Lock, Scale, RefreshCw } from 'lucide-react';

export const TrustSafetyBanner: React.FC = () => {
  return (
    <section id="safety" className="py-16 bg-white">
      <div className="max-w-[1440px] mx-auto px-6">
        
        <div className="p-8 sm:p-10 rounded-2xl bg-[#FAFAF8] border border-[#E5E7EB] space-y-8">
          
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium mb-3 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Platform Integrity & Direct Trade</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#17191F] tracking-tight">
              Trust, Direct Trade & The Zero-Cost Promise
            </h2>
            <p className="text-xs sm:text-sm text-[#646B76] mt-2 leading-relaxed">
              NOVORA was engineered to operate on a permanent $0 external infrastructure budget. We never take marketplace commissions, charge listing fees, or require payment cards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#E5E7EB]">
            
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#17191F]">
                <Scale className="w-4 h-4 text-[#4057D6]" />
              </div>
              <h3 className="text-sm font-semibold text-[#17191F]">Direct Transaction Model</h3>
              <p className="text-xs text-[#646B76] leading-relaxed">
                NOVORA is a discovery and connection platform. Buyers and sellers independently agree upon lawful payment and shipment methods without middleman markups.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#17191F]">
                <Lock className="w-4 h-4 text-[#059669]" />
              </div>
              <h3 className="text-sm font-semibold text-[#17191F]">Zero Paid API Dependencies</h3>
              <p className="text-xs text-[#646B76] leading-relaxed">
                Need-Based Matching and natural queries are powered by an efficient client-side heuristic engine. No paid AI endpoints or hidden token bills.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#17191F]">
                <RefreshCw className="w-4 h-4 text-[#D97706]" />
              </div>
              <h3 className="text-sm font-semibold text-[#17191F]">Community Moderation</h3>
              <p className="text-xs text-[#646B76] leading-relaxed">
                All community members can report fraudulent, counterfeit, or prohibited listings. Our moderation queue operates with auditable, transparent controls.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
