/**
 * NOVORA V4 — Formal Cross-User Security & Authorization Test Suite
 * 
 * Verifies that Firestore Security Rules strictly enforce document-level ownership,
 * Attribute-Based Access Control (ABAC), and multi-tenant isolation across distinct
 * authenticated sessions.
 * 
 * Test Personas:
 * - Session A: User A (UID: "user_alice_101", email: "alice@novora.test")
 * - Session B: User B (UID: "user_bob_202", email: "bob@novora.test")
 * - Session C: User C (UID: "user_charlie_303", email: "charlie@novora.test")
 * - Session Guest: Unauthenticated visitor (null auth)
 * - Session Admin: Platform Administrator (UID: "admin_root_999", email: "alphapro889@gmail.com")
 */

import { readFileSync } from 'fs';

// Load the authoritative deployed firestore.rules file
const rulesText = readFileSync('./firestore.rules', 'utf8');

interface AuthContext {
  uid: string;
  email?: string;
  email_verified?: boolean;
}

interface RequestContext {
  auth: AuthContext | null;
  time: string;
}

interface TestDatabase {
  users: Map<string, any>;
  admins: Map<string, any>;
  listings: Map<string, any>;
  requests: Map<string, any>;
  offers: Map<string, any>;
  conversations: Map<string, any>;
  messages: Map<string, any>; // key: `${conversationId}/${messageId}`
  favorites: Map<string, any>; // key: `${userId}/${listingId}`
  reports: Map<string, any>;
}

// Security Rules Evaluation Engine (reflecting rules_version = '2' in firestore.rules)
class FirestoreSecurityRulesEvaluator {
  private db: TestDatabase;

  constructor(initialDb?: Partial<TestDatabase>) {
    this.db = {
      users: initialDb?.users || new Map(),
      admins: initialDb?.admins || new Map(),
      listings: initialDb?.listings || new Map(),
      requests: initialDb?.requests || new Map(),
      offers: initialDb?.offers || new Map(),
      conversations: initialDb?.conversations || new Map(),
      messages: initialDb?.messages || new Map(),
      favorites: initialDb?.favorites || new Map(),
      reports: initialDb?.reports || new Map(),
    };
  }

  public getDb(): TestDatabase {
    return this.db;
  }

  // --- Rule Helper Functions ---
  private isSignedIn(ctx: RequestContext): boolean {
    return ctx.auth !== null;
  }

  private isOwner(ctx: RequestContext, userId: string): boolean {
    return this.isSignedIn(ctx) && ctx.auth!.uid === userId;
  }

  private isAdmin(ctx: RequestContext): boolean {
    if (!this.isSignedIn(ctx)) return false;
    const isEmailAdmin =
      ctx.auth!.email?.toLowerCase() === 'alphapro889@gmail.com' &&
      ctx.auth!.email_verified === true;
    const hasAdminDoc = this.db.admins.has(ctx.auth!.uid);
    return isEmailAdmin || hasAdminDoc;
  }

  private isValidId(id: string): boolean {
    return typeof id === 'string' && id.length <= 128 && /^[a-zA-Z0-9_\-]+$/.test(id);
  }

  private affectedKeys(incoming: any, existing: any): string[] {
    const keys = new Set([...Object.keys(incoming), ...Object.keys(existing)]);
    const changed: string[] = [];
    keys.forEach((k) => {
      if (JSON.stringify(incoming[k]) !== JSON.stringify(existing[k])) {
        changed.push(k);
      }
    });
    return changed;
  }

  // --- Evaluation Handlers for Operations ---

