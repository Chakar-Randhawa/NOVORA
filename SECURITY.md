# NOVORA — SECURITY & TRUST ARCHITECTURE

### 1. Data Isolation & Privacy (ABAC & Firestore Security Rules)
* **Default-Deny Catch-All:** Every path defaults to `allow read, write: if false;`.
* **Public vs. Private Separation:** 
  - `/listings/{listingId}` and `/requests/{requestId}` are publicly discoverable (`allow get, list: if true;`).
  - Creation requires verified authentication (`isSignedIn()`).
  - Modifications and deletions are strictly restricted to the actual creator (`existing().sellerId == request.auth.uid` or `existing().buyerId == request.auth.uid`).
* **Direct Messaging Isolation:**
  - Conversations in `/conversations/{conversationId}` and subcollection `/messages/{messageId}` can ONLY be read or written if `request.auth.uid in get(...).participantIds`. Uninvolved users receive an instant `PERMISSION_DENIED`.
* **Wishlist Privacy:**
  - Saved favorites are stored in `/users/{userId}/favorites/{listingId}` and can only be read or written by the document owner `isOwner(userId)`.

### 2. Critical Administrator Security Fix & Anti-Escalation
* **Removal of Public Admin Registration:** The registration modal contains NO checkbox, toggle, or parameter allowing a user to grant themselves administrator privileges.
* **Server-Side Role Immutability:** 
  - `firestore.rules` enforces: `(!('isAdmin' in incoming()) || incoming().isAdmin == false)` on user profile creation.
  - Updates require `incoming().isAdmin == existing().isAdmin`, preventing privilege escalation.
* **Administrative Governance:**
  - Only authorized platform administrators (verified by email `alphapro889@gmail.com` or document in `/admins/{adminId}`) can read or resolve moderation reports in `/reports/{reportId}`.
  - Standard users cannot read reports, delete other users' listings, or elevate permissions.

### 3. Client Image Sanitization & Size Limits
* User-uploaded photos are routed through an HTML5 `<canvas>` rendering pipeline.
* Strips all EXIF metadata (GPS coordinates, device serial numbers) to protect seller privacy.
* Re-encodes the image as a compressed standard JPEG blob (<120KB), preventing oversized payloads and keeping the data well under Firestore's 1MB document limit.

### 4. Direct Transaction Model Transparency
* NOVORA does not collect credit cards, debit cards, or bank routing numbers.
* The platform prominently displays disclaimers that it acts as a discovery and connection platform.
* Users are warned against wire transfer scams and instructed to coordinate safe, verified handoffs or escrow methods.
