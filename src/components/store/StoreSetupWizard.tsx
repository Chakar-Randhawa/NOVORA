import React, { useState, useMemo } from 'react';
import {
  Store,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  ShieldCheck,
  Eye,
  Smartphone,
  Monitor,
  Plus,
  Trash2,
  X,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Storefront, StoreCategory, StorePolicies, Listing, UserProfile } from '../../types';

interface StoreSetupWizardProps {
  currentUser: UserProfile;
  existingStore?: Storefront | null;
  sellerListings: Listing[];
  onClose: () => void;
  onSave: (storeData: Partial<Storefront> & { sellerId: string; storeName: string; storeSlug: string }) => Promise<Storefront>;
  onViewStore: (store: Storefront) => void;
}

export const StoreSetupWizard: React.FC<StoreSetupWizardProps> = ({
  currentUser,
  existingStore,
  sellerListings,
  onClose,
  onSave,
  onViewStore
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [publishedStore, setPublishedStore] = useState<Storefront | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [copiedLink, setCopiedLink] = useState(false);

  // Form State
  const [storeName, setStoreName] = useState(existingStore?.storeName || `${currentUser.name}'s Studio`);
  const [storeSlug, setStoreSlug] = useState(
    existingStore?.storeSlug || (currentUser.username ? currentUser.username.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'my-artisan-shop')
  );
  const [tagline, setTagline] = useState(existingStore?.tagline || currentUser.sellerTagline || 'Authentic handcrafted creations.');
  const [description, setDescription] = useState(existingStore?.description || currentUser.bio || '');
  const [logoUrl, setLogoUrl] = useState(existingStore?.logoUrl || currentUser.avatarUrl || '');
  const [bannerUrl, setBannerUrl] = useState(existingStore?.bannerUrl || '');

  // Step 2: About
  const [story, setStory] = useState(existingStore?.story || '');
  const [country, setCountry] = useState(existingStore?.country || currentUser.country || 'US');
  const [city, setCity] = useState(existingStore?.city || currentUser.city || '');
  const [businessType, setBusinessType] = useState<Storefront['businessType']>(existingStore?.businessType || 'independent_maker');
  const [languagesStr, setLanguagesStr] = useState(existingStore?.languages?.join(', ') || currentUser.languages?.join(', ') || 'English');

  // Step 3: Custom Categories
  const [categories, setCategories] = useState<StoreCategory[]>(
    existingStore?.categories || [
      { id: 'cat_new', name: 'New Arrivals', description: 'Freshly created pieces' },
      { id: 'cat_custom', name: 'Custom Works', description: 'Made-to-order commissions' }
    ]
  );
  const [newCatName, setNewCatName] = useState('');

  // Step 4: Policies
  const [policies, setPolicies] = useState<StorePolicies>(
    existingStore?.policies || {
      shippingPolicy: 'Dispatched within 2-3 business days with international tracking provided.',
      returnsPolicy: '14-day return window from delivery date for items in original condition.',
      refundsPolicy: 'Full refund issued within 48 hours of return receipt or order cancellation.',
      customOrdersPolicy: 'Custom orders welcome. Please allow 1-2 weeks production time.',
      communicationPolicy: 'Seller responds to buyer messages within 24 hours.'
    }
  );

  // Step 5: Featured Content
  const [announcement, setAnnouncement] = useState(existingStore?.announcement || 'Welcome to our official NOVORA storefront! Direct from maker.');
  const [featuredListingIds, setFeaturedListingIds] = useState<string[]>(
    existingStore?.featuredListingIds || sellerListings.slice(0, 3).map(l => l.id)
  );

  // Calculate genuine completeness percentage based on filled fields
  const completenessPercent = useMemo(() => {
    let score = 0;
    const totalChecks = 10;
    if (storeName.trim().length > 2) score++;
    if (storeSlug.trim().length > 2) score++;
    if (tagline.trim().length > 5) score++;
    if (description.trim().length > 10) score++;
    if (logoUrl.trim().length > 5) score++;
    if (bannerUrl.trim().length > 5) score++;
    if (story.trim().length > 15) score++;
    if (categories.length > 0) score++;
    if (policies.shippingPolicy && policies.shippingPolicy.length > 10) score++;
    if (announcement.trim().length > 5) score++;
    return Math.round((score / totalChecks) * 100);
  }, [storeName, storeSlug, tagline, description, logoUrl, bannerUrl, story, categories, policies, announcement]);

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newCat: StoreCategory = {
      id: `cat_${Date.now()}`,
      name: newCatName.trim()
    };
    setCategories(prev => [...prev, newCat]);
    setNewCatName('');
  };

  const handleRemoveCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const handleToggleFeaturedListing = (id: string) => {
    setFeaturedListingIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handlePublish = async () => {
    if (!storeName.trim() || !storeSlug.trim()) {
      alert('Please provide a store name and web slug.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<Storefront> & { sellerId: string; storeName: string; storeSlug: string } = {
        id: existingStore?.id || currentUser.id,
        sellerId: currentUser.id,
        sellerName: currentUser.name,
        storeName: storeName.trim(),
        storeSlug: storeSlug.trim().toLowerCase(),
        tagline: tagline.trim(),
        description: description.trim(),
        logoUrl: logoUrl.trim(),
        bannerUrl: bannerUrl.trim(),
        story: story.trim(),
        country,
        city,
        businessType,
        languages: languagesStr.split(',').map(s => s.trim()).filter(Boolean),
        categories,
        policies,
        announcement: announcement.trim(),
        featuredListingIds,
        status: 'active',
        completenessPercent
      };

      const result = await onSave(payload);
      setPublishedStore(result);
      setCurrentStep(7); // Show success screen
    } catch (err) {
      alert('Failed to publish store. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = () => {
    const slug = publishedStore?.storeSlug || storeSlug;
    const url = `${window.location.origin}${window.location.pathname}?store=${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const STEPS = [
    { num: 1, title: 'Store Identity' },
    { num: 2, title: 'About & Maker' },
    { num: 3, title: 'Collections' },
    { num: 4, title: 'Policies' },
    { num: 5, title: 'Featured' },
    { num: 6, title: 'Preview' },
    { num: 7, title: 'Published' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-[#E5E7EB] shadow-2xl relative overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Wizard Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between shrink-0 bg-[#FAFAF8]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] text-[#4057D6] flex items-center justify-center shadow-2xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#17191F]">
                {existingStore ? 'Storefront Studio & Settings' : 'Set Up Your Independent Storefront'}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-[#646B76]">
                <span>Step {currentStep} of {STEPS.length - 1}</span>
                <span>·</span>
                <span className="font-medium text-emerald-700">Completeness: {completenessPercent}%</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#646B76] hover:text-[#17191F] hover:bg-[#E5E7EB] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        {currentStep < 7 && (
          <div className="bg-[#F9FAFB] border-b border-[#E5E7EB] px-6 py-2.5 flex items-center justify-between overflow-x-auto text-[11px]">
            {STEPS.slice(0, 6).map((s) => (
              <div
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                className={`flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap px-2 py-1 rounded-md ${
                  currentStep === s.num
                    ? 'font-bold text-[#4057D6] bg-white shadow-2xs'
                    : currentStep > s.num
                    ? 'text-emerald-700 font-medium'
                    : 'text-[#9CA3AF]'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                  currentStep === s.num
                    ? 'bg-[#4057D6] text-white'
                    : currentStep > s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#E5E7EB] text-[#646B76]'
                }`}>
                  {currentStep > s.num ? '✓' : s.num}
                </span>
                <span>{s.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          
          {/* STEP 1: IDENTITY */}
          {currentStep === 1 && (
            <div className="space-y-5 max-w-2xl">
              <div>
                <h3 className="text-base font-semibold text-[#17191F]">Store Branding & URL</h3>
                <p className="text-xs text-[#646B76] mt-0.5">Define how your independent storefront appears to buyers worldwide.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-medium text-[#374151] block mb-1">Store Display Name *</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => {
                      setStoreName(e.target.value);
                      if (!existingStore) {
                        setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30));
                      }
                    }}
                    placeholder="e.g. Nordic Leather Studio"
                    className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-medium text-[#374151] block mb-1">Store Slug / Public URL Handle *</label>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 bg-[#F3F4F6] border border-r-0 border-[#E5E7EB] rounded-l-xl text-[#646B76] text-xs font-mono">
                      novora.com/?store=
                    </span>
                    <input
                      type="text"
                      value={storeSlug}
                      onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="nordic-leather"
                      className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-r-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-medium text-[#374151] block mb-1">Brand Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Hand-stitched full-grain accessories made in Stockholm."
                    className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-medium text-[#374151] block mb-1">Store Overview & Bio</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief introduction for buyers discovering your shop..."
                    className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-[#374151] block mb-1">Logo / Avatar Image URL</label>
                    <input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-[#374151] block mb-1">Banner Image URL</label>
                    <input
                      type="url"
                      value={bannerUrl}
                      onChange={(e) => setBannerUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ABOUT & STORY */}
          {currentStep === 2 && (
            <div className="space-y-5 max-w-2xl text-xs">
              <div>
                <h3 className="text-base font-semibold text-[#17191F]">Maker Story & Origin</h3>
                <p className="text-xs text-[#646B76] mt-0.5">Share your origins, craft techniques, and workshop details with buyers.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-medium text-[#374151] block mb-1">Full Workshop Story</label>
                  <textarea
                    rows={5}
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    placeholder="Tell your story. When did you start? What materials do you source? Why should buyers choose your work?"
                    className="w-full p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-[#374151] block mb-1">Business / Maker Type</label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value as any)}
                      className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden cursor-pointer"
                    >
                      <option value="independent_maker">Independent Artisan / Maker</option>
                      <option value="artisan_studio">Craft Studio / Workshop</option>
                      <option value="boutique">Curated Boutique</option>
                      <option value="digital_creator">Digital Creator / Designer</option>
                      <option value="service_agency">Specialist / Service Agency</option>
                      <option value="other">Other Independent Enterprise</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-medium text-[#374151] block mb-1">Languages Spoken</label>
                    <input
                      type="text"
                      value={languagesStr}
                      onChange={(e) => setLanguagesStr(e.target.value)}
                      placeholder="English, French, Spanish..."
                      className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-[#374151] block mb-1">Workshop City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Kyoto"
                      className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-[#374151] block mb-1">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. Japan"
                      className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CUSTOM CATEGORIES */}
          {currentStep === 3 && (
            <div className="space-y-5 max-w-2xl text-xs">
              <div>
                <h3 className="text-base font-semibold text-[#17191F]">Store Collections & Sections</h3>
                <p className="text-xs text-[#646B76] mt-0.5">Create your own branded collections to organize your listings inside your storefront.</p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="New collection name (e.g. Summer Ceramics, Limited Editions)"
                  className="flex-1 p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-[#17191F] hover:bg-[#27272A] text-white rounded-xl font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Collection</span>
                </button>
              </div>

              <div className="space-y-2 pt-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-3 bg-[#FAFAF8] rounded-xl border border-[#E5E7EB] flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[#17191F] text-xs">{cat.name}</span>
                      {cat.description && <p className="text-[11px] text-[#646B76]">{cat.description}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(cat.id)}
                      className="p-1.5 text-[#9CA3AF] hover:text-[#EF4444] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: POLICIES */}
          {currentStep === 4 && (
            <div className="space-y-5 max-w-2xl text-xs">
              <div>
                <h3 className="text-base font-semibold text-[#17191F]">Store Fulfillment & Return Policies</h3>
                <p className="text-xs text-[#646B76] mt-0.5">Clear policies foster trust with international buyers and prevent disputes.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-medium text-[#374151] block mb-1">Shipping & Packaging</label>
                  <textarea
                    rows={2}
                    value={policies.shippingPolicy}
                    onChange={(e) => setPolicies({ ...policies, shippingPolicy: e.target.value })}
                    className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-medium text-[#374151] block mb-1">Returns & Exchanges Policy</label>
                  <textarea
                    rows={2}
                    value={policies.returnsPolicy}
                    onChange={(e) => setPolicies({ ...policies, returnsPolicy: e.target.value })}
                    className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-medium text-[#374151] block mb-1">Refunds & Cancellations</label>
                  <textarea
                    rows={2}
                    value={policies.refundsPolicy}
                    onChange={(e) => setPolicies({ ...policies, refundsPolicy: e.target.value })}
                    className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-medium text-[#374151] block mb-1">Custom Commissions / Made-to-Order Terms</label>
                  <textarea
                    rows={2}
                    value={policies.customOrdersPolicy}
                    onChange={(e) => setPolicies({ ...policies, customOrdersPolicy: e.target.value })}
                    className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: FEATURED CONTENT */}
          {currentStep === 5 && (
            <div className="space-y-5 max-w-2xl text-xs">
              <div>
                <h3 className="text-base font-semibold text-[#17191F]">Featured Announcement & Showcase</h3>
                <p className="text-xs text-[#646B76] mt-0.5">Select listings to spotlight on your storefront homepage.</p>
              </div>

              <div>
                <label className="font-medium text-[#374151] block mb-1">Store Announcement Banner</label>
                <input
                  type="text"
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="e.g. Free shipping on all international orders over $100 this week!"
                  className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-medium text-[#374151] block mb-2">Select Featured Items ({featuredListingIds.length} selected)</label>
                {sellerListings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                    {sellerListings.map((l) => {
                      const isSelected = featuredListingIds.includes(l.id);
                      return (
                        <div
                          key={l.id}
                          onClick={() => handleToggleFeaturedListing(l.id)}
                          className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#4057D6] bg-[#EEF2FF]'
                              : 'border-[#E5E7EB] bg-white hover:border-[#9CA3AF]'
                          }`}
                        >
                          <div className="w-12 h-12 rounded-lg bg-[#F3F4F6] overflow-hidden shrink-0">
                            {l.images && l.images[0] && (
                              <img src={l.images[0]} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-xs text-[#17191F] truncate">{l.title}</p>
                            <p className="text-[11px] text-[#646B76]">${l.price}</p>
                          </div>
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                            isSelected ? 'bg-[#4057D6] text-white' : 'border border-[#D1D5DB]'
                          }`}>
                            {isSelected ? '✓' : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[#646B76] p-4 bg-[#FAFAF8] rounded-xl border border-[#E5E7EB]">
                    You haven't created any listings yet. You can still publish your storefront and feature items later!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 6: PREVIEW */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[#17191F]">Live Storefront Mockup Preview</h3>
                  <p className="text-xs text-[#646B76]">Preview your store layout before publishing to the global directory.</p>
                </div>

                <div className="flex items-center gap-1 bg-[#F3F4F6] p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      previewDevice === 'desktop' ? 'bg-white shadow-2xs text-[#17191F]' : 'text-[#646B76]'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      previewDevice === 'mobile' ? 'bg-white shadow-2xs text-[#17191F]' : 'text-[#646B76]'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile</span>
                  </button>
                </div>
              </div>

              {/* Preview Canvas */}
              <div className="border border-[#E5E7EB] rounded-2xl p-4 bg-[#F9FAFB] flex justify-center">
                <div className={`bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden transition-all ${
                  previewDevice === 'mobile' ? 'w-[375px]' : 'w-full'
                }`}>
                  {/* Mock Store Header */}
                  <div className="h-32 bg-linear-to-r from-[#17191F] to-[#2A303C] p-4 flex flex-col justify-end text-white">
                    <span className="text-[10px] font-mono text-white/60">Independent Maker</span>
                    <h4 className="text-base font-bold">{storeName || 'My Store'}</h4>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-[#4B5563]">{tagline || 'Crafted with care.'}</p>
                    {announcement && (
                      <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800">
                        {announcement}
                      </div>
                    )}
                    <div className="pt-2 border-t border-[#F3F4F6] flex items-center justify-between text-xs text-[#646B76]">
                      <span>{city ? `${city}, ` : ''}{country}</span>
                      <span className="text-[#4057D6]">@{storeSlug}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: PUBLISHED SUCCESS */}
          {currentStep === 7 && publishedStore && (
            <div className="text-center py-10 px-4 space-y-5 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#17191F]">
                Your Storefront is Live on NOVORA!
              </h3>
              <p className="text-xs sm:text-sm text-[#646B76] leading-relaxed">
                Your store has been published with <strong>{completenessPercent}% completeness</strong>. Global buyers can now discover your curated workshop and purchase directly.
              </p>

              <div className="p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] flex items-center justify-between text-xs font-mono">
                <span className="truncate max-w-[280px] text-[#4057D6]">
                  novora.com/?store={publishedStore.storeSlug}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-white border border-[#E5E7EB] hover:bg-[#F3F4F6] rounded-lg font-sans font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => onViewStore(publishedStore)}
                  className="px-5 py-2.5 bg-[#17191F] hover:bg-[#27272A] text-white rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Public Storefront</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-white border border-[#E5E7EB] hover:bg-[#F3F4F6] text-[#374151] rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Footer Controls */}
        {currentStep < 7 && (
          <div className="px-6 py-4 border-t border-[#E5E7EB] bg-[#FAFAF8] flex items-center justify-between shrink-0">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-4 py-2 text-xs font-medium text-[#646B76] hover:text-[#17191F] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="px-5 py-2 bg-[#17191F] hover:bg-[#27272A] text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSaving}
                onClick={handlePublish}
                className="px-6 py-2 bg-[#4057D6] hover:bg-[#3446B8] text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <span>{isSaving ? 'Publishing...' : 'Publish Storefront'}</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
