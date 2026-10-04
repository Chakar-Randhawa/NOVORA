import React, { useState, useEffect } from 'react';
import { X, Sparkles, Shield, AlertCircle, Plus } from 'lucide-react';
import { BuyerRequest, UserProfile } from '../../types';
import { CATEGORIES } from '../../data/categories';
import { COUNTRIES, CURRENCIES } from '../../data/countries';

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
  const [currency, setCurrency] = useState(currentUser?.preferredCurrency || 'USD');
  const [quantity, setQuantity] = useState('1');
  const [destinationCountry, setDestinationCountry] = useState(currentUser?.country || 'US');
  const [deadline, setDeadline] = useState('');
  const [customizationDetails, setCustomizationDetails] = useState('');
  const [fulfillmentPreference, setFulfillmentPreference] = useState<'shipping' | 'digital' | 'remote_service' | 'local_pickup'>('shipping');
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
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-[#17191F]">
            Sign in to Post a Buyer Request
          </h3>
          <p className="text-xs text-[#646B76] leading-relaxed">
            Create an account to broadcast your exact requirements and receive tailored proposals from global sellers.
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

    onSubmit(newRequest);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#E5E7EB] shadow-2xl relative overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between shrink-0 bg-[#FAFAF8]">
          <div>
            <h2 className="text-base font-semibold text-[#17191F]">Post to Request Orbit</h2>
            <p className="text-xs text-[#646B76]">
              Broadcast your custom requirements to independent makers and global suppliers
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

          <div>
            <label className="block text-xs font-medium text-[#17191F] mb-1">
              Request Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Seeking Handcrafted Walnut Desk Tray with Pen Rest"
              className="w-full text-xs p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#17191F] focus:border-[#4057D6] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#17191F] mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#17191F] focus:border-[#4057D6] focus:outline-hidden cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#17191F] mb-1">
                Fulfillment Preference
              </label>
              <select
                value={fulfillmentPreference}
                onChange={(e) => setFulfillmentPreference(e.target.value as any)}
                className="w-full text-xs p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#17191F] focus:border-[#4057D6] focus:outline-hidden cursor-pointer"
              >
                <option value="shipping">Physical Shipping to Destination</option>
                <option value="digital">Instant Digital Transfer</option>
                <option value="remote_service">Remote Freelance Service</option>
                <option value="local_pickup">Local In-Person Handoff</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#17191F] mb-1">
              Detailed Specifications & Requirements *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe materials, dimensions, aesthetic references, timeline, and acceptable alternatives..."
              className="w-full text-xs p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#17191F] focus:border-[#4057D6] focus:outline-hidden"
            />
          </div>

          {/* Budget & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#17191F] mb-1">
                Min Budget *
              </label>
              <input
                type="number"
                min="0"
                required
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="100"
                className="w-full text-xs p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg font-mono text-[#17191F]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#17191F] mb-1">
                Max Budget *
              </label>
              <input
                type="number"
                min="0"
                required
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="250"
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
                {CURRENCIES.map((cur) => (
                  <option key={cur.code} value={cur.code}>
                    {cur.code} ({cur.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#17191F] mb-1">
                Quantity Needed
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#17191F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#17191F] mb-1">
                Destination Country
              </label>
              <select
                value={destinationCountry}
                onChange={(e) => setDestinationCountry(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#17191F] cursor-pointer"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#17191F] mb-1">
                Target Deadline (Optional)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#17191F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#17191F] mb-1">
              Customization & Bespoke Requirements (Optional)
            </label>
            <input
              type="text"
              value={customizationDetails}
              onChange={(e) => setCustomizationDetails(e.target.value)}
              placeholder="e.g. Inscription, specific timber species, custom colorway"
              className="w-full text-xs p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#17191F]"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
            <span className="text-xs text-[#646B76]">
              Publicly visible to verified artisans & suppliers worldwide
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
                Publish Request
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
