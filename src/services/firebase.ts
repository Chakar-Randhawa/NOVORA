import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  addDoc,
  limit,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  Listing,
  BuyerRequest,
  RequestOffer,
  UserProfile,
  Conversation,
  Message,
  ReportItem
} from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with the exact database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Verification of Firestore connection on startup
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return false;
    }
    // "permission-denied" or "not-found" is normal for non-existent test document
    return true;
  }
}

// ============================================================================
// Error Handling: Conforming to FirestoreErrorInfo specifications
// ============================================================================
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ============================================================================
// Authentication & User Profiles
// ============================================================================

export const ADMIN_EMAIL = 'alphapro889@gmail.com';

export async function checkIfAdmin(uid: string, email?: string | null, emailVerified?: boolean): Promise<boolean> {
  if (email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && emailVerified) {
    return true;
  }
  try {
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    return adminDoc.exists();
  } catch {
    return false;
  }
}

export async function syncUserProfile(user: User, additionalData?: Partial<UserProfile>): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  let userSnap;
  try {
    userSnap = await getDoc(userRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
  }

  const isAdmin = await checkIfAdmin(user.uid, user.email, user.emailVerified);

  if (userSnap.exists()) {
    const existing = userSnap.data() as UserProfile;
    // Update profile if additionalData provided
    if (additionalData && Object.keys(additionalData).length > 0) {
      const updatedProfile: UserProfile = {
        ...existing,
        ...additionalData,
        id: user.uid,
        email: user.email || existing.email,
        isAdmin // derived strictly from admin verification
      };
      try {
        await updateDoc(userRef, {
          ...additionalData,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      }
      return updatedProfile;
    }
    return {
      ...existing,
      isAdmin
    };
  }

  // Create new profile for registered user
  const newProfile: UserProfile = {
    id: user.uid,
    email: user.email || '',
    name: user.displayName || additionalData?.name || user.email?.split('@')[0] || 'Marketplace Member',
    username: (additionalData?.username || user.displayName || user.email?.split('@')[0] || 'member').toLowerCase().replace(/[^a-z0-9_]/g, ''),
    avatarUrl: user.photoURL || '',
    country: additionalData?.country || 'US',
    city: additionalData?.city || '',
    preferredCurrency: additionalData?.preferredCurrency || 'USD',
    bio: additionalData?.bio || 'Discovering remarkable products and services on NOVORA.',
    joinedDate: new Date().toISOString().split('T')[0],
    isSeller: additionalData?.isSeller ?? false,
    sellerTagline: additionalData?.sellerTagline || '',
    languages: additionalData?.languages || ['English'],
    responseTimeHours: 12,
    isAdmin // strictly controlled, cannot be self-assigned
  };

  try {
    const sanitizedPayload = Object.fromEntries(
      Object.entries({
        ...newProfile,
        createdAt: new Date().toISOString()
      }).filter(([_, v]) => v !== undefined)
    );
    await setDoc(userRef, sanitizedPayload);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
  }

  return newProfile;
}

export function subscribeToAuth(callback: (profile: UserProfile | null, rawUser: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, async (rawUser) => {
    if (!rawUser) {
      callback(null, null);
      return;
    }
    try {
      const profile = await syncUserProfile(rawUser);
      callback(profile, rawUser);
    } catch (err) {
      console.error('Failed to sync user profile:', err);
      // Fallback minimal safe profile
      callback({
        id: rawUser.uid,
        email: rawUser.email || '',
        name: rawUser.displayName || 'Marketplace User',
        username: (rawUser.displayName || 'user').toLowerCase().replace(/[^a-z0-9_]/g, ''),
        country: 'US',
        preferredCurrency: 'USD',
        joinedDate: new Date().toISOString().split('T')[0],
        isSeller: false,
        isAdmin: rawUser.email === ADMIN_EMAIL,
        languages: ['English']
      }, rawUser);
    }
  });
}

export async function loginWithGoogle(): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider);
  return await syncUserProfile(result.user);
}

export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return await syncUserProfile(result.user);
}

export async function registerWithEmail(
  email: string,
  pass: string,
  profileData: {
    name: string;
    country: string;
    isSeller: boolean;
    sellerTagline?: string;
  }
): Promise<UserProfile> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  return await syncUserProfile(result.user, profileData);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// ============================================================================
// Marketplace Listings (Shared, Global Firestore Catalog)
// ============================================================================

