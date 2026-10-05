import React from 'react';
import { ShieldCheck, Globe, Store, Compass, ArrowRight } from 'lucide-react';

interface FooterProps {
  onNavigateSection: (sectionId: string) => void;
  onOpenFindMatch: () => void;
  onOpenCreateRequest: () => void;
  onOpenCreateListing?: () => void;
  onOpenStoreWizard?: () => void;
  onClearData: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateSection,
  onOpenFindMatch,
  onOpenCreateRequest,
  onOpenCreateListing,
  onOpenStoreWizard,
  onClearData
}) => {
  return (
    <footer className="bg-white border-t border-[#E5E7EB] pt-12 sm:pt-14 pb-12">
      <div className="novora-container">
        
        {/* Top summary row: Fluid responsive columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 pb-10 sm:pb-12 border-b border-[#E5E7EB]">
          
          {/* Brand info (2 cols on md+) */}
          <div className="sm:col-span-2 space-y-3">
            <span className="text-xl font-bold text-[#17191F] tracking-tight block">
              NOVORA
            </span>
            <p className="text-xs text-[#646B76] max-w-sm leading-relaxed">
              A calm, borderless global discovery marketplace. Sell authentic products, offer creative services, post custom requests, and build your branded storefront without listing fees.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-700">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Independent Direct Trade · Zero Commission Markups</span>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xs font-semibold text-[#17191F] uppercase tracking-wider mb-3">Explore</h4>
            <ul className="space-y-2 text-xs text-[#646B76]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('discover')}
                  className="hover:text-[#17191F] transition-colors text-left cursor-pointer"
                >
                  Public Catalog
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('categories')}
                  className="hover:text-[#17191F] transition-colors text-left cursor-pointer"
                >
                  All Categories
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('request-orbit')}
                  className="hover:text-[#17191F] transition-colors text-left cursor-pointer"
                >
                  Buyer Requests
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenFindMatch}
                  className="hover:text-[#17191F] transition-colors text-left cursor-pointer"
                >
                  Find My Match
                </button>
              </li>
            </ul>
          </div>

          {/* Sell */}
          <div>
            <h4 className="text-xs font-semibold text-[#17191F] uppercase tracking-wider mb-3">Sell on NOVORA</h4>
            <ul className="space-y-2 text-xs text-[#646B76]">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenCreateListing?.()}
                  className="hover:text-[#17191F] transition-colors text-left cursor-pointer"
                >
                  Create Listing
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenStoreWizard?.()}
                  className="hover:text-[#17191F] transition-colors text-left cursor-pointer"
                >
                  Set Up Storefront
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('seller')}
                  className="hover:text-[#17191F] transition-colors text-left cursor-pointer"
                >
                  Seller Control Center
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('seller-guide')}
                  className="hover:text-[#17191F] transition-colors text-left cursor-pointer"
                >
                  Seller Guide
                </button>
              </li>
            </ul>
          </div>

          {/* Company & Info */}
          <div>
            <h4 className="text-xs font-semibold text-[#17191F] uppercase tracking-wider mb-3">Company</h4>
            <ul className="space-y-2 text-xs text-[#646B76]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('about')}
                  className="hover:text-[#17191F] transition-colors text-left cursor-pointer"
                >
                  About NOVORA
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('how-it-works')}
                  className="hover:text-[#17191F] transition-colors text-left cursor-pointer"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('safety')}
                  className="hover:text-[#17191F] transition-colors text-left cursor-pointer"
                >
                  Safety Guidelines
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('terms')}
                  className="hover:text-[#17191F] transition-colors text-left cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
              <li className="pt-1">
                <button
                  type="button"
                  onClick={onClearData}
                  className="text-[11px] text-[#9CA3AF] hover:text-rose-600 underline cursor-pointer transition-colors"
                  title="Clears local browser search history and preferences"
                >
                  Reset Local Preferences
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#646B76] gap-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
            <span>© {new Date().getFullYear()} NOVORA Global Marketplace</span>
            <span>·</span>
            <span>Independent Direct Commerce</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>Worldwide Public Directory</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
