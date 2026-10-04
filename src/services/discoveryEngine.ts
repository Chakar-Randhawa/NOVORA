import { Listing, MatchQuery, MatchResult } from '../types';
import { COUNTRIES } from '../data/countries';
import { CATEGORIES } from '../data/categories';

export interface ParsedNeed {
  rawQuery: string;
  extractedKeywords: string[];
  maxBudget?: number;
  currency?: string;
  destinationCountry?: {
    code: string;
    name: string;
  };
  categoryMatch?: {
    id: string;
    name: string;
  };
  requiresCustomization: boolean;
  fulfillmentType?: 'shipping' | 'digital' | 'service';
}

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were',
  'will', 'with', 'i', 'need', 'want', 'looking', 'find', 'me', 'under', 'can',
  'ship', 'deliver', 'seller', 'buy', 'please', 'like', 'some', 'any'
]);

const SYNONYMS: Record<string, string[]> = {
  gift: ['present', 'artisan', 'unique', 'handmade', 'special', 'craft'],
  handmade: ['handcrafted', 'artisan', 'custom', 'hand-thrown', 'bespoke', 'wood-fired', 'chiseled'],
  vintage: ['antique', 'retro', 'classic', 'collectible', 'heritage', 'mechanical', '1970s'],
  watch: ['timepiece', 'chronograph', 'wristwatch', 'horology', 'clock'],
  ceramic: ['pottery', 'bowl', 'chawan', 'stoneware', 'clay', 'porcelain'],
  design: ['template', 'vector', 'figma', 'architectural', 'ui', 'system', 'branding'],
  translation: ['localize', 'german', 'french', 'english', 'translator', 'document'],
  cheap: ['affordable', 'budget', 'under'],
  fast: ['express', 'instant', 'quick', 'days']
};

export function parseNaturalNeed(query: string): ParsedNeed {
  const normalized = query.toLowerCase().trim();
  
  // 1. Extract Budget (e.g. "under $30", "< 50", "under 100 EUR", "budget of $400")
  let maxBudget: number | undefined = undefined;
  let currency: string | undefined = undefined;

  const budgetRegex = /(?:under|budget(?:\s+of)?|max|below|less\s+than|<)\s*([$€£¥]|cad|usd|eur|gbp)?\s*(\d+(?:\.\d{1,2})?)/i;
  const budgetMatch = normalized.match(budgetRegex);
  if (budgetMatch) {
    maxBudget = parseFloat(budgetMatch[2]);
    const symbolOrCode = budgetMatch[1]?.toUpperCase();
    if (symbolOrCode === '$' || symbolOrCode === 'USD') currency = 'USD';
    else if (symbolOrCode === '€' || symbolOrCode === 'EUR') currency = 'EUR';
    else if (symbolOrCode === '£' || symbolOrCode === 'GBP') currency = 'GBP';
    else if (symbolOrCode === '¥' || symbolOrCode === 'JPY') currency = 'JPY';
    else if (symbolOrCode === 'CAD') currency = 'CAD';
  } else {
    // Check bare numbers with dollar signs like "$30"
    const bareSymbolMatch = normalized.match(/[$€£¥]\s*(\d+(?:\.\d{1,2})?)/);
    if (bareSymbolMatch) {
      maxBudget = parseFloat(bareSymbolMatch[1]);
    }
  }

  // 2. Extract Destination Country (e.g. "ship to Canada", "in Germany", "deliver to UK")
  let destinationCountry: { code: string; name: string } | undefined = undefined;
  for (const c of COUNTRIES) {
    const countryName = c.name.toLowerCase();
    const countryCode = c.code.toLowerCase();
    if (
      normalized.includes(countryName) ||
      (normalized.includes(`to ${countryCode}`) || normalized.includes(`in ${countryCode}`))
    ) {
      destinationCountry = { code: c.code, name: c.name };
      break;
    }
  }

  // 3. Extract Category Hint
  let categoryMatch: { id: string; name: string } | undefined = undefined;
  for (const cat of CATEGORIES) {
    const catWords = cat.name.toLowerCase().split(/\s+/);
    for (const w of catWords) {
      if (w.length > 3 && normalized.includes(w)) {
        categoryMatch = { id: cat.id, name: cat.name };
        break;
      }
    }
    if (categoryMatch) break;
  }

  // Fallback category heuristics
  if (!categoryMatch) {
    if (normalized.includes('handmade') || normalized.includes('craft') || normalized.includes('pottery') || normalized.includes('ceramic') || normalized.includes('wood')) {
      categoryMatch = { id: 'handmade-crafts', name: 'Handmade & Artisan Crafts' };
    } else if (normalized.includes('vintage') || normalized.includes('antique') || normalized.includes('retro') || normalized.includes('watch') || normalized.includes('timepiece')) {
      categoryMatch = { id: 'vintage-collectibles', name: 'Vintage & Collectibles' };
    } else if (normalized.includes('figma') || normalized.includes('digital') || normalized.includes('template') || normalized.includes('preset') || normalized.includes('download')) {
      categoryMatch = { id: 'digital-downloads', name: 'Digital Downloads & Assets' };
    } else if (normalized.includes('service') || normalized.includes('translation') || normalized.includes('consulting') || normalized.includes('drafting')) {
      categoryMatch = { id: 'professional-services', name: 'Professional & Creative Services' };
    }
  }

  // 4. Customization detection
  const requiresCustomization = 
    normalized.includes('custom') || 
    normalized.includes('customized') || 
    normalized.includes('personalized') || 
    normalized.includes('bespoke') || 
    normalized.includes('engraved') ||
    normalized.includes('made to order');

  // 5. Fulfillment preference
  let fulfillmentType: 'shipping' | 'digital' | 'service' | undefined = undefined;
  if (normalized.includes('ship') || normalized.includes('deliver') || normalized.includes('postal')) {
    fulfillmentType = 'shipping';
  } else if (normalized.includes('digital') || normalized.includes('download') || normalized.includes('instant')) {
    fulfillmentType = 'digital';
  } else if (normalized.includes('service') || normalized.includes('consult') || normalized.includes('freelance')) {
    fulfillmentType = 'service';
  }

  // 6. Keywords
  const tokens = normalized
    .replace(/[^\w\s$€£¥-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t) && !t.startsWith('$') && isNaN(Number(t)));

  return {
    rawQuery: query,
    extractedKeywords: Array.from(new Set(tokens)),
    maxBudget,
    currency,
    destinationCountry,
    categoryMatch,
    requiresCustomization,
    fulfillmentType
  };
}

