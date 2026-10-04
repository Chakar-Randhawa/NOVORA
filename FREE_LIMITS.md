# NOVORA — FREE TIER LIMITS & GUARDRAILS

To protect the zero-cost architecture and ensure reliable performance without a credit card, the following operational guardrails are enforced:

### 1. Storage & Media Limits
* **Maximum Images Per Listing:** 5 images
* **Image Compression Target:** 1200px max dimension, 82% JPEG quality (~120KB - 250KB per photo)
* **Image Formats Supported:** JPEG, PNG, WebP
* **Storage Medium:** Browser LocalStorage / IndexedDB cache with optional JSON backup

### 2. Marketplace Listing Quotas
* **Listings Per Account:** Up to 50 active listings per seller (sufficient for artisan shops & independent curators)
* **Requests Per Account:** Up to 20 open requests in Request Orbit per buyer
* **Custom Fields Per Category:** 4 to 6 specialized fields per category definition

### 3. Messaging & Anti-Spam Rate Limits
* **Message Sending Throttling:** Minimum 1.5 seconds delay between sequential messages
* **Character Limit Per Message:** 2,000 characters
* **Conversation Limit:** Up to 100 active message threads per profile

### 4. Search & Discovery Execution
* **Search Query Execution:** Synchronous client-side matching engine (~5ms response time)
* **Maximum Scored Results:** Top 50 ranked matches displayed with transparent score breakdown
* **External Paid Network Calls:** 0 calls initiated