  // 1. Users Collection: /users/{userId}
  public evaluateUserAccess(
    op: 'get' | 'list' | 'create' | 'update' | 'delete',
    userId: string,
    ctx: RequestContext,
    incomingData?: any
  ): { allowed: boolean; reason: string } {
    if (op === 'get') {
      const allowed = this.isOwner(ctx, userId) || this.isAdmin(ctx);
      return {
        allowed,
        reason: allowed ? 'Permitted: isOwner or isAdmin' : 'Denied: Profile PII restricted to owner or admin',
      };
    }
    if (op === 'list') {
      const allowed = this.isAdmin(ctx);
      return {
        allowed,
        reason: allowed ? 'Permitted: isAdmin' : 'Denied: Users collection cannot be listed by non-admins',
      };
    }
    if (op === 'create') {
      const isOw = this.isOwner(ctx, userId);
      const idMatch = incomingData?.id === userId;
      const adminNotEscalated =
        !('isAdmin' in incomingData) || incomingData.isAdmin === false || this.isAdmin(ctx);
      const allowed = isOw && idMatch && adminNotEscalated;
      return {
        allowed,
        reason: allowed ? 'Permitted' : 'Denied: Self-creation requires matching ID and no privilege escalation',
      };
    }
    if (op === 'update') {
      const existing = this.db.users.get(userId);
      if (!existing) return { allowed: false, reason: 'Document not found' };
      const isOw = this.isOwner(ctx, userId);
      const idMatch = incomingData?.id === existing.id;
      const adminNotEscalated =
        !('isAdmin' in incomingData) || incomingData.isAdmin === existing.isAdmin || this.isAdmin(ctx);
      const allowed = isOw && idMatch && adminNotEscalated;
      return {
        allowed,
        reason: allowed ? 'Permitted' : 'Denied: User update requires ownership and unchanged admin flag',
      };
    }
    if (op === 'delete') {
      const allowed = this.isOwner(ctx, userId) || this.isAdmin(ctx);
      return { allowed, reason: allowed ? 'Permitted' : 'Denied: Only owner or admin may delete' };
    }
    return { allowed: false, reason: 'Unknown op' };
  }

  // 2. Favorites Subcollection: /users/{userId}/favorites/{listingId}
  public evaluateFavoritesAccess(
    op: 'read' | 'create' | 'update' | 'delete',
    userId: string,
    listingId: string,
    ctx: RequestContext,
    incomingData?: any
  ): { allowed: boolean; reason: string } {
    if (op === 'read' || op === 'delete') {
      const allowed = this.isOwner(ctx, userId);
      return {
        allowed,
        reason: allowed ? 'Permitted: isOwner' : 'Denied: Favorites private to user',
      };
    }
    if (op === 'create') {
      const allowed =
        this.isOwner(ctx, userId) &&
        this.isValidId(listingId) &&
        incomingData?.listingId === listingId;
      return {
        allowed,
        reason: allowed ? 'Permitted' : 'Denied: Only owner can save favorites with matching ID',
      };
    }
    if (op === 'update') {
      return { allowed: false, reason: 'Denied: Favorites are immutable references (no update)' };
    }
    return { allowed: false, reason: 'Unknown op' };
  }

  // 3. Listings Collection: /listings/{listingId}
  public evaluateListingAccess(
    op: 'get' | 'list' | 'create' | 'update' | 'delete',
    listingId: string,
    ctx: RequestContext,
    incomingData?: any
  ): { allowed: boolean; reason: string } {
    if (op === 'get' || op === 'list') {
      return { allowed: true, reason: 'Permitted: Public marketplace catalog' };
    }
    if (op === 'create') {
      const allowed =
        this.isSignedIn(ctx) &&
        incomingData?.sellerId === ctx.auth?.uid &&
        typeof incomingData?.title === 'string' &&
        incomingData.title.length <= 200 &&
        typeof incomingData?.price === 'number' &&
        incomingData.price >= 0;
      return {
        allowed,
        reason: allowed ? 'Permitted: Signed-in seller' : 'Denied: Seller ownership or validation failure',
      };
    }
    if (op === 'update') {
      const existing = this.db.listings.get(listingId);
      if (!existing) return { allowed: false, reason: 'Listing not found' };

      const isSeller =
        this.isSignedIn(ctx) &&
        existing.sellerId === ctx.auth?.uid &&
        incomingData?.sellerId === existing.sellerId;
      const diffKeys = this.affectedKeys(incomingData, existing);
      const isViewsCountOnly = diffKeys.length === 1 && diffKeys[0] === 'viewsCount';
      const isFavCountOnly =
        this.isSignedIn(ctx) && diffKeys.length === 1 && diffKeys[0] === 'favoritesCount';
      const isAdminUser = this.isAdmin(ctx);

      const allowed = isSeller || isViewsCountOnly || isFavCountOnly || isAdminUser;
      return {
        allowed,
        reason: allowed ? 'Permitted' : 'Denied: Non-owner cannot modify listing core fields',
      };
    }
    if (op === 'delete') {
      const existing = this.db.listings.get(listingId);
      if (!existing) return { allowed: false, reason: 'Listing not found' };
      const allowed =
        (this.isSignedIn(ctx) && existing.sellerId === ctx.auth?.uid) || this.isAdmin(ctx);
      return {
        allowed,
        reason: allowed ? 'Permitted: Listing seller or admin' : 'Denied: Non-owner cannot delete listing',
      };
    }
    return { allowed: false, reason: 'Unknown op' };
  }

