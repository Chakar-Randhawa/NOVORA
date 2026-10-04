import React from 'react';
import { ShieldCheck, Globe } from 'lucide-react';

interface FooterProps {
  onNavigateSection: (sectionId: string) => void;
  onOpenFindMatch: () => void;
  onOpenCreateRequest: () => void;
  onClearData: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateSection,
  onOpenFindMatch,
  onOpenCreateRequest,
  onClearData
}) => {
  return (
    <footer className="bg-white border-t border-[#E5E7EB] pt-14 pb-12">
      <div className="max-w-[1440px] mx-auto px-6">
        
        {/* Top summary row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-[#E5E7EB]">
          
          <div className="md:col-span-2">
            <span className="text-lg font-bold text-[#17191F] tracking-tight block">
              NOVORA
            </span>
            <p className="text-xs text-[#646B76] mt-2 max-w-sm leading-relaxed">
              Discover More. Trade Beyond Borders. An original global classified and multi-category discovery marketplace built on a strict $0 external infrastructure budget.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-[#059669]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>100% Free Initial Platform · No Buyer/Seller Commissions</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[#17191F] uppercase tracking-wider mb-3">Discovery</h4>
            <ul className="space-y-2 text-xs text-[#646B76]">
              <li>
                <button onClick={onOpenFindMatch} className="hover:text-[#17191F] transition-colors text-left cursor-pointer">
                  Find My Match
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('request-orbit')} className="hover:text-[#17191F] transition-colors text-left cursor-pointer">
                  Buyer Requests
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('categories')} className="hover:text-[#17191F] transition-colors text-left cursor-pointer">
                  Category Directory
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('discover')} className="hover:text-[#17191F] transition-colors text-left cursor-pointer">
                  Public Catalog
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[#17191F] uppercase tracking-wider mb-3">Community & Safety</h4>
            <ul className="space-y-2 text-xs text-[#646B76]">
              <li>
                <button onClick={() => onNavigateSection('safety')} className="hover:text-[#17191F] transition-colors text-left cursor-pointer">
                  Trust & Safety Policy
                </button>
              </li>
              <li>
                <span className="text-[#646B76]">Direct Transaction Guidance</span>
              </li>
              <li>
                <span className="text-[#646B76]">Prohibited Items Policy</span>
              </li>
              <li>
                <span className="text-[#646B76]">Community Reporting</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[#17191F] uppercase tracking-wider mb-3">Storage & Data</h4>
            <p className="text-[11px] text-[#646B76] leading-relaxed mb-3">
              Client-side persistence with zero cloud storage fees. No third-party data tracking.
            </p>
            <button
              onClick={onClearData}
              className="text-[11px] text-[#646B76] hover:text-rose-600 underline cursor-pointer transition-colors"
              title="Clears local browser storage for this origin"
            >
              Reset Local Storage
            </button>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#646B76] gap-4">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} NOVORA Global Marketplace</span>
            <span>·</span>
            <span>Operated without external paid dependencies</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>Worldwide Public Access</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
