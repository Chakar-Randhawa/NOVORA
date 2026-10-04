export type ListingType =
  | 'physical_new'
  | 'physical_used'
  | 'handmade'
  | 'vintage'
  | 'customized'
  | 'digital_download'
  | 'ebook_educational'
  | 'templates_assets'
  | 'professional_service'
  | 'creative_service'
  | 'local_classified'
  | 'wholesale_b2b'
  | 'supplier_manufacturing'
  | 'equipment_rental'
  | 'custom_manufacturing'
  | 'business_collaboration'
  | 'other';

export type ProductCondition = 'new' | 'like_new' | 'excellent' | 'good' | 'fair' | 'not_applicable';

export interface CategoryDefinition {
  id: string;
  name: string;
  slug: string;
  description: string;
  listingTypes: ListingType[];
  icon: string;
  customFields: CustomFieldDefinition[];
}

export interface CustomFieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'textarea';
  placeholder?: string;
  options?: string[];
  unit?: string;
  required?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  country: string;
  city?: string;
  preferredCurrency: string;
  joinedDate: string;
  isSeller: boolean;
  isAdmin?: boolean;
  sellerTagline?: string;
  languages: string[];
  responseTimeHours?: number;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  listingType: ListingType;
  price: number;
  currency: string;
  condition: ProductCondition;
  sellerId: string;
  sellerName: string;
  sellerCountry: string;
  sellerCity?: string;
  images: string[];
  customAttributes: Record<string, any>;
  shipsInternationally: boolean;
  shippingDestinations: string[]; // e.g. ['Worldwide'], ['US', 'CA', 'GB'], etc.
  shippingEstimateDays?: number;
  shippingCostDescription?: string;
  allowsCustomization: boolean;
  status: 'active' | 'paused' | 'archived';
  createdAt: string;
  updatedAt: string;
  viewsCount: number;
  favoritesCount: number;
  tags: string[];
}

export interface BuyerRequest {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  buyerId: string;
  buyerName: string;
  buyerCountry: string;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  quantity?: number;
  destinationCountry: string;
  deadline?: string;
  customizationDetails?: string;
  fulfillmentPreference: 'shipping' | 'digital' | 'remote_service' | 'local_pickup';
  referenceImages?: string[];
  status: 'open' | 'fulfilled' | 'closed';
  createdAt: string;
  offersCount: number;
  visibility: 'public' | 'direct';
}

export interface RequestOffer {
  id: string;
  requestId: string;
  buyerId: string;
  sellerId: string;
  sellerName: string;
  sellerCountry: string;
  sellerAvatar?: string;
  proposedPrice: number;
  currency: string;
  description: string;
  deliverables?: string;
  estimatedDays: number;
  shippingOrFulfillmentDetails: string;
  customizationIncluded: boolean;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  validUntil: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  listingId?: string;
  listingTitle?: string;
  requestId?: string;
  requestTitle?: string;
  lastMessageText: string;
  lastMessageAt: string;
  unreadCount: Record<string, number>;
}

export interface ReportItem {
  id: string;
  targetType: 'listing' | 'request' | 'user' | 'message';
  targetId: string;
  reporterId: string;
  reason: 'prohibited_item' | 'scam_fraud' | 'misleading' | 'inappropriate' | 'spam' | 'other';
  details: string;
  createdAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

export interface MatchQuery {
  naturalQuery: string;
  parsedIntent?: {
    keywords: string[];
    categoryHint?: string;
    maxBudget?: number;
    destinationCountry?: string;
    requiresCustomization?: boolean;
    fulfillmentType?: string;
  };
}

export interface MatchResult {
  listing: Listing;
  relevanceScore: number;
  reasons: string[];
}

export interface FilterState {
  searchQuery: string;
  categoryId: string;
  listingType: string;
  country: string;
  minPrice?: number;
  maxPrice?: number;
  condition: string;
  shipsInternationally?: boolean;
  allowsCustomization?: boolean;
  sortBy: 'relevance' | 'newest' | 'price_low' | 'price_high';
}