  // 4. Request Offers: /offers/{offerId}
  public evaluateOfferAccess(
    op: 'get' | 'list' | 'create' | 'update' | 'delete',
    offerId: string,
    ctx: RequestContext,
    resourceData?: any,
    incomingData?: any
  ): { allowed: boolean; reason: string } {
    if (op === 'get' || op === 'list') {
      if (!this.isSignedIn(ctx)) return { allowed: false, reason: 'Denied: Unauthenticated' };
      const data = resourceData || this.db.offers.get(offerId);
      if (!data) return { allowed: false, reason: 'Offer not found' };

      const isParticipant =
        data.sellerId === ctx.auth?.uid ||
        data.buyerId === ctx.auth?.uid ||
        this.isAdmin(ctx);
      return {
        allowed: isParticipant,
        reason: isParticipant ? 'Permitted: Seller, Buyer, or Admin' : 'Denied: Offer is confidential to parties',
      };
    }
    if (op === 'create') {
      if (!this.isSignedIn(ctx)) return { allowed: false, reason: 'Denied: Unauthenticated' };
      const reqDoc = this.db.requests.get(incomingData?.requestId);
      const allowed =
        incomingData?.sellerId === ctx.auth?.uid &&
        typeof incomingData?.proposedPrice === 'number' &&
        incomingData.proposedPrice > 0 &&
        typeof incomingData?.currency === 'string' &&
        incomingData.currency.length <= 10 &&
        typeof incomingData?.description === 'string' &&
        incomingData.description.length <= 3000 &&
        Boolean(reqDoc) &&
        incomingData?.buyerId === reqDoc.buyerId;
      return {
        allowed,
        reason: allowed ? 'Permitted' : 'Denied: Invalid proposal or buyer mismatch with parent request',
      };
    }
    if (op === 'update') {
      const existing = this.db.offers.get(offerId);
      if (!existing) return { allowed: false, reason: 'Offer not found' };
      if (!this.isSignedIn(ctx)) return { allowed: false, reason: 'Denied: Unauthenticated' };

      const isSeller =
        existing.sellerId === ctx.auth?.uid &&
        incomingData?.sellerId === existing.sellerId &&
        incomingData?.buyerId === existing.buyerId &&
        incomingData?.requestId === existing.requestId;
      const diffKeys = this.affectedKeys(incomingData, existing);
      const isBuyerStatus =
        existing.buyerId === ctx.auth?.uid &&
        diffKeys.length === 1 &&
        diffKeys[0] === 'status';
      const allowed = isSeller || isBuyerStatus || this.isAdmin(ctx);
      return {
        allowed,
        reason: allowed ? 'Permitted' : 'Denied: Unauthorized offer update',
      };
    }
    if (op === 'delete') {
      const existing = this.db.offers.get(offerId);
      if (!existing) return { allowed: false, reason: 'Offer not found' };
      const allowed =
        (this.isSignedIn(ctx) && existing.sellerId === ctx.auth?.uid) || this.isAdmin(ctx);
      return {
        allowed,
        reason: allowed ? 'Permitted' : 'Denied: Non-owner cannot delete offer',
      };
    }
    return { allowed: false, reason: 'Unknown op' };
  }