export function subscribeToListings(callback: (listings: Listing[]) => void): Unsubscribe {
  const listingsRef = collection(db, 'listings');
  const q = query(listingsRef, orderBy('createdAt', 'desc'), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Listing[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as Omit<Listing, 'id'>) });
      });
      callback(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'listings');
    }
  );
}

export async function createListing(listingData: Omit<Listing, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount' | 'favoritesCount'>): Promise<Listing> {
  if (!auth.currentUser) {
    throw new Error('Must be authenticated to create a listing.');
  }

  const listingsCol = collection(db, 'listings');
  const now = new Date().toISOString();
  const payload = {
    ...listingData,
    sellerId: auth.currentUser.uid,
    createdAt: now,
    updatedAt: now,
    viewsCount: 0,
    favoritesCount: 0,
    status: 'active'
  };

  try {
    const docRef = await addDoc(listingsCol, payload);
    return {
      id: docRef.id,
      ...payload
    } as Listing;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'listings');
  }
}

export async function updateListing(id: string, updates: Partial<Listing>): Promise<void> {
  if (!auth.currentUser) throw new Error('Authentication required');
  const docRef = doc(db, 'listings', id);
  try {
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `listings/${id}`);
  }
}

export async function deleteListing(id: string): Promise<void> {
  if (!auth.currentUser) throw new Error('Authentication required');
  const docRef = doc(db, 'listings', id);
  try {
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `listings/${id}`);
  }
}

export async function incrementListingView(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'listings', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const current = snap.data().viewsCount || 0;
      await updateDoc(docRef, { viewsCount: current + 1 });
    }
  } catch {
    // Non-blocking view count tracking
  }
}

// ============================================================================
// Buyer Requests (Request Orbit)
// ============================================================================

export function subscribeToRequests(callback: (requests: BuyerRequest[]) => void): Unsubscribe {
  const reqCol = collection(db, 'requests');
  const q = query(reqCol, orderBy('createdAt', 'desc'), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: BuyerRequest[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...(d.data() as Omit<BuyerRequest, 'id'>) });
      });
      callback(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'requests');
    }
  );
}

export async function createBuyerRequest(data: Omit<BuyerRequest, 'id' | 'createdAt' | 'offersCount'>): Promise<BuyerRequest> {
  if (!auth.currentUser) throw new Error('Authentication required');
  const reqCol = collection(db, 'requests');
  const now = new Date().toISOString();
  const payload = {
    ...data,
    buyerId: auth.currentUser.uid,
    createdAt: now,
    offersCount: 0,
    status: 'open'
  };

  try {
    const docRef = await addDoc(reqCol, payload);
    return { id: docRef.id, ...payload } as BuyerRequest;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'requests');
  }
}

export async function updateBuyerRequest(id: string, updates: Partial<BuyerRequest>): Promise<void> {
  if (!auth.currentUser) throw new Error('Authentication required');
  const docRef = doc(db, 'requests', id);
  try {
    await updateDoc(docRef, updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `requests/${id}`);
  }
}

export async function deleteBuyerRequest(id: string): Promise<void> {
  if (!auth.currentUser) throw new Error('Authentication required');
  const docRef = doc(db, 'requests', id);
  try {
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `requests/${id}`);
  }
}

// ============================================================================
// Request Offers (Confidential Seller Proposals)
// ============================================================================

export function subscribeToUserOffers(
  userId: string,
  isAdminUser: boolean,
  callback: (offers: RequestOffer[]) => void
): Unsubscribe {
  const offersCol = collection(db, 'offers');

  if (isAdminUser) {
    const q = query(offersCol, limit(100));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: RequestOffer[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...(d.data() as Omit<RequestOffer, 'id'>) });
        });
        callback(items);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'offers');
      }
    );
  }

  // Subscribe to received buyer offers and submitted seller offers in parallel
  let buyerOffers: RequestOffer[] = [];
  let sellerOffers: RequestOffer[] = [];

  const emitCombined = () => {
    const map = new Map<string, RequestOffer>();
    buyerOffers.forEach(o => map.set(o.id, o));
    sellerOffers.forEach(o => map.set(o.id, o));
    callback(Array.from(map.values()));
  };

  const qBuyer = query(offersCol, where('buyerId', '==', userId));
  const qSeller = query(offersCol, where('sellerId', '==', userId));

  const unsubBuyer = onSnapshot(
    qBuyer,
    (snapshot) => {
      buyerOffers = [];
      snapshot.forEach(d => {
        buyerOffers.push({ id: d.id, ...(d.data() as Omit<RequestOffer, 'id'>) });
      });
      emitCombined();
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, `offers/buyer`);
    }
  );

  const unsubSeller = onSnapshot(
    qSeller,
    (snapshot) => {
      sellerOffers = [];
      snapshot.forEach(d => {
        sellerOffers.push({ id: d.id, ...(d.data() as Omit<RequestOffer, 'id'>) });
      });
      emitCombined();
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, `offers/seller`);
    }
  );

  return () => {
    unsubBuyer();
    unsubSeller();
  };
}

