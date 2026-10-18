import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, ShieldCheck, AlertCircle, Loader2, Sparkles, Check } from 'lucide-react';
import { Listing, ListingType, ProductCondition, UserProfile } from '../../types';
import { CATEGORIES } from '../../data/categories';
import { COUNTRIES, CURRENCIES } from '../../data/countries';
import { compressImageToDataUrl } from '../../services/storage';

interface CreateListingModalProps {
  currentUser: UserProfile | null;
  initialListing?: Listing | null;
  onClose: () => void;
  onSubmit: (listing: Listing) => Promise<void> | void;
  onUpdateListing?: (id: string, updates: Partial<Listing>) => Promise<void> | void;
  onOpenAuth: (mode?: 'signin' | 'register') => void;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  currentUser,
  initialListing,
  onClose,
  onSubmit,
  onUpdateListing,
  onOpenAuth
}) => {
  const isEditing = Boolean(initialListing);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialListing?.categoryId || CATEGORIES[0].id
  );
  const [title, setTitle] = useState(initialListing?.title || '');
  const [description, setDescription] = useState(initialListing?.description || '');
  const [price, setPrice] = useState<string>(
    initialListing ? String(initialListing.price) : ''
  );
  const [currency, setCurrency] = useState(
    initialListing?.currency || currentUser?.preferredCurrency || 'USD'
  );
  const [condition, setCondition] = useState<ProductCondition>(
    initialListing?.condition || 'new'
  );
  const [listingType, setListingType] = useState<ListingType>(
    initialListing?.listingType || 'handmade'
  );
  const [listingStatus, setListingStatus] = useState<'active' | 'paused' | 'archived'>(
    initialListing?.status || 'active'
  );
  const [customAttributes, setCustomAttributes] = useState<Record<string, any>>(
    initialListing?.customAttributes || {}
  );
  const [images, setImages] = useState<string[]>(
    initialListing?.images || []
  );
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shipsInternationally, setShipsInternationally] = useState(
    initialListing ? initialListing.shipsInternationally : true
  );
  const [shippingDestinations, setShippingDestinations] = useState(
    initialListing?.shippingDestinations?.join(', ') || 'Worldwide'
  );
  const [shippingCostDesc, setShippingCostDesc] = useState(
    initialListing?.shippingCostDescription || ''
  );
  const [allowsCustomization, setAllowsCustomization] = useState(
    initialListing ? initialListing.allowsCustomization : false
  );
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs novora-animate-backdrop">
        <div className="bg-white rounded-2xl max-w-md w-full border border-[#E2DFD8] shadow-2xl p-6 text-center space-y-4 novora-animate-modal">
          <div className="w-12 h-12 rounded-2xl bg-[#F7F3EB] text-[#C5A572] border border-[#E8DAC2] flex items-center justify-center mx-auto">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-[#14243A]">
            Sign in to Publish a Listing
          </h3>
          <p className="text-xs text-[#5A6578] leading-relaxed">
            You need a free registered account to publish offerings, manage inventory, and receive direct buyer inquiries.
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

  const currentCategory = CATEGORIES.find(c => c.id === selectedCategoryId) || CATEGORIES[0];

  const handleCategoryChange = (newCatId: string) => {
    setSelectedCategoryId(newCatId);
    const cat = CATEGORIES.find(c => c.id === newCatId);
    if (cat && cat.listingTypes.length > 0) {
      setListingType(cat.listingTypes[0]);
    }
    setCustomAttributes({});
  };

  const handleCustomFieldChange = (key: string, value: any) => {
    setCustomAttributes(prev => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 5) {
      setErrorMsg('Maximum 5 images allowed per listing to protect zero-cost quotas.');
      return;
    }

    setIsCompressing(true);
    setErrorMsg(null);

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        const compressed = await compressImageToDataUrl(file, 1200, 0.82);
        newUrls.push(compressed);
      }
      setImages(prev => [...prev, ...newUrls]);
    } catch (err) {
      setErrorMsg('Image processing failed. Please select a valid JPEG or PNG file.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setErrorMsg('Please enter a valid price amount.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setErrorMsg('Title and description are required.');
      return;
    }

    // Verify required custom attributes
    for (const field of currentCategory.customFields) {
      if (field.required && !customAttributes[field.key]) {
        setErrorMsg(`"${field.label}" is required for ${currentCategory.name}.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (isEditing && initialListing && onUpdateListing) {
        // Updating existing listing
        const updates: Partial<Listing> = {
          title: title.trim(),
          description: description.trim(),
          categoryId: selectedCategoryId,
          listingType,
          price: numPrice,
          currency,
          condition,
          status: listingStatus,
          images,
          customAttributes,
          shipsInternationally,
          shippingDestinations: shippingDestinations.split(',').map(s => s.trim()).filter(Boolean),
          shippingCostDescription: shippingCostDesc.trim() || undefined,
          allowsCustomization,
          tags: [selectedCategoryId, listingType, currentUser.country.toLowerCase()]
        };

        await onUpdateListing(initialListing.id, updates);
        onClose();
      } else {
        // Creating new listing
        const newListing: Listing = {
          id: `list_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          title: title.trim(),
          description: description.trim(),
          categoryId: selectedCategoryId,
          listingType,
          price: numPrice,
          currency,
          condition,
          sellerId: currentUser.id,
          sellerName: currentUser.name,
          sellerCountry: currentUser.country,
          sellerCity: currentUser.city,
          images,
          customAttributes,
          shipsInternationally,
          shippingDestinations: shippingDestinations.split(',').map(s => s.trim()).filter(Boolean),
          shippingCostDescription: shippingCostDesc.trim() || undefined,
          allowsCustomization,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          viewsCount: 0,
          favoritesCount: 0,
          tags: [selectedCategoryId, listingType, currentUser.country.toLowerCase()]
        };

        await onSubmit(newListing);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto novora-animate-backdrop">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-[#E2DFD8] shadow-2xl relative overflow-hidden my-auto max-h-[92vh] flex flex-col novora-animate-modal">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#E2DFD8] flex items-center justify-between shrink-0 bg-[#F7F5F0]">
          <div>
            <h2 className="text-base font-semibold text-[#14243A]">
              {isEditing ? `Edit Offering: ${initialListing?.title}` : 'Publish New Listing'}
            </h2>
            <p className="text-xs text-[#5A6578]">
              {isEditing ? 'Modify product details, pricing, fulfillment and photos' : 'Category-tailored dynamic fields · Zero listing fees'}
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Category & Status Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#14243A] mb-1">
                Category *
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2DFD8] rounded-xl text-[#14243A] focus:border-[#14243A] focus:bg-white focus:outline-hidden"
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14243A] mb-1">
                Offering Type *
              </label>
              <select
                value={listingType}
                onChange={(e) => setListingType(e.target.value as ListingType)}
                className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2DFD8] rounded-xl text-[#14243A] focus:border-[#14243A] focus:bg-white focus:outline-hidden capitalize"
              >
                {currentCategory.listingTypes.map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          {isEditing && (
            <div className="p-3 bg-[#F7F5F0] border border-[#E2DFD8] rounded-xl flex items-center justify-between text-xs">
              <span className="font-medium text-[#14243A]">Listing Visibility Status:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setListingStatus('active')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    listingStatus === 'active'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white border border-[#E2DFD8] text-[#5A6578]'
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setListingStatus('paused')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    listingStatus === 'paused'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-white border border-[#E2DFD8] text-[#5A6578]'
                  }`}
                >
                  Paused
                </button>
              </div>
            </div>
          )}

          {/* Title & Price */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#14243A] mb-1">
                Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Handcrafted Walnut Wood Mechanical Keyboard Case"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2DFD8] rounded-xl text-[#14243A] focus:border-[#14243A] focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#14243A] mb-1">
                  Price *
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2DFD8] rounded-xl text-[#14243A] focus:border-[#14243A] focus:bg-white focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#14243A] mb-1">
                  Currency *
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2DFD8] rounded-xl text-[#14243A] focus:border-[#14243A] focus:bg-white focus:outline-hidden"
                >
                  {CURRENCIES.map(curr => (
                    <option key={curr.code} value={curr.code}>{curr.code} ({curr.symbol})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#14243A] mb-1">
                  Condition *
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ProductCondition)}
                  className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2DFD8] rounded-xl text-[#14243A] focus:border-[#14243A] focus:bg-white focus:outline-hidden capitalize"
                >
                  <option value="new">Brand New</option>
                  <option value="like_new">Like New</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good Condition</option>
                  <option value="fair">Fair</option>
                  <option value="not_applicable">Not Applicable</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#14243A] mb-1">
              Description *
            </label>
            <textarea
              rows={4}
              placeholder="Describe materials, origin, dimensions, provenance, and what makes this offering unique..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-3 bg-[#F7F5F0] border border-[#E2DFD8] rounded-xl text-[#14243A] focus:border-[#14243A] focus:bg-white focus:outline-hidden leading-relaxed"
            />
          </div>

          {/* Dynamic Category Custom Fields */}
          {currentCategory.customFields.length > 0 && (
            <div className="p-4 bg-[#F7F5F0] rounded-2xl border border-[#E2DFD8] space-y-3">
              <span className="text-xs font-semibold text-[#14243A] block">
                {currentCategory.name} Category Specifications
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {currentCategory.customFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-[11px] font-medium text-[#5A6578] mb-1">
                      {field.label} {field.required && <span className="text-rose-500">*</span>}
                    </label>

                    {field.type === 'select' && field.options ? (
                      <select
                        value={customAttributes[field.key] || ''}
                        onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-[#E2DFD8] rounded-lg text-[#14243A] focus:border-[#14243A] focus:outline-hidden"
                      >
                        <option value="">Select option...</option>
                        {field.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.type === 'boolean' ? (
                      <div className="flex items-center gap-2 pt-1.5">
                        <input
                          type="checkbox"
                          id={`custom_${field.key}`}
                          checked={Boolean(customAttributes[field.key])}
                          onChange={(e) => handleCustomFieldChange(field.key, e.target.checked)}
                          className="rounded border-[#E2DFD8] text-[#14243A] focus:ring-[#C5A572]"
                        />
                        <label htmlFor={`custom_${field.key}`} className="text-xs text-[#283548] cursor-pointer">
                          {field.placeholder || 'Yes'}
                        </label>
                      </div>
                    ) : (
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        placeholder={field.placeholder || ''}
                        value={customAttributes[field.key] || ''}
                        onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-[#E2DFD8] rounded-lg text-[#14243A] focus:border-[#14243A] focus:outline-hidden"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photos Upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#14243A]">
                Product Photos ({images.length}/5)
              </label>
              <span className="text-[11px] text-[#5A6578]">
                Compressed client-side to keep service zero-cost
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {images.map((imgUrl, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl bg-[#F7F5F0] overflow-hidden border border-[#E2DFD8] group">
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1.5 right-1.5 p-1 bg-white/90 hover:bg-rose-50 text-[#5A6578] hover:text-rose-600 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-[#14243A]/85 text-white text-[9px] font-medium rounded-md">
                      Cover
                    </span>
                  )}
                </div>
              ))}

              {images.length < 5 && (
                <label className="border-2 border-dashed border-[#E2DFD8] hover:border-[#14243A] rounded-xl aspect-square flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-colors bg-[#F7F5F0]">
                  <Upload className="w-5 h-5 text-[#8A94A6] mb-1" />
                  <span className="text-[11px] font-medium text-[#283548]">
                    {isCompressing ? 'Optimizing...' : 'Upload Image'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isCompressing}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Shipping & Customization Settings */}
          <div className="p-4 bg-[#F7F5F0] rounded-xl border border-[#E2DFD8] space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="shipsIntl"
                checked={shipsInternationally}
                onChange={(e) => setShipsInternationally(e.target.checked)}
                className="rounded border-[#E2DFD8] text-[#14243A] focus:ring-[#C5A572]"
              />
              <label htmlFor="shipsIntl" className="text-xs font-medium text-[#14243A] cursor-pointer">
                Ships Internationally / Available Worldwide
              </label>
            </div>

            {shipsInternationally && (
              <div>
                <label className="block text-[11px] text-[#5A6578] mb-1">
                  Destination Regions (comma-separated, e.g. "Worldwide" or "US, CA, GB")
                </label>
                <input
                  type="text"
                  value={shippingDestinations}
                  onChange={(e) => setShippingDestinations(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-[#E2DFD8] rounded-lg text-[#14243A] focus:border-[#14243A] focus:outline-hidden"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] text-[#5A6578] mb-1">
                Shipping Cost Description
              </label>
              <input
                type="text"
                placeholder="e.g. Free shipping domestic; $12 tracked international airmail"
                value={shippingCostDesc}
                onChange={(e) => setShippingCostDesc(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-[#E2DFD8] rounded-lg text-[#14243A] focus:border-[#14243A] focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="allowsCustom"
                checked={allowsCustomization}
                onChange={(e) => setAllowsCustomization(e.target.checked)}
                className="rounded border-[#E2DFD8] text-[#14243A] focus:ring-[#C5A572]"
              />
              <label htmlFor="allowsCustom" className="text-xs font-medium text-[#14243A] cursor-pointer">
                I can customize this product upon request (bespoke dimensions, colorway, engravings)
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-[#E2DFD8] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-[#283548]">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[#C5A572]" />
              <span className="font-medium">Zero listing fees · 100% direct trade</span>
            </div>

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
                disabled={isSubmitting || isCompressing}
                className="flex-1 sm:flex-none px-5 py-2 text-xs font-medium text-white bg-[#14243A] hover:bg-[#0E1B2D] rounded-lg transition-colors shadow-xs cursor-pointer text-center flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A572]" />
                    <span>{isEditing ? 'Saving Changes...' : 'Publishing...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isEditing ? 'Save Changes' : 'Publish Listing'}</span>
                    <Check className="w-3.5 h-3.5 text-[#C5A572]" />
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