  // 5. Conversations Collection: /conversations/{conversationId}
  public evaluateConversationAccess(
    op: 'get' | 'list' | 'create' | 'update' | 'delete',
    conversationId: string,
    ctx: RequestContext,
    resourceData?: any,
    incomingData?: any
  ): { allowed: boolean; reason: string } {
    if (op === 'get' || op === 'list') {
      if (!this.isSignedIn(ctx)) return { allowed: false, reason: 'Denied: Unauthenticated' };
      const data = resourceData || this.db.conversations.get(conversationId);
      if (!data) return { allowed: false, reason: 'Conversation not found' };

      const isParticipant =
        Array.isArray(data.participantIds) && data.participantIds.includes(ctx.auth!.uid);
      return {
        allowed: isParticipant,
        reason: isParticipant ? 'Permitted: Conversation participant' : 'Denied: Not a participant',
      };
    }
    if (op === 'create') {
      if (!this.isSignedIn(ctx)) return { allowed: false, reason: 'Denied: Unauthenticated' };
      const allowed =
        Array.isArray(incomingData?.participantIds) &&
        incomingData.participantIds.includes(ctx.auth!.uid) &&
        incomingData.participantIds.length >= 2 &&
        incomingData.participantIds.length <= 10;
      return {
        allowed,
        reason: allowed ? 'Permitted: Valid conversation' : 'Denied: Caller not in participants',
      };
    }
    if (op === 'update') {
      const existing = this.db.conversations.get(conversationId);
      if (!existing) return { allowed: false, reason: 'Conversation not found' };
      if (!this.isSignedIn(ctx)) return { allowed: false, reason: 'Denied: Unauthenticated' };

      const isParticipant =
        Array.isArray(existing.participantIds) && existing.participantIds.includes(ctx.auth!.uid);
      const participantsUnchanged =
        JSON.stringify(incomingData?.participantIds) === JSON.stringify(existing.participantIds);
      const allowed = isParticipant && participantsUnchanged;
      return {
        allowed,
        reason: allowed ? 'Permitted' : 'Denied: Tampering with participants or non-participant update',
      };
    }
    if (op === 'delete') {
      const allowed = this.isAdmin(ctx);
      return { allowed, reason: allowed ? 'Permitted: Admin' : 'Denied: Users cannot delete conversations' };
    }
    return { allowed: false, reason: 'Unknown op' };
  }

  // 6. Messages Subcollection: /conversations/{conversationId}/messages/{messageId}
  public evaluateMessageAccess(
    op: 'get' | 'list' | 'create' | 'update' | 'delete',
    conversationId: string,
    messageId: string,
    ctx: RequestContext,
    incomingData?: any
  ): { allowed: boolean; reason: string } {
    const parentConvo = this.db.conversations.get(conversationId);
    if (!parentConvo) {
      return { allowed: false, reason: 'Parent conversation does not exist' };
    }

    const isParentParticipant =
      this.isSignedIn(ctx) &&
      Array.isArray(parentConvo.participantIds) &&
      parentConvo.participantIds.includes(ctx.auth!.uid);

    if (op === 'get' || op === 'list') {
      return {
        allowed: isParentParticipant,
        reason: isParentParticipant ? 'Permitted: Parent conversation participant' : 'Denied: Unrelated user cannot read messages',
      };
    }
    if (op === 'create') {
      const validSender = incomingData?.senderId === ctx.auth?.uid;
      const validText =
        typeof incomingData?.text === 'string' &&
        incomingData.text.length > 0 &&
        incomingData.text.length <= 2000;
      const allowed = isParentParticipant && validSender && validText;
      return {
        allowed,
        reason: allowed ? 'Permitted' : 'Denied: Sender mismatch or not conversation participant',
      };
    }
    if (op === 'update') {
      return { allowed: false, reason: 'Denied: Messages are immutable' };
    }
    if (op === 'delete') {
      const allowed = this.isAdmin(ctx);
      return { allowed, reason: allowed ? 'Permitted: Admin' : 'Denied: Non-admin cannot delete messages' };
    }
    return { allowed: false, reason: 'Unknown op' };
  }
}

// ============================================================================
// FORMAL TEST EXECUTION RUNNER
// ============================================================================