export async function createOffer(data: Omit<RequestOffer, 'id' | 'createdAt'>): Promise<RequestOffer> {
  if (!auth.currentUser) throw new Error('Authentication required');
  const offersCol = collection(db, 'offers');
  const now = new Date().toISOString();

  // Validate that request exists and fetch true buyerId
  const reqRef = doc(db, 'requests', data.requestId);
  const snap = await getDoc(reqRef);
  if (!snap.exists()) {
    throw new Error('Target request does not exist.');
  }
  const trueBuyerId = snap.data().buyerId;

  const payload = {
    ...data,
    buyerId: trueBuyerId,
    sellerId: auth.currentUser.uid,
    createdAt: now,
    status: 'pending' as const
  };

  try {
    const docRef = await addDoc(offersCol, payload);
    // increment offersCount on parent request
    const cur = snap.data().offersCount || 0;
    await updateDoc(reqRef, { offersCount: cur + 1 });
    return { id: docRef.id, ...payload };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'offers');
  }
}

export async function updateOfferStatus(offerId: string, status: 'accepted' | 'declined'): Promise<void> {
  if (!auth.currentUser) throw new Error('Authentication required');
  const docRef = doc(db, 'offers', offerId);
  try {
    await updateDoc(docRef, { status });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `offers/${offerId}`);
  }
}

// ============================================================================
// Direct Messaging & Conversations (Private)
// ============================================================================

export function subscribeToConversations(userId: string, callback: (convos: Conversation[]) => void): Unsubscribe {
  const colRef = collection(db, 'conversations');
  const q = query(colRef, where('participantIds', 'array-contains', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Conversation[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...(d.data() as Omit<Conversation, 'id'>) });
      });
      // Sort in-memory to prevent complex composite index requirements on Firestore
      items.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      callback(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'conversations');
    }
  );
}

export function subscribeToMessages(conversationId: string, callback: (msgs: Message[]) => void): Unsubscribe {
  const colRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(colRef, orderBy('createdAt', 'asc'), limit(200));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Message[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...(d.data() as Omit<Message, 'id'>) });
      });
      callback(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, `conversations/${conversationId}/messages`);
    }
  );
}

export async function getOrCreateConversation(
  otherUserId: string,
  otherUserName: string,
  context?: {
    listingId?: string;
    listingTitle?: string;
    requestId?: string;
    requestTitle?: string;
  }
): Promise<Conversation> {
  if (!auth.currentUser) throw new Error('Authentication required');
  const currentUid = auth.currentUser.uid;
  const currentName = auth.currentUser.displayName || 'Buyer';

  // Check if conversation already exists between these two users
  const convosCol = collection(db, 'conversations');
  const q = query(convosCol, where('participantIds', 'array-contains', currentUid));

  try {
    let existingConvo: Conversation | null = null;
    const snap = await new Promise<any>((resolve, reject) => {
      const unsub = onSnapshot(q, (s) => {
        unsub();
        resolve(s);
      }, reject);
    });

    snap.forEach((d: any) => {
      const data = d.data() as Conversation;
      if (data.participantIds.includes(otherUserId)) {
        if (!context?.listingId || data.listingId === context.listingId) {
          existingConvo = { ...data, id: d.id };
        }
      }
    });

    if (existingConvo) {
      return existingConvo;
    }

    const now = new Date().toISOString();
    const payload = {
      participantIds: [currentUid, otherUserId],
      participantNames: {
        [currentUid]: currentName,
        [otherUserId]: otherUserName
      },
      listingId: context?.listingId || '',
      listingTitle: context?.listingTitle || '',
      requestId: context?.requestId || '',
      requestTitle: context?.requestTitle || '',
      lastMessageText: 'Conversation started',
      lastMessageAt: now,
      unreadCount: {
        [currentUid]: 0,
        [otherUserId]: 0
      }
    };

    const docRef = await addDoc(convosCol, payload);
    return { id: docRef.id, ...payload };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'conversations');
  }
}

