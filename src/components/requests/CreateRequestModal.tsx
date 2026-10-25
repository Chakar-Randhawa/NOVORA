import React, { useState, useEffect } from 'react';
import { X, Sparkles, Shield, AlertCircle, Plus, Loader2 } from 'lucide-react';
import { BuyerRequest, UserProfile } from '../../types';
import { CATEGORIES } from '../../data/categories';
import { COUNTRIES, CURRENCIES } from '../../data/countries';
import { getStoredCurrencyPreference } from '../../utils/currency';

interface CreateRequestModalProps {
  currentUser: UserProfile | null;
  onClose: () => void;
  onSubmit: (request: BuyerRequest) => void;
  onOpenAuth: (mode?: 'signin' | 'register') => void;
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  currentUser,
  onClose,
  onSubmit,
  onOpenAuth
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(CATEGORIES[0].id);
  const [budgetMin, setBudgetMin] = useState<string>('');
  const [budgetMax, setBudgetMax] = useState<string>('');
  const [currency, setCurrency] = useState(currentUser?.preferredCurrency || getStoredCurrencyPreference() || 'USD');
  const [quantity, setQuantity] = useState('1');
  const [destinationCountry, setDestinationCountry] = useState(currentUser?.country || 'US');
  const [deadline, setDeadline] = useState('');
  const [customizationDetails, setCustomizationDetails] = useState('');
  const [fulfillmentPreference, setFulfillmentPreference] = useState<'shipping' | 'digital' | 'remote_service' | 'local_pickup'>('shipping');
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <div className="bg-white rounded-2xl max-w-md w-full border border-[#E2DFD8] shadow-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F7F3EB] text-[#C5A572] border border-[#E8DAC2] flex items-center justify-center mx-auto">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-[#14243A]">
            Sign in to Post a Buyer Request
          </h3>
          <p className="text-xs text-[#5A6578] leading-relaxed">
            Create an account to broadcast your exact requirements and receive tailored proposals from global sellers.
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#5A6578] hover:text-[#14243A] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenAuth('signin');
              }}
              className="px-4 py-2 text-xs font-medium text-white bg-[#14243A] hover:bg-[#0E1B2D] rounded-lg transition-colors cursor-pointer active:scale-[0.98]"
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

    const min = parseFloat(budgetMin);
    const max = parseFloat(budgetMax);

    if (isNaN(min) || isNaN(max) || min < 0 || max < min) {
      setErrorMsg('Please specify a valid budget range (Max budget must be greater than or equal to Min).');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setErrorMsg('Title and description are required.');
      return;
    }

    const newRequest: BuyerRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      description: description.trim(),
      categoryId,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      buyerCountry: currentUser.country,
      budgetMin: min,
      budgetMax: max,
      currency,
      quantity: parseInt(quantity, 10) || 1,
      destinationCountry,
      deadline: deadline || undefined,
      customizationDetails: customizationDetails.trim() || undefined,
      fulfillmentPreference,
      status: 'open',
      createdAt: new Date().toISOString(),
      offersCount: 0,
      visibility: 'public'
    };

    setIsSubmitting(true);
    try {
      await onSubmit(newRequest);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto novora-animate-backdrop">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#E2DFD8] shadow-2xl relative overflow-hidden my-auto max-h-[92vh] flex flex-col novora-animate-modal">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#E2DFD8] flex items-center justify-between shrink-0 bg-[#F7F5F0]">
          <div>
            <h2 className="text-base font-semibold text-[#14243A]">Post to Request Orbit</h2>
            <p className="text-xs text-[#5A6578]">
              Broadcast your custom requirements to independent makers and global suppliers
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#5A6578] hover:text-[#14243A] hover:bg-[#EFECE5] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#14243A] mb-1">
              Request Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Seeking Handcrafted Walnut Desk Tray with Pen Rest"
              className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2DFD8] rounded-lg text-[#14243A] focus:border-[#C5A572] focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#14243A] mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2DFD8] rounded-lg text-[#14243A] focus:border-[#C5A572] focus:bg-white focus:outline-hidden cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#14243A] mb-1">
                Fulfillment Preference
              </label>
              <select
                value={fulfillmentPreference}
                onChange={(e) => setFulfillmentPreference(e.target.value as any)}
                className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2DFD8] rounded-lg text-[#14243A] focus:border-[#C5A572] focus:bg-white focus:outline-hidden cursor-pointer"
              >
                <option value="shipping">Physical Shipping to Destination</option>
                <option value="digital">Instant Digital Transfer</option>
                <option value="remote_service">Remote Freelance Service</option>
                <option value="local_pickup">Local In-Person Handoff</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#14243A] mb-1">
              Detailed Specifications & Requirements *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe materials, dimensions, aesthetic references, timeline, and acceptable alternatives..."
              className="w-full text-xs p-3 bg-[#F7F5F0] border border-[#E2DFD8] rounded-lg text-[#14243A] focus:border-[#C5A572] focus:bg-white focus:outline-hidden leading-relaxed"
            />
          </div>

          {/* Budget & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#14243A] mb-1">
                Min Budget *
              </label>
              <input
                type="number"
                min="0"
                required
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="100"
                className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2DFD8] rounded-lg font-mono text-[#14243A] focus:border-[#C5A572] focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#14243A] mb-1">
                Max Budget *
              </label>
              <input
                type="number"
                min="0"
                required
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="250"
                className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2DFD8] rounded-lg font-mono text-[#14243A] focus:border-[#C5A572] focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#14243A] mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2DFD8] rounded-lg font-mono text-[#14243A] cursor-pointer focus:border-[#C5A572] focus:bg-white focus:outline-hidden"
              >
                {CURRENCIES.map((cur) => (
                  <option key={cur.code} value={cur.code}>
                    {cur.code} ({cur.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#14243A] mb-1">
                Quantity Needed
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2DFD8] rounded-lg text-[#14243A] focus:border-[#C5A572] focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#14243A] mb-1">
                Destination Country
              </label>
              <select
                value={destinationCountry}
                onChange={(e) => setDestinationCountry(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2DFD8] rounded-lg text-[#14243A] cursor-pointer focus:border-[#C5A572] focus:bg-white focus:outline-hidden"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#14243A] mb-1">
                Target Deadline (Optional)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2DFD8] rounded-lg text-[#14243A] focus:border-[#C5A572] focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#14243A] mb-1">
              Customization & Bespoke Requirements (Optional)
            </label>
            <input
              type="text"
              value={customizationDetails}
              onChange={(e) => setCustomizationDetails(e.target.value)}
              placeholder="e.g. Inscription, specific timber species, custom colorway"
              className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2DFD8] rounded-lg text-[#14243A] focus:border-[#C5A572] focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#E2DFD8] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <span className="text-xs text-[#5A6578] text-center sm:text-left">
              Publicly visible to verified artisans & suppliers worldwide
            </span>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-medium text-[#5A6578] hover:text-[#14243A] rounded-lg transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-medium text-white bg-[#14243A] hover:bg-[#0E1B2D] rounded-lg transition-colors shadow-xs cursor-pointer text-center flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>Publish Request</span>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