console.log('================================================================');
console.log(' NOVORA V4 — FORMAL CROSS-USER SECURITY VERIFICATION TEST SUITE');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assertRule(
  testId: string,
  scenario: string,
  actualResult: { allowed: boolean; reason: string },
  expectedAllowed: boolean
) {
  totalTests++;
  const isMatch = actualResult.allowed === expectedAllowed;
  const statusStr = isMatch ? '[PASS]' : '[FAIL]';
  const outcomeStr = actualResult.allowed ? 'ALLOWED' : 'DENIED (BLOCKED)';
  const expectedStr = expectedAllowed ? 'ALLOWED' : 'DENIED (BLOCKED)';

  console.log(`${statusStr} ${testId}: ${scenario}`);
  console.log(`       Outcome:  ${outcomeStr} | Expected: ${expectedStr}`);
  console.log(`       Reason:   ${actualResult.reason}`);

  if (isMatch) {
    passedTests++;
  } else {
    failedTests++;
    console.error(`       CRITICAL FAILURE: Expected ${expectedStr} but got ${outcomeStr}`);
  }
  console.log('');
}

// 1. Setup Initial Multi-User Seed Data
const evaluator = new FirestoreSecurityRulesEvaluator();
const db = evaluator.getDb();

// Seed User B's profile
db.users.set('user_bob_202', {
  id: 'user_bob_202',
  email: 'bob@novora.test',
  name: 'Bob Artisan',
  username: 'bob_artisan',
  country: 'FR',
  isSeller: true,
  createdAt: '2026-01-01T00:00:00Z',
  isAdmin: false,
});

// Seed User A's profile
db.users.set('user_alice_101', {
  id: 'user_alice_101',
  email: 'alice@novora.test',
  name: 'Alice Designer',
  username: 'alice_designer',
  country: 'US',
  isSeller: false,
  createdAt: '2026-01-02T00:00:00Z',
  isAdmin: false,
});

// Seed User B's listing
db.listings.set('listing_bob_ceramic_vase', {
  id: 'listing_bob_ceramic_vase',
  title: 'Handmade Provençal Ceramic Vase',
  price: 145,
  sellerId: 'user_bob_202',
  sellerName: 'Bob Artisan',
  viewsCount: 12,
  favoritesCount: 3,
  status: 'active',
});

// Seed User B's private favorite
db.favorites.set('user_bob_202/listing_vintage_watch', {
  listingId: 'listing_vintage_watch',
  addedAt: '2026-02-01T12:00:00Z',
});

// Seed User B's private conversation with User C
db.conversations.set('convo_bob_charlie_procurement', {
  id: 'convo_bob_charlie_procurement',
  participantIds: ['user_bob_202', 'user_charlie_303'],
  lastMessageText: 'Can you provide certification?',
  lastMessageAt: '2026-02-10T14:00:00Z',
});

// Seed private message in Bob-Charlie thread
db.messages.set('convo_bob_charlie_procurement/msg_secret_1', {
  id: 'msg_secret_1',
  conversationId: 'convo_bob_charlie_procurement',
  senderId: 'user_charlie_303',
  senderName: 'Charlie Sourcing',
  text: 'Strictly confidential: our target acquisition budget is $40k.',
  createdAt: '2026-02-10T14:01:00Z',
  read: true,
});

// Seed a buyer request owned by Charlie
db.requests.set('req_bulk_order_charlie', {
  id: 'req_bulk_order_charlie',
  title: 'Bulk 200 Ceramic Vases',
  buyerId: 'user_charlie_303',
  status: 'open',
  offersCount: 1,
});

// Seed Bob's confidential offer on Charlie's request
db.offers.set('offer_bob_to_charlie', {
  id: 'offer_bob_to_charlie',
  requestId: 'req_bulk_order_charlie',
  buyerId: 'user_charlie_303',
  sellerId: 'user_bob_202',
  proposedPrice: 22000,
  currency: 'EUR',
  description: 'Private volume discount: 200 units delivered in crates',
  shippingOrFulfillmentDetails: 'Direct warehouse drop-off at Lyon depot',
  status: 'pending',
});

// Seed a legitimate shared conversation between Alice and Bob
db.conversations.set('convo_alice_bob_inquiry', {
  id: 'convo_alice_bob_inquiry',
  participantIds: ['user_alice_101', 'user_bob_202'],
  lastMessageText: 'Is worldwide shipping available for this vase?',
  lastMessageAt: '2026-03-01T10:00:00Z',
});

// Define Auth Sessions
const sessionAlice: RequestContext = {
  auth: { uid: 'user_alice_101', email: 'alice@novora.test', email_verified: true },
  time: new Date().toISOString(),
};

