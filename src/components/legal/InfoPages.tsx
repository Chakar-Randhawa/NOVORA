import React from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Globe,
  Store,
  Sparkles,
  HelpCircle,
  FileText,
  Lock,
  HeartHandshake
} from 'lucide-react';

interface InfoPageProps {
  page: 'about' | 'how-it-works' | 'safety' | 'terms' | 'seller-guide' | 'help';
  onBack: () => void;
  onOpenStoreWizard?: () => void;
  onOpenCreateListing?: () => void;
  onOpenCreateRequest?: () => void;
}

export const InfoPages: React.FC<InfoPageProps> = ({
  page,
  onBack,
  onOpenStoreWizard,
  onOpenCreateListing,
  onOpenCreateRequest
}) => {
  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24">
      {/* Top Header */}
      <div className="bg-white border-b border-[#E5E7EB] sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between text-xs">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[#646B76] hover:text-[#17191F] font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Marketplace</span>
          </button>
          <span className="text-[#9CA3AF] uppercase text-[10px] tracking-wider font-semibold font-mono">
            NOVORA Official Directory
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-10">
        
        {/* PAGE: ABOUT */}
        {page === 'about' && (
          <div className="space-y-8">
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-[#4057D6] font-semibold uppercase tracking-wider">
                Our Mission & Vision
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#17191F] tracking-tight">
                About NOVORA
              </h1>
              <p className="text-sm text-[#4B5563] leading-relaxed max-w-2xl">
                A calm, borderless discovery marketplace uniting physical crafts, creative services, direct buyer procurement, and independent branded storefronts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] space-y-2.5 shadow-2xs">
                <Globe className="w-5 h-5 text-[#4057D6]" />
                <h3 className="text-sm font-semibold text-[#17191F]">Global Discovery</h3>
                <p className="text-xs text-[#646B76] leading-relaxed">
                  Discover authenticated artisans, creators, and workshops across 40+ countries without algorithmic clutter.
                </p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] space-y-2.5 shadow-2xs">
                <Store className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-semibold text-[#17191F]">Independent Stores</h3>
                <p className="text-xs text-[#646B76] leading-relaxed">
                  Every seller gets a dedicated, branded storefront with custom collections, policies, and direct links.
                </p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] space-y-2.5 shadow-2xs">
                <HeartHandshake className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-semibold text-[#17191F]">Request Orbit</h3>
                <p className="text-xs text-[#646B76] leading-relaxed">
                  Can't find what you need? Post an open requirement and receive tailored proposals from specialists.
                </p>
              </div>
            </div>

            <div className="p-8 bg-[#FAFAF8] rounded-2xl border border-[#E5E7EB] space-y-4">
              <h2 className="text-base font-semibold text-[#17191F]">Our Core Principles</h2>
              <ul className="space-y-3 text-xs text-[#4B5563] leading-relaxed">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Zero Fake Social Proof:</strong> We strictly prohibit fake ratings, imaginary sales numbers, and fabricated reviews. Every metric is genuine.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Direct Communication:</strong> Direct, end-to-end buyer-to-seller messaging for honest collaboration and custom negotiations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Privacy & Security:</strong> Zero intrusive tracking cookies, strict row-level security rules, and confidential commercial proposals.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* PAGE: HOW IT WORKS */}
        {page === 'how-it-works' && (
          <div className="space-y-8">
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-[#4057D6] font-semibold uppercase tracking-wider">
                Architecture & Workflow
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#17191F] tracking-tight">
                How NOVORA Works
              </h1>
              <p className="text-sm text-[#4B5563] leading-relaxed max-w-2xl">
                A unified architecture connecting buyers, independent stores, custom service makers, and direct requests.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col sm:flex-row gap-4 items-start shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] text-[#4057D6] flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-[#17191F]">Explore & Discover</h3>
                  <p className="text-xs text-[#646B76] leading-relaxed">
                    Search the global catalog or use <strong>Find My Match</strong> for natural language discovery that matches item attributes, budget caps, and international shipping destinations.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col sm:flex-row gap-4 items-start shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] text-[#4057D6] flex items-center justify-center font-bold text-sm shrink-0">
                  2
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-[#17191F]">Post to Request Orbit</h3>
                  <p className="text-xs text-[#646B76] leading-relaxed">
                    If an item or specific custom commission isn't currently listed, submit an open buyer request with your budget and deadline. Independent makers submit confidential proposals directly to your dashboard.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col sm:flex-row gap-4 items-start shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] text-[#4057D6] flex items-center justify-center font-bold text-sm shrink-0">
                  3
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-[#17191F]">Launch Your Own Storefront</h3>
                  <p className="text-xs text-[#646B76] leading-relaxed">
                    Independent makers and studios can launch a branded digital storefront with custom categories, store policies, workshop bio, and direct shareable link in under 5 minutes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAGE: SAFETY & GUIDELINES */}
        {page === 'safety' && (
          <div className="space-y-8">
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-emerald-700 font-semibold uppercase tracking-wider">
                Trust & Verification
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#17191F] tracking-tight">
                Community & Safety Guidelines
              </h1>
              <p className="text-sm text-[#4B5563] leading-relaxed max-w-2xl">
                Our standards for fair trade, prohibited items, communication safety, and dispute resolution.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] space-y-4 shadow-2xs text-xs text-[#4B5563] leading-relaxed">
              <h2 className="text-sm font-semibold text-[#17191F]">Prohibited & Restricted Items</h2>
              <p>
                NOVORA strictly forbids counterfeit merchandise, illegal contraband, unauthorized copyrighted digital assets, dangerous chemicals, weapons, and misleading or fraudulent representations.
              </p>

              <h2 className="text-sm font-semibold text-[#17191F] pt-2">On-Platform Communication</h2>
              <p>
                To maintain comprehensive record protection, all buyer inquiries, custom quotes, and order negotiations must be conducted via NOVORA Direct Messaging. Attempting to circumvent the platform for unverified off-site transactions may result in account restriction.
              </p>

              <h2 className="text-sm font-semibold text-[#17191F] pt-2">Moderation & Enforcement</h2>
              <p>
                Community members can flag suspicious listings, misleading quotes, or inappropriate messages at any time using the Report tool. Reports are reviewed by staff moderators in accordance with our Zero-Tolerance safety charter.
              </p>
            </div>
          </div>
        )}

        {/* PAGE: TERMS OF SERVICE */}
        {page === 'terms' && (
          <div className="space-y-8">
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-[#646B76] font-semibold uppercase tracking-wider">
                Legal & Governance
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#17191F] tracking-tight">
                Terms of Service & Privacy
              </h1>
              <p className="text-sm text-[#4B5563] leading-relaxed max-w-2xl">
                Transparent rules governing membership, buyer agreements, seller stores, and data protection.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] space-y-4 shadow-2xs text-xs text-[#4B5563] leading-relaxed">
              <h2 className="text-sm font-semibold text-[#17191F]">1. Independent Contractor Relationship</h2>
              <p>
                NOVORA provides discovery, messaging, and storefront hosting infrastructure. Sellers operate as independent businesses and are solely responsible for compliance with local commercial regulations, product accuracy, and fulfillment.
              </p>

              <h2 className="text-sm font-semibold text-[#17191F] pt-2">2. User Privacy & Data Isolation</h2>
              <p>
                We do not sell user data to third-party ad networks. Authentication credentials and private messages are cryptographically isolated via strict Firestore access control rules.
              </p>

              <h2 className="text-sm font-semibold text-[#17191F] pt-2">3. Intellectual Property</h2>
              <p>
                Sellers retain full intellectual property ownership of their original designs, logos, and custom photography. By uploading media, sellers grant NOVORA a non-exclusive license to display the content within the discovery catalog.
              </p>
            </div>
          </div>
        )}

        {/* PAGE: SELLER GUIDE */}
        {page === 'seller-guide' && (
          <div className="space-y-8">
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-[#4057D6] font-semibold uppercase tracking-wider">
                Artisan Playbook
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#17191F] tracking-tight">
                Seller Guide & Store Success
              </h1>
              <p className="text-sm text-[#4B5563] leading-relaxed max-w-2xl">
                Best practices for photography, international shipping, store completion, and quoting buyer requests.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] space-y-2 shadow-2xs">
                <Sparkles className="w-5 h-5 text-[#4057D6]" />
                <h3 className="text-sm font-semibold text-[#17191F]">High-Clarity Photography</h3>
                <p className="text-xs text-[#646B76] leading-relaxed">
                  Use natural light and display the item from multiple angles. For custom creations, show scale and texture up close.
                </p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] space-y-2 shadow-2xs">
                <Store className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-semibold text-[#17191F]">Complete Your Storefront</h3>
                <p className="text-xs text-[#646B76] leading-relaxed">
                  Stores with 80%+ completeness (story, banner, return policies, custom categories) convert 3x better than unbranded seller cards.
                </p>
              </div>
            </div>

            <div className="p-6 bg-[#FAFAF8] rounded-2xl border border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#17191F]">Ready to launch your storefront?</h3>
                <p className="text-xs text-[#646B76]">Use the guided 7-step wizard to publish your store now.</p>
              </div>
              {onOpenStoreWizard && (
                <button
                  type="button"
                  onClick={onOpenStoreWizard}
                  className="px-4 py-2 bg-[#17191F] hover:bg-[#27272A] text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
                >
                  Launch Store Wizard
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