export function matchNeedToListings(parsedNeed: ParsedNeed, listings: Listing[]): MatchResult[] {
  const results: MatchResult[] = [];

  for (const listing of listings) {
    if (listing.status !== 'active') continue;

    let score = 0;
    const reasons: string[] = [];

    const searchableText = `${listing.title} ${listing.description} ${listing.tags.join(' ')} ${Object.values(listing.customAttributes).join(' ')}`.toLowerCase();

    // A. Keyword & Synonym Matching (weight: up to 45 pts)
    let keywordHits = 0;
    const matchedTokens: string[] = [];

    for (const kw of parsedNeed.extractedKeywords) {
      if (searchableText.includes(kw)) {
        keywordHits += 1;
        matchedTokens.push(kw);
      } else {
        // check synonyms
        const syns = SYNONYMS[kw] || [];
        for (const s of syns) {
          if (searchableText.includes(s)) {
            keywordHits += 0.8;
            matchedTokens.push(`${s} (related to ${kw})`);
            break;
          }
        }
      }
    }

    if (keywordHits > 0) {
      const keywordRatio = Math.min(1, keywordHits / Math.max(1, parsedNeed.extractedKeywords.length));
      score += Math.round(keywordRatio * 45);
      reasons.push(`Matches keywords: "${matchedTokens.slice(0, 3).join(', ')}"`);
    }

    // B. Category Matching (weight: 25 pts)
    if (parsedNeed.categoryMatch) {
      if (listing.categoryId === parsedNeed.categoryMatch.id) {
        score += 25;
        reasons.push(`Belongs to requested category: ${parsedNeed.categoryMatch.name}`);
      }
    }

    // C. Budget Constraint (weight: 20 pts)
    if (parsedNeed.maxBudget !== undefined) {
      if (listing.price <= parsedNeed.maxBudget) {
        score += 20;
        reasons.push(`Within budget: $${listing.price.toFixed(2)} (Limit: $${parsedNeed.maxBudget.toFixed(2)})`);
      } else if (listing.price <= parsedNeed.maxBudget * 1.15) {
        score += 8;
        reasons.push(`Slightly above limit at $${listing.price.toFixed(2)} (within 15% range)`);
      } else {
        score -= 25; // Exceeds budget significantly
      }
    }

    // D. Shipping / Destination (weight: 15 pts)
    if (parsedNeed.destinationCountry) {
      const countryCode = parsedNeed.destinationCountry.code;
      const shipsToTarget = 
        listing.shipsInternationally && 
        (listing.shippingDestinations.includes('Worldwide') || listing.shippingDestinations.includes(countryCode));

      if (shipsToTarget) {
        score += 15;
        reasons.push(`Seller ships to ${parsedNeed.destinationCountry.name} (${listing.shippingEstimateDays ? `approx. ${listing.shippingEstimateDays} days` : 'verified'})`);
      } else if (listing.sellerCountry === countryCode) {
        score += 15;
        reasons.push(`Seller is located in ${parsedNeed.destinationCountry.name}`);
      } else if (listing.listingType === 'digital_download' || listing.listingType === 'professional_service') {
        score += 15;
        reasons.push(`Worldwide instant digital delivery to ${parsedNeed.destinationCountry.name}`);
      } else {
        score -= 20; // Does not ship to buyer's destination
      }
    }

    // E. Customization match (weight: 10 pts)
    if (parsedNeed.requiresCustomization) {
      if (listing.allowsCustomization) {
        score += 10;
        reasons.push(`Seller offers custom sizing, inscription, or bespoke options`);
      } else {
        score -= 10;
      }
    }

    // Only include if score is at least 25
    if (score >= 25 && reasons.length > 0) {
      results.push({
        listing,
        relevanceScore: Math.min(100, Math.max(1, score)),
        reasons
      });
    }
  }

  // Sort by highest relevance score
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return results;
}