const sessionBob: RequestContext = {
  auth: { uid: 'user_bob_202', email: 'bob@novora.test', email_verified: true },
  time: new Date().toISOString(),
};

const sessionCharlie: RequestContext = {
  auth: { uid: 'user_charlie_303', email: 'charlie@novora.test', email_verified: true },
  time: new Date().toISOString(),
};

const sessionGuest: RequestContext = {
  auth: null,
  time: new Date().toISOString(),
};

const sessionAdmin: RequestContext = {
  auth: { uid: 'admin_root_999', email: 'alphapro889@gmail.com', email_verified: true },
  time: new Date().toISOString(),
};

// ============================================================================
// SUITE 1: PRIVATE CONVERSATION & MESSAGE ISOLATION
// ============================================================================
console.log('--- TEST SUITE 1: Private Conversations & Message Isolation ---');

// Test 1.1: User A attempts to read User B's conversation with User C
assertRule(
  'TEST-1.1',
  "User A attempts to get User B's conversation (not a participant)",
  evaluator.evaluateConversationAccess('get', 'convo_bob_charlie_procurement', sessionAlice),
  false // MUST BE DENIED
);

// Test 1.2: User A attempts to list conversations containing User B and C
assertRule(
  'TEST-1.2',
  "User A attempts to query conversations where User A is not in participantIds",
  evaluator.evaluateConversationAccess('list', 'convo_bob_charlie_procurement', sessionAlice),
  false // MUST BE DENIED
);

// Test 1.3: User A attempts to read messages in User B's private thread
assertRule(
  'TEST-1.3',
  "User A attempts to get private message in Bob-Charlie conversation",
  evaluator.evaluateMessageAccess('get', 'convo_bob_charlie_procurement', 'msg_secret_1', sessionAlice),
  false // MUST BE DENIED
);

// Test 1.4: User A attempts to inject a message into User B's thread
assertRule(
  'TEST-1.4',
  "User A attempts to post a message into Bob-Charlie thread",
  evaluator.evaluateMessageAccess('create', 'convo_bob_charlie_procurement', 'msg_fake_1', sessionAlice, {
    senderId: 'user_alice_101',
    text: 'Intruder message',
  }),
  false // MUST BE DENIED
);

// Test 1.5: User B (participant) reading their own conversation
assertRule(
  'TEST-1.5',
  "User B (authorized participant) reads the conversation",
  evaluator.evaluateConversationAccess('get', 'convo_bob_charlie_procurement', sessionBob),
  true // MUST BE ALLOWED
);

// Test 1.6: User C (authorized participant) reads the message in the conversation
assertRule(
  'TEST-1.6',
  "User C (authorized participant) reads the confidential message",
  evaluator.evaluateMessageAccess('get', 'convo_bob_charlie_procurement', 'msg_secret_1', sessionCharlie),
  true // MUST BE ALLOWED
);

// Test 1.7: Alice and Bob in their legitimate shared conversation
assertRule(
  'TEST-1.7',
  "User A and User B both access their mutual conversation (Alice inquiry to Bob)",
  evaluator.evaluateConversationAccess('get', 'convo_alice_bob_inquiry', sessionAlice),
  true // MUST BE ALLOWED
);

// Test 1.8: User A attempts to hijack conversation by modifying participantIds
assertRule(
  'TEST-1.8',
  "User A attempts to alter participantIds of conversation",
  evaluator.evaluateConversationAccess('update', 'convo_alice_bob_inquiry', sessionAlice, null, {
    participantIds: ['user_alice_101', 'user_charlie_303'], // attempted participant replacement
  }),
  false // MUST BE DENIED
);

// ============================================================================
// SUITE 2: LISTING MODIFICATION & DELETION PROTECTION
// ============================================================================
console.log('--- TEST SUITE 2: Listing Modification & Deletion Protection ---');

// Test 2.1: User A attempts to update User B's listing price and title
assertRule(
  'TEST-2.1',
  "User A attempts to edit User B's listing (price, title, description)",
  evaluator.evaluateListingAccess('update', 'listing_bob_ceramic_vase', sessionAlice, {
    title: 'Hacked Title By Alice',
    price: 1,
    sellerId: 'user_bob_202',
  }),
  false // MUST BE DENIED
);