export async function sendDirectMessage(
  conversationId: string,
  text: string
): Promise<Message> {
  if (!auth.currentUser) throw new Error('Authentication required');
  const currentUid = auth.currentUser.uid;
  const currentName = auth.currentUser.displayName || 'User';

  const msgsCol = collection(db, 'conversations', conversationId, 'messages');
  const now = new Date().toISOString();
  const payload = {
    conversationId,
    senderId: currentUid,
    senderName: currentName,
    text: text.trim(),
    createdAt: now,
    read: false
  };

  try {
    const docRef = await addDoc(msgsCol, payload);
    // Update conversation lastMessage snippet
    const convoRef = doc(db, 'conversations', conversationId);
    await updateDoc(convoRef, {
      lastMessageText: text.trim().slice(0, 100),
      lastMessageAt: now
    });

    return { id: docRef.id, ...payload };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `conversations/${conversationId}/messages`);
  }
}

// ============================================================================
// User Favorites
// ============================================================================

export function subscribeToFavorites(userId: string, callback: (listingIds: string[]) => void): Unsubscribe {
  const favCol = collection(db, 'users', userId, 'favorites');
  return onSnapshot(
    favCol,
    (snapshot) => {
      const ids: string[] = [];
      snapshot.forEach((d) => ids.push(d.id));
      callback(ids);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, `users/${userId}/favorites`);
    }
  );
}

export async function toggleFavorite(listingId: string): Promise<boolean> {
  if (!auth.currentUser) throw new Error('Authentication required');
  const uid = auth.currentUser.uid;
  const favDoc = doc(db, 'users', uid, 'favorites', listingId);
  const snap = await getDoc(favDoc);

  if (snap.exists()) {
    await deleteDoc(favDoc);
    // decrement favorites count on listing
    try {
      const listingDoc = doc(db, 'listings', listingId);
      const lSnap = await getDoc(listingDoc);
      if (lSnap.exists()) {
        const cur = lSnap.data().favoritesCount || 0;
        await updateDoc(listingDoc, { favoritesCount: Math.max(0, cur - 1) });
      }
    } catch {
      // non-blocking
    }
    return false;
  } else {
    await setDoc(favDoc, {
      listingId,
      addedAt: new Date().toISOString()
    });
    // increment favorites count on listing
    try {
      const listingDoc = doc(db, 'listings', listingId);
      const lSnap = await getDoc(listingDoc);
      if (lSnap.exists()) {
        const cur = lSnap.data().favoritesCount || 0;
        await updateDoc(listingDoc, { favoritesCount: cur + 1 });
      }
    } catch {
      // non-blocking
    }
    return true;
  }
}

// ============================================================================
// Reports (Admin & Moderation)
// ============================================================================

export function subscribeToReports(callback: (reports: ReportItem[]) => void): Unsubscribe {
  const repCol = collection(db, 'reports');
  const q = query(repCol, orderBy('createdAt', 'desc'), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: ReportItem[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...(d.data() as Omit<ReportItem, 'id'>) });
      });
      callback(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'reports');
    }
  );
}

export async function submitReport(report: Omit<ReportItem, 'id' | 'createdAt' | 'status'>): Promise<ReportItem> {
  if (!auth.currentUser) throw new Error('Authentication required');
  const repCol = collection(db, 'reports');
  const now = new Date().toISOString();
  const payload = {
    ...report,
    reporterId: auth.currentUser.uid,
    createdAt: now,
    status: 'pending' as const
  };

  try {
    const docRef = await addDoc(repCol, payload);
    return { id: docRef.id, ...payload };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'reports');
  }
}

export async function resolveReport(reportId: string, status: 'resolved' | 'dismissed'): Promise<void> {
  if (!auth.currentUser) throw new Error('Authentication required');
  const docRef = doc(db, 'reports', reportId);
  try {
    await updateDoc(docRef, { status });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `reports/${reportId}`);
  }
}
