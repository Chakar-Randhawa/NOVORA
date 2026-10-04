/**
 * NOVORA V4 — Security, Integrity, and Rules Audit Script
 * Validates Firestore rules logic, schema boundaries, and backend constraints
 */
import { readFileSync } from 'fs';
import firebaseConfig from './firebase-applet-config.json';
import blueprint from './firebase-blueprint.json';

console.log('=== NOVORA V4 AUDIT SUITE ===\n');

let passCount = 0;
let failCount = 0;

function assert(description: string, condition: boolean, details?: string) {
  if (condition) {
    console.log(`[PASS] ${description}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${description} ${details ? `(${details})` : ''}`);
    failCount++;
  }
}

// 1. Firebase Config Verification
console.log('--- 1. Cloud Project & Firebase Configuration ---');
assert('Firebase Project ID is configured', Boolean(firebaseConfig.projectId && firebaseConfig.projectId.length > 0), firebaseConfig.projectId);
assert('Firestore Database ID matches provisioned instance', firebaseConfig.firestoreDatabaseId === 'ai-studio-novorazerocostgl-063006ef-d993-4fb7-bbcc-c2ef48d8defd', firebaseConfig.firestoreDatabaseId);
assert('Auth Domain is configured', Boolean(firebaseConfig.authDomain && firebaseConfig.authDomain.includes('firebaseapp.com')), firebaseConfig.authDomain);
assert('OAuth Client ID is configured for Google Sign-in', Boolean(firebaseConfig.oAuthClientId && firebaseConfig.oAuthClientId.includes('apps.googleusercontent.com')), firebaseConfig.oAuthClientId);

// 2. Blueprint & Schema Adherence
console.log('\n--- 2. Blueprint Schema Integrity ---');
const entities = blueprint.entities as Record<string, any>;
assert('User entity defined in blueprint', Boolean(entities.User));
assert('Listing entity defined in blueprint', Boolean(entities.Listing));
assert('BuyerRequest entity defined in blueprint', Boolean(entities.BuyerRequest));
assert('RequestOffer entity defined in blueprint', Boolean(entities.RequestOffer));
assert('RequestOffer contains buyerId for secure ABAC', Boolean(entities.RequestOffer.properties.buyerId));
assert('Conversation entity defined in blueprint', Boolean(entities.Conversation));
assert('Message entity defined in blueprint', Boolean(entities.Message));
assert('Report entity defined in blueprint', Boolean(entities.Report));

// 3. Firestore Security Rules Audit
console.log('\n--- 3. Firestore Security Rules ABAC Verification ---');
const rulesContent = readFileSync('./firestore.rules', 'utf8');

// A: Default Deny Safety Net
assert('Default deny catch-all rule exists at root', rulesContent.includes('match /{document=**}') && rulesContent.includes('allow read, write: if false;'));

// B: Admin privilege escalation prevention & User PII Isolation
assert('Rules verify email_verified == true for admin email', rulesContent.includes('request.auth.token.email_verified == true'));
assert('Admins collection strictly restricted to isAdmin()', rulesContent.includes('match /admins/{adminId}') && rulesContent.includes('allow read, write: if isAdmin();'));
assert('Regular users forbidden from setting isAdmin: true', rulesContent.includes("(!('isAdmin' in incoming()) || incoming().isAdmin == false || isAdmin())"));
assert('User profiles get/list restricted to isOwner or isAdmin (PII Isolation)', rulesContent.includes('allow get: if isOwner(userId) || isAdmin();') && rulesContent.includes('allow list: if isAdmin();'));

// C: Favorites document-level ownership
assert('Favorites subcollection strictly restricted to isOwner(userId)', rulesContent.includes('match /favorites/{listingId}') && rulesContent.includes('allow read, delete: if isOwner(userId);'));

// D: Offer confidentiality & integrity
assert('Offer reads strictly restricted to seller, buyer, or admin', 
  rulesContent.includes('resource.data.sellerId == request.auth.uid ||') &&
  rulesContent.includes('resource.data.buyerId == request.auth.uid ||') &&
  rulesContent.includes('isAdmin()')
);
assert('Offer creation validates buyerId against parent request', rulesContent.includes('incoming().buyerId == get(/databases/$(database)/documents/requests/$(incoming().requestId)).data.buyerId'));

// E: Conversation & Message Isolation
assert('Conversations strictly isolated to participants', rulesContent.includes('request.auth.uid in resource.data.participantIds'));
assert('Conversations participant list cannot be tampered with on update', rulesContent.includes('incoming().participantIds == existing().participantIds'));
assert('Messages subcollection validates parent conversation participants', rulesContent.includes('request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participantIds'));
assert('Messages are immutable (no update)', rulesContent.includes('allow update: if false;'));

// F: Moderation reports
assert('Reports read/update/delete restricted to administrators', rulesContent.includes('match /reports/{reportId}') && rulesContent.includes('allow read, update, delete: if isAdmin();'));

// 4. Zero-Cost Architecture Verification
console.log('\n--- 4. Zero-Cost Policy Verification ---');
const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
assert('No AWS S3 SDK installed', !allDeps['@aws-sdk/client-s3'] && !allDeps['aws-sdk']);
assert('No Cloudinary SDK installed', !allDeps['cloudinary']);
assert('No Stripe / Paid billing SDK installed', !allDeps['stripe']);
assert('No Twilio SDK installed', !allDeps['twilio']);
assert('No paid AI gateway installed', !allDeps['openai'] && !allDeps['@anthropic-ai/sdk']);

console.log('\n=== AUDIT SUMMARY ===');
console.log(`Passed: ${passCount} | Failed: ${failCount}`);

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('ALL SECURITY AND SCHEMA ASSERTIONS PASSED VERIFICATION.');
}