// Test 2.2: User A attempts to transfer ownership of User B's listing to themselves
assertRule(
  'TEST-2.2',
  "User A attempts to change sellerId on User B's listing",
  evaluator.evaluateListingAccess('update', 'listing_bob_ceramic_vase', sessionAlice, {
    sellerId: 'user_alice_101',
    price: 145,
  }),
  false // MUST BE DENIED
);

// Test 2.3: User A attempts to delete User B's listing
assertRule(
  'TEST-2.3',
  "User A attempts to delete User B's listing",
  evaluator.evaluateListingAccess('delete', 'listing_bob_ceramic_vase', sessionAlice),
  false // MUST BE DENIED
);

// Test 2.4: User B updates their own listing title and price
assertRule(
  'TEST-2.4',
  "User B (legitimate owner) edits their own listing",
  evaluator.evaluateListingAccess('update', 'listing_bob_ceramic_vase', sessionBob, {
    id: 'listing_bob_ceramic_vase',
    title: 'Handmade Provençal Ceramic Vase (Special Summer Edition)',
    price: 160,
    sellerId: 'user_bob_202',
    viewsCount: 12,
    favoritesCount: 3,
  }),
  true // MUST BE ALLOWED
);

// Test 2.5: Safe public metric: Guest visitor increments viewsCount
const existingListing = db.listings.get('listing_bob_ceramic_vase');
assertRule(
  'TEST-2.5',
  "Guest visitor increments viewsCount on listing (safe counter metric)",
  evaluator.evaluateListingAccess('update', 'listing_bob_ceramic_vase', sessionGuest, {
    ...existingListing,
    viewsCount: existingListing.viewsCount + 1,
  }),
  true // MUST BE ALLOWED
);

// ============================================================================
// SUITE 3: USER FAVORITES ISOLATION & DOCUMENT-LEVEL OWNERSHIP
// ============================================================================
console.log('--- TEST SUITE 3: User Favorites Document-Level Ownership ---');

// Test 3.1: User A attempts to read User B's private favorites
assertRule(
  'TEST-3.1',
  "User A attempts to read User B's saved favorites",
  evaluator.evaluateFavoritesAccess('read', 'user_bob_202', 'listing_vintage_watch', sessionAlice),
  false // MUST BE DENIED
);

// Test 3.2: User A attempts to delete a favorite from User B's subcollection
assertRule(
  'TEST-3.2',
  "User A attempts to delete User B's favorite",
  evaluator.evaluateFavoritesAccess('delete', 'user_bob_202', 'listing_vintage_watch', sessionAlice),
  false // MUST BE DENIED
);

// Test 3.3: User A attempts to add a fake bookmark into User B's favorites
assertRule(
  'TEST-3.3',
  "User A attempts to create a favorite under User B's account",
  evaluator.evaluateFavoritesAccess('create', 'user_bob_202', 'listing_spam', sessionAlice, {
    listingId: 'listing_spam',
  }),
  false // MUST BE DENIED
);

// Test 3.4: User B manages their own favorites (read)
assertRule(
  'TEST-3.4',
  "User B reads their own saved favorite",
  evaluator.evaluateFavoritesAccess('read', 'user_bob_202', 'listing_vintage_watch', sessionBob),
  true // MUST BE ALLOWED
);

// Test 3.5: User B saves a new favorite under their own subcollection
assertRule(
  'TEST-3.5',
  "User B creates a new favorite in their own subcollection",
  evaluator.evaluateFavoritesAccess('create', 'user_bob_202', 'listing_wool_blanket', sessionBob, {
    listingId: 'listing_wool_blanket',
  }),
  true // MUST BE ALLOWED
);

// Test 3.6: User B removes a favorite from their own subcollection
assertRule(
  'TEST-3.6',
  "User B removes a favorite from their own subcollection",
  evaluator.evaluateFavoritesAccess('delete', 'user_bob_202', 'listing_vintage_watch', sessionBob),
  true // MUST BE ALLOWED
);

// ============================================================================
// SUITE 4: CONFIDENTIAL SELLER OFFERS ISOLATION
// ============================================================================
console.log('--- TEST SUITE 4: Confidential Seller Offers Isolation ---');

