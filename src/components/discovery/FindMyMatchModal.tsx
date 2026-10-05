import React, { useState, useEffect } from 'react';
import {
  X,
  Compass,
  ArrowRight,
  Sparkles,
  CheckCircle,
  AlertCircle,
  DollarSign,
  MapPin,
  Tag,
  ArrowUpRight,
  History
} from 'lucide-react';
import { Listing, MatchResult } from '../../types';
import { parseNaturalNeed, matchNeedToListings, ParsedNeed } from '../../services/discoveryEngine';
import { formatPrice } from '../../data/countries';

interface FindMyMatchModalProps {
  listings: Listing[];
  favorites: string[];
  displayCurrency: string;
  initialQuery?: string;
  onClose: () => void;
  onSelectListing: (listing: Listing) => void;
  onToggleFavorite: (id: string) => void;
  onOpenCreateRequest: () => void;
}

const SAMPLE_PROMPTS = [
  'Handmade ceramic bowl under $30 shipping to Canada',
  'Mechanical wristwatch under 500 EUR with original strap',
  'Modular design system template with Figma source files',
  'Technical translation for engineering whitepaper under 300 EUR'
];

const RECENT_SEARCHES_KEY = 'novora_recent_matches';
const MAX_RECENT_SEARCHES = 5;

const loadRecentSearches = (): string[] => {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .slice(0, MAX_RECENT_SEARCHES);
    }
  } catch (err) {
    console.warn('Failed to load recent searches from localStorage:', err);
  }
  return [];
};

const saveRecentSearches = (searches: string[]) => {
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches.slice(0, MAX_RECENT_SEARCHES)));
  } catch (err) {
    console.warn('Failed to save recent searches to localStorage:', err);
  }
};

