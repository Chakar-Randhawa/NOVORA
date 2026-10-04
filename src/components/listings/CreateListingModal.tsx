import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';
import { Listing, ListingType, ProductCondition, UserProfile } from '../../types';
import { CATEGORIES } from '../../data/categories';
import { COUNTRIES, CURRENCIES } from '../../data/countries';
import { compressImageToDataUrl } from '../../services/storage';

interface CreateListingModalProps {
  currentUser: UserProfile | null;
  onClose: () => void;
  onSubmit: (listing: Listing) => void;
  onOpenAuth: (mode?: 'signin' | 'register') => void;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  currentUser,
  onClose,
  onSubmit,
  onOpenAuth
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(CATEGORIES[0].id);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('');
  const [currency, setCurrency] = useState(currentUser?.preferredCurrency || 'USD');
  const [condition, setCondition] = useState<ProductCondition>('new');
  const [listingType, setListingType] = useState<ListingType>('handmade');
  const [customAttributes, setCustomAttributes] = useState<Record<string, any>>({});
  const [images, setImages] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [shipsInternationally, setShipsInternationally] = useState(true);
  const [shippingDestinations, setShippingDestinations] = useState('Worldwide');
  const [shippingCostDesc, setShippingCostDesc] = useState('');
  const [allowsCustomization, setAllowsCustomization] = useState(false);
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
            Sign in to Publish a Listing
          </h3>
          <p className="text-xs text-[#646B76] leading-relaxed">
            You need a free registered account to publish offerings, manage inventory, and receive direct buyer inquiries.
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

  const handleSubmit = (e: React.FormEvent) => {
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

    onSubmit(newListing);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-[#E5E7EB] shadow-2xl relative overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between shrink-0 bg-[#FAFAF8]">
          <div>
            <h2 className="text-base font-semibold text-[#17191F]">Publish New Listing</h2>
            <p className="text-xs text-[#646B76]">
              Category-tailored dynamic fields · Zero listing fees
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Category Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#17191F] uppercase tracking-wider">
              Marketplace Category
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full text-xs p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#17191F] font-medium focus:border-[#4057D6] focus:outline-hidden cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#646B76]">{currentCategory.description}</p>
          </div>

          {/* Title & Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#17191F] mb-1">
                Listing Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hand-Thrown Stoneware Ceramic Vase"
                className="w-full text-xs p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#17191F] focus:border-[#4057D6] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#17191F] mb-1">
                Detailed Description *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide accurate, authentic information about your item, history, materials, and origin..."
                className="w-full text-xs p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#17191F] focus:border-[#4057D6] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Pricing & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#17191F] mb-1">
                Price *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full text-xs p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#17191F] font-mono focus:border-[#4057D6] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#17191F] mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#17191F] font-mono focus:border-[#4057D6] focus:outline-hidden cursor-pointer"
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
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ProductCondition)}
                className="w-full text-xs p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#17191F] focus:border-[#4057D6] focus:outline-hidden cursor-pointer"
              >
                <option value="new">Brand New</option>
                <option value="like_new">Like New / Open Box</option>
                <option value="excellent">Excellent Condition</option>
                <option value="good">Good (Light Wear)</option>
                <option value="fair">Fair (Functional)</option>
                <option value="not_applicable">N/A (Digital / Service)</option>
              </select>
            </div>
          </div>

          {/* DYNAMIC CATEGORY-SPECIFIC FIELDS */}
          <div className="p-4 bg-[#FAFAF8] rounded-xl border border-[#E5E7EB] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[#17191F] uppercase tracking-wider">
                Category Attributes: {currentCategory.name}
              </h4>
              <span className="text-[10px] text-[#646B76]">Specialized fields</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentCategory.customFields.map((field) => (
                <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-medium text-[#374151] mb-1">
                    {field.label} {field.required && <span className="text-rose-600">*</span>}
                  </label>

                  {field.type === 'select' && (
                    <select
                      value={customAttributes[field.key] || ''}
                      onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-[#E5E7EB] rounded-lg text-[#17191F] focus:border-[#4057D6] focus:outline-hidden"
                    >
                      <option value="">Select option...</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}

                  {field.type === 'text' && (
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={customAttributes[field.key] || ''}
                      onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-[#E5E7EB] rounded-lg text-[#17191F] focus:border-[#4057D6] focus:outline-hidden"
                    />
                  )}

                  {field.type === 'number' && (
                    <input
                      type="number"
                      placeholder={field.placeholder}
                      value={customAttributes[field.key] || ''}
                      onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-[#E5E7EB] rounded-lg text-[#17191F] focus:border-[#4057D6] focus:outline-hidden"
                    />
                  )}

                  {field.type === 'textarea' && (
                    <textarea
                      rows={2}
                      placeholder={field.placeholder}
                      value={customAttributes[field.key] || ''}
                      onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-[#E5E7EB] rounded-lg text-[#17191F] focus:border-[#4057D6] focus:outline-hidden"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Image Upload with Client Compression */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-[#17191F]">
                Listing Images ({images.length}/5)
              </label>
              <span className="text-[11px] text-[#646B76]">
                Client-compressed (Zero cloud storage fees)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-[#E5E7EB] group">
                  <img src={img} alt="Upload preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-md transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {images.length < 5 && (
                <label className="border-2 border-dashed border-[#E5E7EB] hover:border-[#17191F] rounded-lg aspect-square flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-colors bg-[#F9FAFB]">
                  <Upload className="w-5 h-5 text-[#9CA3AF] mb-1" />
                  <span className="text-[11px] font-medium text-[#4B5563]">
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
          <div className="p-4 bg-[#FAFAF8] rounded-xl border border-[#E5E7EB] space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="shipsIntl"
                checked={shipsInternationally}
                onChange={(e) => setShipsInternationally(e.target.checked)}
                className="rounded border-[#E5E7EB] text-[#4057D6]"
              />
              <label htmlFor="shipsIntl" className="text-xs font-medium text-[#17191F] cursor-pointer">
                Ships Internationally / Available Worldwide
              </label>
            </div>

            {shipsInternationally && (
              <div>
                <label className="block text-[11px] text-[#646B76] mb-1">
                  Destination Regions (comma-separated, e.g. "Worldwide" or "US, CA, GB")
                </label>
                <input
                  type="text"
                  value={shippingDestinations}
                  onChange={(e) => setShippingDestinations(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-[#E5E7EB] rounded-lg text-[#17191F]"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] text-[#646B76] mb-1">
                Shipping Cost Description
              </label>
              <input
                type="text"
                placeholder="e.g. Free shipping domestic; $12 tracked international airmail"
                value={shippingCostDesc}
                onChange={(e) => setShippingCostDesc(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-[#E5E7EB] rounded-lg text-[#17191F]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="allowsCustom"
                checked={allowsCustomization}
                onChange={(e) => setAllowsCustomization(e.target.checked)}
                className="rounded border-[#E5E7EB] text-[#4057D6]"
              />
              <label htmlFor="allowsCustom" className="text-xs font-medium text-[#17191F] cursor-pointer">
                I can customize this product upon request (bespoke dimensions, colorway, engravings)
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[#059669]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Zero listing fees · 100% direct trade</span>
            </div>

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
                className="px-5 py-2 text-xs font-medium text-white bg-[#17191F] hover:bg-[#27272A] rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Publish Listing
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