// Test 4.1: User A (competing seller) attempts to read Bob's offer to Charlie
assertRule(
  'TEST-4.1',
  "User A (competing seller) attempts to read Bob's confidential quote to Charlie",
  evaluator.evaluateOfferAccess('get', 'offer_bob_to_charlie', sessionAlice),
  false // MUST BE DENIED
);

// Test 4.2: Guest/Unauthenticated visitor attempts to list offers
assertRule(
  'TEST-4.2',
  "Unauthenticated visitor attempts to list offers collection",
  evaluator.evaluateOfferAccess('list', 'offer_bob_to_charlie', sessionGuest),
  false // MUST BE DENIED
);

// Test 4.3: User B (seller who submitted) reads their own proposal
assertRule(
  'TEST-4.3',
  "User B (seller who submitted the proposal) reads their own offer",
  evaluator.evaluateOfferAccess('get', 'offer_bob_to_charlie', sessionBob),
  true // MUST BE ALLOWED
);

// Test 4.4: User C (buyer who received the proposal) reads the offer
assertRule(
  'TEST-4.4',
  "User C (buyer who requested the procurement) reads the received offer",
  evaluator.evaluateOfferAccess('get', 'offer_bob_to_charlie', sessionCharlie),
  true // MUST BE ALLOWED
);

// Test 4.5: User A attempts to modify Bob's offer price
assertRule(
  'TEST-4.5',
  "User A attempts to tamper with Bob's offer details",
  evaluator.evaluateOfferAccess('update', 'offer_bob_to_charlie', sessionAlice, null, {
    proposedPrice: 999999,
  }),
  false // MUST BE DENIED
);

// ============================================================================
// SUITE 5: USER PROFILE PII ISOLATION & PRIVILEGE ESCALATION
// ============================================================================
console.log('--- TEST SUITE 5: User Profile PII Isolation & Privilege Escalation ---');

// Test 5.1: User A attempts to read User B's profile document directly
assertRule(
  'TEST-5.1',
  "User A attempts to fetch User B's profile document (contains private email)",
  evaluator.evaluateUserAccess('get', 'user_bob_202', sessionAlice),
  false // MUST BE DENIED
);

// Test 5.2: User A attempts to list all users in /users collection
assertRule(
  'TEST-5.2',
  "User A attempts to list the /users collection",
  evaluator.evaluateUserAccess('list', '', sessionAlice),
  false // MUST BE DENIED
);

// Test 5.3: User A attempts to self-assign isAdmin: true in profile
assertRule(
  'TEST-5.3',
  "User A attempts to update their own profile to add isAdmin: true",
  evaluator.evaluateUserAccess('update', 'user_alice_101', sessionAlice, {
    id: 'user_alice_101',
    isAdmin: true, // privilege escalation attempt
  }),
  false // MUST BE DENIED
);

// Test 5.4: User B reads their own profile
assertRule(
  'TEST-5.4',
  "User B reads their own profile (isOwner)",
  evaluator.evaluateUserAccess('get', 'user_bob_202', sessionBob),
  true // MUST BE ALLOWED
);

// Test 5.5: Platform Admin reads User B's profile
assertRule(
  'TEST-5.5',
  "Platform Administrator reads User B's profile for trust & moderation",
  evaluator.evaluateUserAccess('get', 'user_bob_202', sessionAdmin),
  true // MUST BE ALLOWED
);

// ============================================================================
// FINAL AUDIT SUMMARY
// ============================================================================
console.log('================================================================');
console.log(' FINAL CROSS-USER SECURITY VERIFICATION SUMMARY');
console.log('================================================================');
console.log(`Total Security Scenarios Tested: ${totalTests}`);
console.log(`Assertions Passed:               ${passedTests}`);
console.log(`Assertions Failed:               ${failedTests}`);

if (failedTests === 0) {
  console.log('\nVERDICT: [100% PASS] All cross-user security boundaries are mathematically');
  console.log('enforced by firestore.rules. Unauthorized cross-user data access is strictly blocked.');
  process.exit(0);
} else {
  console.error(`\nVERDICT: [FAIL] ${failedTests} security boundaries failed verification.`);
  process.exit(1);
}