export const FindMyMatchModal: React.FC<FindMyMatchModalProps> = ({
  listings,
  favorites,
  displayCurrency,
  initialQuery = '',
  onClose,
  onSelectListing,
  onToggleFavorite,
  onOpenCreateRequest
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [parsedNeed, setParsedNeed] = useState<ParsedNeed | null>(null);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => loadRecentSearches());

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (initialQuery.trim()) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    // Update recent searches: deduplicate, move to front, cap at 5
    setRecentSearches((prev) => {
      const updated = [
        trimmed,
        ...prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())
      ].slice(0, MAX_RECENT_SEARCHES);
      saveRecentSearches(updated);
      return updated;
    });

    const parsed = parseNaturalNeed(trimmed);
    setParsedNeed(parsed);
    const matched = matchNeedToListings(parsed, listings);
    setResults(matched);
    setHasSearched(true);
  };

  const handleRemoveRecentSearch = (e: React.MouseEvent, targetQuery: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s.toLowerCase() !== targetQuery.toLowerCase());
      saveRecentSearches(updated);
      return updated;
    });
  };

  const handleClearAllRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // ignore
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-[#E5E7EB] shadow-2xl relative overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between shrink-0 bg-[#FAFAF8]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center text-[#4057D6]">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#17191F]">
                Find My Match · Need-Based Discovery
              </h2>
              <p className="text-[11px] text-[#646B76]">
                Natural query matching engine · Transparent relevance explanations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#646B76] hover:text-[#17191F] hover:bg-[#E5E7EB] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input, Recent Searches & Examples Section */}
        <div className="p-6 border-b border-[#E5E7EB] bg-white">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Handmade gift under $30 that ships to Canada..."
              className="w-full text-xs sm:text-sm p-3.5 pr-28 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[#17191F] focus:border-[#4057D6] focus:bg-white focus:outline-hidden transition-all shadow-xs"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 px-4 rounded-lg bg-[#17191F] hover:bg-[#27272A] text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Match</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Recent Searches (stored in localStorage, last 5) */}
          {recentSearches.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
              <div className="flex items-center gap-1 text-[#646B76] font-medium text-[11px] mr-0.5">
                <History className="w-3 h-3 text-[#4057D6]" />
                <span>Recent:</span>
              </div>
              {recentSearches.map((item, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setQuery(item);
                    handleSearch(item);
                  }}
                  className="group inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F9FAFB] hover:bg-[#EEF2FF] hover:border-[#C7D2FE] border border-[#E5E7EB] rounded-lg text-[#1F2937] hover:text-[#4057D6] transition-all text-[11px] cursor-pointer shadow-2xs"
                  title={`Search for "${item}"`}
                >
                  <span className="truncate max-w-[160px] sm:max-w-[220px]">
                    {item}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveRecentSearch(e, item)}
                    className="text-[#9CA3AF] hover:text-[#EF4444] p-0.5 rounded-full hover:bg-white/80 transition-colors cursor-pointer"
                    title="Remove from history"
                    aria-label={`Remove search ${item}`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleClearAllRecentSearches}
                className="text-[11px] text-[#9CA3AF] hover:text-[#646B76] underline underline-offset-2 ml-1 px-1 py-0.5 transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}

          {/* Sample Prompts */}
          <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1 text-xs text-[#646B76]">
            <span className="shrink-0 font-medium text-[11px] text-[#646B76]">Examples:</span>
            {SAMPLE_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setQuery(prompt);
                  handleSearch(prompt);
                }}
                className="shrink-0 px-2.5 py-1 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] rounded-md transition-colors text-[11px] cursor-pointer"
              >
                "{prompt.length > 45 ? prompt.substring(0, 45) + '...' : prompt}"
              </button>
            ))}
          </div>
        </div>

        {/* Results & Analysis Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {parsedNeed && hasSearched && (
            <div className="p-4 bg-[#FAFAF8] rounded-xl border border-[#E5E7EB] space-y-2">
              <span className="text-[11px] font-semibold text-[#646B76] uppercase tracking-wider block">
                Extracted Criteria
              </span>

              <div className="flex flex-wrap gap-2 text-xs">
                {parsedNeed.categoryMatch && (
                  <span className="px-2.5 py-1 bg-white border border-[#E5E7EB] rounded-md text-[#17191F] font-medium flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-[#4057D6]" />
                    <span>Category: {parsedNeed.categoryMatch.name}</span>
                  </span>
                )}

                {parsedNeed.maxBudget !== undefined && (
                  <span className="px-2.5 py-1 bg-white border border-[#E5E7EB] rounded-md text-[#17191F] font-medium flex items-center gap-1.5 font-mono">
                    <DollarSign className="w-3 h-3 text-emerald-600" />
                    <span>Budget Cap: ${parsedNeed.maxBudget}</span>
                  </span>
                )}

                {parsedNeed.destinationCountry && (
                  <span className="px-2.5 py-1 bg-white border border-[#E5E7EB] rounded-md text-[#17191F] font-medium flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-rose-600" />
                    <span>Destination: {parsedNeed.destinationCountry.name}</span>
                  </span>
                )}

                {parsedNeed.requiresCustomization && (
                  <span className="px-2.5 py-1 bg-white border border-[#E5E7EB] rounded-md text-[#17191F] font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Customization: Required</span>
                  </span>
                )}

                {parsedNeed.extractedKeywords.length > 0 && (
                  <span className="px-2.5 py-1 bg-white border border-[#E5E7EB] rounded-md text-[#4B5563]">
                    Keywords: {parsedNeed.extractedKeywords.join(', ')}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Matches List */}
          {hasSearched ? (
            results.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-[#17191F] uppercase tracking-wider">
                    Relevant Matches ({results.length})
                  </h3>
                  <span className="text-[11px] text-[#646B76]">
                    Ranked by multi-factor score
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map(({ listing, relevanceScore, reasons }) => (
                    <div
                      key={listing.id}
                      onClick={() => onSelectListing(listing)}
                      className="p-4 rounded-xl border border-[#E5E7EB] bg-white hover:border-[#17191F] transition-all cursor-pointer flex flex-col justify-between space-y-3"
                    >
                      <div className="flex gap-4">
                        <div className="w-18 h-18 rounded-lg bg-[#F3F4F6] overflow-hidden shrink-0">
                          {listing.images && listing.images[0] ? (
                            <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-[#E5E7EB]" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-[#17191F] truncate">
                              {listing.title}
                            </span>
                            <span className="text-xs font-mono font-semibold text-[#17191F] shrink-0">
                              {formatPrice(listing.price, listing.currency)}
                            </span>
                          </div>

                          <p className="text-[11px] text-[#646B76] mt-0.5 line-clamp-1">
                            {listing.sellerName} · {listing.sellerCity || listing.sellerCountry}
                          </p>

                          <div className="mt-2 space-y-1">
                            {reasons.slice(0, 2).map((reason, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-[11px] text-emerald-800">
                                <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span className="truncate">{reason}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#F3F4F6] flex items-center justify-between text-xs">
                        <span className="text-[11px] font-medium text-[#4057D6]">
                          Match Score: {relevanceScore}%
                        </span>
                        <span className="text-xs font-medium text-[#17191F] flex items-center gap-0.5">
                          <span>View Listing</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 px-4 rounded-xl border border-dashed border-[#E5E7EB] space-y-3">
                <AlertCircle className="w-8 h-8 text-[#9CA3AF] mx-auto" />
                <h4 className="text-sm font-semibold text-[#17191F]">
                  No exact matches in current catalog
                </h4>
                <p className="text-xs text-[#646B76] max-w-md mx-auto leading-relaxed">
                  We couldn't find a listed item matching all criteria. You can post an open buyer request to our Request Orbit so independent sellers worldwide can quote you directly!
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCreateRequest();
                    }}
                    className="px-4 py-2 text-xs font-medium text-white bg-[#17191F] hover:bg-[#27272A] rounded-lg transition-colors cursor-pointer"
                  >
                    Post this to Request Orbit
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-10 text-xs text-[#646B76]">
              Enter a search description above to see transparent heuristic match results.
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
