import React, { useState, useEffect } from 'react';
import { X, Send, ShieldCheck, AlertCircle, Plus } from 'lucide-react';
import { BuyerRequest, RequestOffer, UserProfile } from '../../types';
import { CURRENCIES } from '../../data/countries';

interface SubmitOfferModalProps {
  request: BuyerRequest;
  currentUser: UserProfile | null;
  onClose: () => void;
  onSubmit: (offer: RequestOffer) => void;
  onOpenAuth: (mode?: 'signin' | 'register') => void;
}

export const SubmitOfferModal: React.FC<SubmitOfferModalProps> = ({
  request,
  currentUser,
  onClose,
  onSubmit,
  onOpenAuth
}) => {
  const [proposedPrice, setProposedPrice] = useState<string>(request.budgetMax.toString());
  const [currency, setCurrency] = useState(request.currency);
  const [description, setDescription] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('7');
  const [shippingDetails, setShippingDetails] = useState('');
  const [customizationIncluded, setCustomizationIncluded] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <div className="bg-white rounded-2xl max-w-md w-full border border-[#E5E7EB] shadow-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#4057D6] flex items-center justify-center mx-auto">
            <Send className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-[#17191F]">
            Sign in to Submit a Proposal
          </h3>
          <p className="text-xs text-[#646B76] leading-relaxed">
            You need a registered seller account to submit quotes and communicate with buyers on Request Orbit.
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#646B76] hover:text-[#17191F] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenAuth('signin');
              }}
              className="px-4 py-2 text-xs font-medium text-white bg-[#17191F] hover:bg-[#27272A] rounded-lg transition-colors cursor-pointer"
            >
              Sign In / Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const price = parseFloat(proposedPrice);
    if (isNaN(price) || price <= 0) {
      setErrorMsg('Please enter a valid proposed price.');
      return;
    }

    if (!description.trim() || !shippingDetails.trim()) {
      setErrorMsg('Please provide your proposal description and fulfillment details.');
      return;
    }

    const offer: RequestOffer = {
      id: `offer_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      requestId: request.id,
      buyerId: request.buyerId,
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      sellerCountry: currentUser.country,
      proposedPrice: price,
      currency,
      description: description.trim(),
      deliverables: deliverables.trim() || undefined,
      estimatedDays: parseInt(estimatedDays, 10) || 7,
      shippingOrFulfillmentDetails: shippingDetails.trim(),
      customizationIncluded,
      status: 'pending',
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    };

    onSubmit(offer);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-[#E5E7EB] shadow-2xl relative overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between shrink-0 bg-[#FAFAF8]">
          <div>
            <h2 className="text-base font-semibold text-[#17191F]">Submit Seller Proposal</h2>
            <p className="text-xs text-[#646B76] truncate max-w-sm">
              Responding to: {request.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#646B76] hover:text-[#17191F] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Pricing & Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#17191F] mb-1">
                Your Price Quote *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={proposedPrice}
                onChange={(e) => setProposedPrice(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg font-mono text-[#17191F]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#17191F] mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg font-mono text-[#17191F] cursor-pointer"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#17191F] mb-1">
                Lead Time (Days)
              </label>
              <input
                type="number"
                min="1"
                required
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#17191F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#17191F] mb-1">
              Proposal Details & Approach *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain how you will craft or fulfill this request, materials used, craftsmanship techniques..."
              className="w-full text-xs p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#17191F] focus:border-[#4057D6] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#17191F] mb-1">
              Specific Deliverables Included
            </label>
            <input
              type="text"
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              placeholder="e.g. 1 Custom Walnut Desk Tray with protective packaging"
              className="w-full text-xs p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#17191F]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#17191F] mb-1">
              Shipping & Fulfillment Details *
            </label>
            <input
              type="text"
              required
              value={shippingDetails}
              onChange={(e) => setShippingDetails(e.target.value)}
              placeholder="e.g. Tracked airmail with signature required included"
              className="w-full text-xs p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#17191F]"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="offerCustom"
              checked={customizationIncluded}
              onChange={(e) => setCustomizationIncluded(e.target.checked)}
              className="rounded border-[#E5E7EB] text-[#4057D6]"
            />
            <label htmlFor="offerCustom" className="text-xs font-medium text-[#17191F] cursor-pointer">
              Customization & personalized adjustments included in quoted price
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
            <span className="text-xs text-[#646B76]">
              Valid for 14 days · Zero platform fees
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#646B76] hover:text-[#17191F] rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-medium text-white bg-[#17191F] hover:bg-[#27272A] rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Send Proposal to Buyer
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
