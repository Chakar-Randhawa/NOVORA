import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  ExternalLink,
  Search,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Save,
  RotateCcw
} from 'lucide-react';
import { Storefront, StoreCategory, StorePolicies, Listing, UserProfile } from '../../types';
import { fetchStoreBySlug } from '../../services/firebase';
import { COUNTRIES } from '../../data/countries';

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
  const [saveError, setSaveError] = useState<string | null>(null);
  const [publishedStore, setPublishedStore] = useState<Storefront | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [draftRestoredBanner, setDraftRestoredBanner] = useState(false);

  // Slug Availability State
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [slugMessage, setSlugMessage] = useState<string>('');
  const slugDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Form State
  const [storeName, setStoreName] = useState(existingStore?.storeName || `${currentUser.name}'s Studio`);
  const [storeSlug, setStoreSlug] = useState(
    existingStore?.storeSlug || (currentUser.username ? currentUser.username.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'my-artisan-shop')
  );
  const [tagline, setTagline] = useState(existingStore?.tagline || currentUser.sellerTagline || 'Authentic handcrafted creations.');
  const [description, setDescription] = useState(existingStore?.description || currentUser.bio || '');
  const [logoUrl, setLogoUrl] = useState(existingStore?.logoUrl || currentUser.avatarUrl || '');
  const [bannerUrl, setBannerUrl] = useState(existingStore?.bannerUrl || '');

  // Step 2: About & Maker Story
  const [story, setStory] = useState(existingStore?.story || '');
  const [country, setCountry] = useState(existingStore?.country || currentUser.country || 'US');
  const [city, setCity] = useState(existingStore?.city || currentUser.city || '');
  const [businessType, setBusinessType] = useState<Storefront['businessType']>(existingStore?.businessType || 'independent_maker');
  const [languagesStr, setLanguagesStr] = useState(existingStore?.languages?.join(', ') || currentUser.languages?.join(', ') || 'English');

  // Step 3: Custom Collections / Categories
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
  const [featuredSearch, setFeaturedSearch] = useState('');

  // Draft key
  const draftKey = `novora_store_draft_${currentUser.id}`;

  // Check for saved local draft on mount
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem(draftKey);
      if (savedRaw && !existingStore) {
        const d = JSON.parse(savedRaw);
        if (d.storeName) setStoreName(d.storeName);
        if (d.storeSlug) setStoreSlug(d.storeSlug);
        if (d.tagline) setTagline(d.tagline);
        if (d.description) setDescription(d.description);
        if (d.logoUrl) setLogoUrl(d.logoUrl);
        if (d.bannerUrl) setBannerUrl(d.bannerUrl);
        if (d.story) setStory(d.story);
        if (d.country) setCountry(d.country);
        if (d.city) setCity(d.city);
        if (d.businessType) setBusinessType(d.businessType);
        if (d.categories) setCategories(d.categories);
        if (d.policies) setPolicies(d.policies);
        if (d.announcement) setAnnouncement(d.announcement);
        if (d.featuredListingIds) setFeaturedListingIds(d.featuredListingIds);
        setDraftRestoredBanner(true);
      }
    } catch {
      // ignore
    }
  }, [draftKey, existingStore]);

  // Debounced Slug Availability Checking
  useEffect(() => {
    const clean = storeSlug.trim().toLowerCase();
    if (!clean) {
      setSlugStatus('invalid');
      setSlugMessage('Slug cannot be empty');
      return;
    }
    if (clean.length < 3) {
      setSlugStatus('invalid');
      setSlugMessage('Slug must be at least 3 characters');
      return;
    }
    if (!/^[a-z0-9-]+$/.test(clean)) {
      setSlugStatus('invalid');
      setSlugMessage('Slug may only contain letters, numbers, and hyphens');
      return;
    }

    // If existing store matches this slug, it's valid
    if (existingStore && existingStore.storeSlug === clean) {
      setSlugStatus('available');
      setSlugMessage('Current registered store handle');
      return;
    }

    setSlugStatus('checking');
    setSlugMessage('Verifying URL availability...');

    if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current);
    slugDebounceRef.current = setTimeout(async () => {
      try {
        const found = await fetchStoreBySlug(clean);
        if (found && found.sellerId !== currentUser.id) {
          setSlugStatus('taken');
          setSlugMessage(`novora.com/?store=${clean} is already claimed by another seller`);
        } else {
          setSlugStatus('available');
          setSlugMessage(`novora.com/?store=${clean} is available!`);
        }
      } catch {
        // If network issue, default to available
        setSlugStatus('available');
        setSlugMessage(`novora.com/?store=${clean} ready`);
      }
    }, 450);

    return () => {
      if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current);
    };
  }, [storeSlug, currentUser.id, existingStore]);

  // Save draft to localStorage whenever fields change
  const saveDraftToStorage = () => {
    try {
      const payload = {
        storeName,
        storeSlug,
        tagline,
        description,
        logoUrl,
        bannerUrl,
        story,
        country,
        city,
        businessType,
        categories,
        policies,
        announcement,
        featuredListingIds,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(draftKey, JSON.stringify(payload));
    } catch {
      // ignore
    }
  };

  const handleStepChange = (newStep: number) => {
    saveDraftToStorage();
    setCurrentStep(newStep);
  };

  // Calculate genuine completeness percentage based on filled fields
  const completenessPercent = useMemo(() => {
    let score = 0;
    const totalChecks = 10;
    if (storeName.trim().length > 2) score++;
    if (storeSlug.trim().length >= 3 && slugStatus === 'available') score++;
    if (tagline.trim().length > 5) score++;
    if (description.trim().length > 10) score++;
    if (logoUrl.trim().length > 5) score++;
    if (bannerUrl.trim().length > 5) score++;
    if (story.trim().length > 15) score++;
    if (categories.length > 0) score++;
    if (policies.shippingPolicy && policies.shippingPolicy.length > 10) score++;
    if (announcement.trim().length > 5) score++;
    return Math.round((score / totalChecks) * 100);
  }, [storeName, storeSlug, slugStatus, tagline, description, logoUrl, bannerUrl, story, categories, policies, announcement]);

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
      setSaveError('Please provide a store name and handle slug.');
      return;
    }
    if (slugStatus === 'taken') {
      setSaveError('The requested store URL is taken. Please select an available slug.');
      return;
    }
    if (slugStatus === 'invalid') {
      setSaveError('Please enter a valid store slug (letters, numbers, hyphens).');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
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
      localStorage.removeItem(draftKey);
      setCurrentStep(7); // Show success screen
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to publish store. Please try again.');
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

  const handleCloseAttempt = () => {
    if (currentStep < 7 && (storeName !== `${currentUser.name}'s Studio` || description || story)) {
      saveDraftToStorage();
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  const filteredSellerListings = useMemo(() => {
    if (!featuredSearch.trim()) return sellerListings;
    const q = featuredSearch.toLowerCase();
    return sellerListings.filter(l => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q));
  }, [sellerListings, featuredSearch]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto novora-animate-backdrop">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-[#E5E7EB] shadow-2xl relative overflow-hidden my-auto max-h-[94vh] flex flex-col novora-animate-modal">
        
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

          <div className="flex items-center gap-2">
            {currentStep < 7 && (
              <button
                type="button"
                onClick={() => {
                  saveDraftToStorage();
                  alert('Draft saved to browser storage.');
                }}
                className="px-2.5 py-1.5 text-xs text-[#646B76] hover:text-[#17191F] hover:bg-[#E5E7EB] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                title="Save draft"
              >
                <Save className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Save Draft</span>
              </button>
            )}
            <button
              onClick={handleCloseAttempt}
              className="p-1.5 text-[#646B76] hover:text-[#17191F] hover:bg-[#E5E7EB] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Draft Restored Banner */}
        {draftRestoredBanner && currentStep === 1 && (
          <div className="bg-blue-50 border-b border-blue-100 px-6 py-2 flex items-center justify-between text-xs text-blue-900">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Restored your saved setup draft from previous session.</span>
            </span>
            <button
              onClick={() => {
                localStorage.removeItem(draftKey);
                setDraftRestoredBanner(false);
              }}
              className="text-[11px] text-blue-700 hover:underline cursor-pointer ml-3 shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Step Progress Bar */}
        {currentStep < 7 && (
          <div className="bg-[#F9FAFB] border-b border-[#E5E7EB] px-6 py-2.5 flex items-center justify-between overflow-x-auto text-[11px]">
            {STEPS.slice(0, 6).map((s) => (
              <div
                key={s.num}
                onClick={() => handleStepChange(s.num)}
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
          
          {saveError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

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
                    className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden text-xs"
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

                  {/* Slug availability indicator */}
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                    {slugStatus === 'checking' && (
                      <span className="text-[#646B76] flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin text-[#4057D6]" />
                        <span>{slugMessage}</span>
                      </span>
                    )}
                    {slugStatus === 'available' && (
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{slugMessage}</span>
                      </span>
                    )}
                    {slugStatus === 'taken' && (
                      <span className="text-rose-700 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>{slugMessage}</span>
                      </span>
                    )}
                    {slugStatus === 'invalid' && (
                      <span className="text-amber-700 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>{slugMessage}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-[#374151] block mb-1">Brand Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Hand-stitched full-grain accessories made in Stockholm."
                    className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden text-xs"
                  />
                </div>

                <div>
                  <label className="font-medium text-[#374151] block mb-1">Store Overview & Bio</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief introduction for buyers discovering your shop..."
                    className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden text-xs"
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
                      className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-[#374151] block mb-1">Banner Image URL</label>
                    <input
                      type="url"
                      value={bannerUrl}
                      onChange={(e) => setBannerUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden text-xs"
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
                    className="w-full p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden leading-relaxed text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-[#374151] block mb-1">Business / Maker Type</label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value as any)}
                      className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden text-xs"
                    >
                      <option value="independent_maker">Independent Maker / Artisan</option>
                      <option value="artisan_studio">Artisan Studio / Workshop</option>
                      <option value="boutique">Curated Boutique</option>
                      <option value="digital_creator">Digital Creator / Designer</option>
                      <option value="service_agency">Service Specialist</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-medium text-[#374151] block mb-1">Country / Territory</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden text-xs"
                    >
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-[#374151] block mb-1">City or Workshop Location</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Stockholm, Sweden"
                      className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-[#374151] block mb-1">Languages Spoken (comma separated)</label>
                    <input
                      type="text"
                      value={languagesStr}
                      onChange={(e) => setLanguagesStr(e.target.value)}
                      placeholder="English, Swedish, German"
                      className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: COLLECTIONS */}
          {currentStep === 3 && (
            <div className="space-y-5 max-w-2xl text-xs">
              <div>
                <h3 className="text-base font-semibold text-[#17191F]">Storefront Collections & Categories</h3>
                <p className="text-xs text-[#646B76] mt-0.5">Organize your offerings into custom sections on your public storefront.</p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
                    placeholder="Add collection title (e.g. Hand-Stitched Wallets)..."
                    className="flex-1 p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-4 py-2 bg-[#17191F] text-white rounded-xl font-medium hover:bg-[#27272A] transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  {categories.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#17191F]">{c.name}</span>
                        {c.description && <span className="text-[11px] text-[#646B76]">· {c.description}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(c.id)}
                        className="p-1 text-[#9CA3AF] hover:text-rose-600 transition-colors cursor-pointer"
                        title="Remove category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: POLICIES */}
          {currentStep === 4 && (
            <div className="space-y-5 max-w-2xl text-xs">
              <div>
                <h3 className="text-base font-semibold text-[#17191F]">Store Policies & Terms</h3>
                <p className="text-xs text-[#646B76] mt-0.5">Transparent guidelines build high buyer trust for international orders.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-medium text-[#374151] block mb-1">Shipping & Dispatch Terms *</label>
                  <textarea
                    rows={2}
                    value={policies.shippingPolicy || ''}
                    onChange={(e) => setPolicies({ ...policies, shippingPolicy: e.target.value })}
                    className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden text-xs"
                  />
                </div>

                <div>
                  <label className="font-medium text-[#374151] block mb-1">Return Window & Eligibility</label>
                  <textarea
                    rows={2}
                    value={policies.returnsPolicy || ''}
                    onChange={(e) => setPolicies({ ...policies, returnsPolicy: e.target.value })}
                    className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden text-xs"
                  />
                </div>

                <div>
                  <label className="font-medium text-[#374151] block mb-1">Refund Protocol</label>
                  <textarea
                    rows={2}
                    value={policies.refundsPolicy || ''}
                    onChange={(e) => setPolicies({ ...policies, refundsPolicy: e.target.value })}
                    className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden text-xs"
                  />
                </div>

                <div>
                  <label className="font-medium text-[#374151] block mb-1">Custom / Bespoke Commission Policy</label>
                  <textarea
                    rows={2}
                    value={policies.customOrdersPolicy || ''}
                    onChange={(e) => setPolicies({ ...policies, customOrdersPolicy: e.target.value })}
                    className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden text-xs"
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
                  className="w-full p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:border-[#4057D6] focus:bg-white focus:outline-hidden text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-medium text-[#374151]">
                    Select Featured Items ({featuredListingIds.length} selected)
                  </label>
                  {sellerListings.length > 4 && (
                    <div className="relative w-48">
                      <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-[#9CA3AF]" />
                      <input
                        type="text"
                        value={featuredSearch}
                        onChange={(e) => setFeaturedSearch(e.target.value)}
                        placeholder="Filter listings..."
                        className="w-full pl-7 pr-2 py-1 text-[11px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-hidden"
                      />
                    </div>
                  )}
                </div>

                {sellerListings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                    {filteredSellerListings.map((l) => {
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
                            {l.images && l.images[0] ? (
                              <img src={l.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-[#E5E7EB]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-xs text-[#17191F] truncate">{l.title}</p>
                            <p className="text-[11px] text-[#646B76] font-mono">${l.price} {l.currency}</p>
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
                  <div className="text-[#646B76] p-5 bg-[#FAFAF8] rounded-xl border border-[#E5E7EB] text-center space-y-1">
                    <p className="font-medium text-[#17191F]">No listings published yet</p>
                    <p className="text-[11px]">You can complete and publish your storefront now, then pin listings after creating them in your Seller Studio.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 6: PREVIEW */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[#17191F]">Live Storefront Simulator Preview</h3>
                  <p className="text-xs text-[#646B76]">Preview your store layout before publishing to the global marketplace.</p>
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
                  {/* Banner */}
                  <div className="h-32 sm:h-40 bg-[#17191F] relative overflow-hidden">
                    {bannerUrl ? (
                      <img src={bannerUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-linear-to-r from-[#17191F] via-[#2A303C] to-[#1E293B]" />
                    )}
                  </div>

                  {/* Header info */}
                  <div className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-start gap-4 -mt-10 sm:-mt-12">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 border-white shadow-md overflow-hidden shrink-0">
                        {logoUrl ? (
                          <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#EEF2FF] text-[#4057D6] font-bold text-xl flex items-center justify-center">
                            {storeName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="pt-8 sm:pt-10 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base sm:text-lg font-bold text-[#17191F] truncate">{storeName}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Verified
                          </span>
                        </div>
                        <p className="text-xs text-[#646B76]">{tagline}</p>
                      </div>
                    </div>

                    {announcement && (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{announcement}</span>
                      </div>
                    )}

                    <div className="text-xs text-[#4B5563] leading-relaxed">
                      {description}
                    </div>

                    <div className="pt-3 border-t border-[#F3F4F6] flex items-center justify-between text-xs text-[#646B76]">
                      <span>{city ? `${city}, ` : ''}{country}</span>
                      <span className="text-[#4057D6] font-mono">novora.com/?store={storeSlug}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: PUBLISHED SUCCESS */}
          {currentStep === 7 && publishedStore && (
            <div className="text-center py-10 px-4 space-y-5 max-w-lg mx-auto novora-animate-modal">
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
                  className="px-3 py-1.5 bg-white border border-[#E5E7EB] hover:bg-[#F3F4F6] rounded-lg font-sans font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 active:scale-[0.98]"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => onViewStore(publishedStore)}
                  className="px-5 py-2.5 bg-[#17191F] hover:bg-[#27272A] text-white rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Public Storefront</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-white border border-[#E5E7EB] hover:bg-[#F3F4F6] text-[#374151] rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer active:scale-[0.98]"
                >
                  Done
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Footer Controls */}
        {currentStep < 7 && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-[#E5E7EB] bg-[#FAFAF8] flex items-center justify-between shrink-0">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => handleStepChange(currentStep - 1)}
              className="px-4 py-2 text-xs font-medium text-[#646B76] hover:text-[#17191F] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            {currentStep < 6 ? (
              <button
                type="button"
                disabled={currentStep === 1 && (slugStatus === 'taken' || slugStatus === 'checking')}
                onClick={() => handleStepChange(currentStep + 1)}
                className="px-5 py-2 bg-[#17191F] hover:bg-[#27272A] text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSaving || slugStatus === 'taken'}
                onClick={handlePublish}
                className="px-6 py-2 bg-[#4057D6] hover:bg-[#3446B8] text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing to NOVORA...</span>
                  </>
                ) : (
                  <>
                    <span>Publish Storefront</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Unsaved Changes Exit Confirmation Dialog */}
        {showExitConfirm && (
          <div className="absolute inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-[#E5E7EB] text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-[#17191F]">Unsaved Store Changes</h4>
              <p className="text-xs text-[#646B76] leading-relaxed">
                Your in-progress store configuration has been safely saved to your local browser draft.
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className="px-3.5 py-2 text-xs font-medium bg-[#F3F4F6] text-[#374151] rounded-xl hover:bg-[#E5E7EB] transition-colors cursor-pointer"
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-medium bg-[#17191F] text-white rounded-xl hover:bg-[#27272A] transition-colors cursor-pointer"
                >
                  Exit Wizard
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
