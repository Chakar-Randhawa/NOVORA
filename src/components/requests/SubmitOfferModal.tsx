import React, { useState, useEffect } from 'react';
import { X, Send, ShieldCheck, AlertCircle, Plus, Loader2 } from 'lucide-react';
import { BuyerRequest, RequestOffer, UserProfile } from '../../types';
import { CURRENCIES } from '../../data/countries';

interface SubmitOfferModalProps {
  request: BuyerRequest;
  currentUser: UserProfile | null;
  onClose: () => void;
  onSubmit: (offer: RequestOffer) => Promise<void> | void;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs novora-animate-backdrop">
        <div className="bg-white rounded-2xl max-w-md w-full border border-[#E5E7EB] shadow-2xl p-6 text-center space-y-4 novora-animate-modal">
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
              className="px-4 py-2 text-xs font-medium text-white bg-[#17191F] hover:bg-[#27272A] rounded-lg transition-colors cursor-pointer active:scale-[0.98]"
            >
              Sign In / Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsSubmitting(true);
    try {
      await onSubmit(offer);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit proposal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto novora-animate-backdrop">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#E5E7EB] shadow-2xl relative overflow-hidden my-auto max-h-[92vh] flex flex-col novora-animate-modal">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#E5E7EB] flex items-center justify-between shrink-0 bg-[#FAFAF8]">
          <div>
            <h2 className="text-base font-semibold text-[#17191F]">Submit Quote Proposal</h2>
            <p className="text-xs text-[#646B76] truncate max-w-md">
              Replying to: "{request.title}" ({request.buyerName})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#646B76] hover:text-[#17191F] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Request summary banner */}
          <div className="p-3.5 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] text-xs space-y-1">
            <div className="flex items-center justify-between text-[#646B76]">
              <span>Buyer Budget Range:</span>
              <span className="font-semibold text-[#17191F] font-mono">
                ${request.budgetMin} – ${request.budgetMax} {request.currency}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#646B76]">
              <span>Preferred Fulfillment:</span>
              <span className="capitalize font-medium text-[#17191F]">{request.fulfillmentPreference.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#17191F] mb-1">
                Your Quoted Price *
              </label>
              <input
                type="number"
                step="any"
                required
                value={proposedPrice}
                onChange={(e) => setProposedPrice(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#17191F] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#17191F] mb-1">
                Currency *
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#17191F]"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#17191F] mb-1">
                Est. Turnaround (Days) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#17191F] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#17191F] mb-1">
              Proposal Details & Approach *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Introduce your capabilities, proposed materials, process, and why your workshop is the ideal match..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#17191F] leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#17191F] mb-1">
              Included Deliverables
            </label>
            <input
              type="text"
              placeholder="e.g. 50 laser-cut keytags, tracked international air parcel, presentation boxes"
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              className="w-full text-xs p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#17191F]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#17191F] mb-1">
              Fulfillment & Shipping Terms *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dispatched via DHL Express with insurance included"
              value={shippingDetails}
              onChange={(e) => setShippingDetails(e.target.value)}
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
          <div className="pt-4 border-t border-[#E5E7EB] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <span className="text-xs text-[#646B76] text-center sm:text-left">
              Valid for 14 days · Zero platform fees
            </span>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-medium text-[#646B76] hover:text-[#17191F] rounded-lg transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-medium text-white bg-[#17191F] hover:bg-[#27272A] rounded-lg transition-colors shadow-xs cursor-pointer text-center flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting Quote...</span>
                  </>
                ) : (
                  <span>Send Proposal to Buyer</span>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
